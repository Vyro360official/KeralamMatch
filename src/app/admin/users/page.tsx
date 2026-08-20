"use client";

import React, { useState } from "react";
import {
  Search, Filter, Plus, UserCheck, UserX, Shield, Edit3, Trash2, X,
  CheckCircle2, AlertCircle, Eye, Heart, Star, MessageSquare, PhoneCall,
  MapPin, Lock, Activity, Sparkles, Clock, GraduationCap, Briefcase,
  Users, Home, Calendar, Award, Phone, CheckSquare
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserItem {
  id: string;
  name: string;
  gender: "Bride" | "Groom";
  age: number;
  height: string;
  maritalStatus: string;
  email: string;
  contact: string;
  district: string;
  city: string;
  status: "Active" | "Inactive" | "Blocked";
  verification: "Verified" | "Pending" | "Rejected";
  plan: "Free" | "Silver" | "Gold" | "Platinum";
  joined: string;
  photoUrl: string;
  bio: string;

  // Cultural & Horoscope
  religion: string;
  caste: string;
  subCaste: string;
  starNakshatram: string;
  rasi: string;
  horoscopeRequired: boolean;

  // Education & Career
  education: string;
  profession: string;
  company: string;
  incomeBracket: string;
  workLocation: string;

  // Family Details
  fatherName: string;
  motherName: string;
  siblings: string;
  familyType: string;

  // Profile Ownership & Creator
  createdFor: "Self" | "Son (Parent)" | "Daughter (Parent)" | "Brother (Sibling)" | "Sister (Sibling)" | "Friend" | "Relative";
  creatorName?: string;
  creatorPhone?: string;
  creatorRelation?: string;
  creatorDocUrl?: string;

  // Partner Preferences
  partnerPreferences: {
    ageRange: string;
    heightRange: string;
    maritalStatus: string;
    religion: string;
    caste: string;
    education: string;
    district: string;
  };

  // Activity & Engagement Telemetry
  telemetry: {
    interestsReceivedCount: number;
    interestsReceivedFrom: string[];
    interestsSentCount: number;
    shortlistedCount: number;
    shortlistedFrom: string[];
    contactRevealsCount: number;
    hasUsedChat: boolean;
    chatThreadsCount: number;
    totalMessagesCount: number;
    lastChatActive: string;
  };
}

const INITIAL_USERS: UserItem[] = [
  {
    id: "usr-107",
    name: "Nagarajan Pillai",
    gender: "Groom",
    age: 29,
    height: "178 cm (5' 10\")",
    maritalStatus: "Never Married",
    email: "nagarajan.p@gmail.com",
    contact: "+91 94470 55112",
    district: "Thiruvananthapuram",
    city: "Kazhakoottam, Trivandrum",
    status: "Active",
    verification: "Verified",
    plan: "Platinum",
    joined: "01/05/2024",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    bio: "Senior Cloud Architect working in Technopark. Passionate about classical music, photography, and weekend road trips across Kerala. Looking for a progressive, family-oriented partner with similar values.",
    religion: "Hindu",
    caste: "Nair",
    subCaste: "Pillai",
    starNakshatram: "Rohini",
    rasi: "Rishabham",
    horoscopeRequired: true,
    education: "B.Tech in Computer Science (CET Trivandrum), MS (BITS Pilani)",
    profession: "Senior Cloud Architect",
    company: "Oracle Cloud / Technopark",
    incomeBracket: "₹25 - 35 Lakhs / year",
    workLocation: "Thiruvananthapuram & Remote",
    fatherName: "G. Parameswaran Pillai (Retd. Deputy Collector)",
    motherName: "Radhamani Amma (Homemaker)",
    siblings: "1 Elder Sister (Married, Doctor in Kochi)",
    familyType: "Nuclear, Traditional Nair Family with Moderate Outlook",
    createdFor: "Son (Parent)",
    creatorName: "G. Parameswaran Pillai (Father)",
    creatorPhone: "+91 94471 88990",
    creatorRelation: "Father / Guardian",
    creatorDocUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600",
    partnerPreferences: {
      ageRange: "24 - 28 yrs",
      heightRange: "158 cm - 172 cm",
      maritalStatus: "Never Married",
      religion: "Hindu",
      caste: "Nair (Any Subcaste)",
      education: "B.Tech / MCA / MBBS / CA / Post Graduate",
      district: "Thiruvananthapuram, Kollam, Ernakulam, Pathanamthitta",
    },
    telemetry: {
      interestsReceivedCount: 16,
      interestsReceivedFrom: ["Thiruvananthapuram (6)", "Ernakulam (4)", "Kollam (3)", "Dubai / UAE (2)", "Bengaluru (1)"],
      interestsSentCount: 8,
      shortlistedCount: 24,
      shortlistedFrom: ["Thiruvananthapuram (9)", "Kollam (7)", "Pathanamthitta (5)", "Ernakulam (3)"],
      contactRevealsCount: 5,
      hasUsedChat: true,
      chatThreadsCount: 4,
      totalMessagesCount: 52,
      lastChatActive: "Today at 11:20 AM",
    },
  },
  {
    id: "usr-101",
    name: "Ananya Nair",
    gender: "Bride",
    age: 26,
    height: "165 cm (5' 5\")",
    maritalStatus: "Never Married",
    email: "ananya@gmail.com",
    contact: "+91 98765 43210",
    district: "Kannur",
    city: "Payyannur, Kannur",
    status: "Active",
    verification: "Verified",
    plan: "Gold",
    joined: "12/05/2024",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    bio: "Senior UI/UX Designer working in Infopark Kochi. Love classical dance, literature, and exploring cozy cafes. Seeking a kind, supportive life partner.",
    religion: "Hindu",
    caste: "Nair",
    subCaste: "Menon",
    starNakshatram: "Makayiram",
    rasi: "Mithunam",
    horoscopeRequired: true,
    education: "B.Des (National Institute of Design), B.Sc",
    profession: "Lead Product Designer",
    company: "Fintech Startup / Infopark Kochi",
    incomeBracket: "₹18 - 25 Lakhs / year",
    workLocation: "Kochi & Remote",
    fatherName: "K. R. Nair (Retd. Bank Manager)",
    motherName: "Sujatha Nair (Teacher)",
    siblings: "1 Younger Brother (Studying B.Tech)",
    familyType: "Nuclear, Progressive Traditional Values",
    createdFor: "Self",
    partnerPreferences: {
      ageRange: "27 - 31 yrs",
      heightRange: "172 cm - 185 cm",
      maritalStatus: "Never Married",
      religion: "Hindu",
      caste: "Nair",
      education: "Professional Degree / Masters",
      district: "Kannur, Kozhikode, Ernakulam, Trivandrum",
    },
    telemetry: {
      interestsReceivedCount: 22,
      interestsReceivedFrom: ["Kannur (8)", "Kozhikode (6)", "Ernakulam (4)", "Qatar (2)", "Bengaluru (2)"],
      interestsSentCount: 5,
      shortlistedCount: 31,
      shortlistedFrom: ["Kannur (12)", "Kozhikode (10)", "Thrissur (5)", "Palakkad (4)"],
      contactRevealsCount: 6,
      hasUsedChat: true,
      chatThreadsCount: 5,
      totalMessagesCount: 78,
      lastChatActive: "15 mins ago",
    },
  },
  {
    id: "usr-102",
    name: "Meera Unni",
    gender: "Bride",
    age: 27,
    height: "162 cm (5' 4\")",
    maritalStatus: "Never Married",
    email: "meera@gmail.com",
    contact: "+91 87654 32109",
    district: "Ernakulam",
    city: "Kadavanthra, Kochi",
    status: "Active",
    verification: "Verified",
    plan: "Platinum",
    joined: "11/05/2024",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
    bio: "Chartered Accountant currently working with Big 4 consulting in Kochi. Enjoys travel, books, and family gatherings.",
    religion: "Hindu",
    caste: "Nair",
    subCaste: "Kurup",
    starNakshatram: "Ashwati",
    rasi: "Medam",
    horoscopeRequired: false,
    education: "Chartered Accountant (ICAI), B.Com",
    profession: "Senior Audit Manager",
    company: "KPMG Global Services",
    incomeBracket: "₹20 - 30 Lakhs / year",
    workLocation: "Kochi",
    fatherName: "Unnikrishnan P. (Businessman)",
    motherName: "Latha Unnikrishnan (Homemaker)",
    siblings: "1 Brother (Engineer in Bangalore)",
    familyType: "Nuclear, Upper Middle Class",
    createdFor: "Self",
    partnerPreferences: {
      ageRange: "28 - 32 yrs",
      heightRange: "170 cm - 182 cm",
      maritalStatus: "Never Married",
      religion: "Hindu",
      caste: "Nair / Any Hindu",
      education: "CA / MBA / Engineer / Doctor",
      district: "Ernakulam, Thrissur, Kottayam, Trivandrum",
    },
    telemetry: {
      interestsReceivedCount: 19,
      interestsReceivedFrom: ["Ernakulam (9)", "Thrissur (5)", "Kottayam (3)", "Abu Dhabi (2)"],
      interestsSentCount: 7,
      shortlistedCount: 28,
      shortlistedFrom: ["Ernakulam (14)", "Thrissur (8)", "Alappuzha (6)"],
      contactRevealsCount: 4,
      hasUsedChat: true,
      chatThreadsCount: 3,
      totalMessagesCount: 44,
      lastChatActive: "Yesterday",
    },
  },
  {
    id: "usr-103",
    name: "Nandha K",
    gender: "Bride",
    age: 25,
    height: "160 cm (5' 3\")",
    maritalStatus: "Never Married",
    email: "nandha@gmail.com",
    contact: "+91 76543 21098",
    district: "Palakkad",
    city: "Ottapalam, Palakkad",
    status: "Active",
    verification: "Pending",
    plan: "Free",
    joined: "10/05/2024",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    bio: "High School English Teacher in Palakkad. Passionate about literature, Carnatic music, and community service.",
    religion: "Hindu",
    caste: "Ezhava",
    subCaste: "Thiyya",
    starNakshatram: "Chithira",
    rasi: "Kanni",
    horoscopeRequired: true,
    education: "M.A. English Literature, B.Ed",
    profession: "High School Teacher",
    company: "Govt. Aided Higher Secondary School",
    incomeBracket: "₹6 - 10 Lakhs / year",
    workLocation: "Palakkad",
    fatherName: "Kumaran K. (Retd. Postmaster)",
    motherName: "Saraswathi K. (Homemaker)",
    siblings: "2 Sisters (Both Married)",
    familyType: "Joint Family, Traditional Values",
    createdFor: "Daughter (Parent)",
    creatorName: "Kumaran K. (Father)",
    creatorPhone: "+91 94472 11002",
    creatorRelation: "Father",
    creatorDocUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600",
    partnerPreferences: {
      ageRange: "27 - 31 yrs",
      heightRange: "168 cm - 180 cm",
      maritalStatus: "Never Married",
      religion: "Hindu",
      caste: "Ezhava / Thiyya",
      education: "Graduate / Post Graduate / Govt. Employee",
      district: "Palakkad, Thrissur, Malappuram",
    },
    telemetry: {
      interestsReceivedCount: 6,
      interestsReceivedFrom: ["Palakkad (4)", "Malappuram (2)"],
      interestsSentCount: 2,
      shortlistedCount: 9,
      shortlistedFrom: ["Palakkad (6)", "Thrissur (3)"],
      contactRevealsCount: 1,
      hasUsedChat: false,
      chatThreadsCount: 0,
      totalMessagesCount: 0,
      lastChatActive: "Never",
    },
  },
  {
    id: "usr-104",
    name: "Devika Suresh",
    gender: "Bride",
    age: 28,
    height: "168 cm (5' 6\")",
    maritalStatus: "Never Married",
    email: "devika@gmail.com",
    contact: "+91 65432 10987",
    district: "Kozhikode",
    city: "Calicut Beach, Kozhikode",
    status: "Active",
    verification: "Verified",
    plan: "Silver",
    joined: "09/05/2024",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400",
    bio: "MBBS, MD Paediatrics resident in Govt. Medical College Kozhikode. Enjoys travel and culinary arts.",
    religion: "Hindu",
    caste: "Nair",
    subCaste: "Nambiar",
    starNakshatram: "Revathi",
    rasi: "Meenam",
    horoscopeRequired: true,
    education: "MBBS, MD (Paediatrics)",
    profession: "Doctor / Paediatrician",
    company: "Govt. Medical College Hospital",
    incomeBracket: "₹15 - 22 Lakhs / year",
    workLocation: "Kozhikode",
    fatherName: "Dr. Suresh Nambiar (Civil Surgeon)",
    motherName: "Geetha Suresh (Professor)",
    siblings: "None (Only Child)",
    familyType: "Nuclear, Highly Educated Professional Family",
    createdFor: "Self",
    partnerPreferences: {
      ageRange: "29 - 33 yrs",
      heightRange: "175 cm - 188 cm",
      maritalStatus: "Never Married",
      religion: "Hindu",
      caste: "Nair / Nambiar",
      education: "Doctor (MD/MS) / Civil Services / Specialist",
      district: "Kozhikode, Kannur, Ernakulam, Malappuram",
    },
    telemetry: {
      interestsReceivedCount: 11,
      interestsReceivedFrom: ["Kozhikode (7)", "Malappuram (2)", "Wayanad (2)"],
      interestsSentCount: 4,
      shortlistedCount: 15,
      shortlistedFrom: ["Kozhikode (9)", "Kannur (4)", "Malappuram (2)"],
      contactRevealsCount: 2,
      hasUsedChat: true,
      chatThreadsCount: 2,
      totalMessagesCount: 19,
      lastChatActive: "2 days ago",
    },
  },
  {
    id: "usr-105",
    name: "Arjun Menon",
    gender: "Groom",
    age: 30,
    height: "180 cm (5' 11\")",
    maritalStatus: "Never Married",
    email: "arjun@gmail.com",
    contact: "+91 54321 09876",
    district: "Thrissur",
    city: "Round North, Thrissur",
    status: "Inactive",
    verification: "Verified",
    plan: "Free",
    joined: "08 May 2024",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    bio: "Mechanical Engineer managing family manufacturing business in Thrissur. Enjoys temple festivals, sports, and badminton.",
    religion: "Hindu",
    caste: "Nair",
    subCaste: "Menon",
    starNakshatram: "Aswathi",
    rasi: "Medam",
    horoscopeRequired: true,
    education: "B.Tech Mechanical Engineering, MBA (Operations)",
    profession: "Managing Director / Industrialist",
    company: "Menon Engineering Works Thrissur",
    incomeBracket: "₹30 - 50 Lakhs / year",
    workLocation: "Thrissur",
    fatherName: "K. Narayana Menon (Founder & Industrialist)",
    motherName: "Parvathy Menon (Homemaker)",
    siblings: "1 Brother (Partner in Business)",
    familyType: "Joint Family, Prominent Business Family in Thrissur",
    createdFor: "Self",
    partnerPreferences: {
      ageRange: "24 - 28 yrs",
      heightRange: "162 cm - 175 cm",
      maritalStatus: "Never Married",
      religion: "Hindu",
      caste: "Nair (Menon / Pillai)",
      education: "Graduate / Professional Degree",
      district: "Thrissur, Ernakulam, Palakkad",
    },
    telemetry: {
      interestsReceivedCount: 8,
      interestsReceivedFrom: ["Thrissur (5)", "Palakkad (3)"],
      interestsSentCount: 3,
      shortlistedCount: 12,
      shortlistedFrom: ["Thrissur (8)", "Ernakulam (4)"],
      contactRevealsCount: 2,
      hasUsedChat: true,
      chatThreadsCount: 1,
      totalMessagesCount: 8,
      lastChatActive: "1 week ago",
    },
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive" | "blocked" | "premium">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Modal states
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [viewingUser, setViewingUser] = useState<UserItem | null>(null);
  const [viewingTab, setViewingTab] = useState<"profile" | "preferences" | "verification" | "telemetry">("profile");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // New user form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserDistrict, setNewUserDistrict] = useState("Thiruvananthapuram");
  const [newUserPlan, setNewUserPlan] = useState<"Free" | "Silver" | "Gold" | "Platinum">("Gold");

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
    showToast(`User ${editingUser.name} updated successfully.`);
    setEditingUser(null);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserPhone) return;
    const created: UserItem = {
      id: "usr-" + Date.now().toString().slice(-4),
      name: newUserName,
      gender: "Groom",
      age: 28,
      height: "175 cm",
      maritalStatus: "Never Married",
      email: newUserEmail || `${newUserName.toLowerCase().replace(/\s+/g, "")}@keralammatch.com`,
      contact: newUserPhone,
      district: newUserDistrict,
      city: `${newUserDistrict}, Kerala`,
      status: "Active",
      verification: "Verified",
      plan: newUserPlan,
      joined: "Just now",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      bio: "Newly added candidate profile.",
      religion: "Hindu",
      caste: "Nair",
      subCaste: "Pillai",
      starNakshatram: "Rohini",
      rasi: "Rishabham",
      horoscopeRequired: false,
      education: "Professional Degree",
      profession: "Software Professional",
      company: "Tech Enterprise",
      incomeBracket: "₹15 - 25 Lakhs / year",
      workLocation: "Kerala",
      fatherName: "Guardian Name",
      motherName: "Mother Name",
      siblings: "1 Sibling",
      familyType: "Nuclear Family",
      createdFor: "Self",
      partnerPreferences: {
        ageRange: "23 - 27 yrs",
        heightRange: "155 - 170 cm",
        maritalStatus: "Never Married",
        religion: "Hindu",
        caste: "Any",
        education: "Graduate",
        district: "Any District",
      },
      telemetry: {
        interestsReceivedCount: 0,
        interestsReceivedFrom: [],
        interestsSentCount: 0,
        shortlistedCount: 0,
        shortlistedFrom: [],
        contactRevealsCount: 0,
        hasUsedChat: false,
        chatThreadsCount: 0,
        totalMessagesCount: 0,
        lastChatActive: "Never",
      },
    };
    setUsers((prev) => [created, ...prev]);
    showToast(`User ${newUserName} added successfully.`);
    setIsAddUserOpen(false);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPhone("");
  };

  const handleToggleBlock = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === "Blocked" ? "Active" : "Blocked";
          showToast(`User ${u.name} is now ${newStatus}.`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleDeleteUser = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user account?")) return;
    const target = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast(`User ${target?.name || id} deleted.`);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.contact.includes(searchTerm) ||
      u.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.caste.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.profession.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "active") return u.status === "Active";
    if (activeTab === "inactive") return u.status === "Inactive";
    if (activeTab === "blocked") return u.status === "Blocked";
    if (activeTab === "premium") return u.plan !== "Free";
    return true;
  });

  return (
    <div className="space-y-6 text-[#1C1C1E]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1F44]">User Management & 360° Candidate Inspector</h1>
          <p className="text-xs text-[#636366]">Inspect full candidate profiles (Bride/Groom), family, horoscope, creator proofs, partner preferences, and telemetry</p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New User</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex rounded-full bg-[#FCFBF7] p-1 border border-[rgba(28,28,30,0.08)] text-xs font-semibold overflow-x-auto">
            {(["all", "active", "inactive", "blocked", "premium"] as const).map((tab) => {
              const count =
                tab === "all"
                  ? users.length
                  : tab === "active"
                  ? users.filter((u) => u.status === "Active").length
                  : tab === "inactive"
                  ? users.filter((u) => u.status === "Inactive").length
                  : tab === "blocked"
                  ? users.filter((u) => u.status === "Blocked").length
                  : users.filter((u) => u.plan !== "Free").length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full capitalize transition-all whitespace-nowrap ${
                    activeTab === tab ? "bg-[#C81D45] text-white shadow-sm font-bold" : "text-[#636366]"
                  }`}
                >
                  {tab === "all" ? "All Profiles" : tab} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93]" />
            <input
              type="text"
              placeholder="Search by name (e.g. Nagarajan), caste, job..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] pl-10 pr-4 text-xs font-medium focus:outline-none"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(28,28,30,0.08)] text-[#8E8E93] uppercase text-[10px] font-bold">
                <th className="pb-3">Candidate / Profile</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Community & District</th>
                <th className="pb-3">Profession & Income</th>
                <th className="pb-3">Membership</th>
                <th className="pb-3">Interests / Shortlists</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">360° Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(28,28,30,0.06)]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#8E8E93]">
                    No profiles matching criteria found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FCFBF7] transition-colors">
                    <td className="py-3.5 flex items-center space-x-3">
                      <img
                        src={u.photoUrl}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover border border-[rgba(28,28,30,0.08)] flex-shrink-0 shadow-sm"
                      />
                      <div>
                        <div className="font-bold text-[#0A1F44] flex items-center gap-1.5">
                          <span>{u.name}</span>
                          <span className="text-[10px] text-[#8E8E93]">({u.age} yrs)</span>
                        </div>
                        <div className="text-[10px] text-[#8E8E93]">{u.contact} · {u.email}</div>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.gender === "Bride" ? "bg-pink-100 text-pink-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {u.gender}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-[#0A1F44]">{u.religion} · {u.caste}</div>
                      <div className="text-[10px] text-[#8E8E93]">{u.district}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-[#0A1F44] truncate max-w-[150px]">{u.profession}</div>
                      <div className="text-[10px] text-[#8E8E93]">{u.incomeBracket}</div>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.plan === "Platinum"
                          ? "bg-purple-100 text-purple-800"
                          : u.plan === "Gold"
                          ? "bg-amber-100 text-amber-800"
                          : u.plan === "Silver"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#0A1F44]">
                        <span className="flex items-center gap-1 text-amber-600">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span>{u.telemetry.interestsReceivedCount} in</span>
                        </span>
                        <span className="text-[#8E8E93]">·</span>
                        <span className="flex items-center gap-1 text-red-600">
                          <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                          <span>{u.telemetry.shortlistedCount} saved</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : u.status === "Blocked"
                            ? "bg-red-50 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setViewingUser(u);
                          setViewingTab("profile");
                        }}
                        title="View Full 360° Profile"
                        className="px-3 py-1.5 rounded-full bg-[#0A1F44] text-white hover:bg-[#0A1F44]/90 text-[11px] font-bold inline-flex items-center gap-1 shadow-sm"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View Full Profile</span>
                      </button>
                      <button
                        onClick={() => setEditingUser(u)}
                        title="Edit User"
                        className="px-2.5 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold inline-flex items-center gap-1"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleToggleBlock(u.id)}
                        title={u.status === "Blocked" ? "Unblock User" : "Block User"}
                        className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                          u.status === "Blocked"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {u.status === "Blocked" ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                        <span>{u.status === "Blocked" ? "Unblock" : "Block"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── VIEW FULL 360° CANDIDATE PROFILE MODAL ───────────────────────── */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-[rgba(28,28,30,0.12)] space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header Hero Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(28,28,30,0.08)]">
              <div className="flex items-center space-x-4">
                <img
                  src={viewingUser.photoUrl}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover border-2 border-[#C81D45] shadow-md flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#0A1F44]">{viewingUser.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      viewingUser.gender === "Bride" ? "bg-pink-100 text-pink-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {viewingUser.gender} ({viewingUser.age} yrs)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {viewingUser.verification}
                    </span>
                  </div>
                  <p className="text-xs text-[#636366] mt-0.5">
                    ID: {viewingUser.id} · Native: {viewingUser.city} · {viewingUser.plan} Member
                  </p>
                </div>
              </div>
              <button onClick={() => setViewingUser(null)} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center self-end sm:self-auto">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Navigation 4-Tabs */}
            <div className="flex rounded-full bg-[#FCFBF7] p-1 border border-[rgba(28,28,30,0.08)] text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setViewingTab("profile")}
                className={`flex-1 py-2 rounded-full transition-all whitespace-nowrap ${
                  viewingTab === "profile" ? "bg-[#C81D45] text-white shadow-sm font-bold" : "text-[#636366]"
                }`}
              >
                1. Full Personal, Bio & Family
              </button>
              <button
                onClick={() => setViewingTab("preferences")}
                className={`flex-1 py-2 rounded-full transition-all whitespace-nowrap ${
                  viewingTab === "preferences" ? "bg-[#C81D45] text-white shadow-sm font-bold" : "text-[#636366]"
                }`}
              >
                2. Partner Preferences
              </button>
              <button
                onClick={() => setViewingTab("verification")}
                className={`flex-1 py-2 rounded-full transition-all whitespace-nowrap ${
                  viewingTab === "verification" ? "bg-[#C81D45] text-white shadow-sm font-bold" : "text-[#636366]"
                }`}
              >
                3. Creator & ID Proofs
              </button>
              <button
                onClick={() => setViewingTab("telemetry")}
                className={`flex-1 py-2 rounded-full transition-all whitespace-nowrap ${
                  viewingTab === "telemetry" ? "bg-[#C81D45] text-white shadow-sm font-bold" : "text-[#636366]"
                }`}
              >
                4. Activity & Telemetry
              </button>
            </div>

            {/* TAB 1: FULL CANDIDATE PROFILE (BIO, EDUCATION, CAREER, FAMILY, HOROSCOPE) */}
            {viewingTab === "profile" && (
              <div className="space-y-4 text-xs">
                {/* Bio Box */}
                <div className="p-4 bg-[#FCFBF7] rounded-2xl border border-[rgba(28,28,30,0.06)] space-y-1.5">
                  <h4 className="font-bold text-[#0A1F44] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#C81D45]" />
                    <span>Candidate Bio / About Self</span>
                  </h4>
                  <p className="text-xs text-[#636366] leading-relaxed italic">
                    "{viewingUser.bio}"
                  </p>
                </div>

                {/* Grid: Cultural & Horoscope vs Education & Career */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cultural & Horoscope */}
                  <div className="p-4 bg-white rounded-2xl border border-[rgba(28,28,30,0.08)] space-y-2">
                    <h4 className="font-bold text-[#0A1F44] flex items-center gap-1.5 border-b border-[rgba(28,28,30,0.06)] pb-1.5">
                      <Award className="h-3.5 w-3.5 text-purple-700" />
                      <span>Community & Horoscope Details</span>
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Religion:</span><span className="font-bold text-[#0A1F44]">{viewingUser.religion}</span></div>
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Caste:</span><span className="font-bold text-[#0A1F44]">{viewingUser.caste}</span></div>
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Sub-Caste:</span><span className="font-semibold text-[#0A1F44]">{viewingUser.subCaste || "Not Specified"}</span></div>
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Star / Nakshatram:</span><span className="font-semibold text-[#0A1F44]">{viewingUser.starNakshatram}</span></div>
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Rasi:</span><span className="font-semibold text-[#0A1F44]">{viewingUser.rasi}</span></div>
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Horoscope Match:</span><span className="font-semibold text-emerald-700">{viewingUser.horoscopeRequired ? "Required / Attached" : "Not Compulsory"}</span></div>
                    </div>
                  </div>

                  {/* Education & Career */}
                  <div className="p-4 bg-white rounded-2xl border border-[rgba(28,28,30,0.08)] space-y-2">
                    <h4 className="font-bold text-[#0A1F44] flex items-center gap-1.5 border-b border-[rgba(28,28,30,0.06)] pb-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-blue-700" />
                      <span>Education & Career Profile</span>
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Education:</span><span className="font-bold text-[#0A1F44] text-right truncate max-w-[170px]">{viewingUser.education}</span></div>
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Profession:</span><span className="font-bold text-[#0A1F44]">{viewingUser.profession}</span></div>
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Company:</span><span className="font-semibold text-[#0A1F44]">{viewingUser.company}</span></div>
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Annual Income:</span><span className="font-bold text-[#C81D45]">{viewingUser.incomeBracket}</span></div>
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Work Location:</span><span className="font-semibold text-[#0A1F44]">{viewingUser.workLocation}</span></div>
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Height & Status:</span><span className="font-semibold text-[#0A1F44]">{viewingUser.height} · {viewingUser.maritalStatus}</span></div>
                    </div>
                  </div>
                </div>

                {/* Family Background */}
                <div className="p-4 bg-white rounded-2xl border border-[rgba(28,28,30,0.08)] space-y-2">
                  <h4 className="font-bold text-[#0A1F44] flex items-center gap-1.5 border-b border-[rgba(28,28,30,0.06)] pb-1.5">
                    <Home className="h-3.5 w-3.5 text-amber-700" />
                    <span>Family Hierarchy & Background</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Father:</span><span className="font-semibold text-[#0A1F44]">{viewingUser.fatherName}</span></div>
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Mother:</span><span className="font-semibold text-[#0A1F44]">{viewingUser.motherName}</span></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Siblings:</span><span className="font-semibold text-[#0A1F44]">{viewingUser.siblings}</span></div>
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Family Type:</span><span className="font-semibold text-[#0A1F44]">{viewingUser.familyType}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PARTNER PREFERENCES */}
            {viewingTab === "preferences" && (
              <div className="space-y-4 text-xs">
                <div className="p-5 bg-[#FCFBF7] rounded-2xl border border-[rgba(28,28,30,0.06)] space-y-3">
                  <h4 className="font-bold text-[#0A1F44] flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-[#C81D45]" />
                    <span>Expected Partner Criteria & Match Preferences</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-[rgba(28,28,30,0.06)]">
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Preferred Age:</span><span className="font-bold text-[#0A1F44]">{viewingUser.partnerPreferences.ageRange}</span></div>
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Preferred Height:</span><span className="font-bold text-[#0A1F44]">{viewingUser.partnerPreferences.heightRange}</span></div>
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Marital Status:</span><span className="font-semibold text-[#0A1F44]">{viewingUser.partnerPreferences.maritalStatus}</span></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Religion & Caste:</span><span className="font-bold text-[#0A1F44]">{viewingUser.partnerPreferences.religion} · {viewingUser.partnerPreferences.caste}</span></div>
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Minimum Education:</span><span className="font-semibold text-[#0A1F44] truncate max-w-[160px]">{viewingUser.partnerPreferences.education}</span></div>
                      <div className="flex justify-between"><span className="text-[#8E8E93]">Preferred Districts:</span><span className="font-semibold text-[#0A1F44] text-right truncate max-w-[160px]">{viewingUser.partnerPreferences.district}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: OWNERSHIP & VERIFICATION ID PROOFS */}
            {viewingTab === "verification" && (
              <div className="space-y-4 text-xs">
                {/* Creator Box */}
                <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-purple-950 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-purple-700" />
                      <span>Profile Ownership: {viewingUser.createdFor}</span>
                    </span>
                    {viewingUser.creatorPhone && (
                      <a
                        href={`tel:${viewingUser.creatorPhone}`}
                        className="px-3 py-1 rounded-full bg-[#C81D45] text-white font-bold text-[10px] inline-flex items-center gap-1 shadow-sm"
                      >
                        <Phone className="h-3 w-3" />
                        <span>Call Guardian ({viewingUser.creatorPhone})</span>
                      </a>
                    )}
                  </div>
                  {viewingUser.createdFor !== "Self" && (
                    <div className="space-y-1 text-[11px] text-purple-900 pt-1">
                      <div>Guardian / Creator Name: <span className="font-bold">{viewingUser.creatorName}</span></div>
                      <div>Relationship: <span className="font-semibold">{viewingUser.creatorRelation}</span></div>
                    </div>
                  )}
                </div>

                {/* ID Proof Preview */}
                <div className="p-4 bg-[#FCFBF7] rounded-2xl border border-[rgba(28,28,30,0.06)] space-y-2">
                  <h4 className="font-bold text-[#0A1F44] flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Attached Government ID / Relationship Proof</span>
                  </h4>
                  {viewingUser.creatorDocUrl ? (
                    <div className="space-y-2">
                      <img
                        src={viewingUser.creatorDocUrl}
                        alt="Document Proof"
                        className="w-full h-44 rounded-xl object-cover border border-[rgba(28,28,30,0.12)] shadow-sm"
                      />
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>Document verified by KeralamMatch administration</span>
                      </span>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-[#8E8E93] bg-white rounded-xl">
                      Self-verified profile with live facial selfie and OTP verification.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: ACTIVITY & TELEMETRY */}
            {viewingTab === "telemetry" && (
              <div className="space-y-4 text-xs">
                {/* Metrics 3-Card Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-amber-800 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-600 text-amber-600" />
                      <span>Interests Received</span>
                    </span>
                    <div className="text-2xl font-extrabold text-amber-950">
                      {viewingUser.telemetry.interestsReceivedCount}
                    </div>
                    <span className="text-[10px] text-amber-800">
                      Sent {viewingUser.telemetry.interestsSentCount} interests
                    </span>
                  </div>

                  <div className="p-4 bg-red-50/70 border border-red-200/60 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-red-800 flex items-center gap-1">
                      <Heart className="h-3 w-3 fill-red-600 text-red-600" />
                      <span>Shortlisted By</span>
                    </span>
                    <div className="text-2xl font-extrabold text-red-950">
                      {viewingUser.telemetry.shortlistedCount}
                    </div>
                    <span className="text-[10px] text-red-800">
                      Candidates saved profile
                    </span>
                  </div>

                  <div className="p-4 bg-blue-50/70 border border-blue-200/60 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-blue-800 flex items-center gap-1">
                      <PhoneCall className="h-3 w-3 text-blue-600" />
                      <span>24h Contact Unlocks</span>
                    </span>
                    <div className="text-2xl font-extrabold text-blue-950">
                      {viewingUser.telemetry.contactRevealsCount}
                    </div>
                    <span className="text-[10px] text-blue-800">
                      Mutual consent reveals
                    </span>
                  </div>
                </div>

                {/* Geographic Breakdown */}
                <div className="bg-[#FCFBF7] p-5 rounded-2xl border border-[rgba(28,28,30,0.06)] space-y-3">
                  <h4 className="font-bold text-[#0A1F44] flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#C81D45]" />
                    <span>Geographic Origin Breakdown (Interests & Shortlists)</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[#8E8E93] text-[11px] self-center mr-1">Interests from:</span>
                      {viewingUser.telemetry.interestsReceivedFrom.length > 0 ? (
                        viewingUser.telemetry.interestsReceivedFrom.map((loc, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-white border border-[rgba(28,28,30,0.08)] rounded-full text-[11px] font-semibold text-[#0A1F44]">
                            {loc}
                          </span>
                        ))
                      ) : (
                        <span className="text-[#8E8E93]">No incoming interests yet</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[#8E8E93] text-[11px] self-center mr-1">Shortlisted in:</span>
                      {viewingUser.telemetry.shortlistedFrom.length > 0 ? (
                        viewingUser.telemetry.shortlistedFrom.map((loc, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-white border border-[rgba(28,28,30,0.08)] rounded-full text-[11px] font-semibold text-[#0A1F44]">
                            {loc}
                          </span>
                        ))
                      ) : (
                        <span className="text-[#8E8E93]">No shortlists yet</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chat Telemetry Box (Zero Message Snooping) */}
                <div className="bg-[#FCFBF7] p-5 rounded-2xl border border-[rgba(28,28,30,0.06)] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#0A1F44] flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-[#0A369D]" />
                      <span>In-App Chat Telemetry</span>
                    </h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      viewingUser.telemetry.hasUsedChat ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      {viewingUser.telemetry.hasUsedChat ? "Has Used Chat (Active)" : "Never Chatted"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-[rgba(28,28,30,0.06)]">
                    <div>
                      <span className="text-[10px] text-[#8E8E93] block">Active Threads</span>
                      <span className="font-bold text-[#0A1F44] text-sm">{viewingUser.telemetry.chatThreadsCount} conversations</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8E8E93] block">Total Messages</span>
                      <span className="font-bold text-[#0A1F44] text-sm">{viewingUser.telemetry.totalMessagesCount} messages</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8E8E93] block">Last Activity</span>
                      <span className="font-bold text-[#0A1F44] text-sm">{viewingUser.telemetry.lastChatActive}</span>
                    </div>
                  </div>

                  {/* Privacy Guard Notice */}
                  <div className="p-3 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-[11px] flex items-start space-x-2">
                    <Lock className="h-3.5 w-3.5 text-purple-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Zero-Knowledge Message Privacy Guaranteed:</span>
                      <p className="text-[10px] text-purple-800 mt-0.5">
                        Private message contents are encrypted with AES-256-GCM. Admins can view activity volume and timestamps, but cannot decrypt or read private message contents.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Bottom Action Bar */}
            <div className="flex justify-between items-center pt-2 border-t border-[rgba(28,28,30,0.08)]">
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="px-4 py-2 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#636366]"
              >
                Close
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const target = viewingUser;
                    setViewingUser(null);
                    setEditingUser(target);
                  }}
                  className="px-5 py-2 rounded-full bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white text-xs font-bold shadow-sm"
                >
                  Edit Profile Attributes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── EDIT USER MODAL ──────────────────────────────────────────────── */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[rgba(28,28,30,0.12)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0A1F44]">Edit User Profile</h3>
                <p className="text-xs text-[#636366]">Modify member account attributes & access control</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Full Name</label>
                <Input
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="rounded-full h-10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Email</label>
                  <Input
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="rounded-full h-10"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Phone Contact</label>
                  <Input
                    value={editingUser.contact}
                    onChange={(e) => setEditingUser({ ...editingUser, contact: e.target.value })}
                    className="rounded-full h-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Verification</label>
                  <select
                    value={editingUser.verification}
                    onChange={(e) => setEditingUser({ ...editingUser, verification: e.target.value as any })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Plan</label>
                  <select
                    value={editingUser.plan}
                    onChange={(e) => setEditingUser({ ...editingUser, plan: e.target.value as any })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Free">Free</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[rgba(28,28,30,0.08)] flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleDeleteUser(editingUser.id)}
                  className="text-red-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete User</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#636366]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD USER MODAL ────────────────────────────────────────────────── */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[rgba(28,28,30,0.12)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0A1F44]">Add New Member</h3>
                <p className="text-xs text-[#636366]">Create a verified user account manually</p>
              </div>
              <button onClick={() => setIsAddUserOpen(false)} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Candidate Full Name *</label>
                <Input
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className="rounded-full h-10"
                  required
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Phone Number *</label>
                <Input
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="+91 98470 12345"
                  className="rounded-full h-10"
                  required
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Email Address</label>
                <Input
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="suresh@gmail.com"
                  className="rounded-full h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">District</label>
                  <select
                    value={newUserDistrict}
                    onChange={(e) => setNewUserDistrict(e.target.value)}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold focus:outline-none"
                  >
                    {["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Membership Plan</label>
                  <select
                    value={newUserPlan}
                    onChange={(e) => setNewUserPlan(e.target.value as any)}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Free">Free</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[rgba(28,28,30,0.08)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#636366]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-md"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
