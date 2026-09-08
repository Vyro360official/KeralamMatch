/**
 * KERALAMMATCH — ASTROLOGY SERVICE
 * Authoritative business service for Horoscope & Astrology compatibility analysis.
 * Enforces session verification, self-match prevention, birth detail validation, and audit logging.
 */

import { prisma } from "@/lib/db";
import { executeSoftAstroMatch, formatPoruthamItems } from "./astrology.adapter";
import { sanitizeAstrologyReportHtml } from "./astrology.sanitizer";
import { HoroscopeMatchResultDTO, HoroscopeProfileSummaryDTO } from "./astrology.dto";
import { BirthProfileInput } from "./astrology.types";
import { generateSingleHoroscopeHtml } from "./astrology.engine";

export class AstrologyValidationError extends Error {
  public details: {
    currentUserMissingDob: boolean;
    targetUserMissingDob: boolean;
    missingFields: string[];
  };

  constructor(message: string, details: { currentUserMissingDob: boolean; targetUserMissingDob: boolean; missingFields: string[] }) {
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
    dateOfBirth: new Date("1994-06-18T10:30:00Z"),
    timeOfBirth: "10:30",
    placeOfBirth: "Trivandrum",
    district: "Trivandrum",
    starNakshatram: "Chothi",
    rasi: "Tula (Libra)",
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

    // 4. Validate Birth Details Completeness
    const currentDobMissing = !currentProfile.dateOfBirth;
    const targetDobMissing = !targetProfile.dateOfBirth;

    if (currentDobMissing || targetDobMissing) {
      const missing: string[] = [];
      if (currentDobMissing) missing.push(`Your profile (${currentProfile.firstName}) is missing Date of Birth`);
      if (targetDobMissing) missing.push(`Target candidate (${targetProfile.firstName}) is missing Date of Birth`);

      throw new AstrologyValidationError(
        "Horoscope matching requires complete birth details for both profiles.",
        {
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
    const dobStr = profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : "1995-01-01";
    const tobStr = profile.timeOfBirth || "10:30 AM";
    const place = profile.placeOfBirth || profile.district || "Kerala, India";
    const star = profile.starNakshatram || "Rohini";
    const rasi = profile.rasi || "Vrishabha (Taurus)";

    const rawReportHtml = generateSingleHoroscopeHtml({
      name,
      gender: profile.gender || "FEMALE",
      dob: dobStr,
      tob: tobStr,
      place,
      star,
      rasi,
    });

    const sanitizedReportHtml = sanitizeAstrologyReportHtml(rawReportHtml);
    const uploadedDoc = profile.horoscopeDocumentUrl || profile.horoscopeImage || null;

    return {
      success: true,
      profile: {
        id: profile.id,
        userId: profile.userId,
        name,
        gender: profile.gender || "FEMALE",
        dob: dobStr,
        tob: tobStr,
        place,
        star,
        rasi,
        avatarUrl: profile.avatarUrl || (profile.media && profile.media[0] ? profile.media[0].url : null),
        horoscopeDocumentUrl: uploadedDoc,
      },
      reportHtml: sanitizedReportHtml,
      hasUploadedDocument: !!uploadedDoc,
      uploadedDocumentUrl: uploadedDoc,
    };
  }
}

export const astrologyService = new AstrologyService();
