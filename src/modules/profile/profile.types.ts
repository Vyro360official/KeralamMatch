import { Gender, VerificationStatus } from "@prisma/client";

export type ProfileCreatedFor = "Self" | "Son" | "Daughter" | "Brother" | "Sister" | "Friend" | "Relative" | "Son (Parent)" | "Daughter (Parent)" | "Brother (Sibling)" | "Sister (Sibling)";

export interface CreatorDetails {
  createdFor: ProfileCreatedFor | string;
  creatorName?: string;
  creatorPhone?: string;
  creatorRelation?: string;
  creatorDocumentUrl?: string;
}

export interface ProfileCreateInput extends Partial<CreatorDetails> {
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  height: number;
  maritalStatus: string;
  motherTongue?: string;
  
  religion: string;
  caste?: string;
  subCaste?: string;
  horoscopeRequired?: boolean;
  
  education: string;
  profession: string;
  company?: string;
  incomeBracket: string;
  
  district: string;
  state?: string;
  country?: string;
  city: string;
  
  bio: string;
  voiceIntroduction?: string;

  // Extended Matrimonial Attributes
  starNakshatram?: string;
  rasi?: string;
  dosham?: string;
  bodyType?: string;
  complexion?: string;
  physicalStatus?: string;
  fitnessLevel?: string;
  foodHabits?: string;
  smoking?: string;
  drinking?: string;
  familyStatus?: string;
  familyType?: string;
  familyValues?: string;
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  totalBrothers?: number;
  marriedBrothers?: number;
  totalSisters?: number;
  marriedSisters?: number;
  familyAssets?: string[];
  hobbies?: string[];

  // Complete 3-Tier Partner Preferences
  partnerAgeMin?: number;
  partnerAgeMax?: number;
  partnerAgeStrict?: boolean;
  partnerHeightMin?: number;
  partnerHeightMax?: number;
  partnerHeightStrict?: boolean;
  partnerMaritalStatus?: string;
  partnerMaritalStatusStrict?: boolean;
  partnerMotherTongue?: string;
  partnerMotherTongueStrict?: boolean;
  partnerPhysicalStatus?: string;
  partnerPhysicalStatusStrict?: boolean;
  partnerDosham?: string;
  partnerDoshamStrict?: boolean;
  partnerReligion?: string;
  partnerReligionStrict?: boolean;
  partnerCaste?: string;
  partnerCasteStrict?: boolean;
  partnerSubCaste?: string;
  partnerSubCasteStrict?: boolean;
  partnerEducation?: string;
  partnerEducationStrict?: boolean;
  partnerProfession?: string;
  partnerProfessionStrict?: boolean;
  partnerFoodHabits?: string;
  partnerFoodHabitsStrict?: boolean;
  partnerDrinking?: string;
  partnerDrinkingStrict?: boolean;
  partnerSmoking?: string;
  partnerSmokingStrict?: boolean;
  partnerCountry?: string;
  partnerCountryStrict?: boolean;
  partnerDistrict?: string;
  partnerDistrictStrict?: boolean;
  partnerCity?: string;
}

export interface ProfileDetails extends Partial<CreatorDetails> {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  age: number;
  height: number;
  maritalStatus: string;
  motherTongue: string;
  religion: string;
  caste: string | null;
  subCaste: string | null;
  education: string;
  profession: string;
  company: string | null;
  incomeBracket: string;
  district: string;
  city: string;
  bio: string;
  verificationStatus: VerificationStatus;
  voiceIntroduction?: string | null;

  // Extended Matrimonial Attributes
  starNakshatram?: string;
  rasi?: string;
  dosham?: string;
  bodyType?: string;
  complexion?: string;
  physicalStatus?: string;
  fitnessLevel?: string;
  foodHabits?: string;
  smoking?: string;
  drinking?: string;
  familyStatus?: string;
  familyType?: string;
  familyValues?: string;
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  totalBrothers?: number;
  marriedBrothers?: number;
  totalSisters?: number;
  marriedSisters?: number;
  familyAssets?: string[];
  hobbies?: string[];

  // Partner Preferences
  partnerAgeMin?: number;
  partnerAgeMax?: number;
  partnerAgeStrict?: boolean;
  partnerHeightMin?: number;
  partnerHeightMax?: number;
  partnerHeightStrict?: boolean;
  partnerMaritalStatus?: string;
  partnerMaritalStatusStrict?: boolean;
  partnerMotherTongue?: string;
  partnerMotherTongueStrict?: boolean;
  partnerPhysicalStatus?: string;
  partnerPhysicalStatusStrict?: boolean;
  partnerDosham?: string;
  partnerDoshamStrict?: boolean;
  partnerReligion?: string;
  partnerReligionStrict?: boolean;
  partnerCaste?: string;
  partnerCasteStrict?: boolean;
  partnerSubCaste?: string;
  partnerSubCasteStrict?: boolean;
  partnerEducation?: string;
  partnerEducationStrict?: boolean;
  partnerProfession?: string;
  partnerProfessionStrict?: boolean;
  partnerFoodHabits?: string;
  partnerFoodHabitsStrict?: boolean;
  partnerDrinking?: string;
  partnerDrinkingStrict?: boolean;
  partnerSmoking?: string;
  partnerSmokingStrict?: boolean;
  partnerCountry?: string;
  partnerCountryStrict?: boolean;
  partnerDistrict?: string;
  partnerDistrictStrict?: boolean;
  partnerCity?: string;
}
