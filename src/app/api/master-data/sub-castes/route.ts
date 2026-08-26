import { NextRequest, NextResponse } from "next/server";
import { KERALA_RELIGIONS_TAXONOMY } from "@/lib/kerala-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const caste = url.searchParams.get("caste") || url.searchParams.get("casteId") || "";
    const search = url.searchParams.get("search") || "";

    if (!caste) {
      return NextResponse.json({ success: false, error: "MISSING_CASTE" }, { status: 400 });
    }

    // Find the caste in any religion
    let foundCasteObj: any = null;
    for (const rel of KERALA_RELIGIONS_TAXONOMY) {
      const match = rel.castes.find((c) => c.caste.toLowerCase() === caste.toLowerCase());
      if (match) {
        foundCasteObj = match;
        break;
      }
    }

    if (!foundCasteObj) {
      return NextResponse.json({ success: true, subCastes: [] });
    }

    let subcastes = foundCasteObj.subcastes.map((s: string) => ({
      id: s,
      name: s,
      displayName: s,
    }));

    if (search) {
      const q = search.toLowerCase();
      subcastes = subcastes.filter((s: any) => s.name.toLowerCase().includes(q));
    }

    return NextResponse.json({ success: true, subCastes: subcastes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
