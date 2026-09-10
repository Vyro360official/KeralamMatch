"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import HoroscopeMatchButton from "@/components/astrology/horoscope-match-button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import MatrimonialLogoLoader from "@/components/ui/matrimonial-logo-loader";
import { searchProfilesAction, getProfileDetailsAction } from "@/modules/profile/profile.controller";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  FilterX,
  Heart,
  ShieldCheck,
  ChevronDown,
  X,
  Star,
  Send,
  Sliders,
  TrendingUp,
  Bookmark
} from "lucide-react";
import { KERALA_DISTRICTS, KERALA_RELIGIONS_TAXONOMY } from "@/lib/kerala-data";

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<"Recommended" | "Recently Active" | "New Members" | "Premium Matches">("Recommended");
  const [nlpQuery, setNlpQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null);

  // Filters state
  const [religion, setReligion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCaste, setSelectedCaste] = useState("");
  const [profession, setProfession] = useState("");
  const [education, setEducation] = useState("");
  const [minAge, setMinAge] = useState(24);
  const [maxAge, setMaxAge] = useState(30);
  const [minHeight, setMinHeight] = useState("");
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isNonVeg, setIsNonVeg] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Responsive Drawer open state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Load current user profile for sidebar
  useEffect(() => {
    async function loadMe() {
      const res = await getProfileDetailsAction();
      if (res.success && res.profile) {
        setCurrentUserProfile(res.profile);
      }
    }
    loadMe();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const apiFilters: any = {};
    if (religion) apiFilters.religion = religion;
    if (profession) apiFilters.profession = profession;

    const result = await searchProfilesAction(apiFilters, 1, 30);
    if (result.success && (result as any).results) {
      let filtered = (result as any).results.filter((p: any) => {
        const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
        const ageMatch = age >= minAge && age <= maxAge;
        const districtMatch = !selectedDistrict || p.district === selectedDistrict;
        const casteMatch = !selectedCaste || p.caste === selectedCaste;
        const verifiedMatch = !onlyVerified || p.verificationStatus === "VERIFIED";
        return ageMatch && districtMatch && casteMatch && verifiedMatch;
      });

      // Sandbox fallback data in development environments
      if (filtered.length === 0 && process.env.NODE_ENV !== "production") {
        const devCandidates = [
          {
            id: "prf-1",
            firstName: "Ananya",
            lastName: "K.",
            dateOfBirth: "1998-05-15",
            religion: "Hindu",
            caste: "Nair",
            district: "Kochi",
            profession: "Engineer",
            verificationStatus: "VERIFIED",
            height: 162,
            media: [{ url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" }],
          },
          {
            id: "prf-2",
            firstName: "Meera",
            lastName: "S.",
            dateOfBirth: "1999-09-20",
            religion: "Hindu",
            caste: "Nair",
            district: "Trivandrum",
            profession: "Teacher",
            verificationStatus: "VERIFIED",
            height: 160,
            media: [{ url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400" }],
          },
          {
            id: "prf-3",
            firstName: "Sneha",
            lastName: "R.",
            dateOfBirth: "1996-03-10",
            religion: "Hindu",
            caste: "Nair",
            district: "Calicut",
            profession: "Architect",
            verificationStatus: "VERIFIED",
            height: 165,
            media: [{ url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400" }],
          },
          {
            id: "prf-4",
            firstName: "Vidhya",
            lastName: "V.",
            dateOfBirth: "2000-01-25",
            religion: "Hindu",
            caste: "Nair",
            district: "Kochi",
            profession: "Software Developer",
            verificationStatus: "VERIFIED",
            height: 158,
            media: [{ url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400" }],
          },
        ];

        filtered = devCandidates.filter((p) => {
          const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
          const ageMatch = age >= minAge && age <= maxAge;
          const districtMatch = !selectedDistrict || p.district.toLowerCase() === selectedDistrict.toLowerCase();
          const casteMatch = !selectedCaste || p.caste.toLowerCase() === selectedCaste.toLowerCase();
          const verifiedMatch = !onlyVerified || p.verificationStatus === "VERIFIED";
          return ageMatch && districtMatch && casteMatch && verifiedMatch;
        });
      }

      setProfiles(filtered);
      setTotalMatches(filtered.length);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, [religion, selectedDistrict, selectedCaste, profession, minAge, maxAge, onlyVerified]);

  const handleAiSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = nlpQuery.toLowerCase();

    if (query.includes("hindu")) setReligion("Hindu");
    else if (query.includes("christian")) setReligion("Christian");
    else if (query.includes("muslim")) setReligion("Muslim");

    if (query.includes("nair")) setSelectedCaste("Nair");
    else if (query.includes("ezhava")) setSelectedCaste("Ezhava");

    if (query.includes("ernakulam") || query.includes("kochi")) setSelectedDistrict("Kochi");
    else if (query.includes("trivandrum") || query.includes("thiruvananthapuram")) setSelectedDistrict("Trivandrum");

    if (query.includes("doctor")) setProfession("Doctor");
    else if (query.includes("engineer") || query.includes("software")) setProfession("Engineer");
  };

  const resetFilters = () => {
    setReligion("");
    setSelectedDistrict("");
    setSelectedCaste("");
    setProfession("");
    setEducation("");
    setMinAge(24);
    setMaxAge(30);
    setMinHeight("");
    setIsVegetarian(false);
    setIsNonVeg(false);
    setOnlyVerified(false);
    setNlpQuery("");
  };

  const FilterPanelContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#0A1F44] dark:text-white uppercase tracking-wider">Filters</h3>
        <button
          onClick={resetFilters}
          className="text-[10px] font-bold text-[#FF1475] hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="space-y-4">
        {/* Basic Details */}
        <div className="space-y-3.5">
          <span className="block text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest">Basic Details</span>

          {/* Age range inputs */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Age Range</label>
            <div className="flex items-center space-x-2">
              <select
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                className="flex-1 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#FCFBF7] dark:bg-[#07132B] text-slate-900 dark:text-white text-xs font-semibold px-2 focus:outline-none"
              >
                {[18, 20, 22, 24, 26, 28, 30].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <span className="text-slate-400 text-xs">-</span>
              <select
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                className="flex-1 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#FCFBF7] dark:bg-[#07132B] text-slate-900 dark:text-white text-xs font-semibold px-2 focus:outline-none"
              >
                {[25, 27, 30, 33, 36, 40, 50].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Height */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Height</label>
            <select
              value={minHeight}
              onChange={(e) => setMinHeight(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#FCFBF7] dark:bg-[#07132B] text-slate-900 dark:text-white text-xs font-semibold px-3 focus:outline-none"
            >
              <option value="">Any</option>
              <option value="150">150 cm +</option>
              <option value="160">160 cm +</option>
              <option value="170">170 cm +</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Location</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#FCFBF7] dark:bg-[#07132B] text-slate-900 dark:text-white text-xs font-semibold px-3 focus:outline-none"
            >
              <option value="">Any Location</option>
              <option value="Kochi">Kochi</option>
              <option value="Trivandrum">Trivandrum</option>
              <option value="Calicut">Calicut</option>
              <option value="Kottayam">Kottayam</option>
            </select>
          </div>

          {/* Religion */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Religion</label>
            <select
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#FCFBF7] dark:bg-[#07132B] text-slate-900 dark:text-white text-xs font-semibold px-3 focus:outline-none"
            >
              <option value="">Any</option>
              <option value="Hindu">Hindu</option>
              <option value="Christian">Christian</option>
              <option value="Muslim">Muslim</option>
            </select>
          </div>

          {/* Caste */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Community</label>
            <select
              value={selectedCaste}
              onChange={(e) => setSelectedCaste(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#FCFBF7] dark:bg-[#07132B] text-slate-900 dark:text-white text-xs font-semibold px-3 focus:outline-none"
            >
              <option value="">Any</option>
              <option value="Nair">Nair</option>
              <option value="Ezhava">Ezhava</option>
              <option value="Syrian Catholic">Syrian Catholic</option>
            </select>
          </div>

          {/* Education */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Education</label>
            <select
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#FCFBF7] dark:bg-[#07132B] text-slate-900 dark:text-white text-xs font-semibold px-3 focus:outline-none"
            >
              <option value="">Any</option>
              <option value="Doctor">Doctoral / MD</option>
              <option value="PostGraduate">Post Graduate</option>
              <option value="Graduate">Bachelors Degree</option>
            </select>
          </div>

          {/* Profession */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Profession</label>
            <select
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#FCFBF7] dark:bg-[#07132B] text-slate-900 dark:text-white text-xs font-semibold px-3 focus:outline-none"
            >
              <option value="">Any</option>
              <option value="Engineer">Software Engineer</option>
              <option value="Doctor">Doctor</option>
              <option value="Teacher">Teacher</option>
              <option value="Architect">Architect</option>
            </select>
          </div>
        </div>

        {/* Lifestyle Preferences */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="block text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest mb-1">Lifestyle</span>
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isVegetarian}
              onChange={() => setIsVegetarian(!isVegetarian)}
              className="rounded text-[#C81D45] focus:ring-[#C81D45]"
            />
            <span>Vegetarian</span>
          </label>
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isNonVeg}
              onChange={() => setIsNonVeg(!isNonVeg)}
              className="rounded text-[#C81D45] focus:ring-[#C81D45]"
            />
            <span>Non-Vegetarian</span>
          </label>
        </div>

        {/* Verification Filters */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="block text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest mb-1">Other Preferences</span>
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={() => setOnlyVerified(!onlyVerified)}
              className="rounded text-[#C81D45] focus:ring-[#C81D45]"
            />
            <span>Only show verified profiles</span>
          </label>
        </div>

        {/* Apply and Save CTAs */}
        <div className="space-y-2 pt-4">
          <button
            onClick={() => { fetchProfiles(); setIsFilterDrawerOpen(false); }}
            className="w-full py-2.5 rounded-xl bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold transition-all shadow-xs"
          >
            Apply Filters
          </button>
          <button
            onClick={() => alert("Search Saved Successfully!")}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Save Search</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] dark:bg-[#07132B] text-[#1C1C1E] dark:text-white transition-colors">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 mb-16 lg:mb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Navigation Sidebar */}
          <DashboardSidebar userProfile={currentUserProfile} />

          {/* Main Discovery Canvas */}
          <main className="lg:col-span-6 space-y-6">
            
            {/* Header Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1F44] dark:text-white tracking-tight">Find Matches</h1>
              <p className="text-xs text-[#636366] dark:text-slate-400 font-medium">Discover compatible matches based on your preferences.</p>
            </div>

            {/* Top view filter tabs */}
            <div className="flex items-center justify-between border-b border-[rgba(28,28,30,0.08)] pb-2 flex-wrap gap-4">
              <div className="flex space-x-5 text-xs font-bold text-[#636366] dark:text-slate-400">
                {(["Recommended", "Recently Active", "New Members", "Premium Matches"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 transition-all relative ${
                      activeTab === tab ? "text-[#FF1475]" : "hover:text-[#0A1F44] dark:hover:text-white"
                    }`}
                  >
                    <span>{tab}</span>
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF1475] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Sort selector dropdown */}
              <div className="flex items-center space-x-1 text-xs font-bold text-slate-500">
                <span>Sort by:</span>
                <button className="text-slate-800 dark:text-white flex items-center gap-0.5">
                  <span>Best Match</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Conversational AI search input prompt */}
            <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-[10px] font-bold text-[#C81D45] uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span>AI Smart Search</span>
              </div>
              <form onSubmit={handleAiSearch} className="relative flex items-center">
                <Input
                  type="text"
                  placeholder="Describe your ideal match..."
                  value={nlpQuery}
                  onChange={(e) => setNlpQuery(e.target.value)}
                  className="w-full h-10 rounded-xl border-slate-200 pl-4 pr-24 text-xs font-medium focus:border-[#C81D45]"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-[#C81D45] hover:bg-[#A51436] text-white text-[10px] font-bold shadow-xs"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Mobile View: Toggle Filter Drawer Button */}
            <div className="lg:hidden flex justify-between items-center bg-white p-3 border border-[rgba(28,28,30,0.06)] rounded-xl">
              <span className="text-xs font-bold text-[#0A1F44]">{totalMatches} Profiles Found</span>
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#C81D45] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Sliders className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>

            {/* Candidates profiles grid */}
            {loading ? (
              <div className="bg-white rounded-2xl p-16 flex flex-col items-center justify-center border border-[rgba(28,28,30,0.06)] shadow-xs">
                <MatrimonialLogoLoader
                  size="md"
                  text="Finding Matches in Kerala..."
                  subtext="Filtering verified profiles according to your preferences"
                />
              </div>
            ) : profiles.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center text-xs text-[#636366] border border-[rgba(28,28,30,0.06)] shadow-xs">
                No profiles found matching selected filters. Reset filters to expand matches.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {profiles.map((item) => {
                  const age = new Date().getFullYear() - new Date(item.dateOfBirth).getFullYear();
                  const photo =
                    item.media && item.media[0]
                      ? item.media[0].url
                      : item.gender === "FEMALE"
                      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
                      : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400";
                  return (
                    <div key={item.id} className="group bg-white dark:bg-[#0D1E3D] rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        {/* Portrait photo frame */}
                        <div className="aspect-[4/5] relative bg-slate-50 overflow-hidden">
                          <img src={photo} alt="" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                          <span className="absolute top-3.5 left-3.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold shadow-xs">
                            New
                          </span>
                          <button className="absolute top-3.5 right-3.5 h-7 w-7 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-red-500 shadow-xs transition-colors">
                            <Heart className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Profiles body details */}
                        <div className="p-4 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-[#0A1F44] dark:text-white">
                              {item.firstName} {item.lastName}
                            </h3>
                            <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-bold" title="Verified Member">✓</span>
                          </div>
                          <p className="text-[11px] text-[#636366] dark:text-slate-400 font-medium leading-normal">
                            {age} yrs · {item.height ? `${item.height} cm` : "160 cm"} · {item.profession || "Professional"}
                          </p>
                          <p className="text-[10px] text-[#8E8E93] dark:text-slate-400 font-semibold">
                            {item.caste || "General"} · {item.district}, Kerala
                          </p>
                        </div>
                      </div>

                      {/* Compatibility match percentages and quick actions */}
                      <div className="p-4 pt-0 space-y-3.5">
                        <div className="flex items-center justify-between text-[10px] font-bold pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                            <span>88% Match</span>
                          </span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-slate-400" />
                            <span>ID Verified</span>
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Link
                              href={`/profile/${item.id}`}
                              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-[10px] font-bold text-center transition-colors"
                            >
                              View Profile
                            </Link>
                            <button
                              onClick={() => alert("Interest sent successfully!")}
                              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#FF1475] to-[#C81D45] hover:opacity-95 text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs"
                            >
                              <Send className="h-3 w-3" />
                              <span>Send Interest</span>
                            </button>
                          </div>
                          <HoroscopeMatchButton
                            targetProfile={item}
                            currentUserId={currentUserProfile?.userId}
                            variant="card"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom PWA Performance / Visibility banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">You're more visible now!</h4>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">You are 3x more likely to get views and responses.</p>
                </div>
              </div>
              <Link
                href="/pricing"
                className="px-3.5 py-1.5 rounded-lg bg-[#C81D45] hover:bg-[#A51436] text-white text-[10px] font-bold shadow-xs transition-colors"
              >
                Boost Profile
              </Link>
            </div>

          </main>

          {/* Desktop Right Filter Sidebar Column (Reference 4.4) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 bg-white dark:bg-[#0D1E3D] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <FilterPanelContent />
            </div>
          </aside>

        </div>
      </div>

      {/* Mobile view Filter Drawer (Bottom Sheet) */}
      {isFilterDrawerOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0D1E3D] text-[#1C1C1E] dark:text-white rounded-t-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-slideUp border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>
            <FilterPanelContent />
          </div>
        </>
      )}

      <Footer variant="dashboard" />
    </div>
  );
}
