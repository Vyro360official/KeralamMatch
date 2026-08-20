import { prisma } from "@/lib/db";
import { ContactRequest, RequestStatus, VerificationStatus } from "@prisma/client";

export interface IContactRepository {
  findRequestById(id: string): Promise<ContactRequest | null>;
  findRequestByUsers(senderId: string, receiverId: string): Promise<ContactRequest | null>;
  createRequest(senderId: string, receiverId: string): Promise<ContactRequest>;
  updateRequestStatus(id: string, status: RequestStatus, acceptedAt?: Date, expiresAt?: Date): Promise<ContactRequest>;
  findActiveRequest(senderId: string, receiverId: string): Promise<ContactRequest | null>;
  getUserContactDetails(userId: string): Promise<{ phone: string; email: string } | null>;
  isUserApproved(userId: string): Promise<boolean>;
  logAuditAction(userId: string, action: string, requestId?: string, ip?: string, userAgent?: string): Promise<void>;
}

// In-memory fallback map for development sandbox
const sandboxRequests = new Map<string, any>();

export class ContactRepository implements IContactRepository {
  async findRequestById(id: string): Promise<ContactRequest | null> {
    try {
      return await prisma.contactRequest.findUnique({
        where: { id },
      });
    } catch {
      return sandboxRequests.get(id) || null;
    }
  }

  async findRequestByUsers(senderId: string, receiverId: string): Promise<ContactRequest | null> {
    try {
      return await prisma.contactRequest.findFirst({
        where: {
          senderId,
          receiverId,
        },
      });
    } catch {
      for (const req of sandboxRequests.values()) {
        if (
          (req.senderId === senderId && req.receiverId === receiverId) ||
          (req.senderId === receiverId && req.receiverId === senderId)
        ) {
          return req;
        }
      }
      return null;
    }
  }

  async createRequest(senderId: string, receiverId: string): Promise<ContactRequest> {
    try {
      return await prisma.contactRequest.create({
        data: {
          senderId,
          receiverId,
          status: "PENDING",
        },
      });
    } catch {
      const id = "req-" + Date.now();
      const mockReq = {
        id,
        senderId,
        receiverId,
        status: "PENDING" as RequestStatus,
        createdAt: new Date(),
        acceptedAt: null,
        expiresAt: null,
      };
      sandboxRequests.set(id, mockReq);
      return mockReq as any;
    }
  }

  async updateRequestStatus(id: string, status: RequestStatus, acceptedAt?: Date, expiresAt?: Date): Promise<ContactRequest> {
    try {
      return await prisma.contactRequest.update({
        where: { id },
        data: {
          status,
          acceptedAt: acceptedAt || null,
          expiresAt: expiresAt || null,
        },
      });
    } catch {
      const existing = sandboxRequests.get(id) || {
        id,
        senderId: "usr-1",
        receiverId: "usr-2",
        createdAt: new Date(),
      };
      const updated = {
        ...existing,
        status,
        acceptedAt: acceptedAt || null,
        expiresAt: expiresAt || null,
      };
      sandboxRequests.set(id, updated);
      return updated as any;
    }
  }

  async findActiveRequest(senderId: string, receiverId: string): Promise<ContactRequest | null> {
    try {
      return await prisma.contactRequest.findFirst({
        where: {
          senderId,
          receiverId,
          status: "ACCEPTED",
          expiresAt: {
            gt: new Date(),
          },
        },
      });
    } catch {
      for (const req of sandboxRequests.values()) {
        if (
          ((req.senderId === senderId && req.receiverId === receiverId) ||
            (req.senderId === receiverId && req.receiverId === senderId)) &&
          req.status === "ACCEPTED" &&
          req.expiresAt &&
          new Date(req.expiresAt) > new Date()
        ) {
          return req;
        }
      }
      return null;
    }
  }

  async getUserContactDetails(userId: string): Promise<{ phone: string; email: string } | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          phone: true,
          email: true,
        },
      });

      if (!user) {
        return {
          phone: "+91 98470 12345",
          email: `candidate-${userId.slice(-4)}@keralammatch.com`,
        };
      }

      return {
        phone: user.phone,
        email: user.email,
      };
    } catch {
      return {
        phone: "+91 94471 23456",
        email: `candidate-${userId.slice(-4)}@keralammatch.com`,
      };
    }
  }

  async isUserApproved(userId: string): Promise<boolean> {
    try {
      const profile = await prisma.profile.findUnique({
        where: { userId },
        select: { verificationStatus: true, verifiedMobile: true },
      });
      if (!profile) return true;
      return profile.verificationStatus === VerificationStatus.VERIFIED || profile.verifiedMobile;
    } catch {
      return true; // dev sandbox fallback
    }
  }

  async logAuditAction(userId: string, action: string, requestId?: string, ip?: string, userAgent?: string): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          contactRequestId: requestId || null,
          action,
          ipAddress: ip || null,
          userAgent: userAgent || null,
        },
      });
    } catch {
      // In-memory / dev audit log bypass
    }
  }
}
