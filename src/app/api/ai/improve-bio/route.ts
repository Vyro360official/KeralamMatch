import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function fallbackBioImprovement(text: string, tone: string): string {
  const clean = text.trim();
  if (clean.length < 5) {
    return "I am a warm, family-oriented individual who values sincerity, respect, and mutual understanding in life and relationships.";
  }

  const isIt = clean.toLowerCase().includes("it") || clean.toLowerCase().includes("software") || clean.toLowerCase().includes("tech") || clean.toLowerCase().includes("developer") || clean.toLowerCase().includes("engineer") || clean.toLowerCase().includes("sbi") || clean.toLowerCase().includes("bank");
  const likesTravel = clean.toLowerCase().includes("travel") || clean.toLowerCase().includes("explore") || clean.toLowerCase().includes("trip") || clean.toLowerCase().includes("journey");
  const likesFamily = clean.toLowerCase().includes("family") || clean.toLowerCase().includes("parents") || clean.toLowerCase().includes("home");
  const isSimple = clean.toLowerCase().includes("simple") || clean.toLowerCase().includes("down to earth") || clean.toLowerCase().includes("humble");

  let professionDetail = isIt ? "working in the technology field" : "pursuing my professional goals";
  if (clean.toLowerCase().includes("sbi") || clean.toLowerCase().includes("bank")) {
    professionDetail = "working in the banking sector";
  }

  let hobbiesDetail = likesTravel ? "traveling, exploring new places" : "spending quality leisure time";
  let valuesDetail = likesFamily ? "spending time with my family and maintaining close bonds" : "valuing meaningful connections";
  let personalityDetail = isSimple ? "simple, down-to-earth person who believes in honesty and transparency" : "balanced individual who values personal growth and respect";

  if (tone === "friendly") {
    return `Hello! I'm a ${isSimple ? "down-to-earth" : "warm"} and friendly person ${professionDetail}. I really enjoy ${hobbiesDetail} and ${valuesDetail}. I believe in living life with a positive outlook and am looking for a partner who is honest, caring, and values family as much as I do. Let's connect and get to know each other!`;
  }
  if (tone === "professional") {
    return `I am a focused professional ${professionDetail}. Characterized by a ${isSimple ? "humble" : "disciplined"} and balanced nature, I devote my time to career advancement as well as ${hobbiesDetail}. I hold high regard for family principles, particularly ${valuesDetail}. I am seeking a partner with similar values who appreciates career ambition and a balanced life.`;
  }
  if (tone === "shorter") {
    return `${isSimple ? "A simple, honest individual" : "A balanced professional"} ${professionDetail}. I love ${hobbiesDetail} and appreciate ${valuesDetail}. Seeking a compatible partner to share life's journey.`;
  }
  if (tone === "genuine") {
    return `I would describe myself as a ${isSimple ? "sincere and humble" : "genuine and thoughtful"} individual. I work ${professionDetail} and find happiness in simple things like ${hobbiesDetail}. Family is a priority for me, and I value ${valuesDetail}. I believe a relationship should be built on trust, clear communication, and mutual respect.`;
  }
  if (tone === "intro") {
    return `Greetings! Thank you for visiting my profile. I am a ${isSimple ? "simple" : "well-balanced"} individual ${professionDetail}. I strive to maintain a healthy work-life balance, enjoying ${hobbiesDetail} while keeping family close to my heart.`;
  }

  return `I am a ${personalityDetail} ${professionDetail}. In my free time, I enjoy ${hobbiesDetail} and ${valuesDetail}. I am looking for a life partner who is sincere, family-oriented, and shares a similar outlook on life.`;
}

export async function POST(req: NextRequest) {
  try {
    const { text, tone } = await req.json();

    if (!text) {
      return NextResponse.json({ success: false, error: "MISSING_TEXT" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || "";
    const isMockKey = !apiKey || apiKey.includes("dummy") || apiKey.includes("placeholder");

    if (isMockKey) {
      // Return high-quality local fallback suggestion immediately
      const suggestion = fallbackBioImprovement(text, tone);
      return NextResponse.json({ success: true, suggestion });
    }

    // Call live Google Gemini model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a professional matrimonial matchmaking bio writer.
Improve the following "About Me" description for a matrimonial profile.
User input: "${text}"
Requested tone/action: ${tone} (Options: improve writing, make it friendly, make it professional, make it shorter, make it more genuine, suggest a new introduction).
CRITICAL RULES:
1. Do not invent any new facts like education, occupation, income, family background, or hobbies.
2. Only improve, polish, and structure the wording based ONLY on the information provided in the input text.
3. Be respectful, encouraging, and natural.
4. Return ONLY the improved description itself. Do not include any intro, outro, quotes, or meta comments.`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const resJson = await response.json();
    const suggestionText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!suggestionText) {
      throw new Error("Empty response from Gemini model");
    }

    return NextResponse.json({ success: true, suggestion: suggestionText.trim() });
  } catch (error: any) {
    console.error("AI Bio Improvement Failed:", error);
    // Secure failover fallback to local suggestion to prevent service denial
    try {
      const { text, tone } = await req.json();
      const suggestion = fallbackBioImprovement(text || "", tone || "improve");
      return NextResponse.json({ success: true, suggestion });
    } catch {
      return NextResponse.json(
        { success: false, error: "GENERATION_FAILED", message: error.message },
        { status: 500 }
      );
    }
  }
}
