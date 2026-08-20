"use client";

import React, { useState } from "react";
import { ClipboardList, Shield, Search, Download, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AuditItem {
  id: string;
  admin: string;
  action: string;
  module: "Verification" | "Users" | "Taxonomy" | "Reports" | "Payments" | "System";
  details: string;
  ipAddress: string;
  date: string;
}

const INITIAL_AUDITS: AuditItem[] = [
  { id: "aud-1", admin: "Super Admin", action: "Approved Taxonomy", module: "Taxonomy", details: "Approved custom caste 'Vilakkithala Nair'", ipAddress: "103.24.18.92", date: "Just now" },
  { id: "aud-2", admin: "Super Admin", action: "Verified Profile", module: "Verification", details: "Verified ID documents for Ananya Nair (KM843245)", ipAddress: "103.24.18.92", date: "12 May 2024 10:30 AM" },
  { id: "aud-3", admin: "Moderator 1", action: "Updated User", module: "Users", details: "Updated profile status for Arjun Menon", ipAddress: "49.37.112.4", date: "12 May 2024 09:15 AM" },
  { id: "aud-4", admin: "Moderator 2", action: "Resolved Report", module: "Reports", details: "Investigated and dismissed report #R1234", ipAddress: "122.174.88.19", date: "11 May 2024 06:45 PM" },
  { id: "aud-5", admin: "Billing Admin", action: "Refund Processed", module: "Payments", details: "Refund ₹2,499 issued for payment pay_KM12349", ipAddress: "103.24.18.92", date: "11 May 2024 03:20 PM" },
  { id: "aud-6", admin: "Super Admin", action: "Admin Session Login", module: "System", details: "Admin session authenticated from Kochi, India", ipAddress: "103.24.18.92", date: "11 May 2024 09:00 AM" },
];

export default function AdminAuditPage() {
  const [audits, setAudits] = useState<AuditItem[]>(INITIAL_AUDITS);
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("All");

  const filtered = audits.filter((a) => {
    const matchesSearch =
      a.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ipAddress.includes(searchTerm);

    if (!matchesSearch) return false;
    if (moduleFilter !== "All" && a.module !== moduleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-[#1C1C1E]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1F44]">System Audit Logs</h1>
          <p className="text-xs text-[#636366]">Track all administrative activities, taxonomy updates, and security events</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex rounded-full bg-[#FCFBF7] p-1 border border-[rgba(28,28,30,0.08)] text-xs font-semibold overflow-x-auto">
            {["All", "Taxonomy", "Verification", "Users", "Reports", "Payments", "System"].map((tab) => (
              <button
                key={tab}
                onClick={() => setModuleFilter(tab)}
                className={`px-3.5 py-1.5 rounded-full capitalize transition-all whitespace-nowrap ${
                  moduleFilter === tab ? "bg-[#C81D45] text-white shadow-sm font-bold" : "text-[#636366]"
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
              placeholder="Search action, IP, admin..."
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
                <th className="pb-3">Admin</th>
                <th className="pb-3">Action</th>
                <th className="pb-3">Module</th>
                <th className="pb-3">Audit Details</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(28,28,30,0.06)]">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-[#FCFBF7] transition-colors">
                  <td className="py-3.5 font-bold text-[#0A1F44]">{a.admin}</td>
                  <td className="py-3.5 text-[#636366] font-semibold">{a.action}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      a.module === "Taxonomy"
                        ? "bg-purple-50 text-purple-700"
                        : a.module === "Verification"
                        ? "bg-emerald-50 text-emerald-700"
                        : a.module === "Payments"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-blue-50 text-blue-700"
                    }`}>
                      {a.module}
                    </span>
                  </td>
                  <td className="py-3.5 text-[#636366] font-mono text-[11px] max-w-xs">{a.details}</td>
                  <td className="py-3.5 text-[#8E8E93] font-mono text-[10px]">{a.ipAddress}</td>
                  <td className="py-3.5 text-right text-[#8E8E93]">{a.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
