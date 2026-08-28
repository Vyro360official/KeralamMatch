import { Profile, Gender, VerificationStatus } from "@prisma/client";

export interface PublicProfileDTO {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string; // ISO String
  height: number;
  maritalStatus: string;
  motherTongue: string;
  religion: string;
  caste: string | null;
  subCaste: string | null;
  horoscopeRequired: boolean;
  education: string;
  profession: string;
  company: string | null;
  incomeBracket: string;
  district: string;
  state: string;
  country: string;
  city: string;
  bio: string;
  voiceIntroduction: string | null;
  verificationStatus: VerificationStatus;
  verifiedMobile: boolean;
  verifiedEmail: boolean;
  verifiedSelfie: boolean;
  profileStrength: number;
  reputationRating: number;
  media: Array<{
    id: string;
    url: string;
    watermarkedUrl: string;
    type: string;
    order: number;
  }>;
  
  // Matrimonial Details
  timeOfBirth: string | null;
  placeOfBirth: string | null;
  starNakshatram: string | null;
  rasi: string | null;
  dosham: string | null;
  gothram: string | null;
  bodyType: string | null;
  complexion: string | null;
  physicalStatus: string | null;
  fitnessLevel: string | null;
  foodHabits: string | null;
  smoking: string | null;
  drinking: string | null;
  
  // Family Info (Non-sensitive summary)
  familyStatus: string | null;
  familyType: string | null;
  familyValues: string | null;
  totalBrothers: number | null;
  marriedBrothers: number | null;
  totalSisters: number | null;
  marriedSisters: number | null;
  familyAssets: string[];
  hobbies: string[];

  // Partner Preferences
  partnerAgeMin: number | null;
  partnerAgeMax: number | null;
  partnerAgeStrict: boolean | null;
  partnerHeightMin: number | null;
  partnerHeightMax: number | null;
  partnerHeightStrict: boolean | null;
  partnerMaritalStatus: string | null;
  partnerMaritalStatusStrict: boolean | null;
  partnerMotherTongue: string | null;
  partnerMotherTongueStrict: boolean | null;
  partnerPhysicalStatus: string | null;
  partnerPhysicalStatusStrict: boolean | null;
  partnerDosham: string | null;
  partnerDoshamStrict: boolean | null;
  partnerReligion: string | null;
  partnerReligionStrict: boolean | null;
  partnerCaste: string | null;
  partnerCasteStrict: boolean | null;
  partnerSubCaste: string | null;
  partnerSubCasteStrict: boolean | null;
  partnerEducation: string | null;
  partnerEducationStrict: boolean | null;
  partnerProfession: string | null;
  partnerProfessionStrict: boolean | null;
  partnerFoodHabits: string | null;
  partnerFoodHabitsStrict: boolean | null;
  partnerDrinking: string | null;
  partnerDrinkingStrict: boolean | null;
  partnerSmoking: string | null;
  partnerSmokingStrict: boolean | null;
  partnerCountry: string | null;
  partnerCountryStrict: boolean | null;
  partnerDistrict: string | null;
  partnerDistrictStrict: boolean | null;
  partnerCity: string | null;
}

export interface OwnProfileDTO extends PublicProfileDTO {
  // Verification documents (not visible to public but visible to owner)
  horoscopeDocumentUrl: string | null;
  createdFor: string | null;
  creatorName: string | null;
  creatorRelation: string | null;
}

