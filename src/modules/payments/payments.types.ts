export interface RazorpayOrderResult {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
}

export interface PaymentVerificationInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
