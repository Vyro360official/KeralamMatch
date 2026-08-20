import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";

export const metadata: Metadata = {
  title: "KeralamMatch Blog — Stories, Tips & Relationships",
  description: "Read success stories, matrimony tips, and cultural guides from KeralamMatch.",
};

const POSTS = [
  {
    slug: "how-to-build-a-strong-relationship",
    title: "How to Build a Strong & Lasting Relationship",
    excerpt: "Essential principles for Malayali couples navigating modern marriage while respecting traditional family values.",
    category: "Relationships",
    readTime: "5 min read",
    date: "May 10, 2024",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600",
  },
  {
    slug: "things-to-discuss-before-marriage",
    title: "10 Things Every Malayali Couple Should Discuss Before Marriage",
    excerpt: "From career goals to living arrangements — key conversations to have before taking the leap.",
    category: "Marriage Tips",
    readTime: "6 min read",
    date: "May 8, 2024",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600",
  },
  {
    slug: "real-stories-of-love-and-togetherness",
    title: "Real Stories of Love and Togetherness Across Kerala",
    excerpt: "How couples found their life partners through privacy-first matrimonial connections.",
    category: "Success Stories",
    readTime: "4 min read",
    date: "May 6, 2024",
    image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600",
  },
  {
    slug: "rise-of-privacy-first-matrimony",
    title: "The Rise of Privacy-First Matrimony in Kerala",
    excerpt: "Why modern families prefer consent-based contact reveals over public listing boards.",
    category: "Lifestyle",
    readTime: "5 min read",
    date: "May 3, 2024",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600",
  },
  {
    slug: "family-values-in-a-successful-marriage",
    title: "Family Values in a Successful Kerala Marriage",
    excerpt: "Balancing personal aspirations with joint family support and traditional Malayali culture.",
    category: "Family",
    readTime: "7 min read",
    date: "Apr 28, 2024",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600",
  },
];

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] text-[#1C1C1E]">
      <Header />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Page Header (Matching Reference 1.14) */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0A1F44]">KeralamMatch Blog</h1>
          <p className="text-xs sm:text-sm text-[#636366]">Stories, tips and everything about relationships</p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
          {["All", "Relationships", "Marriage Tips", "Success Stories", "Lifestyle", "Family"].map((cat, i) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full transition-all ${
                i === 0 ? "bg-[#C81D45] text-white shadow-sm" : "bg-white text-[#636366] border border-[rgba(28,28,30,0.08)] hover:text-[#0A1F44]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Article Cards Grid (Matching Reference 1.14) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <div className="bg-white rounded-3xl overflow-hidden border border-[rgba(28,28,30,0.08)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                <div>
                  <div className="aspect-[16/9] w-full bg-gray-100 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#C81D45]">
                      <span>{post.category}</span>
                      <span className="text-[#8E8E93]">{post.readTime}</span>
                    </div>
                    <h2 className="text-base font-bold text-[#0A1F44] group-hover:text-[#C81D45] transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-xs text-[#636366] leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 text-[10px] text-[#8E8E93] font-semibold">
                  {post.date}
                </div>
              </div>
            </Link>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}
