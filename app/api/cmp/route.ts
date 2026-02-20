// app/api/cmp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCMPBatch } from "@/services/yahooService";
import { fetchWithCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols");

  if (!symbolsParam) {
    return NextResponse.json(
      { error: "symbols query parameter is required" },
      { status: 400 }
    );
  }

  const symbols = symbolsParam.split(",").filter(Boolean);

  if (symbols.length === 0) {
    return NextResponse.json({ error: "No valid symbols provided" }, { status: 400 });
  }

  if (symbols.length > 30) {
    return NextResponse.json({ error: "Maximum 30 symbols per request" }, { status: 400 });
  }

  try {
    const { value: cmpData, isStale } = await fetchWithCache(
      `cmp:${symbols.sort().join(",")}`,
      () => getCMPBatch(symbols)
    );

    return NextResponse.json(
      {
        data: cmpData,
        isStale,
        lastUpdated: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=5",
        },
      }
    );
  } catch (error) {
    console.error("[API/CMP] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch CMP data" },
      { status: 500 }
    );
  }
}
