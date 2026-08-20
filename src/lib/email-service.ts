/**
 * KeralamMatch — Email Service
 * Central email sender using Resend.
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "KeralamMatch <noreply@keralammatch.com>";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://keralammatch.com";

// ─── Base Template ─────────────────────────────────────────────────────────

function baseTemplate(content: string, preheader = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>KeralamMatch</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#0f0f0f 0%,#1a1a1a 100%);padding:28px 40px;text-align:center;">
        <span style="font-size:22px;font-weight:800;color:#d4a853;letter-spacing:-0.5px;">KeralamMatch</span>
        <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px;letter-spacing:0.5px;">Premium Matrimony · Privacy First</div>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:40px;">${content}</td></tr>
      <!-- Footer -->
      <tr><td style="padding:24px 40px;border-top:1px solid #f0f0f0;text-align:center;">
        <p style="font-size:11px;color:#9ca3af;margin:0 0 8px;">© 2026 KeralamMatch Technologies Pvt. Ltd.</p>
        <p style="font-size:11px;color:#9ca3af;margin:0;">
          <a href="${BASE_URL}/privacy" style="color:#9ca3af;">Privacy Policy</a> &nbsp;·&nbsp;
          <a href="${BASE_URL}/terms" style="color:#9ca3af;">Terms</a> &nbsp;·&nbsp;
          <a href="${BASE_URL}/settings" style="color:#9ca3af;">Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function ctaButton(text: string, url: string, color = "#d4a853") {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="background:${color};border-radius:50px;padding:14px 32px;text-align:center;">
      <a href="${url}" style="font-size:14px;font-weight:700;color:#000000;text-decoration:none;">${text}</a>
    </td></tr>
  </table>`;
}

// ─── Welcome Email ─────────────────────────────────────────────────────────

export function welcomeEmail(firstName: string) {
  const html = baseTemplate(`
    <h1 style="font-size:24px;font-weight:800;color:#0f0f0f;margin:0 0 8px;">Welcome, ${firstName}! 🌟</h1>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.6;">Your privacy-first matrimonial journey begins today. We're honoured to be part of something as important as finding your life partner.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:24px;margin-bottom:24px;">
      <tr><td>
        <p style="font-size:13px;font-weight:700;color:#0f0f0f;margin:0 0 16px;">Get started in 3 steps:</p>
        ${["Complete your profile to reach 100% strength", "Upload 3+ photos and a voice introduction", "Complete identity verification to get your verified badge"].map((s, i) => `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div style="background:#d4a853;color:#000;font-weight:800;font-size:11px;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i + 1}</div>
          <span style="font-size:13px;color:#374151;">${s}</span>
        </div>`).join("")}
      </td></tr>
    </table>
    ${ctaButton("Go to Dashboard", `${BASE_URL}/dashboard`)}
    <p style="font-size:12px;color:#9ca3af;margin:16px 0 0;">Questions? Reply to this email or visit our <a href="${BASE_URL}/faq" style="color:#d4a853;">Help Center</a>.</p>
  `, `Welcome to KeralamMatch, ${firstName}!`);
  return { subject: `Welcome to KeralamMatch, ${firstName}! 🌟`, html };
}

// ─── OTP Email ────────────────────────────────────────────────────────────

export function otpEmail(otp: string, expiresMinutes = 10) {
  const html = baseTemplate(`
    <h1 style="font-size:20px;font-weight:800;color:#0f0f0f;margin:0 0 8px;">Your verification code</h1>
    <p style="font-size:14px;color:#6b7280;margin:0 0 32px;">Use this OTP to complete your sign-in. It expires in ${expiresMinutes} minutes.</p>
    <div style="background:#f9fafb;border:2px dashed #d4a853;border-radius:16px;padding:32px;text-align:center;margin-bottom:32px;">
      <span style="font-size:48px;font-weight:900;letter-spacing:12px;color:#0f0f0f;">${otp}</span>
    </div>
    <p style="font-size:13px;color:#9ca3af;background:#fef9f0;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin:0;">
      ⚠️ <strong>Never share this OTP with anyone.</strong> KeralamMatch will never ask for your OTP via phone or email.
    </p>
  `, `Your OTP is ${otp} — expires in ${expiresMinutes} minutes`);
  return { subject: `Your KeralamMatch OTP: ${otp}`, html };
}

// ─── Contact Request Received ──────────────────────────────────────────────

export function contactRequestReceivedEmail(firstName: string, senderName: string) {
  const html = baseTemplate(`
    <h1 style="font-size:20px;font-weight:800;color:#0f0f0f;margin:0 0 8px;">You have a new contact request! 💌</h1>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.6;">Hi ${firstName}, <strong>${senderName}</strong> is interested in connecting with you on KeralamMatch.</p>
    <div style="background:#fef9f0;border-left:4px solid #d4a853;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:24px;">
      <p style="font-size:13px;color:#92400e;margin:0;">⏰ This request expires in <strong>24 hours</strong>. Log in to accept or decline.</p>
    </div>
    ${ctaButton("View Request", `${BASE_URL}/requests`)}
    <p style="font-size:12px;color:#9ca3af;margin:16px 0 0;">If you decline, ${senderName} will not be notified of the reason.</p>
  `, `${senderName} sent you a contact request`);
  return { subject: `${senderName} sent you a contact request on KeralamMatch`, html };
}

// ─── Contact Request Accepted ─────────────────────────────────────────────

export function contactRequestAcceptedEmail(firstName: string, receiverName: string) {
  const html = baseTemplate(`
    <h1 style="font-size:20px;font-weight:800;color:#0f0f0f;margin:0 0 8px;">Great news! 🎉</h1>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.6;">Hi ${firstName}, <strong>${receiverName}</strong> has accepted your contact request! Your 24-hour contact window is now open.</p>
    <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:24px;">
      <p style="font-size:13px;color:#15803d;margin:0;">✅ You can now view ${receiverName}'s phone number and email for the next <strong>24 hours</strong>.</p>
    </div>
    ${ctaButton("Start a Conversation", `${BASE_URL}/chat`)}
    <p style="font-size:12px;color:#9ca3af;margin:16px 0 0;">After 24 hours, the contact details will be automatically hidden. Save them securely if needed.</p>
  `, `${receiverName} accepted your contact request!`);
  return { subject: `${receiverName} accepted your contact request! 🎉`, html };
}

// ─── Contact Window Expiring ──────────────────────────────────────────────

export function contactExpiringEmail(firstName: string, partnerName: string) {
  const html = baseTemplate(`
    <h1 style="font-size:20px;font-weight:800;color:#0f0f0f;margin:0 0 8px;">⏰ Your contact window is closing soon</h1>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.6;">Hi ${firstName}, your contact window with <strong>${partnerName}</strong> expires in <strong>12 hours</strong>.</p>
    <div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:24px;">
      <p style="font-size:13px;color:#c2410c;margin:0;">After this window closes, their contact details will no longer be visible unless they accept a new request.</p>
    </div>
    ${ctaButton("Send a Message Now", `${BASE_URL}/chat`, "#f97316")}
  `, `Your contact window with ${partnerName} closes in 12 hours`);
  return { subject: `⏰ Your contact window with ${partnerName} expires in 12 hours`, html };
}

// ─── Contact Expired ──────────────────────────────────────────────────────

export function contactExpiredEmail(firstName: string, partnerName: string) {
  const html = baseTemplate(`
    <h1 style="font-size:20px;font-weight:800;color:#0f0f0f;margin:0 0 8px;">Your contact window has closed</h1>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.6;">Hi ${firstName}, your 24-hour contact window with <strong>${partnerName}</strong> has expired.</p>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.6;">If you'd like to reconnect, you can send a new contact request at any time.</p>
    ${ctaButton("Send a New Request", `${BASE_URL}/requests`)}
  `, "Your contact window has expired");
  return { subject: `Your contact window with ${partnerName} has closed`, html };
}

// ─── Membership Purchase ──────────────────────────────────────────────────

export function membershipPurchaseEmail(firstName: string, planName: string, amount: number, invoiceId: string, validUntil: string) {
  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="background:linear-gradient(135deg,#d4a853,#c4943a);display:inline-block;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">👑</div>
    </div>
    <h1 style="font-size:22px;font-weight:800;color:#0f0f0f;margin:0 0 8px;text-align:center;">Membership Activated!</h1>
    <p style="font-size:14px;color:#6b7280;margin:0 0 32px;text-align:center;">Hi ${firstName}, your <strong>${planName}</strong> plan is now active.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:24px;margin-bottom:24px;">
      <tr><td>
        ${[
          ["Plan", planName],
          ["Amount Paid", `₹${amount.toLocaleString()}`],
          ["Valid Until", validUntil],
          ["Invoice ID", invoiceId],
        ].map(([label, value]) => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;">
          <span style="font-size:13px;color:#9ca3af;">${label}</span>
          <span style="font-size:13px;font-weight:600;color:#0f0f0f;">${value}</span>
        </div>`).join("")}
      </td></tr>
    </table>
    ${ctaButton("Explore Premium Features", `${BASE_URL}/dashboard`)}
  `, `Your ${planName} membership is now active`);
  return { subject: `Membership Activated — ${planName} Plan · KeralamMatch`, html };
}

// ─── Security Alert ───────────────────────────────────────────────────────

export function securityAlertEmail(firstName: string, ipAddress: string, deviceInfo: string, timestamp: string) {
  const html = baseTemplate(`
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:24px;">
      <h1 style="font-size:18px;font-weight:800;color:#dc2626;margin:0 0 4px;">⚠️ Security Alert</h1>
      <p style="font-size:13px;color:#7f1d1d;margin:0;">A new login was detected on your account.</p>
    </div>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.6;">Hi ${firstName}, we noticed a new sign-in to your KeralamMatch account with the following details:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
      <tr><td>
        ${[["IP Address", ipAddress], ["Device", deviceInfo], ["Time", timestamp]].map(([label, value]) => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;">
          <span style="font-size:13px;color:#9ca3af;">${label}</span>
          <span style="font-size:13px;font-weight:600;color:#0f0f0f;">${value}</span>
        </div>`).join("")}
      </td></tr>
    </table>
    <p style="font-size:13px;color:#6b7280;margin:0 0 20px;">If this was you, no action is needed. If you didn't sign in, secure your account immediately.</p>
    ${ctaButton("Secure My Account", `${BASE_URL}/settings`, "#dc2626")}
  `, "New login detected on your account");
  return { subject: `⚠️ Security Alert — New login to your KeralamMatch account`, html };
}

// ─── Verification Approved ────────────────────────────────────────────────

export function verificationApprovedEmail(firstName: string) {
  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="background:#f0fdf4;display:inline-block;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">✅</div>
    </div>
    <h1 style="font-size:22px;font-weight:800;color:#0f0f0f;margin:0 0 8px;text-align:center;">You're now Verified!</h1>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;text-align:center;line-height:1.6;">Hi ${firstName}, your identity has been verified. Your profile now displays the green Verified badge.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:24px;">
      <tr><td>
        <p style="font-size:13px;font-weight:700;color:#15803d;margin:0 0 12px;">Benefits of being verified:</p>
        ${["Rank higher in search results", "3.4x more contact requests on average", "Green verified shield on your profile", "Higher trust from families you approach"].map(b => `
        <div style="font-size:13px;color:#374151;margin-bottom:8px;">✓ ${b}</div>`).join("")}
      </td></tr>
    </table>
    ${ctaButton("View My Verified Profile", `${BASE_URL}/dashboard`)}
  `, "Your profile is now Verified on KeralamMatch");
  return { subject: `✅ Your profile is now Verified — KeralamMatch`, html };
}

// ─── Send Helper ──────────────────────────────────────────────────────────

async function send(to: string, subject: string, html: string): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_dummy")) {
      console.log(`[Email] Skipped (no key) — To: ${to} | Subject: ${subject}`);
      return true;
    }
    await resend.emails.send({ from: FROM, to, subject, html });
    return true;
  } catch (error) {
    console.error("[Email] Send failed:", error);
    return false;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────

export const EmailService = {
  sendWelcome: (to: string, firstName: string) => {
    const { subject, html } = welcomeEmail(firstName);
    return send(to, subject, html);
  },
  sendOTP: (to: string, otp: string) => {
    const { subject, html } = otpEmail(otp);
    return send(to, subject, html);
  },
  sendContactRequest: (to: string, firstName: string, senderName: string) => {
    const { subject, html } = contactRequestReceivedEmail(firstName, senderName);
    return send(to, subject, html);
  },
  sendContactAccepted: (to: string, firstName: string, receiverName: string) => {
    const { subject, html } = contactRequestAcceptedEmail(firstName, receiverName);
    return send(to, subject, html);
  },
  sendContactExpiring: (to: string, firstName: string, partnerName: string) => {
    const { subject, html } = contactExpiringEmail(firstName, partnerName);
    return send(to, subject, html);
  },
  sendContactExpired: (to: string, firstName: string, partnerName: string) => {
    const { subject, html } = contactExpiredEmail(firstName, partnerName);
    return send(to, subject, html);
  },
  sendMembershipPurchase: (to: string, firstName: string, planName: string, amount: number, invoiceId: string, validUntil: string) => {
    const { subject, html } = membershipPurchaseEmail(firstName, planName, amount, invoiceId, validUntil);
    return send(to, subject, html);
  },
  sendSecurityAlert: (to: string, firstName: string, ipAddress: string, deviceInfo: string, timestamp: string) => {
    const { subject, html } = securityAlertEmail(firstName, ipAddress, deviceInfo, timestamp);
    return send(to, subject, html);
  },
  sendVerificationApproved: (to: string, firstName: string) => {
    const { subject, html } = verificationApprovedEmail(firstName);
    return send(to, subject, html);
  },
};
