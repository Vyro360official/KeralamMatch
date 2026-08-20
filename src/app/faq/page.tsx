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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow mx-auto max-w-3xl w-full px-6 md:px-8 py-24">
        <h1 className="text-4xl font-bold tracking-tight text-text-primary mb-3">Frequently Asked Questions</h1>
        <p className="text-sm text-text-secondary mb-14">
          Everything you need to know about KeralamMatch. Can't find your answer?{" "}
          <a href="mailto:support@keralammatch.com" className="text-brand-primary hover:underline">Contact support</a>.
        </p>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="premium-card overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="text-sm font-semibold text-text-primary">{faq.question}</span>
                <span className={`text-text-tertiary transition-transform duration-200 flex-shrink-0 ${openIndex === i ? "rotate-45" : ""}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-sm text-text-secondary leading-relaxed border-t border-border-subtle pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