export function mapToPublicProfileDTO(profile: any, requesterVerified: boolean): PublicProfileDTO {
  const redactedLastName = profile.lastName ? profile.lastName.charAt(0) + "." : "";
  
  const mediaList = (profile.media || []).map((m: any) => {
    // If viewer is unverified, obfuscate photo URLs with a blur filter
    let url = m.url || "";
    let watermarkedUrl = m.watermarkedUrl || "";
    if (!requesterVerified && url.includes("/upload/")) {
      url = url.replace("/upload/", "/upload/e_blur:1000,q_auto,f_auto/");
    }
    if (!requesterVerified && watermarkedUrl.includes("/upload/")) {
      watermarkedUrl = watermarkedUrl.replace("/upload/", "/upload/e_blur:1000,q_auto,f_auto/");
    }
    return {
      id: m.id,
      url,
      watermarkedUrl,
      type: m.type,
      order: m.order,
    };
  });

  return {
    id: profile.id,
    userId: profile.userId,
    firstName: profile.firstName,
    lastName: redactedLastName,
    gender: profile.gender,
    dateOfBirth: profile.dateOfBirth instanceof Date ? profile.dateOfBirth.toISOString() : new Date(profile.dateOfBirth).toISOString(),
    height: profile.height,
    maritalStatus: profile.maritalStatus,
    motherTongue: profile.motherTongue,
    religion: profile.religion,
    caste: profile.caste,
    subCaste: profile.subCaste,
    horoscopeRequired: profile.horoscopeRequired,
    education: profile.education,
    profession: profile.profession,
    company: profile.company,
    incomeBracket: profile.incomeBracket,
    district: profile.district,
    state: profile.state,
    country: profile.country,
    city: profile.city,
    bio: profile.bio,
    voiceIntroduction: requesterVerified ? profile.voiceIntroduction : null,
    verificationStatus: profile.verificationStatus,
    verifiedMobile: profile.verifiedMobile,
    verifiedEmail: profile.verifiedEmail,
    verifiedSelfie: profile.verifiedSelfie,
    profileStrength: profile.profileStrength,
    reputationRating: profile.reputationRating,
    media: mediaList,
    timeOfBirth: profile.timeOfBirth,
    placeOfBirth: profile.placeOfBirth,
    starNakshatram: profile.starNakshatram,
    rasi: profile.rasi,
    dosham: profile.dosham,
    gothram: profile.gothram,
    bodyType: profile.bodyType,
    complexion: profile.complexion,
    physicalStatus: profile.physicalStatus,
    fitnessLevel: profile.fitnessLevel,
    foodHabits: profile.foodHabits,
    smoking: profile.smoking,
    drinking: profile.drinking,
    familyStatus: profile.familyStatus,
    familyType: profile.familyType,
    familyValues: profile.familyValues,
    totalBrothers: profile.totalBrothers,
    marriedBrothers: profile.marriedBrothers,
    totalSisters: profile.totalSisters,
    marriedSisters: profile.marriedSisters,
    familyAssets: profile.familyAssets || [],
    hobbies: profile.hobbies || [],
    partnerAgeMin: profile.partnerAgeMin,
    partnerAgeMax: profile.partnerAgeMax,
    partnerAgeStrict: profile.partnerAgeStrict,
    partnerHeightMin: profile.partnerHeightMin,
    partnerHeightMax: profile.partnerHeightMax,
    partnerHeightStrict: profile.partnerHeightStrict,
    partnerMaritalStatus: profile.partnerMaritalStatus,
    partnerMaritalStatusStrict: profile.partnerMaritalStatusStrict,
    partnerMotherTongue: profile.partnerMotherTongue,
    partnerMotherTongueStrict: profile.partnerMotherTongueStrict,
    partnerPhysicalStatus: profile.partnerPhysicalStatus,
    partnerPhysicalStatusStrict: profile.partnerPhysicalStatusStrict,
    partnerDosham: profile.partnerDosham,
    partnerDoshamStrict: profile.partnerDoshamStrict,
    partnerReligion: profile.partnerReligion,
    partnerReligionStrict: profile.partnerReligionStrict,
    partnerCaste: profile.partnerCaste,
    partnerCasteStrict: profile.partnerCasteStrict,
    partnerSubCaste: profile.partnerSubCaste,
    partnerSubCasteStrict: profile.partnerSubCasteStrict,
    partnerEducation: profile.partnerEducation,
    partnerEducationStrict: profile.partnerEducationStrict,
    partnerProfession: profile.partnerProfession,
    partnerProfessionStrict: profile.partnerProfessionStrict,
    partnerFoodHabits: profile.partnerFoodHabits,
    partnerFoodHabitsStrict: profile.partnerFoodHabitsStrict,
    partnerDrinking: profile.partnerDrinking,
    partnerDrinkingStrict: profile.partnerDrinkingStrict,
    partnerSmoking: profile.partnerSmoking,
    partnerSmokingStrict: profile.partnerSmokingStrict,
    partnerCountry: profile.partnerCountry,
    partnerCountryStrict: profile.partnerCountryStrict,
    partnerDistrict: profile.partnerDistrict,
    partnerDistrictStrict: profile.partnerDistrictStrict,
    partnerCity: profile.partnerCity,
  };
}

export function mapToOwnProfileDTO(profile: any): OwnProfileDTO {
  const base = mapToPublicProfileDTO(profile, true);
  return {
    ...base,
    lastName: profile.lastName, // Owner sees full last name
    horoscopeDocumentUrl: profile.horoscopeDocumentUrl,
    createdFor: profile.createdFor,
    creatorName: profile.creatorName,
    creatorRelation: profile.creatorRelation,
  };
}
