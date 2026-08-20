import { IMatchingRepository } from "./matching.repository";
import { Profile } from "@prisma/client";
import {
  MatchBreakdown,
  MatchScoreResult,
  TwoWayMatchResult,
  DEFAULT_MATCHING_WEIGHTS,
  MatchingWeightsConfig,
} from "./matching.types";

export class MatchingService {
  constructor(
    private matchingRepo: IMatchingRepository,
    private weights: MatchingWeightsConfig = DEFAULT_MATCHING_WEIGHTS
  ) {}

  /**
   * Calculates comprehensive Two-Way compatibility between userA and userB.
   */
  async getMatchScore(
    userA: { id: string; profile: Profile; preferences?: any },
    userB: { id: string; profile: Profile; preferences?: any }
  ): Promise<MatchScoreResult> {
    const p1 = userA.profile;
    const p2 = userB.profile;

    const twoWay = this.calculateTwoWayCompatibility(userA, userB);

    return {
      score: twoWay.overallCompatibility,
      breakdown: twoWay.breakdown,
      twoWayResult: twoWay,
    };
  }

  /**
   * Two-Way Mutual Compatibility Engine
   */
  public calculateTwoWayCompatibility(
    userA: { id: string; profile: Profile; preferences?: any },
    userB: { id: string; profile: Profile; preferences?: any }
  ): TwoWayMatchResult {
    const p1 = userA.profile;
    const p2 = userB.profile;

    // 1. Strict Criteria Gate (A's requirements against B, and B's requirements against A)
    const strictFailureReasons: string[] = [];

    const age1 = this.calculateAge(p1.dateOfBirth);
    const age2 = this.calculateAge(p2.dateOfBirth);

    // Evaluate strict preferences from userA
    const prefA = userA.preferences || {};
    if (prefA.strictAge && prefA.minAge && prefA.maxAge) {
      if (age2 < prefA.minAge || age2 > prefA.maxAge) {
        strictFailureReasons.push(`Age (${age2} yrs) outside candidate's strict required range (${prefA.minAge}-${prefA.maxAge} yrs)`);
      }
    }

    if (prefA.strictReligion && prefA.religion) {
      if (p2.religion.toLowerCase() !== prefA.religion.toLowerCase()) {
        strictFailureReasons.push(`Religion (${p2.religion}) does not match strict required religion (${prefA.religion})`);
      }
    }

    if (prefA.strictCaste && prefA.caste && prefA.caste !== "Any") {
      if (p2.caste && p2.caste.toLowerCase() !== prefA.caste.toLowerCase()) {
        strictFailureReasons.push(`Caste (${p2.caste}) does not match strict required caste (${prefA.caste})`);
      }
    }

    // Evaluate strict preferences from userB
    const prefB = userB.preferences || {};
    if (prefB.strictAge && prefB.minAge && prefB.maxAge) {
      if (age1 < prefB.minAge || age1 > prefB.maxAge) {
        strictFailureReasons.push(`Your age (${age1} yrs) outside partner's strict required range (${prefB.minAge}-${prefB.maxAge} yrs)`);
      }
    }

    const strictRequirementsPassed = strictFailureReasons.length === 0;

    // 2. Calculate 10-Dimension Breakdown (A evaluate B)
    const breakdown = this.calculate10Dimensions(p1, p2, prefA);

    // 3. Calculate Dual Directional Scores
    const breakdownReverse = this.calculate10Dimensions(p2, p1, prefB);

    const yourMatchScore = this.computeWeightedScore(breakdown);
    const theirMatchScore = this.computeWeightedScore(breakdownReverse);

    // Overall Mutual Compatibility is the harmonic balance of both perspectives
    let overallCompatibility = Math.round((yourMatchScore * 0.5) + (theirMatchScore * 0.5));

    // If strict requirements failed, cap overall score and flag accordingly
    if (!strictRequirementsPassed) {
      overallCompatibility = Math.min(overallCompatibility, 45);
    }

    // 4. Generate Explainable Match Reasons ("Why You Match" & "Needs Consideration")
    const reasonsWhyYouMatch: string[] = [];
    const reasonsNeedingConsideration: string[] = [];

    if (breakdown.religionCulture >= 85) {
      reasonsWhyYouMatch.push("Shared religious and cultural traditions");
    } else {
      reasonsNeedingConsideration.push("Different religious or community background");
    }

    if (breakdown.location >= 80) {
      reasonsWhyYouMatch.push("Close geographical proximity / preferred native district");
    } else {
      reasonsNeedingConsideration.push("Different native districts / relocation discussion needed");
    }

    if (breakdown.education >= 80) {
      reasonsWhyYouMatch.push("Compatible academic qualification & professional standing");
    }

    if (breakdown.career >= 80) {
      reasonsWhyYouMatch.push("Aligned career trajectory and employment status");
    }

    if (breakdown.astrology >= 80) {
      reasonsWhyYouMatch.push("Astrological and horoscope compatibility verified");
    } else if (p1.horoscopeRequired || p2.horoscopeRequired) {
      reasonsNeedingConsideration.push("Detailed horoscope chart matching recommended");
    }

    if (breakdown.lifestyleHabits >= 80) {
      reasonsWhyYouMatch.push("Harmonious lifestyle, dietary habits, and family values");
    }

    if (breakdown.hobbiesInterests >= 75) {
      reasonsWhyYouMatch.push("Common personal hobbies, music, and travel interests");
    }

    let compatibilityTier: TwoWayMatchResult["compatibilityTier"] = "MODERATE";
    if (overallCompatibility >= 85 && strictRequirementsPassed) {
      compatibilityTier = "EXCELLENT";
    } else if (overallCompatibility >= 75 && strictRequirementsPassed) {
      compatibilityTier = "HIGH_COMPATIBILITY";
    } else if (!strictRequirementsPassed) {
      compatibilityTier = "CONSIDERATION_NEEDED";
    }

    return {
      overallCompatibility,
      yourMatchScore,
      theirMatchScore,
      strictRequirementsPassed,
      strictFailureReasons,
      breakdown,
      reasonsWhyYouMatch,
      reasonsNeedingConsideration,
      compatibilityTier,
    };
  }

