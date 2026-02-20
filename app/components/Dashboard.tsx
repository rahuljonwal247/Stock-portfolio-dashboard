// app/components/Dashboard.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { usePortfolio } from "@/hooks/usePortfolio";
import KPICards from "./KPICards";
import SectorGroup from "./SectorGroup";
import SectorCards from "./SectorCards";
import PortfolioChart from "./PortfolioChart";
import GainBadge from "./GainBadge";
import { ALL_STOCKS, SECTOR_CONFIGS } from "@/data/portfolioConfig";
import { fmtInt } from "@/lib/formatters";

type Tab = "holdings" | "sectors" | "charts";

export default function Dashboard() {
  const { portfolio, isLoading, isRefreshing, error, refetch } = usePortfolio();
  const [activeTab, setActiveTab] = useState<Tab>("holdings");
  const [filter, setFilter] = useState("");
  const [flash, setFlash] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const prevDataRef = useRef<string>("");

  // Flash animation when data refreshes
  useEffect(() => {
    if (!portfolio) return;
    const key = JSON.stringify(portfolio.lastUpdated);
    if (prevDataRef.current && prevDataRef.current !== key) {
      setFlash(true);
      setTimeout(() => setFlash(false), 1200);
    }
    prevDataRef.current = key;
  }, [portfolio]);

  // Countdown timer to next refresh
  useEffect(() => {
    setCountdown(15);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) return 15;
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [portfolio?.lastUpdated]);

  const allStocks = portfolio?.sectors.flatMap((s) => s.stocks) ?? [];
  const filtered = filter.trim()
    ? allStocks.filter(
        (s) =>
          s.name.toLowerCase().includes(filter.toLowerCase()) ||
          s.symbol.toLowerCase().includes(filter.toLowerCase()) ||
          s.sector.toLowerCase().includes(filter.toLowerCase())
      )
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div
            className="text-4xl mb-4"
            style={{ animation: "spin 1.5s linear infinite", display: "inline-block" }}
          >
            ⟳
          </div>
          <div className="text-sm tracking-widest" style={{ color: "#4f9cf9" }}>
            LOADING PORTFOLIO...
          </div>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Ambient grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(79,156,249,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(79,156,249,0.035) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          zIndex: 0,
        }}
      />

      {/* Sticky Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-7 py-3"
        style={{
          background: "rgba(10,14,26,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(79,156,249,0.12)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="rounded-lg flex items-center justify-center text-white font-black text-lg"
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #4f9cf9, #7c3aed)",
            }}
          >
            P
          </div>
          <div>
            <div
              className="text-sm font-bold tracking-widest"
              style={{ color: "#e2ecff" }}
            >
              PRIYANSHU PORTFOLIO
            </div>
            <div
              className="text-xs tracking-widest hidden md:block"
              style={{ color: "#4f9cf9", fontSize: 9 }}
            >
              LIVE TRACKER · NSE/BSE · {ALL_STOCKS.length} POSITIONS
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          {error && (
            <div
              className="text-xs px-3 py-1 rounded-md"
              style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}
            >
              ⚠ API Error — Using fallback data
            </div>
          )}

          <div className="hidden md:block text-right">
            <div className="text-xs" style={{ color: "#4f7ba3", fontSize: 9 }}>
              NEXT REFRESH IN
            </div>
            <div className="text-xs font-bold" style={{ color: "#4f9cf9" }}>
              {countdown}s
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: "rgba(79,156,249,0.1)",
              border: "1px solid rgba(79,156,249,0.25)",
              color: "#4f9cf9",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {isRefreshing ? "⟳ Refreshing..." : "⟳ Refresh"}
          </button>

          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: "#34d399",
              boxShadow: "0 0 0 3px rgba(52,211,153,0.2)",
              animation: "pulse 2s infinite",
            }}
          />
        </div>
      </header>

      <main className="relative z-10 px-4 md:px-7 py-6 max-w-screen-2xl mx-auto">

        {/* KPI Cards */}
        {portfolio && (
          <KPICards
            totalInvestment={portfolio.totalInvestment}
            totalPresentValue={portfolio.totalPresentValue}
            totalGainLoss={portfolio.totalGainLoss}
            totalGainLossPct={portfolio.totalGainLossPct}
            stockCount={allStocks.length}
            sectorCount={portfolio.sectors.length}
            isRefreshing={isRefreshing}
          />
        )}

        {/* Search Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: "#4f7ba3" }}
            >
              🔍
            </span>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search stocks, symbols, sectors..."
              className="text-xs rounded-lg pl-8 pr-10 py-2 outline-none w-64 md:w-80"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(79,156,249,0.2)",
                color: "#c8d6ef",
                fontFamily: "inherit",
              }}
            />
            {filter && (
              <button
                onClick={() => setFilter("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer" }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 ml-auto">
            {(["holdings", "sectors", "charts"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="text-xs px-4 py-2 rounded-lg transition-all"
                style={{
                  fontFamily: "inherit",
                  letterSpacing: "0.08em",
                  color: activeTab === tab ? "#fff" : "#6b7fa3",
                  background:
                    activeTab === tab
                      ? "rgba(79,156,249,0.18)"
                      : "transparent",
                  border: `1px solid ${
                    activeTab === tab
                      ? "rgba(79,156,249,0.4)"
                      : "transparent"
                  }`,
                  cursor: "pointer",
                }}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Overlay */}
        {filter.trim() && filtered.length > 0 && (
          <div
            className="mb-5 rounded-xl overflow-hidden border"
            style={{
              background: "rgba(255,255,255,0.025)",
              borderColor: "rgba(79,156,249,0.2)",
            }}
          >
            <div
              className="px-4 py-2 text-xs border-b"
              style={{ color: "#4f7ba3", borderColor: "rgba(79,156,249,0.1)" }}
            >
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{filter}&rdquo;
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 11 }}>
                <tbody>
                  {filtered.map((s, i) => {
                    const isGain = s.gainLoss >= 0;
                    return (
                      <tr
                        key={`${s.sector}-${s.id}`}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.03)",
                          background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                        }}
                        className="hover:bg-white/5"
                      >
                        <td className="px-4 py-2.5">
                          <span className="font-semibold text-xs" style={{ color: "#dde8ff" }}>
                            {s.name}
                          </span>
                          <span
                            className="ml-2 text-xs"
                            style={{ color: s.sectorColor, fontSize: 9 }}
                          >
                            {s.sector.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs" style={{ color: "#6b8faa" }}>
                          {s.exchange}:{s.symbol}
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs" style={{ color: "#9ab0c8" }}>
                          Buy: ₹{fmtInt(s.purchasePrice)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="text-xs font-bold" style={{ color: "#fff" }}>
                            CMP: ₹{fmtInt(s.cmp)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span
                            className="text-xs font-semibold"
                            style={{ color: isGain ? "#34d399" : "#f87171" }}
                          >
                            {isGain ? "▲ +" : "▼ "}₹{fmtInt(Math.abs(s.gainLoss))}
                            <span className="ml-1 opacity-70">
                              ({Math.abs(s.gainLossPct).toFixed(1)}%)
                            </span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filter.trim() && filtered.length === 0 && (
          <div className="text-center py-12 text-xs" style={{ color: "#4f7ba3" }}>
            No stocks found matching &ldquo;{filter}&rdquo;
          </div>
        )}

        {/* Main Content */}
        {!filter.trim() && portfolio && (
          <>
            {activeTab === "holdings" && (
              <div className="flex flex-col gap-4">
                {portfolio.sectors.map((sector) => (
                  <SectorGroup
                    key={sector.name}
                    sector={sector}
                    totalInvestment={portfolio.totalInvestment}
                    flash={flash}
                    defaultOpen={true}
                  />
                ))}
              </div>
            )}

            {activeTab === "sectors" && (
              <SectorCards
                sectors={portfolio.sectors}
                totalInvestment={portfolio.totalInvestment}
              />
            )}

            {activeTab === "charts" && (
              <PortfolioChart sectors={portfolio.sectors} />
            )}
          </>
        )}

        {/* Totals Footer Row */}
        {portfolio && activeTab === "holdings" && !filter.trim() && (
          <div
            className="mt-4 rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-4 border"
            style={{
              background: "rgba(79,156,249,0.06)",
              borderColor: "rgba(79,156,249,0.2)",
            }}
          >
            <span className="text-xs font-bold tracking-widest" style={{ color: "#4f9cf9" }}>
              PORTFOLIO TOTAL — {allStocks.length} POSITIONS
            </span>
            <div className="flex items-center gap-6 text-xs">
              <div>
                <span style={{ color: "#4f7ba3" }}>Invested: </span>
                <span style={{ color: "#c8d6ef", fontWeight: 600 }}>
                  ₹{fmtInt(portfolio.totalInvestment)}
                </span>
              </div>
              <div>
                <span style={{ color: "#4f7ba3" }}>Present: </span>
                <span style={{ color: "#c8d6ef", fontWeight: 600 }}>
                  ₹{fmtInt(portfolio.totalPresentValue)}
                </span>
              </div>
              <GainBadge
                value={portfolio.totalGainLoss}
                pct={portfolio.totalGainLossPct}
                size="md"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className="mt-8 pt-4 flex flex-wrap justify-between gap-2 text-xs border-t"
          style={{ color: "#3d5268", borderColor: "rgba(79,156,249,0.07)", fontSize: 9 }}
        >
          <span>NSE/BSE DATA · UNOFFICIAL API · AUTO-REFRESHES EVERY 15s</span>
          <span>⚠ FOR INFORMATIONAL USE ONLY · NOT FINANCIAL ADVICE</span>
        </div>
      </main>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,0.02)}
        ::-webkit-scrollbar-thumb{background:rgba(79,156,249,0.25);border-radius:3px}
        input::placeholder{color:#3d5268}
      `}</style>
    </div>
  );
}
