export interface NakshatramItem {
  id: string;
  nameMalayalam: string;
  nameEnglish: string;
  raasi: string;
}

export const KERALA_NAKSHATRAMS: NakshatramItem[] = [
  { id: "ashwati", nameMalayalam: "അശ്വതി", nameEnglish: "Ashwathi / Aswini", raasi: "Medam (Aries)" },
  { id: "bharani", nameMalayalam: "ഭരണി", nameEnglish: "Bharani", raasi: "Medam (Aries)" },
  { id: "karthika", nameMalayalam: "കാർത്തിക", nameEnglish: "Karthika / Krithika", raasi: "Medam / Edavam" },
  { id: "rohini", nameMalayalam: "രോഹിണി", nameEnglish: "Rohini", raasi: "Edavam (Taurus)" },
  { id: "makayiram", nameMalayalam: "മകയിരം", nameEnglish: "Makayiram / Mrigashirsha", raasi: "Edavam / Mithunam" },
  { id: "thiruvathira", nameMalayalam: "തിരുവാതിര", nameEnglish: "Thiruvathira / Arudra", raasi: "Mithunam (Gemini)" },
  { id: "punartham", nameMalayalam: "പുണർതം", nameEnglish: "Punartham / Punarvasu", raasi: "Mithunam / Karkidakam" },
  { id: "pooyam", nameMalayalam: "പൂയം", nameEnglish: "Pooyam / Pushya", raasi: "Karkidakam (Cancer)" },
  { id: "ayilyam", nameMalayalam: "ആയില്യം", nameEnglish: "Ayilyam / Ashlesha", raasi: "Karkidakam (Cancer)" },
  { id: "makam", nameMalayalam: "മകം", nameEnglish: "Makam / Magha", raasi: "Chingam (Leo)" },
  { id: "pooram", nameMalayalam: "പൂരം", nameEnglish: "Pooram / Purva Phalguni", raasi: "Chingam (Leo)" },
  { id: "uthram", nameMalayalam: "ഉത്രം", nameEnglish: "Uthram / Uttara Phalguni", raasi: "Chingam / Kanni" },
  { id: "atham", nameMalayalam: "അത്തം", nameEnglish: "Atham / Hasta", raasi: "Kanni (Virgo)" },
  { id: "chithira", nameMalayalam: "ചിത്തിര", nameEnglish: "Chithira / Chitra", raasi: "Kanni / Thulam" },
  { id: "chothi", nameMalayalam: "ചോതി", nameEnglish: "Chothi / Swati", raasi: "Thulam (Libra)" },
  { id: "vishakham", nameMalayalam: "വിശാഖം", nameEnglish: "Vishakham / Vishakha", raasi: "Thulam / Vrischikam" },
  { id: "anizham", nameMalayalam: "അനിഴം", nameEnglish: "Anizham / Anuradha", raasi: "Vrischikam (Scorpio)" },
  { id: "thrikketta", nameMalayalam: "തൃക്കേട്ട", nameEnglish: "Thrikketta / Jyeshtha", raasi: "Vrischikam (Scorpio)" },
  { id: "moolam", nameMalayalam: "മൂലം", nameEnglish: "Moolam / Mula", raasi: "Dhanu (Sagittarius)" },
  { id: "pooradam", nameMalayalam: "പൂരാടം", nameEnglish: "Pooradam / Purva Ashadha", raasi: "Dhanu (Sagittarius)" },
  { id: "uthradam", nameMalayalam: "ഉത്രാടം", nameEnglish: "Uthradam / Uttara Ashadha", raasi: "Dhanu / Makaram" },
  { id: "thiruvonam", nameMalayalam: "തിരുവോണം", nameEnglish: "Thiruvonam / Shravana", raasi: "Makaram (Capricorn)" },
  { id: "avittam", nameMalayalam: "അവിട്ടം", nameEnglish: "Avittam / Dhanishta", raasi: "Makaram / Kumbham" },
  { id: "chathayam", nameMalayalam: "ചതയം", nameEnglish: "Chathayam / Shatabhisha", raasi: "Kumbham (Aquarius)" },
  { id: "pooruruttathi", nameMalayalam: "പൂരുരുട്ടാതി", nameEnglish: "Pooruruttathi / Purva Bhadrapada", raasi: "Kumbham / Meenam" },
  { id: "uthrattathi", nameMalayalam: "ഉത്രട്ടാതി", nameEnglish: "Uthrattathi / Uttara Bhadrapada", raasi: "Meenam (Pisces)" },
  { id: "revathi", nameMalayalam: "രേവതി", nameEnglish: "Revathi", raasi: "Meenam (Pisces)" },
];

export interface RaasiItem {
  id: string;
  nameMalayalam: string;
  nameEnglish: string;
  symbol: string;
}

