import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { Users, ShieldCheck, ArrowRight } from "lucide-react";

const COMMUNITIES: Record<string, {
  name: string;
  religion: string;
  description: string;
  traditions: string;
  districts: string[];
}> = {
  nair: { name: "Nair", religion: "Hindu", description: "Find your life partner from Kerala's premier Nair community.", traditions: "Traditional Kerala temple ceremonies, Vishu, Onam celebrations", districts: ["Trivandrum", "Ernakulam", "Thrissur", "Kottayam", "Palakkad"] },
  ezhava: { name: "Ezhava", religion: "Hindu", description: "Progressive and educated community profiles across Kerala.", traditions: "Sree Narayana Guru philosophy, Onam, Vishu celebrations", districts: ["Kollam", "Alappuzha", "Ernakulam", "Kozhikode", "Trivandrum"] },
  christian: { name: "Christian", religion: "Christian", description: "Syrian Catholic, Orthodox, Marthoma, and Latin Catholic community profiles.", traditions: "Church wedding ceremonies, Christmas, Easter celebrations", districts: ["Kottayam", "Ernakulam", "Trivandrum", "Idukki", "Pathanamthitta"] },
  "latin-catholic": { name: "Latin Catholic", religion: "Catholic", description: "Coastal and urban Latin Catholic candidate profiles.", traditions: "Church festivals and parish traditions", districts: ["Trivandrum", "Kollam", "Alappuzha", "Ernakulam"] },
  "syrian-christian": { name: "Syrian Christian", religion: "Christian", description: "Traditional Syrian Christian candidate profiles.", traditions: "Traditional Church ceremonies and family feasts", districts: ["Kottayam", "Ernakulam", "Pathanamthitta", "Thrissur"] },
  muslim: { name: "Muslim", religion: "Islam", description: "Verified Muslim bride and groom profiles across Kerala and Gulf NRIs.", traditions: "Nikah ceremonies, Eid celebrations", districts: ["Malappuram", "Kozhikode", "Kannur", "Ernakulam", "Trivandrum"] },
};

interface Params {
  params: Promise<{ community: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await params;
  const raw = p?.community || "";
  const slug = raw.replace(/-matrimony$/, "");
  const c = COMMUNITIES[slug] || COMMUNITIES[raw];
  if (!c) return { title: "Not Found" };
  return {
    title: `${c.name} Matrimony Kerala | KeralamMatch`,
    description: `Find verified ${c.name} brides and grooms from Kerala.`,
    alternates: { canonical: `https://keralammatch.com/find/${slug}-matrimony` },
  };
}

export function generateStaticParams() {
  return Object.keys(COMMUNITIES).map((community) => ({ community }));
}

export default async function CommunityPage({ params }: Params) {
  const p = await params;
  const raw = p?.community || "";
  const slug = raw.replace(/-matrimony$/, "");
  const c = COMMUNITIES[slug] || COMMUNITIES[raw];
  if (!c) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] text-[#1C1C1E]">
      <Header />

      <main className="flex-1 space-y-12 pb-16">
        
        {/* Hero Section (Matching Reference 1.16) */}
        <section className="bg-white border-b border-[rgba(28,28,30,0.08)] py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#8E8E93] mb-4">
              <Link href="/" className="hover:underline">Home</Link>
              <span>›</span>
              <span>Communities</span>
              <span>›</span>
              <span className="text-[#0A1F44] font-bold">{c.name} Matrimony</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A1F44]">
                  {c.name} Matrimony
                </h1>
                <p className="text-sm text-[#636366] max-w-2xl leading-relaxed">
                  {c.description} Connect with verified Malayali candidates with privacy protection.
                </p>

                {/* Stat Badges Row */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div>
                    <div className="text-2xl font-extrabold text-[#0A1F44]">25,430</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">Verified Profiles</div>
                  </div>
                  <div className="h-8 w-px bg-[rgba(28,28,30,0.08)]" />
                  <div>
                    <div className="text-2xl font-extrabold text-[#C81D45]">1,234</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">New This Month</div>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href={`/find?community=${slug}`}
                    className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-md transition-all"
                  >
                    <span>View {c.name} Profiles</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="h-64 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800"
                    alt={`${c.name} Matrimony`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* District Coverage Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0A1F44]">{c.name} Profiles Across Kerala</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {c.districts.map((district) => (
                <Link
                  key={district}
                  href={`/find?community=${slug}&location=${district}`}
                  className="p-3 bg-[#FCFBF7] rounded-2xl border border-[rgba(28,28,30,0.06)] text-center hover:border-[#C81D45] transition-colors"
                >
                  <div className="text-xs font-bold text-[#0A1F44]">{district}</div>
                  <div className="text-[10px] text-[#8E8E93]">Browse</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
