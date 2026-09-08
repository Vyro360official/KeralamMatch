/**
 * KERALAMMATCH — ASTROLOGY DOMAIN TYPES
 * Interface definitions for SoftAstro astrology integration.
 */

export interface BirthProfileInput {
  name: string;
  gender: "male" | "female" | string;
  dob: string; // ISO format: YYYY-MM-DD
  tob?: string; // 24-hour format: HH:MM
  place?: string;
  lat?: number;
  lon?: number;
  tz?: number;
}

export interface ManualHoroscopeProfileInput {
  fullName: string;
  gender?: "male" | "female" | "MALE" | "FEMALE" | string;
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:MM or HH:MM AM/PM
  placeOfBirth: string;
  mobileNumber?: string;
  marketingConsent?: boolean;
}

export interface HoroscopeMatchHistoryItemDTO {
  id: string;
  createdAt: string;
  matchType?: string; // "NEW_PERSON" | "REGISTERED_PROFILE"
  targetName: string;
  targetGender: string;
  targetDob?: string;
  targetTob?: string;
  targetPlace?: string;
  targetProfileId?: string | null;
  targetMobile?: string | null;
  marketingConsent?: boolean;
  overallScore: number;
  traditionalScore: number;
  percentage: number;
  verdict: string;
  verdictMalayalam?: string | null;
  currentUser: {
    name: string;
    gender: string;
  };
}

export interface PoruthamItem {
  name: string; // e.g. "രാശിപൊരുത്തം" / "Rasi Porutham"
  nameEnglish: string;
  status: string; // "ഉത്തമം" | "മദ്ധ്യമം" | "അധമം"
  statusEnglish: "Excellent" | "Moderate" | "Needs Attention";
  score: number; // 0, 0.5, or 1.0
  maxScore: number; // 1.0
  explanation?: string;
}

export interface SoftAstroRawResponse {
  success: boolean;
  engine?: string;
  error?: string;
  bride?: {
    name: string;
    star: string;
    pada: number;
    rasi: string;
    rasi_index: number;
    dob: string;
    tob: string;
    place: string;
    dasa_balance: string;
    rasi_chart?: Record<number, string[]>;
    navamsa_chart?: Record<number, string[]>;
    planets?: Record<string, any>;
  };
  groom?: {
    name: string;
    star: string;
    pada: number;
    rasi: string;
    rasi_index: number;
    dob: string;
    tob: string;
    place: string;
    dasa_balance: string;
    rasi_chart?: Record<number, string[]>;
    navamsa_chart?: Record<number, string[]>;
    planets?: Record<string, any>;
  };
  porutham?: {
    items: Array<{
      name: string;
      status: string;
      score: number;
    }>;
    total_score: number;
    verdict_mal: string;
  };
  papasamya?: {
    bride: {
      total: number;
      lagna: number;
      moon: number;
      venus: number;
    };
    groom: {
      total: number;
      lagna: number;
      moon: number;
      venus: number;
    };
    diff: number;
    is_balanced: boolean;
  };
  kuja_dosha?: {
    bride: {
      status: string;
      has_pariharam: boolean;
      has_dosha: boolean;
      status_mal?: string;
      desc_mal?: string;
      desc?: string;
    };
    groom: {
      status: string;
      has_pariharam: boolean;
      has_dosha: boolean;
      status_mal?: string;
      desc_mal?: string;
      desc?: string;
    };
    is_resolved: boolean;
  };
  dasa_timeline?: {
    bride: Array<{
      lord: string;
      start_yr: number;
      end_yr: number;
      span_str: string;
    }>;
    groom: Array<{
      lord: string;
      start_yr: number;
      end_yr: number;
      span_str: string;
    }>;
    has_sandhi: boolean;
  };
  report_html?: string | null;
}

export type { HoroscopeMatchResultDTO, HoroscopeProfileSummaryDTO } from "./astrology.dto";
