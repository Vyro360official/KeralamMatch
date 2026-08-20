import { NextRequest, NextResponse } from "next/server";
import { PaymentsRepository } from "@/modules/payments/payments.repository";
import { PaymentsService } from "@/modules/payments/payments.service";

const paymentsRepo = new PaymentsRepository();
const paymentsService = new PaymentsService(paymentsRepo);

/**
 * API Route Handler for receiving Razorpay checkout webhook notifications
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Read raw text body and signature header
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature header." }, { status: 400 });
    }

    // 2. Process payment fulfillment
    const success = await paymentsService.processWebhookEvent(rawBody, signature);

    if (success) {
      return NextResponse.json({ status: "processed" }, { status: 200 });
    } else {
      return NextResponse.json({ status: "skipped_or_duplicate" }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Razorpay webhook endpoint encountered a failure:", error);
    return NextResponse.json(
      { error: error.message || "INTERNAL_WEBHOOK_FAILURE" },
      { status: 500 }
    );
  }
}
