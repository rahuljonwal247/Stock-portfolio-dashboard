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





// services/yahooService.ts
// IMPORTANT: yahoo-finance2 must only be loaded via require() inside function
// bodies — never via a top-level import. Top-level imports cause webpack to
// bundle the library's Deno test files, which reference @std/testing/mock
// (a Deno-only package that doesn't exist in Node.js).

import { BASE_PRICES } from "@/data/portfolioConfig";

interface QuoteResult {
  cmp: number | null;
  isStale: boolean;
  source: "live" | "fallback";
}

// Realistic simulation — changes every 15s, deterministic per symbol
function simulateCMP(symbol: string): number {
  const base = BASE_PRICES[symbol] ?? 100;
  const t = Math.floor(Date.now() / 15000);
  const noise =
    Math.sin(t * 2.1 + base * 0.001) * 0.008 +
    Math.cos(t * 3.7 + base * 0.0007) * 0.006;
  return parseFloat((base * (1 + noise)).toFixed(2));
}

// Set PRICE_SOURCE=live in .env.local to attempt real Yahoo Finance calls
const USE_LIVE = process.env.PRICE_SOURCE === "live";

export async function getCMPBatch(
  symbols: string[]
): Promise<Record<string, QuoteResult>> {
  const results: Record<string, QuoteResult> = {};

  if (!USE_LIVE) {
    for (const symbol of symbols) {
      results[symbol] = { cmp: simulateCMP(symbol), isStale: false, source: "fallback" };
    }
    return results;
  }

  await Promise.allSettled(
    symbols.map(async (symbol) => {
      try {
        // require() inside the function body — webpack skips this at build time
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const yf = require("yahoo-finance2");
        const yahooFinance = yf.default ?? yf;

        let price: number | null = null;
        for (const suffix of [".NS", ".BO"]) {
          try {
            const quote = await yahooFinance.quote(
              `${symbol}${suffix}`,
              {},
              { validateResult: false }
            );
            if (quote?.regularMarketPrice) {
              price = quote.regularMarketPrice;
              break;
            }
          } catch {
            // try next suffix
          }
        }

        if (price !== null) {
          results[symbol] = { cmp: price, isStale: false, source: "live" };
        } else {
          throw new Error("No price returned");
        }
      } catch {
        results[symbol] = { cmp: simulateCMP(symbol), isStale: true, source: "fallback" };
      }
    })
  );

  return results;
}

export async function getCMP(symbol: string): Promise<QuoteResult> {
  const batch = await getCMPBatch([symbol]);
  return batch[symbol] ?? { cmp: simulateCMP(symbol), isStale: true, source: "fallback" };
}





// services/yahooService.ts
//
// yahoo-finance2's package.json "exports" field changes between versions.
// This service probes multiple known entry points at runtime and uses
// whichever one resolves — so it works regardless of the installed version.

// import { BASE_PRICES } from "@/data/portfolioConfig";

// interface QuoteResult {
//   cmp: number | null;
//   isStale: boolean;
//   source: "live" | "fallback";
// }

// // Deterministic simulation — shifts every 15 seconds
// function simulateCMP(symbol: string): number {
//   const base = BASE_PRICES[symbol] ?? 100;
//   const t = Math.floor(Date.now() / 15000);
//   const noise =
//     Math.sin(t * 2.1 + base * 0.001) * 0.008 +
//     Math.cos(t * 3.7 + base * 0.0007) * 0.006;
//   return parseFloat((base * (1 + noise)).toFixed(2));
// }

// // Numeric symbols = BSE codes, alphabetic = NSE codes
// function getYahooTickers(symbol: string): string[] {
//   return /^\d+$/.test(symbol)
//     ? [`${symbol}.BO`, `${symbol}.NS`]
//     : [`${symbol}.NS`, `${symbol}.BO`];
// }

// // Cache the working yahoo-finance2 module after first successful resolution
// let _yahooFinance: unknown = null;

