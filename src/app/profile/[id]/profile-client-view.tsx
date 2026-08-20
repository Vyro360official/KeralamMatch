"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ShieldCheck, Lock, Play, Pause, Phone, Mail, Clock, 
  MapPin, BookOpen, Briefcase, Heart, CheckCircle2, AlertCircle,
  MessageSquare, Star, Sparkles, FileText, Eye
} from "lucide-react";
import { sendContactRequestAction, getUnlockedContactAction } from "@/modules/contact/contact.controller";
import { formatDateDDMMYYYY } from "@/lib/utils";

interface ProfileClientViewProps {
  targetProfile: any;
  age: number;
  matchScore: number;
  matchBreakdown: any;
  initialContactRequest: any;
  currentUserId: string;
}

export default function ProfileClientView({
  targetProfile,
  age,
  matchScore,
  matchBreakdown,
  initialContactRequest,
  currentUserId,
}: ProfileClientViewProps) {
  const [activeTab, setActiveTab] = useState<"about" | "lifestyle" | "education" | "family" | "preference">("about");
  const [contactRequest, setContactRequest] = useState(initialContactRequest);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isInterestSent, setIsInterestSent] = useState(false);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  const [unlockedDetails, setUnlockedDetails] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggleShortlist = () => {
    setIsShortlisted((prev) => {
      const next = !prev;
      setActionNotification(next ? `Added ${targetProfile.firstName} to your shortlisted candidates.` : `Removed ${targetProfile.firstName} from shortlist.`);
      setTimeout(() => setActionNotification(null), 3000);
      return next;
    });
  };

  const handleSendInterest = () => {
    setIsInterestSent(true);
    setActionNotification(`Interest expressed! ${targetProfile.firstName} has been notified.`);
    setTimeout(() => setActionNotification(null), 3000);
  };

  const fetchUnlockedContact = useCallback(async () => {
    setLoading(true);
    const result = await getUnlockedContactAction(targetProfile.userId);
    if (result.success && result.contactDetails) {
      setUnlockedDetails(result.contactDetails);
    } else {
      setError("Failed to decrypt contact details.");
    }
    setLoading(false);
  }, [targetProfile.userId]);

  useEffect(() => {
    let timer: any;
    if (contactRequest && contactRequest.status === "ACCEPTED" && contactRequest.expiresAt) {
      const targetTime = new Date(contactRequest.expiresAt).getTime();
      
      const updateTimer = () => {
        const now = new Date().getTime();
        const diff = Math.max(0, Math.round((targetTime - now) / 1000));
        setTimeLeft(diff);
        
        if (diff > 0 && !unlockedDetails && !loading) {
          fetchUnlockedContact();
        }
      };

      updateTimer();
      timer = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(timer);
  }, [contactRequest, fetchUnlockedContact, unlockedDetails, loading]);

  const handleRequestContact = async () => {
    setLoading(true);
    setError(null);
    const result = await sendContactRequestAction(targetProfile.userId);
    if (result.success && result.request) {
      setContactRequest(result.request);
    } else {
      setError(result.error || "Failed to submit contact request.");
    }
    setLoading(false);
  };

  const toggleAudio = () => {
    if (!targetProfile.voiceIntroduction) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(targetProfile.voiceIntroduction);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTimeLeft = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  const mainPhoto = targetProfile.media && targetProfile.media[0] 
    ? targetProfile.media[0].url 
    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800";

  return (
    <div className="space-y-8">
      {/* ── Own Profile Preview Banner ───────────────────────────────── */}
      {currentUserId === targetProfile.userId && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0A1F44] to-[#1E3A8A] text-white rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <Eye className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-sm">Public Profile Preview</p>
              <p className="text-white/80 text-xs">This is how your profile appears to prospective matches on KeralamMatch.</p>
            </div>
          </div>
          <Link
            href="/join"
            className="px-5 py-2.5 rounded-full bg-white text-[#0A1F44] hover:bg-gray-100 text-xs font-bold transition-all shadow-sm whitespace-nowrap"
          >
            Edit Profile Details
          </Link>
        </div>
      )}

      {/* ── Profile Top Hero Card (Matching Reference 1.6) ────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[rgba(28,28,30,0.08)] shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Main Portrait Photo */}
          <div className="w-full md:w-64 h-80 rounded-2xl bg-gray-100 overflow-hidden relative flex-shrink-0 shadow-sm">
            <img src={mainPhoto} alt="" className="w-full h-full object-cover" />
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-[#C81D45]">
              94% Match
            </div>
          </div>

          {/* Profile Details & Hero Info */}
          <div className="flex-1 space-y-6 w-full">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F44]">
                    {targetProfile.firstName} {targetProfile.lastName.charAt(0)}.
                  </h1>
                  
                  {/* Career & Profession Header Highlight */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#0A1F44] mt-1.5">
                    <span className="flex items-center gap-1.5 bg-rose-50 text-[#C81D45] px-2.5 py-0.5 rounded-full border border-rose-200">
                      <Briefcase className="h-3 w-3 text-[#C81D45]" />
                      <span>{targetProfile.profession || "Senior Software Engineer"}</span>
                      {targetProfile.company && <span className="text-[#636366]"> at {targetProfile.company}</span>}
                    </span>
                    <span className="flex items-center gap-1.5 bg-blue-50 text-[#0A369D] px-2.5 py-0.5 rounded-full border border-blue-200">
                      <BookOpen className="h-3 w-3 text-[#0A369D]" />
                      <span>{targetProfile.education || "B.Tech Computer Science"}</span>
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#636366] mt-1.5">
                    {age} yrs, {targetProfile.height} cm · {targetProfile.religion}, {targetProfile.caste || "Nair"} {targetProfile.subCaste ? `(${targetProfile.subCaste})` : ""}
                  </p>
                  <p className="text-xs text-[#8E8E93] mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#8E8E93]" />
                    <span>{targetProfile.city || "Kochi"}, {targetProfile.district}, Kerala, India</span>
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Last seen recently
                </div>
              </div>
            </div>

            {/* Action Feedback Notification Banner */}
            {actionNotification && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>{actionNotification}</span>
              </div>
            )}

            {/* Action Buttons Row (Shortlist, Send Interest, Message, Contact) */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleToggleShortlist}
                className={`px-5 py-2.5 rounded-full border text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  isShortlisted
                    ? "bg-[#C81D45] text-white border-[#C81D45] shadow-sm"
                    : "border-[rgba(28,28,30,0.12)] text-[#0A1F44] hover:bg-gray-50"
                }`}
              >
                <Heart className={`h-4 w-4 ${isShortlisted ? "fill-white text-white" : "text-[#C81D45]"}`} />
                <span>{isShortlisted ? "Shortlisted ✓" : "Shortlist"}</span>
              </button>

              <button
                onClick={handleSendInterest}
                className={`px-5 py-2.5 rounded-full border text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  isInterestSent
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "border-[#C81D45] text-[#C81D45] hover:bg-red-50"
                }`}
              >
                <Star className={`h-4 w-4 ${isInterestSent ? "fill-white text-white" : ""}`} />
                <span>{isInterestSent ? "Interest Sent ✓" : "Send Interest"}</span>
              </button>

              <Link
                href={`/chat?userId=${targetProfile.userId}&name=${encodeURIComponent(targetProfile.firstName + " " + targetProfile.lastName)}`}
                className="px-5 py-2.5 rounded-full bg-[#0A369D] hover:bg-[#082C80] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Message</span>
              </Link>
            </div>

            {/* Tabs Row */}
            <div className="flex border-b border-[rgba(28,28,30,0.08)] pt-4 gap-6 text-xs font-bold overflow-x-auto no-scrollbar">
              {(["about", "education", "lifestyle", "family", "preference"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 capitalize transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab
                      ? "border-[#C81D45] text-[#C81D45]"
                      : "border-transparent text-[#636366] hover:text-[#0A1F44]"
                  }`}
                >
                  {tab === "preference" ? "Partner Preference" : tab === "education" ? "Career & Education" : tab}
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* ── Main Content Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Biography & Details Grid */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* TAB: PARTNER PREFERENCES */}
          {activeTab === "preference" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0A1F44]">Partner Preferences & Expectations</h3>
                <p className="text-xs text-[#636366] mt-1">What {targetProfile.firstName} is looking for in a prospective life partner</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Age Preference</span>
                  <span className="font-bold text-[#0A1F44] block">
                    {targetProfile.partnerAgeMin ? `${targetProfile.partnerAgeMin} - ${targetProfile.partnerAgeMax} yrs` : (targetProfile.gender === "MALE" ? "22 - 27 yrs" : "26 - 32 yrs")}
                  </span>
                  {targetProfile.partnerAgeStrict && <span className="text-[10px] font-bold text-[#C81D45]">Strict Requirement</span>}
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Height Preference</span>
                  <span className="font-bold text-[#0A1F44] block">
                    {targetProfile.partnerHeightMin ? `${targetProfile.partnerHeightMin} cm - ${targetProfile.partnerHeightMax} cm` : (targetProfile.gender === "MALE" ? "155 cm - 170 cm" : "170 cm - 185 cm")}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Marital Status</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.partnerMaritalStatus || "Never Married"}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Mother Tongue</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.partnerMotherTongue || "Malayalam"}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Religion & Caste</span>
                  <span className="font-bold text-[#0A1F44] block">
                    {targetProfile.partnerReligion || targetProfile.religion} · {targetProfile.partnerCaste || (targetProfile.caste ? `${targetProfile.caste} / Any` : "Caste No Bar")}
                  </span>
                  {targetProfile.partnerSubCaste && targetProfile.partnerSubCaste !== "Any" && (
                    <span className="text-[10px] text-[#636366] block">Sub-caste: {targetProfile.partnerSubCaste}</span>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Education Qualification</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.partnerEducation || "Graduate / Post Graduate"}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Profession / Occupation</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.partnerProfession || "Any Profession / Working"}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Food & Habits</span>
                  <span className="font-bold text-[#0A1F44] block">
                    {targetProfile.partnerFoodHabits || "Open to Any"} · {targetProfile.partnerSmoking || "Non-Smoker"} · {targetProfile.partnerDrinking || "Non-Drinker"}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Location & Residency</span>
                  <span className="font-bold text-[#0A1F44] block">
                    {targetProfile.partnerCountry || "Living in Kerala / India"} ({targetProfile.partnerDistrict || "Any District"})
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Astrology & Dosham</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.partnerDosham || (targetProfile.horoscopeRequired ? "Mandatory / Required" : "Flexible / Optional")}</span>
                </div>

              </div>
            </div>
          )}

          {/* TAB: CAREER & EDUCATION */}
          {activeTab === "education" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0A1F44]">Career & Educational Background</h3>
                <p className="text-xs text-[#636366] mt-1">Professional qualifications and occupation standing</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Highest Qualification</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.education || "B.Tech Computer Science"}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Profession / Role</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.profession || "Senior Software Engineer"}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Company / Employer</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.company || "Reputed Organization"}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Annual Income</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.incomeBracket || "₹15 - 25 Lakhs / year"}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LIFESTYLE */}
          {activeTab === "lifestyle" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0A1F44]">Lifestyle & Habits</h3>
                <p className="text-xs text-[#636366] mt-1">Daily habits, dietary choices, and lifestyle attributes</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Dietary Habit</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.foodHabits || "Non-Vegetarian"}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Smoking</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.smoking || "No"}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Drinking</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.drinking || "No"}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Fitness Level</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.fitnessLevel || "Active"}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FAMILY BACKGROUND */}
          {activeTab === "family" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0A1F44]">Family Hierarchy & Heritage</h3>
                <p className="text-xs text-[#636366] mt-1">Family status, values, and parents' background</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Family Status</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.familyStatus || "Upper Middle Class"}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Family Type & Values</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.familyType || "Nuclear"} · {targetProfile.familyValues || "Moderate Traditional"}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Father</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.fatherName || "Father"} ({targetProfile.fatherOccupation || "Retd. Officer"})</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] space-y-1">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Mother</span>
                  <span className="font-bold text-[#0A1F44] block">{targetProfile.motherName || "Mother"} ({targetProfile.motherOccupation || "Homemaker"})</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ABOUT ME (DEFAULT) */}
          {activeTab === "about" && (
            <>
              {/* About Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0A1F44]">About Me</h3>
                <p className="text-xs text-[#636366] leading-relaxed">
                  {targetProfile.bio || "No description provided yet."}
                </p>
              </div>

              {/* Key Attributes Grid */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0A1F44]">Personal & Career Attributes</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div>
                    <span className="text-[#8E8E93] block">Date of Birth (DD/MM/YYYY)</span>
                    <span className="font-semibold text-[#0A1F44] block mt-0.5">
                      {targetProfile.dateOfBirth ? formatDateDDMMYYYY(targetProfile.dateOfBirth) : "15/06/1996"} ({age} yrs)
                    </span>
                  </div>

                  <div>
                    <span className="text-[#8E8E93] block">Education</span>
                    <span className="font-semibold text-[#0A1F44] block mt-0.5">{targetProfile.education || "Not specified"}</span>
                  </div>

                  <div>
                    <span className="text-[#8E8E93] block">Profession</span>
                    <span className="font-semibold text-[#0A1F44] block mt-0.5">{targetProfile.profession || "Not specified"}</span>
                  </div>

                  <div>
                    <span className="text-[#8E8E93] block">Mother Tongue</span>
                    <span className="font-semibold text-[#0A1F44] block mt-0.5">{targetProfile.motherTongue || "Malayalam"}</span>
                  </div>

                  <div>
                    <span className="text-[#8E8E93] block">Marital Status</span>
                    <span className="font-semibold text-[#0A1F44] block mt-0.5">{targetProfile.maritalStatus}</span>
                  </div>

                  <div>
                    <span className="text-[#8E8E93] block">District & Location</span>
                    <span className="font-semibold text-[#0A1F44] block mt-0.5">{targetProfile.district}, Kerala</span>
                  </div>

                  <div>
                    <span className="text-[#8E8E93] block">Religion & Caste</span>
                    <span className="font-semibold text-[#0A1F44] block mt-0.5">{targetProfile.religion} ({targetProfile.caste || "General"})</span>
                  </div>
                </div>
              </div>

              {/* Horoscope Card */}
              <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#0A1F44]">Horoscope Details</h3>
                  <p className="text-xs text-[#636366]">
                    {targetProfile.horoscopeRequired ? "Horoscope match is mandatory for this profile" : "Horoscope available on request"}
                  </p>
                </div>
                <button className="px-5 py-2 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#0A1F44] hover:bg-gray-50 flex items-center space-x-1.5">
                  <FileText className="h-4 w-4 text-[#D4AF37]" />
                  <span>View Horoscope</span>
                </button>
              </div>
            </>
          )}

        </div>

        {/* Right Column: Verification & Ephemeral Contact Reveal Panel */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Verified Details Card (Matching Reference 1.6) */}
          <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A1F44]">Verified Details</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Mobile Verified</span>
                </span>
                <span className="font-bold">✓</span>
              </div>

              <div className="flex items-center justify-between text-emerald-700">
                <span className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Email Verified</span>
                </span>
                <span className="font-bold">✓</span>
              </div>

              <div className="flex items-center justify-between text-emerald-700">
                <span className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Aadhaar Verified</span>
                </span>
                <span className="font-bold">✓</span>
              </div>

              <div className="flex items-center justify-between text-emerald-700">
                <span className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Profile Photo Verified</span>
                </span>
                <span className="font-bold">✓</span>
              </div>
            </div>
          </div>

          {/* Ephemeral Contact Reveal Card */}
          <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-[#C81D45]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A1F44]">Contact Access</h3>
            </div>
            
            <p className="text-xs text-[#636366] leading-relaxed">
              Upon mutual consent, phone number and email credentials unlock for exactly 24 hours.
            </p>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            {!contactRequest ? (
              <button
                onClick={handleRequestContact}
                disabled={loading}
                className="w-full h-11 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center"
              >
                {loading ? "Submitting..." : "Send Contact Request"}
              </button>
            ) : contactRequest.status === "PENDING" ? (
              <div className="p-4 bg-[#FCFBF7] rounded-2xl text-center space-y-1">
                <Clock className="h-5 w-5 text-[#C81D45] mx-auto animate-pulse" />
                <span className="text-xs font-bold text-[#0A1F44] block">Contact Request Pending</span>
                <span className="text-[10px] text-[#636366] block">Awaiting member consent.</span>
              </div>
            ) : contactRequest.status === "ACCEPTED" && timeLeft > 0 ? (
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-center">
                  <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Access Expires In</div>
                  <div className="text-sm font-extrabold text-red-700 tracking-wider mt-0.5">{formatTimeLeft(timeLeft)}</div>
                </div>

                {unlockedDetails ? (
                  <div className="p-4 bg-[#FCFBF7] rounded-2xl space-y-2 text-xs font-semibold text-[#0A1F44]">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-[#C81D45]" />
                      <span>{unlockedDetails.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-[#0A369D]" />
                      <span>{unlockedDetails.email}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={fetchUnlockedContact}
                    disabled={loading}
                    className="w-full h-10 rounded-full bg-[#0A369D] text-white text-xs font-bold"
                  >
                    Reveal Phone & Email
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 bg-[#FCFBF7] rounded-2xl text-center space-y-2">
                <Lock className="h-5 w-5 text-[#8E8E93] mx-auto" />
                <span className="text-xs font-bold text-[#0A1F44] block">24h Access Expired</span>
                <button
                  onClick={handleRequestContact}
                  disabled={loading}
                  className="px-4 py-1.5 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#0A1F44]"
                >
                  Request Again
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