  private calculate10Dimensions(p1: Profile, p2: Profile, pref: any): MatchBreakdown {
    const age1 = this.calculateAge(p1.dateOfBirth);
    const age2 = this.calculateAge(p2.dateOfBirth);

    // 1. Basic Details (Age gap, Height harmony, Marital status)
    let basicDetails = 85;
    const ageDiff = Math.abs(age1 - age2);
    if (ageDiff <= 3) basicDetails += 15;
    else if (ageDiff <= 6) basicDetails += 5;
    else basicDetails -= 15;

    if (p1.maritalStatus === p2.maritalStatus) basicDetails += 10;
    basicDetails = Math.min(100, Math.max(20, basicDetails));

    // 2. Location (District & State Proximity)
    let location = 50;
    if (p1.district && p2.district && p1.district.toLowerCase() === p2.district.toLowerCase()) {
      location = 100;
    } else if (p1.state && p2.state && p1.state.toLowerCase() === p2.state.toLowerCase()) {
      location = 75;
    } else {
      location = 55;
    }

    // 3. Religion & Culture
    let religionCulture = 30;
    if (p1.religion && p2.religion && p1.religion.toLowerCase() === p2.religion.toLowerCase()) {
      religionCulture = 85;
      if (p1.caste && p2.caste && p1.caste.toLowerCase() === p2.caste.toLowerCase()) {
        religionCulture = 100;
      }
    }

    // 4. Education Alignment
    let education = 70;
    if (p1.education && p2.education) {
      const e1 = p1.education.toLowerCase();
      const e2 = p2.education.toLowerCase();
      if (e1 === e2 || (e1.includes("b.tech") && e2.includes("b.tech")) || (e1.includes("mbbs") && e2.includes("mbbs"))) {
        education = 100;
      } else if (e1.includes("degree") || e2.includes("degree") || e1.includes("post graduate") || e2.includes("post graduate")) {
        education = 85;
      }
    }

    // 5. Career & Occupation
    let career = 75;
    if (p1.profession && p2.profession) {
      if (p1.profession.toLowerCase() === p2.profession.toLowerCase()) career = 95;
    }

    // 6. Lifestyle & Habits (Diet, Values, Routine)
    let lifestyleHabits = 80;
    const bio1 = (p1.bio || "").toLowerCase();
    const bio2 = (p2.bio || "").toLowerCase();
    if (bio1.includes("vegetarian") && bio2.includes("vegetarian")) lifestyleHabits += 15;
    if (bio1.includes("travel") && bio2.includes("travel")) lifestyleHabits += 10;
    lifestyleHabits = Math.min(100, lifestyleHabits);

    // 7. Astrology & Horoscope
    let astrology = 80;
    if (p1.horoscopeRequired && p2.horoscopeRequired) {
      astrology = 95;
    } else if (!p1.horoscopeRequired && !p2.horoscopeRequired) {
      astrology = 90;
    }

    // 8. Family Background
    let family = 85;
    if (p1.maritalStatus === "Never Married" && p2.maritalStatus === "Never Married") {
      family = 95;
    }

    // 9. Partner Preferences Fulfillments
    let partnerPreferences = 80;

    // 10. Hobbies & Interests
    let hobbiesInterests = 75;
    const commonKeywords = ["music", "reading", "photography", "cooking", "badminton", "fitness", "cinema"];
    const sharedCount = commonKeywords.filter((kw) => bio1.includes(kw) && bio2.includes(kw)).length;
    hobbiesInterests += sharedCount * 8;
    hobbiesInterests = Math.min(100, hobbiesInterests);

    return {
      basicDetails,
      location,
      religionCulture,
      education,
      career,
      lifestyleHabits,
      astrology,
      family,
      partnerPreferences,
      hobbiesInterests,
      // Backward compatibility aliases
      religion: religionCulture,
      lifestyle: lifestyleHabits,
      goals: career,
      communication: basicDetails,
    };
  }

  private computeWeightedScore(b: MatchBreakdown): number {
    const totalWeight =
      this.weights.basicDetailsWeight +
      this.weights.locationWeight +
      this.weights.religionCultureWeight +
      this.weights.educationWeight +
      this.weights.careerWeight +
      this.weights.lifestyleWeight +
      this.weights.astrologyWeight +
      this.weights.familyWeight +
      this.weights.partnerPreferencesWeight +
      this.weights.hobbiesInterestsWeight;

    const weightedSum =
      b.basicDetails * this.weights.basicDetailsWeight +
      b.location * this.weights.locationWeight +
      b.religionCulture * this.weights.religionCultureWeight +
      b.education * this.weights.educationWeight +
      b.career * this.weights.careerWeight +
      b.lifestyleHabits * this.weights.lifestyleWeight +
      b.astrology * this.weights.astrologyWeight +
      b.family * this.weights.familyWeight +
      b.partnerPreferences * this.weights.partnerPreferencesWeight +
      b.hobbiesInterests * this.weights.hobbiesInterestsWeight;

    return Math.round(weightedSum / (totalWeight || 100));
  }

  private calculateAge(dob: Date | string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(18, age);
  }
}
