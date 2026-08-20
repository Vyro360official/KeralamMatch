"use server";

import { getSessionAction } from "../auth/auth.controller";
import { AUTH_ERRORS } from "../auth/auth.constants";
import { ProfileRepository } from "../profile/profile.repository";
import { MediaRepository } from "./media.repository";
import { MediaService } from "./media.service";

const mediaRepo = new MediaRepository();
const profileRepo = new ProfileRepository();
const mediaService = new MediaService(mediaRepo);

/**
 * Server Action to upload and watermark a profile photo
 */
export async function uploadPhotoAction(base64Image: string) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: AUTH_ERRORS.UNAUTHORIZED };
    }

    const profile = await profileRepo.findByUserId(session.user.id);
    if (!profile) {
      return { success: false, error: "PROFILE_NOT_FOUND" };
    }

    const mediaResult = await mediaService.uploadProfilePhoto(profile.id, base64Image);

    return {
      success: true,
      media: mediaResult,
    };
  } catch (error: any) {
    console.error("Upload photo server action failed:", error);
    return {
      success: false,
      error: error.message || "FAILED_TO_UPLOAD_PHOTO",
    };
  }
}

/**
 * Server Action to upload a voice introduction recording
 */
export async function uploadVoiceIntroAction(base64Audio: string) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: AUTH_ERRORS.UNAUTHORIZED };
    }

    const profile = await profileRepo.findByUserId(session.user.id);
    if (!profile) {
      return { success: false, error: "PROFILE_NOT_FOUND" };
    }

    const audioResult = await mediaService.uploadVoiceIntroduction(profile.id, base64Audio);

    return {
      success: true,
      url: audioResult.url,
    };
  } catch (error: any) {
    console.error("Upload voice intro action failed:", error);
    return {
      success: false,
      error: error.message || "FAILED_TO_UPLOAD_VOICE",
    };
  }
}

/**
 * Server Action to delete a photo or audio asset from profile
 */
export async function deleteMediaAction(mediaId: string) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: AUTH_ERRORS.UNAUTHORIZED };
    }

    const profile = await profileRepo.findByUserId(session.user.id);
    if (!profile) {
      return { success: false, error: "PROFILE_NOT_FOUND" };
    }

    // Verify media owner before executing deletes
    const media = await mediaRepo.findMediaById(mediaId);
    if (!media) {
      return { success: false, error: "MEDIA_NOT_FOUND" };
    }
    if (media.profileId !== profile.id) {
      return { success: false, error: AUTH_ERRORS.FORBIDDEN };
    }

    await mediaService.removeMedia(mediaId);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Delete media action failed:", error);
    return {
      success: false,
      error: error.message || "FAILED_TO_DELETE_MEDIA",
    };
  }
}
