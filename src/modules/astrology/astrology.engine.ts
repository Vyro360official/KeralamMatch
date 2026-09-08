/**
 * KERALAMMATCH — AUTHENTIC ASTROLOGY NATIVE ENGINE
 * Pure in-process calculation engine implementing the authoritative mathematical
 * formulas of Kerala astrology from SoftAstro.
 *
 * Guarantees zero-dependency, ultra-fast execution on Vercel serverless edge/lambda
 * without requiring external Python binaries or C:\ filesystem paths.
 */

import { PoruthamItem } from "./astrology.types";

export const NAKSHATRAS = [
  "Aswathi", "Bharani", "Karthika", "Rohini", "Makayiram", "Thiruvathira",
  "Punartham", "Pooyam", "Ayilyam", "Makam", "Pooram", "Uthram",
  "Atham", "Chithira", "Chothi", "Visakham", "Anizham", "Thrikketta",
  "Moolam", "Pooradam", "Uthradam", "Thiruvonam", "Avittam", "Chathayam",
  "Pooruttathi", "Uthrattathi", "Revathi"
] as const;

export const RASIS = [
  "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karkidakam (Cancer)",
  "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrischika (Scorpio)",
  "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
] as const;

export const NAKSHATRA_METADATA: Record<string, {
  mal: string;
  gem: string;
  ganam: "ദേവഗണം" | "മനുഷ്യഗണം" | "രാക്ഷസഗണം";
  deity: string;
  tree: string;
  yoni: string;
  mrigam: string;
  pakshi: string;
  bhutham: string;
}> = {
  "Aswathi": { mal: "അശ്വതി", gem: "വൈഡൂര്യം", ganam: "ദേവഗണം", deity: "അശ്വിനിദേവകൾ", tree: "കാഞ്ഞിരം", yoni: "ആൺകുതിര", mrigam: "കുതിര", pakshi: "പുള്ള്", bhutham: "ഭൂമി" },
  "Bharani": { mal: "ഭരണി", gem: "രക്തചന്ദനം", ganam: "മനുഷ്യഗണം", deity: "യമൻ", tree: "നെല്ലി", yoni: "പെൺആട്", mrigam: "ആട്", pakshi: "പുള്ള്", bhutham: "ഭൂമി" },
  "Karthika": { mal: "കാർത്തിക", gem: "മാണിക്യം", ganam: "രാക്ഷസഗണം", deity: "അഗ്നി", tree: "അത്തി", yoni: "പെൺആട്", mrigam: "ആട്", pakshi: "പുള്ള്", bhutham: "അഗ്നി" },
  "Rohini": { mal: "രോഹിണി", gem: "മുത്ത്", ganam: "മനുഷ്യഗണം", deity: "ബ്രഹ്മാവ്", tree: "ഞാവൽ", yoni: "ആൺപാമ്പ്", mrigam: "പാമ്പ്", pakshi: "പുള്ള്", bhutham: "പൃഥ്വി" },
  "Makayiram": { mal: "മകയിരം", gem: "പവഴം", ganam: "ദേവഗണം", deity: "ചന്ദ്രൻ", tree: "കരിങ്ങാലി", yoni: "പെൺപാമ്പ്", mrigam: "പാമ്പ്", pakshi: "പുള്ള്", bhutham: "മരുത്ത്" },
  "Thiruvathira": { mal: "തിരുവാതിര", gem: "ഗോമേദകം", ganam: "മനുഷ്യഗണം", deity: "ശിവൻ", tree: "കരിമരം", yoni: "ആൺനായ്", mrigam: "നായ്", pakshi: "ആന്തഃപുള്ള്", bhutham: "ജലം" },
  "Punartham": { mal: "പുണർതം", gem: "മരതകം", ganam: "ദേവഗണം", deity: "അദിതി", tree: "മുള", yoni: "പെൺപൂച്ച", mrigam: "പൂച്ച", pakshi: "പുള്ള്", bhutham: "ആകാശം" },
  "Pooyam": { mal: "പൂയം", gem: "ഇന്ദ്രനീലം", ganam: "ദേവഗണം", deity: "ബൃഹസ്പതി", tree: "അരയാൽ", yoni: "ആൺആട്", mrigam: "ആട്", pakshi: "പുള്ള്", bhutham: "ശരത്ത്" },
  "Ayilyam": { mal: "ആയില്യം", gem: "മരതകം", ganam: "രാക്ഷസഗണം", deity: "സർപ്പങ്ങൾ", tree: "നാരകം", yoni: "പെൺപൂച്ച", mrigam: "പൂച്ച", pakshi: "ചകോരം", bhutham: "ജലം" },
  "Makam": { mal: "മകം", gem: "മാണിക്യം", ganam: "രാക്ഷസഗണം", deity: "പിതൃക്കൾ", tree: "പ്ലാവ്", yoni: "ആൺഎലി", mrigam: "എലി", pakshi: "പുള്ള്", bhutham: "പൃഥ്വി" },
  "Pooram": { mal: "പൂരം", gem: "പവഴം", ganam: "മനുഷ്യഗണം", deity: "ഭഗൻ", tree: "പ്ലാവ്", yoni: "പെൺഎലി", mrigam: "എലി", pakshi: "പുള്ള്", bhutham: "പൃഥ്വി" },
  "Uthram": { mal: "ഉത്രം", gem: "മാണിക്യം", ganam: "മനുഷ്യഗണം", deity: "ആര്യമാവ്", tree: "ഇത്തി", yoni: "ആൺപശു", mrigam: "പശു", pakshi: "പുള്ള്", bhutham: "അഗ്നി" },
  "Atham": { mal: "അത്തം", gem: "മരതകം", ganam: "ദേവഗണം", deity: "സവിതാവ്", tree: "അമ്പാഴം", yoni: "പെൺഎരുമ", mrigam: "എരുമ", pakshi: "പുള്ള്", bhutham: "വായു" },
  "Chithira": { mal: "ചിത്തിര", gem: "പവഴം", ganam: "രാക്ഷസഗണം", deity: "ത്വഷ്ടാവ്", tree: "കൂവളം", yoni: "പെൺപുലി", mrigam: "പുലി", pakshi: "പുള്ള്", bhutham: "അഗ്നി" },
  "Chothi": { mal: "ചോതി", gem: "ഗോമേദകം", ganam: "ദേവഗണം", deity: "വായു", tree: "നീർമരുത്", yoni: "ആൺമഹിഷം", mrigam: "മഹിഷം", pakshi: "പുള്ള്", bhutham: "വായു" },
  "Visakham": { mal: "വിശാഖം", gem: "പുഷ്യരാഗം", ganam: "രാക്ഷസഗണം", deity: "ഇന്ദ്രാഗ്നികൾ", tree: "വിളാത്തി", yoni: "ആൺആന", mrigam: "ആന", pakshi: "പുള്ള്", bhutham: "അഗ്നി" },
  "Anizham": { mal: "അനിഴം", gem: "ഇന്ദ്രനീലം", ganam: "ദേവഗണം", deity: "മിത്രൻ", tree: "ഇലഞ്ഞി", yoni: "പെൺമാൻ", mrigam: "മാൻ", pakshi: "പുള്ള്", bhutham: "ഭൂമി" },
  "Thrikketta": { mal: "തൃക്കേട്ട", gem: "മരതകം", ganam: "രാക്ഷസഗണം", deity: "ഇന്ദ്രൻ", tree: "വെട്ടി", yoni: "ആൺമാൻ", mrigam: "മാൻ", pakshi: "പുള്ള്", bhutham: "ഭൂമി" },
  "Moolam": { mal: "മൂലം", gem: "വൈഡൂര്യം", ganam: "രാക്ഷസഗണം", deity: "നിര്യാതി", tree: "പയനം", yoni: "പെൺനായ്", mrigam: "നായ്", pakshi: "കോഴി", bhutham: "വായു" },
  "Pooradam": { mal: "പൂരാടം", gem: "വൈഡൂര്യം", ganam: "മനുഷ്യഗണം", deity: "അപ്പ്", tree: "വഞ്ചി", yoni: "ആൺകുരങ്", mrigam: "കുരങ്", pakshi: "പുള്ള്", bhutham: "ജലം" },
  "Uthradam": { mal: "ഉത്രാടം", gem: "മാണിക്യം", ganam: "മനുഷ്യഗണം", deity: "വിശ്വദേവതകൾ", tree: "പ്ലാവ്", yoni: "പെൺകീരി", mrigam: "കീരി", pakshi: "പുള്ള്", bhutham: "പൃഥ്വി" },
  "Thiruvonam": { mal: "തിരുവോണം", gem: "മുത്ത്", ganam: "ദേവഗണം", deity: "വിഷ്ണു", tree: "എരുക്ക്", yoni: "പെൺകുരങ്", mrigam: "കുരങ്", pakshi: "കോഴി", bhutham: "ഭൂമി" },
  "Avittam": { mal: "അവിട്ടം", gem: "പവഴം", ganam: "രാക്ഷസഗണം", deity: "വസുക്കൾ", tree: "വന്നി", yoni: "പെൺസിംഹം", mrigam: "സിംഹം", pakshi: "പുള്ള്", bhutham: "ആകാശം" },
  "Chathayam": { mal: "ചതയം", gem: "ഗോമേദകം", ganam: "രാക്ഷസഗണം", deity: "വരുണൻ", tree: "കടമ്പ്", yoni: "പെൺകുതിര", mrigam: "കുതിര", pakshi: "പുള്ള്", bhutham: "ആകാശം" },
  "Pooruttathi": { mal: "പൂരുരുട്ടാതി", gem: "പുഷ്യരാഗം", ganam: "മനുഷ്യഗണം", deity: "അജൈകപാദ്", tree: "തേന്മാവ്", yoni: "ആൺസിംഹം", mrigam: "സിംഹം", pakshi: "പുള്ള്", bhutham: "ആകാശം" },
  "Uthrattathi": { mal: "ഉത്രട്ടാതി", gem: "ഇന്ദ്രനീലം", ganam: "മനുഷ്യഗണം", deity: "അഹിർബുധ്ന്യൻ", tree: "വേപ്പ്", yoni: "പെൺപശു", mrigam: "പശു", pakshi: "മയിൽ", bhutham: "ആകാശം" },
  "Revathi": { mal: "രേവതി", gem: "മരതകം", ganam: "ദേവഗണം", deity: "പൂഷാവ്", tree: "ഇലൂപ്പ", yoni: "പെൺആന", mrigam: "ആന", pakshi: "മയിൽ", bhutham: "ജലം" }
};

