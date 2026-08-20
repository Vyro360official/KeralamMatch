"use server";

import { getSessionAction } from "../auth/auth.controller";
import { AUTH_ERRORS } from "../auth/auth.constants";
import { NotificationRepository } from "./notification.repository";
import { NotificationService } from "./notification.service";

const notificationRepo = new NotificationRepository();
const notificationService = new NotificationService(notificationRepo);

/**
 * Server Action to fetch recent in-app notifications for the logged-in user
 */
export async function getNotificationsAction(limit = 30) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: AUTH_ERRORS.UNAUTHORIZED };
    }

    try {
      const notifications = await notificationRepo.findNotificationsByUser(session.user.id, limit);
      return {
        success: true,
        notifications,
      };
    } catch {
      return {
        success: true,
        notifications: [],
      };
    }
  } catch (error: any) {
    console.error("Get notifications action failed:", error);
    return {
      success: true,
      notifications: [],
    };
  }
}

/**
 * Server Action to mark a single notification as read
 */
export async function markNotificationReadAction(notificationId: string) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: AUTH_ERRORS.UNAUTHORIZED };
    }

    // Verify ownership of the notification
    const notifications = await notificationRepo.findNotificationsByUser(session.user.id);
    const exists = notifications.some((n) => n.id === notificationId);
    if (!exists) {
      return { success: false, error: AUTH_ERRORS.FORBIDDEN };
    }

    await notificationRepo.markRead(notificationId);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Mark notification read action failed:", error);
    return {
      success: false,
      error: error.message || "FAILED_TO_MARK_READ",
    };
  }
}

/**
 * Server Action to mark all user notifications as read
 */
export async function markAllNotificationsReadAction() {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: AUTH_ERRORS.UNAUTHORIZED };
    }

    await notificationRepo.markAllRead(session.user.id);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Mark all read action failed:", error);
    return {
      success: false,
      error: error.message || "FAILED_TO_MARK_ALL_READ",
    };
  }
}

/**
 * Server Action/Webhook trigger to process the pending transactional emails queue.
 * Can be run via Cron jobs or triggered dynamically.
 */
export async function triggerQueueWorkerAction() {
  try {
    // Only allow verified sessions, local call, or admin role calls to trigger
    const session = await getSessionAction();
    const isAdmin = session.isAuthenticated && session.user?.role === "ADMIN";

    if (!isAdmin && process.env.NODE_ENV === "production") {
      return { success: false, error: AUTH_ERRORS.FORBIDDEN };
    }

    const result = await notificationService.processEmailQueue();

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Queue worker trigger action failed:", error);
    return {
      success: false,
      error: error.message || "FAILED_TO_RUN_QUEUE_WORKER",
    };
  }
}
