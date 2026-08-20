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
    const updateData: any = {};
    if (input.firstName !== undefined) updateData.firstName = input.firstName;
    if (input.lastName !== undefined) updateData.lastName = input.lastName;
    if (input.gender !== undefined) updateData.gender = input.gender;
    if (input.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(input.dateOfBirth);
    if (input.height !== undefined) updateData.height = input.height;
    if (input.maritalStatus !== undefined) updateData.maritalStatus = input.maritalStatus;
    if (input.motherTongue !== undefined) updateData.motherTongue = input.motherTongue;
    if (input.religion !== undefined) updateData.religion = input.religion;
    if (input.caste !== undefined) updateData.caste = input.caste;
    if (input.subCaste !== undefined) updateData.subCaste = input.subCaste;
    if (input.horoscopeRequired !== undefined) updateData.horoscopeRequired = input.horoscopeRequired;
    if (input.education !== undefined) updateData.education = input.education;
    if (input.profession !== undefined) updateData.profession = input.profession;
    if (input.company !== undefined) updateData.company = input.company;
    if (input.incomeBracket !== undefined) updateData.incomeBracket = input.incomeBracket;
    if (input.district !== undefined) updateData.district = input.district;
    if (input.state !== undefined) updateData.state = input.state;
    if (input.country !== undefined) updateData.country = input.country;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.bio !== undefined) updateData.bio = input.bio;

    const createData = {
      userId,
      firstName: input.firstName || "Member",
      lastName: input.lastName || "",
      gender: input.gender || "MALE",
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : new Date("1995-01-01"),
      height: input.height || 165,
      maritalStatus: input.maritalStatus || "Never Married",
      motherTongue: input.motherTongue || "Malayalam",
      religion: input.religion || "",
      caste: input.caste || null,
      subCaste: input.subCaste || null,
      horoscopeRequired: input.horoscopeRequired || false,
      education: input.education || "",
      profession: input.profession || "",
      company: input.company || null,
      incomeBracket: input.incomeBracket || "",
      district: input.district || "",
      state: input.state || "Kerala",
      country: input.country || "India",
      city: input.city || "",
      bio: input.bio || "",
    };

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
