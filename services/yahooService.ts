// // services/yahooService.ts
// import { BASE_PRICES } from "@/data/portfolioConfig";

// interface QuoteResult {
//   cmp: number | null;
//   isStale: boolean;
//   source: "live" | "fallback";
// }

// // Simulate realistic price fluctuation for demo / when Yahoo is blocked
// function simulateCMP(symbol: string, seed: number = Date.now()): number {
//   const base = BASE_PRICES[symbol] ?? 100;
//   // Small deterministic noise ±1.5%
//   const noise =
//     Math.sin((seed / 15000) * 2.1 + base * 0.001) * 0.008 +
//     Math.cos((seed / 15000) * 3.7 + base * 0.0007) * 0.007;
//   return parseFloat((base * (1 + noise)).toFixed(2));
// }

// export async function getCMPBatch(
//   symbols: string[]
// ): Promise<Record<string, QuoteResult>> {
//   const results: Record<string, QuoteResult> = {};
//   const now = Date.now();

//   // Try Yahoo Finance for NSE stocks
//   await Promise.allSettled(
//     symbols.map(async (symbol) => {
//       try {
//         // Dynamic import to avoid SSR issues
//         const yahooFinance = await import("yahoo-finance2").then(
//           (m) => m.default
//         );

//         // Try NSE suffix first, then BSE
//         let quote = null;
//         try {
//           quote = await yahooFinance.quote(`${symbol}.NS`, {}, { validateResult: false });
//         } catch {
//           try {
//             quote = await yahooFinance.quote(`${symbol}.BO`, {}, { validateResult: false });
//           } catch {
//             // Both failed
//           }
//         }

//         if (quote && quote.regularMarketPrice) {
//           results[symbol] = {
//             cmp: quote.regularMarketPrice,
//             isStale: false,
//             source: "live",
//           };
//         } else {
//           throw new Error("No price data");
//         }
//       } catch {
//         // Fallback to simulation
//         results[symbol] = {
//           cmp: simulateCMP(symbol, now),
//           isStale: true,
//           source: "fallback",
//         };
//       }
//     })
//   );

//   return results;
// }

// export async function getCMP(symbol: string): Promise<QuoteResult> {
//   const batch = await getCMPBatch([symbol]);
//   return (
//     batch[symbol] ?? {
//       cmp: simulateCMP(symbol),
//       isStale: true,
//       source: "fallback",
//     }
//   );
// }



// // services/yahooService.ts
// // IMPORTANT: yahoo-finance2 must only be loaded via require() inside function
// // bodies — never via a top-level import. Top-level imports cause webpack to
// // bundle the library's Deno test files, which break Next.js builds.

// import { BASE_PRICES } from "@/data/portfolioConfig";

// interface QuoteResult {
//   cmp: number | null;
//   isStale: boolean;
//   source: "live" | "fallback";
// }

// // ---------------------------------------------------------------------
// // LOCAL SIMULATION FUNCTION
// // ---------------------------------------------------------------------

// // Realistic simulation — changes every 15s, deterministic per symbol
// function simulateCMP(symbol: string): number {
//   const base = BASE_PRICES[symbol] ?? 100;
//   const t = Math.floor(Date.now() / 15000);

//   const noise =
//     Math.sin(t * 2.1 + base * 0.001) * 0.008 +
//     Math.cos(t * 3.7 + base * 0.0007) * 0.006;

//   return parseFloat((base * (1 + noise)).toFixed(2));
// }

// // Set PRICE_SOURCE=live in .env.local to attempt real Yahoo Finance calls
// const USE_LIVE = process.env.PRICE_SOURCE === "live";

// // ---------------------------------------------------------------------
// // BATCH CMP FETCHER
// // ---------------------------------------------------------------------

// export async function getCMPBatch(
//   symbols: string[]
// ): Promise<Record<string, QuoteResult>> {
//   const results: Record<string, QuoteResult> = {};

//   // -----------------------------------------------
//   // FALLBACK MODE (DEFAULT): No Yahoo requests
//   // -----------------------------------------------
//   if (!USE_LIVE) {
//     for (const symbol of symbols) {
//       results[symbol] = {
//         cmp: simulateCMP(symbol),
//         isStale: false,
//         source: "fallback",
//       };
//     }
//     return results;
//   }

//   // -----------------------------------------------
//   // LIVE MODE — Uses dynamic require
//   // -----------------------------------------------
//   await Promise.allSettled(
//     symbols.map(async (symbol) => {
//       try {
//         // Dynamic require — prevents webpack from bundling Deno files
//         // eslint-disable-next-line @typescript-eslint/no-var-requires
//         const yf = require("yahoo-finance2");
//         const yahooFinance = yf.default ?? yf;

//         let price: number | null = null;

//         // Try NSE, then BSE
//         for (const suffix of [".NS", ".BO"]) {
//           try {
//             const quote = await yahooFinance.quote(
//               `${symbol}${suffix}`,
//               {},
//               { validateResult: false }
//             );

//             if (quote?.regularMarketPrice) {
//               price = quote.regularMarketPrice;
//               break;
//             }
//           } catch {
//             // Try next suffix
//           }
//         }

//         if (price !== null) {
//           results[symbol] = {
//             cmp: price,
//             isStale: false,
//             source: "live",
//           };
//         } else {
//           throw new Error("No price returned");
//         }
//       } catch {
//         // Live failed → fallback simulated CMP
//         results[symbol] = {
//           cmp: simulateCMP(symbol),
//           isStale: true,
//           source: "fallback",
//         };
//       }
//     })
//   );

//   return results;
// }

