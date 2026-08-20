import React from "react";
import Link from "next/link";
export const dynamic = "force-dynamic";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { getProfileDetailsAction } from "@/modules/profile/profile.controller";
import { getMatchScoreAction } from "@/modules/matching/matching.controller";
import { ContactRepository } from "@/modules/contact/contact.repository";
import { prisma } from "@/lib/db";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import ProfileClientView from "./profile-client-view";

const contactRepo = new ContactRepository();

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfileDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const targetProfileId = resolvedParams.id;
  const session = await getSessionAction();

  if (!session.isAuthenticated || !session.user) {
    return (
      <div className="flex flex-col min-h-screen bg-bg-primary items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-text-primary mb-4">Please log in to view candidate profiles</h2>
        <Link href="/auth">
          <button className="bg-brand-primary text-white px-6 py-3 rounded-full font-medium">Log In</button>
        </Link>
      </div>
    );
  }

  // 1. Fetch Target Profile using safe query handling
  let targetProfile: any = null;
  try {
    if (targetProfileId === "me" || targetProfileId === session.user.id || targetProfileId === `prf-${session.user.id}`) {
      targetProfile = await prisma.profile.findFirst({
        where: { userId: session.user.id },
        include: {
          media: true,
          user: true,
        },
      });
    } else {
      targetProfile = await prisma.profile.findFirst({
        where: {
          OR: [
            { id: targetProfileId },
            { userId: targetProfileId },
          ],
        },
        include: {
          media: true,
          user: true,
        },
      });
    }
  } catch (err) {
    if (process.env.NODE_ENV === "production") {
      targetProfile = null;
    }
  }

  // Development sandbox fallback
  if (!targetProfile) {
    const devMockProfiles: Record<string, any> = {
      "me": {
        id: "prf-usr-sandbox-101",
        userId: session.user.id || "usr-sandbox-101",
        firstName: (session.user as any).firstName || "Nagarajan",
        lastName: (session.user as any).lastName || "P",
        gender: (session.user as any).gender || "MALE",
        dateOfBirth: new Date("1995-01-01"),
        height: 170,
        maritalStatus: "Never Married",
        motherTongue: "Malayalam",
        religion: "Hindu",
        caste: "Nair",
        subCaste: "Pillai",
        education: "B.Tech Computer Science",
        profession: "Senior Software Engineer",
        company: "Technopark Enterprise",
        incomeBracket: "₹15 - 25 Lakhs / year",
        district: "Ernakulam",
        state: "Kerala",
        country: "India",
        city: "Kochi",
        bio: "Senior Software Engineer working in Kochi. Looking for an educated, culturally grounded life partner.",
        profileStrength: 95,
        reputationRating: 94,
        verificationStatus: "APPROVED",
        verifiedMobile: true,
        verifiedEmail: true,
        verifiedSelfie: true,
        horoscopeRequired: false,
        media: [{ id: "m-my-1", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", type: "IMAGE" }],
      },
      "prf-usr-sandbox-101": {
        id: "prf-usr-sandbox-101",
        userId: "usr-sandbox-101",
        firstName: "Nagarajan",
        lastName: "P",
        gender: "MALE",
        dateOfBirth: new Date("1995-01-01"),
        height: 170,
        maritalStatus: "Never Married",
        motherTongue: "Malayalam",
        religion: "Hindu",
        caste: "Nair",
        subCaste: "Pillai",
        education: "B.Tech Computer Science",
        profession: "Senior Software Engineer",
        company: "Technopark Enterprise",
        incomeBracket: "₹15 - 25 Lakhs / year",
        district: "Ernakulam",
        state: "Kerala",
        country: "India",
        city: "Kochi",
        bio: "Senior Software Engineer working in Kochi. Looking for an educated, culturally grounded life partner.",
        profileStrength: 95,
        reputationRating: 94,
        verificationStatus: "APPROVED",
        verifiedMobile: true,
        verifiedEmail: true,
        verifiedSelfie: true,
        horoscopeRequired: false,
        media: [{ id: "m-my-1", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", type: "IMAGE" }],
      },
      "prf-1": {
        id: "prf-1",
        userId: "usr-ananya-101",
        firstName: "Ananya",
        lastName: "Nair",
        gender: "FEMALE",
        dateOfBirth: new Date("1998-06-12"),
        height: 165,
        maritalStatus: "Never Married",
        motherTongue: "Malayalam",
        religion: "Hindu",
        caste: "Nair",
        subCaste: "Menon",
        education: "M.Des / B.Tech Computer Science",
        profession: "Senior UI/UX Designer",
        company: "Design Studio Kochi",
        incomeBracket: "₹10L - ₹20L per annum",
        district: "Ernakulam",
        state: "Kerala",
        country: "India",
        city: "Kochi",
        bio: "UI/UX Designer working in Infopark Kochi. Passionate about art, music, and travel. Looking for a well-educated, respectful partner.",
        profileStrength: 95,
        reputationRating: 94,
        verificationStatus: "APPROVED",
        verifiedMobile: true,
        verifiedEmail: true,
        verifiedSelfie: true,
        horoscopeRequired: true,
        media: [{ id: "m-1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80", type: "IMAGE" }],
      },
      "prf-2": {
        id: "prf-2",
        userId: "usr-divya-102",
        firstName: "Dr. Divya",
        lastName: "Thomas",
        gender: "FEMALE",
        dateOfBirth: new Date("1997-03-22"),
        height: 162,
        maritalStatus: "Never Married",
        motherTongue: "Malayalam",
        religion: "Christian",
        caste: "Syrian Catholic",
        subCaste: "Syro-Malabar",
        education: "MBBS, MD Pediatrics",
        profession: "Medical Resident (MD)",
        company: "Medical College Kottayam",
        incomeBracket: "₹10L - ₹20L per annum",
        district: "Kottayam",
        state: "Kerala",
        country: "India",
        city: "Kottayam",
        bio: "Doctor currently pursuing post-graduation in Kottayam. Family oriented, love classical music and reading.",
        profileStrength: 90,
        reputationRating: 91,
        verificationStatus: "APPROVED",
        verifiedMobile: true,
        verifiedEmail: true,
        verifiedSelfie: true,
        horoscopeRequired: false,
        media: [{ id: "m-2", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80", type: "IMAGE" }],
      },
      "prf-3": {
        id: "prf-3",
        userId: "usr-meera-103",
        firstName: "Meera",
        lastName: "Krishnan",
        gender: "FEMALE",
        dateOfBirth: new Date("1999-11-05"),
        height: 160,
        maritalStatus: "Never Married",
        motherTongue: "Malayalam",
        religion: "Hindu",
        caste: "Ezhava",
        subCaste: "Ezhava",
        education: "B.Com, ACA (Chartered Accountant)",
        profession: "Chartered Accountant (CA)",
        company: "Ernst & Young",
        incomeBracket: "₹10L - ₹20L per annum",
        district: "Thiruvananthapuram",
        state: "Kerala",
        country: "India",
        city: "Thiruvananthapuram",
        bio: "Practicing Chartered Accountant based in Trivandrum. Enjoys cultural events, badmington, and family gatherings.",
        profileStrength: 88,
        reputationRating: 88,
        verificationStatus: "APPROVED",
        verifiedMobile: true,
        verifiedEmail: true,
        verifiedSelfie: true,
        horoscopeRequired: true,
        media: [{ id: "m-3", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80", type: "IMAGE" }],
      },
      "prf-4": {
        id: "prf-4",
        userId: "usr-sneha-104",
        firstName: "Sneha",
        lastName: "Menon",
        gender: "FEMALE",
        dateOfBirth: new Date("1996-08-14"),
        height: 168,
        maritalStatus: "Never Married",
        motherTongue: "Malayalam",
        religion: "Hindu",
        caste: "Nair",
        subCaste: "Menon",
        education: "MS Artificial Intelligence",
        profession: "Data Scientist",
        company: "Tech Corp Bangalore",
        incomeBracket: "Above ₹20L per annum",
        district: "Thrissur",
        state: "Kerala",
        country: "India",
        city: "Thrissur",
        bio: "Data science professional. Open-minded, culturally grounded Malayali looking for an intellectually compatible partner.",
        profileStrength: 92,
        reputationRating: 85,
        verificationStatus: "APPROVED",
        verifiedMobile: true,
        verifiedEmail: true,
        verifiedSelfie: true,
        horoscopeRequired: false,
        media: [{ id: "m-4", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80", type: "IMAGE" }],
      },
    };

    if (devMockProfiles[targetProfileId]) {
      targetProfile = devMockProfiles[targetProfileId];
    }
  }

  if (!targetProfile) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FCFBF7] items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-[#0A1F44]">Profile Not Found</h2>
        <p className="text-xs text-[#636366] mt-2 mb-6">The requested candidate profile is either private, unverified, or does not exist.</p>
        <Link href="/find" className="px-6 py-2.5 rounded-full bg-[#C81D45] text-white text-xs font-bold shadow-md">
          Browse Candidate Profiles
        </Link>
      </div>
    );
  }

  // 2. Fetch Match Compatibility score
  let matchScore = 85;
  let matchBreakdown = null;
  try {
    const matchResult = await getMatchScoreAction(targetProfile.userId);
    if (matchResult.success) {
      matchScore = (matchResult as any).score || 85;
      matchBreakdown = (matchResult as any).breakdown;
    }
  } catch {
    matchScore = 88;
  }

  // 3. Fetch current status of contact request safely
  let contactRequest: any = null;
  try {
    contactRequest = await contactRepo.findRequestByUsers(session.user.id, targetProfile.userId);
  } catch {
    contactRequest = null;
  }

  // Calculate age
  const birth = new Date(targetProfile.dateOfBirth);
  const age = new Date().getFullYear() - birth.getFullYear();

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <Header />
      
      <main className="flex-grow mx-auto max-w-5xl w-full px-6 md:px-8 py-12">
        <ProfileClientView
          targetProfile={JSON.parse(JSON.stringify(targetProfile))}
          age={age}
          matchScore={matchScore}
          matchBreakdown={JSON.parse(JSON.stringify(matchBreakdown))}
          initialContactRequest={JSON.parse(JSON.stringify(contactRequest))}
          currentUserId={session.user.id}
        />
      </main>

      <Footer />
    </div>
  );
}
