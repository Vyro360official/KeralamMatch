"use client";

import React, { useState } from "react";
import {
  ShieldCheck, Check, X, Eye, FileText, Camera, CheckCircle2, XCircle,
  AlertCircle, Phone, User, Users, RefreshCw, AlertTriangle
} from "lucide-react";

interface VerificationItem {
  id: string;
  name: string;
  profileId: string;
  district: string;
  createdFor: "Self" | "Son (Parent)" | "Daughter (Parent)" | "Brother (Sibling)" | "Sister (Sibling)" | "Relative";
  creatorName?: string;
  creatorPhone?: string;
  creatorDocUrl?: string;
  docsUploaded: string;
  docType: string;
  docNumber: string;
  status: "Pending" | "Reviewed" | "Approved" | "Correction Required";
  submittedOn: string;
  selfieUrl: string;
  docUrl: string;
}

const INITIAL_VERIFICATIONS: VerificationItem[] = [
  {
    id: "ver-1",
    name: "Nagarajan Pillai",
    profileId: "KM944710",
    district: "Thiruvananthapuram, Kerala",
    createdFor: "Son (Parent)",
    creatorName: "G. Parameswaran Pillai (Father)",
    creatorPhone: "+91 94471 88990",
    creatorDocUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600",
    docsUploaded: "4/4 Uploaded",
    docType: "Aadhaar Card (UIDAI)",
    docNumber: "XXXX-XXXX-8821",
    status: "Pending",
    submittedOn: "Just now",
    selfieUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    docUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600",
  },
  {
    id: "ver-2",
    name: "Ananya Nair",
    profileId: "KM843245",
    district: "Kannur, Kerala",
    createdFor: "Self",
    docsUploaded: "4/4 Uploaded",
    docType: "Aadhaar Card (UIDAI)",
    docNumber: "XXXX-XXXX-4589",
    status: "Pending",
    submittedOn: "12 May 2024",
    selfieUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    docUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600",
  },
  {
    id: "ver-3",
    name: "Vishnu Prasad",
    profileId: "KM112345",
    district: "Thrissur, Kerala",
    createdFor: "Brother (Sibling)",
    creatorName: "Sanjay Prasad (Elder Brother)",
    creatorPhone: "+91 98470 33445",
    creatorDocUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600",
    docsUploaded: "3/4 Uploaded",
    docType: "Indian Passport",
    docNumber: "Z5892341",
    status: "Pending",
    submittedOn: "11 May 2024",
    selfieUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    docUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600",
  },
  {
    id: "ver-4",
    name: "Devika Suresh",
    profileId: "KM765432",
    district: "Kozhikode, Kerala",
    createdFor: "Self",
    docsUploaded: "4/4 Uploaded",
    docType: "Aadhaar Card",
    docNumber: "XXXX-XXXX-7712",
    status: "Reviewed",
    submittedOn: "10 May 2024",
    selfieUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
    docUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600",
  },
];

