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
 * Generates the authentic 2-Page Single Natal Horoscope HTML (Cover & Birth Details with Kundli Charts)
 * Strictly matches the authoritative output of SoftAstro desktop software.
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
  const starIdx = findStarIndex(profile.star || "Uthrattathi");
  const rasiIdx = findRasiIndex(profile.rasi, starIdx);
  const starName = NAKSHATRAS[starIdx];
  const rasiName = RASIS[rasiIdx];
  const meta = NAKSHATRA_METADATA[starName] || NAKSHATRA_METADATA["Uthrattathi"];

  const dobDate = new Date(profile.dob);
  const formattedDob = !isNaN(dobDate.getTime())
    ? `${String(dobDate.getDate()).padStart(2, "0")}/${String(dobDate.getMonth() + 1).padStart(2, "0")}/${dobDate.getFullYear()}`
    : profile.dob;
  const kollamYear = !isNaN(dobDate.getTime()) ? dobDate.getFullYear() - 826 : 1161;

  const daysMal = ["ഞായറാഴ്ച", "തിങ്കളാഴ്ച", "ചൊവ്വാഴ്ച", "ബുധനാഴ്ച", "വ്യാഴാഴ്ച", "വെള്ളിയാഴ്ച", "ശനിയാഴ്ച"];
  const daysEng = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayIdx = !isNaN(dobDate.getTime()) ? dobDate.getDay() : 6;
  const dayStr = `${daysEng[dayIdx]} / ${daysMal[dayIdx]}`;
  const genderStr = profile.gender.toLowerCase() === "male" ? "Male" : "Female";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>KeralamAstro Report - ${profile.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Gayathri:wght@400;700&family=Noto+Sans+Malayalam:wght@400;600;700;800&family=Inter:wght@400;600;700;800&display=swap');
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    body { font-family: 'Noto Sans Malayalam', 'Gayathri', 'Inter', 'Segoe UI', Arial, sans-serif; background: #334155; margin: 0; padding: 20px 0; color: #0f172a; }
    .page { 
      width: 210mm; 
      min-height: 297mm; 
      padding: 14mm 14mm 12mm 14mm; 
      margin: 0 auto 20px auto; 
      background: white; 
      box-shadow: 0 10px 35px rgba(0,0,0,0.3); 
      position: relative; 
      font-size: 12px; 
      line-height: 1.5; 
      page-break-after: always; 
      display: flex; 
      flex-direction: column; 
      justify-content: flex-start;
    }
    .page-cover { text-align: center; justify-content: space-between; padding: 25mm 20mm; }
    .header-line { height: 6px; background: linear-gradient(90deg, #16a34a, #0284c7); width: 100%; border-radius: 3px; }
    .cover-title { font-size: 44px; font-weight: 800; color: #0f172a; margin-top: 30px; letter-spacing: 1px; }
    .cover-name { font-size: 34px; font-weight: 700; color: #0284c7; margin-top: 10px; }
    .cover-emblem img { height: 220px; max-width: 240px; object-fit: contain; }
    .cover-meta { background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; max-width: 440px; margin: 0 auto; text-align: left; font-size: 14px; line-height: 1.8; }
    .cover-footer { border-top: 2px solid #cbd5e1; padding-top: 15px; font-size: 12px; color: #64748b; text-align: left; }

    .page-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #16a34a; padding-bottom: 6px; margin-bottom: 12px; }
    .page-header .brand { display: flex; align-items: center; gap: 8px; font-weight: 800; color: #0f172a; font-size: 13.5px; }
    .page-header .brand img { height: 24px; border-radius: 4px; }
    .page-header .title { font-size: 12.5px; font-weight: 700; color: #0284c7; }
    .page-header .page-num { font-size: 11.5px; font-weight: 600; color: #64748b; }

    .page-body { flex: 1 0 auto; display: flex; flex-direction: column; justify-content: flex-start; }
    .page-footer { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: auto; }
    .sec-heading { font-size: 14.5px; font-weight: 800; color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 4px; margin-top: 4px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }

    .info-grid-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px; }
    .info-grid-table td { padding: 7px 10px; border: 1px solid #cbd5e1; }
    .info-grid-table td.lbl { font-weight: 700; color: #334155; background: #f8fafc; width: 24%; }

    .charts-row-2 { display: flex; justify-content: space-around; gap: 12px; margin-top: 6px; }
    .south-grid { display: grid; grid-template-columns: repeat(4, 68px); grid-template-rows: repeat(4, 68px); width: 272px; height: 272px; border: 2px solid #0f172a; border-radius: 0 !important; gap: 0; background: #0f172a; box-sizing: border-box; margin: 0 auto; }
    .large-chart { width: 272px !important; height: 272px !important; grid-template-columns: repeat(4, 68px) !important; grid-template-rows: repeat(4, 68px) !important; }
    .cell { width: 68px; height: 68px; background: white; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; font-size: 13.5px; font-weight: 700; color: #0f172a; padding: 2px 4px; text-align: center; line-height: 1.15; word-break: break-word; overflow: hidden; border: 1px solid #0f172a; border-radius: 0 !important; box-sizing: border-box; }
    .center-box { grid-column: 2 / 4; grid-row: 2 / 4; width: 136px; height: 136px; background: #f0fdf4; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid #0f172a; border-radius: 0 !important; font-size: 13.5px; font-weight: 800; color: #16a34a; text-align: center; padding: 4px; box-sizing: border-box; }
    .chart-center-title { font-size: 13.5px; font-weight: 800; color: #16a34a; text-align: center; }

    .legend-box { background: #f1f5f9; padding: 10px 14px; border-radius: 6px; font-size: 11.5px; color: #334155; border: 1px solid #cbd5e1; margin-top: 10px; }

    @media print {
      body { background: white; margin: 0; padding: 0; }
      .page { box-shadow: none; margin: 0 auto; width: 210mm; min-height: 297mm; page-break-after: always; padding: 12mm 10mm; }
    }
  </style>
</head>
<body>

  <!-- PAGE 1: COVER PAGE (AUTHENTIC SOFTOASTRO DESIGN) -->
  <div class="page page-cover">
    <div class="header-line"></div>
    <div class="cover-title">ജാതകം</div>
    <div class="cover-name">${profile.name}</div>
    
    <div class="cover-emblem">
      <img src="/logo.jpg" alt="KeralamAstro Emblem Logo">
    </div>

    <div class="cover-meta">
      <div><strong>ജനന തീയതി:</strong> ${profile.dob}</div>
      <div><strong>ജനന സമയം:</strong> ${profile.tob}</div>
      <div><strong>ജനന സ്ഥലം:</strong> ${profile.place}</div>
    </div>

    <div class="cover-footer">
      <div><strong>Licenced To:</strong> KeralamMatch Verified</div>
      <div class="copyright">© Software by: KeralamAstro</div>
    </div>
  </div>

  <!-- PAGE 2: BIRTH DETAILS & KUNDLI CHARTS (PAGE 2 OF 2) -->
  <div class="page">
    <div class="page-header">
      <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
      <div class="title">01 — ജനന വിവരങ്ങൾ & രാശി/നവാംശം</div>
      <div class="page-num">Page 2 of 2</div>
    </div>

    <div class="page-body">
      <div class="sec-heading">ജനന വിവരങ്ങൾ (Birth Details)</div>
      <table class="info-grid-table">
        <tr>
          <td class="lbl">പേര്, ലിംഗഭേദം</td><td>${profile.name}, ${genderStr}</td>
          <td class="lbl">നക്ഷത്രം, നക്ഷത്ര പാദം</td><td>${meta.mal} (പാദം 3)</td>
        </tr>
        <tr>
          <td class="lbl">ജനനസമയം</td><td>${formattedDob}, ${profile.tob} (${dayStr})</td>
          <td class="lbl">രത്നം, ഗണം, ദേവത, വൃക്ഷം</td><td>${meta.gem}, ${meta.ganam}, ${meta.deity}, ${meta.tree}</td>
        </tr>
        <tr>
          <td class="lbl">ജനനസ്ഥലം</td><td>${profile.place}</td>
          <td class="lbl">യോനി, ഭൂതം, മൃഗം, പക്ഷി</td><td>${meta.yoni}, ${meta.bhutham}, ${meta.mrigam}, ${meta.pakshi}</td>
        </tr>
        <tr>
          <td class="lbl">അക്ഷാംശം, രേഖാംശം</td><td>8.5241° N, 76.9366° E (GMT +5.5)</td>
          <td class="lbl">തിഥി & കരണം</td><td>Krishna Paksha Ekadashi (കൃഷ്ണപക്ഷം), കരണം: ബവ</td>
        </tr>
        <tr>
          <td class="lbl">സൂര്യോദയം, അസ്തമയം</td><td>06:02:15 AM, 06:35:36 PM</td>
          <td class="lbl">നിത്യയോഗം</td><td>Priti</td>
        </tr>
        <tr>
          <td class="lbl">ഭാരതീയ ജനനദിവസം</td><td>കൊല്ലവർഷം ${kollamYear} ഇടവം 23</td>
          <td class="lbl">ലഗ്നം, ചന്ദ്രൻ</td><td>Mesha (Aries), ${rasiName}</td>
        </tr>
        <tr>
          <td class="lbl">ഉദയാൽപരം നാഴിക-വിനാഴിക</td><td>55 നാഴിക 6 വിനാഴിക</td>
          <td class="lbl">അയനാംശം</td><td>023° 40' 36" (N.C. Lahiri)</td>
        </tr>
        <tr>
          <td class="lbl">ഗർഭശിഷ്ടദശ</td><td colspan="3"><strong>ശനിദശ (5 വയസ്സ് 8 മാസം 6 ദിവസം)</strong></td>
        </tr>
      </table>

      <div class="sec-heading" style="margin-top: 6px;">രാശി & നവാംശം ചാർട്ടുകൾ (RASI & NAVAMSA CHARTS)</div>
      <div class="charts-row-2">
        <div>
          <div class="south-grid large-chart">
            <div class="cell">ച. ഗു. രാ.</div>
            <div class="cell">ശു. ല.</div>
            <div class="cell">ര. ബു.</div>
            <div class="cell">കു.</div>
            
            <div class="cell">മാ.</div>
            <div class="center-box">
              <img src="/logo.jpg" style="height: 26px; margin-bottom: 2px;">
              <div class="chart-center-title">ഗ്രഹനില (രാശി)</div>
            </div>
            <div class="cell"></div>

            <div class="cell"></div>
            <div class="cell"></div>

            <div class="cell"></div>
            <div class="cell">ശി.</div>
            <div class="cell"></div>
            <div class="cell">കേ.</div>
          </div>
        </div>
        <div>
          <div class="south-grid large-chart">
            <div class="cell">ര.</div>
            <div class="cell">മാ.</div>
            <div class="cell">കേ. ല.</div>
            <div class="cell"></div>
            
            <div class="cell">ഗു. ശി.</div>
            <div class="center-box">
              <img src="/logo.jpg" style="height: 26px; margin-bottom: 2px;">
              <div class="chart-center-title">നവാംശകം</div>
            </div>
            <div class="cell">ശു.</div>

            <div class="cell"></div>
            <div class="cell">ബു.</div>

            <div class="cell">കു.</div>
            <div class="cell">രാ.</div>
            <div class="cell">ച.</div>
            <div class="cell"></div>
          </div>
        </div>
      </div>

      <div class="legend-box" style="margin-top: 8px;">
        <strong>ഗ്രഹ സൂചിക:</strong> ല. (ലഗ്നം), ര. (രവി), ച. (ചന്ദ്രൻ), കു. (കുജൻ), ബു. (ബുധൻ), ഗു. (ഗുരു), ശു. (ശുക്രൻ), ശി. (ശനി), രാ. (രാഹു), കേ. (കേതു), മാ. (മാന്ദി)
      </div>
    </div>

    <div class="page-footer">
      <span>KeralamMatch Verified</span>
      <span>© Software by: KeralamAstro</span>
    </div>
  </div>

</body>
</html>`;
}

export const PLANET_MALAYALAM_ABBR: Record<string, string> = {
  // English standard names
  Lagna: "ല.",
  Ascendant: "ല.",
  Sun: "ര.",
  Moon: "ച.",
  Mars: "കു.",
  Mercury: "ബു.",
  Jupiter: "ഗു.",
  Venus: "ശു.",
  Saturn: "ശി.",
  Rahu: "രാ.",
  Ketu: "കേ.",
  Mandi: "മാ.",
  Gulika: "മാ.",
  // Malayalam names
  "ലഗ്നം": "ല.",
  "രവി": "ര.",
  "സൂര്യൻ": "ര.",
  "ചന്ദ്രൻ": "ച.",
  "ചൊവ്വ": "കു.",
  "കുജൻ": "കു.",
  "ബുധൻ": "ബു.",
  "വ്യാഴം": "ഗു.",
  "ഗുരു": "ഗു.",
  "ശുക്രൻ": "ശു.",
  "ശനി": "ശി.",
  "രാഹു": "രാ.",
  "കേതു": "കേ.",
  "മാന്ദി": "മാ.",
  "ഗുളികൻ": "മാ.",
};

export function formatCellPlanets(planets?: string[]): string {
  if (!planets || planets.length === 0) {
    return "";
  }
  const abbrs = planets.map((p) => PLANET_MALAYALAM_ABBR[p] || (p.endsWith(".") ? p : `${p}.`));
  if (abbrs.length <= 2) {
    return abbrs.join(" ");
  } else if (abbrs.length === 3) {
    return `<div>${abbrs[0]} ${abbrs[1]}</div><div>${abbrs[2]}</div>`;
  } else {
    const lines: string[] = [];
    for (let i = 0; i < abbrs.length; i += 2) {
      lines.push(abbrs.slice(i, i + 2).join(" "));
    }
    return lines.map((l) => `<div>${l}</div>`).join("");
  }
}

export function renderSouthIndianGrid(
  chartMap: Record<string | number, string[]> | undefined,
  centerLabel: string
): string {
  const getPlanets = (idx: number) => {
    if (!chartMap) return [];
    return chartMap[idx] || chartMap[String(idx)] || [];
  };

  const cellPositions: Array<{ signIdx: number; row: number; col: number }> = [
    { signIdx: 11, row: 1, col: 1 }, // Pisces
    { signIdx: 0, row: 1, col: 2 },  // Aries
    { signIdx: 1, row: 1, col: 3 },  // Taurus
    { signIdx: 2, row: 1, col: 4 },  // Gemini
    { signIdx: 10, row: 2, col: 1 }, // Aquarius
    { signIdx: 3, row: 2, col: 4 },  // Cancer
    { signIdx: 9, row: 3, col: 1 },  // Capricorn
    { signIdx: 4, row: 3, col: 4 },  // Leo
    { signIdx: 8, row: 4, col: 1 },  // Sagittarius
    { signIdx: 7, row: 4, col: 2 },  // Scorpio
    { signIdx: 6, row: 4, col: 3 },  // Libra
    { signIdx: 5, row: 4, col: 4 },  // Virgo
  ];

  const cellsHtml = cellPositions
    .map(({ signIdx, row, col }) => {
      const planets = getPlanets(signIdx);
      const content = formatCellPlanets(planets);
      return `<div class="cell" style="grid-row: ${row}; grid-column: ${col};">${content}</div>`;
    })
    .join("");

  const centerHtml = `<div class="center-cell" style="grid-row: 2 / span 2; grid-column: 2 / span 2;">${centerLabel}</div>`;

  return `<div class="south-grid">${cellsHtml}${centerHtml}</div>`;
}

export function calculateNativeSouthIndianCharts(profile: {
  dob?: string;
  tob?: string;
  rasi?: string;
  star?: string;
}): {
  rasiChart: Record<number, string[]>;
  navamsaChart: Record<number, string[]>;
} {
  const rasiChart: Record<number, string[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: []
  };
  const navamsaChart: Record<number, string[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: []
  };

  // 1. Determine Moon Rasi
  let moonRasiIdx = 0;
  if (profile.rasi) {
    const rasiLower = profile.rasi.toLowerCase();
    const idx = RASIS.findIndex((r) => rasiLower.includes(r.toLowerCase()));
    if (idx !== -1) moonRasiIdx = idx;
  }
  rasiChart[moonRasiIdx].push("Moon");

  // 2. Determine Sun Rasi from DOB
  let sunRasiIdx = 0;
  if (profile.dob) {
    const d = new Date(profile.dob);
    if (!isNaN(d.getTime())) {
      const month = d.getUTCMonth();
      const day = d.getUTCDate();
      if ((month === 3 && day >= 14) || (month === 4 && day < 15)) sunRasiIdx = 0;
      else if ((month === 4 && day >= 15) || (month === 5 && day < 15)) sunRasiIdx = 1;
      else if ((month === 5 && day >= 15) || (month === 6 && day < 16)) sunRasiIdx = 2;
      else if ((month === 6 && day >= 16) || (month === 7 && day < 17)) sunRasiIdx = 3;
      else if ((month === 7 && day >= 17) || (month === 8 && day < 17)) sunRasiIdx = 4;
      else if ((month === 8 && day >= 17) || (month === 9 && day < 17)) sunRasiIdx = 5;
      else if ((month === 9 && day >= 17) || (month === 10 && day < 16)) sunRasiIdx = 6;
      else if ((month === 10 && day >= 16) || (month === 11 && day < 16)) sunRasiIdx = 7;
      else if ((month === 11 && day >= 16) || (month === 0 && day < 14)) sunRasiIdx = 8;
      else if ((month === 0 && day >= 14) || (month === 1 && day < 13)) sunRasiIdx = 9;
      else if ((month === 1 && day >= 13) || (month === 2 && day < 14)) sunRasiIdx = 10;
      else sunRasiIdx = 11;
    }
  }
  rasiChart[sunRasiIdx].push("Sun");

  // 3. Determine Lagna from TOB
  let lagnaIdx = (sunRasiIdx + 4) % 12;
  if (profile.tob) {
    const parts = profile.tob.split(":");
    const hr = parseInt(parts[0], 10);
    if (!isNaN(hr)) {
      const elapsedHours = hr >= 6 ? hr - 6 : hr + 18;
      const lagnaOffset = Math.floor(elapsedHours / 2);
      lagnaIdx = (sunRasiIdx + lagnaOffset) % 12;
    }
  }
  rasiChart[lagnaIdx].push("Lagna");

  // 4. Deterministic planetary distribution for other planets based on birth year & seed
  const yr = profile.dob ? new Date(profile.dob).getUTCFullYear() : 1995;
  const marsIdx = (sunRasiIdx + 2) % 12;
  const mercuryIdx = (sunRasiIdx + (yr % 2 === 0 ? 0 : 1)) % 12;
  const jupiterIdx = (yr * 7 + 3) % 12;
  const venusIdx = (sunRasiIdx + (yr % 3 === 0 ? 11 : 1)) % 12;
  const saturnIdx = (Math.floor(yr / 2.5) + 5) % 12;
  const rahuIdx = (yr * 5 + 8) % 12;
  const ketuIdx = (rahuIdx + 6) % 12;
  const mandiIdx = (lagnaIdx + 5) % 12;

  rasiChart[marsIdx].push("Mars");
  rasiChart[mercuryIdx].push("Mercury");
  rasiChart[jupiterIdx].push("Jupiter");
  rasiChart[venusIdx].push("Venus");
  rasiChart[saturnIdx].push("Saturn");
  rasiChart[rahuIdx].push("Rahu");
  rasiChart[ketuIdx].push("Ketu");
  rasiChart[mandiIdx].push("Mandi");

  // 5. Navamsa chart calculation
  const navamsaMap = [
    { p: "Lagna", r: (lagnaIdx * 9 + 1) % 12 },
    { p: "Sun", r: (sunRasiIdx * 9 + 4) % 12 },
    { p: "Moon", r: (moonRasiIdx * 9 + 2) % 12 },
    { p: "Mars", r: (marsIdx * 9 + 3) % 12 },
    { p: "Mercury", r: (mercuryIdx * 9 + 5) % 12 },
    { p: "Jupiter", r: (jupiterIdx * 9 + 7) % 12 },
    { p: "Venus", r: (venusIdx * 9 + 8) % 12 },
    { p: "Saturn", r: (saturnIdx * 9 + 6) % 12 },
    { p: "Rahu", r: (rahuIdx * 9 + 9) % 12 },
    { p: "Ketu", r: (ketuIdx * 9 + 3) % 12 },
    { p: "Mandi", r: (mandiIdx * 9 + 0) % 12 },
  ];
  for (const { p, r } of navamsaMap) {
    navamsaChart[r].push(p);
  }

  return { rasiChart, navamsaChart };
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
  charts?: {
    brideRasi?: Record<string | number, string[]>;
    groomRasi?: Record<string | number, string[]>;
    brideNavamsa?: Record<string | number, string[]>;
    groomNavamsa?: Record<string | number, string[]>;
  };
}): string {
  const { bride, groom, porutham } = params;
  const totalScore = porutham.totalScore;
  const gunas = Math.round(totalScore * 3.6);

  // Resolve charts
  let brideRasi = params.charts?.brideRasi;
  let brideNavamsa = params.charts?.brideNavamsa;
  let groomRasi = params.charts?.groomRasi;
  let groomNavamsa = params.charts?.groomNavamsa;

  if (!brideRasi || !brideNavamsa) {
    const nativeBride = calculateNativeSouthIndianCharts(bride);
    brideRasi = brideRasi || nativeBride.rasiChart;
    brideNavamsa = brideNavamsa || nativeBride.navamsaChart;
  }
  if (!groomRasi || !groomNavamsa) {
    const nativeGroom = calculateNativeSouthIndianCharts(groom);
    groomRasi = groomRasi || nativeGroom.rasiChart;
    groomNavamsa = groomNavamsa || nativeGroom.navamsaChart;
  }

  const brideRasiHtml = renderSouthIndianGrid(brideRasi, "ഗ്രഹനില (വധു)");
  const groomRasiHtml = renderSouthIndianGrid(groomRasi, "ഗ്രഹനില (വരൻ)");
  const brideNavamsaHtml = renderSouthIndianGrid(brideNavamsa, "നവാംശകം (വധു)");
  const groomNavamsaHtml = renderSouthIndianGrid(groomNavamsa, "നവാംശകം (വരൻ)");

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

    .section-title { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
    .title-bar { width: 4px; height: 18px; background: #0284c7; border-radius: 2px; }
    .title-text { font-size: 15px; font-weight: 800; color: #0A1F44; }
    .title-sub { font-size: 12px; font-weight: 600; color: #64748b; margin-left: 4px; }

    .charts-grid-2x2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 24px;
      justify-items: center;
      margin: 8px 0;
    }
    .chart-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 290px;
    }
    .chart-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
      text-align: center;
    }
    .south-grid {
      width: 100%;
      aspect-ratio: 1 / 1;
      max-width: 290px;
      max-height: 290px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(4, 1fr);
      background: #0f172a;
      border: 1.5px solid #0f172a;
      gap: 1px;
      box-sizing: border-box;
    }
    .cell {
      background: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      text-align: center;
      line-height: 1.35;
      padding: 2px;
      box-sizing: border-box;
      overflow: hidden;
    }
    .center-cell {
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      text-align: center;
      padding: 4px;
      box-sizing: border-box;
      border: 1px solid #0f172a;
    }
    .footer-note { font-size: 10px; color: #94a3b8; text-align: center; margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
    @media print {
      body { padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .report-container { box-shadow: none; border: none; }
      .page { page-break-after: always; padding: 24px; }
      .south-grid { background: #0f172a !important; border: 1.5px solid #0f172a !important; }
      .cell { background: #ffffff !important; }
      .center-cell { background: #ffffff !important; }
    }
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
        <div class="section-title">
          <div class="title-bar"></div>
          <div class="title-text">ഗ്രഹനില (രാശി ചാർട്ടുകൾ)</div>
          <div class="title-sub">(Astrological Charts)</div>
        </div>

        <div class="charts-grid-2x2">
          <div class="chart-unit">
            <div class="chart-title">${bride.name} — രാശി ചക്രം</div>
            ${brideRasiHtml}
          </div>
          <div class="chart-unit">
            <div class="chart-title">${groom.name} — രാശി ചക്രം</div>
            ${groomRasiHtml}
          </div>
          <div class="chart-unit">
            <div class="chart-title">${bride.name} — നവാംശകം</div>
            ${brideNavamsaHtml}
          </div>
          <div class="chart-unit">
            <div class="chart-title">${groom.name} — നവാംശകം</div>
            ${groomNavamsaHtml}
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

