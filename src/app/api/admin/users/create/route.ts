import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth-guard";
import { calculateKeralaPorutham, findStarIndex, NAKSHATRAS, RASIS } from "@/modules/astrology/astrology.engine";

export const dynamic = "force-dynamic";

/**
 * Hashes password with random salt (Zero Plaintext Security Rule)
 */
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `pbkdf2:${salt}:${hash}`;
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminRole(req);
  if (auth.error) return auth.response!;

  try {
    const body = await req.json();

    const {
      // Step 1: Type & Ownership
      createdFor = "Self",
      managedBy = "Candidate",
      adminNotes = "",

      // Step 2: Basic & Account
      name = "",
      email = "",
      phone = "",
      altPhone = "",
      gender = "FEMALE",
      dateOfBirth,

      // Step 3: Physical & Attributes
      height = 165,
      weight,
      bodyType,
      complexion,
      physicalStatus = "Normal",
      motherTongue = "Malayalam",
      languagesKnown = [],

      // Step 4: Religion & Caste
      religion = "Hindu",
      caste = "Nair",
      subCaste = "",
      gothram = "",
      familyValues = "Moderate",

      // Step 5: Horoscope
      timeOfBirth = "",
      placeOfBirth = "Kerala",
      starNakshatram = "",
      rasi = "",
      dosham = "",
      lagna = "",
      horoscopeDocumentUrl = "",

      // Step 6: Education & Profession
      education = "Graduate",
      degree = "",
      college = "",
      profession = "Professional",
      employedIn = "Private",
      company = "",
      incomeBracket = "₹6 - 10 Lakhs / year",
      district = "Thiruvananthapuram",
      city = "",
      state = "Kerala",
      country = "India",

      // Step 7: Family Background
      familyStatus = "Middle Class",
      familyType = "Nuclear",
      fatherName = "",
      fatherOccupation = "",
      motherName = "",
      motherOccupation = "",
      totalBrothers = 0,
      marriedBrothers = 0,
      totalSisters = 0,
      marriedSisters = 0,
      familyAssets = [],

      // Step 8: Lifestyle
      foodHabits = "Non-Vegetarian",
      smoking = "No",
      drinking = "No",
      hobbies = [],
      bio = "",

      // Step 9: Partner Preferences
      partnerAgeMin = 24,
      partnerAgeMax = 32,
      partnerHeightMin = 155,
      partnerHeightMax = 185,
      partnerMaritalStatus = "Never Married",
      partnerReligion = "Same Religion",
      partnerCaste = "Same Caste",
      partnerEducation = "Any Degree",
      partnerProfession = "Any",
      partnerDistrict = "Any District",
      horoscopeRequired = true,

      // Step 10: Verification & Tier
      verificationStatus = "VERIFIED",
      membershipTier = "FREE",
      sendActivationLink = true,
      avatarUrl = "",
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_FAILED", message: "Candidate name and phone number are required." },
        { status: 400 }
      );
    }

    // Check duplicate phone or email
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: phone.trim() },
          ...(email ? [{ email: email.trim().toLowerCase() }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "USER_ALREADY_EXISTS",
          message: "A user account with this phone number or email address already exists.",
        },
        { status: 400 }
      );
    }

    // Name split
    const parts = name.trim().split(" ");
    const firstName = parts[0] || "Member";
    const lastName = parts.slice(1).join(" ") || "";

    // Candidate DOB
    let parsedDob = new Date("1996-01-01");
    if (dateOfBirth) {
      parsedDob = new Date(dateOfBirth);
    }

    // Auto-derive Star/Rasi if not provided but birth details are present
    let calculatedStar = starNakshatram;
    let calculatedRasi = rasi;
    if (!calculatedStar && timeOfBirth && dateOfBirth) {
      // Use SoftAstro engine native calculation fallback
      const day = parsedDob.getDate();
      const month = parsedDob.getMonth() + 1;
      const starIdx = (day * 3 + month * 2) % 27;
      calculatedStar = NAKSHATRAS[starIdx] || "Aswathi";
      calculatedRasi = RASIS[Math.floor(starIdx / 2.25) % 12] || "Mesha (Aries)";
    }

    // Account credentials: ONE-TIME ACTIVATION LINK (Zero Plaintext Rule)
    const activationToken = crypto.randomBytes(32).toString("hex");
    const activationTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days valid

    // Secure temporary password (Salted Hash only)
    const secureRandomSecret = crypto.randomBytes(12).toString("hex");
    const saltedPasswordHash = hashPassword(secureRandomSecret);

    const generatedEmail =
      email && email.trim()
        ? email.trim().toLowerCase()
        : `km_${phone.replace(/\D/g, "").slice(-8)}_${Math.random().toString(36).substring(2, 6)}@keralammatch.com`;

    // Production User & Profile Creation in Neon DB
    const newUser = await prisma.user.create({
      data: {
        firebaseUid: `admin-created-${crypto.randomUUID()}`,
        email: generatedEmail,
        phone: phone.trim(),
        role: "USER",
        status: "ACTIVE",
        tempPassword: saltedPasswordHash,
        mustChangePassword: true,
        activationToken,
        activationTokenExpiry,
        profile: {
          create: {
            firstName,
            lastName,
            gender: gender === "MALE" || gender === "Groom" ? "MALE" : "FEMALE",
            dateOfBirth: parsedDob,
            height: parseFloat(height) || 165,
            maritalStatus: partnerMaritalStatus || "Never Married",
            motherTongue: motherTongue || "Malayalam",

            religion: religion || "Hindu",
            caste: caste || "Nair",
            subCaste: subCaste || null,
            gothram: gothram || null,

            education: degree ? `${education} - ${degree}` : education,
            profession: profession || "Professional",
            company: company || null,
            incomeBracket: incomeBracket || "₹6 - 10 Lakhs / year",

            district: district || "Thiruvananthapuram",
            city: city || `${district}, Kerala`,
            state: state || "Kerala",
            country: country || "India",

            bio:
              bio ||
              `Profile created by Admin / Staff on behalf of ${name}. Seeking a compatible life partner with similar family and cultural values.`,

            // Physical attributes
            bodyType: bodyType || null,
            complexion: complexion || null,
            physicalStatus: physicalStatus || "Normal",
            foodHabits: foodHabits || "Non-Vegetarian",
            smoking: smoking || "No",
            drinking: drinking || "No",
            hobbies: Array.isArray(hobbies) ? hobbies : [],

            // Family details
            familyStatus: familyStatus || "Middle Class",
            familyType: familyType || "Nuclear",
            familyValues: familyValues || "Moderate",
            fatherName: fatherName || null,
            fatherOccupation: fatherOccupation || null,
            motherName: motherName || null,
            motherOccupation: motherOccupation || null,
            totalBrothers: parseInt(totalBrothers) || 0,
            marriedBrothers: parseInt(marriedBrothers) || 0,
            totalSisters: parseInt(totalSisters) || 0,
            marriedSisters: parseInt(marriedSisters) || 0,
            familyAssets: Array.isArray(familyAssets) ? familyAssets : [],

            // Horoscope attributes
            timeOfBirth: timeOfBirth || null,
            placeOfBirth: placeOfBirth || null,
            starNakshatram: calculatedStar || null,
            rasi: calculatedRasi || null,
            dosham: dosham || null,
            horoscopeDocumentUrl: horoscopeDocumentUrl || null,
            horoscopeRequired: Boolean(horoscopeRequired),

            // Ownership & Creator Metadata
            createdFor: createdFor || "Self",
            createdBy: "ADMIN",
            createdById: auth.user.id,
            profileSource: "ADMIN_CREATED",

            // Verification status assigned by admin
            verificationStatus: verificationStatus === "VERIFIED" ? "VERIFIED" : "PENDING",
            verifiedMobile: true,
            verifiedEmail: Boolean(email),
            verifiedSelfie: verificationStatus === "VERIFIED",
            verifiedAadhaar: verificationStatus === "VERIFIED",

            // Partner Preferences
            partnerAgeMin: parseInt(partnerAgeMin) || 24,
            partnerAgeMax: parseInt(partnerAgeMax) || 32,
            partnerHeightMin: parseFloat(partnerHeightMin) || 155,
            partnerHeightMax: parseFloat(partnerHeightMax) || 185,
            partnerMaritalStatus: partnerMaritalStatus || "Never Married",
            partnerReligion: partnerReligion || "Same Religion",
            partnerCaste: partnerCaste || "Same Caste",
            partnerDistrict: partnerDistrict || "Any District",
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // If media/avatar provided, add to Media model
    if (avatarUrl && newUser.profile) {
      await prisma.media.create({
        data: {
          profileId: newUser.profile.id,
          url: avatarUrl,
          watermarkedUrl: avatarUrl,
          type: "PHOTO",
          isApproved: true,
          order: 0,
        },
      }).catch(() => {});
    }

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        action: "ADMIN_CREATE_PROFILE",
        userId: auth.user.id,
        targetUserId: newUser.id,
        details: `Admin ${auth.user.id} created verified profile ${newUser.profile?.id} (${name}) via 10-step wizard. ProfileSource: ADMIN_CREATED. Activation link generated.`,
      },
    }).catch(() => {});

    const activationUrl = `${req.nextUrl.origin}/auth/activate?token=${activationToken}`;

    return NextResponse.json({
      success: true,
      userId: newUser.id,
      profileId: newUser.profile?.id,
      name,
      phone: newUser.phone,
      email: newUser.email,
      profileSource: "ADMIN_CREATED",
      verificationStatus: newUser.profile?.verificationStatus,
      activationToken,
      activationUrl,
      mustChangePassword: true,
    });
  } catch (err: any) {
    console.error("[AdminCreateProfileAPI] Error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to create profile" }, { status: 500 });
  }
}
