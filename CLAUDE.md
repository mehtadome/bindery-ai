# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working With This User

- If the terminal rendering is corrupted/unreadable, write fix instructions to `~/Desktop/temp.txt` instead of terminal output.

## Project Context

Take-home MVP for a Cooper AI Sales Engineer interview. **Bindery AI** automates extraction of commercial insurance AMS CSV exports into filled ACORD forms (125, 126, 130) using Claude Haiku.

Two workstreams in the same repo:
- **Web app** (Next.js 16, App Router) — lives at the repo root (`app/`, `package.json`, etc.)
- **Python CLI** (planned, T1) — `fill_form.py`, `ingestion.py`, etc. will live at root alongside the web app

## Commands

```bash
# Web app
npm run dev          # start dev server on localhost:3000
npm run build        # production build
npm run lint         # ESLint

# Python CLI (T1 — not yet implemented)
pip install pdfplumber pandas anthropic pypdf PyYAML
python fill_form.py --inputs dec_page.pdf ams_export.csv --form acord125 --output filled_acord125.pdf
```

Set `ANTHROPIC_API_KEY` in `.env.local` before running the web app.

## Web App Architecture

```
app/
  api/
    extract/route.ts          # POST — NDJSON streaming via Claude Haiku, SSE response (text/event-stream)
    resolve-account/route.ts  # POST — generateText via Haiku, resolves 5 identity fields for pending rows
    sample-csv/route.ts       # GET — serves data/ams_export.csv for one-click portal download
  portal/                     # 5-step flow: upload → select-account → select-forms → extracting → results
    components/
      PortalShell.tsx         # step state machine; reads SSE events, upserts fields into results live
      UploadPanel.tsx         # drag-drop CSV zone + sample CSV download link
      AccountPicker.tsx       # account cards with pending/resolved/failed states
      FormSelector.tsx        # ACORD 125 / 126 / 130 checkboxes
      ExtractionLog.tsx       # streaming log — each field logged as SSE event arrives
      ResultsPanel.tsx        # per-form field grid (tabs locked 125→126→130), edit icon, PDF export
      StepIndicator.tsx       # breadcrumb
  architecture/               # T0 + T1 SVG diagrams (TierCard layout)
    components/
      ArchTopBar.tsx
      TierCard.tsx            # card with badge, diagram slot, arch decisions grid
      T0Diagram.tsx           # MVP pipeline SVG (5 nodes, NDJSON/SSE flow)
      T1Diagram.tsx           # production SVG (Client Data Store → broadcast output)
  components/                 # Navbar, HeroSection, PipelineCard, FeaturesSection
  lib/
    constants.ts              # ACORD form labels, pipeline steps, hero stats
    csv-parser.ts             # parseCSV, resolveAccounts (async Haiku fallback), formatCurrency/Date
    acord-fields.ts           # field lists for 125 / 126 (CGL) / 130, calculateFillRate
    extract.ts                # parseNDJSONLine, emptyResult, recalcFillRate
    generate-pdf.ts           # jsPDF export with text wrapping
  types.ts                    # WorkflowStep, AccountData, ExtractionLogEntry, FormExtractionResult
  globals.css                 # Tailwind v4 @theme inline, Bindery color tokens
```

**Theme tokens** (Tailwind v4, `globals.css`):
- `text-brown` / `bg-brown` → `#6b4226` (headings)
- `bg-red` / `text-red` → `#cc2200` (CTAs, active state)
- `text-muted` → `#6b7280`
- `border-border` → `#e5e7eb`

**AI SDK**: Vercel AI SDK v6 — use `maxOutputTokens` (not `maxTokens`). Model: `claude-haiku-4-5-20251001`.

**Streaming (Pattern C)**: Claude outputs one `{"form", "field", "value"}` per line (NDJSON). Server splits on `\n`, emits each complete line as `data: <line>\n\n` (SSE). Client parses `data:` events via `parseNDJSONLine`, logs each field live, upserts into `FormExtractionResult[]`. `maxOutputTokens: 8192` — 108 fields × ~18 tokens needs headroom.

## Python CLI Architecture (T1)

Four-layer pipeline:
```
Inputs (PDF/CSV) → Ingestion → Extraction (Claude) → Mapping (YAML) → Form Fill → Output PDF
```

- **Ingestion** (`ingestion.py`): pdfplumber for PDFs, pandas for CSVs
- **Extraction** (`extraction.py`): single Claude call → canonical Account Schema JSON
- **Mapping** (`mappings/acord125.yaml`, etc.): schema keys → ACORD PDF field names; adding a form = new YAML only
- **Form Fill** (`form_fill.py`): pypdf writes field values; console fill-rate report

## Canonical Account Schema

```json
{
  "named_insured": "", "dba": "",
  "address": { "street": "", "city": "", "state": "", "zip": "" },
  "fein": "", "naics": "", "sic": "",
  "business_description": "", "years_in_business": "",
  "effective_date": "", "expiration_date": "", "prior_premium": "",
  "coverages": [], "limits": {
    "each_occurrence": "", "general_aggregate": "",
    "products_aggregate": "", "personal_advertising": ""
  },
  "carriers": [], "producer_name": "", "agency_name": ""
}
```

## Key Design Decisions

- **Extraction decoupled from mapping.** Canonical schema is the contract. No form-specific logic in the extraction prompt.
- **Sensitive fields flagged, not silently filled.** Coverage limits, effective dates, FEIN surface in the fill-rate report when ambiguous.
- `pypdf` over `pdftk` — pure Python, no binary install required.
