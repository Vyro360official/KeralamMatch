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
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] dark:bg-[#07132B] text-[#1C1C1E] dark:text-white transition-colors">
      <Header />
      <main className="flex-grow mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A1F44] dark:text-white mb-2">Privacy Policy</h1>
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
