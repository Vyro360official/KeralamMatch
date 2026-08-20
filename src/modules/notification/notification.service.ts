import { INotificationRepository } from "./notification.repository";
import { resend } from "@/lib/resend";
import { prisma } from "@/lib/db";

export class NotificationService {
  constructor(private notificationRepo: INotificationRepository) {}

  /**
   * Dispatches a unified notification to a user.
   * Respects user-defined notification preferences (In-App, Email, Push, SMS).
   */
  async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    link?: string
  ): Promise<void> {
    // 1. Fetch user data and settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        notificationSettings: true,
      },
    });

    if (!user) return;

    const settings = user.notificationSettings;
    const hasSettings = !!settings;

    // 2. Dispatch In-App Notification (Default enabled)
    if (!hasSettings || settings.inApp) {
      await this.notificationRepo.createNotification(userId, title, message, type, link);
    }

    // 3. Dispatch Email Queue (Default enabled)
    if (!hasSettings || settings.email) {
      const emailBody = this.buildHtmlEmailTemplate(title, message, link);
      await this.notificationRepo.enqueueEmail(user.email, title, emailBody);
    }

    // 4. Dispatch PWA Push notification (Default enabled)
    if (!hasSettings || settings.push) {
      await this.notificationRepo.enqueuePushOrSms(userId, title, message, "PUSH");
    }
  }

  /**
   * Asynchronously processes pending jobs in the EmailQueue.
   * Delivers emails using the Resend integration.
   */
  async processEmailQueue(): Promise<{ sent: number; failed: number }> {
    const pendingJobs = await prisma.emailQueue.findMany({
      where: { status: "PENDING" },
      take: 10, // Process in batches
    });

    let sent = 0;
    let failed = 0;

    for (const job of pendingJobs) {
      try {
        // Mark job processing
        await prisma.emailQueue.update({
          where: { id: job.id },
          data: { status: "PROCESSING" },
        });

        // Send via Resend client
        // Standard sandbox accounts must use onboarding@resend.dev to test successfully
        await resend.emails.send({
          from: "KeralamMatch <onboarding@resend.dev>",
          to: job.recipient,
          subject: job.subject,
          html: job.bodyHtml,
        });

        // Update to sent
        await prisma.emailQueue.update({
          where: { id: job.id },
          data: {
            status: "SENT",
            sentAt: new Date(),
          },
        });
        sent++;
      } catch (error: any) {
        console.error(`Email delivery failed for job ID ${job.id}:`, error);

        const newRetries = job.retries + 1;
        const finalStatus = newRetries >= 3 ? "FAILED" : "PENDING"; // Retry 3 times max

        await prisma.emailQueue.update({
          where: { id: job.id },
          data: {
            status: finalStatus as any,
            retries: newRetries,
            errorLog: error.message || "UNKNOWN_DELIVERY_ERROR",
          },
        });
        failed++;
      }
    }

    return { sent, failed };
  }

  /**
   * Builds a premium Apple-styled HTML template for transaction emails.
   */
  private buildHtmlEmailTemplate(title: string, bodyText: string, actionUrl?: string): string {
    const actionButton = actionUrl
      ? `<div style="margin-top: 32px; text-align: center;">
           <a href="${actionUrl}" style="background-color: #0A369D; color: #ffffff; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(10,54,157,0.15);">View Action</a>
         </div>`
      : "";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #FCFBF7;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 580px;
            background-color: #ffffff;
            border-radius: 20px;
            padding: 40px;
            margin: 0 auto;
            border: 1px solid rgba(28,28,30,0.06);
            box-shadow: 0 4px 30px rgba(0,0,0,0.02);
          }
          .logo {
            font-size: 20px;
            font-weight: bold;
            color: #0A369D;
            text-align: center;
            margin-bottom: 32px;
            letter-spacing: -0.5px;
          }
          .title {
            font-size: 22px;
            font-weight: 700;
            color: #1C1C1E;
            margin-bottom: 16px;
            line-height: 1.3;
          }
          .content {
            font-size: 16px;
            color: #636366;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .footer {
            font-size: 12px;
            color: #8E8E93;
            text-align: center;
            margin-top: 48px;
            border-top: 1px solid rgba(28,28,30,0.06);
            padding-top: 24px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">KeralamMatch</div>
          <div class="title">${title}</div>
          <div class="content">${bodyText}</div>
          ${actionButton}
          <div class="footer">
            © 2026 KeralamMatch. All rights reserved.<br>
            Help people find their life partner safely, privately, and beautifully.
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
