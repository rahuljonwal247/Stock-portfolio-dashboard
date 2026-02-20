// app/components/KPICards.tsx
"use client";
import { fmtInt } from "@/lib/formatters";

interface Props {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPct: number;
  stockCount: number;
  sectorCount: number;
  isRefreshing: boolean;
}

export default function KPICards({
  totalInvestment,
  totalPresentValue,
  totalGainLoss,
  totalGainLossPct,
  stockCount,
  sectorCount,
  isRefreshing,
}: Props) {
  const isProfit = totalGainLoss >= 0;

  const cards = [
    {
      label: "TOTAL INVESTED",
      value: `₹${fmtInt(totalInvestment)}`,
      sub: `${stockCount} positions across ${sectorCount} sectors`,
      color: "#4f9cf9",
      icon: "📊",
    },
    {
      label: "PRESENT VALUE",
      value: `₹${fmtInt(totalPresentValue)}`,
      sub: isRefreshing ? "⟳ Refreshing..." : "Live market prices",
      color: "#a78bfa",
      icon: "💰",
    },
    {
      label: isProfit ? "TOTAL PROFIT" : "TOTAL LOSS",
      value: `₹${fmtInt(Math.abs(totalGainLoss))}`,
      sub: `${isProfit ? "+" : "-"}${Math.abs(totalGainLossPct).toFixed(2)}% overall`,
      color: isProfit ? "#34d399" : "#f87171",
      icon: isProfit ? "📈" : "📉",
    },
    {
      label: "PORTFOLIO XIRR",
      value: "~",
      sub: "Connect broker for XIRR",
      color: "#fbbf24",
      icon: "🎯",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-xl p-4 border transition-all duration-300"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: `${card.color}22`,
            animationDelay: `${i * 0.08}s`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs tracking-widest font-semibold"
              style={{ color: "#6b7fa3" }}
            >
              {card.label}
            </span>
            <span className="text-base">{card.icon}</span>
          </div>
          <div
            className="text-2xl font-bold mb-1 font-sans"
            style={{ color: card.color }}
          >
            {card.value}
          </div>
          <div className="text-xs" style={{ color: "#6b7fa3" }}>
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
