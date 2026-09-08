/**
 * KERALAMMATCH — ASTROLOGY RESULT DTO
 * Strict, sanitized Data Transfer Object. Never serializes Prisma entities or private credentials.
 */

import { PoruthamItem } from "./astrology.types";

export interface HoroscopeProfileSummaryDTO {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  gender: string;
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:MM or "Not specified"
  placeOfBirth: string; // Location / District
  starNakshatram: string; // e.g. "Rohini", "Moolam"
  rasi: string; // e.g. "Vrishabha (Taurus)"
  dasaBalance?: string;
}

export interface HoroscopeCompatibilityDTO {
  overallScore: number; // Raw Porutham score out of 10 (e.g. 7.5)
  traditionalScore: number; // Scaled to 36 Guna system (Math.round(overallScore * 3.6))
  percentage: number; // Math.round(overallScore * 10)
  verdict: string; // "EXCELLENT MATCH" | "MODERATE MATCH" | "NEEDS ATTENTION"
  verdictMalayalam: string; // "ഉത്തമം" | "മദ്ധ്യമം" | "അധമം"
  description: string;
}

export interface PapasamyaSummaryDTO {
  brideScore: number;
  groomScore: number;
  difference: number;
  isBalanced: boolean;
  verdictDescription: string;
}

export interface KujaDoshaSummaryDTO {
  brideStatus: string;
  brideHasDosha: boolean;
  brideHasPariharam: boolean;
  groomStatus: string;
  groomHasDosha: boolean;
  groomHasPariharam: boolean;
  isResolved: boolean;
  verdictDescription: string;
}

export interface DasaSandhiSummaryDTO {
  hasSandhi: boolean;
  verdictDescription: string;
  brideTimeline: Array<{ lord: string; span: string }>;
  groomTimeline: Array<{ lord: string; span: string }>;
}

export interface HoroscopeMatchResultDTO {
  currentUser: HoroscopeProfileSummaryDTO;
  targetUser: HoroscopeProfileSummaryDTO;
  compatibility: HoroscopeCompatibilityDTO;
  poruthams: PoruthamItem[];
  papasamya: PapasamyaSummaryDTO;
  kujaDosha: KujaDoshaSummaryDTO;
  dasa: DasaSandhiSummaryDTO;
  sanitizedReportHtml?: string | null;
  reportHtml?: string | null;
  calculatedAt: string;
  engine: string;
}
