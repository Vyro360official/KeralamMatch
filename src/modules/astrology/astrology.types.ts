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
