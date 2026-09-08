/**
 * KERALAMMATCH — ASTROLOGY REPORT HTML SANITIZER
 * Server-side security sanitizer for generated SoftAstro report markup.
 * Strictly prevents XSS, event-handler injection, script execution, and external object embeds.
 */

const FORBIDDEN_TAGS = [
  "script", "iframe", "object", "embed", "applet",
  "meta", "link", "base", "form", "input", "button", "textarea", "select"
];

export function sanitizeAstrologyReportHtml(rawHtml: string | null | undefined): string | null {
  if (!rawHtml || typeof rawHtml !== "string") {
    return null;
  }

  let clean = rawHtml;

  // 1. Completely strip dangerous tags and their contents
  for (const tag of FORBIDDEN_TAGS) {
    const tagRegex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");
    clean = clean.replace(tagRegex, "");
    // Also strip self-closing or unclosed instances
    const selfClosingRegex = new RegExp(`<${tag}[^>]*\\/?>`, "gi");
    clean = clean.replace(selfClosingRegex, "");
  }

  // 2. Strip all inline on* event handler attributes (e.g. onclick, onerror, onload)
  clean = clean.replace(/\s+on[a-zA-Z]+\s*=\s*(['"]).*?\1/gi, "");
  clean = clean.replace(/\s+on[a-zA-Z]+\s*=\s*[^"'\s>]+/gi, "");

  // 3. Strip javascript: / vbscript: / data: pseudo-protocols in href or src
  clean = clean.replace(/(href|src)\s*=\s*(['"])\s*(javascript|vbscript|data):.*?\2/gi, '$1="#"');

  // 4. Strip dangerous expressions in style attributes
  clean = clean.replace(/style\s*=\s*(['"])(.*?)\1/gi, (match, quote, styleContent) => {
    // Remove expressions, url(...), and behaviors
    const safeStyle = styleContent
      .replace(/expression\s*\(.*?\)/gi, "")
      .replace(/url\s*\(.*?\)/gi, "")
      .replace(/-moz-binding/gi, "")
      .replace(/behavior/gi, "");
    return `style=${quote}${safeStyle}${quote}`;
  });

  return clean;
}
