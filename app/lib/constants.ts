import type { AcordFormType } from "@/app/types";

export const ACORD_FORMS: AcordFormType[] = ["ACORD 125", "ACORD 126", "ACORD 130"];

export const ACORD_FORM_LABELS: Record<AcordFormType, string> = {
  "ACORD 125": "Commercial Insurance Application",
  "ACORD 126": "Commercial General Liability Section",
  "ACORD 130": "Workers Compensation Application",
};

export const HERO_STATS = [
  { value: "3", label: "ACORD Forms" },
  { value: "62", label: "Fields extracted" },
  { value: "4", label: "Sample accounts" },
  { value: "<30s", label: "Per account" },
] as const;

export const PIPELINE_STEPS = [
  { label: "Ingestion", sub: "CSV + PDF" },
  { label: "Extraction", sub: "Claude Haiku" },
  { label: "Mapping", sub: "YAML config" },
  { label: "Form Fill", sub: "pypdf" },
] as const;

export const FEATURES = [
  {
    title: "Extract",
    body: "Claude reads your AMS export and dec page PDFs and produces a canonical Account Schema JSON — regardless of how the source data is formatted.",
    icon: "⬇",
  },
  {
    title: "Map",
    body: "A YAML config per form type translates canonical schema keys to PDF field names. Adding a new form is a config change, not a code change.",
    icon: "⇄",
  },
  {
    title: "Fill",
    body: "pypdf writes extracted values into fillable PDF templates. Unfilled fields are flagged with a fill-rate report so producers know exactly what to review.",
    icon: "✓",
  },
] as const;
