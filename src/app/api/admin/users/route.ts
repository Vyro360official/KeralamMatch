import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminRole(req);
  if (auth.error) {
    return auth.response!;
  }

  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);
    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        take: limit,
        skip: skip,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          profile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gender: true,
              dateOfBirth: true,
              height: true,
              maritalStatus: true,
              motherTongue: true,
              religion: true,
              caste: true,
              subCaste: true,
              horoscopeRequired: true,
              horoscopeImage: true,
              education: true,
              profession: true,
              company: true,
              incomeBracket: true,
              district: true,
              state: true,
              country: true,
              city: true,
              bio: true,
              verificationStatus: true,
              
              // Extended attributes
              timeOfBirth: true,
              placeOfBirth: true,
              starNakshatram: true,
              rasi: true,
              dosham: true,
              gothram: true,
              horoscopeDocumentUrl: true,
              bodyType: true,
              complexion: true,
              physicalStatus: true,
              fitnessLevel: true,
              foodHabits: true,
              smoking: true,
              drinking: true,
              
              // Family details
              familyStatus: true,
              familyType: true,
              familyValues: true,
              fatherName: true,
              fatherOccupation: true,
              motherName: true,
              motherOccupation: true,
              totalBrothers: true,
              marriedBrothers: true,
              totalSisters: true,
              marriedSisters: true,
              familyAssets: true,
              hobbies: true,
              
              // Creator details
              createdFor: true,
              creatorName: true,
              creatorPhone: true,
              creatorRelation: true,
              creatorDocumentUrl: true,
              
              // Auditing
              createdBy: true,
              createdById: true,
              lastModifiedBy: true,

              // Partner preferences
              partnerAgeMin: true,
              partnerAgeMax: true,
              partnerAgeStrict: true,
              partnerHeightMin: true,
              partnerHeightMax: true,
              partnerHeightStrict: true,
              partnerMaritalStatus: true,
              partnerMaritalStatusStrict: true,
              partnerMotherTongue: true,
              partnerMotherTongueStrict: true,
              partnerPhysicalStatus: true,
              partnerPhysicalStatusStrict: true,
              partnerDosham: true,
              partnerDoshamStrict: true,
              partnerReligion: true,
              partnerReligionStrict: true,
              partnerCaste: true,
              partnerCasteStrict: true,
              partnerSubCaste: true,
              partnerSubCasteStrict: true,
              partnerEducation: true,
              partnerEducationStrict: true,
              partnerProfession: true,
              partnerProfessionStrict: true,
              partnerFoodHabits: true,
              partnerFoodHabitsStrict: true,
              partnerDrinking: true,
              partnerDrinkingStrict: true,
              partnerSmoking: true,
              partnerSmokingStrict: true,
              partnerCountry: true,
              partnerCountryStrict: true,
              partnerDistrict: true,
              partnerDistrictStrict: true,
              partnerCity: true,
            },
          },
          subscriptions: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              status: true,
              plan: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.user.count(),
    ]);

    const formattedUsers = users.map((u) => {
      const p = u.profile;
      let age = 28;
      if (p?.dateOfBirth) {
        const birthDate = new Date(p.dateOfBirth);
        const ageDiffMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiffMs);
        age = Math.abs(ageDate.getUTCFullYear() - 1970);
      }

      return {
        id: u.id,
        name: p ? `${p.firstName} ${p.lastName}`.trim() : "Member",
        gender: p?.gender === "FEMALE" ? ("Bride" as const) : ("Groom" as const),
        age,
        height: p?.height ? `${p.height} cm` : "170 cm",
        maritalStatus: p?.maritalStatus || "Never Married",
        email: u.email,
        contact: u.phone,
        district: p?.district || "",
        city: p?.city || "",
        status: u.role === "USER" ? ("Active" as const) : u.role === "ADMIN" ? ("Active" as const) : ("Blocked" as const),
        verification: p?.verificationStatus === "VERIFIED" 
          ? ("Verified" as const) 
          : p?.verificationStatus === "PENDING" 
          ? ("Pending" as const) 
          : ("Rejected" as const),
        plan: (u.subscriptions[0]?.plan?.name || "Free") as any,
        joined: u.createdAt.toLocaleDateString("en-GB"),
        photoUrl: p?.gender === "FEMALE" 
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" 
          : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        bio: p?.bio || "No biography provided.",
        religion: p?.religion || "Hindu",
        caste: p?.caste || "Nair",
        subCaste: p?.subCaste || "",
        horoscopeRequired: p?.horoscopeRequired || false,
        education: p?.education || "Graduate",
        profession: p?.profession || "Software Professional",
        company: p?.company || "",
        incomeBracket: p?.incomeBracket || "₹6 - 10 Lakhs / year",
        workLocation: p?.city || "",
        motherTongue: p?.motherTongue || "Malayalam",
        
        // Extended attributes
        timeOfBirth: p?.timeOfBirth || null,
        placeOfBirth: p?.placeOfBirth || null,
        starNakshatram: p?.starNakshatram || null,
        rasi: p?.rasi || null,
        dosham: p?.dosham || null,
        gothram: p?.gothram || null,
        horoscopeDocumentUrl: p?.horoscopeDocumentUrl || null,
        bodyType: p?.bodyType || null,
        complexion: p?.complexion || null,
        physicalStatus: p?.physicalStatus || null,
        fitnessLevel: p?.fitnessLevel || null,
        foodHabits: p?.foodHabits || null,
        smoking: p?.smoking || null,
        drinking: p?.drinking || null,
        
        // Family details
        familyStatus: p?.familyStatus || null,
        familyType: p?.familyType || null,
        familyValues: p?.familyValues || null,
        fatherName: p?.fatherName || null,
        fatherOccupation: p?.fatherOccupation || null,
        motherName: p?.motherName || null,
        motherOccupation: p?.motherOccupation || null,
        totalBrothers: p?.totalBrothers || 0,
        marriedBrothers: p?.marriedBrothers || 0,
        totalSisters: p?.totalSisters || 0,
        marriedSisters: p?.marriedSisters || 0,
        familyAssets: p?.familyAssets || [],
        hobbies: p?.hobbies || [],
        
        // Creator details
        createdFor: p?.createdFor || "Self",
        creatorName: p?.creatorName || null,
        creatorPhone: p?.creatorPhone || null,
        creatorRelation: p?.creatorRelation || null,
        creatorDocumentUrl: p?.creatorDocumentUrl || null,
        
        // Auditing
        createdBy: p?.createdBy || "USER",
        createdById: p?.createdById || null,
        lastModifiedBy: p?.lastModifiedBy || null,
        
        partnerPreferences: {
          ageRange: `${p?.partnerAgeMin || 21} - ${p?.partnerAgeMax || 35} yrs`,
          heightRange: `${p?.partnerHeightMin || 150} cm - ${p?.partnerHeightMax || 190} cm`,
          maritalStatus: p?.partnerMaritalStatus || "Any",
          religion: p?.partnerReligion || "Any",
          caste: p?.partnerCaste || "Any",
          education: p?.partnerEducation || "Any",
          district: p?.partnerDistrict || "Any",
          
          partnerAgeMin: p?.partnerAgeMin || null,
          partnerAgeMax: p?.partnerAgeMax || null,
          partnerAgeStrict: p?.partnerAgeStrict || false,
          partnerHeightMin: p?.partnerHeightMin || null,
          partnerHeightMax: p?.partnerHeightMax || null,
          partnerHeightStrict: p?.partnerHeightStrict || false,
          partnerMaritalStatus: p?.partnerMaritalStatus || null,
          partnerMaritalStatusStrict: p?.partnerMaritalStatusStrict || false,
          partnerMotherTongue: p?.partnerMotherTongue || null,
          partnerMotherTongueStrict: p?.partnerMotherTongueStrict || false,
          partnerPhysicalStatus: p?.partnerPhysicalStatus || null,
          partnerPhysicalStatusStrict: p?.partnerPhysicalStatusStrict || false,
          partnerDosham: p?.partnerDosham || null,
          partnerDoshamStrict: p?.partnerDoshamStrict || false,
          partnerReligion: p?.partnerReligion || null,
          partnerReligionStrict: p?.partnerReligionStrict || false,
          partnerCaste: p?.partnerCaste || null,
          partnerCasteStrict: p?.partnerCasteStrict || false,
          partnerSubCaste: p?.partnerSubCaste || null,
          partnerSubCasteStrict: p?.partnerSubCasteStrict || false,
          partnerEducation: p?.partnerEducation || null,
          partnerEducationStrict: p?.partnerEducationStrict || false,
          partnerProfession: p?.partnerProfession || null,
          partnerProfessionStrict: p?.partnerProfessionStrict || false,
          partnerFoodHabits: p?.partnerFoodHabits || null,
          partnerFoodHabitsStrict: p?.partnerFoodHabitsStrict || false,
          partnerDrinking: p?.partnerDrinking || null,
          partnerDrinkingStrict: p?.partnerDrinkingStrict || false,
          partnerSmoking: p?.partnerSmoking || null,
          partnerSmokingStrict: p?.partnerSmokingStrict || false,
          partnerCountry: p?.partnerCountry || null,
          partnerCountryStrict: p?.partnerCountryStrict || false,
          partnerDistrict: p?.partnerDistrict || null,
          partnerDistrictStrict: p?.partnerDistrictStrict || false,
          partnerCity: p?.partnerCity || null,
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
    });

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Admin users list retrieval failed:", error);
    return NextResponse.json(
      { success: false, error: "DATABASE_ERROR", message: "Failed to fetch live user list" },
      { status: 500 }
    );
  }
}
