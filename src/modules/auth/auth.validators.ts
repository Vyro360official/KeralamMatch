import { z } from "zod";

export const loginWithTokenSchema = z.object({
  idToken: z.string({
    required_error: "Firebase authentication token is required.",
  }).min(1, "Token cannot be empty."),
});

export type LoginWithTokenInput = z.infer<typeof loginWithTokenSchema>;
