import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";

export const metadata = {
  title: "Terms of Service | KeralamMatch",
  description: "Terms and conditions governing your use of the KeralamMatch matrimonial platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By creating an account on KeralamMatch you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.",
  },
  {
    title: "2. Eligibility",
    body: "You must be at least 18 years old and legally eligible to marry under applicable Indian law. By registering, you represent that you meet these requirements and that all information you provide is accurate.",
  },
  {
    title: "3. Account Responsibilities",
    body: "You are responsible for maintaining the confidentiality of your login credentials. You agree not to share your account with others or create fake profiles. Impersonation is strictly prohibited and will result in immediate termination.",
  },
  {
    title: "4. Prohibited Conduct",
    body: "You may not harass, abuse, or threaten other members. Sending unsolicited commercial messages, posting offensive content, or attempting to extract personal information outside of the consent-based reveal system is prohibited.",
  },
  {
    title: "5. Contact Reveal System",
    body: "The 24-hour ephemeral contact reveal is a consent-based feature. You may not attempt to screenshot, record, or redistribute the revealed contact information to third parties. Violations will result in immediate account suspension.",
  },
  {
    title: "6. Subscription & Payments",
    body: "Subscription fees are non-refundable once a billing cycle has commenced. Wallet credits do not expire but are non-transferable and have no cash value. All prices include applicable GST.",
  },
  {
    title: "7. Intellectual Property",
    body: "All design, code, and content on KeralamMatch is the intellectual property of KeralamMatch Technologies Pvt. Ltd. You may not copy, scrape, or reproduce any part of the platform without written permission.",
  },
  {
    title: "8. Limitation of Liability",
    body: "KeralamMatch is a technology platform facilitating connections. We are not responsible for the conduct of members offline. We make no guarantees regarding the outcome of any match or relationship formed through the platform.",
  },
  {
    title: "9. Governing Law",
    body: "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Trivandrum, Kerala.",
  },
  {
    title: "10. Contact",
    body: "For legal queries, contact legal@keralammatch.com.",
  },
];

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] dark:bg-[#07132B] text-[#1C1C1E] dark:text-white transition-colors">
      <Header />
      <main className="flex-grow mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A1F44] dark:text-white mb-2">Terms of Service</h1>
          <p className="text-xs text-[#636366] dark:text-slate-400">Last updated: August 2026</p>
        </div>
        <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-10 space-y-6 divide-y divide-slate-100 dark:divide-slate-800/80">
          {sections.map((s, idx) => (
            <div key={s.title} className={idx > 0 ? "pt-6" : ""}>
              <h2 className="text-sm sm:text-base font-bold text-[#0A1F44] dark:text-white mb-2">{s.title}</h2>
              <p className="text-xs text-[#636366] dark:text-slate-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer variant="dashboard" />
    </div>
  );
}
