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
  api/extract/route.ts     # POST — streamText via Claude Haiku
  portal/                  # 3-step flow: upload → run → results
    components/
      PortalShell.tsx      # step state machine (upload/run/results)
      UploadPanel.tsx      # drag-drop CSV zone
      RunPanel.tsx         # account picker, form checkboxes, streaming log
      ResultsPanel.tsx     # 3-tab view (ACORD 125 / 126 / 130)
      StepIndicator.tsx    # breadcrumb
  architecture/            # static diagram page
  components/              # Navbar, HeroSection, PipelineCard, FeaturesSection
  lib/constants.ts         # ACORD form labels, pipeline steps, hero stats
  types.ts                 # AcordFormType, Step, CsvRow, ExtractionRun
  globals.css              # Tailwind v4 @theme inline, Bindery color tokens
```

**Theme tokens** (Tailwind v4, `globals.css`):
- `text-brown` / `bg-brown` → `#6b4226` (headings)
- `bg-red` / `text-red` → `#cc2200` (CTAs, active state)
- `text-muted` → `#6b7280`
- `border-border` → `#e5e7eb`

**AI SDK**: Vercel AI SDK v6 — use `maxOutputTokens` (not `maxTokens`), `toTextStreamResponse()` (not `toDataStreamResponse()`). Model: `claude-haiku-4-5-20251001`.

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
