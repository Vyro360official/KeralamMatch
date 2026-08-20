"use client";

import React, { useState } from "react";
import { HelpCircle, Plus, Edit3, Trash2, X, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FaqItem {
  id: string;
  question: string;
  category: string;
  answer: string;
  status: "Published" | "Draft";
}

const INITIAL_FAQS: FaqItem[] = [
  { id: "faq-1", question: "How do I create a profile?", category: "Account", answer: "You can register with your mobile number, verify OTP, and complete our 10-step Malayalam matrimony wizard.", status: "Published" },
  { id: "faq-2", question: "Is my information safe and private?", category: "Privacy", answer: "Yes, phone numbers and emails are AES-256 encrypted and only revealed during 24-hour mutual consent windows.", status: "Published" },
  { id: "faq-3", question: "How does premium membership work?", category: "Subscription", answer: "Premium plans allow sending direct contact requests, verified badges, and priority matching.", status: "Published" },
  { id: "faq-4", question: "How can I contact another member?", category: "Matches", answer: "Send a contact unlock request. When accepted by the candidate, a 24-hour reveal window opens.", status: "Published" },
  { id: "faq-5", question: "What documents are required for verification?", category: "Verification", answer: "Aadhaar Card, Passport, or Driving License along with a live camera selfie match.", status: "Published" },
  { id: "faq-6", question: "How do I report a user?", category: "Safety", answer: "Click 'Report Profile' on any member's card. Our admin team investigates within 24 hours.", status: "Published" },
  { id: "faq-7", question: "Can I get a refund?", category: "Payments", answer: "Refunds can be requested within 7 days of purchase if services have not been utilized.", status: "Draft" },
];

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>(INITIAL_FAQS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // New FAQ form
  const [newQuestion, setNewQuestion] = useState("");
  const [newCategory, setNewCategory] = useState("Account");
  const [newAnswer, setNewAnswer] = useState("");
  const [newStatus, setNewStatus] = useState<"Published" | "Draft">("Published");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion || !newAnswer) return;
    const created: FaqItem = {
      id: "faq-" + Date.now().toString().slice(-4),
      question: newQuestion,
      category: newCategory,
      answer: newAnswer,
      status: newStatus,
    };
    setFaqs([created, ...faqs]);
    showToast(`FAQ added successfully.`);
    setIsAddOpen(false);
    setNewQuestion("");
    setNewAnswer("");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;
    setFaqs((prev) => prev.map((f) => (f.id === editingFaq.id ? editingFaq : f)));
    showToast(`FAQ updated.`);
    setEditingFaq(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ item?")) return;
    const target = faqs.find((f) => f.id === id);
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    showToast(`FAQ "${target?.question.slice(0, 20)}..." deleted.`);
  };

  return (
    <div className="space-y-6 text-[#1C1C1E]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1F44]">FAQ Management</h1>
          <p className="text-xs text-[#636366]">Create, edit and organize frequently asked questions</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New FAQ</span>
        </button>
      </div>

      {toast && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(28,28,30,0.08)] text-[#8E8E93] uppercase text-[10px] font-bold">
                <th className="pb-3">Question & Answer</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(28,28,30,0.06)]">
              {faqs.map((f) => (
                <tr key={f.id} className="hover:bg-[#FCFBF7] transition-colors">
                  <td className="py-3.5 max-w-md">
                    <div className="font-bold text-[#0A1F44]">{f.question}</div>
                    <div className="text-[11px] text-[#636366] mt-0.5 line-clamp-2">{f.answer}</div>
                  </td>
                  <td className="py-3.5 text-[#636366]">
                    <span className="px-2.5 py-1 bg-gray-100 rounded-full text-[10px] font-semibold text-[#0A1F44]">
                      {f.category}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      f.status === "Published" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                    <button
                      onClick={() => setEditingFaq(f)}
                      className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="px-3 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ADD FAQ MODAL ────────────────────────────────────────────────── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[rgba(28,28,30,0.12)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0A1F44]">Add New FAQ</h3>
                <p className="text-xs text-[#636366]">Add a question and helpful answer for candidates</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Question *</label>
                <Input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. How do I change my native district?"
                  className="rounded-full h-10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Account">Account</option>
                    <option value="Privacy">Privacy</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Matches">Matches</option>
                    <option value="Verification">Verification</option>
                    <option value="Safety">Safety</option>
                    <option value="Payments">Payments</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Answer *</label>
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Provide clear, concise guidance..."
                  rows={4}
                  className="w-full rounded-2xl border border-[rgba(28,28,30,0.12)] p-3 text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="pt-4 border-t border-[rgba(28,28,30,0.08)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#636366]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-md"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT FAQ MODAL ──────────────────────────────────────────────── */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[rgba(28,28,30,0.12)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0A1F44]">Edit FAQ</h3>
                <p className="text-xs text-[#636366]">FAQ ID: {editingFaq.id}</p>
              </div>
              <button onClick={() => setEditingFaq(null)} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Question</label>
                <Input
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="rounded-full h-10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Category</label>
                  <select
                    value={editingFaq.category}
                    onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Account">Account</option>
                    <option value="Privacy">Privacy</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Matches">Matches</option>
                    <option value="Verification">Verification</option>
                    <option value="Safety">Safety</option>
                    <option value="Payments">Payments</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Status</label>
                  <select
                    value={editingFaq.status}
                    onChange={(e) => setEditingFaq({ ...editingFaq, status: e.target.value as any })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Answer</label>
                <textarea
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  rows={4}
                  className="w-full rounded-2xl border border-[rgba(28,28,30,0.12)] p-3 text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="pt-4 border-t border-[rgba(28,28,30,0.08)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="px-4 py-2 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#636366]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
