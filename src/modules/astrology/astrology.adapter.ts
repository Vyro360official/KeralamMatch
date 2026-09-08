/**
 * KERALAMMATCH — SOFTOASTRO ADAPTER
 * Connects KeralamMatch to the authoritative SoftAstro calculation engine.
 * Supports local Python runner execution (via SOFTASTRO_PATH) and cloud microservice (via ASTROLOGY_SERVICE_URL).
 * Fails closed without fake or mock fallbacks.
 */

import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { BirthProfileInput, SoftAstroRawResponse, PoruthamItem } from "./astrology.types";

const DISTRICT_COORDINATES: Record<string, { lat: number; lon: number }> = {
  trivandrum: { lat: 8.5241, lon: 76.9366 },
  thiruvananthapuram: { lat: 8.5241, lon: 76.9366 },
  kollam: { lat: 8.8932, lon: 76.6141 },
  pathanamthitta: { lat: 9.2648, lon: 76.7870 },
  alappuzha: { lat: 9.4981, lon: 76.3388 },
  kottayam: { lat: 9.5916, lon: 76.5222 },
  idukki: { lat: 9.8500, lon: 76.9800 },
  ernakulam: { lat: 9.9816, lon: 76.2999 },
  kochi: { lat: 9.9816, lon: 76.2999 },
  thrissur: { lat: 10.5276, lon: 76.2144 },
  palakkad: { lat: 10.7867, lon: 76.6548 },
  malappuram: { lat: 11.0730, lon: 76.0740 },
  kozhikode: { lat: 11.2588, lon: 75.7804 },
  calicut: { lat: 11.2588, lon: 75.7804 },
  wayanad: { lat: 11.6854, lon: 76.1320 },
  kannur: { lat: 11.8745, lon: 75.3704 },
  kasaragod: { lat: 12.5102, lon: 74.9852 },
};

const PORUTHAM_TRANSLATIONS: Record<string, { english: string; desc: string }> = {
  "രാശിപൊരുത്തം": { english: "Rasi Porutham", desc: "Zodiac sign alignment & emotional harmony" },
  "രാശ്യധിപപൊരുത്തം": { english: "Rashyadhipa Porutham", desc: "Planetary rulers friendship & mental wavelength" },
  "വശ്യപൊരുത്തം": { english: "Vasya Porutham", desc: "Mutual attraction, respect & devotion" },
  "ഗണപൊരുത്തം": { english: "Gana Porutham", desc: "Temperament & psychological compatibility" },
  "യോനിപൊരുത്തം": { english: "Yoni Porutham", desc: "Biological & physical affinity" },
  "ദിനപൊരുത്തം": { english: "Dina Porutham", desc: "Health, longevity & daily prosperity" },
  "മാഹേന്ദ്രപൊരുത്തം": { english: "Mahendra Porutham", desc: "Family continuity, progeny & bonding" },
  "സ്ത്രീദീർഘപൊരുത്തം": { english: "Sthree Deergha Porutham", desc: "Auspiciousness, well-being & bride happiness" },
  "രജ്ജുപൊരുത്തം": { english: "Rajju Porutham", desc: "Marital longevity & core bond durability" },
  "വേദപൊരുത്തം": { english: "Vedha Porutham", desc: "Absence of astrological conflict / affliction" },
};

export class AstrologyServiceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AstrologyServiceUnavailableError";
  }
}

export function resolveCoordinates(districtOrPlace?: string | null): { lat: number; lon: number } {
  if (!districtOrPlace) {
    return { lat: 8.5241, lon: 76.9366 }; // Default: Trivandrum (State Capital)
  }
  const clean = districtOrPlace.toLowerCase().trim().replace(/[^a-z]/g, "");
  for (const [key, coords] of Object.entries(DISTRICT_COORDINATES)) {
    if (clean.includes(key)) {
      return coords;
    }
  }
  return { lat: 8.5241, lon: 76.9366 };
}

export function normalizeTimeTo24Hour(timeStr?: string | null): string {
  if (!timeStr || !timeStr.trim()) return "12:00";
  const raw = timeStr.trim().toUpperCase();

  // Match e.g. "10:30 AM", "06:15 PM"
  const ampmMatch = raw.match(/^(\d{1,2})[:.](\d{2})\s*(AM|PM)?$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2];
    const meridian = ampmMatch[3];

    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  }

  // If already "HH:MM"
  if (/^\d{2}:\d{2}$/.test(raw)) {
    return raw;
  }

  return "12:00";
}

