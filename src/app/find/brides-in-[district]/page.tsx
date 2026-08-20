import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { MapPin, Users, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

const DISTRICTS: Record<string, {
  name: string;
  state: string;
  description: string;
  communities: string[];
  popularAreas: string[];
  famousFor: string;
}> = {
  trivandrum: { name: "Trivandrum", state: "Kerala", description: "The capital city of Kerala, known for its educated professionals and IT sector.", communities: ["Nair", "Ezhava", "Latin Catholic", "Muslim"], popularAreas: ["Technopark", "Kazhakkoottam", "Kowdiar", "Neyyattinkara"], famousFor: "IT Hub & Cultural Capital" },
  ernakulam: { name: "Ernakulam", state: "Kerala", description: "Find your perfect match from thousands of verified profiles in Ernakulam.", communities: ["Nair", "Syrian Christian", "Muslim", "Ezhava"], popularAreas: ["Kochi", "Aluva", "Kalamassery", "Perumbavoor", "Tripunithura", "Angamaly"], famousFor: "Commercial & Business Capital" },
  kozhikode: { name: "Kozhikode", state: "Kerala", description: "The historic city of Calicut — known for its Malabar cuisine and heritage.", communities: ["Muslim", "Nair", "Ezhava", "Christian"], popularAreas: ["Calicut City", "Beypore", "Koyilandy", "Vadakara"], famousFor: "Malabar Heritage & Trade" },
  kottayam: { name: "Kottayam", state: "Kerala", description: "Famous for high literacy and vibrant Christian and Nair communities.", communities: ["Syrian Christian", "Nair", "Ezhava", "Muslim"], popularAreas: ["Kottayam Town", "Pala", "Changanassery", "Kanjirappally"], famousFor: "Literary & Rubber Plantations" },
  thrissur: { name: "Thrissur", state: "Kerala", description: "The cultural capital of Kerala — home to rich traditions and thriving business families.", communities: ["Nair", "Christian", "Ezhava", "Muslim"], popularAreas: ["Thrissur Town", "Irinjalakuda", "Chalakudy", "Guruvayur"], famousFor: "Cultural Festivals & Heritage" },
  kollam: { name: "Kollam", state: "Kerala", description: "A beautiful coastal district known for backwaters and marine industries.", communities: ["Ezhava", "Nair", "Latin Catholic", "Muslim"], popularAreas: ["Kollam City", "Karunagappally", "Punalur", "Kottarakkara"], famousFor: "Cashew & Backwaters" },
  kannur: { name: "Kannur", state: "Kerala", description: "Known for handloom weaving, rich traditions, and coastal beauty.", communities: ["Nair", "Muslim", "Ezhava", "Christian"], popularAreas: ["Kannur Town", "Thalassery", "Payyanur", "Mattannur"], famousFor: "Handloom & Coastal Heritage" },
  palakkad: { name: "Palakkad", state: "Kerala", description: "The gateway to Kerala known for its serene countryside and cultural heritage.", communities: ["Nair", "Brahmin", "Ezhava", "Muslim"], popularAreas: ["Palakkad Town", "Ottapalam", "Chittur", "Mannarkkad"], famousFor: "Paddy Fields & Heritage" },
  malappuram: { name: "Malappuram", state: "Kerala", description: "Culturally rich district with strong global NRI connections.", communities: ["Muslim", "Nair", "Ezhava", "Christian"], popularAreas: ["Manjeri", "Tirur", "Perinthalmanna", "Ponnani"], famousFor: "Gulf NRI Connections" },
  alappuzha: { name: "Alappuzha", state: "Kerala", description: "Famous for houseboats, backwater tourism, and coastal heritage.", communities: ["Latin Catholic", "Nair", "Ezhava", "Muslim"], popularAreas: ["Alappuzha Town", "Cherthala", "Kayamkulam", "Mavelikara"], famousFor: "Backwaters & Houseboats" },
  wayanad: { name: "Wayanad", state: "Kerala", description: "Highland district known for coffee plantations and natural beauty.", communities: ["Nair", "Christian", "Ezhava"], popularAreas: ["Kalpetta", "Sulthan Bathery", "Mananthavady"], famousFor: "Spices & Estates" },
  idukki: { name: "Idukki", state: "Kerala", description: "Hilly district famous for tea estates and cool climate.", communities: ["Christian", "Nair", "Ezhava"], popularAreas: ["Munnar", "Thodupuzha", "Kattappana"], famousFor: "Tea Estates & Spices" },
  pathanamthitta: { name: "Pathanamthitta", state: "Kerala", description: "Known for spiritual culture and prominent Christian and Nair communities.", communities: ["Christian", "Nair", "Ezhava"], popularAreas: ["Pathanamthitta Town", "Tiruvalla", "Adoor", "Ranni"], famousFor: "Spiritual Culture & Heritage" },
};

interface Params {
  params: Promise<{ district: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await params;
  const district = p?.district || "";
  const d = DISTRICTS[district];
  if (!d) return { title: "Not Found" };
  return {
    title: `Matrimony in ${d.name} | KeralamMatch`,
    description: `Find your perfect match from thousands of verified profiles in ${d.name}, Kerala.`,
    alternates: { canonical: `https://keralammatch.com/find/brides-in-${district}` },
  };
}

export function generateStaticParams() {
  return Object.keys(DISTRICTS).map((district) => ({ district }));
}

export default async function DistrictPage({ params }: Params) {
  const p = await params;
  const district = p?.district || "";
  const d = DISTRICTS[district];
  if (!d) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] text-[#1C1C1E]">
      <Header />

      <main className="flex-1 space-y-12 pb-16">
        
        {/* Hero Section (Matching Reference 1.15) */}
        <section className="bg-white border-b border-[rgba(28,28,30,0.08)] py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#8E8E93] mb-4">
              <Link href="/" className="hover:underline">Home</Link>
              <span>›</span>
              <span>Kerala Districts</span>
              <span>›</span>
              <span className="text-[#0A1F44] font-bold">{d.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A1F44]">
                  Matrimony in {d.name}
                </h1>
                <p className="text-sm text-[#636366] max-w-2xl leading-relaxed">
                  {d.description} Browse privacy-first, verified candidate profiles across all communities.
                </p>

                {/* Stat Badges Row */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div>
                    <div className="text-2xl font-extrabold text-[#0A1F44]">12,856</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">Verified Profiles</div>
                  </div>
                  <div className="h-8 w-px bg-[rgba(28,28,30,0.08)]" />
                  <div>
                    <div className="text-2xl font-extrabold text-[#C81D45]">2,345</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">New This Month</div>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href={`/find?location=${d.name}`}
                    className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-md transition-all"
                  >
                    <span>View {d.name} Profiles</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="h-64 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800"
                    alt={`Matrimony in ${d.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Areas Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0A1F44]">Popular Areas in {d.name}</h3>
            <div className="flex flex-wrap gap-2">
              {d.popularAreas.map((area) => (
                <span
                  key={area}
                  className="px-4 py-2 rounded-full bg-[#FCFBF7] border border-[rgba(28,28,30,0.08)] text-xs font-semibold text-[#0A1F44]"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
