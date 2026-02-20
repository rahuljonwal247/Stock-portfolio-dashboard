// app/components/SectorCards.tsx
"use client";
import GainBadge from "./GainBadge";
import { fmtInt } from "@/lib/formatters";
import type { SectorSummary } from "@/types/portfolio";

interface Props {
  sectors: SectorSummary[];
  totalInvestment: number;
}

export default function SectorCards({ sectors, totalInvestment }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {sectors.map((s) => (
        <div
          key={s.name}
          className="rounded-xl p-5 border transition-all duration-200 hover:scale-[1.01]"
          style={{
            background: "rgba(255,255,255,0.025)",
            borderColor: `${s.color}25`,
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div
                className="text-xs font-bold tracking-wider mb-0.5"
                style={{ color: s.color }}
              >
                {s.name.toUpperCase()}
              </div>
              <div className="text-xs" style={{ color: "#4f7ba3" }}>
                {s.stocks.length} stocks · {s.portfolioPct.toFixed(1)}% weight
              </div>
            </div>
            <GainBadge value={s.gainLoss} pct={s.gainLossPct} size="sm" />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <MetricBox label="INVESTED" value={`₹${fmtInt(s.totalInvestment)}`} />
            <MetricBox label="PRESENT VALUE" value={`₹${fmtInt(s.totalPresentValue)}`} />
          </div>

          {/* Portfolio Weight Bar */}
          <div>
            <div
              className="flex justify-between text-xs mb-1"
              style={{ color: "#4f7ba3" }}
            >
              <span>Portfolio allocation</span>
              <span>{s.portfolioPct.toFixed(1)}%</span>
            </div>
            <div
              className="rounded-full overflow-hidden"
              style={{ height: 4, background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(s.totalInvestment / totalInvestment) * 100}%`,
                  background: `linear-gradient(90deg, ${s.color}, ${s.accent})`,
                }}
              />
            </div>
          </div>

          {/* Stock list */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {s.stocks.map((stock) => {
              const isGain = stock.gainLoss >= 0;
              return (
                <span
                  key={stock.symbol}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: isGain ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
                    color: isGain ? "#34d399" : "#f87171",
                    border: `1px solid ${isGain ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
                    fontSize: 9,
                    fontWeight: 600,
                  }}
                >
                  {stock.name.length > 10 ? stock.name.slice(0, 10) + "…" : stock.name}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="text-xs mb-0.5 tracking-wider"
        style={{ color: "#4f7ba3", fontSize: 9 }}
      >
        {label}
      </div>
      <div className="text-sm font-semibold" style={{ color: "#c8d6ef" }}>
        {value}
      </div>
    </div>
  );
}