// // ---------------------------------------------------------------------
// // SINGLE CMP WRAPPER
// // ---------------------------------------------------------------------

// export async function getCMP(symbol: string): Promise<QuoteResult> {
//   const batch = await getCMPBatch([symbol]);
//   return (
//     batch[symbol] ?? {
//       cmp: simulateCMP(symbol),
//       isStale: true,
//       source: "fallback",
//     }
//   );
// }



// // services/yahooService.ts
// import { BASE_PRICES } from "@/data/portfolioConfig";

// /** Your original return structure */
// interface BatchResult {
//   [symbol: string]: {
//     cmp: number;
//     isLive: boolean;
//     isStale: boolean;
//     error?: string;
//   };
// }

// /** NEW: Convert normal symbol → Yahoo format (.NS or .BO) */
// function toYahooSymbol(symbol: string, exchange: string): string {
//   if (!exchange) return symbol;

//   const ex = exchange.toUpperCase();

//   if (ex === "NSE") return `${symbol}.NS`;
//   if (ex === "BSE") return `${symbol}.BO`;

//   return symbol;
// }

// // --- Existing Lazy Loader ---
// function getYahooClient() {
//   try {
//     const YahooFinance = require("yahoo-finance2").default;
//     return new YahooFinance({ suppressNotices: ["yahooSurvey"] });
//   } catch (err) {
//     console.error("YahooFinance load failed:", err);
//     return null;
//   }
// }

// /** NEW: fetch one symbol based on NSE/BSE exchange */
// async function getSingleQuote(symbol: string, exchange: string) {
//   const yahooSymbol = toYahooSymbol(symbol, exchange); // ★ Apply mapping
//   const yahooFinance = getYahooClient();

//   if (!yahooFinance) {
//     return {
//       cmp: BASE_PRICES[symbol] ?? 0,
//       isLive: false,
//       isStale: true,
//       error: "Yahoo module load failed",
//     };
//   }

//   try {

 
//     const result = await yahooFinance.quote(yahooSymbol, {
//       fields: ["regularMarketPrice"],
//     });

//     const price = result?.regularMarketPrice;
//     if (!price) throw new Error("Missing regularMarketPrice");

//     return { cmp: price, isLive: true, isStale: false };
//   } catch (err: any) {
//     console.error(`❌ Live fetch failed for ${symbol} (${exchange})`, err.message);

//     return {
//       cmp: BASE_PRICES[symbol] ?? 0,
//       isLive: false,
//       isStale: true,
//       error: err.message,
//     };
//   }
// }

// /** NEW: Batch fetch using NSE/BSE per stock */
// export async function getCMPBatch(stocks: { symbol: string; exchange: string }[]) {
//   const results: BatchResult = {};

//   await Promise.all(
//     stocks.map(async (s) => {
//       results[s.symbol] = await getSingleQuote(s.symbol, s.exchange);
//     })
//   );

//   return results;
// }




// services/yahooService.ts
import { BASE_PRICES } from "@/data/portfolioConfig";

interface BatchResult {
  [symbol: string]: {
    cmp: number;
    isLive: boolean;
    isStale: boolean;
    error?: string;
  };
}

function toYahooSymbol(symbol: string, exchange: string): string {
  if (symbol.endsWith(".NS") || symbol.endsWith(".BO")) return symbol;
  const ex = exchange.toUpperCase();
  if (ex === "NSE") return `${symbol}.NS`;
  if (ex === "BSE") return `${symbol}.BO`;
  return symbol;
}

/**
 * Correct CJS pattern per official docs:
 *   const YahooFinance = require("yahoo-finance2").default
 *   const yahooFinance = new YahooFinance()
 *
 * Singleton — one instance reused for all requests.
 */
let _client: any | null = null;

function getYahooClient(): any | null {
  if (_client) return _client;
  try {
    const YahooFinance = require("yahoo-finance2").default;
    _client = new YahooFinance();
    return _client;
  } catch (err) {
    console.error("[yahooService] Failed to init yahoo-finance2:", err);
    return null;
  }
}

async function getSingleQuote(
  symbol: string,
  exchange: string
): Promise<{ cmp: number; isLive: boolean; isStale: boolean; error?: string }> {
  const yahooSymbol = toYahooSymbol(symbol, exchange);
  const yahooFinance = getYahooClient();

  if (!yahooFinance) {
    return {
      cmp: BASE_PRICES[symbol] ?? 0,
      isLive: false,
      isStale: true,
      error: "yahoo-finance2 failed to initialise",
    };
  }

  try {
    const result = await yahooFinance.quote(yahooSymbol);

    const price =
      result?.regularMarketPrice ??
      result?.postMarketPrice ??
      result?.preMarketPrice;

    if (typeof price !== "number" || isNaN(price)) {
      throw new Error(`No valid price returned (got: ${JSON.stringify(price)})`);
    }

    // console.log(`✅ ${yahooSymbol} → ₹${price}`);
    return { cmp: price, isLive: true, isStale: false };
  } catch (err: any) {
    const fallback = BASE_PRICES[symbol] ?? 0;
    console.error(
      `❌ Live fetch failed for ${yahooSymbol} — fallback ₹${fallback} | ${err.message}`
    );
    return {
      cmp: fallback,
      isLive: false,
      isStale: true,
      error: err.message,
    };
  }
}

export async function getCMPBatch(
  stocks: { symbol: string; exchange: string }[]
): Promise<BatchResult> {
  const results: BatchResult = {};
  await Promise.all(
    stocks.map(async (s) => {
      results[s.symbol] = await getSingleQuote(s.symbol, s.exchange);
    })
  );
  return results;
}