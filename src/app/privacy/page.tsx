import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";

export const metadata = {
  title: "Privacy Policy | KeralamMatch",
  description: "How KeralamMatch collects, uses, and protects your personal data.",
};

const sections = [
  {
    title: "Information We Collect",
    body: "We collect information you provide during registration such as your name, mobile number, email, date of birth, religion, caste, location, education, and profession. We also collect profile photos and voice introductions you upload voluntarily.",
  },
  {
    title: "How We Use Your Information",
    body: "Your data is used exclusively to match you with compatible partners, verify your identity, deliver notifications, and operate the platform. We never sell your personal information to third parties.",
  },
  {
    title: "Contact Information Security",
    body: "Phone numbers and email addresses are stored with AES-256-GCM field-level encryption. They are decrypted only when a valid 24-hour contact reveal consent exists between two users.",
  },
  {
    title: "Photo Privacy",
    body: "Profile photos are hosted on Cloudinary with automatic watermarking. Photos remain blurred for unverified or non-member viewers. You control which photos are visible and can delete them at any time.",
  },
  {
    title: "Data Retention",
    body: "Your data is retained for as long as your account remains active. Upon account deletion, personal data is permanently removed within 30 days except for anonymised audit records required by law.",
  },
  {
    title: "Your Rights",
    body: "You have the right to access, correct, or delete your personal data at any time via your Account Settings. You can also request a complete data export by contacting our privacy team.",
  },
  {
    title: "Cookies",
    body: "We use a single HttpOnly session cookie to maintain your login state securely. We do not use advertising or third-party tracking cookies.",
  },
  {
    title: "Contact Us",
    body: "For any privacy-related queries, email us at privacy@keralammatch.com. We respond to all requests within 72 hours.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow mx-auto max-w-3xl w-full px-6 md:px-8 py-24">
        <h1 className="text-4xl font-bold tracking-tight text-text-primary mb-4">Privacy Policy</h1>
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
