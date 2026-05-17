# Bindery AI — Product Requirements Document

## Overview

Bindery AI is a demo web application that automates the extraction of commercial insurance account data from AMS CSV exports into filled ACORD forms (125, 126, 130). Built as part of the Cooper AI Sales Engineer take-home assignment, it demonstrates how Claude can replace the manual re-keying work CSRs perform during every renewal cycle.

---

## Problem Statement

Commercial insurance CSRs spend 45–90 minutes per account re-keying data from AMS exports and declaration pages into ACORD forms — work that repeats every renewal cycle and scales linearly with book size. The data is all there; it's just in the wrong shape and the wrong place.

**Root causes:**
- AMS systems use their own field naming conventions (not ACORD field names)
- Coverage data is stored as free-text blobs (e.g., `"$1M each occurrence / $2M aggregate"`)
- Different CSRs format the same fields differently (no standard delimiter)
- Multiple source documents (AMS CSV + dec page PDF) must be reconciled manually

---

## Target Users

**Primary — CSR / Account Manager at a mid-market commercial brokerage**
- Handles 10–20 renewal accounts per week during peak season
- Currently spends the majority of form-fill time on ACORD 125, 126, and 130
- Comfortable uploading a file and reviewing AI-generated output; not a developer

**Secondary — Cooper AI sales team**
- Uses Bindery as a pilot demonstration for prospective brokerage customers
- Needs a live, working demo that runs locally or on Vercel in under 60 seconds

---

## User Stories

| # | Story |
|---|-------|
| 1 | As a CSR, I can upload my AMS CSV export so that Bindery can read my account data without any manual re-formatting. |
| 2 | As a CSR, I can select which account from the CSV I want to extract, so I can work one account at a time. |
| 3 | As a CSR, I can choose which ACORD forms to generate (125, 126, 130) so I only fill what I need. |
| 4 | As a CSR, I can watch Claude extract the fields in real time so I can see what's being found and flag anything that looks wrong. |
| 5 | As a CSR, I can see a form-by-form breakdown of extracted fields so I know exactly what will be pre-filled. |
| 6 | As a CSR, I can see which fields are missing or flagged so I know what to complete manually before submission. |

---

## Features — MVP

| Feature | Status |
|---------|--------|
| CSV drag-drop upload | ✅ Scaffolded |
| Account picker from CSV rows | ✅ Scaffolded |
| ACORD form type selection (125 / 126 / 130) | ✅ Scaffolded |
| Claude Haiku streaming extraction | ✅ Scaffolded (API route wired) |
| Real-time extraction log | ✅ Scaffolded |
| 3-tab results view (one per form) | ✅ Scaffolded |
| Structured field parsing from LLM output | 🔜 Not yet implemented |
| Fill-rate report (X/Y fields populated) | 🔜 Not yet implemented |
| Missing / flagged field highlighting | 🔜 Not yet implemented |

---

## Out of Scope — MVP

- Actual PDF form filling (pypdf → downloadable ACORD PDF)
- Declaration page PDF ingestion (pdfplumber)
- Multi-account batch processing
- Confidence scoring on extracted values
- AMS write-back
- Carrier portal push
- Authentication / user accounts
- OCR for scanned/image-only PDFs

---

## T1 Roadmap

1. **Structured extraction** — Claude returns canonical Account Schema JSON (not free text); field parser maps JSON keys to ACORD field names via YAML config
2. **PDF form fill** — pypdf writes extracted values into blank ACORD PDF templates; downloadable output
3. **Dec page ingestion** — pdfplumber extracts text from uploaded PDF dec pages; merged with CSV data before extraction
4. **Fill-rate report** — console + UI report: `38/42 fields filled, 4 flagged for review`
5. **Confidence scoring** — Claude returns a `confidence` value per field; low-confidence fields surface in a review queue
6. **Multi-form routing** — single run produces all required forms for a full submission package

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Field fill rate on ACORD 125 from AMS CSV | ≥ 80% |
| Time from CSV upload to results | < 30 seconds |
| Hallucinated values (not traceable to source) | 0 |
| CSR time saved per account | 45+ minutes |

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Web framework | Next.js 16 (App Router) | Vercel-native, server components, streaming API routes |
| AI | Vercel AI SDK + Claude Haiku | `streamText` for real-time output; Haiku for speed + cost |
| Styling | Tailwind CSS v4 | CSS variable theming, no config file |
| Animation | Framer Motion 12 | `AnimatePresence` for step transitions, `whileInView` for scroll |
| PDF ingestion (T1) | pdfplumber | Best-in-class text extraction from native PDFs |
| Form fill (T1) | pypdf | Pure Python, no binary dependencies |
| Mapping config | PyYAML | Human-readable, version-controllable |