export const KERALA_RAASIS: RaasiItem[] = [
  { id: "medam", nameMalayalam: "മേടം", nameEnglish: "Medam (Aries)", symbol: "♈" },
  { id: "edavam", nameMalayalam: "ഇടവം", nameEnglish: "Edavam (Taurus)", symbol: "♉" },
  { id: "mithunam", nameMalayalam: "മിഥുനം", nameEnglish: "Mithunam (Gemini)", symbol: "♊" },
  { id: "karkidakam", nameMalayalam: "കർക്കിടകം", nameEnglish: "Karkidakam (Cancer)", symbol: "♋" },
  { id: "chingam", nameMalayalam: "ചിങ്ങം", nameEnglish: "Chingam (Leo)", symbol: "♌" },
  { id: "kanni", nameMalayalam: "കന്നി", nameEnglish: "Kanni (Virgo)", symbol: "♍" },
  { id: "thulam", nameMalayalam: "തുലാം", nameEnglish: "Thulam (Libra)", symbol: "♎" },
  { id: "vrischikam", nameMalayalam: "വൃശ്ചികം", nameEnglish: "Vrischikam (Scorpio)", symbol: "♏" },
  { id: "dhanu", nameMalayalam: "ധനു", nameEnglish: "Dhanu (Sagittarius)", symbol: "♐" },
  { id: "makaram", nameMalayalam: "മകരം", nameEnglish: "Makaram (Capricorn)", symbol: "♑" },
  { id: "kumbham", nameMalayalam: "കുംഭം", nameEnglish: "Kumbham (Aquarius)", symbol: "♒" },
  { id: "meenam", nameMalayalam: "മീനം", nameEnglish: "Meenam (Pisces)", symbol: "♓" },
];

export const DOSHAM_OPTIONS = [
  "No Dosham (ശുദ്ധ ജാതകം)",
  "Chevvai Dosham / Manglik (ചൊവ്വാ ദോഷം)",
  "Rahu / Ketu Dosham (രാഹു / കേതു ദോഷം)",
  "Sarpa Dosham (സർപ്പ ദോഷം)",
  "Papathitham (പാപസാമ്യം)",
  "Not Known / Need Astrologer Verification",
  "Prefer not to disclose",
];

export const OCCUPATION_CATEGORIES = [
  "IT & Software Engineering",
  "Medical & Healthcare (Doctor / Surgeon / Nurse)",
  "Banking, Finance & Chartered Accountant",
  "Civil Services / Govt. Officer (IAS / IPS / KAS)",
  "Education, Professor & Teaching",
  "Engineering (Civil / Mech / Electrical / Chemical)",
  "Architecture, Planning & Interior Design",
  "Aviation & Airline (Pilot / Crew)",
  "Merchant Navy & Marine Engineering",
  "Scientific Research & R&D",
  "Corporate Management & Consultant",
  "Business Owner & Industrialist",
  "Defense & Armed Forces (Army / Navy / Air Force)",
  "Legal (Judge / Advocate / Corporate Legal)",
  "Media, Entertainment & Creative Arts",
  "Hospitality, Tourism & Culinary Arts",
  "Marketing, Public Relations & Sales",
  "BPO, Tech Support & Operations",
  "Agriculture, Plantation & Farming",
  "Student / Higher Studies Abroad",
  "Homemaker",
  "Other Professional",
];

export const GROUPED_EDUCATION_QUALIFICATIONS = [
  {
    group: "Engineering & Technology",
    degrees: ["B.Tech / B.E (Computer Science / IT)", "B.Tech (Electronics / Electrical)", "B.Tech (Mechanical / Civil / Chemical)", "M.Tech / M.E", "BCA / MCA", "B.Sc / M.Sc Computer Science", "MS / M.Sc Abroad (Tech)"],
  },
  {
    group: "Medicine & Healthcare",
    degrees: ["MBBS", "MD / MS Specialist", "BDS / MDS (Dental)", "B.Pharm / M.Pharm", "B.Sc / M.Sc Nursing", "BPT / MPT (Physiotherapy)", "BHMS / BAMS (Ayurveda/Homeo)"],
  },
  {
    group: "Finance & Management",
    degrees: ["Chartered Accountant (CA)", "MBA / PGDM (IIM / Premier B-School)", "CFA / FRM", "CS (Company Secretary)", "ICWA / CMA", "B.Com / M.Com", "BBA / BBM"],
  },
  {
    group: "Civil Services & Law",
    degrees: ["Civil Services (IAS / IPS / IFS)", "LLB / LLM", "Judicial Officer"],
  },
  {
    group: "Arts, Science & Humanities",
    degrees: ["B.A / M.A", "B.Sc / M.Sc", "B.Ed / M.Ed", "Ph.D / Doctorate", "Journalism / Mass Comm"],
  },
  {
    group: "Vocational & Diplomas",
    degrees: ["Polytechnic Diploma", "Aviation / Marine Diploma", "Higher Secondary / Plus Two"],
  },
];
