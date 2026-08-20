/**
 * KERALAMMATCH — CANONICAL KERALA & WORLDWIDE TAXONOMY DATASET
 * Reference baseline for Districts, Towns, Religions, Castes, Subcastes, and Education
 */

export interface DistrictData {
  name: string;
  code: string;
  headquarters: string;
  popularTowns: string[];
}

export const KERALA_DISTRICTS: DistrictData[] = [
  {
    name: "Alappuzha",
    code: "ALP",
    headquarters: "Alappuzha",
    popularTowns: ["Alappuzha", "Cherthala", "Kayamkulam", "Mavelikkara", "Chengannur", "Ambalapuzha", "Haripad", "Kuttanad", "Aroor"],
  },
  {
    name: "Ernakulam",
    code: "EKM",
    headquarters: "Kakkanad",
    popularTowns: ["Kochi", "Ernakulam", "Aluva", "Kakkanad", "Angamaly", "Tripunithura", "Perumbavoor", "Muvattupuzha", "Kothamangalam", "North Paravur", "Kalamassery", "Piravom"],
  },
  {
    name: "Idukki",
    code: "IDK",
    headquarters: "Painavu",
    popularTowns: ["Thodupuzha", "Munnar", "Kattappana", "Adimali", "Nedumkandam", "Painavu", "Kumily", "Peerumedu"],
  },
  {
    name: "Kannur",
    code: "KNR",
    headquarters: "Kannur",
    popularTowns: ["Kannur", "Thalassery", "Payyanur", "Taliparamba", "Mattannur", "Koothuparamba", "Iritty", "Panoor"],
  },
  {
    name: "Kasaragod",
    code: "KSD",
    headquarters: "Kasaragod",
    popularTowns: ["Kasaragod", "Kanhangad", "Nileshwaram", "Uppala", "Manjeshwar", "Cheruvathur", "Bekal"],
  },
  {
    name: "Kollam",
    code: "KLM",
    headquarters: "Kollam",
    popularTowns: ["Kollam", "Karunagappalli", "Punalur", "Kottarakkara", "Paravur", "Chathannoor", "Kundara", "Sasthamkotta", "Anchal"],
  },
  {
    name: "Kottayam",
    code: "KTM",
    headquarters: "Kottayam",
    popularTowns: ["Kottayam", "Changanassery", "Pala", "Kanjirappally", "Vaikom", "Ettumanoor", "Erattupetta", "Pampady"],
  },
  {
    name: "Kozhikode",
    code: "KKD",
    headquarters: "Kozhikode",
    popularTowns: ["Kozhikode", "Vadakara", "Koyilandy", "Feroke", "Ramanattukara", "Mukkam", "Kunnamangalam", "Balussery", "Thamarassery"],
  },
  {
    name: "Malappuram",
    code: "MLP",
    headquarters: "Malappuram",
    popularTowns: ["Malappuram", "Manjeri", "Perinthalmanna", "Tirur", "Ponnani", "Kottakkal", "Nilambur", "Kondotty", "Edappal", "Valanchery"],
  },
  {
    name: "Palakkad",
    code: "PLK",
    headquarters: "Palakkad",
    popularTowns: ["Palakkad", "Ottapalam", "Shornur", "Chittur-Thathamangalam", "Mannarkkad", "Pattambi", "Cherpulassery", "Alathur"],
  },
  {
    name: "Pathanamthitta",
    code: "PTA",
    headquarters: "Pathanamthitta",
    popularTowns: ["Pathanamthitta", "Thiruvalla", "Adoor", "Ranni", "Konni", "Pandalam", "Mallappally", "Kozhencherry"],
  },
  {
    name: "Thiruvananthapuram",
    code: "TVM",
    headquarters: "Thiruvananthapuram",
    popularTowns: ["Thiruvananthapuram", "Kazhakkoottam", "Neyyattinkara", "Attingal", "Nedumangad", "Varkala", "Kattakada", "Balaramapuram", "Kovalam"],
  },
  {
    name: "Thrissur",
    code: "TCR",
    headquarters: "Thrissur",
    popularTowns: ["Thrissur", "Guruvayur", "Chalakudy", "Kodungallur", "Kunnamkulam", "Irinjalakuda", "Chavakkad", "Wadakkanchery", "Ollur"],
  },
  {
    name: "Wayanad",
    code: "WYD",
    headquarters: "Kalpetta",
    popularTowns: ["Kalpetta", "Sulthan Bathery", "Mananthavady", "Vythiri", "Meenangadi", "Pulpally"],
  },
];

