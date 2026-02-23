// services/googleFinanceService.ts
import axios from "axios";

interface Fundamentals {
  pe: number | null;
  eps: number | null;
  marketCap: number | null;
}

function parseNumber(str: string): number | null {
  if (!str) return null;
  // Handle Indian number format and suffixes
  const cleaned = str
    .replace(/,/g, "")
    .replace(/₹/g, "")
    .replace(/\s/g, "")
    .trim();

  if (cleaned === "N/A" || cleaned === "-" || cleaned === "") return null;

  let multiplier = 1;
  let numStr = cleaned;

  if (cleaned.endsWith("T")) {
    multiplier = 1e12;
    numStr = cleaned.slice(0, -1);
  } else if (cleaned.endsWith("B")) {
    multiplier = 1e9;
    numStr = cleaned.slice(0, -1);
  } else if (cleaned.endsWith("M")) {
    multiplier = 1e6;
    numStr = cleaned.slice(0, -1);
  } else if (cleaned.endsWith("K")) {
    multiplier = 1e3;
    numStr = cleaned.slice(0, -1);
  }

  const num = parseFloat(numStr);
  return isNaN(num) ? null : num * multiplier;
}

export async function getFundamentals(
  symbol: string,
  exchange: "NSE" | "BSE" = "NSE"
): Promise<Fundamentals> {
  try {
    const url = `https://www.google.com/finance/quote/${symbol}:${exchange}`;

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 10000,
    });

    // Dynamic import cheerio
    const cheerio = await import("cheerio");
    const $ = cheerio.load(data);

    const stats: Record<string, string> = {};

    // Google Finance renders key statistics in labeled table rows
    $(".gyFHrc").each((_, el) => {
      const label = $(el).find(".mfs7Fc").text().trim();
      const value = $(el).find(".P6K39c").text().trim();
      if (label && value) {
        stats[label] = value;
      }
    });

    // Alternative selectors for different Google Finance layouts
    $('[data-attrid]').each((_, el) => {
      const label = $(el).find(".NprOob").text().trim();
      const value = $(el).find(".P6K39c, .YMlKec").text().trim();
      if (label && value) {
        stats[label] = value;
      }
    });

    return {
      pe: parseNumber(stats["P/E ratio"] ?? stats["PE ratio"] ?? ""),
      eps: parseNumber(stats["EPS"] ?? stats["EPS (TTM)"] ?? ""),
      marketCap: parseNumber(stats["Market cap"] ?? stats["Mkt cap"] ?? ""),
    };
  } catch (error) {
    console.error(`[Google Finance] Failed to fetch ${symbol}:`, error);
    return { pe: null, eps: null, marketCap: null };
  }
}

export async function getFundamentalsBatch(
  stocks: Array<{ symbol: string; exchange: "NSE" | "BSE" }>
): Promise<Record<string, Fundamentals>> {
  const results: Record<string, Fundamentals> = {};

  // Process in batches of 3 to avoid rate limiting
  const batchSize = 3;
  for (let i = 0; i < stocks.length; i += batchSize) {
    const batch = stocks.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map(async ({ symbol, exchange }) => {
        results[symbol] = await getFundamentals(symbol, exchange);
        // Small delay between requests
        await new Promise((r) => setTimeout(r, 300));
      })
    );
  }

  console.log("result",results);

  return results;
}
