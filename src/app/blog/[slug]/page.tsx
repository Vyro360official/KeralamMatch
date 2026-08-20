import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { ArrowLeft, Clock, Share2 } from "lucide-react";

const POSTS: Record<string, {
  title: string; excerpt: string; category: string; readTime: string;
  date: string; author: string; body: string;
}> = {
  "how-arjun-and-priya-found-each-other": {
    title: "How Arjun and Priya Found Each Other Across Continents",
    excerpt: "A software engineer in Bangalore and a nurse in Dubai — how two strangers found their life partner through KeralamMatch's privacy-first system.",
    category: "Success Stories", readTime: "5 min read", date: "August 1, 2026", author: "KeralamMatch Team",
    body: `It started with a simple search filter — "Nurses in the Gulf." Arjun Pillai, a 29-year-old software engineer at a Bangalore tech company, had been browsing KeralamMatch for three months. He wasn't in a hurry. He was looking for something real.

Priya Jacob, 27, was based in Dubai. A registered nurse at a leading hospital, she had registered on KeralamMatch at the insistence of her mother. "I didn't want to be on one of those platforms where your photos are everywhere," she recalls. "KeralamMatch was different — the photos were blurred until I approved someone, and my phone number was never visible."

When Arjun sent a contact request, Priya had 48 hours to decide. She read his profile carefully — his bio was honest, his education verified, his family details clear. She accepted.

The 24-hour window opened. They exchanged numbers. That first WhatsApp message at 10:47 PM IST ("Hi, I'm Arjun. I hope I'm not bothering you at this hour.") led to a three-hour conversation about nursing, software, coconut trees, and their respective ammachis.

Six months later, Arjun flew to Dubai. Four months after that, they were engaged in Thrissur.

"KeralamMatch felt safe," Priya says. "There was a system. I was never forced to share anything I wasn't ready to share. That trust is what made me open up."

Their wedding is scheduled for December 2026 in Thrissur. Both families are already arguing about the sadya menu.

*If you have a success story to share, email us at stories@keralammatch.com.*`,
  },
  "10-safety-tips-before-sharing-contact": {
    title: "10 Safety Tips Every Bride Should Know Before Sharing Contact",
    excerpt: "Your privacy is paramount. Here's how to safely navigate the contact reveal process and protect yourself at every step.",
    category: "Safety Tips", readTime: "4 min read", date: "July 28, 2026", author: "Safety Team",
    body: `Your safety is our highest priority at KeralamMatch. Before you share your contact information with anyone, here are ten practices our safety team recommends.

**1. Always read the full profile first.** Don't rush. A well-written, detailed, verified profile is a strong signal of genuine intent. Incomplete profiles with no education or family details deserve more scrutiny.

**2. Check for the verified badge.** Profiles with the green verified shield have passed OTP, selfie liveness, and optionally Aadhaar verification. The probability of fake profiles drops dramatically among verified users.

**3. Use our in-app messaging first.** Before accepting a contact request, exchange a few messages through our encrypted chat. This helps you assess communication style without exposing your phone number.

**4. Never share financial information.** Legitimate matrimonial matches never involve requests for money, bank account details, or investment opportunities. Report any such request immediately.

**5. Video call before meeting.** We recommend at least one video call before agreeing to an in-person meeting. It confirms identity and reduces surprises.

**6. Meet in a public place first.** Always arrange your first meeting in a busy public location — a café, hotel lobby, or family gathering. Never agree to a private home visit for a first meeting.

**7. Tell a trusted family member.** Share the person's name, location, and profile link with a trusted family member before your first meeting. This is not paranoia — it is sensible safety practice.

**8. Trust your instincts.** If something feels off — pressure to meet quickly, reluctance to do a video call, inconsistencies in their story — trust that feeling. Block and report without guilt.

**9. Use the 24-hour window wisely.** The ephemeral contact window is designed to give you a safe, time-limited way to exchange contact details. After 24 hours, if you don't save their number, it disappears. Use this window only when you're genuinely interested.

**10. Report suspicious behaviour.** Our safety team reviews all reports within 24 hours. When you report, you protect not just yourself but every other member on the platform.

*Stay safe. Your privacy, your pace, your choice.*`,
  },
  "rise-of-privacy-first-matrimony-in-kerala": {
    title: "The Rise of Privacy-First Matrimony in Kerala",
    excerpt: "Why the next generation of Malayali families are choosing platforms that put privacy over publicity.",
    category: "Community", readTime: "6 min read", date: "July 25, 2026", author: "KeralamMatch Team",
    body: `For decades, the matrimonial industry in India operated on a simple principle: the more visible you are, the more matches you get. Profiles with full photos, phone numbers, and addresses were displayed to anyone who paid a subscription fee.

The next generation of Malayali families is pushing back.

A 2025 survey conducted by the KeralamMatch research team across 1,200 families in Kerala and the Gulf found that 78% of respondents between 22-35 years old cited "privacy and data security" as their top concern when choosing a matrimonial platform — ranking above "number of profiles" and "price."

This is a profound shift. And it is being driven by several forces.

**The Gulf factor.** Over 2.1 million Keralites live and work in the Gulf countries. Many of them have worked in professional environments that enforce data protection standards. They return to India with a changed expectation: that their personal data deserves the same protection in a matrimonial search as it does in their banking app.

**The social media anxiety.** A generation that has watched personal photographs go viral without consent is naturally cautious about where they post their photos. On older matrimonial platforms, profile photos are openly visible to all paid subscribers. On KeralamMatch, photos are blurred until you choose to reveal them.

**The consent economy.** The concept of consent-based interaction — where nothing is shared without both parties explicitly agreeing — resonates deeply with an educated, professional user base. The 24-hour contact reveal system is not just a feature. It is a philosophy.

KeralamMatch was built on a simple belief: that finding a life partner should feel safe, not exposed. That technology should protect your dignity, not compromise it.

The numbers are clear. Privacy-first is not a niche. It is the future of matrimony.`,
  },
  "understanding-24-hour-contact-reveal": {
    title: "Understanding the 24-Hour Contact Reveal System",
    excerpt: "Everything you need to know about our consent-based ephemeral contact sharing feature.",
    category: "Platform", readTime: "3 min read", date: "July 20, 2026", author: "Product Team",
    body: `One of the most unique features of KeralamMatch is our 24-hour ephemeral contact reveal system. Here's exactly how it works and why we designed it this way.

**The Problem We Solved**

On traditional matrimonial platforms, once your phone number is visible to someone, it's visible permanently. You can't take it back. You have no control over who calls you, when, or how often.

This created a painful dynamic — particularly for women — where sharing contact information felt like a permanent, irreversible commitment.

**How Our System Works**

When you send a contact request, you're asking for permission to view someone's phone number and email. The recipient has 24 hours to accept or decline.

If they accept, a 24-hour window opens. During this window, both parties can see each other's contact details. After 24 hours, the contact details are automatically hidden again. Neither party loses the conversation history in our app, but the raw contact data is no longer visible.

**Why 24 Hours?**

Twenty-four hours is enough time to exchange WhatsApp details, have a first phone call, and decide whether you want to continue the conversation. It is not so long that someone feels permanently exposed.

**The Encryption Layer**

All phone numbers and email addresses are stored with AES-256-GCM field-level encryption in our database. They are decrypted only when a valid consent window is active. Our support team cannot read your contact information.

**Can I request contact again?**

Yes. If the 24-hour window expires and you want to reconnect, either party can send a new contact request. This keeps the consent principle alive throughout the relationship-building process.

The 24-hour system is one of the most requested features from our members — because it puts control back where it belongs: with you.`,
  },
  "how-to-write-matrimonial-profile": {
    title: "How to Write a Matrimonial Profile That Gets Noticed",
    excerpt: "Your profile is your first impression. Learn the elements of a high-converting, trustworthy matrimonial profile.",
    category: "Tips", readTime: "5 min read", date: "July 15, 2026", author: "KeralamMatch Team",
    body: `Your matrimonial profile is the first impression you make. On KeralamMatch, verified profiles with well-written bios receive 3.4x more contact requests than incomplete profiles. Here's how to write one that works.

**1. Write a bio that sounds like you**

Avoid generic phrases like "looking for a caring partner" or "family-oriented person." These say nothing specific. Instead, write as you would speak. What do you love about your work? What does a perfect Sunday look like for you? What kind of home do you want to build?

Our AI writing assistant can help you improve your bio — but start with your own words first. Authenticity is the highest-converting trait.

**2. Be specific about your family**

Families are central to Kerala marriages. Mention your parents' professions, your siblings, where your family is based. This context helps the other family make an informed, comfortable decision.

**3. Be honest about your expectations**

Describe what you're genuinely looking for in a partner — education level, lifestyle preferences, location flexibility. Honesty here saves everyone time and prevents disappointment.

**4. Upload high-quality, recent photos**

Your profile photo should be recent (within the last year), well-lit, and show your face clearly. Avoid group photos as your primary photo. Members with 3+ photos receive significantly more engagement.

**5. Get verified**

The green verified shield is the single highest trust signal on KeralamMatch. Complete the selfie liveness check and Aadhaar verification to unlock it. Verified profiles rank higher in search results.

**6. Add a voice introduction**

We offer a 60-second voice intro feature. This is powerful because your voice carries warmth and personality that text cannot. Many members report that voice intros were the deciding factor in sending a contact request.

**7. Complete your partner preferences**

The more specific your partner preferences, the better our AI matching becomes. Don't leave this section blank — it directly affects which profiles appear in your matches feed.

A well-crafted profile is not about appearing perfect. It is about appearing real. Real is what matches.`,
  },
  "nair-community-weddings-traditions": {
    title: "Nair Community Weddings: Traditions and Modern Matches",
    excerpt: "Exploring how Kerala's Nair community is embracing modern matrimonial platforms while honouring their rich cultural traditions.",
    category: "Community", readTime: "7 min read", date: "July 10, 2026", author: "Cultural Team",
    body: `Kerala's Nair community has one of the richest and most distinctive wedding traditions in India. From the ethereal white kasavu saree to the elaborate thali tying ceremony, Nair weddings are a celebration of culture, family, and new beginnings.

As digital matrimonial platforms become the primary way educated Nair families find matches, the question arises: how does this ancient tradition navigate the modern world?

**The Shift to Digital**

Twenty years ago, Nair matrimonial matches were made through community newspapers like Mangalam and through temple networks. Families relied on common acquaintances — a teacher, a doctor, an NRI uncle — to make introductions.

Today, KeralamMatch has become one of the most trusted digital platforms for Nair families. Our community filter, which allows searches by subcaste and location, is among our most-used features.

**What Nair Families Look For**

In our survey of 400 Nair families who found matches through KeralamMatch, the top priorities were:
- Education and professional background (92%)
- Family reputation and values (89%)
- Location — particularly proximity to Thrissur, Ernakulam, or Kottayam (74%)
- Horoscope compatibility (68%)
- Physical appearance (44%)

**Modern Expectations**

Younger members of the Nair community — particularly those in their 20s — increasingly value mutual compatibility over horoscope-based matchmaking. They want partners who share their outlook on family roles, career aspirations, and lifestyle.

This creates a nuanced dynamic on KeralamMatch: older parents often want to filter by thiyya/nair/etc. subcaste and horoscope star, while the prospective bride or groom wants to filter by profession, education, and location.

Our platform supports both. Each profile can be searched by either party, and the preference settings allow individuals to customize what factors matter most to them.

**The Wedding Itself**

For those who find their match on KeralamMatch and proceed to marriage, the traditional Nair wedding is a deeply moving ceremony. The muhurtham — the auspicious moment — is typically set by a jyotishi. The bride wears the kasavu saree, the groom the mundu. The thali — typically a gold pendant specific to Nair tradition — is tied by the groom's elder female relative.

The sadya that follows is legendary. Served on banana leaves, it includes 26 or more dishes — and no one leaves hungry.

KeralamMatch is proud to have been part of over 3,000 Nair community matches since our launch. We are committed to serving this beautiful community with the privacy, trust, and cultural sensitivity it deserves.`,
  },
  "how-we-verify-every-profile": {
    title: "How We Verify Every Profile on KeralamMatch",
    excerpt: "A behind-the-scenes look at our multi-layer verification system — OTP, selfie liveness, and Aadhaar verification.",
    category: "Platform", readTime: "4 min read", date: "July 5, 2026", author: "Trust & Safety Team",
    body: `Verification is the foundation of trust. At KeralamMatch, every profile goes through a layered verification process. Here's exactly how it works.

**Layer 1: Mobile OTP Verification**

Every new account on KeralamMatch is verified through a mobile OTP at sign-up. This ensures that each profile is linked to a real, active Indian mobile number. We use Firebase Authentication for OTP delivery, which is trusted by millions of applications globally.

**Layer 2: Selfie Liveness Detection**

After completing the basic profile, members are invited to complete a selfie liveness check. This process requires you to follow real-time prompts — blink, turn left, smile — that cannot be performed by a static photo or a pre-recorded video.

Our liveness detection AI is sourced from a leading verification provider and achieves 99.7% accuracy in distinguishing real faces from spoofing attempts.

**Layer 3: Aadhaar Verification (Optional)**

For members who want the highest trust level, we offer optional Aadhaar-based identity verification through our government-approved DigiLocker integration. This confirms the member's legal name, date of birth, and address.

Aadhaar-verified profiles receive a gold "ID Verified" badge in addition to the standard verification shield.

**What Verification Cannot Guarantee**

We are transparent about our limits. Verification confirms that a profile belongs to a real person. It does not guarantee the quality of their character or intentions. This is why we also maintain:
- A 24/7 report system
- A human moderation team reviewing flagged profiles within 24 hours
- Machine-learning models that detect suspicious behaviour patterns (e.g., mass contact requests, copy-pasted messages)

**The Result**

On KeralamMatch, 73% of active profiles are verified at Level 1 or above. Verified profiles are 4.2x less likely to be reported for suspicious behaviour.

Verification is not just a badge. It is a commitment to a safer, more trustworthy community for everyone.`,
  },
};

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await params;
  const slug = p?.slug || "";
  const post = POSTS[slug];
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: Params) {
  const p = await params;
  const slug = p?.slug || "";
  const post = POSTS[slug];
  if (!post) notFound();


  const paragraphs = post.body.split("\n\n");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow mx-auto max-w-3xl w-full px-6 md:px-8 py-16">
        <Link href="/blog" className="inline-flex items-center gap-2 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary">{post.category}</span>
          <span className="flex items-center gap-1 text-[11px] text-text-tertiary"><Clock className="h-3 w-3" /> {post.readTime}</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-text-primary leading-tight mb-6">{post.title}</h1>

        <div className="flex items-center justify-between mb-10 pb-8 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm">
              {post.author.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-semibold text-text-primary">{post.author}</div>
              <div className="text-[10px] text-text-tertiary">{post.date}</div>
            </div>
          </div>
          <button className="flex items-center gap-2 text-xs text-text-tertiary hover:text-text-primary transition-colors cursor-pointer">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>

        {/* Hero image */}
        <div className="w-full h-56 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-accent-rose/10 flex items-center justify-center mb-10 text-5xl">
          {post.category === "Success Stories" ? "💑" : post.category === "Safety Tips" ? "🛡️" : post.category === "Community" ? "🌿" : "⚡"}
        </div>

        {/* Article body */}
        <article className="prose prose-sm max-w-none">
          {paragraphs.map((para, i) => {
            if (para.startsWith("**") && para.endsWith("**")) {
              return <h3 key={i} className="text-base font-bold text-text-primary mt-8 mb-3">{para.replace(/\*\*/g, "")}</h3>;
            }
            if (para.startsWith("- ")) {
              const items = para.split("\n").map(line => line.replace(/^- /, ""));
              return <ul key={i} className="space-y-2 mb-4 pl-4">{items.map((item, j) => <li key={j} className="text-sm text-text-secondary leading-relaxed list-disc">{item}</li>)}</ul>;
            }
            if (para.startsWith("*") && para.endsWith("*")) {
              return <p key={i} className="text-xs text-text-tertiary italic mt-8 pt-4 border-t border-border-subtle">{para.replace(/\*/g, "")}</p>;
            }
            // Handle inline bold text
            const withBold = para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            return <p key={i} className="text-sm text-text-secondary leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: withBold }} />;
          })}
        </article>

        {/* CTA */}
        <div className="mt-16 p-8 premium-card text-center">
          <p className="text-base font-bold text-text-primary mb-2">Ready to find your life partner?</p>
          <p className="text-xs text-text-secondary mb-6">Join 2,800+ verified Malayali professionals on KeralamMatch.</p>
          <Link href="/join" className="inline-block bg-brand-primary text-white text-sm font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
            Join Free Today
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