export interface CasteData {
  caste: string;
  subcastes: string[];
}

export interface ReligionData {
  religion: string;
  castes: CasteData[];
}

export const KERALA_RELIGIONS_TAXONOMY: ReligionData[] = [
  {
    religion: "Hindu",
    castes: [
      {
        caste: "Nair",
        subcastes: ["All", "Menon", "Kurup", "Pillai", "Nambiar", "Panicker", "Kaimal", "Unnithan", "Valiathan", "Marar", "Vilakkithala", "Veluthedathu", "Kiriyam", "Illam"],
      },
      {
        caste: "Ezhava",
        subcastes: ["All", "Ezhava", "Thiyya", "Billava", "Channar", "Panicker"],
      },
      {
        caste: "Brahmin",
        subcastes: ["All", "Namboothiri", "Iyer", "Iyengar", "Embrandiri", "Potti", "Bhattathiri", "Moothathu", "Elayathu", "Pushpaka", "Chakyar"],
      },
      {
        caste: "Vishwakarma",
        subcastes: ["All", "Asari (Carpenter)", "Kollan (Blacksmith)", "Musari (Brassmith)", "Thattan (Goldsmith)", "Kalthattan (Sculptor)"],
      },
      {
        caste: "Dheevara",
        subcastes: ["All", "Arayan", "Valan", "Mukkkuvan", "Bovi", "Mogaveera"],
      },
      {
        caste: "Kshatriya / Varma",
        subcastes: ["All", "Varma", "Raja", "Thampan", "Thampuran", "Koil Thampuran"],
      },
      {
        caste: "SC / ST Communities",
        subcastes: ["All", "Pulaya", "Cheramar", "Sambava", "Kanakkan", "Parayan", "Vettuvan", "Ulladan", "Mala Arayan", "Kuruman"],
      },
      {
        caste: "Ambalavasi",
        subcastes: ["All", "Warrier", "Pisharody", "Marar", "Poduval", "Nambisan", "Unni", "Kurukkal"],
      },
      {
        caste: "Other Hindu Communities",
        subcastes: ["All", "Kaniyan", "Vilakkithalavan", "Ganaka", "Veerasaiva", "Chetty", "Kudumbi", "Reddiar", "Guptan", "Mannadiar"],
      },
    ],
  },
  {
    religion: "Christian",
    castes: [
      {
        caste: "Syrian Catholic (Syro-Malabar)",
        subcastes: ["All", "Syrian Catholic", "Knanaya Catholic", "Northist", "Southist"],
      },
      {
        caste: "Latin Catholic",
        subcastes: ["All", "Latin Catholic Anglo-Indian", "Latin Catholic 700", "Latin Catholic 500"],
      },
      {
        caste: "Syrian Orthodox / Jacobite",
        subcastes: ["All", "Malankara Orthodox", "Jacobite Syrian", "Simhasana", "Knanaya Jacobite"],
      },
      {
        caste: "Mar Thoma",
        subcastes: ["All", "Mar Thoma Syrian", "Evangelical"],
      },
      {
        caste: "CSI (Church of South India)",
        subcastes: ["All", "CSI North Kerala", "CSI South Kerala", "CSI Madhya Kerala", "CSI East Kerala"],
      },
      {
        caste: "Pentecostal / Independent",
        subcastes: ["All", "IPC", "Assemblies of God (AG)", "Church of God", "Brethren", "Believers Church", "Seventh-day Adventist"],
      },
      {
        caste: "Syro-Malankara Catholic",
        subcastes: ["All", "Malankara Catholic Rite"],
      },
    ],
  },
  {
    religion: "Muslim",
    castes: [
      {
        caste: "Sunni",
        subcastes: ["All", "Sunni (EK Faction)", "Sunni (AP Faction)", "Shafi", "Hanafi"],
      },
      {
        caste: "Mujahid / Salafi",
        subcastes: ["All", "Mujahid (KNM)", "Markazudawa", "Wisdom"],
      },
      {
        caste: "Jamaat-e-Islami",
        subcastes: ["All", "Solidarity / JIH"],
      },
      {
        caste: "Thangal / Sayyid",
        subcastes: ["All", "Sayyid / Thangal Family"],
      },
      {
        caste: "Rawther / Dakhni / Memon",
        subcastes: ["All", "Rawther", "Dakhni", "Memon", "Bohra", "Labbai"],
      },
    ],
  },
  {
    religion: "Jain",
    castes: [
      {
        caste: "Digambara / Svetambara",
        subcastes: ["All", "Digambara", "Svetambara"],
      },
    ],
  },
  {
    religion: "Sikh",
    castes: [
      {
        caste: "Sikh",
        subcastes: ["All", "Jat", "Khatri", "Ramgarhia", "Arora"],
      },
    ],
  },
  {
    religion: "Inter-Religion / No Religion",
    castes: [
      {
        caste: "Any / Caste No Bar",
        subcastes: ["All", "Caste No Bar", "Humanist", "Atheist", "Spiritual"],
      },
    ],
  },
];

