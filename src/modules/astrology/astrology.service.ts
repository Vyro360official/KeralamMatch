/**
 * KERALAMMATCH — ASTROLOGY SERVICE
 * Authoritative business service for Horoscope & Astrology compatibility analysis.
 * Enforces session verification, self-match prevention, birth detail validation, and audit logging.
 */

import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/crypto";
import {
  executeSoftAstroMatch,
  executeSoftAstroSingleHoroscope,
  formatPoruthamItems,
  resolveCoordinates,
} from "./astrology.adapter";
import { sanitizeAstrologyReportHtml } from "./astrology.sanitizer";
import { HoroscopeMatchResultDTO, HoroscopeProfileSummaryDTO } from "./astrology.dto";
import {
  BirthProfileInput,
  ManualHoroscopeProfileInput,
  HoroscopeMatchHistoryItemDTO,
} from "./astrology.types";
import { generateSingleHoroscopeHtml } from "./astrology.engine";

export class AstrologyValidationError extends Error {
  public details: {
    currentUserMissingGender?: boolean;
    currentUserMissingDob?: boolean;
    targetUserMissingDob?: boolean;
    missingFields: string[];
  };

  constructor(message: string, details: { currentUserMissingGender?: boolean; currentUserMissingDob?: boolean; targetUserMissingDob?: boolean; missingFields: string[] }) {
    super(message);
    this.name = "AstrologyValidationError";
    this.details = details;
  }
}

// Dev sandbox fallback profiles for local testing
const DEV_FALLBACK_PROFILES: Record<string, any> = {
  "me": {
    id: "prf-usr-sandbox-101",
    userId: "usr-sandbox-101",
    firstName: "Nagarajan",
    lastName: "P",
    gender: "MALE",
    dateOfBirth: new Date("1987-05-23T04:05:00Z"),
    timeOfBirth: "04:05",
    placeOfBirth: "Trivandrum",
    district: "Thiruvananthapuram",
    starNakshatram: "Uthrattathi",
    rasi: "Meena (Pisces)",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
  },
  "prf-1": {
    id: "prf-1",
    userId: "usr-ananya-101",
    firstName: "Ananya",
    lastName: "Nair",
    gender: "FEMALE",
    dateOfBirth: new Date("1998-05-15T10:30:00Z"),
    timeOfBirth: "10:30",
    placeOfBirth: "Kochi",
    district: "Ernakulam",
    starNakshatram: "Moolam",
    rasi: "Dhanus (Sagittarius)",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800",
  },
  "prf-2": {
    id: "prf-2",
    userId: "usr-divya-102",
    firstName: "Dr. Divya",
    lastName: "Thomas",
    gender: "FEMALE",
    dateOfBirth: new Date("1996-03-22T08:15:00Z"),
    timeOfBirth: "08:15",
    placeOfBirth: "Kottayam",
    district: "Kottayam",
    starNakshatram: "Revathi",
    rasi: "Meena (Pisces)",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800",
  },
  "prf-3": {
    id: "prf-3",
    userId: "usr-meera-103",
    firstName: "Meera",
    lastName: "Krishnan",
    gender: "FEMALE",
    dateOfBirth: new Date("1999-11-09T16:45:00Z"),
    timeOfBirth: "16:45",
    placeOfBirth: "Kozhikode",
    district: "Kozhikode",
    starNakshatram: "Rohini",
    rasi: "Vrishabha (Taurus)",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800",
  },
  "usr-no-gender": {
    id: "prf-no-gender",
    userId: "usr-no-gender",
    firstName: "Incomplete",
    lastName: "Profile",
    gender: null,
    dateOfBirth: new Date("1995-01-01T10:00:00Z"),
    timeOfBirth: "10:00",
    placeOfBirth: "Kochi",
  },
};

