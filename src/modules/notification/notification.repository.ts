import { prisma } from "@/lib/db";
import { Notification, NotificationSetting, NotificationChannel, QueueStatus } from "@prisma/client";

export interface INotificationRepository {
  findNotificationsByUser(userId: string, limit?: number): Promise<Notification[]>;
  createNotification(userId: string, title: string, message: string, type: string, link?: string): Promise<Notification>;
  getNotificationSettings(userId: string): Promise<NotificationSetting | null>;
  enqueueEmail(recipient: string, subject: string, bodyHtml: string): Promise<void>;
  enqueuePushOrSms(userId: string, title: string, message: string, channel: NotificationChannel): Promise<void>;
  markRead(id: string): Promise<Notification>;
  markAllRead(userId: string): Promise<void>;
}

export class NotificationRepository implements INotificationRepository {
  async findNotificationsByUser(userId: string, limit = 50): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async createNotification(userId: string, title: string, message: string, type: string, link?: string): Promise<Notification> {
    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link: link || null,
      },
    });
  }

  async getNotificationSettings(userId: string): Promise<NotificationSetting | null> {
    return prisma.notificationSetting.findUnique({
      where: { userId },
    });
  }

  async enqueueEmail(recipient: string, subject: string, bodyHtml: string): Promise<void> {
    await prisma.emailQueue.create({
      data: {
        recipient,
        subject,
        bodyHtml,
        status: "PENDING",
      },
    });
  }

  async enqueuePushOrSms(userId: string, title: string, message: string, channel: NotificationChannel): Promise<void> {
    await prisma.notificationQueue.create({
      data: {
        userId,
        title,
        message,
        channel,
        status: "PENDING",
      },
    });
  }

  async markRead(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