export interface EducationCategory {
  category: string;
  degrees: string[];
}

export const WORLDWIDE_EDUCATION: EducationCategory[] = [
  {
    category: "Engineering & Technology",
    degrees: [
      "B.Tech / B.E. (Computer Science / IT)",
      "B.Tech / B.E. (Electronics / ECE / EEE)",
      "B.Tech / B.E. (Mechanical / Civil / Chemical)",
      "B.Tech / B.E. (Biotech / Aerospace / AI & ML)",
      "M.Tech / M.E. / M.S. (Engineering)",
      "B.Arch / M.Arch (Architecture)",
      "BCA / MCA (Computer Applications)",
      "B.Sc / M.Sc (Computer Science / Data Science)",
    ],
  },
  {
    category: "Medicine & Healthcare",
    degrees: [
      "MBBS (Allopathy)",
      "MD / MS / DNB (Medical Specialist)",
      "DM / M.Ch (Super Specialty)",
      "BDS / MDS (Dental Surgery)",
      "BAMS / MD (Ayurveda)",
      "BHMS (Homeopathy)",
      "B.Pharm / M.Pharm / Pharm.D (Pharmacy)",
      "B.Sc / M.Sc Nursing",
      "BPT / MPT (Physiotherapy)",
      "BVSc (Veterinary Medicine)",
    ],
  },
  {
    category: "Management & Business",
    degrees: [
      "MBA / PGDM (Finance / Marketing / HR / Operations)",
      "Executive MBA (IIM / Top Tier)",
      "BBA / BBM / BMS",
      "MHA / MHM (Hospital & Healthcare Management)",
      "Master of International Business (MIB)",
    ],
  },
  {
    category: "Finance, Accounts & Banking",
    degrees: [
      "CA (Chartered Accountant - ICAI)",
      "ACCA (Association of Chartered Certified Accountants - UK)",
      "CMA / ICWA (Cost & Management Accountant)",
      "CFA (Chartered Financial Analyst - USA)",
      "CS (Company Secretary - ICSI)",
      "B.Com / M.Com (Commerce & Taxation)",
      "B.Sc / M.Sc (Economics / Actuarial Science)",
    ],
  },
  {
    category: "Law & Legal Studies",
    degrees: [
      "LLB / B.A. LLB / BBA LLB",
      "LLM (Master of Laws)",
      "Corporate Law Specialist",
    ],
  },
  {
    category: "Doctoral & Research",
    degrees: [
      "Ph.D. / D.Phil (Doctor of Philosophy)",
      "Post-Doctoral Fellow",
      "Fellow Programme in Management (FPM)",
    ],
  },
  {
    category: "Civil Services & Defense",
    degrees: [
      "IAS / IPS / IFS / IRS (Civil Services)",
      "NDA / CDS / Indian Armed Forces Graduate",
      "State Civil Services (KAS)",
    ],
  },
  {
    category: "Arts, Humanities, Science & Media",
    degrees: [
      "B.Sc / M.Sc (Physics / Chemistry / Maths / Biology)",
      "B.A / M.A (English / Literature / History / Sociology)",
      "B.Des / M.Des / NIFT (Fashion & Product Design)",
      "Journalism & Mass Communication (BJMC / MJMC)",
      "B.Ed / M.Ed (Teaching & Education)",
      "Hotel Management & Culinary Arts (BHM / IHM)",
      "Aviation & Commercial Pilot License (CPL)",
      "Marine Engineering & Nautical Science",
    ],
  },
  {
    category: "Diplomas & Vocational",
    degrees: [
      "Polytechnic Diploma in Engineering",
      "ITI / Vocational Certification",
      "High School / Plus Two (+2 / 12th)",
    ],
  },
];
