import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_dummy";

// Initialize Resend Client
export const resend = new Resend(RESEND_API_KEY);
