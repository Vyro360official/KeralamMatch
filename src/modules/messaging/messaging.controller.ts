"use server";

import { getSessionAction } from "../auth/auth.controller";
import { AUTH_ERRORS } from "../auth/auth.constants";
import { MessagingRepository } from "./messaging.repository";
import { MessagingService } from "./messaging.service";

const messagingRepo = new MessagingRepository();
const messagingService = new MessagingService(messagingRepo);

/**
 * Server Action to encrypt and send a secure direct message
 */
export async function sendMessageAction(receiverId: string, content: string) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: AUTH_ERRORS.UNAUTHORIZED };
    }

    if (!content || content.trim().length === 0) {
      return { success: false, error: "Message content cannot be empty." };
    }

    const message = await messagingService.sendMessage(session.user.id, receiverId, content);

    return {
      success: true,
      message,
    };
  } catch (error: any) {
    console.error("Send message server action failed:", error);
    return {
      success: false,
      error: error.message || "FAILED_TO_SEND_MESSAGE",
    };
  }
}

/**
 * Server Action to fetch decrypted conversation log between caller and target
 */
export async function getConversationAction(targetUserId: string, limit = 50) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: AUTH_ERRORS.UNAUTHORIZED };
    }

    const messages = await messagingService.getMessages(session.user.id, targetUserId, limit);

    return {
      success: true,
      messages,
    };
  } catch (error: any) {
    console.error("Get conversation action failed:", error);
    return {
      success: false,
      error: error.message || "FAILED_TO_GET_CONVERSATION",
    };
  }
}

/**
 * Server Action to mark all unread messages from a user as read
 */
export async function markThreadReadAction(targetUserId: string) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: AUTH_ERRORS.UNAUTHORIZED };
    }

    // Target is the sender of the messages we are reading
    await messagingService.markAsRead(targetUserId, session.user.id);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Mark thread read action failed:", error);
    return {
      success: false,
      error: error.message || "FAILED_TO_MARK_READ",
    };
  }
}
