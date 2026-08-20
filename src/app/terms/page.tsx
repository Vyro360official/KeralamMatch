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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow mx-auto max-w-3xl w-full px-6 md:px-8 py-24">
        <h1 className="text-4xl font-bold tracking-tight text-text-primary mb-4">Terms of Service</h1>
        <p className="text-sm text-text-secondary mb-12">Last updated: August 2026</p>
        <div className="space-y-10">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-bold text-text-primary mb-3">{s.title}</h2>
              <p className="text-sm text-text-secondary leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
