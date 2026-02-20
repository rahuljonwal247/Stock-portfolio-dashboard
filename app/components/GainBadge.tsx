// app/components/GainBadge.tsx
"use client";
import { fmtInt, fmtPct } from "@/lib/formatters";

interface Props {
  value: number;
  pct: number;
  size?: "sm" | "md" | "lg";
  showAmount?: boolean;
}

export default function GainBadge({
  value,
  pct,
  size = "md",
  showAmount = true,
}: Props) {
  const isPos = value >= 0;
  const color = isPos ? "#34d399" : "#f87171";
  const bg = isPos ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)";
  const border = isPos ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)";

  const padding =
    size === "sm" ? "2px 8px" : size === "lg" ? "6px 14px" : "3px 10px";
  const fontSize = size === "sm" ? 10 : size === "lg" ? 14 : 11;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding,
        borderRadius: 6,
        fontSize,
        fontWeight: 600,
        background: bg,
        color,
        border: `1px solid ${border}`,
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {isPos ? "▲" : "▼"}
      {showAmount && ` ₹${fmtInt(Math.abs(value))}`}
      <span style={{ opacity: 0.75, marginLeft: 2 }}>
        ({Math.abs(pct).toFixed(1)}%)
      </span>
    </span>
  );
}
