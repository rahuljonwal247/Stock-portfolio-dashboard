// app/api/fundamentals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getFundamentals } from "@/services/googleFinanceService";
import { fetchWithCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const exchange = (searchParams.get("exchange") ?? "NSE") as "NSE" | "BSE";

  if (!symbol) {
    return NextResponse.json(
      { error: "symbol query parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Cache fundamentals for 5 minutes (they don't change frequently)
    const { value, isStale } = await fetchWithCache(
      `fundamentals:${symbol}:${exchange}`,
      () => getFundamentals(symbol, exchange)
    );

    return NextResponse.json(
      { symbol, exchange, ...value, isStale },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("[API/Fundamentals] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fundamentals", symbol },
      { status: 500 }
    );
  }
}
