# Bindery AI

AI-powered pipeline that ingests messy brokerage AMS exports and PDF documents to produce filled ACORD insurance forms.

## What it does

Commercial insurance CSRs spend hours re-keying account data from AMS systems into carrier applications and ACORD forms. Bindery AI automates that extraction: feed it an AMS CSV export and/or a declaration page PDF, and get back a filled ACORD form.

## How it works

```
Inputs (AMS CSV, PDF dec pages)
  → Ingestion       pdfplumber + pandas
  → Extraction      Claude API → canonical Account Schema JSON
  → Mapping         YAML config per form type
  → Form Fill       pypdf
  → Filled PDF + fill-rate report
```

The extraction layer is the only place AI logic lives. It produces a canonical Account Schema JSON regardless of input format. The mapping layer is pure config — adding a new form type means writing a new YAML file, not touching extraction code.

## Supported Forms

- ACORD 125 — Commercial Insurance Application
- ACORD 126 — Commercial General Liability Section
- ACORD 130 — Workers Compensation Application

## Setup

```bash
python -m venv .venv && source .venv/bin/activate
pip install pdfplumber pandas anthropic pypdf PyYAML
export ANTHROPIC_API_KEY=your_key_here
```

## Usage

```bash
python fill_form.py \
  --inputs data/ams_export.csv dec_page.pdf \
  --form acord125 \
  --output filled_acord125.pdf
```

## Sample Data

`data/ams_export.csv` — 4 synthetic commercial accounts (plumbing contractor, restaurant, auto parts retail, IT consulting) with realistic AMS360-style export data covering all fields needed for ACORD 125, 126, and 130.

## Tech Stack

| Layer | Library |
|-------|---------|
| PDF extraction | pdfplumber |
| CSV parsing | pandas |
| AI extraction | Anthropic Claude API |
| Form fill | pypdf |
| Mapping config | PyYAML |
| CLI | argparse |

## Web UI

A Next.js front-end lives at the repo root alongside the Python pipeline.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the UI. The page auto-updates as you edit `app/page.tsx`.

To deploy, use the [Vercel Platform](https://vercel.com/new) — see [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.