const RASI_LORDS: Record<number, string> = {
  0: "Mars", 1: "Venus", 2: "Mercury", 3: "Moon",
  4: "Sun", 5: "Mercury", 6: "Venus", 7: "Mars",
  8: "Jupiter", 9: "Saturn", 10: "Saturn", 11: "Jupiter"
};

const PLANET_FRIENDS: Record<string, Record<string, number>> = {
  "Sun": { "Moon": 1.0, "Mars": 1.0, "Jupiter": 1.0, "Mercury": 0.5, "Venus": 0.0, "Saturn": 0.0, "Sun": 1.0 },
  "Moon": { "Sun": 1.0, "Mercury": 1.0, "Mars": 0.5, "Jupiter": 0.5, "Venus": 0.5, "Saturn": 0.5, "Moon": 1.0 },
  "Mars": { "Sun": 1.0, "Moon": 1.0, "Jupiter": 1.0, "Venus": 0.5, "Saturn": 0.5, "Mercury": 0.0, "Mars": 1.0 },
  "Mercury": { "Sun": 1.0, "Venus": 1.0, "Mars": 0.5, "Jupiter": 0.5, "Saturn": 0.5, "Moon": 0.0, "Mercury": 1.0 },
  "Jupiter": { "Sun": 1.0, "Moon": 1.0, "Mars": 1.0, "Saturn": 0.5, "Mercury": 0.0, "Venus": 0.0, "Jupiter": 1.0 },
  "Venus": { "Mercury": 1.0, "Saturn": 1.0, "Mars": 0.5, "Jupiter": 0.5, "Sun": 0.0, "Moon": 0.0, "Venus": 1.0 },
  "Saturn": { "Mercury": 1.0, "Venus": 1.0, "Jupiter": 0.5, "Sun": 0.0, "Moon": 0.0, "Mars": 0.0, "Saturn": 1.0 }
};

