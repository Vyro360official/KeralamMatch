"use client";

import React, { useState } from "react";
import { CreditCard, ArrowUpRight, CheckCircle2, Search, FileText, RefreshCw, X, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TransactionItem {
  id: string;
  user: string;
  userEmail: string;
  plan: string;
  amount: string;
  amountNumber: number;
  paymentId: string;
  gateway: string;
  status: "Success" | "Refunded" | "Failed";
  date: string;
}

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  { id: "tx-1", user: "Ananya Nair", userEmail: "ananya@gmail.com", plan: "Gold Membership", amount: "₹2,499", amountNumber: 2499, paymentId: "pay_KM12345", gateway: "Razorpay (UPI)", status: "Success", date: "12 May 2024" },
  { id: "tx-2", user: "Vishnu Prasad", userEmail: "vishnu@gmail.com", plan: "Platinum Membership", amount: "₹4,999", amountNumber: 4999, paymentId: "pay_KM12346", gateway: "Razorpay (Card)", status: "Success", date: "12 May 2024" },
  { id: "tx-3", user: "Meera Unni", userEmail: "meera@gmail.com", plan: "Silver Membership", amount: "₹1,299", amountNumber: 1299, paymentId: "pay_KM12347", gateway: "Razorpay (NetBanking)", status: "Success", date: "11 May 2024" },
  { id: "tx-4", user: "Arjun Menon", userEmail: "arjun@gmail.com", plan: "Gold Membership", amount: "₹2,499", amountNumber: 2499, paymentId: "pay_KM12348", gateway: "Razorpay (UPI)", status: "Success", date: "10 May 2024" },
  { id: "tx-5", user: "Devika Suresh", userEmail: "devika@gmail.com", plan: "Gold Membership", amount: "₹2,499", amountNumber: 2499, paymentId: "pay_KM12349", gateway: "Razorpay (UPI)", status: "Refunded", date: "10 May 2024" },
];

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>(INITIAL_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Success" | "Refunded">("All");
  const [viewingReceipt, setViewingReceipt] = useState<TransactionItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRefund = (id: string) => {
    if (!confirm("Are you sure you want to process a full refund for this payment?")) return;
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Refunded" } : t))
    );
    showToast(`Refund processed for transaction ${id}. Razorpay webhook triggered.`);
    setViewingReceipt(null);
  };

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.plan.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    return true;
  });

  const totalRevenue = transactions
    .filter((t) => t.status === "Success")
    .reduce((acc, t) => acc + t.amountNumber, 0);

  return (
    <div className="space-y-6 text-[#1C1C1E]">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F44]">Payments & Revenue Overview</h1>
        <p className="text-xs text-[#636366]">Monitor transactions, membership plans, invoices and refunds</p>
      </div>

      {toast && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-2">
          <span className="text-xs text-[#636366] font-semibold">Total Net Revenue</span>
          <div className="text-2xl font-extrabold text-[#0A1F44]">₹{totalRevenue.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-600 font-bold">▲ Live Razorpay Sync</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-2">
          <span className="text-xs text-[#636366] font-semibold">Successful Payments</span>
          <div className="text-2xl font-extrabold text-[#0A1F44]">
            {transactions.filter((t) => t.status === "Success").length}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">100% Settled</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-2">
          <span className="text-xs text-[#636366] font-semibold">Refunded Amount</span>
          <div className="text-2xl font-extrabold text-[#0A1F44]">
            ₹{transactions.filter((t) => t.status === "Refunded").reduce((a, t) => a + t.amountNumber, 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-amber-600 font-bold">Handled safely</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-2">
          <span className="text-xs text-[#636366] font-semibold">Payment Gateway</span>
          <div className="text-xl font-bold text-[#0A1F44]">Razorpay LIVE</div>
          <span className="text-[10px] text-emerald-600 font-bold">Webhook Active ✓</span>
        </div>
      </div>

      {/* Transactions Table & Filters */}
      <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex rounded-full bg-[#FCFBF7] p-1 border border-[rgba(28,28,30,0.08)] text-xs font-semibold max-w-xs">
            {(["All", "Success", "Refunded"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`flex-1 py-2 px-3 rounded-full capitalize transition-all ${
                  statusFilter === tab ? "bg-[#C81D45] text-white shadow-sm font-bold" : "text-[#636366]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93]" />
            <input
              type="text"
              placeholder="Search user, payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] pl-10 pr-4 text-xs font-medium focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(28,28,30,0.08)] text-[#8E8E93] uppercase text-[10px] font-bold">
                <th className="pb-3">Candidate</th>
                <th className="pb-3">Membership Plan</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Gateway / Method</th>
                <th className="pb-3">Payment ID</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(28,28,30,0.06)]">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-[#FCFBF7] transition-colors">
                  <td className="py-3.5 font-bold text-[#0A1F44]">
                    <div>{t.user}</div>
                    <div className="text-[10px] text-[#8E8E93] font-normal">{t.userEmail}</div>
                  </td>
                  <td className="py-3.5 text-[#636366]">{t.plan}</td>
                  <td className="py-3.5 font-bold text-[#0A1F44]">{t.amount}</td>
                  <td className="py-3.5 text-[#636366]">{t.gateway}</td>
                  <td className="py-3.5 text-[#8E8E93] font-mono">{t.paymentId}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      t.status === "Success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-[#8E8E93]">{t.date}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => setViewingReceipt(t)}
                      className="px-3 py-1 rounded-full border border-[rgba(28,28,30,0.12)] text-[11px] font-bold text-[#0A1F44] hover:bg-white inline-flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── VIEW RECEIPT / INVOICE MODAL ─────────────────────────────────── */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[rgba(28,28,30,0.12)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0A1F44]">Transaction Invoice</h3>
                <p className="text-xs text-[#636366]">Receipt ID: {viewingReceipt.paymentId}</p>
              </div>
              <button onClick={() => setViewingReceipt(null)} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-[#FCFBF7] p-5 rounded-2xl border border-[rgba(28,28,30,0.06)] text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Customer Name:</span>
                <span className="font-bold text-[#0A1F44]">{viewingReceipt.user}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Purchased Plan:</span>
                <span className="font-bold text-[#C81D45]">{viewingReceipt.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Amount Paid:</span>
                <span className="font-extrabold text-[#0A1F44]">{viewingReceipt.amount} (Incl. GST)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Gateway & Method:</span>
                <span className="font-semibold text-[#0A1F44]">{viewingReceipt.gateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Payment Status:</span>
                <span className={`font-bold ${viewingReceipt.status === "Success" ? "text-emerald-700" : "text-red-600"}`}>
                  {viewingReceipt.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Transaction Date:</span>
                <span className="font-semibold text-[#0A1F44]">{viewingReceipt.date}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              {viewingReceipt.status === "Success" ? (
                <button
                  onClick={() => handleRefund(viewingReceipt.id)}
                  className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Issue Refund</span>
                </button>
              ) : (
                <span className="text-xs text-red-600 font-semibold">Refunded ✓</span>
              )}

              <button
                onClick={() => setViewingReceipt(null)}
                className="px-5 py-2 rounded-full bg-[#0A1F44] text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
