import { NextRequest, NextResponse } from "next/server";
import { KERALA_RELIGIONS_TAXONOMY } from "@/lib/kerala-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const religion = url.searchParams.get("religion") || url.searchParams.get("religionId") || "";

    if (!religion) {
      return NextResponse.json({ success: false, error: "MISSING_RELIGION" }, { status: 400 });
    }

    const relObj = KERALA_RELIGIONS_TAXONOMY.find(
      (r) => r.religion.toLowerCase() === religion.toLowerCase()
    );

    if (!relObj) {
      return NextResponse.json({ success: true, castes: [] });
    }

    const castes = relObj.castes.map((c) => ({
      id: c.caste,
      name: c.caste,
      displayName: c.caste,
    }));

    return NextResponse.json({ success: true, castes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