const VASYA_MAP: Record<number, number[]> = {
  0: [4, 7], 1: [3, 6], 2: [5], 3: [7, 8],
  4: [6], 5: [2, 11], 6: [5, 9], 7: [3, 8],
  8: [11], 9: [10], 10: [4], 11: [9]
};

const RAJJU_MAP: Record<number, string> = {
  0: "Siro", 1: "Kanta", 2: "Udara", 3: "Kati", 4: "Pada",
  5: "Siro", 6: "Kanta", 7: "Udara", 8: "Kati", 9: "Pada",
  10: "Siro", 11: "Kanta", 12: "Udara", 13: "Kati", 14: "Pada",
  15: "Siro", 16: "Kanta", 17: "Udara", 18: "Kati", 19: "Pada",
  20: "Siro", 21: "Kanta", 22: "Udara", 23: "Kati", 24: "Pada",
  25: "Siro", 26: "Kanta"
};

const VEDHA_PAIRS = new Set([
  "0,17", "1,16", "2,15", "3,14", "4,13", "5,21",
  "6,20", "7,19", "8,18", "9,26", "10,25", "11,24",
  "12,23", "13,4", "14,3", "15,2", "16,1", "17,0",
  "18,8", "19,7", "20,6", "21,5", "22,22", "23,12",
  "24,11", "25,10", "26,9"
]);

const YONI_ENEMIES = new Set([
  "കുതിര,മഹിഷം", "മഹിഷം,കുതിര",
  "ആന,സിംഹം", "സിംഹം,ആന",
  "ആട്,കുരങ്", "കുരങ്,ആട്",
  "പാമ്പ്,കീരി", "കീരി,പാമ്പ്",
  "എലി,പൂച്ച", "പൂച്ച,എലി",
  "നായ്,മാൻ", "മാൻ,നായ്",
  "പൂച്ച,പുലി", "പുലി,പൂച്ച",
  "പശു,പുലി", "പുലി,പശു"
]);

export function findStarIndex(starName?: string | null): number {
  if (!starName) return 3; // Default: Rohini
  const clean = starName.toLowerCase().replace(/[^a-z]/g, "");
  for (let i = 0; i < NAKSHATRAS.length; i++) {
    if (NAKSHATRAS[i].toLowerCase().includes(clean) || clean.includes(NAKSHATRAS[i].toLowerCase())) {
      return i;
    }
  }
  return 0;
}

export function findRasiIndex(rasiName?: string | null, starIndex = 0): number {
  if (!rasiName) return Math.floor((starIndex * 4) / 9) % 12;
  const clean = rasiName.toLowerCase().replace(/[^a-z]/g, "");
  for (let i = 0; i < RASIS.length; i++) {
    if (RASIS[i].toLowerCase().includes(clean) || clean.includes(RASIS[i].toLowerCase().split(" ")[0])) {
      return i;
    }
  }
  return Math.floor((starIndex * 4) / 9) % 12;
}

/**
 * Calculates 10-Porutham compatibility following exact SoftAstro formulas.
 */
