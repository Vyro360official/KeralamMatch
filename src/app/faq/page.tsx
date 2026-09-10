"use client";

import React, { useState } from "react";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";

const faqs = [
  {
    question: "Is KeralamMatch free to use?",
    answer: "Yes. You can create a profile and browse matches for free. To see full contact details, send contact requests, and access premium features like AI Smart Search, you'll need a paid subscription.",
  },
  {
    question: "How does the 24-hour contact reveal work?",
    answer: "When both users accept each other's contact request, a 24-hour window is opened during which both parties can view each other's phone number and email. After 24 hours, the contact details are automatically hidden again. This protects your privacy while still enabling meaningful connections.",
  },
  {
    question: "How are profiles verified?",
    answer: "All profiles undergo mobile OTP verification at sign-up. Additional identity layers include selfie liveness checks and optional Aadhaar verification. Verified profiles display a green badge and rank higher in search results.",
  },
  {
    question: "Can I control who sees my photos?",
    answer: "Yes. Profile photos are blurred by default for unverified or non-member viewers. You can also mark photos as visible only to members you have sent a contact request to.",
  },
  {
    question: "What happens if I encounter harassment or a fake profile?",
    answer: "Use the Report button on any profile to flag it to our safety team. We review all reports within 24 hours. You can also block any user immediately, which prevents all further contact.",
  },
  {
    question: "Can family members manage a profile?",
    answer: "Yes. KeralamMatch supports family-managed accounts. A parent or sibling can create and manage a profile on behalf of their family member, with the ability to send or receive contact requests.",
  },
  {
    question: "Are my messages private?",
    answer: "All messages are encrypted in transit using TLS and stored with AES-256-GCM field-level encryption in the database. Our support staff cannot read your private messages.",
  },
  {
    question: "How do I delete my account?",
    answer: "Go to Account Settings → Privacy → Delete Account. Your profile is immediately hidden and all personal data is permanently deleted within 30 days.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] dark:bg-[#07132B] text-[#1C1C1E] dark:text-white transition-colors">
      <Header />
      <main className="flex-grow mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A1F44] dark:text-white mb-2">Frequently Asked Questions</h1>
          <p className="text-xs text-[#636366] dark:text-slate-400">
            Everything you need to know about KeralamMatch. Can't find your answer?{" "}
            <a href="mailto:support@keralammatch.com" className="text-[#FF1475] font-semibold hover:underline">Contact support</a>.
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#0D1E3D] rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-bold text-[#0A1F44] dark:text-white">{faq.question}</span>
                <span className={`text-[#8E8E93] dark:text-slate-400 transition-transform duration-200 flex-shrink-0 ${openIndex === i ? "rotate-45" : ""}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-xs text-[#636366] dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer variant="dashboard" />
    </div>
  );
}
