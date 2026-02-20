// app/api/portfolio/route.ts
import { NextResponse } from "next/server";
import { getCMPBatch } from "@/services/yahooService";
import { fetchWithCache } from "@/lib/cache";
import { ALL_STOCKS, SECTOR_CONFIGS } from "@/data/portfolioConfig";
import type { LiveStock, SectorSummary, PortfolioResponse } from "@/types/portfolio";

export async function GET() {
  try {
    const symbols = ALL_STOCKS.map((s) => s.symbol);

    // Fetch all CMPs in one batch
    const { value: cmpData } = await fetchWithCache(
      `portfolio:all`,
      () => getCMPBatch(symbols)
    );

    // Compute live values for each stock
    const liveStocks: LiveStock[] = ALL_STOCKS.map((stock) => {
      const quote = cmpData[stock.symbol];
      const cmp = quote?.cmp ?? stock.purchasePrice; // fallback to purchase price
      const investment = stock.purchasePrice * stock.qty;
      const presentValue = cmp * stock.qty;
      const gainLoss = presentValue - investment;
      const gainLossPct = investment > 0 ? (gainLoss / investment) * 100 : 0;

      return {
        ...stock,
        cmp,
        investment,
        presentValue,
        gainLoss,
        gainLossPct,
        portfolioPct: 0, // Calculated after total is known
        isStale: quote?.isStale ?? false,
      };
    });

    const totalInvestment = liveStocks.reduce((sum, s) => sum + s.investment, 0);
    const totalPresentValue = liveStocks.reduce((sum, s) => sum + s.presentValue, 0);

    // Add portfolio percentage
    const enrichedStocks = liveStocks.map((s) => ({
      ...s,
      portfolioPct: totalInvestment > 0 ? (s.investment / totalInvestment) * 100 : 0,
    }));

    // Group by sector
    const sectors: SectorSummary[] = SECTOR_CONFIGS.map((sectorConfig) => {
      const sectorStocks = enrichedStocks.filter((s) => s.sector === sectorConfig.name);
      const totalInv = sectorStocks.reduce((sum, s) => sum + s.investment, 0);
      const totalPV = sectorStocks.reduce((sum, s) => sum + s.presentValue, 0);
      const gl = totalPV - totalInv;

      return {
        name: sectorConfig.name,
        color: sectorConfig.color,
        accent: sectorConfig.accent,
        totalInvestment: totalInv,
        totalPresentValue: totalPV,
        gainLoss: gl,
        gainLossPct: totalInv > 0 ? (gl / totalInv) * 100 : 0,
        portfolioPct: totalInvestment > 0 ? (totalInv / totalInvestment) * 100 : 0,
        stocks: sectorStocks,
      };
    });

    const response: PortfolioResponse = {
      sectors,
      totalInvestment,
      totalPresentValue,
      totalGainLoss: totalPresentValue - totalInvestment,
      totalGainLossPct:
        totalInvestment > 0
          ? ((totalPresentValue - totalInvestment) / totalInvestment) * 100
          : 0,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=5",
      },
    });
  } catch (error) {
    console.error("[API/Portfolio] Error:", error);
    return NextResponse.json(
      { error: "Failed to compute portfolio" },
      { status: 500 }
    );
  }
}