export async function executeSoftAstroMatch(
  bride: BirthProfileInput,
  groom: BirthProfileInput,
  includeReportHtml = true
): Promise<SoftAstroRawResponse> {
  // Option A: Microservice if configured
  const microserviceUrl = process.env.ASTROLOGY_SERVICE_URL;
  if (microserviceUrl) {
    try {
      const response = await fetch(`${microserviceUrl}/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.ASTROLOGY_SERVICE_KEY ? { "Authorization": `Bearer ${process.env.ASTROLOGY_SERVICE_KEY}` } : {})
        },
        body: JSON.stringify({ bride, groom, includeReportHtml }),
      });
      if (!response.ok) {
        throw new Error(`Microservice responded with status ${response.status}`);
      }
      return await response.json();
    } catch (netErr: any) {
      console.error("[AstrologyAdapter] Microservice request failed:", netErr.message);
      throw new AstrologyServiceUnavailableError("Dedicated astrology microservice is unreachable.");
    }
  }

  // Option B: Local Python Engine Execution
  const softastroPath = process.env.SOFTASTRO_PATH || "C:\\Users\\DELL\\Downloads\\SOFTASTRO\\keralam_astro";
  const runnerScript = path.join(process.cwd(), "scripts", "softastro_runner.py");

  if (!fs.existsSync(runnerScript)) {
    throw new AstrologyServiceUnavailableError("SoftAstro runner script not found.");
  }

  if (!fs.existsSync(/*turbopackIgnore: true*/ softastroPath)) {
    throw new AstrologyServiceUnavailableError(
      `SoftAstro directory not found at configured path (${softastroPath}). Production deployment requires ASTROLOGY_SERVICE_URL.`
    );
  }

  const payload = {
    bride: {
      name: bride.name,
      gender: bride.gender || "female",
      dob: bride.dob,
      tob: normalizeTimeTo24Hour(bride.tob),
      place: bride.place || "Kerala",
      lat: bride.lat ?? resolveCoordinates(bride.place).lat,
      lon: bride.lon ?? resolveCoordinates(bride.place).lon,
      tz: bride.tz ?? 5.5,
    },
    groom: {
      name: groom.name,
      gender: groom.gender || "male",
      dob: groom.dob,
      tob: normalizeTimeTo24Hour(groom.tob),
      place: groom.place || "Kerala",
      lat: groom.lat ?? resolveCoordinates(groom.place).lat,
      lon: groom.lon ?? resolveCoordinates(groom.place).lon,
      tz: groom.tz ?? 5.5,
    },
    includeReportHtml,
  };

  return new Promise((resolve, reject) => {
    let stdoutData = "";
    let stderrData = "";
    let isSettled = false;

    const py = spawn("python", [runnerScript], {
      env: {
        ...process.env,
        SOFTASTRO_PATH: softastroPath,
        PYTHONIOENCODING: "utf-8",
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

    const timeout = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        py.kill("SIGKILL");
        reject(new Error("Astrology calculation timed out after 7000ms"));
      }
    }, 7000);

    py.stdout.setEncoding("utf8");
    py.stderr.setEncoding("utf8");

    py.stdout.on("data", (chunk) => {
      stdoutData += chunk;
    });

    py.stderr.on("data", (chunk) => {
      stderrData += chunk;
    });

    py.on("error", (err) => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timeout);
        reject(new AstrologyServiceUnavailableError(`Failed to execute Python process: ${err.message}`));
      }
    });

    py.on("close", (code) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timeout);

      if (code !== 0) {
        console.error(`[AstrologyAdapter] Process exited with code ${code}. Stderr: ${stderrData}`);
        return reject(new Error(`Astrology engine returned non-zero code (${code}).`));
      }

      try {
        const parsed: SoftAstroRawResponse = JSON.parse(stdoutData);
        if (!parsed.success) {
          return reject(new Error(parsed.error || "Astrology engine calculation failed."));
        }
        resolve(parsed);
      } catch (parseErr: any) {
        console.error("[AstrologyAdapter] Failed to parse output:", stdoutData);
        reject(new Error("Invalid output received from astrology engine."));
      }
    });

    // Send payload through STDIN
    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();
  });
}

export function formatPoruthamItems(
  rawItems?: Array<{ name: string; status: string; score: number }>
): PoruthamItem[] {
  if (!rawItems || !Array.isArray(rawItems)) return [];

  return rawItems.map((item) => {
    const meta = PORUTHAM_TRANSLATIONS[item.name] || {
      english: item.name,
      desc: "Astrological compatibility aspect",
    };

    let statusEnglish: "Excellent" | "Moderate" | "Needs Attention" = "Needs Attention";
    if (item.score >= 1.0) statusEnglish = "Excellent";
    else if (item.score >= 0.5) statusEnglish = "Moderate";

    return {
      name: item.name,
      nameEnglish: meta.english,
      status: item.status,
      statusEnglish,
      score: item.score,
      maxScore: 1.0,
      explanation: meta.desc,
    };
  });
}
