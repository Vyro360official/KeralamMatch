"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Camera, Mic, CheckCircle2, ChevronRight, ChevronLeft, X,
  Search, Plus, AlertCircle, Shield, User, Heart, Lock, Home,
  GraduationCap, Briefcase, MapPin, Phone, Coffee, Compass, CheckSquare,
  HelpCircle, Award, Eye, FileText, ArrowRight, Clock, Calendar
} from "lucide-react";
import { saveProfileDetailsAction, getProfileDetailsAction } from "@/modules/profile/profile.controller";
import { uploadPhotoAction, uploadVoiceIntroAction } from "@/modules/media/media.controller";
import { Gender } from "@prisma/client";
import { KERALA_DISTRICTS, KERALA_RELIGIONS_TAXONOMY, WORLDWIDE_EDUCATION } from "@/lib/kerala-data";
import {
  KERALA_NAKSHATRAMS, KERALA_RAASIS, DOSHAM_OPTIONS,
  OCCUPATION_CATEGORIES, GROUPED_EDUCATION_QUALIFICATIONS
} from "@/lib/kerala-astrology-taxonomy";
import { formatDateDDMMYYYY } from "@/lib/utils";

const STEPS = [
  { id: 1, name: "Profile Type", icon: User },
  { id: 2, name: "Basic Details", icon: Heart },
  { id: 3, name: "Religion & Culture", icon: Award },
  { id: 4, name: "Horoscope & Astrology", icon: Sparkles },
  { id: 5, name: "Education & Career", icon: Briefcase },
  { id: 6, name: "Location & Living", icon: MapPin },
  { id: 7, name: "Contact (Private)", icon: Phone },
  { id: 8, name: "Food & Habits", icon: Coffee },
  { id: 9, name: "Family Background", icon: Home },
  { id: 10, name: "Hobbies & About Me", icon: Compass },
  { id: 11, name: "Partner Preferences", icon: Heart },
  { id: 12, name: "Preview & Publish", icon: CheckCircle2 },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Core profile form state
  const [formData, setFormData] = useState({
    // Step 1: Profile Type
    createdFor: "Self",
    creatorName: "",
    creatorPhone: "",
    creatorRelation: "Self",
    creatorDocumentUrl: "",

    // Step 2: Basic Details
    firstName: "",
    lastName: "",
    gender: "MALE" as Gender,
    dateOfBirth: "1995-01-01",
    height: 170, // cm
    heightFtIn: "5' 7\"",
    weight: 68,  // kg
    bodyType: "Average",
    complexion: "Wheatish",
    physicalStatus: "Normal",
    fitnessLevel: "Active",
    maritalStatus: "Never Married",

    // Step 3: Religion & Cultural
    religion: "Hindu",
    motherTongue: "Malayalam",
    caste: "Nair",
    subCaste: "",
    showReligionOnProfile: true,

    // Step 4: Horoscope
    starNakshatram: "Rohini",
    rasi: "Edavam (Taurus)",
    dosham: "No Dosham (ശുദ്ധ ജാതകം)",
    gothram: "",
    timeOfBirth: "10:30 AM",
    placeOfBirth: "Thiruvananthapuram",
    horoscopeRequired: false,
    horoscopeDocumentUrl: "",

    // Step 5: Education & Career
    educationGroup: "Engineering & Technology",
    education: "B.Tech in Computer Science",
    institution: "CET Trivandrum",
    employmentType: "Private IT / Corporate",
    occupationCategory: "IT & Software Engineering",
    profession: "Senior Software Engineer",
    company: "Technopark Enterprise",
    incomeBracket: "₹15 - 25 Lakhs / year",
    incomeVisibility: "Visible to Matches",

    // Step 6: Location & Living
    livingIn: "India",
    country: "India",
    state: "Kerala",
    district: "Thiruvananthapuram",
    city: "Kazhakoottam, Trivandrum",
    pincode: "695582",
    nativePlace: "Trivandrum",
    nativeDistrict: "Thiruvananthapuram",
    relocationPreference: "Open to discussion",

    // Step 7: Contact Information (Private)
    userPhone: "+91 94470 12345",
    userEmail: "",
    parentName: "",
    parentRelation: "Father",
    parentPhone: "",
    parentIsd: "+91",

    // Step 8: Food & Lifestyle Habits
    foodHabits: "Non-Vegetarian",
    smoking: "No",
    drinking: "No",

    // Step 9: Family Details
    familyStatus: "Upper Middle Class",
    familyType: "Nuclear",
    familyValues: "Moderate Traditional",
    fatherName: "",
    fatherOccupation: "Retd. Govt. Officer",
    motherName: "",
    motherOccupation: "Homemaker",
    totalBrothers: 0,
    marriedBrothers: 0,
    totalSisters: 0,
    marriedSisters: 0,
    familyAssets: ["Own House", "Family Business"],

    // Step 10: Hobbies, Interests & Bio
    hobbies: ["Music", "Reading", "Travel", "Photography"],
    musicGenres: ["Melody", "Classical", "Folk"],
    languagesKnown: ["Malayalam", "English", "Hindi"],
    cuisines: ["Kerala", "South Indian", "North Indian"],
    bio: "",

    // Step 11: 3-Tier Partner Preferences
    partnerAgeMin: 22,
    partnerAgeMax: 30,
    partnerAgeStrict: false,
    partnerHeightMin: 155,
    partnerHeightMax: 185,
    partnerHeightStrict: false,
    partnerMaritalStatus: "Never Married",
    partnerMaritalStatusStrict: false,
    partnerMotherTongue: "Malayalam",
    partnerMotherTongueStrict: false,
    partnerPhysicalStatus: "Normal",
    partnerPhysicalStatusStrict: false,
    partnerDosham: "No Dosham / Doesn't Matter",
    partnerDoshamStrict: false,
    partnerReligion: "Hindu",
    partnerReligionStrict: true,
    partnerCaste: "Any",
    partnerCasteStrict: false,
    partnerSubCaste: "Any",
    partnerSubCasteStrict: false,
    partnerEducation: "Graduate / Post Graduate",
    partnerEducationStrict: false,
    partnerProfession: "Any Profession",
    partnerProfessionStrict: false,
    partnerFoodHabits: "Any",
    partnerFoodHabitsStrict: false,
    partnerDrinking: "Non-Drinker",
    partnerDrinkingStrict: false,
    partnerSmoking: "Non-Smoker",
    partnerSmokingStrict: false,
    partnerCountry: "India",
    partnerCountryStrict: false,
    partnerDistrict: "Any District",
    partnerDistrictStrict: false,
    partnerCity: "Any City",
  });

  const [photosList, setPhotosList] = useState<string[]>([]);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);

  // Calculate age automatically from Date of Birth
  const calculatedAge = useMemo(() => {
    if (!formData.dateOfBirth) return 28;
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return Math.max(18, age);
  }, [formData.dateOfBirth]);

  // Sibling calculations
  const unmarriedBrothers = Math.max(0, formData.totalBrothers - formData.marriedBrothers);
  const unmarriedSisters = Math.max(0, formData.totalSisters - formData.marriedSisters);

  const [eduSearchTerm, setEduSearchTerm] = useState("");

  // Dynamic Religion & Caste Taxonomy
  const currentRelTaxonomy = useMemo(() => {
    return (
      KERALA_RELIGIONS_TAXONOMY.find(
        (r) => r.religion.toLowerCase() === (formData.religion || "Hindu").toLowerCase()
      ) || KERALA_RELIGIONS_TAXONOMY[0]
    );
  }, [formData.religion]);

  const currentCasteObj = useMemo(() => {
    return (
      currentRelTaxonomy.castes.find(
        (c) => c.caste.toLowerCase() === (formData.caste || "").toLowerCase()
      ) || currentRelTaxonomy.castes[0]
    );
  }, [currentRelTaxonomy, formData.caste]);

  const currentSubcastes = useMemo(() => {
    return currentCasteObj ? currentCasteObj.subcastes : ["All", "Other"];
  }, [currentCasteObj]);

  // Filtered World Education
  const filteredWorldEducation = useMemo(() => {
    if (!eduSearchTerm.trim()) return WORLDWIDE_EDUCATION;
    const query = eduSearchTerm.toLowerCase();
    return WORLDWIDE_EDUCATION.map((cat) => ({
      category: cat.category,
      degrees: cat.degrees.filter((d) => d.toLowerCase().includes(query)),
    })).filter((cat) => cat.degrees.length > 0);
  }, [eduSearchTerm]);

  // Dynamic Popular Towns for Selected District
  const currentDistrictObj = useMemo(() => {
    return (
      KERALA_DISTRICTS.find(
        (d) => d.name.toLowerCase() === (formData.district || "Thiruvananthapuram").toLowerCase()
      ) || KERALA_DISTRICTS[0]
    );
  }, [formData.district]);

  // 12-Hour Time of Birth Picker State & Sync
  const [birthHour, setBirthHour] = useState("10");
  const [birthMinute, setBirthMinute] = useState("30");
  const [birthAmPm, setBirthAmPm] = useState("AM");

  const updateTimeOfBirth = (h: string, m: string, period: string) => {
    setBirthHour(h);
    setBirthMinute(m);
    setBirthAmPm(period);
    setFormData((prev) => ({
      ...prev,
      timeOfBirth: `${h.padStart(2, "0")}:${m.padStart(2, "0")} ${period}`,
    }));
  };

  const handleNativeTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [h24Str, mStr] = val.split(":");
    let h24 = parseInt(h24Str, 10);
    const m = mStr || "00";
    const period = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    const h12Str = h12.toString().padStart(2, "0");
    updateTimeOfBirth(h12Str, m, period);
  };

  // Single Input DD/MM/YYYY Date of Birth State & Formatting
  const [dobDisplay, setDobDisplay] = useState("15/06/1996");

  const handleDobTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw.length > 8) raw = raw.slice(0, 8);

    let formatted = raw;
    if (raw.length >= 3 && raw.length <= 4) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    } else if (raw.length >= 5) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    }
    setDobDisplay(formatted);

    if (raw.length === 8) {
      const day = raw.slice(0, 2);
      const month = raw.slice(2, 4);
      const year = raw.slice(4, 8);
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1940 && yearNum <= 2010) {
        setFormData((prev) => ({
          ...prev,
          dateOfBirth: `${year}-${month}-${day}`,
        }));
      }
    }
  };

  const handleNativeCalendarPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // "YYYY-MM-DD"
    if (!val) return;
    const [y, m, d] = val.split("-");
    if (y && m && d) {
      const formatted = `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
      setDobDisplay(formatted);
      setFormData((prev) => ({
        ...prev,
        dateOfBirth: `${y}-${m}-${d}`,
      }));
    }
  };

  // Height picker: feet (4–7) + inches (0–11) with ↑↓ spinners → auto-calculate cm
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(7);

  const updateHeight = (ft: number, inches: number) => {
    const clampedFt = Math.min(7, Math.max(4, ft));
    const clampedIn = Math.min(11, Math.max(0, inches));
    setHeightFt(clampedFt);
    setHeightIn(clampedIn);
    const totalCm = Math.round((clampedFt * 12 + clampedIn) * 2.54);
    const ftInStr = `${clampedFt}' ${clampedIn}"`;
    setFormData((prev) => ({ ...prev, height: totalCm, heightFtIn: ftInStr }));
  };

  // Profile completion score calculation
  const profileCompletion = useMemo(() => {
    let score = 0;
    const missing: string[] = [];

    if (formData.firstName && formData.lastName) score += 10;
    else missing.push("Name & Basic Details");

    if (formData.religion && formData.caste) score += 10;
    else missing.push("Religion & Caste");

    if (formData.starNakshatram && formData.rasi) score += 10;
    else missing.push("Horoscope / Star");

    if (formData.education && formData.profession) score += 15;
    else missing.push("Education & Career");

    if (formData.district && formData.city) score += 10;
    else missing.push("Location");

    if (formData.userPhone) score += 10;
    else missing.push("Contact Details");

    if (formData.familyStatus && (formData.fatherName || formData.motherName)) score += 10;
    else missing.push("Family Details");

    if (formData.bio && formData.bio.length >= 50) score += 10;
    else missing.push("About Me Description");

    if (photosList.length > 0) score += 10;
    else missing.push("Profile Photo");

    if (formData.partnerAgeMin && formData.partnerReligion) score += 5;
    else missing.push("Partner Preferences");

    return { percentage: Math.min(100, score), missing };
  }, [formData, photosList]);

  useEffect(() => {
    async function loadProfile() {
      const result = await getProfileDetailsAction();
      if (result.success && result.profile) {
        const p = result.profile;
        setFormData((prev) => ({
          ...prev,
          firstName: p.firstName || "",
          lastName: p.lastName || "",
          gender: p.gender || "MALE",
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split("T")[0] : "1995-01-01",
          height: p.height || 170,
          maritalStatus: p.maritalStatus || "Never Married",
          religion: p.religion || "Hindu",
          caste: p.caste || "Nair",
          subCaste: p.subCaste || "",
          education: p.education || "",
          profession: p.profession || "",
          company: p.company || "",
          incomeBracket: p.incomeBracket || "",
          district: p.district || "Thiruvananthapuram",
          city: p.city || "",
          bio: p.bio || "",
          horoscopeRequired: p.horoscopeRequired || false,
        }));
        setVoiceUrl(p.voiceIntroduction || null);
        if ((p as any).media) {
          setPhotosList((p as any).media.map((m: any) => m.url));
        }
      }
    }
    loadProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleHeightFtChange = (ftInStr: string, cmValue: number) => {
    setFormData((prev) => ({ ...prev, height: cmValue, heightFtIn: ftInStr }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const result = await uploadPhotoAction(base64);
      if (result.success && result.media) {
        setPhotosList((prev) => [...prev, result.media.url]);
        setSaveToast("Photo uploaded successfully.");
        setTimeout(() => setSaveToast(null), 3000);
      } else {
        setError(result.error || "Failed to upload photo.");
      }
      setUploadingMedia(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAndExit = async () => {
    setLoading(true);
    await saveProfileDetailsAction({
      ...formData,
      voiceIntroduction: voiceUrl || undefined,
    });
    setLoading(false);
    setSaveToast("Progress saved! You can resume anytime.");
    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
  };

  const handleNextStep = async () => {
    setError(null);
    if (activeStep < STEPS.length - 1) {
      setActiveStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Final Submit
      setLoading(true);
      const result = await saveProfileDetailsAction({
        ...formData,
        voiceIntroduction: voiceUrl || undefined,
      });
      setLoading(false);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Failed to save profile.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-[#1C1C1E] flex flex-col font-sans pb-16">
      
      {/* ── Top Header Navigation ────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[rgba(28,28,30,0.08)] py-3.5 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />

          {/* Step Progress & Save and Exit */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-xs font-semibold text-[#636366]">
              <span>Step {activeStep + 1} of {STEPS.length}:</span>
              <span className="text-[#0A1F44] font-bold">{STEPS[activeStep].name}</span>
            </div>

            {/* Profile Completion Badge */}
            <div className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-bold text-amber-900 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>{profileCompletion.percentage}% Complete</span>
            </div>

            <button
              onClick={handleSaveAndExit}
              disabled={loading}
              className="px-4 py-2 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#0A1F44] hover:bg-gray-50 transition-all"
            >
              Save & Exit
            </button>
          </div>
        </div>

        {/* Global Thin Progress Bar */}
        <div className="max-w-6xl mx-auto mt-2.5">
          <Progress value={((activeStep + 1) / STEPS.length) * 100} className="h-1.5 bg-gray-100" />
        </div>
      </header>

      {/* ── Save Toast Alert ─────────────────────────────────────────── */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* ── Wizard Main Container ────────────────────────────────────── */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 pt-8 flex-1">
        
        {/* Step Navigation Pill Bar */}
        <div className="flex items-center justify-between overflow-x-auto pb-4 gap-2 no-scrollbar mb-6">
          {STEPS.map((s, idx) => {
            const isCompleted = idx < activeStep;
            const isCurrent = idx === activeStep;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(idx)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isCurrent
                    ? "bg-[#C81D45] text-white shadow-sm font-bold"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-white text-[#8E8E93] border border-[rgba(28,28,30,0.06)]"
                }`}
              >
                <span>{isCompleted ? "✓" : isCurrent ? "●" : idx + 1}</span>
                <span className="hidden sm:inline">{s.name}</span>
              </button>
            );
          })}
        </div>

        {/* Wizard Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-6">
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: PROFILE TYPE & CREATOR ──────────────────────────── */}
          {activeStep === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A1F44]">Who are you creating this profile for?</h2>
                <p className="text-xs text-[#636366] mt-1">Select the person whose matrimonial profile is being registered</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Myself (Self)", value: "Self" },
                  { label: "My Son (Parent)", value: "Son (Parent)" },
                  { label: "My Daughter (Parent)", value: "Daughter (Parent)" },
                  { label: "My Brother (Sibling)", value: "Brother (Sibling)" },
                  { label: "My Sister (Sibling)", value: "Sister (Sibling)" },
                  { label: "My Relative / Cousin", value: "Relative" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, createdFor: opt.value })}
                    className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all ${
                      formData.createdFor === opt.value
                        ? "border-[#C81D45] bg-[#C81D45]/5 text-[#C81D45] shadow-sm"
                        : "border-[rgba(28,28,30,0.12)] text-[#0A1F44] hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Creator details if not self */}
              {formData.createdFor !== "Self" && (
                <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-4 text-xs">
                  <div className="flex items-center gap-2 text-purple-950 font-bold">
                    <Shield className="h-4 w-4 text-purple-700" />
                    <span>Parent / Guardian Verification Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-purple-900 mb-1">Guardian / Creator Full Name *</label>
                      <Input
                        name="creatorName"
                        value={formData.creatorName}
                        onChange={handleInputChange}
                        placeholder="e.g. G. Parameswaran Pillai"
                        className="rounded-full h-10 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-purple-900 mb-1">Guardian Mobile Phone *</label>
                      <Input
                        name="creatorPhone"
                        value={formData.creatorPhone}
                        onChange={handleInputChange}
                        placeholder="+91 94470 12345"
                        className="rounded-full h-10 bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: BASIC DETAILS ───────────────────────────────────── */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A1F44]">Basic Candidate Details</h2>
                <p className="text-xs text-[#636366] mt-1">Provide core personal information (Age is calculated automatically)</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">First Name *</label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Candidate First Name"
                    className="rounded-full h-11"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Last Name *</label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Candidate Last Name"
                    className="rounded-full h-11"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                  >
                    <option value="MALE">Male (Groom)</option>
                    <option value="FEMALE">Female (Bride)</option>
                  </select>
                </div>

                {/* Date of Birth with working calendar dropdown */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">
                    Date of Birth (DD/MM/YYYY) *
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      type="text"
                      value={dobDisplay}
                      onChange={handleDobTextChange}
                      placeholder="DD/MM/YYYY"
                      maxLength={10}
                      className="rounded-full h-11 pr-11 font-semibold text-[#0A1F44] tracking-wider w-full"
                      required
                    />
                    {/* Calendar button — uses a real date input overlaid on the icon */}
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <label
                        title="Pick a date"
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0A369D] hover:bg-[#07256b] cursor-pointer transition-all shadow-sm"
                      >
                        <Calendar className="h-4 w-4 text-white pointer-events-none" />
                        <input
                          type="date"
                          max="2008-01-01"
                          min="1940-01-01"
                          value={formData.dateOfBirth}
                          onChange={handleNativeCalendarPicker}
                          style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", top: 0, left: 0, cursor: "pointer" }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Auto-Calculated Age</label>
                  <div className="h-11 rounded-full bg-emerald-50 border border-emerald-200 px-4 flex items-center font-bold text-emerald-800 text-xs">
                    {calculatedAge} years old
                  </div>
                </div>
              </div>

              {/* Height · Marital Status · Fitness Level — all in one row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Height *</label>
                  <select
                    value={`${heightFt}-${heightIn}`}
                    onChange={(e) => {
                      const [ft, inches] = e.target.value.split("-").map(Number);
                      updateHeight(ft, inches);
                    }}
                    className="w-full h-9 rounded-md border border-[rgba(28,28,30,0.18)] px-3 font-semibold text-[#0A1F44] focus:outline-none bg-white text-xs"
                  >
                    {Array.from({ length: 4 }, (_, ftIdx) => ftIdx + 4).flatMap((ft) =>
                      Array.from({ length: 12 }, (_, inIdx) => {
                        const cm = Math.round((ft * 12 + inIdx) * 2.54);
                        return (
                          <option key={`${ft}-${inIdx}`} value={`${ft}-${inIdx}`}>
                            {ft}&apos;{inIdx}&quot; — {cm} cm
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Marital Status *</label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    className="w-full h-9 rounded-md border border-[rgba(28,28,30,0.18)] px-3 font-semibold text-[#0A1F44] focus:outline-none bg-white text-xs"
                  >
                    <option value="Never Married">Never Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                    <option value="Awaiting Divorce">Awaiting Divorce</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Fitness Level</label>
                  <select
                    name="fitnessLevel"
                    value={formData.fitnessLevel}
                    onChange={handleInputChange}
                    className="w-full h-9 rounded-md border border-[rgba(28,28,30,0.18)] px-3 font-semibold text-[#0A1F44] focus:outline-none bg-white text-xs"
                  >
                    <option value="Very Active">Very Active (Gym / Sports)</option>
                    <option value="Active">Active (Yoga / Regular walks)</option>
                    <option value="Average">Average</option>
                    <option value="Occasionally Active">Occasionally Active</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: RELIGION & CULTURAL ─────────────────────────────── */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A1F44]">Religion & Cultural Community</h2>
                <p className="text-xs text-[#636366] mt-1">Select your spiritual background, caste, and dynamic sub-caste</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Religion *</label>
                  <select
                    name="religion"
                    value={formData.religion}
                    onChange={(e) => {
                      const newRel = e.target.value;
                      const relObj = KERALA_RELIGIONS_TAXONOMY.find((r) => r.religion === newRel) || KERALA_RELIGIONS_TAXONOMY[0];
                      setFormData((prev) => ({
                        ...prev,
                        religion: newRel,
                        caste: relObj.castes[0]?.caste || "",
                        subCaste: relObj.castes[0]?.subcastes[0] || "",
                      }));
                    }}
                    className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                  >
                    {KERALA_RELIGIONS_TAXONOMY.map((r) => (
                      <option key={r.religion} value={r.religion}>{r.religion}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Mother Tongue</label>
                  <select
                    name="motherTongue"
                    value={formData.motherTongue}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                  >
                    <option value="Malayalam">Malayalam (മലയാളം)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Telugu">Telugu</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Caste / Community *</label>
                  <select
                    name="caste"
                    value={formData.caste}
                    onChange={(e) => {
                      const newCaste = e.target.value;
                      const cObj = currentRelTaxonomy.castes.find((c) => c.caste === newCaste);
                      setFormData((prev) => ({
                        ...prev,
                        caste: newCaste,
                        subCaste: cObj?.subcastes?.[0] || "",
                      }));
                    }}
                    className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                  >
                    {currentRelTaxonomy.castes.map((c) => (
                      <option key={c.caste} value={c.caste}>
                        {c.caste}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Sub-Caste (Optional)</label>
                  <select
                    name="subCaste"
                    value={formData.subCaste}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                  >
                    <option value="">Any / General Sub-caste</option>
                    {currentSubcastes.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: HOROSCOPE & ASTROLOGY ───────────────────────────── */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A1F44]">Horoscope & Astrological Profile</h2>
                <p className="text-xs text-[#636366] mt-1">Kerala Nakshatram (27 നക്ഷത്രങ്ങൾ), Raasi, and Dosham details</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Star / Nakshatram *</label>
                  <select
                    name="starNakshatram"
                    value={formData.starNakshatram}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                  >
                    {KERALA_NAKSHATRAMS.map((star) => (
                      <option key={star.id} value={star.nameEnglish}>
                        {star.nameMalayalam} ({star.nameEnglish})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Raasi / Moon Sign *</label>
                  <select
                    name="rasi"
                    value={formData.rasi}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                  >
                    {KERALA_RAASIS.map((r) => (
                      <option key={r.id} value={r.nameEnglish}>
                        {r.nameMalayalam} ({r.nameEnglish}) {r.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Dosham / Chevvai</label>
                  <select
                    name="dosham"
                    value={formData.dosham}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                  >
                    {DOSHAM_OPTIONS.map((d, i) => (
                      <option key={i} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Place of Birth</label>
                  <Input
                    name="placeOfBirth"
                    value={formData.placeOfBirth}
                    onChange={handleInputChange}
                    placeholder="e.g. Kozhikode / Thiruvananthapuram"
                    className="rounded-full h-11"
                  />
                </div>
              </div>

              {/* Time of Birth — single box with AM/PM + clock icon */}
              <div className="space-y-1.5 text-xs">
                <label className="block font-bold uppercase tracking-wider text-[#636366]">
                  Time of Birth *
                </label>
                <div className="flex items-center gap-2">
                  {/* HH:MM text input */}
                  <div className="relative flex items-center">
                    <Input
                      type="text"
                      value={`${birthHour}:${birthMinute}`}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9:]/g, "");
                        const parts = raw.split(":");
                        const h = (parts[0] || "10").slice(0, 2);
                        const m = (parts[1] || "30").slice(0, 2);
                        const hNum = Math.min(12, Math.max(1, parseInt(h) || 1));
                        const mNum = Math.min(59, Math.max(0, parseInt(m) || 0));
                        updateTimeOfBirth(
                          hNum.toString().padStart(2, "0"),
                          mNum.toString().padStart(2, "0"),
                          birthAmPm
                        );
                      }}
                      placeholder="10:30"
                      maxLength={5}
                      className="h-9 w-24 rounded-md border border-[rgba(28,28,30,0.18)] px-3 font-bold text-[#0A1F44] text-sm tracking-widest text-center focus:outline-none"
                    />
                    {/* Clock icon overlaid on the right */}
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                      <label title="Pick from clock" className="flex items-center justify-center w-6 h-6 rounded cursor-pointer hover:bg-gray-100 text-[#C81D45]">
                        <Clock className="h-3.5 w-3.5 pointer-events-none" />
                        <input
                          type="time"
                          onChange={handleNativeTimeChange}
                          style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", top: 0, left: 0, cursor: "pointer" }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* AM / PM toggle — same line */}
                  <div className="flex rounded-md border border-[rgba(28,28,30,0.18)] overflow-hidden h-9 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => updateTimeOfBirth(birthHour, birthMinute, "AM")}
                      className={`px-3 transition-colors ${
                        birthAmPm === "AM"
                          ? "bg-[#C81D45] text-white"
                          : "bg-white text-[#636366] hover:text-[#0A1F44]"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTimeOfBirth(birthHour, birthMinute, "PM")}
                      className={`px-3 transition-colors ${
                        birthAmPm === "PM"
                          ? "bg-[#C81D45] text-white"
                          : "bg-white text-[#636366] hover:text-[#0A1F44]"
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: EDUCATION & CAREER ──────────────────────────────── */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A1F44]">Education & Career</h2>
                <p className="text-xs text-[#636366] mt-1">22 Occupation categories and searchable global qualifications</p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Searchable Higher Education Dropdown */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <label className="block font-bold uppercase tracking-wider text-[#636366]">
                      Highest Qualification (Worldwide Education) *
                    </label>
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8E8E93]" />
                      <input
                        type="text"
                        placeholder="Search degree (e.g. B.Tech, MBBS, MBA, CA)..."
                        value={eduSearchTerm}
                        onChange={(e) => setEduSearchTerm(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 text-[11px] rounded-full border border-[rgba(28,28,30,0.12)] bg-[#FCFBF7] focus:outline-none"
                      />
                    </div>
                  </div>

                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                    required
                  >
                    <option value="">Select Degree / Qualification</option>
                    {filteredWorldEducation.map((cat) => (
                      <optgroup key={cat.category} label={`── ${cat.category} ──`}>
                        {cat.degrees.map((deg) => (
                          <option key={deg} value={deg}>
                            {deg}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Occupation Category *</label>
                    <select
                      name="occupationCategory"
                      value={formData.occupationCategory}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                    >
                      {OCCUPATION_CATEGORIES.map((occ, i) => (
                        <option key={i} value={occ}>{occ}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Profession / Role</label>
                    <Input
                      name="profession"
                      value={formData.profession}
                      onChange={handleInputChange}
                      placeholder="e.g. Senior Software Architect"
                      className="rounded-full h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Company / Organization</label>
                    <Input
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g. Oracle / Technopark"
                      className="rounded-full h-11"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Annual Income Bracket</label>
                    <select
                      name="incomeBracket"
                      value={formData.incomeBracket}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                    >
                      <option value="₹5 - 10 Lakhs / year">₹5 - 10 Lakhs / year</option>
                      <option value="₹10 - 18 Lakhs / year">₹10 - 18 Lakhs / year</option>
                      <option value="₹18 - 25 Lakhs / year">₹18 - 25 Lakhs / year</option>
                      <option value="₹25 - 35 Lakhs / year">₹25 - 35 Lakhs / year</option>
                      <option value="₹35 - 50+ Lakhs / year">₹35 - 50+ Lakhs / year</option>
                      <option value="Prefer not to disclose">Prefer not to disclose</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 6: LOCATION & LIVING ───────────────────────────────── */}
          {activeStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A1F44]">Location & Residence</h2>
                <p className="text-xs text-[#636366] mt-1">14 Kerala districts and dynamic town selection</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Native District (Kerala) *</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={(e) => {
                      const newDist = e.target.value;
                      const dObj = KERALA_DISTRICTS.find((d) => d.name === newDist) || KERALA_DISTRICTS[0];
                      setFormData((prev) => ({
                        ...prev,
                        district: newDist,
                        city: dObj.popularTowns[0] || "",
                      }));
                    }}
                    className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                  >
                    {KERALA_DISTRICTS.map((d) => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">City / Popular Town *</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                  >
                    <option value="">Select Town in {formData.district}</option>
                    {currentDistrictObj.popularTowns.map((town) => (
                      <option key={town} value={town}>
                        {town}
                      </option>
                    ))}
                    <option value="Other Town">Other Town / Suburb</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Living Status</label>
                  <select
                    name="livingIn"
                    value={formData.livingIn}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                  >
                    <option value="India">Living in Kerala / India</option>
                    <option value="UAE / GCC">Living in Dubai / UAE / GCC</option>
                    <option value="Abroad">Living in UK / USA / Europe</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 7: CONTACT INFORMATION (STRICTLY PRIVATE) ──────────── */}
          {activeStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A1F44]">Contact Information (Strictly Confidential)</h2>
                <p className="text-xs text-[#636366] mt-1">Phone numbers are NEVER exposed publicly; unlocked only upon mutual consent for 24h</p>
              </div>

              <div className="p-4 bg-purple-50 text-purple-950 border border-purple-200 rounded-2xl text-xs flex items-start gap-2">
                <Lock className="h-4 w-4 text-purple-700 flex-shrink-0 mt-0.5" />
                <span>Zero Public Phone Exposure: Stored with AES-256-GCM encryption.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Candidate Mobile Number *</label>
                  <Input
                    name="userPhone"
                    value={formData.userPhone}
                    onChange={handleInputChange}
                    placeholder="+91 94470 12345"
                    className="rounded-full h-11"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Guardian / Parent Mobile</label>
                  <Input
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                    placeholder="+91 94471 99887"
                    className="rounded-full h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 8: FOOD & HABITS ────────────────────────────────────── */}
          {activeStep === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A1F44]">Food Habits & Lifestyle</h2>
                <p className="text-xs text-[#636366] mt-1">Specify your personal lifestyle choices</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Dietary Habits</label>
                  <select
                    name="foodHabits"
                    value={formData.foodHabits}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                  >
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Eggetarian">Eggetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Smoking</label>
                  <select
                    name="smoking"
                    value={formData.smoking}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                  >
                    <option value="No">No</option>
                    <option value="Occasionally">Occasionally</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Drinking</label>
                  <select
                    name="drinking"
                    value={formData.drinking}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] px-4 font-semibold text-[#0A1F44] focus:outline-none"
                  >
                    <option value="No">No</option>
                    <option value="Socially / Occasionally">Socially / Occasionally</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 9: FAMILY DETAILS & SIBLINGS CALCULATOR ─────────────── */}
          {activeStep === 8 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A1F44]">Family Background & Hierarchy</h2>
                <p className="text-xs text-[#636366] mt-1">Parents, values, and auto-calculating sibling details</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Father's Name & Profession</label>
                  <Input
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    placeholder="e.g. K. Narayanan (Retd. Bank Manager)"
                    className="rounded-full h-11"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Mother's Name & Profession</label>
                  <Input
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    placeholder="e.g. Radhamani (Teacher)"
                    className="rounded-full h-11"
                  />
                </div>
              </div>

              {/* Sibling Auto Calculator */}
              <div className="p-5 bg-[#FCFBF7] rounded-2xl border border-[rgba(28,28,30,0.06)] space-y-4 text-xs">
                <h4 className="font-bold text-[#0A1F44]">Sibling Hierarchy (Auto Calculated)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Brothers */}
                  <div className="space-y-2">
                    <span className="font-semibold text-[#0A1F44] block">Brothers</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-[#8E8E93]">Total</span>
                        <Input
                          type="number"
                          value={formData.totalBrothers}
                          onChange={(e) => setFormData({ ...formData, totalBrothers: parseInt(e.target.value) || 0 })}
                          min={0}
                          className="h-9 rounded-full bg-white text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8E8E93]">Married</span>
                        <Input
                          type="number"
                          value={formData.marriedBrothers}
                          onChange={(e) => setFormData({ ...formData, marriedBrothers: parseInt(e.target.value) || 0 })}
                          min={0}
                          className="h-9 rounded-full bg-white text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8E8E93]">Unmarried</span>
                        <div className="h-9 rounded-full bg-emerald-50 border border-emerald-200 px-2 flex items-center justify-center font-bold text-emerald-800 text-xs">
                          {unmarriedBrothers}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sisters */}
                  <div className="space-y-2">
                    <span className="font-semibold text-[#0A1F44] block">Sisters</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-[#8E8E93]">Total</span>
                        <Input
                          type="number"
                          value={formData.totalSisters}
                          onChange={(e) => setFormData({ ...formData, totalSisters: parseInt(e.target.value) || 0 })}
                          min={0}
                          className="h-9 rounded-full bg-white text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8E8E93]">Married</span>
                        <Input
                          type="number"
                          value={formData.marriedSisters}
                          onChange={(e) => setFormData({ ...formData, marriedSisters: parseInt(e.target.value) || 0 })}
                          min={0}
                          className="h-9 rounded-full bg-white text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8E8E93]">Unmarried</span>
                        <div className="h-9 rounded-full bg-emerald-50 border border-emerald-200 px-2 flex items-center justify-center font-bold text-emerald-800 text-xs">
                          {unmarriedSisters}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 10: HOBBIES & ABOUT ME WITH LIVE COUNTER ───────────── */}
          {activeStep === 9 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A1F44]">Hobbies & About Yourself</h2>
                <p className="text-xs text-[#636366] mt-1">Express your personality, lifestyle, and passions</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#636366]">About Me (Bio Description)</label>
                  <span className="text-[11px] font-semibold text-[#C81D45]">
                    {formData.bio.length} / 1000 characters
                  </span>
                </div>
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  maxLength={1000}
                  placeholder="Tell potential matches about your personality, family values, work passion, and what makes you unique..."
                  className="w-full rounded-2xl border border-[rgba(28,28,30,0.12)] p-4 text-xs font-medium focus:outline-none resize-none"
                  required
                />
              </div>

              {/* Photo Upload Section */}
              <div className="p-6 rounded-3xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-4">
                <h4 className="font-bold text-[#0A1F44] text-xs">Profile Photographs</h4>
                <div className="flex flex-wrap gap-3">
                  {photosList.map((url, i) => (
                    <img key={i} src={url} alt="" className="h-20 w-20 rounded-2xl object-cover border border-[rgba(28,28,30,0.12)] shadow-sm" />
                  ))}
                  <label className="h-20 w-20 rounded-2xl border-2 border-dashed border-[rgba(28,28,30,0.18)] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 text-[#8E8E93]">
                    <Camera className="h-5 w-5" />
                    <span className="text-[9px] font-bold mt-1">Upload</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 11: 3-TIER PARTNER PREFERENCES ─────────────────────── */}
          {activeStep === 10 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A1F44]">3-Tier Partner Preferences</h2>
                <p className="text-xs text-[#636366] mt-1">Configure your expectations as "Preferred" or "Strict Requirement" for intelligent 2-way matching</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* 1. Age Range */}
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A1F44]">Preferred Age Range</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#C81D45]">
                      <input
                        type="checkbox"
                        checked={formData.partnerAgeStrict}
                        onChange={(e) => setFormData({ ...formData, partnerAgeStrict: e.target.checked })}
                      />
                      <span>Strict Requirement</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={formData.partnerAgeMin}
                      onChange={(e) => setFormData({ ...formData, partnerAgeMin: parseInt(e.target.value) || 18 })}
                      placeholder="Min Age"
                      className="h-10 rounded-full bg-white text-xs"
                    />
                    <Input
                      type="number"
                      value={formData.partnerAgeMax}
                      onChange={(e) => setFormData({ ...formData, partnerAgeMax: parseInt(e.target.value) || 40 })}
                      placeholder="Max Age"
                      className="h-10 rounded-full bg-white text-xs"
                    />
                  </div>
                </div>

                {/* 2. Height Range */}
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A1F44]">Preferred Height (cm)</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#C81D45]">
                      <input
                        type="checkbox"
                        checked={formData.partnerHeightStrict}
                        onChange={(e) => setFormData({ ...formData, partnerHeightStrict: e.target.checked })}
                      />
                      <span>Strict</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={formData.partnerHeightMin}
                      onChange={(e) => setFormData({ ...formData, partnerHeightMin: parseInt(e.target.value) || 140 })}
                      placeholder="Min Height (e.g. 155)"
                      className="h-10 rounded-full bg-white text-xs"
                    />
                    <Input
                      type="number"
                      value={formData.partnerHeightMax}
                      onChange={(e) => setFormData({ ...formData, partnerHeightMax: parseInt(e.target.value) || 200 })}
                      placeholder="Max Height (e.g. 185)"
                      className="h-10 rounded-full bg-white text-xs"
                    />
                  </div>
                </div>

                {/* 3. Marital Status */}
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A1F44]">Marital Status</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#C81D45]">
                      <input
                        type="checkbox"
                        checked={formData.partnerMaritalStatusStrict}
                        onChange={(e) => setFormData({ ...formData, partnerMaritalStatusStrict: e.target.checked })}
                      />
                      <span>Strict</span>
                    </label>
                  </div>
                  <select
                    value={formData.partnerMaritalStatus}
                    onChange={(e) => setFormData({ ...formData, partnerMaritalStatus: e.target.value })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold bg-white"
                  >
                    <option value="Never Married">Never Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                    <option value="Open to Any">Open to Any / Marital Status No Bar</option>
                  </select>
                </div>

                {/* 4. Mother Tongue */}
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A1F44]">Mother Tongue</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#C81D45]">
                      <input
                        type="checkbox"
                        checked={formData.partnerMotherTongueStrict}
                        onChange={(e) => setFormData({ ...formData, partnerMotherTongueStrict: e.target.checked })}
                      />
                      <span>Strict</span>
                    </label>
                  </div>
                  <select
                    value={formData.partnerMotherTongue}
                    onChange={(e) => setFormData({ ...formData, partnerMotherTongue: e.target.value })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold bg-white"
                  >
                    <option value="Malayalam">Malayalam (മലയാളം)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Open to Any">Open to Any</option>
                  </select>
                </div>

                {/* 5. Physical Status */}
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A1F44]">Physical Status</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#C81D45]">
                      <input
                        type="checkbox"
                        checked={formData.partnerPhysicalStatusStrict}
                        onChange={(e) => setFormData({ ...formData, partnerPhysicalStatusStrict: e.target.checked })}
                      />
                      <span>Strict</span>
                    </label>
                  </div>
                  <select
                    value={formData.partnerPhysicalStatus}
                    onChange={(e) => setFormData({ ...formData, partnerPhysicalStatus: e.target.value })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Physically Challenged">Physically Challenged</option>
                    <option value="Doesn't Matter">Doesn't Matter</option>
                  </select>
                </div>

                {/* 6. Religion */}
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A1F44]">Religion Preference</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#C81D45]">
                      <input
                        type="checkbox"
                        checked={formData.partnerReligionStrict}
                        onChange={(e) => setFormData({ ...formData, partnerReligionStrict: e.target.checked })}
                      />
                      <span>Strict</span>
                    </label>
                  </div>
                  <select
                    value={formData.partnerReligion}
                    onChange={(e) => setFormData({ ...formData, partnerReligion: e.target.value })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold bg-white"
                  >
                    <option value="Hindu">Hindu</option>
                    <option value="Christian">Christian</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Jain">Jain</option>
                    <option value="Any">Open to Any / Inter-faith</option>
                  </select>
                </div>

                {/* 7. Caste */}
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A1F44]">Caste / Community</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#C81D45]">
                      <input
                        type="checkbox"
                        checked={formData.partnerCasteStrict}
                        onChange={(e) => setFormData({ ...formData, partnerCasteStrict: e.target.checked })}
                      />
                      <span>Strict</span>
                    </label>
                  </div>
                  <select
                    value={formData.partnerCaste}
                    onChange={(e) => setFormData({ ...formData, partnerCaste: e.target.value })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold bg-white"
                  >
                    <option value="Any">Any / Caste No Bar</option>
                    {currentRelTaxonomy.castes.map((c) => (
                      <option key={c.caste} value={c.caste}>{c.caste}</option>
                    ))}
                  </select>
                </div>

                {/* 8. Sub-Caste */}
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A1F44]">Sub-Caste</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#C81D45]">
                      <input
                        type="checkbox"
                        checked={formData.partnerSubCasteStrict}
                        onChange={(e) => setFormData({ ...formData, partnerSubCasteStrict: e.target.checked })}
                      />
                      <span>Strict</span>
                    </label>
                  </div>
                  <select
                    value={formData.partnerSubCaste}
                    onChange={(e) => setFormData({ ...formData, partnerSubCaste: e.target.value })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold bg-white"
                  >
                    <option value="Any">Any / Open to All Subcastes</option>
                    {currentSubcastes.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                {/* 9. Dosham / Horoscope */}
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A1F44]">Astrological Dosham</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#C81D45]">
                      <input
                        type="checkbox"
                        checked={formData.partnerDoshamStrict}
                        onChange={(e) => setFormData({ ...formData, partnerDoshamStrict: e.target.checked })}
                      />
                      <span>Strict</span>
                    </label>
                  </div>
                  <select
                    value={formData.partnerDosham}
                    onChange={(e) => setFormData({ ...formData, partnerDosham: e.target.value })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold bg-white"
                  >
                    <option value="No Dosham / Doesn't Matter">No Dosham / Doesn't Matter</option>
                    <option value="No Dosham (ശുദ്ധ ജാതകം)">No Dosham (ശുദ്ധ ജാതകം only)</option>
                    <option value="Chevvai Dosham">Chevvai Dosham Acceptable</option>
                    <option value="Rahu/Ketu Dosham">Rahu/Ketu Dosham Acceptable</option>
                  </select>
                </div>

                {/* 10. Education */}
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A1F44]">Education Level</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#C81D45]">
                      <input
                        type="checkbox"
                        checked={formData.partnerEducationStrict}
                        onChange={(e) => setFormData({ ...formData, partnerEducationStrict: e.target.checked })}
                      />
                      <span>Strict</span>
                    </label>
                  </div>
                  <select
                    value={formData.partnerEducation}
                    onChange={(e) => setFormData({ ...formData, partnerEducation: e.target.value })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold bg-white"
                  >
                    <option value="Graduate / Post Graduate">Graduate / Post Graduate</option>
                    <option value="Engineering & Technology">Engineering & Technology</option>
                    <option value="Medicine & Healthcare">Medicine (MBBS / MD / Dental)</option>
                    <option value="Management (MBA / PGDM)">Management (MBA / PGDM)</option>
                    <option value="Finance & CA">CA / CFA / Finance</option>
                    <option value="Doctorate / Ph.D.">Doctorate / Ph.D.</option>
                    <option value="Any Degree">Any Degree / Qualification</option>
                  </select>
                </div>

                {/* 11. Profession / Occupation */}
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A1F44]">Profession / Occupation</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#C81D45]">
                      <input
                        type="checkbox"
                        checked={formData.partnerProfessionStrict}
                        onChange={(e) => setFormData({ ...formData, partnerProfessionStrict: e.target.checked })}
                      />
                      <span>Strict</span>
                    </label>
                  </div>
                  <select
                    value={formData.partnerProfession}
                    onChange={(e) => setFormData({ ...formData, partnerProfession: e.target.value })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold bg-white"
                  >
                    <option value="Any Profession">Any Profession / Working</option>
                    {OCCUPATION_CATEGORIES.map((occ, i) => (
                      <option key={i} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                {/* 12. Eating / Food Habit */}
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A1F44]">Dietary / Food Habits</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#C81D45]">
                      <input
                        type="checkbox"
                        checked={formData.partnerFoodHabitsStrict}
                        onChange={(e) => setFormData({ ...formData, partnerFoodHabitsStrict: e.target.checked })}
                      />
                      <span>Strict</span>
                    </label>
                  </div>
                  <select
                    value={formData.partnerFoodHabits}
                    onChange={(e) => setFormData({ ...formData, partnerFoodHabits: e.target.value })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold bg-white"
                  >
                    <option value="Any">Open to Any</option>
                    <option value="Vegetarian">Vegetarian Only</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Eggetarian">Eggetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>

                {/* 13. Drinking Habit */}
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A1F44]">Drinking Habit</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#C81D45]">
                      <input
                        type="checkbox"
                        checked={formData.partnerDrinkingStrict}
                        onChange={(e) => setFormData({ ...formData, partnerDrinkingStrict: e.target.checked })}
                      />
                      <span>Strict</span>
                    </label>
                  </div>
                  <select
                    value={formData.partnerDrinking}
                    onChange={(e) => setFormData({ ...formData, partnerDrinking: e.target.value })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold bg-white"
                  >
                    <option value="Non-Drinker">Non-Drinker (Never Drinks)</option>
                    <option value="Social Drinker">Social / Occasional Drinker Acceptable</option>
                    <option value="Doesn't Matter">Doesn't Matter</option>
                  </select>
                </div>

                {/* 14. Smoking Habit */}
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A1F44]">Smoking Habit</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#C81D45]">
                      <input
                        type="checkbox"
                        checked={formData.partnerSmokingStrict}
                        onChange={(e) => setFormData({ ...formData, partnerSmokingStrict: e.target.checked })}
                      />
                      <span>Strict</span>
                    </label>
                  </div>
                  <select
                    value={formData.partnerSmoking}
                    onChange={(e) => setFormData({ ...formData, partnerSmoking: e.target.value })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold bg-white"
                  >
                    <option value="Non-Smoker">Non-Smoker Only</option>
                    <option value="Doesn't Matter">Doesn't Matter</option>
                  </select>
                </div>

                {/* 15. Country / Residency */}
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A1F44]">Country / Residency</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#C81D45]">
                      <input
                        type="checkbox"
                        checked={formData.partnerCountryStrict}
                        onChange={(e) => setFormData({ ...formData, partnerCountryStrict: e.target.checked })}
                      />
                      <span>Strict</span>
                    </label>
                  </div>
                  <select
                    value={formData.partnerCountry}
                    onChange={(e) => setFormData({ ...formData, partnerCountry: e.target.value })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold bg-white"
                  >
                    <option value="India">Living in Kerala / India</option>
                    <option value="UAE / GCC">Living in Dubai / UAE / GCC</option>
                    <option value="UK / Europe">Living in UK / Europe</option>
                    <option value="USA / Canada">Living in USA / Canada</option>
                    <option value="Open to Any">Open to Any / Worldwide NRI</option>
                  </select>
                </div>

                {/* 16. Residing District / City */}
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A1F44]">Residing District / City</span>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#C81D45]">
                      <input
                        type="checkbox"
                        checked={formData.partnerDistrictStrict}
                        onChange={(e) => setFormData({ ...formData, partnerDistrictStrict: e.target.checked })}
                      />
                      <span>Strict</span>
                    </label>
                  </div>
                  <select
                    value={formData.partnerDistrict}
                    onChange={(e) => setFormData({ ...formData, partnerDistrict: e.target.value })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold bg-white"
                  >
                    <option value="Any District">Any District in Kerala / Open</option>
                    {KERALA_DISTRICTS.map((d) => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

              </div>
            </div>
          )}

          {/* ── STEP 12: PREVIEW & PUBLISH ──────────────────────────────── */}
          {activeStep === 11 && (
            <div className="space-y-6 text-xs">
              <div>
                <h2 className="text-xl font-bold text-[#0A1F44]">Review & Publish Profile</h2>
                <p className="text-xs text-[#636366] mt-1">Here is how your profile appears to prospective matches</p>
              </div>

              <div className="p-6 rounded-3xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.08)] space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center text-xl font-bold text-[#C81D45] overflow-hidden">
                    {photosList[0] ? <img src={photosList[0]} alt="" className="h-full w-full object-cover" /> : formData.firstName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0A1F44]">{formData.firstName} {formData.lastName}</h3>
                    <p className="text-xs text-[#636366]">{calculatedAge} yrs · {formData.profession} · {formData.district}, Kerala</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {formData.createdFor === "Self" ? "Self Verified" : `Managed by ${formData.creatorRelation}`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-[rgba(28,28,30,0.06)] text-xs">
                  <div>
                    <span className="text-[#8E8E93] text-[10px] font-bold uppercase block">Date of Birth</span>
                    <span className="font-bold text-[#0A1F44] block mt-0.5">{formatDateDDMMYYYY(formData.dateOfBirth) || dobDisplay} ({calculatedAge} yrs)</span>
                  </div>
                  <div>
                    <span className="text-[#8E8E93] text-[10px] font-bold uppercase block">Time & Place of Birth</span>
                    <span className="font-bold text-[#0A1F44] block mt-0.5">{formData.timeOfBirth || "10:30 AM"} · {formData.placeOfBirth || formData.city || "Kerala"}</span>
                  </div>
                  <div>
                    <span className="text-[#8E8E93] text-[10px] font-bold uppercase block">Star & Raasi</span>
                    <span className="font-bold text-[#0A1F44] block mt-0.5">{formData.starNakshatram} ({formData.rasi})</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[rgba(28,28,30,0.06)] space-y-2">
                  <span className="font-bold text-[#0A1F44] block">About Candidate</span>
                  <p className="text-xs text-[#636366] italic leading-relaxed">
                    "{formData.bio || "Educated, family-oriented Malayali seeking a compatible partner."}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Wizard Navigation Footer ────────────────────────────────── */}
          <div className="flex justify-between items-center pt-6 border-t border-[rgba(28,28,30,0.08)]">
            <button
              type="button"
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className={`px-5 py-2.5 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold flex items-center gap-1.5 ${
                activeStep === 0 ? "opacity-40 cursor-not-allowed text-[#8E8E93]" : "text-[#0A1F44] hover:bg-gray-50"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={loading}
              className="px-7 py-2.5 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <span>{activeStep === STEPS.length - 1 ? "Publish Profile ✓" : "Save & Continue"}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
