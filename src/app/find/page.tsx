"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { searchProfilesAction, getProfileDetailsAction } from "@/modules/profile/profile.controller";
import { Search, SlidersHorizontal, Sparkles, FilterX, Heart, CheckCircle2, ChevronDown, X } from "lucide-react";
import { KERALA_DISTRICTS, KERALA_RELIGIONS_TAXONOMY } from "@/lib/kerala-data";

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<"find" | "matches" | "search" | "saved">("find");
  const [nlpQuery, setNlpQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null);

  // Multi-select & single-select filters
  const [religion, setReligion] = useState("");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCastes, setSelectedCastes] = useState<string[]>([]);
  const [profession, setProfession] = useState("");
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(60);

  // Dropdown open states
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const [isCasteDropdownOpen, setIsCasteDropdownOpen] = useState(false);

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
        const ageMatch = p.age >= minAge && p.age <= maxAge;
        const districtMatch =
          selectedDistricts.length === 0 || selectedDistricts.includes(p.district);
        const casteMatch =
          selectedCastes.length === 0 || selectedCastes.includes(p.caste);
        return ageMatch && districtMatch && casteMatch;
      });

      // Sandbox dev fallbacks if local db is empty
      if (filtered.length === 0 && process.env.NODE_ENV !== "production") {
        const devCandidates = [
          {
            id: "prf-1",
            firstName: "Ananya",
            lastName: "Nair",
            age: 26,
            religion: "Hindu",
            caste: "Nair",
            district: "Ernakulam",
            profession: "UI/UX Designer",
            media: [{ url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" }],
          },
          {
            id: "prf-2",
            firstName: "Dr. Divya",
            lastName: "Thomas",
            age: 27,
            religion: "Christian",
            caste: "Syrian Catholic",
            district: "Kottayam",
            profession: "Medical Resident (MD)",
            media: [{ url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400" }],
          },
          {
            id: "prf-3",
            firstName: "Meera",
            lastName: "Krishnan",
            age: 25,
            religion: "Hindu",
            caste: "Ezhava",
            district: "Thiruvananthapuram",
            profession: "Chartered Accountant",
            media: [{ url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400" }],
          },
          {
            id: "prf-4",
            firstName: "Sneha",
            lastName: "Menon",
            age: 28,
            religion: "Hindu",
            caste: "Nair",
            district: "Thrissur",
            profession: "Data Scientist",
            media: [{ url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400" }],
          },
        ];

        filtered = devCandidates.filter((p) => {
          const rMatch = !religion || p.religion === religion;
          const dMatch = selectedDistricts.length === 0 || selectedDistricts.includes(p.district);
          const cMatch = selectedCastes.length === 0 || selectedCastes.includes(p.caste);
          return rMatch && dMatch && cMatch;
        });
      }

      setProfiles(filtered);
      setTotalMatches(filtered.length);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, [religion, selectedDistricts, selectedCastes, profession, minAge, maxAge]);

  const toggleDistrict = (districtName: string) => {
    setSelectedDistricts((prev) =>
      prev.includes(districtName) ? prev.filter((d) => d !== districtName) : [...prev, districtName]
    );
  };

  const toggleCaste = (casteName: string) => {
    setSelectedCastes((prev) =>
      prev.includes(casteName) ? prev.filter((c) => c !== casteName) : [...prev, casteName]
    );
  };

  const handleAiSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = nlpQuery.toLowerCase();

    if (query.includes("hindu")) setReligion("Hindu");
    else if (query.includes("christian")) setReligion("Christian");
    else if (query.includes("muslim")) setReligion("Muslim");

    if (query.includes("nair")) setSelectedCastes(["Nair"]);
    else if (query.includes("ezhava")) setSelectedCastes(["Ezhava"]);

    if (query.includes("ernakulam") || query.includes("kochi")) setSelectedDistricts(["Ernakulam"]);
    else if (query.includes("trivandrum") || query.includes("thiruvananthapuram")) setSelectedDistricts(["Thiruvananthapuram"]);
    else if (query.includes("thrissur")) setSelectedDistricts(["Thrissur"]);

    if (query.includes("doctor")) setProfession("Doctor");
    else if (query.includes("engineer") || query.includes("software")) setProfession("Software Engineer");
  };

  const resetFilters = () => {
    setReligion("");
    setSelectedDistricts([]);
    setSelectedCastes([]);
    setProfession("");
    setMinAge(18);
    setMaxAge(60);
    setNlpQuery("");
  };

  // Get available castes for selected religion
  const availableCastes = (() => {
    if (!religion) {
      return Array.from(
        new Set(
          KERALA_RELIGIONS_TAXONOMY.flatMap((r) => r.castes.map((c) => c.caste))
        )
      );
    }
    const rObj = KERALA_RELIGIONS_TAXONOMY.find((r) => r.religion === religion);
    return rObj ? rObj.castes.map((c) => c.caste) : [];
  })();

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] text-[#1C1C1E]">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── Frozen Left Menu Sidebar (Persistent Navigation) ──────────── */}
          <DashboardSidebar userProfile={currentUserProfile} />

          {/* ── Main Discovery & Search Area ─────────────────────────────── */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Top Header & View Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(28,28,30,0.08)] pb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F44]">Find Your Match</h1>
                <p className="text-xs text-[#636366] mt-0.5">Discover verified Malayali profiles with multi-district filters</p>
              </div>

              <div className="flex rounded-full bg-white p-1 border border-[rgba(28,28,30,0.08)] text-xs font-semibold">
                {(["find", "matches", "search", "saved"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-full capitalize transition-all ${
                      activeTab === tab
                        ? "bg-[#C81D45] text-white shadow-sm font-bold"
                        : "text-[#636366] hover:text-[#0A1F44]"
                    }`}
                  >
                    {tab === "saved" ? "Saved Searches" : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Smart Search Card */}
            <div className="bg-white rounded-3xl p-5 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#C81D45]">
                <Sparkles className="h-4 w-4" />
                <span>AI Smart Search</span>
              </div>
              <form onSubmit={handleAiSearch} className="relative flex items-center">
                <Input
                  type="text"
                  placeholder="e.g. Doctors in Ernakulam and Trivandrum, Software Engineers in Kochi below 29..."
                  value={nlpQuery}
                  onChange={(e) => setNlpQuery(e.target.value)}
                  className="w-full h-11 rounded-full border-[rgba(28,28,30,0.12)] pl-5 pr-28 text-xs font-medium focus:border-[#C81D45]"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-4 py-1.5 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-sm"
                >
                  Search
                </button>
              </form>
            </div>

            {/* ── Multi-Choice Filter Bar ──────────────────────────────────── */}
            <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0A1F44] flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-[#C81D45]" />
                  <span>Filter Candidates</span>
                </span>
                <button
                  onClick={resetFilters}
                  className="text-[11px] font-bold text-[#C81D45] hover:underline flex items-center gap-1"
                >
                  <FilterX className="h-3 w-3" />
                  <span>Reset All</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Religion Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8E8E93] mb-1.5">Religion</label>
                  <select
                    value={religion}
                    onChange={(e) => {
                      setReligion(e.target.value);
                      setSelectedCastes([]);
                    }}
                    className="w-full h-11 rounded-2xl border border-[rgba(28,28,30,0.12)] bg-[#FCFBF7] px-4 text-xs font-semibold focus:outline-none focus:border-[#C81D45]"
                  >
                    <option value="">Any Religion</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Christian">Christian</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Jain">Jain</option>
                  </select>
                </div>

                {/* 2. District Multi-Choice Checkboxes */}
                <div className="relative">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8E8E93] mb-1.5">
                    Districts ({selectedDistricts.length === 0 ? "All 14" : `${selectedDistricts.length} Selected`})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDistrictDropdownOpen(!isDistrictDropdownOpen);
                      setIsCasteDropdownOpen(false);
                    }}
                    className="w-full h-11 rounded-2xl border border-[rgba(28,28,30,0.12)] bg-[#FCFBF7] px-4 text-xs font-semibold flex items-center justify-between text-left focus:outline-none focus:border-[#C81D45]"
                  >
                    <span className="truncate">
                      {selectedDistricts.length === 0
                        ? "Select Districts (Multi-Choice)"
                        : selectedDistricts.join(", ")}
                    </span>
                    <ChevronDown className="h-4 w-4 text-[#8E8E93] flex-shrink-0" />
                  </button>

                  {/* Multi-Select Popup */}
                  {isDistrictDropdownOpen && (
                    <div className="absolute left-0 right-0 top-16 z-30 bg-white rounded-2xl p-4 shadow-xl border border-[rgba(28,28,30,0.12)] max-h-64 overflow-y-auto space-y-2 animate-fadeIn">
                      <div className="flex justify-between items-center pb-2 border-b text-xs font-bold text-[#0A1F44]">
                        <span>Kerala 14 Districts</span>
                        <button
                          type="button"
                          onClick={() => setSelectedDistricts([])}
                          className="text-[10px] text-[#C81D45]"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                        {KERALA_DISTRICTS.map((d) => {
                          const isChecked = selectedDistricts.includes(d.name);
                          return (
                            <label
                              key={d.name}
                              className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-[#FCFBF7] text-xs font-medium cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleDistrict(d.name)}
                                className="rounded text-[#C81D45] focus:ring-[#C81D45]"
                              />
                              <span>{d.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Caste Multi-Choice Checkboxes */}
                <div className="relative">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8E8E93] mb-1.5">
                    Caste / Community ({selectedCastes.length === 0 ? "Any" : `${selectedCastes.length} Selected`})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCasteDropdownOpen(!isCasteDropdownOpen);
                      setIsDistrictDropdownOpen(false);
                    }}
                    className="w-full h-11 rounded-2xl border border-[rgba(28,28,30,0.12)] bg-[#FCFBF7] px-4 text-xs font-semibold flex items-center justify-between text-left focus:outline-none focus:border-[#C81D45]"
                  >
                    <span className="truncate">
                      {selectedCastes.length === 0
                        ? "Select Castes (Multi-Choice)"
                        : selectedCastes.join(", ")}
                    </span>
                    <ChevronDown className="h-4 w-4 text-[#8E8E93] flex-shrink-0" />
                  </button>

                  {/* Multi-Select Popup */}
                  {isCasteDropdownOpen && (
                    <div className="absolute left-0 right-0 top-16 z-30 bg-white rounded-2xl p-4 shadow-xl border border-[rgba(28,28,30,0.12)] max-h-64 overflow-y-auto space-y-2 animate-fadeIn">
                      <div className="flex justify-between items-center pb-2 border-b text-xs font-bold text-[#0A1F44]">
                        <span>Castes ({religion || "All"})</span>
                        <button
                          type="button"
                          onClick={() => setSelectedCastes([])}
                          className="text-[10px] text-[#C81D45]"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                        {availableCastes.map((caste) => {
                          const isChecked = selectedCastes.includes(caste);
                          return (
                            <label
                              key={caste}
                              className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-[#FCFBF7] text-xs font-medium cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCaste(caste)}
                                className="rounded text-[#C81D45] focus:ring-[#C81D45]"
                              />
                              <span>{caste}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Filter Badges / Chips */}
              {(selectedDistricts.length > 0 || selectedCastes.length > 0) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-[rgba(28,28,30,0.06)]">
                  {selectedDistricts.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCFBF7] border border-[rgba(28,28,30,0.1)] text-xs font-semibold text-[#0A1F44]"
                    >
                      <span>📍 {d}</span>
                      <button onClick={() => toggleDistrict(d)} className="hover:text-[#C81D45]">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {selectedCastes.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCFBF7] border border-[rgba(28,28,30,0.1)] text-xs font-semibold text-[#0A1F44]"
                    >
                      <span>👥 {c}</span>
                      <button onClick={() => toggleCaste(c)} className="hover:text-[#C81D45]">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Results Count Indicator */}
            <div className="flex items-center justify-between text-xs font-bold text-[#636366]">
              <span>{totalMatches} Matches Found</span>
            </div>

            {/* Profiles Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-3xl overflow-hidden p-0 border">
                    <Skeleton className="h-64 w-full" />
                    <div className="p-6 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : profiles.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center text-xs text-[#636366] border border-[rgba(28,28,30,0.08)]">
                No profiles found matching your search filters. Reset filters to explore all matches.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((p) => {
                  const photo =
                    p.media && p.media[0]
                      ? p.media[0].url
                      : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400";
                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-3xl border border-[rgba(28,28,30,0.08)] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Portrait Photo */}
                        <div className="aspect-[4/4] relative bg-gray-100 overflow-hidden">
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold text-[#C81D45] shadow-sm">
                            94% Match
                          </div>
                        </div>

                        {/* Details Info */}
                        <div className="p-5 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-[#0A1F44]">
                              {p.firstName} {p.lastName.charAt(0)}.
                            </h3>
                            <span className="text-xs text-[#636366] font-medium">{p.age} yrs</span>
                          </div>
                          <p className="text-xs text-[#636366]">
                            {p.religion} · {p.caste || "General"}
                          </p>
                          <p className="text-xs text-[#8E8E93]">
                            {p.district}, Kerala
                          </p>
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div className="p-5 pt-0 flex gap-2">
                        <button className="h-9 w-9 rounded-full border border-[rgba(28,28,30,0.12)] flex items-center justify-center text-[#C81D45] hover:bg-red-50">
                          <Heart className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/profile/${p.id}`}
                          className="flex-1 h-9 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold flex items-center justify-center shadow-sm"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
