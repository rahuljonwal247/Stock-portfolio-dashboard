// app/components/PortfolioChart.tsx
"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { SectorSummary } from "@/types/portfolio";
import { fmtInt } from "@/lib/formatters";

interface Props {
  sectors: SectorSummary[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { color: string; name: string; pct: string };
  }>;
}) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div
        className="rounded-lg p-3 border text-xs"
        style={{
          background: "#0d1525",
          borderColor: d.payload.color + "44",
          color: "#c8d6ef",
        }}
      >
        <div className="font-bold mb-1" style={{ color: d.payload.color }}>
          {d.payload.name}
        </div>
        <div>₹{fmtInt(d.value)}</div>
        <div style={{ color: "#6b7fa3" }}>{d.payload.pct}% of portfolio</div>
      </div>
    );
  }
  return null;
};

export default function PortfolioChart({ sectors }: Props) {
  const totalInvestment = sectors.reduce((s, x) => s + x.totalInvestment, 0);

  const pieData = sectors.map((s) => ({
    name: s.name,
    value: s.totalInvestment,
    color: s.color,
    pct: ((s.totalInvestment / totalInvestment) * 100).toFixed(1),
  }));

  const barData = sectors.map((s) => ({
    name: s.name.replace(" Sector", "").replace("Financial", "Fin."),
    invested: Math.round(s.totalInvestment),
    present: Math.round(s.totalPresentValue),
    color: s.color,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <div
        className="rounded-xl p-5 border"
        style={{
          background: "rgba(255,255,255,0.025)",
          borderColor: "rgba(79,156,249,0.12)",
        }}
      >
        <h3
          className="text-xs font-bold tracking-wider mb-4"
          style={{ color: "#6b7fa3" }}
        >
          PORTFOLIO ALLOCATION
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="grid grid-cols-2 gap-1.5 mt-3">
          {pieData.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <div
                className="rounded-sm flex-shrink-0"
                style={{ width: 8, height: 8, background: d.color }}
              />
              <span className="text-xs truncate" style={{ color: "#8899b8", fontSize: 10 }}>
                {d.name} ({d.pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart - Invested vs Present Value by Sector */}
      <div
        className="rounded-xl p-5 border"
        style={{
          background: "rgba(255,255,255,0.025)",
          borderColor: "rgba(79,156,249,0.12)",
        }}
      >
        <h3
          className="text-xs font-bold tracking-wider mb-4"
          style={{ color: "#6b7fa3" }}
        >
          INVESTED vs PRESENT VALUE BY SECTOR
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData} barGap={2}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "#4f7ba3", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#4f7ba3", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              formatter={(value: number) => [`₹${fmtInt(value)}`, ""]}
              contentStyle={{
                background: "#0d1525",
                border: "1px solid rgba(79,156,249,0.2)",
                borderRadius: 8,
                fontSize: 11,
                color: "#c8d6ef",
              }}
            />
            <Bar dataKey="invested" fill="rgba(79,156,249,0.5)" name="Invested" radius={[3, 3, 0, 0]} />
            <Bar dataKey="present" fill="rgba(167,139,250,0.6)" name="Present" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: "rgba(79,156,249,0.6)" }} />
            <span className="text-xs" style={{ color: "#6b7fa3", fontSize: 10 }}>Invested</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: "rgba(167,139,250,0.7)" }} />
            <span className="text-xs" style={{ color: "#6b7fa3", fontSize: 10 }}>Present Value</span>
          </div>
        </div>
      </div>
    </div>
  );
}