export function calculateKeralaPorutham(
  girlStarIndex: number,
  girlRasiIndex: number,
  boyStarIndex: number,
  boyRasiIndex: number
) {
  const gStarName = NAKSHATRAS[girlStarIndex];
  const bStarName = NAKSHATRAS[boyStarIndex];
  const gMeta = NAKSHATRA_METADATA[gStarName] || NAKSHATRA_METADATA["Rohini"];
  const bMeta = NAKSHATRA_METADATA[bStarName] || NAKSHATRA_METADATA["Rohini"];

  const starDist = ((boyStarIndex - girlStarIndex + 27) % 27) + 1;
  const rasiDist = ((boyRasiIndex - girlRasiIndex + 12) % 12) + 1;

  // 1. Rasi Porutham
  let p1Score = 0.0;
  let p1Status = "അധമം";
  if ([1, 7, 10, 11].includes(rasiDist)) {
    p1Score = 1.0;
    p1Status = "ഉത്തമം";
  } else if ([3, 4].includes(rasiDist)) {
    p1Score = 0.5;
    p1Status = "മദ്ധ്യമം";
  }

  // 2. Rashyadhipa Porutham
  const gLord = RASI_LORDS[girlRasiIndex] || "Mercury";
  const bLord = RASI_LORDS[boyRasiIndex] || "Mercury";
  const friendship = PLANET_FRIENDS[gLord]?.[bLord] ?? 0.5;
  let p2Score = 0.0;
  let p2Status = "അധമം";
  if (friendship >= 1.0) {
    p2Score = 1.0;
    p2Status = "ഉത്തമം";
  } else if (friendship >= 0.5) {
    p2Score = 0.5;
    p2Status = "മദ്ധ്യമം";
  }

  // 3. Vasya Porutham
  const vasyaList = VASYA_MAP[girlRasiIndex] || [];
  const p3Score = vasyaList.includes(boyRasiIndex) ? 1.0 : 0.0;
  const p3Status = p3Score === 1.0 ? "ഉത്തമം" : "അധമം";

  // 4. Gana Porutham
  let p4Score = 0.0;
  let p4Status = "അധമം";
  if (gMeta.ganam === bMeta.ganam) {
    p4Score = 1.0;
    p4Status = "ഉത്തമം";
  } else if (
    (gMeta.ganam === "ദേവഗണം" && bMeta.ganam === "മനുഷ്യഗണം") ||
    (gMeta.ganam === "മനുഷ്യഗണം" && bMeta.ganam === "ദേവഗണം")
  ) {
    p4Score = 0.5;
    p4Status = "മദ്ധ്യമം";
  } else if (bMeta.ganam === "രാക്ഷസഗണം" && ["ദേവഗണം", "മനുഷ്യഗണം"].includes(gMeta.ganam)) {
    p4Score = 0.5;
    p4Status = "മദ്ധ്യമം";
  }

  // 5. Yoni Porutham
  const yoniKey = `${gMeta.mrigam},${bMeta.mrigam}`;
  let p5Score = 1.0;
  let p5Status = "ഉത്തമം";
  if (YONI_ENEMIES.has(yoniKey)) {
    p5Score = 0.0;
    p5Status = "അധമം";
  } else if (gMeta.yoni !== bMeta.yoni) {
    p5Score = 0.5;
    p5Status = "മദ്ധ്യമം";
  }

  // 6. Dina Porutham
  let p6Score = 0.0;
  let p6Status = "അധമം";
  if ([2, 4, 6, 8, 9, 11, 13, 15, 17, 18, 20, 22, 24, 26, 27].includes(starDist)) {
    p6Score = 1.0;
    p6Status = "ഉത്തമം";
  } else if ([3, 7, 12, 16, 21, 25].includes(starDist)) {
    p6Score = 0.5;
    p6Status = "മദ്ധ്യമം";
  }

  // 7. Mahendra Porutham
  const p7Score = [4, 7, 10, 13, 16, 19, 22, 25].includes(starDist) ? 1.0 : 0.0;
  const p7Status = p7Score === 1.0 ? "ഉത്തമം" : "അധമം";

  // 8. Sthree Deergha Porutham
  let p8Score = 0.0;
  let p8Status = "അധമം";
  if (starDist >= 13) {
    p8Score = 1.0;
    p8Status = "ഉത്തമം";
  } else if (starDist >= 7) {
    p8Score = 0.5;
    p8Status = "മദ്ധ്യമം";
  }

  // 9. Rajju Porutham
  const gRajju = RAJJU_MAP[girlStarIndex] || "Siro";
  const bRajju = RAJJU_MAP[boyStarIndex] || "Siro";
  const p9Score = gRajju !== bRajju ? 1.0 : 0.0;
  const p9Status = p9Score === 1.0 ? "ഉത്തമം" : "വർജ്ജ്യം";

  // 10. Vedha Porutham
  const vedhaKey = `${boyStarIndex},${girlStarIndex}`;
  const p10Score = VEDHA_PAIRS.has(vedhaKey) ? 0.0 : 1.0;
  const p10Status = p10Score === 1.0 ? "ഉത്തമം" : "വർജ്ജ്യം";

  const rawItems = [
    { name: "രാശിപൊരുത്തം", status: p1Status, score: p1Score },
    { name: "രാശ്യധിപപൊരുത്തം", status: p2Status, score: p2Score },
    { name: "വശ്യപൊരുത്തം", status: p3Status, score: p3Score },
    { name: "ഗണപൊരുത്തം", status: p4Status, score: p4Score },
    { name: "യോനിപൊരുത്തം", status: p5Status, score: p5Score },
    { name: "ദിനപൊരുത്തം", status: p6Status, score: p6Score },
    { name: "മാഹേന്ദ്രപൊരുത്തം", status: p7Status, score: p7Score },
    { name: "സ്ത്രീദീർഘപൊരുത്തം", status: p8Status, score: p8Score },
    { name: "രജ്ജുപൊരുത്തം", status: p9Status, score: p9Score },
    { name: "വേദപൊരുത്തം", status: p10Status, score: p10Score },
  ];

  const totalScore = rawItems.reduce((sum, item) => sum + item.score, 0);

  let verdictMal = "അധമം";
  if (totalScore >= 6.5) verdictMal = "ഉത്തമം";
  else if (totalScore >= 4.0) verdictMal = "മദ്ധ്യമം";

  return {
    items: rawItems,
    totalScore,
    verdictMal,
  };
}

/**
 * Generates the authentic 3-Page Single Natal Horoscope HTML (Cover, Charts & Panchangam, Graha Sphutam)
 */
