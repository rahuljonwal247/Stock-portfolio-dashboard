// app/components/SectorGroup.tsx
"use client";
import { useState, useMemo } from "react";
import StockRow from "./StockRow";
import GainBadge from "./GainBadge";
import { fmtInt } from "@/lib/formatters";
import type { SectorSummary } from "@/types/portfolio";

interface Props {
  sector: SectorSummary;
  totalInvestment: number;
  flash: boolean;
  defaultOpen?: boolean;
}

const COLUMNS = [
  { label: "#", align: "left" as const, sortKey: "id" },
  { label: "STOCK", align: "left" as const, sortKey: "name" },
  { label: "NSE/BSE", align: "left" as const, sortKey: "symbol" },
  { label: "BUY ₹", align: "right" as const, sortKey: "purchasePrice" },
  { label: "QTY", align: "right" as const, sortKey: "qty" },
  { label: "INVESTED", align: "right" as const, sortKey: "investment" },
  { label: "WEIGHT", align: "right" as const, sortKey: "portfolioPct" },
  { label: "CMP ₹", align: "right" as const, sortKey: "cmp" },
  { label: "PRESENT VAL", align: "right" as const, sortKey: "presentValue" },
  { label: "GAIN/LOSS", align: "right" as const, sortKey: "gainLoss" },
  { label: "G/L %", align: "right" as const, sortKey: "gainLossPct" },
  { label: "P/E", align: "right" as const, sortKey: "pe" },
  { label: "EPS", align: "right" as const, sortKey: "eps" },
  { label: "STATUS", align: "left" as const, sortKey: null },
];

export default function SectorGroup({
  sector,
  totalInvestment,
  flash,
  defaultOpen = true,
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sortedStocks = useMemo(() => {
    if (!sortKey) return sector.stocks;
    return [...sector.stocks].sort((a, b) => {
      const va = (a as Record<string, unknown>)[sortKey] as number ?? -Infinity;
      const vb = (b as Record<string, unknown>)[sortKey] as number ?? -Infinity;
      return sortDir === "asc" ? va - vb : vb - va;
    });
  }, [sector.stocks, sortKey, sortDir]);

  const handleSort = (key: string | null) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{
        borderColor: `${sector.color}22`,
        background: "rgba(255,255,255,0.015)",
      }}
    >
      {/* Sector Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={() => setIsOpen((o) => !o)}
        style={{
          background: `linear-gradient(90deg, ${sector.color}14, transparent)`,
          borderBottom: isOpen ? `1px solid ${sector.color}18` : "none",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="rounded-sm flex-shrink-0"
            style={{ width: 3, height: 22, background: sector.color }}
          />
          <div>
            <span
              className="text-xs font-bold tracking-wider"
              style={{ color: sector.color }}
            >
              {sector.name.toUpperCase()}
            </span>
            <span
              className="text-xs ml-3"
              style={{ color: "#4f7ba3" }}
            >
              {sector.stocks.length} stocks ·{" "}
              {sector.portfolioPct.toFixed(1)}% of portfolio
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="text-right">
              <div style={{ color: "#4f7ba3", fontSize: 9, letterSpacing: "0.08em" }}>
                INVESTED
              </div>
              <div style={{ color: "#b0c4d8" }}>₹{fmtInt(sector.totalInvestment)}</div>
            </div>
            <div className="text-right">
              <div style={{ color: "#4f7ba3", fontSize: 9, letterSpacing: "0.08em" }}>
                PRESENT
              </div>
              <div style={{ color: "#b0c4d8" }}>₹{fmtInt(sector.totalPresentValue)}</div>
            </div>
          </div>
          <GainBadge value={sector.gainLoss} pct={sector.gainLossPct} size="sm" />
          <span style={{ color: "#4f7ba3", fontSize: 11 }}>
            {isOpen ? "▼" : "▶"}
          </span>
        </div>
      </div>

      {/* Stock Table */}
      {isOpen && (
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.25)" }}>
                {COLUMNS.map((col) => (
                  <th
                    key={col.label}
                    className={col.sortKey ? "cursor-pointer hover:bg-white/5" : ""}
                    onClick={() => handleSort(col.sortKey)}
                    style={{
                      padding: "8px 12px",
                      textAlign: col.align,
                      color: sortKey === col.sortKey ? sector.color : "#4f7ba3",
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      borderBottom: `1px solid ${sector.color}15`,
                      whiteSpace: "nowrap",
                      userSelect: "none",
                    }}
                  >
                    {col.label}
                    {col.sortKey && (
                      <span className="ml-1" style={{ opacity: sortKey === col.sortKey ? 1 : 0.3 }}>
                        {sortKey === col.sortKey
                          ? sortDir === "asc" ? "↑" : "↓"
                          : "⇅"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedStocks.map((stock, i) => (
                <StockRow
                  key={`${stock.sector}-${stock.id}`}
                  stock={stock}
                  totalInvestment={totalInvestment}
                  flash={flash}
                  index={i}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
