# Mortgage & Savings Simulator — Frontend

A React TypeScript application for mortgage, savings, and overpayment simulation. Connects to the [Mortgage Simulation API](../mortgasimapi/) to produce detailed financial projections, interactive charts, and shareable links.

## Features

- **Multi-deal rate timeline** — configure multiple fixed-rate deal periods on a draggable visual timeline; gaps default to the SVR/variable rate
- **Multiple savings accounts** — track several accounts (ISA, SIPP, etc.) each with their own rate, contribution, and initial balance
- **Interactive overpayments** — click on the balance chart to add overpayments, drag to adjust timing
- **Real-time simulation** — form changes trigger an immediate debounced re-simulation with no submit button
- **Shareable links** — copy a base64-encoded URL that captures the full form state for sharing
- **CSV export** — download month-by-month results for spreadsheet analysis
- **Charts** — MUI X Charts visualisations: balance evolution, payment breakdown, net worth, interest comparison

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
```

Set `VITE_ENV=development` (default) to connect to a local API at `http://127.0.0.1:8000`, or `VITE_ENV=production` for `https://api.mortgasim.com/`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run type-check` | TypeScript type checking (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Prettier |

## Tech Stack

- **React 19 + TypeScript + Vite**
- **MUI** (Material UI) component library + **MUI X Charts**
- **React Hook Form + Zod** — form handling and validation
- **React Query** — server state / API calls
- **Zustand** — client state (overpayment store)
- **Axios** — HTTP client

## Project Structure

```
src/
├── components/
│   ├── MortgageForm.tsx      # Main input form with NumericField component
│   ├── DealTimeline.tsx      # Draggable multi-deal rate timeline
│   ├── MortgageCharts.tsx    # Chart visualisations
│   └── Footer.tsx
├── pages/
│   ├── MortgageSimulation.tsx  # Home page (loads from localStorage)
│   └── DynamicMortgagePage.tsx # Shared link page (loads from URL ?d= param)
├── services/
│   └── mortgageApi.ts        # API client + request transformer
├── store/
│   └── overpaymentStore.ts   # Zustand store for chart overpayments
├── types/
│   └── mortgage.ts           # API response types
├── utils/
│   ├── validation.ts         # Zod schema, defaults, localStorage persistence
│   └── urlParser.ts          # Base64 share-link encode/decode
└── config/                   # Environment-based API URL switching
```

## Deployment

Deployed on **Vercel**. The included `vercel.json` handles SPA routing. Set `VITE_ENV=production` in Vercel environment variables.

## License

Copyright (c) 2024 Romain Bossut. All Rights Reserved.