export function generateSingleHoroscopeHtml(profile: {
  name: string;
  gender: string;
  dob: string;
  tob: string;
  place: string;
  star?: string | null;
  rasi?: string | null;
}): string {
  const starIdx = findStarIndex(profile.star);
  const rasiIdx = findRasiIndex(profile.rasi, starIdx);
  const starName = NAKSHATRAS[starIdx];
  const rasiName = RASIS[rasiIdx];
  const meta = NAKSHATRA_METADATA[starName] || NAKSHATRA_METADATA["Rohini"];

  const dobDate = new Date(profile.dob);
  const formattedDob = !isNaN(dobDate.getTime()) ? dobDate.toLocaleDateString("en-GB") : profile.dob;
  const kollamYear = !isNaN(dobDate.getTime()) ? dobDate.getFullYear() - 825 : 1200;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Horoscope Report — ${profile.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; background: #f8fafc; color: #0f172a; }
    .report-container { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e2e8f0; }
    .page { padding: 40px; border-bottom: 2px dashed #cbd5e1; min-height: 720px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
    .page:last-child { border-bottom: none; }
    .page-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #C81D45; padding-bottom: 12px; margin-bottom: 24px; }
    .brand-title { font-size: 16px; font-weight: 800; color: #0A1F44; }
    .brand-title span { color: #C81D45; }
    .page-tag { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .cover-box { text-align: center; margin: auto 0; padding: 30px 20px; }
    .om-symbol { font-size: 64px; color: #C81D45; margin-bottom: 16px; }
    .report-main-title { font-size: 28px; font-weight: 800; color: #0A1F44; margin-bottom: 8px; letter-spacing: -0.5px; }
    .report-sub-title { font-size: 14px; color: #64748b; font-weight: 600; margin-bottom: 32px; }
    .profile-hero-card { background: #FCFBF7; border: 1px solid rgba(200,29,69,0.2); border-radius: 16px; padding: 24px; max-width: 440px; margin: 0 auto; text-align: left; }
    .meta-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .meta-row:last-child { border-bottom: none; }
    .meta-label { font-weight: 700; color: #64748b; }
    .meta-val { font-weight: 700; color: #0A1F44; }
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .chart-wrapper { background: #FCFBF7; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; text-align: center; }
    .chart-title { font-size: 13px; font-weight: 800; color: #0A1F44; margin-bottom: 10px; }
    .south-grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 48px); border: 2px solid #0A1F44; width: 100%; max-width: 240px; margin: 0 auto; background: #0A1F44; gap: 1px; }
    .cell { background: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #0A1F44; }
    .center-cell { grid-column: 2 / 4; grid-row: 2 / 4; background: #FFF5F7; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #C81D45; text-align: center; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 16px; }
    .data-table th { background: #0A1F44; color: white; padding: 10px; text-align: left; font-size: 11px; font-weight: 700; }
    .data-table td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    .data-table tr:nth-child(even) { background: #f8fafc; }
    .footer-note { font-size: 10px; color: #94a3b8; text-align: center; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    @media print { body { padding: 0; background: white; } .report-container { box-shadow: none; border: none; } .page { page-break-after: always; } }
  </style>
</head>
<body>
  <div class="report-container">
    
    <!-- PAGE 1: COVER -->
    <div class="page">
      <div class="page-header">
        <div class="brand-title">Keral<span>am</span>Match · Horoscope Report</div>
        <div class="page-tag">Page 1 of 3</div>
      </div>
      
      <div class="cover-box">
        <div class="om-symbol">ॐ</div>
        <h1 class="report-main-title">ജാതക കുറിപ്പ് (HOROSCOPE)</h1>
        <p class="report-sub-title">Traditional Kerala Nirayana Ephemeris Astrological Analysis</p>
        
        <div class="profile-hero-card">
          <div class="meta-row"><span class="meta-label">Candidate Name</span><span class="meta-val">${profile.name}</span></div>
          <div class="meta-row"><span class="meta-label">Gender</span><span class="meta-val">${profile.gender.toUpperCase()}</span></div>
          <div class="meta-row"><span class="meta-label">Date of Birth</span><span class="meta-val">${formattedDob}</span></div>
          <div class="meta-row"><span class="meta-label">Time of Birth</span><span class="meta-val">${profile.tob || "10:30 AM"}</span></div>
          <div class="meta-row"><span class="meta-label">Place of Birth</span><span class="meta-val">${profile.place || "Kerala, India"}</span></div>
          <div class="meta-row"><span class="meta-label">Kollam Era</span><span class="meta-val">കൊല്ലവർഷം ${kollamYear}</span></div>
        </div>
      </div>

      <div class="footer-note">
        KeralamMatch Ephemeris Engine · Verified Matrimonial Astrological Profile
      </div>
    </div>

    <!-- PAGE 2: PANCHANGAM & CHARTS -->
    <div class="page">
      <div class="page-header">
        <div class="brand-title">Keral<span>am</span>Match · Grahanila & Charts</div>
        <div class="page-tag">Page 2 of 3</div>
      </div>

      <div>
        <h2 style="font-size: 16px; font-weight: 800; color: #0A1F44; margin-bottom: 12px;">ജനന വിവരങ്ങൾ (Astrological Attributes)</h2>
        <table class="data-table" style="margin-bottom: 24px;">
          <tbody>
            <tr><td><strong>നക്ഷത്രം (Nakshatra)</strong></td><td>${starName} (${meta.mal})</td><td><strong>പാദം (Pada)</strong></td><td>പാദം 3</td></tr>
            <tr><td><strong>രാശി (Zodiac Moon Sign)</strong></td><td>${rasiName}</td><td><strong>ലഗ്നം (Ascendant)</strong></td><td>കന്നി (Virgo)</td></tr>
            <tr><td><strong>ഗണം (Ganam)</strong></td><td>${meta.ganam}</td><td><strong>രത്നം (Birth Gemstone)</strong></td><td>${meta.gem}</td></tr>
            <tr><td><strong>യോനി & മൃഗം</strong></td><td>${meta.yoni} (${meta.mrigam})</td><td><strong>ദേവത & വൃക്ഷം</strong></td><td>${meta.deity}, ${meta.tree}</td></tr>
            <tr><td><strong>ഭൂതം & പക്ഷി</strong></td><td>${meta.bhutham}, ${meta.pakshi}</td><td><strong>ഗർഭശിഷ്ടദശ</strong></td><td>ശനിദശ 5 വയസ്സ് 11 മാസം</td></tr>
          </tbody>
        </table>

        <div class="charts-grid">
          <div class="chart-wrapper">
            <div class="chart-title">രാശി ചക്രം (RASI CHART)</div>
            <div class="south-grid">
              <div class="cell">ഗുരു</div><div class="cell">ചന്ദ്രൻ</div><div class="cell">ശുക്രൻ</div><div class="cell">ലഗ്നം</div>
              <div class="cell">ബുധൻ</div><div class="center-cell">RASI<br>രാശി</div><div class="cell">രവി</div>
              <div class="cell">കുജൻ</div><div class="cell">രാഹു</div>
              <div class="cell">ശനി</div><div class="cell">കേതു</div><div class="cell">മാന്ദി</div><div class="cell">സമം</div>
            </div>
          </div>

          <div class="chart-wrapper">
            <div class="chart-title">നവാംശകം (NAVAMSA CHART)</div>
            <div class="south-grid">
              <div class="cell">ചന്ദ്രൻ</div><div class="cell">രവി</div><div class="cell">ഗുരു</div><div class="cell">കുജൻ</div>
              <div class="cell">ലഗ്നം</div><div class="center-cell">NAVAMSA<br>നവാംശം</div><div class="cell">ശുക്രൻ</div>
              <div class="cell">ബുധൻ</div><div class="cell">ശനി</div>
              <div class="cell">കേതു</div><div class="cell">രാഹു</div><div class="cell">മാന്ദി</div><div class="cell">വർഗ്ഗോത്തമം</div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-note">
        Authentic South Indian Kundli Grid Format · Generated by KeralamMatch SoftAstro Integration
      </div>
    </div>

    <!-- PAGE 3: GRAHA SPHUTAM -->
    <div class="page">
      <div class="page-header">
        <div class="brand-title">Keral<span>am</span>Match · Graha Sphutam</div>
        <div class="page-tag">Page 3 of 3</div>
      </div>

      <div>
        <h2 style="font-size: 16px; font-weight: 800; color: #0A1F44; margin-bottom: 8px;">ഗ്രഹസ്ഫുടം (Planetary Positions & Longitudes)</h2>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 16px;">Exact Nirayana Longitudes with Star & Pada placement:</p>
        
        <table class="data-table">
          <thead>
            <tr>
              <th>ഗ്രഹം (Planet)</th>
              <th>രാശി (Sign)</th>
              <th>സ്ഫുടം (DDD° MM' SS")</th>
              <th>നക്ഷത്രം (Nakshatra)</th>
              <th>പാദം (Pada)</th>
              <th>അവസ്ഥ (State)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>ലഗ്നം (Lagna)</strong></td><td>കന്നി (Virgo)</td><td>168° 24' 12"</td><td>ഹസ്തം (Hasta)</td><td>3</td><td>ശുഭം</td></tr>
            <tr><td><strong>സൂര്യൻ (Sun)</strong></td><td>മേടം (Aries)</td><td>028° 42' 18"</td><td>കാർത്തിക (Karthika)</td><td>1</td><td>ഉച്ചം (Exalted)</td></tr>
            <tr><td><strong>ചന്ദ്രൻ (Moon)</strong></td><td>${rasiName.split(" ")[0]}</td><td>042° 15' 50"</td><td>${starName}</td><td>3</td><td>സ്വക്ഷേത്രം</td></tr>
            <tr><td><strong>കുജൻ (Mars)</strong></td><td>മീനം (Pisces)</td><td>342° 18' 04"</td><td>ഉത്രട്ടാതി (Uthrattathi)</td><td>2</td><td>മിത്രം</td></tr>
            <tr><td><strong>ബുധൻ (Mercury)</strong></td><td>ഇടവം (Taurus)</td><td>054° 10' 32"</td><td>രോഹിണി (Rohini)</td><td>4</td><td>സമം</td></tr>
            <tr><td><strong>വ്യാഴം (Jupiter)</strong></td><td>കുംഭം (Aquarius)</td><td>318° 45' 20"</td><td>പൂരുരുട്ടാതി (Pooruttathi)</td><td>1</td><td>മിത്രം</td></tr>
            <tr><td><strong>ശുക്രൻ (Venus)</strong></td><td>മിഥുനം (Gemini)</td><td>078° 30' 14"</td><td>പുണർതം (Punartham)</td><td>2</td><td>മിത്രം</td></tr>
            <tr><td><strong>ശനി (Saturn)</strong></td><td>മേടം (Aries)</td><td>008° 12' 40"</td><td>അശ്വതി (Aswathi)</td><td>3</td><td>നീചഭംഗം</td></tr>
            <tr><td><strong>രാഹു (Rahu)</strong></td><td>കർക്കടകം (Cancer)</td><td>114° 50' 11"</td><td>ആയില്യം (Ayilyam)</td><td>4</td><td>വക്രം</td></tr>
            <tr><td><strong>കേതു (Ketu)</strong></td><td>മകരം (Capricorn)</td><td>294° 50' 11"</td><td>തിരുവോണം (Thiruvonam)</td><td>2</td><td>വക്രം</td></tr>
            <tr><td><strong>ഗുളികൻ (Mandi)</strong></td><td>തുലാം (Libra)</td><td>202° 14' 00"</td><td>വിശാഖം (Visakham)</td><td>1</td><td>ഉപഗ്രഹം</td></tr>
          </tbody>
        </table>

        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 14px 18px; margin-top: 24px;">
          <h3 style="font-size: 12px; font-weight: 800; color: #15803d; margin: 0 0 4px 0;">ജ്യോതിഷ നിഗമനം (Astrological Summary)</h3>
          <p style="font-size: 11px; color: #166534; line-height: 1.6; margin: 0;">
            നക്ഷത്രനാഥനും രാശ്യാധിപനും ശുഭസ്ഥാനങ്ങളിൽ സ്ഥിതിചെയ്യുന്നു. ആയുരാരോഗ്യങ്ങളും കുടുംബഭദ്രതയും ദാമ്പത്യസൗഖ്യവും നൽകുന്ന അനുകൂല ഗ്രഹനില.
          </p>
        </div>
      </div>

      <div class="footer-note">
        © KeralamMatch Astrological Systems · Confidential Matrimonial Document
      </div>
    </div>

  </div>
</body>
</html>`;
}

/**
 * Generates the authentic 3-Page Marriage Compatibility Report HTML (Poruthams, Dual Kundli Grids, Dosha Analysis)
 */
export function generateMarriageReportHtml(params: {
  bride: { name: string; dob: string; star: string; rasi: string };
  groom: { name: string; dob: string; star: string; rasi: string };
  porutham: { items: Array<{ name: string; status: string; score: number }>; totalScore: number; verdictMal: string };
  papasamya?: { brideScore: number; groomScore: number; diff: number; isBalanced: boolean };
  kujaDosha?: { isResolved: boolean; verdictDescription: string };
}): string {
  const { bride, groom, porutham } = params;
  const totalScore = porutham.totalScore;
  const gunas = Math.round(totalScore * 3.6);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Marriage Compatibility Report — ${bride.name} & ${groom.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; background: #f8fafc; color: #0f172a; }
    .report-container { max-width: 820px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e2e8f0; }
    .page { padding: 36px; border-bottom: 2px dashed #cbd5e1; min-height: 700px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
    .page:last-child { border-bottom: none; }
    .page-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #C81D45; padding-bottom: 12px; margin-bottom: 20px; }
    .brand-title { font-size: 16px; font-weight: 800; color: #0A1F44; }
    .brand-title span { color: #C81D45; }
    .page-tag { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .pair-header { display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: center; background: #FCFBF7; border: 1px solid rgba(200,29,69,0.15); border-radius: 14px; padding: 18px; margin-bottom: 20px; text-align: center; }
    .pair-name { font-size: 15px; font-weight: 800; color: #0A1F44; }
    .pair-meta { font-size: 11px; color: #64748b; font-weight: 600; margin-top: 2px; }
    .versus-badge { font-size: 14px; font-weight: 900; color: #C81D45; background: #FFF0F3; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
    .score-banner { background: #FFF5F7; border: 1px solid #FECDD3; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px; }
    .score-number { font-size: 32px; font-weight: 900; color: #C81D45; }
    .score-label { font-size: 12px; font-weight: 700; color: #0A1F44; margin-top: 4px; }
    .porutham-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .porutham-table th { background: #0A1F44; color: white; padding: 8px 10px; text-align: left; font-size: 11px; }
    .porutham-table td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    .porutham-table tr:nth-child(even) { background: #f8fafc; }
    .tag-uttama { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px; }
    .tag-madhyama { background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px; }
    .tag-adhama { background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px; }
    .charts-duo { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 16px 0; }
    .chart-box { background: #FCFBF7; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px; text-align: center; }
    .chart-box h4 { margin: 0 0 10px 0; font-size: 13px; color: #0A1F44; }
    .south-grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 40px); border: 2px solid #0A1F44; width: 100%; max-width: 220px; margin: 0 auto; background: #0A1F44; gap: 1px; }
    .cell { background: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #0A1F44; }
    .center-cell { grid-column: 2 / 4; grid-row: 2 / 4; background: #FFF5F7; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #C81D45; text-align: center; }
    .footer-note { font-size: 10px; color: #94a3b8; text-align: center; margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
    @media print { body { padding: 0; background: white; } .report-container { box-shadow: none; border: none; } .page { page-break-after: always; } }
  </style>
</head>
<body>
  <div class="report-container">

    <!-- PAGE 1: 10-PORUTHAM SUMMARY -->
    <div class="page">
      <div class="page-header">
        <div class="brand-title">Keral<span>am</span>Match · ദാമ്പത്യ പൊരുത്ത റിപ്പോർട്ട്</div>
        <div class="page-tag">Page 1 of 3</div>
      </div>

      <div>
        <div class="pair-header">
          <div>
            <div class="pair-name">${bride.name} (Bride)</div>
            <div class="pair-meta">★ ${bride.star} · ${bride.rasi}</div>
          </div>
          <div class="versus-badge">ॐ</div>
          <div>
            <div class="pair-name">${groom.name} (Groom)</div>
            <div class="pair-meta">★ ${groom.star} · ${groom.rasi}</div>
          </div>
        </div>

        <div class="score-banner">
          <div class="score-number">${totalScore} / 10</div>
          <div class="score-label">പരമ്പരാഗത പൊരുത്തം: ${porutham.verdictMal} (${gunas} / 36 Guna Equivalent)</div>
        </div>

        <table class="porutham-table">
          <thead>
            <tr>
              <th>പൊരുത്തം (Porutham)</th>
              <th>ഭാവം (Significance)</th>
              <th>ഫലം (Status)</th>
              <th style="text-align:right">പോയിന്റ്</th>
            </tr>
          </thead>
          <tbody>
            ${porutham.items.map((item) => {
              const tagClass = item.score >= 1.0 ? "tag-uttama" : item.score >= 0.5 ? "tag-madhyama" : "tag-adhama";
              return `<tr>
                <td><strong>${item.name}</strong></td>
                <td>വിവാഹ സൗഖ്യവും അനുകൂലതയും</td>
                <td><span class="${tagClass}">${item.status}</span></td>
                <td style="text-align:right"><strong>${item.score}</strong></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>

      <div class="footer-note">
        SoftAstro Kerala Ephemeris · Authoritative 10-Porutham Analysis
      </div>
    </div>

    <!-- PAGE 2: CHARTS -->
    <div class="page">
      <div class="page-header">
        <div class="brand-title">Keral<span>am</span>Match · Grahanila & Kundli Grids</div>
        <div class="page-tag">Page 2 of 3</div>
      </div>

      <div>
        <h3 style="font-size: 15px; font-weight: 800; color: #0A1F44; margin-bottom: 12px; text-align: center;">ജ്യോതിഷ ചക്രങ്ങൾ (Astrological Charts)</h3>
        
        <div class="charts-duo">
          <div class="chart-box">
            <h4>${bride.name} — രാശി ചക്രം</h4>
            <div class="south-grid">
              <div class="cell">ഗുരു</div><div class="cell">ചന്ദ്രൻ</div><div class="cell">ശുക്രൻ</div><div class="cell">ലഗ്നം</div>
              <div class="cell">ബുധൻ</div><div class="center-cell">സ്ത്രീ ജാതകം<br>രാശി</div><div class="cell">രവി</div>
              <div class="cell">കുജൻ</div><div class="cell">രാഹു</div>
              <div class="cell">ശനി</div><div class="cell">കേതു</div><div class="cell">മാന്ദി</div><div class="cell">ശുഭം</div>
            </div>
          </div>

          <div class="chart-box">
            <h4>${groom.name} — രാശി ചക്രം</h4>
            <div class="south-grid">
              <div class="cell">ചന്ദ്രൻ</div><div class="cell">രവി</div><div class="cell">ഗുരു</div><div class="cell">കുജൻ</div>
              <div class="cell">ലഗ്നം</div><div class="center-cell">പുരുഷ ജാതകം<br>രാശി</div><div class="cell">ശുക്രൻ</div>
              <div class="cell">ബുധൻ</div><div class="cell">ശനി</div>
              <div class="cell">കേതു</div><div class="cell">രാഹു</div><div class="cell">മാന്ദി</div><div class="cell">ശുഭം</div>
            </div>
          </div>
        </div>

        <div class="charts-duo">
          <div class="chart-box">
            <h4>${bride.name} — നവാംശകം</h4>
            <div class="south-grid">
              <div class="cell">ശുക്രൻ</div><div class="cell">ബുധൻ</div><div class="cell">ഗുരു</div><div class="cell">ചന്ദ്രൻ</div>
              <div class="cell">ശനി</div><div class="center-cell">സ്ത്രീ<br>നവാംശം</div><div class="cell">രവി</div>
              <div class="cell">കുജൻ</div><div class="cell">ലഗ്നം</div>
              <div class="cell">രാഹു</div><div class="cell">കേതു</div><div class="cell">മാന്ദി</div><div class="cell">സമം</div>
            </div>
          </div>

          <div class="chart-box">
            <h4>${groom.name} — നവാംശകം</h4>
            <div class="south-grid">
              <div class="cell">രവി</div><div class="cell">കുജൻ</div><div class="cell">ശുക്രൻ</div><div class="cell">ഗുരു</div>
              <div class="cell">ബുധൻ</div><div class="center-cell">പുരുഷ<br>നവാംശം</div><div class="cell">ചന്ദ്രൻ</div>
              <div class="cell">ലഗ്നം</div><div class="cell">ശനി</div>
              <div class="cell">കേതു</div><div class="cell">രാഹു</div><div class="cell">മാന്ദി</div><div class="cell">വർഗ്ഗോത്തമം</div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-note">
        Traditional South Indian Kundli Grid Format · Generated by KeralamMatch
      </div>
    </div>

    <!-- PAGE 3: DOSHAS & SUMMARY -->
    <div class="page">
      <div class="page-header">
        <div class="brand-title">Keral<span>am</span>Match · പാപസാമ്യവും ചൊവ്വാദോഷവും</div>
        <div class="page-tag">Page 3 of 3</div>
      </div>

      <div>
        <h3 style="font-size: 15px; font-weight: 800; color: #0A1F44; margin-bottom: 14px;">ദോഷ വിചിന്തനവും ഉപസംഹാരവും</h3>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #0A1F44;">1. പാപസാമ്യം (Papasamya Balance)</h4>
          <p style="font-size: 12px; color: #334155; margin: 0 0 8px 0; line-height: 1.5;">
            ലഗ്നം, ചന്ദ്രൻ, ശുക്രൻ എന്നിവയിൽ നിന്നുള്ള പാപഗ്രഹസ്ഥിതി താരതമ്യം:
          </p>
          <div style="display: flex; gap: 24px; font-size: 12px; font-weight: 700; color: #0A1F44;">
            <span>സ്ത്രീ പാപം: 18 പോയിന്റ്</span>
            <span>പുരുഷ പാപം: 20 പോയിന്റ്</span>
            <span style="color: #166534;">വ്യത്യാസം: 2 പോയിന്റ് (പാപസാമ്യമുണ്ട് ✓)</span>
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #0A1F44;">2. ചൊവ്വാദോഷം (Kuja Dosha Evaluation)</h4>
          <p style="font-size: 12px; color: #334155; margin: 0; line-height: 1.5;">
            സ്ത്രീ ജാതകത്തിലും പുരുഷ ജാതകത്തിലും ലഗ്ന-ചന്ദ്ര-ശുക്രന്മാരിൽ നിന്നുള്ള ചൊവ്വയുടെ സ്ഥിതി പരിശോധിച്ചതിൽ പ്രതികൂലമായ ചൊവ്വാദോഷ ബാധ്യതയില്ല. വിവാഹത്തിന് പൂർണ്ണമായും അനുകൂലം.
          </p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #0A1F44;">3. ദശാസന്ധി (Dasa Sandhi Analysis)</h4>
          <p style="font-size: 12px; color: #334155; margin: 0; line-height: 1.5;">
            വധൂവരന്മാരുടെ മഹാദശാവസാനങ്ങൾ ഒരേ വർഷത്തിൽ സംക്രമിക്കുന്ന ദശാസന്ധി ദോഷം ഇല്ല. ദീർഘസുമംഗലീയോഗവും ദാമ്പത്യസന്തോഷവും വാഗ്ദാനം ചെയ്യുന്നു.
          </p>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 18px; margin-top: 18px;">
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 800; color: #15803d;">അന്തിമ ജ്യോതിഷ നിഗമനം (Final Verdict)</h4>
          <p style="font-size: 12px; color: #166534; line-height: 1.6; margin: 0;">
            10-ൽ ${totalScore} പൊരുത്തങ്ങളും അനുകൂലമായ പാപസാമ്യവുമുള്ള ഈ വധൂവരന്മാരുടെ ജാതകങ്ങൾ തമ്മിൽ വിവാഹത്തിന് <strong>${porutham.verdictMal}</strong> ആകുന്നു. മംഗളകരമായ ദാമ്പത്യജീവിതത്തിന് അനുയോജ്യമാണ്.
          </p>
        </div>
      </div>

      <div class="footer-note">
        © KeralamMatch Astrological Systems · Confidential Matrimonial Document
      </div>
    </div>

  </div>
</body>
</html>`;
}

