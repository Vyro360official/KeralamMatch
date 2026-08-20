"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2, XCircle, Edit3, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("KeralamMatch");
  const [siteEmail, setSiteEmail] = useState("support@keralammatch.com");
  const [contactNumber, setContactNumber] = useState("+91 9400 123 456");
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  // Taxonomy queue state
  const [taxonomyQueue, setTaxonomyQueue] = useState<any[]>([]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/taxonomy")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.items) setTaxonomyQueue(d.items);
      })
      .catch(() => {});
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleModerate = async (id: string, action: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/admin/taxonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        setTaxonomyQueue((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: action } : item))
        );
        setActionSuccess(`Item ${id} marked as ${action}. Audit log created.`);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-[#1C1C1E]">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F44]">Admin Settings & Taxonomy Moderation</h1>
        <p className="text-xs text-[#636366]">Manage platform configurations, system parameters, and user-submitted communities/towns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Category Menu */}
        <aside className="md:col-span-4">
          <div className="bg-white rounded-3xl p-4 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-1">
            {[
              { id: "general", label: "General Settings" },
              { id: "taxonomy", label: "Taxonomy Moderation (Castes & Towns)" },
              { id: "site", label: "Site & SEO Settings" },
              { id: "email", label: "Email & Notifications" },
              { id: "payment", label: "Payment & Pricing Plans" },
              { id: "security", label: "Security & Rate Limiting" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === cat.id
                    ? "bg-[#C81D45] text-white shadow-sm"
                    : "text-[#636366] hover:bg-[#FCFBF7]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="md:col-span-8">
          {activeTab === "general" && (
            <form onSubmit={handleSave} className="bg-white rounded-3xl p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-6">
              <h2 className="text-base font-bold text-[#0A1F44]">General Platform Settings</h2>

              {saved && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-semibold">
                  Settings saved successfully ✓
                </div>
              )}

              <div className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-2">Site Name</label>
                  <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="rounded-full h-11" />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-2">Support Email</label>
                  <Input value={siteEmail} onChange={(e) => setSiteEmail(e.target.value)} className="rounded-full h-11" />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-2">Contact Number</label>
                  <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="rounded-full h-11" />
                </div>
              </div>

              <div className="pt-6 border-t border-[rgba(28,28,30,0.08)] flex justify-end space-x-3">
                <button type="submit" className="px-6 py-2.5 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-md">
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === "taxonomy" && (
            <div className="bg-white rounded-3xl p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0A1F44]">User-Submitted Taxonomy Queue</h2>
                  <p className="text-xs text-[#636366] mt-0.5">Approve, edit or reject custom castes, subcastes, and towns submitted during onboarding</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin Gated</span>
                </div>
              </div>

              {actionSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-semibold">
                  {actionSuccess}
                </div>
              )}

              <div className="space-y-3">
                {taxonomyQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {item.type}
                        </span>
                        <span className="text-xs font-bold text-[#0A1F44]">{item.name}</span>
                        <span className="text-xs text-[#8E8E93]">({item.category})</span>
                      </div>
                      <span className="text-[10px] text-[#8E8E93] block mt-1">Submitted by User: {item.submittedBy}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          item.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.status}
                      </span>

                      {item.status === "PENDING" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleModerate(item.id, "APPROVED")}
                            className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleModerate(item.id, "REJECTED")}
                            className="px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold flex items-center gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab !== "general" && activeTab !== "taxonomy" && (
            <div className="bg-white rounded-3xl p-8 border border-[rgba(28,28,30,0.08)] shadow-sm text-xs text-[#636366]">
              <h2 className="text-base font-bold text-[#0A1F44] capitalize mb-2">{activeTab} Settings</h2>
              <p>System configuration parameters are configured via environment variables for maximum production security.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
