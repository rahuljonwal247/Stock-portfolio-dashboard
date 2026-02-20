// app/components/StockRow.tsx
"use client";
import React from "react";
import { fmtPrice, fmtInt } from "@/lib/formatters";
import type { LiveStock } from "@/types/portfolio";

interface Props {
  stock: LiveStock;
  totalInvestment: number;
  flash: boolean;
  index: number;
}

const NoteTag = ({ note }: { note: string }) => {
  const isMust = note.toLowerCase().includes("must");
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.06em",
        padding: "2px 6px",
        borderRadius: 4,
        background: isMust ? "rgba(248,113,113,0.12)" : "rgba(251,191,36,0.12)",
        color: isMust ? "#f87171" : "#fbbf24",
        border: `1px solid ${isMust ? "rgba(248,113,113,0.3)" : "rgba(251,191,36,0.3)"}`,
        whiteSpace: "nowrap",
      }}
    >
      {note.toUpperCase()}
    </span>
  );
};

const StockRow = React.memo(function StockRow({
  stock: s,
  totalInvestment,
  flash,
  index,
}: Props) {
  const isGain = s.gainLoss >= 0;
  const gainColor = isGain ? "#34d399" : "#f87171";

  return (
    <tr
      style={{
        background:
          flash
            ? "rgba(79,156,249,0.06)"
            : index % 2 === 0
            ? "rgba(255,255,255,0.01)"
            : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.025)",
        transition: "background 0.6s ease",
      }}
      className="hover:bg-white/5"
    >
      {/* # */}
      <td className="px-3 py-2.5 text-xs" style={{ color: "#4f7ba3" }}>
        {s.id}
      </td>

      {/* Stock Name */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: s.sectorColor }}
          />
          <span
            className="text-xs font-semibold"
            style={{ color: "#dde8ff" }}
          >
            {s.name}
          </span>
          {s.isStale && (
            <span
              className="text-xs"
              title="Using cached/simulated data"
              style={{ color: "#fbbf24", fontSize: 9 }}
            >
              ⚠
            </span>
          )}
        </div>
      </td>

      {/* NSE/BSE */}
      <td className="px-3 py-2.5">
        <span
          className="text-xs font-mono"
          style={{ color: "#6b8faa" }}
        >
          {s.exchange}:{s.symbol}
        </span>
      </td>

      {/* Buy Price */}
      <td
        className="px-3 py-2.5 text-right text-xs tabular-nums"
        style={{ color: "#9ab0c8" }}
      >
        {fmtPrice(s.purchasePrice)}
      </td>

      {/* Qty */}
      <td
        className="px-3 py-2.5 text-right text-xs tabular-nums"
        style={{ color: "#9ab0c8" }}
      >
        {s.qty}
      </td>

      {/* Investment */}
      <td
        className="px-3 py-2.5 text-right text-xs tabular-nums"
        style={{ color: "#b0c4d8" }}
      >
        ₹{fmtInt(s.investment)}
      </td>

      {/* Portfolio % */}
      <td className="px-3 py-2.5 text-right">
        <div className="flex items-center justify-end gap-2">
          <div
            className="hidden lg:block rounded-full overflow-hidden"
            style={{ width: 36, height: 3, background: "rgba(255,255,255,0.07)" }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, s.portfolioPct * 6)}%`,
                background: s.sectorColor,
                borderRadius: 999,
              }}
            />
          </div>
          <span className="text-xs" style={{ color: "#8899b8" }}>
            {s.portfolioPct.toFixed(1)}%
          </span>
        </div>
      </td>

      {/* CMP - live price, highlighted */}
      <td className="px-3 py-2.5 text-right">
        <span
          className="text-xs font-bold tabular-nums font-sans"
          style={{
            color: "#ffffff",
            transition: "color 0.3s",
          }}
        >
          {fmtPrice(s.cmp)}
        </span>
      </td>

      {/* Present Value */}
      <td
        className="px-3 py-2.5 text-right text-xs tabular-nums font-semibold"
        style={{ color: "#c8d6ef" }}
      >
        ₹{fmtInt(s.presentValue)}
      </td>

      {/* Gain/Loss ₹ */}
      <td
        className="px-3 py-2.5 text-right text-xs tabular-nums font-semibold"
        style={{ color: gainColor }}
      >
        {isGain ? "+" : ""}₹{fmtInt(s.gainLoss)}
      </td>

      {/* Gain/Loss % */}
      <td className="px-3 py-2.5 text-right">
        <span
          style={{
            display: "inline-block",
            padding: "2px 7px",
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
            background: isGain
              ? "rgba(52,211,153,0.1)"
              : "rgba(248,113,113,0.1)",
            color: gainColor,
          }}
        >
          {isGain ? "▲" : "▼"}
          {Math.abs(s.gainLossPct).toFixed(1)}%
        </span>
      </td>

      {/* P/E */}
      <td
        className="px-3 py-2.5 text-right text-xs"
        style={{ color: "#8899b8" }}
      >
        {s.pe !== null ? fmtPrice(s.pe) : "—"}
      </td>

      {/* EPS / Latest Earnings */}
      <td
        className="px-3 py-2.5 text-right text-xs"
        style={{ color: "#8899b8" }}
      >
        {s.eps !== null ? fmtPrice(s.eps) : "—"}
      </td>

      {/* Status */}
      <td className="px-3 py-2.5">
        {s.note && <NoteTag note={s.note} />}
      </td>
    </tr>
  );
});

export default StockRow;
