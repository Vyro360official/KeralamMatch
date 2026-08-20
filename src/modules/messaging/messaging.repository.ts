import { prisma } from "@/lib/db";
import { Message } from "@prisma/client";

export interface IMessagingRepository {
  createMessage(senderId: string, receiverId: string, content: string): Promise<Message>;
  getConversation(userAId: string, userBId: string, limit?: number): Promise<Message[]>;
  markThreadAsRead(senderId: string, receiverId: string): Promise<void>;
  countUnreadMessages(userId: string): Promise<number>;
}

export class MessagingRepository implements IMessagingRepository {
  async createMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
    return prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });
  }

  async getConversation(userAId: string, userBId: string, limit = 50): Promise<Message[]> {
    return prisma.message.findMany({
      where: {
        OR: [
          { senderId: userAId, receiverId: userBId },
          { senderId: userBId, receiverId: userAId },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
      take: limit,
    });
  }

  async markThreadAsRead(senderId: string, receiverId: string): Promise<void> {
    await prisma.message.updateMany({
      where: {
        senderId,
        receiverId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async countUnreadMessages(userId: string): Promise<number> {
    return prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }
}
