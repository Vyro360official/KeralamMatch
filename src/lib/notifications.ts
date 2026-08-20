/**
 * Notification Subsystem for KeralamMatch
 * Dispatches transactional notifications for registrations, approvals, and moderation
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "KeralamMatch <noreply@keralammatch.com>";

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    if (!process.env.RESEND_API_KEY) return true;
    await resend.emails.send({ from: FROM, to, subject, html });
    return true;
  } catch (err) {
    console.error("[Notification] Email dispatch failed:", err);
    return false;
  }
}

export async function sendRegistrationNotification(email: string, firstName: string, createdFor: string) {
  const isSelf = createdFor === "Self";
  const subject = `Welcome to KeralamMatch, ${firstName}! 🌟`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px;">
      <h2 style="color: #0A1F44; margin-bottom: 8px;">Namaskaram, ${firstName}!</h2>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
        Your matrimonial profile registration ${isSelf ? "" : `(managed for ${createdFor})`} has been submitted successfully to KeralamMatch.
      </p>
      <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 16px; border-radius: 12px; margin: 16px 0;">
        <strong style="color: #92400e; font-size: 13px;">🛡️ Profile Verification Status: PENDING REVIEW</strong>
        <p style="color: #92400e; font-size: 12px; margin: 4px 0 0 0;">
          ${isSelf 
            ? "Our verification team is reviewing your ID documents. Once approved, contact reveal privileges will be activated." 
            : "For safety, our verification team will contact the guardian/creator to verify authorization before contact reveal privileges are activated."}
        </p>
      </div>
      <p style="color: #6b7280; font-size: 12px;">© 2026 KeralamMatch — Kerala's Most Trusted Privacy-First Matrimonial Platform.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendProfileApprovedNotification(email: string, firstName: string) {
  const subject = `✅ Your KeralamMatch Profile is Verified & Approved!`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px;">
      <h2 style="color: #0A1F44; margin-bottom: 8px;">Congratulations, ${firstName}!</h2>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
        Your profile and verification documents have been <strong>verified & approved</strong> by the KeralamMatch administration team.
      </p>
      <div style="background-color: #d1fae5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 12px; margin: 16px 0;">
        <strong style="color: #065f46; font-size: 13px;">🎉 Full Contact Reveal Access Activated</strong>
        <p style="color: #065f46; font-size: 12px; margin: 4px 0 0 0;">
          You can now send and receive contact unlock requests, initiate 24-hour mutual consent reveals, and chat with verified candidates.
        </p>
      </div>
      <p style="color: #6b7280; font-size: 12px;">© 2026 KeralamMatch — Kerala's Most Trusted Matrimonial Platform.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendProfileCorrectionNotification(email: string, firstName: string, reason: string) {
  const subject = `Action Required: Please update your KeralamMatch verification document`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px;">
      <h2 style="color: #0A1F44; margin-bottom: 8px;">Verification Update Needed for ${firstName}</h2>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
        Our administration team reviewed your profile submission and noted that a correction is required:
      </p>
      <div style="background-color: #fee2e2; border: 1px solid #fecaca; padding: 16px; border-radius: 12px; margin: 16px 0;">
        <strong style="color: #991b1b; font-size: 13px;">Reason: ${reason}</strong>
        <p style="color: #991b1b; font-size: 12px; margin: 4px 0 0 0;">
          Please log into your dashboard and re-upload a clear government ID or creator authorization proof to complete verification.
        </p>
      </div>
      <p style="color: #6b7280; font-size: 12px;">© 2026 KeralamMatch — Kerala's Most Trusted Matrimonial Platform.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}
