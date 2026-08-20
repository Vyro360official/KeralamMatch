import { IContactRepository } from "./contact.repository";
import { UnlockedContactResult } from "./contact.types";
import { decrypt } from "@/lib/crypto";

export class ContactService {
  constructor(private contactRepo: IContactRepository) {}

  /**
   * Dispatches a new contact unlock request.
   * Gated: Only profiles approved by Admin can send contact unlock requests.
   */
  async sendRequest(senderId: string, receiverId: string): Promise<any> {
    if (senderId === receiverId) {
      throw new Error("CANNOT_REQUEST_SELF");
    }

    // Gated Check: Verify caller profile is approved by Admin
    const isApproved = await this.contactRepo.isUserApproved(senderId);
    if (!isApproved) {
      throw new Error("PROFILE_VERIFICATION_REQUIRED: Your profile is under manual admin verification. Contact reveals will be unlocked once approved by our verification team.");
    }

    // Check for existing requests
    const existing = await this.contactRepo.findRequestByUsers(senderId, receiverId);
    if (existing) {
      if (existing.status === "PENDING") {
        throw new Error("REQUEST_ALREADY_PENDING");
      }
      if (existing.status === "ACCEPTED" && existing.expiresAt && existing.expiresAt > new Date()) {
        throw new Error("REQUEST_ALREADY_ACTIVE");
      }
    }

    return this.contactRepo.createRequest(senderId, receiverId);
  }

  /**
   * Responds to an incoming contact request.
   * If status is ACCEPTED, calculates and persists the 24-hour expiration threshold.
   */
  async respondToRequest(requestId: string, status: "ACCEPTED" | "DECLINED", userId: string): Promise<any> {
    const request = await this.contactRepo.findRequestById(requestId);
    if (!request) {
      throw new Error("REQUEST_NOT_FOUND");
    }

    // Ensure only the receiver of the request can respond
    if (request.receiverId !== userId) {
      throw new Error("UNAUTHORIZED_ACTION");
    }

    if (request.status !== "PENDING") {
      throw new Error("REQUEST_ALREADY_PROCESSED");
    }

    if (status === "ACCEPTED") {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Exactly 24 Hours

      const updated = await this.contactRepo.updateRequestStatus(requestId, "ACCEPTED", now, expiresAt);
      
      // Log audit events
      await this.contactRepo.logAuditAction(userId, "CONTACT_ACCEPTED", requestId);
      
      return updated;
    } else {
      const updated = await this.contactRepo.updateRequestStatus(requestId, "DECLINED");
      await this.contactRepo.logAuditAction(userId, "CONTACT_DECLINED", requestId);
      return updated;
    }
  }

  /**
   * Unlocks and returns decrypted contact details ONLY within the 24-hour mutual consent window.
   */
  async getContactDetails(callerId: string, targetUserId: string, ip?: string, userAgent?: string): Promise<UnlockedContactResult> {
    // 1. Verify active accepted contact request
    const activeRequest = await this.contactRepo.findActiveRequest(callerId, targetUserId);
    if (!activeRequest || !activeRequest.expiresAt || activeRequest.expiresAt <= new Date()) {
      throw new Error("ACCESS_LOCKED_OR_EXPIRED");
    }

    // 2. Fetch raw contact details
    const targetDetails = await this.contactRepo.getUserContactDetails(targetUserId);
    if (!targetDetails) {
      throw new Error("CONTACT_DETAILS_NOT_FOUND");
    }

    // 3. Decrypt phone and email fields if they are encrypted ciphertext
    let decryptedPhone = targetDetails.phone;
    let decryptedEmail = targetDetails.email;

    try {
      if (targetDetails.phone.includes(":")) {
        decryptedPhone = decrypt(targetDetails.phone);
      }
      if (targetDetails.email.includes(":")) {
        decryptedEmail = decrypt(targetDetails.email);
      }
    } catch (err) {
      console.error("Failed to decrypt revealed contact credentials:", err);
    }

    // 4. Log immutable access audit record
    await this.contactRepo.logAuditAction(
      callerId,
      `CONTACT_REVEAL_ACCESSED:target=${targetUserId}`,
      activeRequest.id,
      ip,
      userAgent
    );

    const timeLeftSeconds = Math.max(0, Math.round((activeRequest.expiresAt.getTime() - Date.now()) / 1000));

    return {
      phone: decryptedPhone,
      email: decryptedEmail,
      expiresAt: activeRequest.expiresAt,
      timeLeftSeconds,
    };
  }
}
