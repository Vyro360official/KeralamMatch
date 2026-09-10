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
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] dark:bg-[#07132B] text-[#1C1C1E] dark:text-white transition-colors">
      <Header />
      <main className="flex-grow flex items-center justify-center px-6 py-16">
        <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-10 sm:p-14 text-center max-w-md w-full flex flex-col items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <XCircle className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0A1F44] dark:text-white mb-2">Payment Cancelled</h1>
            <p className="text-xs text-[#636366] dark:text-slate-400 leading-relaxed">
              No charge was made. You can return to the pricing page and choose a plan whenever you're ready.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/pricing"
              className="px-6 py-2.5 text-xs font-bold rounded-full bg-gradient-to-r from-[#FF1475] to-[#C81D45] text-white shadow-sm hover:opacity-95 transition-all"
            >
              View Plans
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 text-xs font-bold rounded-full border border-slate-200 dark:border-slate-700 text-[#0A1F44] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
      <Footer variant="dashboard" />
    </div>
  );
}