export default function AdminVerificationPage() {
  const [verifications, setVerifications] = useState<VerificationItem[]>(INITIAL_VERIFICATIONS);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "third_party" | "reviewed" | "approved" | "corrections">("all");
  const [toast, setToast] = useState<string | null>(null);

  // Modals
  const [viewingItem, setViewingItem] = useState<VerificationItem | null>(null);
  const [reviewingItem, setReviewingItem] = useState<VerificationItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("Blurry document image");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDecision = (id: string, newStatus: "Approved" | "Correction Required") => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );
    showToast(
      newStatus === "Approved"
        ? `Profile ${reviewingItem?.name || id} APPROVED. Contact reveal rights unlocked & notification sent.`
        : `Correction requested for profile ${reviewingItem?.name || id}. Re-submission notification dispatched.`
    );
    setReviewingItem(null);
    setViewingItem(null);
  };

  const filtered = verifications.filter((v) => {
    if (activeTab === "pending") return v.status === "Pending";
    if (activeTab === "third_party") return v.createdFor !== "Self";
    if (activeTab === "reviewed") return v.status === "Reviewed";
    if (activeTab === "approved") return v.status === "Approved";
    if (activeTab === "corrections") return v.status === "Correction Required";
    return true;
  });

  return (
    <div className="space-y-6 text-[#1C1C1E]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1F44]">Profile & Creator Verification Queue</h1>
          <p className="text-xs text-[#636366]">Review identity proofs, verify third-party creator authorizations, and unlock contact access</p>
        </div>
      </div>

      {toast && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-6">
        <div className="flex rounded-full bg-[#FCFBF7] p-1 border border-[rgba(28,28,30,0.08)] text-xs font-semibold overflow-x-auto">
          {(["all", "pending", "third_party", "reviewed", "approved", "corrections"] as const).map((tab) => {
            const count =
              tab === "all"
                ? verifications.length
                : tab === "pending"
                ? verifications.filter((v) => v.status === "Pending").length
                : tab === "third_party"
                ? verifications.filter((v) => v.createdFor !== "Self").length
                : tab === "reviewed"
                ? verifications.filter((v) => v.status === "Reviewed").length
                : tab === "approved"
                ? verifications.filter((v) => v.status === "Approved").length
                : verifications.filter((v) => v.status === "Correction Required").length;

            const label =
              tab === "all"
                ? "All"
                : tab === "pending"
                ? "Pending"
                : tab === "third_party"
                ? "Parents/Siblings/Relatives"
                : tab === "reviewed"
                ? "In Review"
                : tab === "approved"
                ? "Approved"
                : "Corrections";

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full capitalize transition-all whitespace-nowrap ${
                  activeTab === tab ? "bg-[#C81D45] text-white shadow-sm font-bold" : "text-[#636366]"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Verification Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#8E8E93] bg-[#FCFBF7] rounded-2xl">
              No verification requests in this tab.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center space-x-4">
                  <img
                    src={item.selfieUrl}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover border border-[rgba(28,28,30,0.08)] flex-shrink-0 shadow-sm"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#0A1F44]">{item.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === "Approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "Correction Required"
                            ? "bg-red-100 text-red-800"
                            : item.status === "Reviewed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 font-bold text-[10px] border border-purple-200">
                        {item.createdFor}
                      </span>
                    </div>

                    <div className="text-xs text-[#636366]">ID: {item.profileId} · {item.district}</div>

                    {/* Creator Callout if created by parents/siblings */}
                    {item.createdFor !== "Self" && item.creatorName && (
                      <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-950 flex flex-wrap items-center gap-2 mt-1">
                        <Users className="h-3.5 w-3.5 text-amber-700 flex-shrink-0" />
                        <span className="font-semibold">Creator: {item.creatorName}</span>
                        <span className="text-amber-800 font-mono">({item.creatorPhone})</span>
                        <a
                          href={`tel:${item.creatorPhone}`}
                          className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold hover:bg-amber-300 inline-flex items-center gap-1"
                        >
                          <Phone className="h-2.5 w-2.5" />
                          <span>Call Creator</span>
                        </a>
                      </div>
                    )}

                    <div className="text-[10px] text-[#8E8E93]">
                      Proof: <span className="font-semibold text-[#0A1F44]">{item.docType}</span> ({item.docsUploaded}) · Submitted {item.submittedOn}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end lg:self-auto flex-shrink-0">
                  <button
                    onClick={() => setViewingItem(item)}
                    className="px-4 py-2 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#0A1F44] hover:bg-white flex items-center space-x-1 shadow-sm"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Docs</span>
                  </button>
                  <button
                    onClick={() => setReviewingItem(item)}
                    className="px-5 py-2 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-sm flex items-center space-x-1"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Review & Decide</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── VIEW DOCUMENTS MODAL ─────────────────────────────────────────── */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-[rgba(28,28,30,0.12)] space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0A1F44]">Document Inspection: {viewingItem.name}</h3>
                <p className="text-xs text-[#636366]">ID: {viewingItem.profileId} · Managed by: {viewingItem.createdFor}</p>
              </div>
              <button onClick={() => setViewingItem(null)} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* If created by third party, show Creator Authorization Box */}
            {viewingItem.createdFor !== "Self" && viewingItem.creatorName && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-amber-700" />
                    <span>Third-Party Creator Authorization</span>
                  </span>
                  <a
                    href={`tel:${viewingItem.creatorPhone}`}
                    className="px-3 py-1 rounded-full bg-[#C81D45] text-white font-bold text-[10px] inline-flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    <span>Call Guardian ({viewingItem.creatorPhone})</span>
                  </a>
                </div>
                <div className="text-amber-900">
                  Guardian / Creator Name: <span className="font-bold">{viewingItem.creatorName}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#636366] uppercase flex items-center gap-1">
                  <Camera className="h-3.5 w-3.5" />
                  <span>Candidate Photo / Selfie</span>
                </span>
                <img
                  src={viewingItem.selfieUrl}
                  alt="Selfie"
                  className="w-full h-48 rounded-2xl object-cover border border-[rgba(28,28,30,0.12)] shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#636366] uppercase flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Government ID Proof ({viewingItem.docType})</span>
                </span>
                <img
                  src={viewingItem.docUrl}
                  alt="Document"
                  className="w-full h-48 rounded-2xl object-cover border border-[rgba(28,28,30,0.12)] shadow-sm"
                />
              </div>
            </div>

            <div className="bg-[#FCFBF7] p-4 rounded-2xl border border-[rgba(28,28,30,0.06)] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Extracted Document Type:</span>
                <span className="font-semibold text-[#0A1F44]">{viewingItem.docType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Document Identification Number:</span>
                <span className="font-mono font-bold text-[#0A1F44]">{viewingItem.docNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Native Location:</span>
                <span className="font-semibold text-[#0A1F44]">{viewingItem.district}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(28,28,30,0.08)]">
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#636366]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = viewingItem;
                  setViewingItem(null);
                  setReviewingItem(target);
                }}
                className="px-5 py-2 rounded-full bg-[#C81D45] text-white text-xs font-bold shadow-md"
              >
                Review & Decide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REVIEW & DECISION MODAL ─────────────────────────────────────── */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[rgba(28,28,30,0.12)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0A1F44]">Verification Decision</h3>
                <p className="text-xs text-[#636366]">Approve or request corrections for {reviewingItem.name}</p>
              </div>
              <button onClick={() => setReviewingItem(null)} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 bg-[#FCFBF7] rounded-2xl border border-[rgba(28,28,30,0.06)] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Created For:</span>
                <span className="font-bold text-purple-800">{reviewingItem.createdFor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Document Verified:</span>
                <span className="font-bold text-[#0A1F44]">{reviewingItem.docType} ({reviewingItem.docNumber})</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#636366]">
                Correction Reason (if requesting resubmission)
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-4 text-xs font-semibold focus:outline-none"
              >
                <option value="Blurry document image">Blurry document image</option>
                <option value="Creator authorization unverified by phone call">Creator authorization unverified by phone call</option>
                <option value="Name on document does not match profile">Name on document does not match profile</option>
                <option value="Expired government document">Expired government document</option>
                <option value="Selfie face mismatch with ID photo">Selfie face mismatch with ID photo</option>
                <option value="Incomplete / cropped document edge">Incomplete / cropped document edge</option>
              </select>
            </div>

            <div className="pt-4 border-t border-[rgba(28,28,30,0.08)] flex justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDecision(reviewingItem.id, "Correction Required")}
                className="px-4 py-2.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Request Correction</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision(reviewingItem.id, "Approved")}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve & Unlock ✓</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
