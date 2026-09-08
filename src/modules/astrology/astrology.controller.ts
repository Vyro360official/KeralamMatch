"use server";

/**
 * KERALAMMATCH — ASTROLOGY CONTROLLER
 * Server Actions for authenticated Horoscope Matching requests.
 */

import { getSessionAction } from "@/modules/auth/auth.controller";
import { astrologyService, AstrologyValidationError } from "./astrology.service";
import { AstrologyServiceUnavailableError } from "./astrology.adapter";
import { HoroscopeMatchResultDTO } from "./astrology.dto";

export interface HoroscopeMatchActionResponse {
  success: boolean;
  result?: HoroscopeMatchResultDTO;
  error?: string;
  message?: string;
  details?: {
    currentUserMissingDob?: boolean;
    targetUserMissingDob?: boolean;
    missingFields?: string[];
  };
}

/**
 * Server action to calculate horoscope match between current session user and target profile.
 */
export async function calculateHoroscopeMatchAction(
  targetProfileId: string,
  includeReportHtml = true
): Promise<HoroscopeMatchActionResponse> {
  try {
    const session = await getSessionAction();

    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "UNAUTHORIZED",
        message: "Authentication required to calculate horoscope compatibility.",
      };
    }

    if (!targetProfileId || typeof targetProfileId !== "string") {
      return {
        success: false,
        error: "INVALID_TARGET",
        message: "Target profile ID is required.",
      };
    }

    const currentUserId = session.user.id;

    const result = await astrologyService.calculateMatch(
      currentUserId,
      targetProfileId,
      includeReportHtml
    );

    return {
      success: true,
      result,
    };
  } catch (err: any) {
    if (err instanceof AstrologyValidationError) {
      return {
        success: false,
        error: "INCOMPLETE_BIRTH_DETAILS",
        message: err.message,
        details: err.details,
      };
    }

    if (err instanceof AstrologyServiceUnavailableError) {
      return {
        success: false,
        error: "SERVICE_UNAVAILABLE",
        message: "Horoscope calculation engine is temporarily unavailable. Please try again shortly.",
      };
    }

    if (err.message === "CANNOT_MATCH_SELF") {
      return {
        success: false,
        error: "CANNOT_MATCH_SELF",
        message: "You cannot calculate horoscope compatibility with your own profile.",
      };
    }

    if (err.message === "TARGET_PROFILE_NOT_FOUND") {
      return {
        success: false,
        error: "NOT_FOUND",
        message: "Requested target candidate profile was not found.",
      };
    }

    console.error("[AstrologyController] Calculation failure:", err.message);
    return {
      success: false,
      error: "INTERNAL_ERROR",
      message: "Unable to calculate horoscope compatibility right now. Please try again.",
    };
  }
}

/**
 * Server action to retrieve or calculate a single candidate's horoscope (3-page report + uploaded document).
 */
export async function getSingleHoroscopeAction(targetProfileId: string) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "UNAUTHORIZED",
        message: "Authentication required to view candidate horoscopes.",
      };
    }

    if (!targetProfileId) {
      return {
        success: false,
        error: "INVALID_TARGET",
        message: "Target profile identifier is required.",
      };
    }

    const data = await astrologyService.getSingleHoroscope(targetProfileId);
    return data;
  } catch (err: any) {
    console.error("[AstrologyController] Single horoscope fetch failed:", err.message);
    return {
      success: false,
      error: "FAILED_FETCH",
      message: err.message || "Failed to load candidate horoscope details.",
    };
  }
}

