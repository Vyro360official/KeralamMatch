import { z } from "zod";
import { Gender } from "@prisma/client";

export const profileCreateSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters.").max(50),
  lastName: z.string().min(1, "Last name must be at least 1 character.").max(50),
  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: "Please select a valid gender." }),
  }),
  dateOfBirth: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age >= 18;
  }, "You must be at least 18 years old to register."),
  height: z.number().min(100, "Height must be at least 100 cm.").max(250, "Height cannot exceed 250 cm."),
  maritalStatus: z.string().min(1, "Marital status is required."),
  motherTongue: z.string().default("Malayalam"),
  
  religion: z.string().min(1, "Religion is required."),
  caste: z.string().optional(),
  subCaste: z.string().optional(),
  horoscopeRequired: z.boolean().default(false),
  
  education: z.string().min(1, "Education is required."),
  profession: z.string().min(1, "Profession is required."),
  company: z.string().optional(),
  incomeBracket: z.string().min(1, "Income bracket is required."),
  
  district: z.string().min(1, "District is required."),
  state: z.string().default("Kerala"),
  country: z.string().default("India"),
  city: z.string().min(1, "City is required."),
  
  bio: z.string().min(10, "Bio must be at least 10 characters.").max(1000),
});

export const profileSavePartialSchema = profileCreateSchema.partial();

// ── Step-Specific Validation Schemas for Onboarding Wizard ────────────────

export const step0Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters.").max(50),
  lastName: z.string().min(1, "Last name must be at least 1 character.").max(50),
  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: "Please select a valid gender." }),
  }),
  dateOfBirth: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age >= 18;
  }, "You must be at least 18 years old to register."),
});

export const step1Schema = z.object({
  height: z.number().min(100, "Height must be at least 100 cm.").max(250, "Height cannot exceed 250 cm."),
  maritalStatus: z.string().min(1, "Marital status is required."),
  religion: z.string().min(1, "Religion is required."),
});

export const step2Schema = z.object({
  caste: z.string().optional(),
  subCaste: z.string().optional(),
});

export const step3Schema = z.object({
  education: z.string().min(1, "Education qualification is required."),
});

export const step4Schema = z.object({
  profession: z.string().min(1, "Profession is required."),
  company: z.string().optional(),
  incomeBracket: z.string().min(1, "Income bracket is required."),
});

export const step5Schema = z.object({
  district: z.string().min(1, "District is required."),
  city: z.string().min(1, "City is required."),
});

export const step6Schema = z.object({
  horoscopeRequired: z.boolean().optional(),
});

export const step7Schema = z.object({
  bio: z.string().min(10, "Bio description must be at least 10 characters.").max(1000),
});

export function validateStepInput(stepIndex: number, input: any) {
  if (stepIndex === 0) return step0Schema.safeParse(input);
  if (stepIndex === 1) return step1Schema.safeParse(input);
  if (stepIndex === 2) return step2Schema.safeParse(input);
  if (stepIndex === 3) return step3Schema.safeParse(input);
  if (stepIndex === 4) return step4Schema.safeParse(input);
  if (stepIndex === 5) return step5Schema.safeParse(input);
  if (stepIndex === 6) return step6Schema.safeParse(input);
  if (stepIndex === 7) return step7Schema.safeParse(input);
  return profileSavePartialSchema.safeParse(input);
}

export type ProfileCreateInputZod = z.infer<typeof profileCreateSchema>;
