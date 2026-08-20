import Link from "next/link";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { XCircle } from "lucide-react";

export const metadata = {
  title: "Payment Cancelled | KeralamMatch",
  description: "Your payment was cancelled. No charge was made.",
};

export default function PaymentCancelPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <Header />
      <main className="flex-grow flex items-center justify-center px-6">
        <div className="premium-card p-16 text-center max-w-md w-full flex flex-col items-center gap-6">
          <XCircle className="h-14 w-14 text-accent-rose" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-2">Payment Cancelled</h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              No charge was made. You can return to the pricing page and choose a plan whenever you're ready.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/pricing">
              <button className="btn-primary px-6 py-2.5 text-sm rounded-full">View Plans</button>
            </Link>
            <Link href="/dashboard">
              <button className="btn-outline px-6 py-2.5 text-sm rounded-full">Go to Dashboard</button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
