# Bindery AI

AI-powered pipeline that ingests commercial insurance AMS CSV exports and produces filled ACORD forms — live, field-by-field, via Claude Haiku.

## What it does

Commercial insurance CSRs spend hours re-keying account data from AMS systems into carrier applications and ACORD forms. Bindery AI automates that extraction: upload an AMS CSV export, pick an account, and watch Claude fill out ACORD 125, 126, and 130 fields in real time.

## How it works

```
AMS CSV upload
  → parseCSV          normalize headers (fuzzy match), extract AccountData
  → resolveAccounts   async Haiku fallback for rows with blank insuredName
  → /api/extract      Claude Haiku streams NDJSON — one {form, field, value} per line
  → SSE events        server emits each complete line as data: event
  → live log + grid   client parses events, logs each field, populates results panel
  → PDF export        jsPDF client-side download per form
```

## Supported Forms

- ACORD 125 — Commercial Insurance Application (38 fields)
- ACORD 126 — Commercial General Liability Section (41 fields)
- ACORD 130 — Workers Compensation Application (32 fields)

## Setup

```bash
npm install
cp .env.local.example .env.local   # add ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000/portal](http://localhost:3000/portal). Use the sample CSV download link on the upload step to grab `data/ams_export.csv`.

## Sample Data

`data/ams_export.csv` — 5 synthetic commercial accounts:
- **ACC-001** Acme Plumbing LLC — plumbing contractor, Houston TX (best for ACORD 126 CGL)
- **ACC-002** Mesa Verde Restaurant Inc — full-service restaurant, Denver CO
- **ACC-003** Sunrise Auto Parts Corp — retail auto parts, Miami FL
- **ACC-004** BluePath Technologies LLC — software/IT consulting, San Francisco CA
- **ACC-005** Harbor Point Logistics *(blank insuredName)* — triggers async Haiku resolution fallback

## Architecture

Visit [/architecture](http://localhost:3000/architecture) for T0 (MVP) and T1 (production) pipeline diagrams.

**T0 — current**: CSV upload → Claude Haiku NDJSON stream → SSE events → live field log → ACORD results → PDF export

**T1 — production**: Client Data Store (AMS/SFTP/S3) → extraction → broadcast to Client Data Store (write-back, data retention) + ACORD Platform (XML submission)

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | Next.js 16, App Router |
| AI | Vercel AI SDK v6, Claude Haiku (`claude-haiku-4-5-20251001`) |
| Streaming | NDJSON + Server-Sent Events |
| Styling | Tailwind v4, Framer Motion |
| PDF export | jsPDF (client-side) |
| Icons | lucide-react |
