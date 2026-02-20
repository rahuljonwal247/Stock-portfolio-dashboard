// types/portfolio.ts

export type SectorName =
  | "Financial Sector"
  | "Tech Sector"
  | "Consumer"
  | "Power"
  | "Pipe Sector"
  | "Others";

export interface Stock {
  id: number;
  name: string;
  symbol: string;
  exchange: "NSE" | "BSE";
  purchasePrice: number;
  qty: number;
  sector: SectorName;
  sectorColor: string;
  sectorAccent: string;
  pe: number | null;
  eps: number | null;
  marketCap: string;
  note: string | null;
}

export interface LiveStock extends Stock {
  cmp: number;
  investment: number;
  presentValue: number;
  gainLoss: number;
  gainLossPct: number;
  portfolioPct: number;
  isStale: boolean;
}

export interface SectorSummary {
  name: SectorName;
  color: string;
  accent: string;
  totalInvestment: number;
  totalPresentValue: number;
  gainLoss: number;
  gainLossPct: number;
  portfolioPct: number;
  stocks: LiveStock[];
}

export interface PortfolioResponse {
  sectors: SectorSummary[];
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPct: number;
  lastUpdated: string;
}

export interface CMPResponse {
  symbol: string;
  cmp: number | null;
  isStale: boolean;
}

export interface FundamentalsResponse {
  symbol: string;
  pe: number | null;
  eps: number | null;
  marketCap: number | null;
}
