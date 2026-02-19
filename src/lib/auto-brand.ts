import * as cheerio from "cheerio";
import type { AutoBrandResult, AutoBrandField } from "./auto-brand-types";

// --- Color helpers ---

export function isValidHex(color: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color);
}

export function normalizeHex(color: string): string {
  let c = color.trim().toLowerCase();
  if (!c.startsWith("#")) c = "#" + c;
  // Expand shorthand #abc -> #aabbcc
  if (/^#[0-9a-f]{3}$/i.test(c)) {
    c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
  }
  return c;
}

export function darkenHex(hex: string, amount = 0.15): string {
  const c = normalizeHex(hex).slice(1);
  const r = Math.max(0, Math.round(parseInt(c.slice(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(c.slice(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(c.slice(4, 6), 16) * (1 - amount)));
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export function isNeutral(hex: string): boolean {
  const c = normalizeHex(hex).slice(1);
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
  const brightness = (r + g + b) / 3;
  // Neutral = very low saturation AND very bright or very dark
  return maxDiff < 30 && (brightness > 220 || brightness < 35);
}

function hexFromRgb(rgb: string): string | null {
  const m = rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!m) return null;
  const hex =
    "#" +
    [m[1], m[2], m[3]]
      .map((v) => parseInt(v, 10).toString(16).padStart(2, "0"))
      .join("");
  return hex;
}

function extractColorFromValue(val: string): string | null {
  const trimmed = val.trim().toLowerCase();
  if (isValidHex(trimmed) || isValidHex("#" + trimmed)) {
    const hex = normalizeHex(trimmed);
    return isValidHex(hex) ? hex : null;
  }
  if (trimmed.startsWith("rgb")) {
    return hexFromRgb(trimmed);
  }
  return null;
}

// --- Main extraction ---

export async function extractBranding(url: string): Promise<AutoBrandResult> {
  const result: AutoBrandResult = {
    logo: null,
    primaryColor: null,
    secondaryColor: null,
    businessName: null,
    phone: null,
    googleReviewUrl: null,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let html: string;
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AfterYourVisit/1.0; +https://afteryourvisit.com)",
        Accept: "text/html",
      },
    });
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 500_000) {
      html = new TextDecoder().decode(buf.slice(0, 500_000));
    } else {
      html = new TextDecoder().decode(buf);
    }
  } catch {
    return result;
  } finally {
    clearTimeout(timeout);
  }

  const $ = cheerio.load(html);

  // --- Logo extraction (priority order) ---
  const appleTouchIcon = $('link[rel="apple-touch-icon"]').attr("href");
  const ogImage = $('meta[property="og:image"]').attr("content");
  const headerLogoImg = $(
    'header img[src*="logo"], header img[alt*="logo" i], header img[class*="logo"], nav img[src*="logo"], nav img[alt*="logo" i], nav img[class*="logo"], img[class*="logo"], img[id*="logo"], img[src*="logo"]'
  )
    .first()
    .attr("src");
  const favicon =
    $('link[rel="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href");

  if (appleTouchIcon) {
    result.logo = {
      value: resolveUrl(url, appleTouchIcon),
      confidence: 0.9,
      source: "apple-touch-icon",
    };
  } else if (ogImage) {
    result.logo = {
      value: resolveUrl(url, ogImage),
      confidence: 0.75,
      source: "og:image",
    };
  } else if (headerLogoImg) {
    result.logo = {
      value: resolveUrl(url, headerLogoImg),
      confidence: 0.8,
      source: "header/nav logo img",
    };
  } else if (favicon) {
    result.logo = {
      value: resolveUrl(url, favicon),
      confidence: 0.4,
      source: "favicon",
    };
  }

  // --- Color extraction ---
  const colors: { hex: string; confidence: number; source: string }[] = [];

  // 1. meta theme-color
  const themeColor = $('meta[name="theme-color"]').attr("content");
  if (themeColor) {
    const hex = extractColorFromValue(themeColor);
    if (hex && !isNeutral(hex)) {
      colors.push({ hex, confidence: 0.95, source: "meta theme-color" });
    }
  }

  // 2. CSS custom properties in <style> tags
  const styleText = $("style")
    .map((_, el) => $(el).text())
    .get()
    .join("\n");
  const cssVarPatterns = [
    /--primary[- _]?color\s*:\s*([^;]+)/i,
    /--brand[- _]?color\s*:\s*([^;]+)/i,
    /--main[- _]?color\s*:\s*([^;]+)/i,
    /--accent[- _]?color\s*:\s*([^;]+)/i,
  ];
  for (const pattern of cssVarPatterns) {
    const m = styleText.match(pattern);
    if (m) {
      const hex = extractColorFromValue(m[1]);
      if (hex && !isNeutral(hex)) {
        colors.push({ hex, confidence: 0.85, source: `CSS var (${pattern.source})` });
      }
    }
  }

  // 3. Inline style colors on key elements
  $("[style]").each((_, el) => {
    const style = $(el).attr("style") || "";
    const colorMatches = style.match(
      /(?:background-color|color)\s*:\s*(#[0-9a-fA-F]{3,6}|rgb[a]?\([^)]+\))/g
    );
    if (colorMatches) {
      for (const match of colorMatches) {
        const val = match.split(":")[1];
        const hex = extractColorFromValue(val);
        if (hex && !isNeutral(hex)) {
          colors.push({ hex, confidence: 0.5, source: "inline style" });
        }
      }
    }
  });

  if (colors.length > 0) {
    // Pick the highest confidence unique color as primary
    colors.sort((a, b) => b.confidence - a.confidence);
    result.primaryColor = {
      value: colors[0].hex,
      confidence: colors[0].confidence,
      source: colors[0].source,
    };
    // Find a different color for secondary, or darken primary
    const secondary = colors.find(
      (c) => c.hex !== colors[0].hex && c.confidence >= 0.4
    );
    if (secondary) {
      result.secondaryColor = {
        value: secondary.hex,
        confidence: secondary.confidence,
        source: secondary.source,
      };
    } else {
      result.secondaryColor = {
        value: darkenHex(colors[0].hex),
        confidence: colors[0].confidence * 0.7,
        source: "derived from primary",
      };
    }
  }

  // --- Business name ---
  // 1. JSON-LD LocalBusiness
  $('script[type="application/ld+json"]').each((_, el) => {
    if (result.businessName) return;
    try {
      const data = JSON.parse($(el).text());
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (
          item["@type"] === "LocalBusiness" ||
          item["@type"]?.includes?.("LocalBusiness")
        ) {
          if (item.name) {
            result.businessName = {
              value: item.name,
              confidence: 0.95,
              source: "JSON-LD LocalBusiness",
            };
          }
          if (item.telephone && !result.phone) {
            result.phone = {
              value: item.telephone,
              confidence: 0.95,
              source: "JSON-LD telephone",
            };
          }
        }
        // Also check Organization
        if (item["@type"] === "Organization" && item.name && !result.businessName) {
          result.businessName = {
            value: item.name,
            confidence: 0.85,
            source: "JSON-LD Organization",
          };
        }
      }
    } catch {
      // Invalid JSON-LD, skip
    }
  });

  // 2. og:site_name / og:title
  if (!result.businessName) {
    const ogSiteName = $('meta[property="og:site_name"]').attr("content");
    if (ogSiteName) {
      result.businessName = {
        value: ogSiteName.trim(),
        confidence: 0.8,
        source: "og:site_name",
      };
    }
  }
  if (!result.businessName) {
    const ogTitle = $('meta[property="og:title"]').attr("content");
    if (ogTitle) {
      result.businessName = {
        value: cleanTitle(ogTitle),
        confidence: 0.65,
        source: "og:title",
      };
    }
  }

  // 3. <title> tag
  if (!result.businessName) {
    const titleText = $("title").text().trim();
    if (titleText) {
      result.businessName = {
        value: cleanTitle(titleText),
        confidence: 0.5,
        source: "title tag",
      };
    }
  }

  // --- Phone ---
  if (!result.phone) {
    $('a[href^="tel:"]').each((_, el) => {
      if (result.phone) return;
      const tel = $(el).attr("href")?.replace("tel:", "").trim();
      if (tel) {
        result.phone = { value: tel, confidence: 0.85, source: "tel: link" };
      }
    });
  }

  // --- Google Review URL ---
  $("a[href]").each((_, el) => {
    if (result.googleReviewUrl) return;
    const href = $(el).attr("href") || "";
    if (
      href.includes("google.com/maps") ||
      href.includes("g.page") ||
      href.includes("search.google.com/local/writereview")
    ) {
      result.googleReviewUrl = {
        value: href,
        confidence: href.includes("writereview") ? 0.95 : 0.7,
        source: "google maps/review link",
      };
    }
  });

  return result;
}

// --- Utility functions ---

function resolveUrl(base: string, path: string): string {
  try {
    return new URL(path, base).href;
  } catch {
    return path;
  }
}

function cleanTitle(title: string): string {
  // Remove common suffixes like "| Home", "- Welcome", etc.
  return title
    .replace(/\s*[|\-–—]\s*(Home|Welcome|Official Site|Official Website).*$/i, "")
    .replace(/\s*[|\-–—]\s*$/, "")
    .trim();
}