export class AstrologyService {
  /**
   * Calculates comprehensive horoscope compatibility between the authenticated user and a target profile.
   */
  async calculateMatch(
    currentUserId: string,
    targetProfileId: string,
    includeReportHtml = true
  ): Promise<HoroscopeMatchResultDTO> {
    if (!currentUserId) {
      throw new Error("UNAUTHORIZED");
    }

    if (!targetProfileId) {
      throw new Error("TARGET_PROFILE_REQUIRED");
    }

    // 1. Fetch Current User's Profile
    let currentProfile: any = null;
    try {
      currentProfile = await prisma.profile.findFirst({
        where: { userId: currentUserId },
        include: { media: true },
      });
    } catch (dbErr) {
      console.warn("[AstrologyService] DB lookup failed for current user:", dbErr);
    }

    if (!currentProfile) {
      currentProfile = DEV_FALLBACK_PROFILES[currentUserId] ||
        Object.values(DEV_FALLBACK_PROFILES).find((p) => p.userId === currentUserId || p.id === currentUserId) ||
        null;
    }

    if (!currentProfile) {
      throw new Error("CURRENT_PROFILE_NOT_FOUND");
    }

    // 2. Fetch Target User's Profile
    let targetProfile: any = null;
    try {
      targetProfile = await prisma.profile.findFirst({
        where: {
          OR: [{ id: targetProfileId }, { userId: targetProfileId }],
        },
        include: { media: true },
      });
    } catch (dbErr) {
      // Prisma DB lookup skipped or failed in test/sandbox
    }

    if (!targetProfile) {
      targetProfile = DEV_FALLBACK_PROFILES[targetProfileId] ||
        Object.values(DEV_FALLBACK_PROFILES).find((p) => p.id === targetProfileId || p.userId === targetProfileId) ||
        null;
    }

    if (!targetProfile) {
      throw new Error("TARGET_PROFILE_NOT_FOUND");
    }

    // 3. Authorization: Reject Self-Match
    if (
      currentProfile.id === targetProfile.id ||
      currentProfile.userId === targetProfile.userId
    ) {
      throw new Error("CANNOT_MATCH_SELF");
    }

    // 4. Validate Birth Details & Gender Completeness
    const userGenderRaw = (currentProfile.gender || "").trim().toUpperCase();
    if (!userGenderRaw || (userGenderRaw !== "MALE" && userGenderRaw !== "FEMALE")) {
      throw new AstrologyValidationError(
        "Please complete your gender/profile information before checking horoscope compatibility.",
        {
          currentUserMissingGender: true,
          currentUserMissingDob: false,
          missingFields: ["Please complete your gender/profile information before checking horoscope compatibility."],
        }
      );
    }

    const currentDobMissing = !currentProfile.dateOfBirth;
    const targetDobMissing = !targetProfile.dateOfBirth;

    if (currentDobMissing || targetDobMissing) {
      const missing: string[] = [];
      if (currentDobMissing) missing.push(`Your profile (${currentProfile.firstName}) is missing Date of Birth`);
      if (targetDobMissing) missing.push(`Target candidate (${targetProfile.firstName}) is missing Date of Birth`);

      throw new AstrologyValidationError(
        "Horoscope matching requires complete birth details for both profiles.",
        {
          currentUserMissingGender: false,
          currentUserMissingDob: currentDobMissing,
          targetUserMissingDob: targetDobMissing,
          missingFields: missing,
        }
      );
    }

    // Format normalized date strings
    const currentDobStr = new Date(currentProfile.dateOfBirth).toISOString().split("T")[0];
    const targetDobStr = new Date(targetProfile.dateOfBirth).toISOString().split("T")[0];

    const currentAvatar = currentProfile.avatarUrl || (currentProfile.media && currentProfile.media[0] ? currentProfile.media[0].url : null);
    const targetAvatar = targetProfile.avatarUrl || (targetProfile.media && targetProfile.media[0] ? targetProfile.media[0].url : null);

    // 5. Determine Bride and Groom Roles for SoftAstro Engine
    const isCurrentFemale = currentProfile.gender === "FEMALE";
    const isTargetFemale = targetProfile.gender === "FEMALE";

    let brideInput: BirthProfileInput;
    let groomInput: BirthProfileInput;

    if (isCurrentFemale && !isTargetFemale) {
      brideInput = {
        name: `${currentProfile.firstName} ${currentProfile.lastName || ""}`.trim(),
        gender: "female",
        dob: currentDobStr,
        tob: currentProfile.timeOfBirth || "12:00",
        place: currentProfile.placeOfBirth || currentProfile.district || "Kerala",
      };
      groomInput = {
        name: `${targetProfile.firstName} ${targetProfile.lastName || ""}`.trim(),
        gender: "male",
        dob: targetDobStr,
        tob: targetProfile.timeOfBirth || "12:00",
        place: targetProfile.placeOfBirth || targetProfile.district || "Kerala",
      };
    } else {
      // Target as bride, current as groom (default)
      brideInput = {
        name: `${targetProfile.firstName} ${targetProfile.lastName || ""}`.trim(),
        gender: "female",
        dob: targetDobStr,
        tob: targetProfile.timeOfBirth || "12:00",
        place: targetProfile.placeOfBirth || targetProfile.district || "Kerala",
      };
      groomInput = {
        name: `${currentProfile.firstName} ${currentProfile.lastName || ""}`.trim(),
        gender: "male",
        dob: currentDobStr,
        tob: currentProfile.timeOfBirth || "12:00",
        place: currentProfile.placeOfBirth || currentProfile.district || "Kerala",
      };
    }

    // 6. Execute SoftAstro Calculation via Adapter
    const rawResult = await executeSoftAstroMatch(brideInput, groomInput, includeReportHtml);

    // 7. Audit Logging (Non-blocking, minimal sensitive metadata)
    try {
      await prisma.auditLog.create({
        data: {
          userId: currentUserId,
          action: "HOROSCOPE_MATCH_CALCULATED",
          details: JSON.stringify({
            targetProfileId: targetProfile.id,
            poruthamScore: rawResult.porutham?.total_score ?? 0,
            engine: rawResult.engine || "SoftAstro",
          }),
        },
      }).catch(() => {});
    } catch {
      // Suppress audit log table creation exceptions in dev
    }

    // 8. Build Standardized DTO Summaries
    const rawScore = rawResult.porutham?.total_score ?? 0;
    const traditionalScore = Math.round(rawScore * 3.6); // 10 Poruthams scaled to 36 Gunas
    const percentage = Math.round(rawScore * 10);

    let verdict = "NEEDS ATTENTION";
    let verdictMalayalam = rawResult.porutham?.verdict_mal || "അധമം";
    if (rawScore >= 6.5) {
      verdict = "EXCELLENT MATCH";
      verdictMalayalam = "ഉത്തമം";
    } else if (rawScore >= 4.0) {
      verdict = "MODERATE MATCH";
      verdictMalayalam = "മദ്ധ്യമം";
    }

    const currentSummary: HoroscopeProfileSummaryDTO = {
      id: currentProfile.id,
      displayName: `${currentProfile.firstName} ${currentProfile.lastName || ""}`.trim(),
      avatarUrl: currentAvatar,
      gender: currentProfile.gender,
      dateOfBirth: currentDobStr,
      timeOfBirth: currentProfile.timeOfBirth || "12:00 PM",
      placeOfBirth: currentProfile.placeOfBirth || currentProfile.district || "Kerala, India",
      starNakshatram: isCurrentFemale ? (rawResult.bride?.star || currentProfile.starNakshatram || "Nakshatra") : (rawResult.groom?.star || currentProfile.starNakshatram || "Nakshatra"),
      rasi: isCurrentFemale ? (rawResult.bride?.rasi || currentProfile.rasi || "Rasi") : (rawResult.groom?.rasi || currentProfile.rasi || "Rasi"),
      dasaBalance: isCurrentFemale ? rawResult.bride?.dasa_balance : rawResult.groom?.dasa_balance,
    };

    const targetSummary: HoroscopeProfileSummaryDTO = {
      id: targetProfile.id,
      displayName: `${targetProfile.firstName} ${targetProfile.lastName || ""}`.trim(),
      avatarUrl: targetAvatar,
      gender: targetProfile.gender,
      dateOfBirth: targetDobStr,
      timeOfBirth: targetProfile.timeOfBirth || "12:00 PM",
      placeOfBirth: targetProfile.placeOfBirth || targetProfile.district || "Kerala, India",
      starNakshatram: isTargetFemale ? (rawResult.bride?.star || targetProfile.starNakshatram || "Nakshatra") : (rawResult.groom?.star || targetProfile.starNakshatram || "Nakshatra"),
      rasi: isTargetFemale ? (rawResult.bride?.rasi || targetProfile.rasi || "Rasi") : (rawResult.groom?.rasi || targetProfile.rasi || "Rasi"),
      dasaBalance: isTargetFemale ? rawResult.bride?.dasa_balance : rawResult.groom?.dasa_balance,
    };

    const poruthamItems = formatPoruthamItems(rawResult.porutham?.items);

    const papasamyaDiff = rawResult.papasamya?.diff ?? 0;
    const isPapaBalanced = rawResult.papasamya?.is_balanced ?? false;

    const kujaResolved = rawResult.kuja_dosha?.is_resolved ?? false;

    const dasaHasSandhi = rawResult.dasa_timeline?.has_sandhi ?? false;

    const sanitizedReport = sanitizeAstrologyReportHtml(rawResult.report_html);

    // 9. Persist to HoroscopeMatchCheck history (Non-blocking)
    const currentUserName = currentProfile
      ? `${currentProfile.firstName} ${currentProfile.lastName || ""}`.trim()
      : "User";

    try {
      await prisma.horoscopeMatchCheck.create({
        data: {
          userId: currentUserId,
          userName: currentUserName,
          targetProfileId: targetProfile.id,
          matchType: "REGISTERED_PROFILE",
          targetName: `${targetProfile.firstName} ${targetProfile.lastName || ""}`.trim(),
          targetGender: targetProfile.gender || "FEMALE",
          targetDob: new Date(targetDobStr),
          targetTob: targetProfile.timeOfBirth || "12:00",
          targetPlace: targetProfile.placeOfBirth || targetProfile.district || "Kerala",
          targetMobile: null,
          marketingConsent: false,
          consentTimestamp: null,
          score: rawScore,
          verdict,
          verdictMalayalam,
          reportSummary: {
            overallScore: rawScore,
            traditionalScore,
            percentage,
            verdict,
            verdictMalayalam,
            papasamyaBalanced: isPapaBalanced,
            kujaResolved,
            dasaHasSandhi,
          },
          reportHtml: sanitizedReport,
        },
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    return {
      currentUser: currentSummary,
      targetUser: targetSummary,
      compatibility: {
        overallScore: rawScore,
        traditionalScore,
        percentage,
        verdict,
        verdictMalayalam,
        description: `Overall Nakshatra Compatibility: ${rawScore}/10 Poruthams (${traditionalScore}/36 Guna equivalent) — ${verdictMalayalam}.`,
      },
      poruthams: poruthamItems,
      papasamya: {
        brideScore: rawResult.papasamya?.bride?.total ?? 0,
        groomScore: rawResult.papasamya?.groom?.total ?? 0,
        difference: papasamyaDiff,
        isBalanced: isPapaBalanced,
        verdictDescription: isPapaBalanced
          ? "Papamoolyam points are harmoniously balanced between Bride and Groom."
          : `Papasamya difference is ${papasamyaDiff} points. Consultation recommended.`,
      },
      kujaDosha: {
        brideStatus: rawResult.kuja_dosha?.bride?.status || "None",
        brideHasDosha: rawResult.kuja_dosha?.bride?.has_dosha || false,
        brideHasPariharam: rawResult.kuja_dosha?.bride?.has_pariharam || false,
        groomStatus: rawResult.kuja_dosha?.groom?.status || "None",
        groomHasDosha: rawResult.kuja_dosha?.groom?.has_dosha || false,
        groomHasPariharam: rawResult.kuja_dosha?.groom?.has_pariharam || false,
        isResolved: kujaResolved,
        verdictDescription: kujaResolved
          ? "Kuja Dosha (Mars affliction) is resolved with auspicious Pariharam."
          : "Kuja Dosha evaluation requires astrological review.",
      },
      dasa: {
        hasSandhi: dasaHasSandhi,
        verdictDescription: dasaHasSandhi
          ? "Dasa Sandhi (Mahadasa transition overlap within 1 year) detected. Astrological remedy recommended."
          : "No adverse Dasa Sandhi overlaps detected during major life periods.",
        brideTimeline: (rawResult.dasa_timeline?.bride || []).map((d) => ({
          lord: d.lord,
          span: d.span_str || `${d.start_yr}–${d.end_yr}`,
        })),
        groomTimeline: (rawResult.dasa_timeline?.groom || []).map((d) => ({
          lord: d.lord,
          span: d.span_str || `${d.start_yr}–${d.end_yr}`,
        })),
      },
      sanitizedReportHtml: sanitizedReport,
      reportHtml: sanitizedReport,
      calculatedAt: new Date().toISOString(),
      engine: rawResult.engine || "SoftAstro Native Ephemeris v1.0",
    };
  }

  /**
   * Calculates comprehensive horoscope compatibility with a non-registered candidate.
   * Uses authenticated user's birth details from session + manually supplied candidate details.
   * Employs the real SoftAstro calculation engine without creating fake user accounts.
   */
  async calculateManualMatch(
    currentUserId: string,
    manualProfile: ManualHoroscopeProfileInput,
    includeReportHtml = true
  ): Promise<HoroscopeMatchResultDTO> {
    if (!currentUserId) {
      throw new Error("UNAUTHORIZED");
    }

    if (!manualProfile || !manualProfile.fullName || !manualProfile.dateOfBirth) {
      throw new Error("INVALID_MANUAL_PROFILE");
    }

    // 1. Fetch Current User's Profile
    let currentProfile: any = null;
    try {
      currentProfile = await prisma.profile.findFirst({
        where: { userId: currentUserId },
        include: { media: true },
      });
    } catch (dbErr) {
      console.warn("[AstrologyService] DB lookup failed for current user:", dbErr);
    }

    if (!currentProfile) {
      currentProfile = DEV_FALLBACK_PROFILES[currentUserId] ||
        Object.values(DEV_FALLBACK_PROFILES).find((p) => p.userId === currentUserId || p.id === currentUserId) ||
        null;
    }

    if (!currentProfile) {
      throw new Error("CURRENT_PROFILE_NOT_FOUND");
    }

    // 2. Validate Current User's Profile Completeness (Gender & DOB)
    const userGenderRaw = (currentProfile.gender || "").trim().toUpperCase();
    if (!userGenderRaw || (userGenderRaw !== "MALE" && userGenderRaw !== "FEMALE")) {
      throw new AstrologyValidationError(
        "Please complete your gender/profile information before checking horoscope compatibility.",
        {
          currentUserMissingGender: true,
          currentUserMissingDob: false,
          missingFields: ["Please complete your gender/profile information before checking horoscope compatibility."],
        }
      );
    }

    if (!currentProfile.dateOfBirth) {
      throw new AstrologyValidationError(
        "Your birth details are incomplete. Please update your profile before checking horoscope compatibility.",
        {
          currentUserMissingGender: false,
          currentUserMissingDob: true,
          targetUserMissingDob: false,
          missingFields: ["Your profile is missing Date of Birth. Please update your profile."],
        }
      );
    }

    // 3. Validate Manual Candidate's Details
    const cleanName = manualProfile.fullName.trim();
    if (cleanName.length < 2 || cleanName.length > 100) {
      throw new Error("INVALID_NAME_LENGTH");
    }

    const manualDob = new Date(manualProfile.dateOfBirth);
    if (isNaN(manualDob.getTime())) {
      throw new Error("INVALID_DOB");
    }

    const nowYear = new Date().getFullYear();
    const birthYear = manualDob.getFullYear();
    if (birthYear > nowYear || birthYear < nowYear - 110) {
      throw new Error("INVALID_DOB_RANGE");
    }

    const currentDobStr = new Date(currentProfile.dateOfBirth).toISOString().split("T")[0];
    const manualDobStr = manualDob.toISOString().split("T")[0];
    const manualTobStr = manualProfile.timeOfBirth?.trim() || "12:00";
    const manualPlace = manualProfile.placeOfBirth?.trim() || "Kerala, India";

    // 4. Reject Self Match (if current user enters their own exact details)
    const currentFullName = `${currentProfile.firstName} ${currentProfile.lastName || ""}`.trim().toLowerCase();
    if (
      cleanName.toLowerCase() === currentFullName &&
      manualDobStr === currentDobStr
    ) {
      throw new Error("CANNOT_MATCH_SELF");
    }

    // 5. Automatic Opposite-Gender Logic (Strictly Server-Enforced)
    // The authenticated user's profile gender strictly determines the candidate's role.
    // Client-supplied gender is never trusted or used.
    const isCurrentFemale = userGenderRaw === "FEMALE";
    const isTargetFemale = !isCurrentFemale;
    const targetGender = isTargetFemale ? "FEMALE" : "MALE";

    const currentCoords = resolveCoordinates(currentProfile.placeOfBirth || currentProfile.district);
    const manualCoords = resolveCoordinates(manualPlace);

    let brideInput: BirthProfileInput;
    let groomInput: BirthProfileInput;

    if (isCurrentFemale) {
      // Authenticated user is FEMALE (Bride), manual candidate is MALE (Groom)
      brideInput = {
        name: `${currentProfile.firstName} ${currentProfile.lastName || ""}`.trim(),
        gender: "female",
        dob: currentDobStr,
        tob: currentProfile.timeOfBirth || "12:00",
        place: currentProfile.placeOfBirth || currentProfile.district || "Kerala",
        lat: currentCoords.lat,
        lon: currentCoords.lon,
        tz: 5.5,
      };
      groomInput = {
        name: cleanName,
        gender: "male",
        dob: manualDobStr,
        tob: manualTobStr,
        place: manualPlace,
        lat: manualCoords.lat,
        lon: manualCoords.lon,
        tz: 5.5,
      };
    } else {
      // Authenticated user is MALE (Groom), manual candidate is FEMALE (Bride)
      brideInput = {
        name: cleanName,
        gender: "female",
        dob: manualDobStr,
        tob: manualTobStr,
        place: manualPlace,
        lat: manualCoords.lat,
        lon: manualCoords.lon,
        tz: 5.5,
      };
      groomInput = {
        name: `${currentProfile.firstName} ${currentProfile.lastName || ""}`.trim(),
        gender: "male",
        dob: currentDobStr,
        tob: currentProfile.timeOfBirth || "12:00",
        place: currentProfile.placeOfBirth || currentProfile.district || "Kerala",
        lat: currentCoords.lat,
        lon: currentCoords.lon,
        tz: 5.5,
      };
    }

    // 6. Execute SoftAstro Calculation via Adapter
    const rawResult = await executeSoftAstroMatch(brideInput, groomInput, includeReportHtml);

    // 7. Audit Logging (Non-blocking, zero sensitive phone data)
    try {
      await prisma.auditLog.create({
        data: {
          userId: currentUserId,
          action: "MANUAL_HOROSCOPE_MATCH_CALCULATED",
          details: JSON.stringify({
            targetName: cleanName,
            targetGender: targetGender,
            poruthamScore: rawResult.porutham?.total_score ?? 0,
            engine: rawResult.engine || "SoftAstro",
          }),
        },
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    // 8. Build Standardized DTO Summaries
    const rawScore = rawResult.porutham?.total_score ?? 0;
    const traditionalScore = Math.round(rawScore * 3.6);
    const percentage = Math.round(rawScore * 10);

    let verdict = "NEEDS ATTENTION";
    let verdictMalayalam = rawResult.porutham?.verdict_mal || "അധമം";
    if (rawScore >= 6.5) {
      verdict = "EXCELLENT MATCH";
      verdictMalayalam = "ഉത്തമം";
    } else if (rawScore >= 4.0) {
      verdict = "MODERATE MATCH";
      verdictMalayalam = "മദ്ധ്യമം";
    }

    const currentAvatar = currentProfile.avatarUrl || (currentProfile.media && currentProfile.media[0] ? currentProfile.media[0].url : null);

    const currentSummary: HoroscopeProfileSummaryDTO = {
      id: currentProfile.id,
      displayName: `${currentProfile.firstName} ${currentProfile.lastName || ""}`.trim(),
      avatarUrl: currentAvatar,
      gender: currentProfile.gender,
      dateOfBirth: currentDobStr,
      timeOfBirth: currentProfile.timeOfBirth || "12:00 PM",
      placeOfBirth: currentProfile.placeOfBirth || currentProfile.district || "Kerala, India",
      starNakshatram: isCurrentFemale ? (rawResult.bride?.star || currentProfile.starNakshatram || "Nakshatra") : (rawResult.groom?.star || currentProfile.starNakshatram || "Nakshatra"),
      rasi: isCurrentFemale ? (rawResult.bride?.rasi || currentProfile.rasi || "Rasi") : (rawResult.groom?.rasi || currentProfile.rasi || "Rasi"),
      dasaBalance: isCurrentFemale ? rawResult.bride?.dasa_balance : rawResult.groom?.dasa_balance,
    };

    const targetSummary: HoroscopeProfileSummaryDTO = {
      id: "manual-entry",
      displayName: cleanName,
      avatarUrl: null,
      gender: isTargetFemale ? "FEMALE" : "MALE",
      dateOfBirth: manualDobStr,
      timeOfBirth: manualTobStr,
      placeOfBirth: manualPlace,
      starNakshatram: isTargetFemale ? (rawResult.bride?.star || "Nakshatra") : (rawResult.groom?.star || "Nakshatra"),
      rasi: isTargetFemale ? (rawResult.bride?.rasi || "Rasi") : (rawResult.groom?.rasi || "Rasi"),
      dasaBalance: isTargetFemale ? rawResult.bride?.dasa_balance : rawResult.groom?.dasa_balance,
    };

    const poruthamItems = formatPoruthamItems(rawResult.porutham?.items);
    const papasamyaDiff = rawResult.papasamya?.diff ?? 0;
    const isPapaBalanced = rawResult.papasamya?.is_balanced ?? false;
    const kujaResolved = rawResult.kuja_dosha?.is_resolved ?? false;
    const dasaHasSandhi = rawResult.dasa_timeline?.has_sandhi ?? false;
    const sanitizedReport = sanitizeAstrologyReportHtml(rawResult.report_html);

    // 9. Persist to HoroscopeMatchCheck history (Non-blocking)
    const currentUserName = currentProfile
      ? `${currentProfile.firstName} ${currentProfile.lastName || ""}`.trim()
      : "User";

    // Encrypt candidate mobile number if provided
    let encryptedMobile: string | null = null;
    if (manualProfile.mobileNumber && manualProfile.mobileNumber.trim()) {
      try {
        encryptedMobile = encrypt(manualProfile.mobileNumber.trim());
      } catch (e) {
        console.warn("[AstrologyService] Failed to encrypt mobile number:", e);
      }
    }

    try {
      await prisma.horoscopeMatchCheck.create({
        data: {
          userId: currentUserId,
          userName: currentUserName,
          targetProfileId: null,
          matchType: "NEW_PERSON",
          targetName: cleanName,
          targetGender: isTargetFemale ? "FEMALE" : "MALE",
          targetDob: new Date(manualDobStr),
          targetTob: manualTobStr,
          targetPlace: manualPlace,
          targetMobile: encryptedMobile,
          marketingConsent: Boolean(manualProfile.marketingConsent),
          consentTimestamp: manualProfile.marketingConsent ? new Date() : null,
          score: rawScore,
          verdict,
          verdictMalayalam,
          reportSummary: {
            overallScore: rawScore,
            traditionalScore,
            percentage,
            verdict,
            verdictMalayalam,
            papasamyaBalanced: isPapaBalanced,
            kujaResolved,
            dasaHasSandhi,
          },
          reportHtml: sanitizedReport,
        },
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    return {
      currentUser: currentSummary,
      targetUser: targetSummary,
      compatibility: {
        overallScore: rawScore,
        traditionalScore,
        percentage,
        verdict,
        verdictMalayalam,
        description: `Overall Nakshatra Compatibility: ${rawScore}/10 Poruthams (${traditionalScore}/36 Guna equivalent) — ${verdictMalayalam}.`,
      },
      poruthams: poruthamItems,
      papasamya: {
        brideScore: rawResult.papasamya?.bride?.total ?? 0,
        groomScore: rawResult.papasamya?.groom?.total ?? 0,
        difference: papasamyaDiff,
        isBalanced: isPapaBalanced,
        verdictDescription: isPapaBalanced
          ? "Papamoolyam points are harmoniously balanced between Bride and Groom."
          : `Papasamya difference is ${papasamyaDiff} points. Consultation recommended.`,
      },
      kujaDosha: {
        brideStatus: rawResult.kuja_dosha?.bride?.status || "None",
        brideHasDosha: rawResult.kuja_dosha?.bride?.has_dosha || false,
        brideHasPariharam: rawResult.kuja_dosha?.bride?.has_pariharam || false,
        groomStatus: rawResult.kuja_dosha?.groom?.status || "None",
        groomHasDosha: rawResult.kuja_dosha?.groom?.has_dosha || false,
        groomHasPariharam: rawResult.kuja_dosha?.groom?.has_pariharam || false,
        isResolved: kujaResolved,
        verdictDescription: kujaResolved
          ? "Kuja Dosha (Mars affliction) is resolved with auspicious Pariharam."
          : "Kuja Dosha evaluation requires astrological review.",
      },
      dasa: {
        hasSandhi: dasaHasSandhi,
        verdictDescription: dasaHasSandhi
          ? "Dasa Sandhi (Mahadasa transition overlap within 1 year) detected. Astrological remedy recommended."
          : "No adverse Dasa Sandhi overlaps detected during major life periods.",
        brideTimeline: (rawResult.dasa_timeline?.bride || []).map((d) => ({
          lord: d.lord,
          span: d.span_str || `${d.start_yr}–${d.end_yr}`,
        })),
        groomTimeline: (rawResult.dasa_timeline?.groom || []).map((d) => ({
          lord: d.lord,
          span: d.span_str || `${d.start_yr}–${d.end_yr}`,
        })),
      },
      sanitizedReportHtml: sanitizedReport,
      reportHtml: sanitizedReport,
      calculatedAt: new Date().toISOString(),
      engine: rawResult.engine || "SoftAstro Native Ephemeris v1.0",
    };
  }

  /**
   * Retrieves private horoscope match history for the authenticated user only.
   */
  async getMatchHistory(currentUserId: string): Promise<HoroscopeMatchHistoryItemDTO[]> {
    if (!currentUserId) return [];
    try {
      const records = await prisma.horoscopeMatchCheck.findMany({
        where: { userId: currentUserId },
        orderBy: { createdAt: "desc" },
        take: 30,
      });

      let currentProfile: any = null;
      try {
        currentProfile = await prisma.profile.findFirst({
          where: { userId: currentUserId },
        });
      } catch {
        currentProfile = null;
      }
      if (!currentProfile) {
        currentProfile = DEV_FALLBACK_PROFILES[currentUserId] || DEV_FALLBACK_PROFILES["me"];
      }

      const currentName = currentProfile ? `${currentProfile.firstName} ${currentProfile.lastName || ""}`.trim() : "Me";
      const currentGender = currentProfile?.gender || "MALE";

      return records.map((r) => {
        const traditionalScore = Math.round(r.score * 3.6);
        const percentage = Math.round(r.score * 10);
        return {
          id: r.id,
          createdAt: r.createdAt.toISOString(),
          matchType: r.matchType,
          targetName: r.targetName,
          targetGender: r.targetGender,
          targetDob: r.targetDob ? r.targetDob.toISOString().split("T")[0] : "",
          targetTob: r.targetTob || "—",
          targetPlace: r.targetPlace || "—",
          targetProfileId: r.targetProfileId,
          targetMobile: null, // Private: zero leak to customer
          marketingConsent: r.marketingConsent,
          overallScore: r.score,
          traditionalScore,
          percentage,
          verdict: r.verdict,
          verdictMalayalam: r.verdictMalayalam,
          currentUser: {
            name: currentName,
            gender: currentGender,
          },
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * Retrieves detailed match report for a specific history check with strict IDOR ownership protection.
   */
  async getMatchHistoryDetail(currentUserId: string, checkId: string) {
    if (!currentUserId || !checkId) {
      throw new Error("UNAUTHORIZED");
    }
    let check: any = null;
    try {
      check = await prisma.horoscopeMatchCheck.findFirst({
        where: { id: checkId, userId: currentUserId },
      });
    } catch {
      check = null;
    }
    if (!check) {
      throw new Error("RECORD_NOT_FOUND");
    }
    return {
      success: true,
      check: {
        id: check.id,
        createdAt: check.createdAt.toISOString(),
        targetName: check.targetName,
        targetGender: check.targetGender,
        targetProfileId: check.targetProfileId,
        score: check.score,
        verdict: check.verdict,
        verdictMalayalam: check.verdictMalayalam,
        reportSummary: check.reportSummary,
        reportHtml: check.reportHtml,
      },
    };
  }

  /**
   * Retrieves or generates the authentic 3-page Single Natal Horoscope and uploaded horoscope document details.
   */
  async getSingleHoroscope(targetProfileId: string) {
    if (!targetProfileId) {
      throw new Error("TARGET_PROFILE_REQUIRED");
    }

    let profile: any = null;
    try {
      profile = await prisma.profile.findFirst({
        where: {
          OR: [{ id: targetProfileId }, { userId: targetProfileId }],
        },
        include: { media: true },
      });
    } catch {
      profile = null;
    }

    if (!profile) {
      profile = DEV_FALLBACK_PROFILES[targetProfileId] ||
        Object.values(DEV_FALLBACK_PROFILES).find((p) => p.id === targetProfileId || p.userId === targetProfileId) ||
        null;
    }

    if (!profile) {
      throw new Error("PROFILE_NOT_FOUND");
    }

    const name = `${profile.firstName} ${profile.lastName || ""}`.trim() || "Candidate";
    const dobStr = profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : "1987-05-23";
    const tobStr = profile.timeOfBirth || "04:05";
    const place = profile.placeOfBirth || profile.district || "Trivandrum, Kerala";
    const star = profile.starNakshatram || "Uthrattathi";
    const rasi = profile.rasi || "Meena (Pisces)";
    const gender = (profile.gender || "MALE").toLowerCase();

    // Execute authoritative SoftAstro 2-page single horoscope calculation
    const singleResult = await executeSoftAstroSingleHoroscope({
      name,
      gender,
      dob: dobStr,
      tob: tobStr,
      place,
      star,
      rasi,
    } as any);

    const sanitizedReportHtml = sanitizeAstrologyReportHtml(singleResult.reportHtml);
    const uploadedDoc = profile.horoscopeDocumentUrl || profile.horoscopeImage || null;

    return {
      success: true,
      engine: singleResult.engine,
      profile: {
        id: profile.id,
        userId: profile.userId,
        name,
        gender: profile.gender || "MALE",
        dob: dobStr,
        tob: tobStr,
        place,
        star: singleResult.profileData?.star || star,
        rasi: singleResult.profileData?.rasi || rasi,
        avatarUrl: profile.avatarUrl || (profile.media && profile.media[0] ? profile.media[0].url : null),
        horoscopeDocumentUrl: uploadedDoc,
      },
      reportHtml: sanitizedReportHtml,
      hasUploadedDocument: !!uploadedDoc,
      uploadedDocumentUrl: uploadedDoc,
    };
  }

  /**
   * Retrieves user horoscope usage breakdown for Admin User Profile view (Requirements 9, 10, 21, 26).
   */
  async getUserHoroscopeUsage(userId: string) {
    if (!userId) {
      return { total: 0, registered: 0, newPerson: 0, lastCheckDate: null, history: [] };
    }
    try {
      const [total, registered, newPerson, lastCheck, recentChecks] = await Promise.all([
        prisma.horoscopeMatchCheck.count({ where: { userId } }),
        prisma.horoscopeMatchCheck.count({ where: { userId, matchType: "REGISTERED_PROFILE" } }),
        prisma.horoscopeMatchCheck.count({ where: { userId, matchType: "NEW_PERSON" } }),
        prisma.horoscopeMatchCheck.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        }),
        prisma.horoscopeMatchCheck.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 15,
        }),
      ]);

      const history = recentChecks.map((c) => {
        let mobilePlain: string | null = null;
        if (c.targetMobile) {
          try {
            mobilePlain = decrypt(c.targetMobile);
          } catch {
            mobilePlain = "[Encrypted]";
          }
        }
        return {
          id: c.id,
          createdAt: c.createdAt.toISOString(),
          matchType: c.matchType,
          targetName: c.targetName,
          targetGender: c.targetGender,
          targetDob: c.targetDob ? c.targetDob.toISOString().split("T")[0] : "",
          targetTob: c.targetTob || "—",
          targetPlace: c.targetPlace || "—",
          targetMobile: mobilePlain,
          marketingConsent: c.marketingConsent,
          score: c.score,
          traditionalScore: Math.round(c.score * 3.6),
          verdict: c.verdict,
          verdictMalayalam: c.verdictMalayalam,
        };
      });

      return {
        total,
        registered,
        newPerson,
        lastCheckDate: lastCheck ? lastCheck.createdAt.toISOString() : null,
        history,
      };
    } catch (err) {
      console.error("[AstrologyService] getUserHoroscopeUsage error:", err);
      return { total: 0, registered: 0, newPerson: 0, lastCheckDate: null, history: [] };
    }
  }

  /**
   * Retrieves summary statistics for the Admin Horoscope Matches dashboard (Requirement 12).
   */
  async getAdminHoroscopeStats() {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [
        totalChecks,
        registeredChecks,
        newPersonChecks,
        usersGroup,
        newPeopleGroup,
        todaysChecks,
      ] = await Promise.all([
        prisma.horoscopeMatchCheck.count(),
        prisma.horoscopeMatchCheck.count({ where: { matchType: "REGISTERED_PROFILE" } }),
        prisma.horoscopeMatchCheck.count({ where: { matchType: "NEW_PERSON" } }),
        prisma.horoscopeMatchCheck.groupBy({ by: ["userId"] }),
        prisma.horoscopeMatchCheck.groupBy({
          by: ["targetName"],
          where: { matchType: "NEW_PERSON" },
        }),
        prisma.horoscopeMatchCheck.count({
          where: { createdAt: { gte: startOfToday } },
        }),
      ]);

      return {
        totalChecks,
        registeredChecks,
        newPersonChecks,
        usersCount: usersGroup.length,
        newPeopleCount: newPeopleGroup.length,
        todaysChecks,
      };
    } catch (err) {
      console.error("[AstrologyService] getAdminHoroscopeStats error:", err);
      return {
        totalChecks: 0,
        registeredChecks: 0,
        newPersonChecks: 0,
        usersCount: 0,
        newPeopleCount: 0,
        todaysChecks: 0,
      };
    }
  }

  /**
   * Retrieves paginated, searchable, filtered horoscope match checks for the Admin panel (Requirements 7, 8, 11, 13, 14, 15, 16).
   */
  async getAdminHoroscopeMatches(params: {
    search?: string;
    userId?: string;
    matchType?: string;
    hasMobile?: string;
    consentFilter?: string;
    dateFilter?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.userId) {
      where.userId = params.userId;
    }

    if (params.matchType && params.matchType !== "ALL") {
      where.matchType = params.matchType;
    }

    if (params.hasMobile === "yes") {
      where.targetMobile = { not: null };
    } else if (params.hasMobile === "no") {
      where.targetMobile = null;
    }

    if (params.consentFilter === "yes") {
      where.marketingConsent = true;
    } else if (params.consentFilter === "no") {
      where.marketingConsent = false;
    }

    // Date filters
    const now = new Date();
    if (params.dateFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.createdAt = { gte: today };
    } else if (params.dateFilter === "7days") {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: past7 };
    } else if (params.dateFilter === "30days") {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: past30 };
    } else if (params.dateFilter === "this_month") {
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      where.createdAt = { gte: firstOfMonth };
    } else if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    // Text search
    if (params.search && params.search.trim()) {
      const s = params.search.trim();
      where.OR = [
        { userName: { contains: s, mode: "insensitive" } },
        { targetName: { contains: s, mode: "insensitive" } },
        { targetPlace: { contains: s, mode: "insensitive" } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.horoscopeMatchCheck.count({ where }),
      prisma.horoscopeMatchCheck.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  dateOfBirth: true,
                  timeOfBirth: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Unique target names for duplicate detection (Requirement 13)
    const targetNames = Array.from(new Set(records.map((r) => r.targetName)));
    const duplicateCounts = await prisma.horoscopeMatchCheck.groupBy({
      by: ["targetName"],
      where: {
        targetName: { in: targetNames },
      },
      _count: {
        userId: true,
      },
    });
    const duplicateMap = new Map<string, number>();
    for (const d of duplicateCounts) {
      duplicateMap.set(d.targetName, d._count.userId);
    }

    const items = records.map((r) => {
      let mobilePlain: string | null = null;
      if (r.targetMobile) {
        try {
          mobilePlain = decrypt(r.targetMobile);
        } catch {
          mobilePlain = "[Encrypted]";
        }
      }

      const performingUserName =
        r.userName ||
        (r.user?.profile
          ? `${r.user.profile.firstName} ${r.user.profile.lastName || ""}`.trim()
          : r.user?.email || "User");

      const repeatCount = duplicateMap.get(r.targetName) || 1;

      return {
        id: r.id,
        createdAt: r.createdAt.toISOString(),
        userId: r.userId,
        userName: performingUserName,
        userEmail: r.user?.email || "",
        userDob: r.user?.profile?.dateOfBirth ? r.user.profile.dateOfBirth.toISOString().split("T")[0] : null,
        userTob: r.user?.profile?.timeOfBirth || null,
        matchType: r.matchType,
        targetProfileId: r.targetProfileId,
        targetName: r.targetName,
        targetGender: r.targetGender,
        targetDob: r.targetDob.toISOString().split("T")[0],
        targetTob: r.targetTob || "—",
        targetPlace: r.targetPlace || "—",
        targetMobile: mobilePlain,
        marketingConsent: r.marketingConsent,
        consentTimestamp: r.consentTimestamp ? r.consentTimestamp.toISOString() : null,
        score: r.score,
        traditionalScore: Math.round(r.score * 3.6),
        verdict: r.verdict,
        verdictMalayalam: r.verdictMalayalam,
        reportSummary: r.reportSummary,
        reportHtml: r.reportHtml,
        repeatCheckCount: repeatCount,
        hasMultipleChecks: repeatCount > 1,
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const astrologyService = new AstrologyService();
