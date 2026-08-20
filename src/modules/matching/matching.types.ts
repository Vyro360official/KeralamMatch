export type PreferenceImportance = "ANY" | "PREFERRED" | "REQUIRED";

export interface ThreeTierPreference<T> {
  value: T;
  importance: PreferenceImportance;
}

export interface MatchingWeightsConfig {
  basicDetailsWeight: number;    // default 15
  locationWeight: number;        // default 10
  religionCultureWeight: number; // default 15
  educationWeight: number;       // default 10
  careerWeight: number;          // default 10
  lifestyleWeight: number;       // default 10
  astrologyWeight: number;       // default 10
  familyWeight: number;          // default 10
  partnerPreferencesWeight: number; // default 5
  hobbiesInterestsWeight: number;   // default 5
}

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeightsConfig = {
  basicDetailsWeight: 15,
  locationWeight: 10,
  religionCultureWeight: 15,
  educationWeight: 10,
  careerWeight: 10,
  lifestyleWeight: 10,
  astrologyWeight: 10,
  familyWeight: 10,
  partnerPreferencesWeight: 5,
  hobbiesInterestsWeight: 5,
};

export interface MatchBreakdown {
  basicDetails: number;      // 0 - 100
  location: number;          // 0 - 100
  religionCulture: number;   // 0 - 100
  education: number;         // 0 - 100
  career: number;            // 0 - 100
  lifestyleHabits: number;   // 0 - 100
  astrology: number;         // 0 - 100
  family: number;            // 0 - 100
  partnerPreferences: number;// 0 - 100
  hobbiesInterests: number;  // 0 - 100
  
  // Legacy backward-compatibility aliases
  religion?: number;
  lifestyle?: number;
  goals?: number;
  communication?: number;
}

export interface TwoWayMatchResult {
  overallCompatibility: number; // 0 - 100 (Dual directional mutual score)
  yourMatchScore: number;       // 0 - 100 (A's criteria matched by B)
  theirMatchScore: number;      // 0 - 100 (B's criteria matched by A)
  strictRequirementsPassed: boolean;
  strictFailureReasons: string[];
  breakdown: MatchBreakdown;
  reasonsWhyYouMatch: string[];
  reasonsNeedingConsideration: string[];
  compatibilityTier: "EXCELLENT" | "HIGH_COMPATIBILITY" | "MODERATE" | "CONSIDERATION_NEEDED";
}

export interface MatchScoreResult {
  score: number;
  breakdown: MatchBreakdown;
  twoWayResult?: TwoWayMatchResult;
}