// function loadYahooFinance(): unknown {
//   if (_yahooFinance) return _yahooFinance;

//   // Try every known entry point across all yahoo-finance2 versions
//   const candidates = [
//     "yahoo-finance2",                          // v2 ideal (if exports map allows ".")
//     "yahoo-finance2/dist/esm/src/index.js",    // v2 ESM build
//     "yahoo-finance2/dist/src/index.js",        // v2 CJS build (some versions)
//     "yahoo-finance2/src/index.js",             // older versions
//   ];

//   for (const path of candidates) {
//     try {
//       // eslint-disable-next-line @typescript-eslint/no-var-requires
//       const mod = require(path);
//       const yf = mod?.default ?? mod;
//       // Verify it has the .quote() method we need
//       if (typeof yf?.quote === "function") {
//         console.log(`[Yahoo] ✓ Loaded from: ${path}`);
//         _yahooFinance = yf;
//         return yf;
//       }
//     } catch {
//       // try next candidate
//     }
//   }

//   throw new Error(
//     "Could not load yahoo-finance2. Run: npm list yahoo-finance2 to check installation."
//   );
// }

// const USE_LIVE = process.env.PRICE_SOURCE === "live";

// export async function getCMPBatch(
//   symbols: string[]
// ): Promise<Record<string, QuoteResult>> {
//   const results: Record<string, QuoteResult> = {};

//   // --- Simulation mode ---
//   if (!USE_LIVE) {
//     for (const symbol of symbols) {
//       results[symbol] = { cmp: simulateCMP(symbol), isStale: false, source: "fallback" };
//     }
//     return results;
//   }

//   // --- Live mode ---
//   let yahooFinance: unknown;
//   try {
//     yahooFinance = loadYahooFinance();
//   } catch (err) {
//     console.error("[Yahoo] Failed to load library:", (err as Error).message);
//     console.error("[Yahoo] Falling back to simulation for all symbols");
//     for (const symbol of symbols) {
//       results[symbol] = { cmp: simulateCMP(symbol), isStale: true, source: "fallback" };
//     }
//     return results;
//   }

//   console.log(`[Yahoo] Fetching live prices for ${symbols.length} symbols...`);

//   const BATCH_SIZE = 5;
//   for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
//     const batch = symbols.slice(i, i + BATCH_SIZE);

//     await Promise.allSettled(
//       batch.map(async (symbol) => {
//         const tickers = getYahooTickers(symbol);
//         let fetched = false;

//         for (const ticker of tickers) {
//           try {
//             const quote = await (yahooFinance as { quote: Function }).quote(
//               ticker,
//               { fields: ["regularMarketPrice"] },
//               { validateResult: false }
//             );

//             if (quote?.regularMarketPrice && quote.regularMarketPrice > 0) {
//               console.log(`[Yahoo] ✓ ${symbol} (${ticker}) = ₹${quote.regularMarketPrice}`);
//               results[symbol] = { cmp: quote.regularMarketPrice, isStale: false, source: "live" };
//               fetched = true;
//               break;
//             }
//           } catch (err) {
//             console.warn(`[Yahoo] ✗ ${ticker}:`, (err as Error).message?.slice(0, 100));
//           }
//         }

//         if (!fetched) {
//           results[symbol] = { cmp: simulateCMP(symbol), isStale: true, source: "fallback" };
//         }
//       })
//     );

//     if (i + BATCH_SIZE < symbols.length) {
//       await new Promise((r) => setTimeout(r, 250));
//     }
//   }

//   const live = Object.values(results).filter((r) => r.source === "live").length;
//   console.log(`[Yahoo] Done — ${live}/${symbols.length} live, ${symbols.length - live} simulated`);
//   return results;
// }

// export async function getCMP(symbol: string): Promise<QuoteResult> {
//   const batch = await getCMPBatch([symbol]);
//   return batch[symbol] ?? { cmp: simulateCMP(symbol), isStale: true, source: "fallback" };
// }