# 📊  Portfolio Dashboard

A live NSE/BSE stock portfolio tracker built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Node.js** — with real-time price updates every 15 seconds.

---

## ✨ Features

- 📈 **Live CMP** via Yahoo Finance (with simulation fallback)
- 🔄 **Auto-refresh every 15 seconds** with animated flash on update
- 🟢🔴 **Color-coded Gain/Loss** — green for gains, red for losses
- 🗂️ **Sector grouping** with collapsible accordion tables
- 📊 **Portfolio charts** — Pie chart (allocation) + Bar chart (invested vs present)
- 🔍 **Search/filter** by stock name, symbol, or sector
- 📱 **Responsive** — works on mobile, tablet, and desktop
- ⚡ **Sortable columns** per sector table
- 🏷️ **Exit/Must Exit** status badges from your original data

---

## 🖥️ Prerequisites

Make sure the following are installed on your Mac:

| Tool | Check | Install |
|------|-------|---------|
| **Node.js** v18+ | `node -v` | https://nodejs.org |
| **npm** v9+ | `npm -v` | Comes with Node.js |
| **Git** | `git --version` | `xcode-select --install` |

> **Tip:** Use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions:
> ```bash
> curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
> nvm install 20
> nvm use 20
> ```

---

## 🚀 Setup — Step by Step

### Step 1: Get the project files

If you received this as a ZIP file:
```bash
# Unzip and enter the folder
unzip portfolio-dashboard.zip
cd portfolio-dashboard
```

Or if using Git:
```bash
git clone <your-repo-url>
cd portfolio-dashboard
```

---

### Step 2: Install dependencies

```bash
npm install
```

This installs all packages including:
- `next` — React framework
- `yahoo-finance2` — Stock price fetching
- `cheerio` — Google Finance scraping
- `recharts` — Charts
- `swr` — Data fetching with auto-refresh
- `node-cache` — Server-side caching

> ⏳ First install takes ~1–2 minutes. You'll see a progress bar.

---

### Step 3: Create environment file

```bash
cp .env.example .env.local
```

The default settings work out of the box. Open `.env.local` if you want to change anything:

```env
NEXT_PUBLIC_REFRESH_INTERVAL=15000   # Refresh every 15 seconds
PRICE_SOURCE=simulation              # Use "live" for Yahoo Finance scraping
```

---

### Step 4: Run the development server

```bash
npm run dev
```

You'll see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.1s
```

---

### Step 5: Open in your browser

```
http://localhost:3000
```

🎉 **That's it! Your portfolio dashboard is running.**

---

## 📸 What You'll See

```
┌─────────────────────────────────────────────────┐
│  P   PORTFOLIO         ⟳ Refresh  🟢  │
│     LIVE TRACKER · NSE/BSE · 23 POSITIONS       │
├─────────────────────────────────────────────────┤
│  📊 TOTAL INVESTED  💰 PRESENT   📈 PROFIT      │
│  ₹XX,XX,XXX        ₹XX,XX,XXX   ₹X,XX,XXX      │
├─────────────────────────────────────────────────┤
│  [HOLDINGS] [SECTORS] [CHARTS]   🔍 Search...   │
├─────────────────────────────────────────────────┤
│  ▼ FINANCIAL SECTOR    Invested/Present  ▲+X%   │
│    # | Stock | NSE/BSE | Buy | Qty | CMP | ...  │
│    1   HDFC Bank  HDFCBANK  1490  50  1700.15   │
│    2   Bajaj Finance ...                        │
├─────────────────────────────────────────────────┤
│  ▼ TECH SECTOR    ...                           │
│  ...                                            │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Available Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Check for code issues |

---

## 📁 Project Structure

```
portfolio-dashboard/
├── app/
│   ├── page.tsx                  ← Entry point
│   ├── layout.tsx                ← HTML wrapper + fonts
│   ├── globals.css               ← Base styles
│   ├── api/
│   │   ├── portfolio/route.ts    ← GET /api/portfolio (main endpoint)
│   │   ├── cmp/route.ts          ← GET /api/cmp?symbols=HDFCBANK,LTIM
│   │   └── fundamentals/route.ts ← GET /api/fundamentals?symbol=HDFCBANK
│   └── components/
│       ├── Dashboard.tsx         ← Main UI — tabs, search, layout
│       ├── KPICards.tsx          ← Summary cards (invested/present/profit)
│       ├── SectorGroup.tsx       ← Collapsible sector accordion + table
│       ├── StockRow.tsx          ← Single stock table row (memoized)
│       ├── SectorCards.tsx       ← Sector overview cards
│       ├── PortfolioChart.tsx    ← Pie + Bar charts
│       └── GainBadge.tsx         ← Green/red gain indicator
├── data/
│   └── portfolioConfig.ts        ← All 23 stocks, sectors, base prices
├── hooks/
│   └── usePortfolio.ts           ← SWR hook (auto-refresh every 15s)
├── lib/
│   ├── cache.ts                  ← LRU cache (15s TTL + stale fallback)
│   └── formatters.ts             ← Number/currency formatting
├── services/
│   ├── yahooService.ts           ← Yahoo Finance CMP fetching
│   └── googleFinanceService.ts   ← Google Finance P/E scraping
├── types/
│   └── portfolio.ts              ← TypeScript interfaces
├── .env.example                  ← Environment variable template
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 🔴 Live vs Simulation Mode

By default the app runs in **simulation mode** — prices fluctuate realistically based on the base prices from your Excel file. This works without any internet access and never gets rate-limited.

To try **live Yahoo Finance data**:

1. Open `.env.local`
2. Change `PRICE_SOURCE=simulation` to `PRICE_SOURCE=live`
3. Restart: `npm run dev`

> ⚠️ Yahoo Finance may block requests after many calls. The app automatically falls back to simulation if Yahoo fails, showing a ⚠ icon next to affected stocks.

---

## 🌐 Deploy to Vercel (Optional)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts — it auto-detects Next.js
```

Your dashboard will be live at `https://your-project.vercel.app` in ~60 seconds.

---

## ❓ Troubleshooting

**Port 3000 already in use:**
```bash
npm run dev -- -p 3001
# Then open http://localhost:3001
```

**Node version too old:**
```bash
node -v          # Must be v18 or higher
nvm install 20   # Install Node 20 via nvm
nvm use 20
npm run dev
```

**`npm install` fails:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Module not found errors:**
```bash
# Make sure you're in the right folder
ls package.json   # Should exist
npm install       # Re-run install
```

---

## 📊 API Endpoints

Once running, these REST endpoints are available:

| Endpoint | Description |
|----------|-------------|
| `GET /api/portfolio` | Full portfolio with all computed values |
| `GET /api/cmp?symbols=HDFCBANK,LTIM` | Live CMPs for given symbols |
| `GET /api/fundamentals?symbol=HDFCBANK&exchange=NSE` | P/E, EPS for a stock |

---

## 📄 License

MIT — free to use and modify for personal use.

---

*Built as part of the Dynamic Portfolio Dashboard case study.*
