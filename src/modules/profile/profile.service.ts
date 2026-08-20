import { IProfileRepository } from "./profile.repository";
import { ProfileCreateInput } from "./profile.types";
import { Profile, VerificationStatus } from "@prisma/client";

export class ProfileService {
  constructor(private profileRepo: IProfileRepository) {}

  async getProfileByUserId(userId: string): Promise<Profile | null> {
    return this.profileRepo.findByUserId(userId);
  }

  async getProfileById(profileId: string): Promise<Profile | null> {
    return this.profileRepo.findByProfileId(profileId);
  }

  async saveProfile(userId: string, input: Partial<ProfileCreateInput>): Promise<Profile> {
    // 1. Create or Update Profile
    const profile = await this.profileRepo.upsertProfile(userId, input);

    // 2. Calculate Profile Completion metrics
    const strength = this.calculateProfileStrength(profile);
    const quality = this.calculateQualityScore(profile);
    const trust = this.calculateTrustScore(profile);
    
    // Visibility score = (Strength * 0.3) + (Quality * 0.3) + (Trust * 0.4)
    const visibility = Math.round(strength * 0.3 + quality * 0.3 + trust * 0.4);

    // 3. Persist scores to DB
    const updatedProfile = await this.profileRepo.updateCompletionScores(profile.id, {
      strength,
      quality,
      trust,
      visibility,
    });

    return updatedProfile;
  }

  /**
   * Filters profile searches according to demographics, blurring media URLs for unauthenticated/unverified users
   */
  async searchProfiles(
    filters: {
      gender?: "MALE" | "FEMALE";
      district?: string;
      religion?: string;
      ageMin?: number;
      ageMax?: number;
    },
    requesterVerified: boolean,
    page = 1,
    limit = 12
  ): Promise<{ results: any[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    // Build Prisma query filter object
    const prismaFilters: any = {
      showInSearch: true,
      isPublic: true,
    };

    if (filters.gender) {
      prismaFilters.gender = filters.gender;
    }
    if (filters.district) {
      prismaFilters.district = filters.district;
    }
    if (filters.religion) {
      prismaFilters.religion = filters.religion;
    }
    
    if (filters.ageMin || filters.ageMax) {
      const today = new Date();
      const maxBirthDate = filters.ageMin
        ? new Date(today.getFullYear() - filters.ageMin, today.getMonth(), today.getDate())
        : undefined;
      const minBirthDate = filters.ageMax
        ? new Date(today.getFullYear() - filters.ageMax - 1, today.getMonth(), today.getDate())
        : undefined;

      prismaFilters.dateOfBirth = {};
      if (minBirthDate) prismaFilters.dateOfBirth.gte = minBirthDate;
      if (maxBirthDate) prismaFilters.dateOfBirth.lte = maxBirthDate;
    }

    const profiles = await this.profileRepo.queryProfiles(prismaFilters, skip, limit);
    const total = await this.profileRepo.countProfiles(prismaFilters);

    // Format profiles to redact contact details and blur photos if viewer is unverified
    const formattedResults = (profiles as any[]).map((p: any) => {
      const profileData = p as any;
      
      // Calculate age
      const birth = new Date(p.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
        age--;
      }

      // Redact last name for privacy
      const redactedLastName = p.lastName.charAt(0) + ".";

      // If viewer is unverified, obfuscate photo URLs with a blur filter
      const mediaList = p.media.map((m: any) => {
        if (!requesterVerified) {
          // Cloudinary blur transformation
          return {
            ...m,
            url: m.url.replace("/upload/", "/upload/e_blur:1000,q_auto,f_auto/"),
            watermarkedUrl: m.watermarkedUrl.replace("/upload/", "/upload/e_blur:1000,q_auto,f_auto/"),
          };
        }
        return m;
      });

      return {
        id: p.id,
        firstName: p.firstName,
        lastName: redactedLastName,
        gender: p.gender,
        age,
        height: p.height,
        maritalStatus: p.maritalStatus,
        religion: p.religion,
        caste: p.caste,
        district: p.district,
        education: p.education,
        profession: p.profession,
        media: mediaList,
        voiceIntroduction: requesterVerified ? p.voiceIntroduction : null,
        verificationStatus: p.verificationStatus,
        profileStrength: p.profileStrength,
        reputationRating: p.reputationRating,
      };
    });

    return {
      results: formattedResults,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Helper calculation logic
  private calculateProfileStrength(profile: Profile): number {
    let score = 0;
    
    // Basic Details: +20%
    if (profile.firstName && profile.lastName && profile.gender && profile.dateOfBirth) score += 20;
    
    // Education & Profession: +20%
    if (profile.education && profile.profession && profile.incomeBracket) score += 20;
    
    // Religion & Ancestry: +20%
    if (profile.religion && profile.caste) score += 20;
    
    // Location: +10%
    if (profile.district && profile.city) score += 10;
    
    // Biography: +10%
    if (profile.bio && profile.bio.length > 50) score += 10;
    
    // Media Uploads: +10%
    const media = (profile as any).media;
    if (media && media.length > 0) score += 10;
    
    // Voice introduction: +10%
    if (profile.voiceIntroduction) score += 10;

    return Math.min(score, 100);
  }

  private calculateQualityScore(profile: Profile): number {
    let score = 50; // Base score
    const bioText = profile.bio || "";
    
    // Text bio length evaluations
    if (bioText.length > 100) score += 20;
    if (bioText.length > 250) score += 10;
    
    // Exclude basic default descriptions
    const containsBadWords = /spam|advertise|test|number|call|link/i.test(bioText);
    if (containsBadWords) score -= 30;

    if (profile.company) score += 10;
    if (profile.caste && profile.subCaste) score += 10;

    return Math.max(10, Math.min(score, 100));
  }

  private calculateTrustScore(profile: Profile): number {
    let score = 0;
    if (profile.verifiedMobile) score += 10;
    if (profile.verifiedEmail) score += 10;
    if (profile.verifiedSelfie) score += 20;
    if (profile.verifiedAadhaar) score += 30;
    if (profile.verifiedEmployment) score += 10;
    if (profile.verifiedIncome) score += 10;
    if (profile.verifiedAddress) score += 10;

    return Math.min(score, 100);
  }
}
