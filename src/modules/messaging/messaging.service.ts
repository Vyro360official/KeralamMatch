import { IMessagingRepository } from "./messaging.repository";
import { ChatMessage } from "./messaging.types";
import { encrypt, decrypt } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { validateChatMessageSafety } from "./chat-safety";

export class MessagingService {
  constructor(private messagingRepo: IMessagingRepository) {}

  /**
   * Encrypts and sends a direct message.
   * Checks safety filters and blocking status before dispatching.
   */
  async sendMessage(senderId: string, receiverId: string, content: string): Promise<ChatMessage> {
    // 1. Enforce Chat Safety Validation (Phone Number & Explicit Content Blocking)
    const safety = validateChatMessageSafety(content);
    if (!safety.isValid) {
      if (safety.violationType === "PHONE_NUMBER") {
        throw new Error(safety.errorMessage || "PHONE_NUMBER_PROHIBITED");
      }
      if (safety.violationType === "EXPLICIT_CONTENT") {
        // Log security audit record
        try {
          await prisma.auditLog.create({
            data: {
              userId: senderId,
              action: "FLAGGED_EXPLICIT_CHAT_MESSAGE",
              ipAddress: "CHAT_FILTER_ENGINE",
            },
          });
        } catch {
          // Dev fallback
        }
        throw new Error(safety.errorMessage || "EXPLICIT_CONTENT_BLOCKED");
      }
    }

    // 2. Check for block constraints
    try {
      const isBlocked = await prisma.blockedUser.findFirst({
        where: {
          OR: [
            { blockerId: senderId, blockedId: receiverId },
            { blockerId: receiverId, blockedId: senderId },
          ],
        },
      });

      if (isBlocked) {
        throw new Error("BLOCKED_COMMUNICATION");
      }
    } catch (err: any) {
      if (err.message === "BLOCKED_COMMUNICATION") throw err;
      if (process.env.NODE_ENV === "production") {
        throw new Error("BLOCK_CHECK_FAILED");
      }
    }

    // 3. Encrypt text content
    const encryptedContent = encrypt(content);

    // 4. Persist message record
    const message = await this.messagingRepo.createMessage(senderId, receiverId, encryptedContent);

    return {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content, // Return decrypted content to the caller
      createdAt: message.createdAt,
      isRead: message.isRead,
      readAt: message.readAt,
    };
  }

  /**
   * Retrieves conversation history and decrypts message bodies.
   */
  async getMessages(userAId: string, userBId: string, limit = 50): Promise<ChatMessage[]> {
    const rawMessages = await this.messagingRepo.getConversation(userAId, userBId, limit);

    // Decrypt content field in message records
    return rawMessages.map((msg) => {
      let decryptedText = "[Message Decryption Error]";
      try {
        decryptedText = decrypt(msg.content);
      } catch (err) {
        console.error(`Failed to decrypt message ID ${msg.id}:`, err);
      }

      return {
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: decryptedText,
        createdAt: msg.createdAt,
        isRead: msg.isRead,
        readAt: msg.readAt,
      };
    });
  }

  async markAsRead(senderId: string, receiverId: string): Promise<void> {
    await this.messagingRepo.markThreadAsRead(senderId, receiverId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messagingRepo.countUnreadMessages(userId);
  }
}
