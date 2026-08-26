import { prisma } from "@/lib/db";
import { ProfileCreateInput } from "./profile.types";
import { Profile, VerificationStatus } from "@prisma/client";

export interface IProfileRepository {
  upsertProfile(userId: string, input: Partial<ProfileCreateInput>): Promise<Profile>;
  findByUserId(userId: string): Promise<Profile | null>;
  findByProfileId(profileId: string): Promise<Profile | null>;
  updateVerificationStatus(profileId: string, verifiedField: string, status: boolean): Promise<Profile>;
  updateCompletionScores(profileId: string, scores: { strength: number; quality: number; trust: number; visibility: number }): Promise<Profile>;
  queryProfiles(filters: any, skip: number, limit: number): Promise<Profile[]>;
  countProfiles(filters: any): Promise<number>;
}

export class ProfileRepository implements IProfileRepository {
  async upsertProfile(userId: string, input: Partial<ProfileCreateInput>): Promise<Profile> {
    const profileFields = [
      "firstName", "lastName", "gender", "maritalStatus", "motherTongue", "religion",
      "caste", "subCaste", "horoscopeRequired", "education", "profession", "company",
      "incomeBracket", "district", "state", "country", "city", "bio", "voiceIntroduction",
      
      // Extended fields
      "timeOfBirth", "placeOfBirth", "starNakshatram", "rasi", "dosham", "gothram", "horoscopeDocumentUrl",
      "bodyType", "complexion", "physicalStatus", "fitnessLevel", "foodHabits", "smoking", "drinking",
      
      // Family fields
      "familyStatus", "familyType", "familyValues", "fatherName", "fatherOccupation", "motherName", "motherOccupation",
      "totalBrothers", "marriedBrothers", "totalSisters", "marriedSisters", "familyAssets", "hobbies",
      
      // Creator details
      "createdFor", "creatorName", "creatorPhone", "creatorRelation", "creatorDocumentUrl",
      
      // Auditing
      "createdBy", "createdById", "lastModifiedBy",

      // Partner preferences
      "partnerAgeMin", "partnerAgeMax", "partnerAgeStrict", "partnerHeightMin", "partnerHeightMax", "partnerHeightStrict",
      "partnerMaritalStatus", "partnerMaritalStatusStrict", "partnerMotherTongue", "partnerMotherTongueStrict",
      "partnerPhysicalStatus", "partnerPhysicalStatusStrict", "partnerDosham", "partnerDoshamStrict",
      "partnerReligion", "partnerReligionStrict", "partnerCaste", "partnerCasteStrict",
      "partnerSubCaste", "partnerSubCasteStrict", "partnerEducation", "partnerEducationStrict",
      "partnerProfession", "partnerProfessionStrict", "partnerFoodHabits", "partnerFoodHabitsStrict",
      "partnerDrinking", "partnerDrinkingStrict", "partnerSmoking", "partnerSmokingStrict",
      "partnerCountry", "partnerCountryStrict", "partnerDistrict", "partnerDistrictStrict", "partnerCity"
    ];

    const updateData: any = {};
    const createData: any = {
      userId,
      firstName: "Member",
      lastName: "",
      gender: "MALE",
      dateOfBirth: new Date("1995-01-01"),
      height: 165,
      maritalStatus: "Never Married",
      religion: "",
      education: "",
      profession: "",
      incomeBracket: "",
      district: "",
      city: "",
      bio: "",
    };

    if (input.dateOfBirth !== undefined) {
      const parsedDob = new Date(input.dateOfBirth);
      updateData.dateOfBirth = parsedDob;
      createData.dateOfBirth = parsedDob;
    }
    if (input.height !== undefined) {
      const parsedHeight = Number(input.height);
      updateData.height = parsedHeight;
      createData.height = parsedHeight;
    }

    for (const field of profileFields) {
      if (input[field as keyof typeof input] !== undefined) {
        updateData[field] = input[field as keyof typeof input];
        createData[field] = input[field as keyof typeof input];
      }
    }

    return prisma.profile.upsert({
      where: { userId },
      update: updateData,
      create: createData,
    });
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    return prisma.profile.findUnique({
      where: { userId },
      include: {
        media: true,
      },
    });
  }

  async findByProfileId(profileId: string): Promise<Profile | null> {
    return prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        media: true,
      },
    });
  }

  async updateVerificationStatus(profileId: string, verifiedField: string, status: boolean): Promise<Profile> {
    return prisma.profile.update({
      where: { id: profileId },
      data: {
        [verifiedField]: status,
      },
    });
  }

  async updateCompletionScores(
    profileId: string,
    scores: { strength: number; quality: number; trust: number; visibility: number }
  ): Promise<Profile> {
    return prisma.profile.update({
      where: { id: profileId },
      data: {
        profileStrength: scores.strength,
        qualityScore: scores.quality,
        trustScore: scores.trust,
        visibilityScore: scores.visibility,
      },
    });
  }

  async queryProfiles(filters: any, skip: number, limit: number): Promise<Profile[]> {
    return prisma.profile.findMany({
      where: filters,
      skip,
      take: limit,
      include: {
        media: true,
      },
      orderBy: {
        visibilityScore: "desc",
      },
    });
  }

  async countProfiles(filters: any): Promise<number> {
    return prisma.profile.count({
      where: filters,
    });
  }
}
