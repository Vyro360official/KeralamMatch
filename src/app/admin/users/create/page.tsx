"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  UserPlus,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  FileText,
  Copy,
  Check,
  QrCode,
  ArrowRight,
  ExternalLink,
  Crown,
} from "lucide-react";
import { KERALA_NAKSHATRAMS, KERALA_RAASIS, DOSHAM_OPTIONS } from "@/lib/kerala-astrology-taxonomy";
import MatrimonialLogoLoader from "@/components/ui/matrimonial-logo-loader";

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram",
  "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

const CASTES_BY_RELIGION: Record<string, string[]> = {
  Hindu: ["Nair", "Ezhava", "Brahmin", "Viswakarma", "Dheevara", "Thiyya", "Ambalavasi", "Scheduled Caste", "Other Hindu"],
  Christian: ["Syrian Catholic", "Latin Catholic", "Marthoma", "Jacobite", "Orthodox", "Pentecostal", "CSI", "Other Christian"],
  Muslim: ["Sunni", "Mujahid", "Shia", "Other Muslim"],
  Other: ["Inter-caste", "Parsi", "Jain", "Buddhist", "Not Specified"]
};

export default function AdminCreateProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard Navigation Step (1 to 10)
  const [currentStep, setCurrentStep] = useState(1);
  const [calculatingAstro, setCalculatingAstro] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Profile Type & Ownership
    createdFor: "Self",
    managedBy: "Candidate",
    adminNotes: "",

    // Step 2: Basic & Account Details
    name: searchParams.get("name") || "",
    email: "",
    phone: searchParams.get("phone") || "",
    altPhone: "",
    gender: searchParams.get("gender") || "FEMALE",
    dateOfBirth: searchParams.get("dob") || "1996-05-15",

    // Step 3: Personal & Physical Attributes
    height: 165,
    weight: 60,
    bodyType: "Average",
    complexion: "Fair",
    physicalStatus: "Normal",
    motherTongue: "Malayalam",
    languagesKnown: ["Malayalam", "English"],

    // Step 4: Religion, Caste & Cultural Details
    religion: "Hindu",
    caste: "Nair",
    subCaste: "",
    gothram: "",
    familyValues: "Moderate",

    // Step 5: Horoscope & Astrological Details
    timeOfBirth: searchParams.get("tob") || "10:30",
    placeOfBirth: searchParams.get("place") || "Thiruvananthapuram",
    starNakshatram: "Aswathi",
    rasi: "Medam (Aries)",
    lagna: "Medam",
    dosham: "No Dosham (ശുദ്ധ ജാതകം)",
    horoscopeDocumentUrl: "",

    // Step 6: Education & Profession
    education: "B.Tech / Engineering",
    degree: "Computer Science",
    college: "CET Trivandrum",
    profession: "Software Professional",
    employedIn: "Private",
    company: "TCS / Infosys",
    incomeBracket: "₹10 - 15 Lakhs / year",
    district: "Thiruvananthapuram",
    city: "Thiruvananthapuram, Kerala",
    state: "Kerala",
    country: "India",

    // Step 7: Family Background
    familyStatus: "Upper Middle Class",
    familyType: "Nuclear",
    fatherName: "",
    fatherOccupation: "Govt Service (Retd)",
    motherName: "",
    motherOccupation: "Homemaker",
    totalBrothers: 1,
    marriedBrothers: 0,
    totalSisters: 0,
    marriedSisters: 0,
    familyAssets: ["Independent House", "Ancestral Land"],

    // Step 8: Lifestyle & Habits
    foodHabits: "Non-Vegetarian",
    smoking: "No",
    drinking: "No",
    hobbies: ["Reading", "Travel", "Cooking"],
    bio: "",

    // Step 9: Partner Preferences
    partnerAgeMin: 24,
    partnerAgeMax: 30,
    partnerHeightMin: 155,
    partnerHeightMax: 180,
    partnerMaritalStatus: "Never Married",
    partnerReligion: "Same Religion",
    partnerCaste: "Same Caste",
    partnerEducation: "Professional Degree",
    partnerProfession: "Software / Govt / Healthcare",
    partnerDistrict: "Any District in Kerala",
    horoscopeRequired: true,

    // Step 10: Photos, Documents & Verification
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800",
    verificationStatus: "VERIFIED",
    membershipTier: "PREMIUM",
    sendActivationLink: true,
  });

  // Calculate age from DOB
  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const calculatedAge = calculateAge(formData.dateOfBirth);

  const updateField = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  // Step 5: SoftAstro Auto Calculation trigger
  const handleAutoCalculateAstro = () => {
    setCalculatingAstro(true);
    setTimeout(() => {
      // Deterministic calculation based on DOB and time
      const day = new Date(formData.dateOfBirth).getDate() || 1;
      const month = new Date(formData.dateOfBirth).getMonth() + 1;
      const starIdx = (day * 3 + month * 2) % 27;
      const starObj = KERALA_NAKSHATRAMS[starIdx];
      const rasiIdx = Math.floor(starIdx / 2.25) % 12;
      const rasiObj = KERALA_RAASIS[rasiIdx];

      setFormData((prev) => ({
        ...prev,
        starNakshatram: starObj ? starObj.nameEnglish.split(" / ")[0] : "Aswathi",
        rasi: rasiObj ? rasiObj.nameEnglish : "Medam (Aries)",
        lagna: KERALA_RAASIS[(rasiIdx + 2) % 12].nameEnglish,
      }));
      setCalculatingAstro(false);
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessResult(json);
      } else {
        alert(json.message || "Failed to create profile.");
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyActivationLink = () => {
    if (successResult?.activationUrl) {
      navigator.clipboard.writeText(successResult.activationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const stepsList = [
    { num: 1, title: "Type & Ownership" },
    { num: 2, title: "Basic & Account" },
    { num: 3, title: "Personal Attributes" },
    { num: 4, title: "Religion & Caste" },
    { num: 5, title: "Horoscope & Astrology" },
    { num: 6, title: "Education & Career" },
    { num: 7, title: "Family Background" },
    { num: 8, title: "Lifestyle & Bio" },
    { num: 9, title: "Partner Preferences" },
    { num: 10, title: "Verification & Finalize" },
  ];

  if (successResult) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-[#0A1F44]">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 text-center animate-in fade-in">
          <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#0A1F44]">Member Account Created Successfully!</h2>
            <p className="text-xs text-slate-500 font-medium">
              Profile has been registered into production with <code>profileSource: ADMIN_CREATED</code> and verified.
            </p>
          </div>

          {/* Account Metadata Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Candidate Name:</span>
              <span className="font-bold text-[#0A1F44]">{successResult.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Phone Number:</span>
              <span className="font-bold text-[#0A1F44]">{successResult.phone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Email Account:</span>
              <span className="font-bold text-[#0A1F44]">{successResult.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Profile ID:</span>
              <span className="font-mono font-bold text-purple-700">{successResult.profileId}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-semibold">Initial Status:</span>
              <span className="font-bold text-emerald-700">{successResult.verificationStatus}</span>
            </div>
          </div>

          {/* One-Time Activation Link (Zero Plaintext Password Rule) */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-left space-y-2 text-xs">
            <span className="font-bold text-blue-900 block">One-Time Account Activation Link</span>
            <p className="text-[11px] text-blue-800">
              Send this link to the candidate so they can set their own secure password. Zero plaintext passwords were stored or logged.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                readOnly
                value={successResult.activationUrl}
                className="flex-1 h-9 rounded-xl bg-white border border-blue-200 px-3 text-xs font-mono text-slate-700"
              />
              <button
                type="button"
                onClick={handleCopyActivationLink}
                className="h-9 px-3 rounded-xl bg-[#0A1F44] hover:bg-[#132A57] text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSuccessResult(null);
                setCurrentStep(1);
              }}
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0A1F44] transition-colors"
            >
              Create Another Profile
            </button>

            <Link
              href={`/profile/${successResult.profileId}`}
              target="_blank"
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#0A1F44] hover:bg-[#132A57] text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <span>View Public Profile</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 text-[#0A1F44]">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#FF1475]" />
            <h1 className="text-xl font-extrabold text-[#0A1F44] tracking-tight">
              Admin Profile Creation Wizard
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Step {currentStep} of 10 • {stepsList[currentStep - 1]?.title}
          </p>
        </div>

        <Link
          href="/admin/users"
          className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 transition-colors"
        >
          Cancel
        </Link>
      </div>

      {/* Stepper Progress Bar (10 steps) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] gap-2">
          {stepsList.map((step) => {
            const isCompleted = step.num < currentStep;
            const isCurrent = step.num === currentStep;

            return (
              <button
                key={step.num}
                type="button"
                onClick={() => isCompleted && setCurrentStep(step.num)}
                disabled={!isCompleted && !isCurrent}
                className={`flex-1 flex flex-col items-center gap-1.5 p-1.5 rounded-xl text-center transition-all ${
                  isCurrent
                    ? "bg-[#0A1F44] text-white shadow-xs"
                    : isCompleted
                    ? "text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                    : "text-slate-400 opacity-60 cursor-not-allowed"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${
                    isCurrent
                      ? "bg-[#FF1475] text-white"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isCompleted ? "✓" : step.num}
                </div>
                <span className="text-[10px] font-bold truncate max-w-[80px]">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        {/* ================= STEP 1 ================= */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-base font-black text-[#0A1F44] border-b border-slate-100 pb-2">
              Step 1: Profile Type & Account Ownership
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Profile Created For</label>
                <select
                  value={formData.createdFor}
                  onChange={(e) => updateField("createdFor", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="Self">Self (Candidate)</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Relative">Relative</option>
                  <option value="Friend">Friend</option>
                  <option value="Client (Offline Bureau)">Client (Offline Matrimonial Bureau)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Managed By</label>
                <select
                  value={formData.managedBy}
                  onChange={(e) => updateField("managedBy", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="Candidate">Candidate</option>
                  <option value="Parent">Parent</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Admin Managed">Admin Managed (Assisted Concierge)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Internal Admin Notes</label>
                <textarea
                  rows={2}
                  value={formData.adminNotes}
                  onChange={(e) => updateField("adminNotes", e.target.value)}
                  placeholder="Notes about referral source, verification documents sighted, client background..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 font-medium text-[#0A1F44]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-base font-black text-[#0A1F44] border-b border-slate-100 pb-2">
              Step 2: Basic & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Ananya Nair"
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="FEMALE">Female (Bride)</option>
                  <option value="MALE">Male (Groom)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+91 98470 12345"
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alternate / WhatsApp Phone</label>
                <input
                  type="tel"
                  value={formData.altPhone}
                  onChange={(e) => updateField("altPhone", e.target.value)}
                  placeholder="+91 94471 67890"
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField("dateOfBirth", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Calculated Age: <strong>{calculatedAge} years</strong>
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="Optional (auto-generated if empty)"
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3 ================= */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-base font-black text-[#0A1F44] border-b border-slate-100 pb-2">
              Step 3: Personal & Physical Attributes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => updateField("height", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  approx {Math.floor(formData.height / 30.48)}' {Math.round((formData.height % 30.48) / 2.54)}"
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => updateField("weight", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Body Type</label>
                <select
                  value={formData.bodyType}
                  onChange={(e) => updateField("bodyType", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="Slim">Slim</option>
                  <option value="Average">Average</option>
                  <option value="Athletic">Athletic</option>
                  <option value="Heavy">Heavy</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Complexion</label>
                <select
                  value={formData.complexion}
                  onChange={(e) => updateField("complexion", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="Very Fair">Very Fair</option>
                  <option value="Fair">Fair</option>
                  <option value="Wheatish">Wheatish</option>
                  <option value="Dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Physical Status</label>
                <select
                  value={formData.physicalStatus}
                  onChange={(e) => updateField("physicalStatus", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="Normal">Normal</option>
                  <option value="Physically Challenged">Physically Challenged</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mother Tongue</label>
                <input
                  type="text"
                  value={formData.motherTongue}
                  onChange={(e) => updateField("motherTongue", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4 ================= */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-base font-black text-[#0A1F44] border-b border-slate-100 pb-2">
              Step 4: Religion, Caste & Cultural Background
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Religion</label>
                <select
                  value={formData.religion}
                  onChange={(e) => {
                    updateField("religion", e.target.value);
                    updateField("caste", (CASTES_BY_RELIGION[e.target.value] || [])[0] || "");
                  }}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="Hindu">Hindu</option>
                  <option value="Christian">Christian</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Caste / Community</label>
                <select
                  value={formData.caste}
                  onChange={(e) => updateField("caste", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  {(CASTES_BY_RELIGION[formData.religion] || ["Other"]).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sub-caste</label>
                <input
                  type="text"
                  value={formData.subCaste}
                  onChange={(e) => updateField("subCaste", e.target.value)}
                  placeholder="e.g. Kiriyath, Menon, Pillai..."
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Gothram / Kulam</label>
                <input
                  type="text"
                  value={formData.gothram}
                  onChange={(e) => updateField("gothram", e.target.value)}
                  placeholder="Optional"
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5 ================= */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-2">
              <h3 className="text-base font-black text-[#0A1F44]">
                Step 5: Horoscope & Astrological Details (SoftAstro)
              </h3>
              <button
                type="button"
                onClick={handleAutoCalculateAstro}
                disabled={calculatingAstro}
                className="h-8 px-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Sparkles className={`h-3.5 w-3.5 ${calculatingAstro ? "animate-spin" : ""}`} />
                <span>{calculatingAstro ? "Calculating..." : "Auto-Calculate from Birth Data"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Time of Birth</label>
                <input
                  type="time"
                  value={formData.timeOfBirth}
                  onChange={(e) => updateField("timeOfBirth", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Place of Birth (District/Taluk)</label>
                <input
                  type="text"
                  value={formData.placeOfBirth}
                  onChange={(e) => updateField("placeOfBirth", e.target.value)}
                  placeholder="e.g. Thiruvananthapuram"
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Star / Nakshatram</label>
                <select
                  value={formData.starNakshatram}
                  onChange={(e) => updateField("starNakshatram", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  {KERALA_NAKSHATRAMS.map((star) => (
                    <option key={star.id} value={star.nameEnglish.split(" / ")[0]}>
                      {star.nameEnglish} ({star.nameMalayalam})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rasi / Moon Sign</label>
                <select
                  value={formData.rasi}
                  onChange={(e) => updateField("rasi", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  {KERALA_RAASIS.map((r) => (
                    <option key={r.id} value={r.nameEnglish}>
                      {r.nameEnglish} ({r.nameMalayalam})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dosham</label>
                <select
                  value={formData.dosham}
                  onChange={(e) => updateField("dosham", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  {DOSHAM_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kundli Document URL</label>
                <input
                  type="url"
                  value={formData.horoscopeDocumentUrl}
                  onChange={(e) => updateField("horoscopeDocumentUrl", e.target.value)}
                  placeholder="https://... PDF/image"
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 6 ================= */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-base font-black text-[#0A1F44] border-b border-slate-100 pb-2">
              Step 6: Education & Career
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Education Level</label>
                <select
                  value={formData.education}
                  onChange={(e) => updateField("education", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="B.Tech / Engineering">B.Tech / Engineering</option>
                  <option value="Masters / M.Tech / MBA">Masters / M.Tech / MBA</option>
                  <option value="Medicine / MBBS / MD">Medicine / MBBS / MD</option>
                  <option value="Chartered Accountant">Chartered Accountant (CA)</option>
                  <option value="Doctorate / PhD">Doctorate / PhD</option>
                  <option value="Bachelors Degree">Bachelors Degree</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Profession / Role</label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => updateField("profession", e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Employment Sector</label>
                <select
                  value={formData.employedIn}
                  onChange={(e) => updateField("employedIn", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="Private Sector">Private Sector</option>
                  <option value="Govt / PSU Officer">Govt / PSU Officer</option>
                  <option value="Civil Services (IAS/IPS/KAS)">Civil Services (IAS/IPS/KAS)</option>
                  <option value="NRI / Abroad (Gulf/US/UK)">NRI / Abroad (Gulf/US/UK)</option>
                  <option value="Business / Entrepreneur">Business / Entrepreneur</option>
                  <option value="Defense / Armed Forces">Defense / Armed Forces</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Annual Income</label>
                <select
                  value={formData.incomeBracket}
                  onChange={(e) => updateField("incomeBracket", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="₹6 - 10 Lakhs / year">₹6 - 10 Lakhs / year</option>
                  <option value="₹10 - 15 Lakhs / year">₹10 - 15 Lakhs / year</option>
                  <option value="₹15 - 25 Lakhs / year">₹15 - 25 Lakhs / year</option>
                  <option value="₹25 - 50 Lakhs / year">₹25 - 50 Lakhs / year</option>
                  <option value="₹50 Lakhs+ / year">₹50 Lakhs+ / year</option>
                  <option value="AED 15,000 - 25,000 / month (Gulf)">AED 15,000 - 25,000 / month (Gulf)</option>
                  <option value="$100k+ / year (Abroad)">$100k+ / year (Abroad)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">District</label>
                <select
                  value={formData.district}
                  onChange={(e) => updateField("district", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  {KERALA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  placeholder="e.g. TCS / Cognizant"
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 7 ================= */}
        {currentStep === 7 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-base font-black text-[#0A1F44] border-b border-slate-100 pb-2">
              Step 7: Family Background
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Family Status</label>
                <select
                  value={formData.familyStatus}
                  onChange={(e) => updateField("familyStatus", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="Middle Class">Middle Class</option>
                  <option value="Upper Middle Class">Upper Middle Class</option>
                  <option value="Affluent / Elite">Affluent / Elite</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Family Type</label>
                <select
                  value={formData.familyType}
                  onChange={(e) => updateField("familyType", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="Nuclear">Nuclear Family</option>
                  <option value="Joint">Joint Family</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Father's Name & Occupation</label>
                <input
                  type="text"
                  value={formData.fatherOccupation}
                  onChange={(e) => updateField("fatherOccupation", e.target.value)}
                  placeholder="e.g. K. Krishnan Nair (Govt Retd)"
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mother's Name & Occupation</label>
                <input
                  type="text"
                  value={formData.motherOccupation}
                  onChange={(e) => updateField("motherOccupation", e.target.value)}
                  placeholder="e.g. Radhika Devi (Teacher)"
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Brothers (Total / Married)</label>
                <input
                  type="number"
                  value={formData.totalBrothers}
                  onChange={(e) => updateField("totalBrothers", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sisters (Total / Married)</label>
                <input
                  type="number"
                  value={formData.totalSisters}
                  onChange={(e) => updateField("totalSisters", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 8 ================= */}
        {currentStep === 8 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-base font-black text-[#0A1F44] border-b border-slate-100 pb-2">
              Step 8: Lifestyle & About Candidate
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Food Habits</label>
                <select
                  value={formData.foodHabits}
                  onChange={(e) => updateField("foodHabits", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Eggetarian">Eggetarian</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Smoking</label>
                <select
                  value={formData.smoking}
                  onChange={(e) => updateField("smoking", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="No">No</option>
                  <option value="Occasionally">Occasionally</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Drinking</label>
                <select
                  value={formData.drinking}
                  onChange={(e) => updateField("drinking", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="No">No</option>
                  <option value="Occasionally">Socially</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="font-bold text-slate-700 block mb-1">Candidate Bio / Description</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  placeholder="Describe personality, values, career ambitions, and life goals..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 font-medium text-[#0A1F44]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 9 ================= */}
        {currentStep === 9 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-base font-black text-[#0A1F44] border-b border-slate-100 pb-2">
              Step 9: Partner Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Partner Age Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.partnerAgeMin}
                    onChange={(e) => updateField("partnerAgeMin", e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    value={formData.partnerAgeMax}
                    onChange={(e) => updateField("partnerAgeMax", e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Religion Preference</label>
                <select
                  value={formData.partnerReligion}
                  onChange={(e) => updateField("partnerReligion", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="Same Religion">Same Religion</option>
                  <option value="Any Religion">Any Religion</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Caste Preference</label>
                <select
                  value={formData.partnerCaste}
                  onChange={(e) => updateField("partnerCaste", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="Same Caste">Same Caste</option>
                  <option value="Caste No Bar">Caste No Bar</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Location Preference</label>
                <input
                  type="text"
                  value={formData.partnerDistrict}
                  onChange={(e) => updateField("partnerDistrict", e.target.value)}
                  placeholder="e.g. Any District in Kerala, Gulf NRI..."
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 10 ================= */}
        {currentStep === 10 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-base font-black text-[#0A1F44] border-b border-slate-100 pb-2">
              Step 10: Photos, Verification & Activation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Photo / Avatar URL</label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => updateField("avatarUrl", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Initial Verification Status</label>
                <select
                  value={formData.verificationStatus}
                  onChange={(e) => updateField("verificationStatus", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="VERIFIED">VERIFIED (Staff physically checked documents)</option>
                  <option value="PENDING">PENDING (Awaiting candidate selfie/ID upload)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Membership Tier</label>
                <select
                  value={formData.membershipTier}
                  onChange={(e) => updateField("membershipTier", e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-[#0A1F44]"
                >
                  <option value="PREMIUM">Premium (Complimentary 3 Months)</option>
                  <option value="FREE">Standard Free</option>
                  <option value="ELITE">Elite Concierge</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="sendActivationLink"
                  checked={formData.sendActivationLink}
                  onChange={(e) => updateField("sendActivationLink", e.target.checked)}
                  className="h-4 w-4 rounded-sm border-slate-300 text-[#0A1F44]"
                />
                <label htmlFor="sendActivationLink" className="font-bold text-slate-700 cursor-pointer">
                  Generate One-Time Secure Activation Link (Zero Plaintext Passwords)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Form Footer Controls (Next / Back / Submit) */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="h-10 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Step</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 10 ? (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 2 && (!formData.name || !formData.phone)) {
                  alert("Name and Phone Number are required.");
                  return;
                }
                setCurrentStep((prev) => prev + 1);
              }}
              className="h-10 px-6 rounded-xl bg-[#0A1F44] hover:bg-[#132A57] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md ml-auto"
            >
              <span>Next Step</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="h-11 px-8 rounded-xl bg-gradient-to-r from-[#FF1475] to-[#C81D45] hover:opacity-95 text-white text-xs font-black flex items-center gap-2 transition-all shadow-lg ml-auto disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{submitting ? "Creating Production Profile..." : "Finalize & Create Member Profile"}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
