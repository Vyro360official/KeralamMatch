import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateMarriageReportHtml,
  renderSouthIndianGrid,
  formatCellPlanets,
  PLANET_MALAYALAM_ABBR,
  calculateNativeSouthIndianCharts,
} from "../modules/astrology/astrology.engine";
import { executeSoftAstroMatch, executeNativeAstroMatch } from "../modules/astrology/astrology.adapter";

describe("Horoscope Report Page 2: Traditional South Indian Chart Layout Verification", () => {
  it("should verify authentic Malayalam abbreviations for all Vedic planets and Lagna", () => {
    assert.equal(PLANET_MALAYALAM_ABBR["Lagna"], "ല.");
    assert.equal(PLANET_MALAYALAM_ABBR["Sun"], "ര.");
    assert.equal(PLANET_MALAYALAM_ABBR["Moon"], "ച.");
    assert.equal(PLANET_MALAYALAM_ABBR["Mars"], "കു.");
    assert.equal(PLANET_MALAYALAM_ABBR["Mercury"], "ബു.");
    assert.equal(PLANET_MALAYALAM_ABBR["Jupiter"], "ഗു.");
    assert.equal(PLANET_MALAYALAM_ABBR["Venus"], "ശു.");
    assert.equal(PLANET_MALAYALAM_ABBR["Saturn"], "ശി.");
    assert.equal(PLANET_MALAYALAM_ABBR["Rahu"], "രാ.");
    assert.equal(PLANET_MALAYALAM_ABBR["Ketu"], "കേ.");
    assert.equal(PLANET_MALAYALAM_ABBR["Mandi"], "മാ.");
  });

  it("should format single, multiple, and empty cell planets accurately without overflowing", () => {
    assert.equal(formatCellPlanets([]), "");
    assert.equal(formatCellPlanets(undefined), "");
    assert.equal(formatCellPlanets(["Jupiter"]), "ഗു.");
    assert.equal(formatCellPlanets(["Venus", "Ketu"]), "ശു. കേ.");
    const three = formatCellPlanets(["Sun", "Mercury", "Mandi"]);
    assert.ok(three.includes("ര. ബു."));
    assert.ok(three.includes("മാ."));
    const four = formatCellPlanets(["Moon", "Mars", "Mercury", "Venus"]);
    assert.ok(four.includes("ച. കു."));
    assert.ok(four.includes("ബു. ശു."));
  });

  it("should render authentic South Indian square grid with 12 perimeter cells and central label", () => {
    const mockChart: Record<number, string[]> = {
      0: ["Venus", "Ketu"],
      1: ["Sun"],
      11: ["Jupiter"],
      3: ["Lagna"],
    };
    const gridHtml = renderSouthIndianGrid(mockChart, "ഗ്രഹനില (വധു)");
    assert.ok(gridHtml.includes('class="south-grid"'));
    assert.ok(gridHtml.includes('class="center-cell"'));
    assert.ok(gridHtml.includes("ഗ്രഹനില (വധു)"));
    assert.ok(gridHtml.includes("ശു. കേ."));
    assert.ok(gridHtml.includes("ഗു."));
    assert.ok(gridHtml.includes("ല."));
    assert.ok(!gridHtml.includes("chart-box"));
    assert.ok(!gridHtml.includes("വർഗ്ഗോത്തമം"));
    assert.ok(!gridHtml.includes("ശുഭം"));
    assert.ok(!gridHtml.includes("സമം"));
  });

  it("should verify Page 2 of generated marriage report has all 4 charts in 2x2 layout matching reference image", () => {
    const reportHtml = generateMarriageReportHtml({
      bride: { name: "Ananya Nair", dob: "1995-05-20", star: "Thiruvonam", rasi: "Makara (Capricorn)" },
      groom: { name: "Nagarajan P", dob: "1992-08-15", star: "Avittam", rasi: "Kumbha (Aquarius)" },
      porutham: {
        items: [{ name: "ദിനപ്പൊരുത്തം", status: "ഉത്തമം", score: 1.0 }],
        totalScore: 8.5,
        verdictMal: "ഉത്തമം",
      },
    });
    assert.ok(reportHtml.includes("Keral<span>am</span>Match · Grahanila & Kundli Grids"));
    assert.ok(reportHtml.includes("Page 2 of 3"));
    assert.ok(reportHtml.includes("ഗ്രഹനില (രാശി ചാർട്ടുകൾ)"));
    assert.ok(reportHtml.includes("Ananya Nair — രാശി ചക്രം"));
    assert.ok(reportHtml.includes("Nagarajan P — രാശി ചക്രം"));
    assert.ok(reportHtml.includes("Ananya Nair — നവാംശകം"));
    assert.ok(reportHtml.includes("Nagarajan P — നവാംശകം"));
    assert.ok(reportHtml.includes("ഗ്രഹനില (വധു)"));
    assert.ok(reportHtml.includes("ഗ്രഹനില (വരൻ)"));
    assert.ok(reportHtml.includes("നവാംശകം (വധു)"));
    assert.ok(reportHtml.includes("നവാംശകം (വരൻ)"));
    assert.ok(reportHtml.includes("charts-grid-2x2"));
    assert.ok(!reportHtml.includes("chart-box"));
    assert.ok(reportHtml.includes("ല."));
    assert.ok(reportHtml.includes("ര."));
    assert.ok(reportHtml.includes("ച."));
    assert.ok(reportHtml.includes("കു."));
    assert.ok(reportHtml.includes("ബു."));
    assert.ok(reportHtml.includes("ഗു."));
    assert.ok(reportHtml.includes("ശു."));
    assert.ok(reportHtml.includes("ശി."));
    assert.ok(!reportHtml.includes("വർഗ്ഗോത്തമം"));
  });

  it("should verify execution via SoftAstro preserves all calculations while rendering new Page 2 charts", async () => {
    const bride = {
      name: "Ananya Nair",
      gender: "female" as const,
      dob: "1995-05-20",
      tob: "10:30",
      place: "Trivandrum",
    };
    const groom = {
      name: "Nagarajan P",
      gender: "male" as const,
      dob: "1992-08-15",
      tob: "14:15",
      place: "Trivandrum",
    };
    const match = await executeSoftAstroMatch(bride, groom, true);
    assert.equal(match.success, true);
    assert.ok(match.porutham);
    assert.ok(match.porutham.total_score >= 0);
    assert.ok(match.papasamya);
    assert.ok(match.kuja_dosha);
    assert.ok(match.dasa_timeline);
    assert.ok(match.bride?.rasi_chart);
    assert.ok(match.bride?.navamsa_chart);
    assert.ok(match.groom?.rasi_chart);
    assert.ok(match.groom?.navamsa_chart);
    assert.ok(match.report_html);
    assert.ok(match.report_html.includes("Page 1 of 3"));
    assert.ok(match.report_html.includes("Page 2 of 3"));
    assert.ok(match.report_html.includes("Page 3 of 3"));
    assert.ok(match.report_html.includes("ഗ്രഹനില (വധു)"));
    assert.ok(match.report_html.includes("ഗ്രഹനില (വരൻ)"));
    assert.ok(match.report_html.includes("നവാംശകം (വധു)"));
    assert.ok(match.report_html.includes("നവാംശകം (വരൻ)"));
  });
});
