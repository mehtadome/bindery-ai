# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

Take-home MVP for a Cooper AI Sales Engineer interview. The goal: build a CLI tool that ingests brokerage account artifacts (AMS CSV exports, PDF dec pages) and outputs filled ACORD insurance forms (ACORD 125, 126, etc.).

This is a Python project. No code exists yet — see `cooper_ai_se_prep.md` for the full plan and `Sales Engineer - Take Home Assignment.pdf` for the assignment.

## Commands

```bash
# Install dependencies (once venv is set up)
pip install pdfplumber pandas anthropic pypdf PyYAML

# Run the CLI
python fill_form.py \
  --inputs dec_page.pdf ams_export.csv \
  --form acord125 \
  --output filled_acord125.pdf
```

Set `ANTHROPIC_API_KEY` in the environment before running.

## Architecture

Four-layer pipeline with a clean separation between intelligence and configuration:

```
Inputs (PDF/CSV) → Ingestion → Extraction (Claude) → Mapping (YAML) → Form Fill → Output PDF
```

**Ingestion Layer** (`ingestion.py`): `pdfplumber` for native PDFs, `pandas` for CSVs. Flags image-only PDFs as unsupported (no OCR in scope).

**Extraction Layer** (`extraction.py`): Single Claude API call with all ingested text. Returns a canonical Account Schema JSON (see `cooper_ai_se_prep.md` for the full schema). This is the only place AI logic lives.

**Mapping Layer** (`mappings/acord125.yaml`, etc.): YAML config files, one per form type, that map canonical schema keys → PDF field names. Adding a new form = writing a new YAML; no extraction logic changes.

**Form Fill Layer** (`form_fill.py`): `pypdf` writes to fillable PDF form fields. Unfilled fields are flagged to console with a fill-rate report (e.g., `38/42 fields filled, 4 flagged for review`).

**Entry point** (`fill_form.py`): `argparse` CLI that wires all four layers together.

## Key Design Decisions

- **Extraction is decoupled from mapping.** The canonical Account Schema is the contract between them. Never add form-specific logic into the extraction prompt.
- **Sensitive fields must be flagged, not silently filled.** Coverage limits, effective dates, and FEIN should surface in the console report when extracted from an ambiguous source.
- **No AMS write-back, no web UI, no multi-form routing in MVP.** Deliberate scope cuts — document them explicitly when presenting.
- **`pypdf` over `pdftk`** because pdftk requires a binary install; pypdf is pure Python and works in a clean venv.

## Canonical Account Schema

The extraction layer outputs this structure; the mapping layer reads from it:

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

## Mapping Config Format

```yaml
form: ACORD 125
pdf_template: templates/acord125_blank.pdf
field_map:
  named_insured: "NamedInsured1"
  fein: "FEIN"
  address.street: "MailingAddress"
  address.city: "City"
  address.state: "State"
  address.zip: "ZIP"
  effective_date: "PolicyEffDate"
  expiration_date: "PolicyExpDate"
  business_description: "DescriptionOfOperations"
  naics: "NAICSCode"
```

Dot notation (e.g., `address.city`) resolves nested schema keys.
