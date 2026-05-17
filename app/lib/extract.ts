import type { AcordFormType, ExtractedField, FormExtractionResult } from "@/app/types";
import { getFieldsForForm, calculateFillRate } from "@/app/lib/acord-fields";

// parses Claude's buffered JSON response into FormExtractionResult[] — one per selected form
export function parseExtractionResponse(
  raw: string,
  formTypes: AcordFormType[]
): FormExtractionResult[] {
  let parsed: Record<string, Record<string, string | null>>;

  try {
    // strip markdown code fences if Claude wrapped the JSON despite instructions
    const cleaned = raw.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    // return empty results for all forms if JSON is unparseable
    return formTypes.map((formType) => emptyResult(formType));
  }

  return formTypes.map((formType) => {
    const formData = parsed[formType] ?? {};
    const fields = buildFieldResults(formData, formType);
    return { formType, fields, ...calculateFillRate(fields, formType) };
  });
}

// maps a form's raw key→value object to ExtractedField[], one entry per expected field
function buildFieldResults(
  formData: Record<string, string | null>,
  formType: AcordFormType
): ExtractedField[] {
  return getFieldsForForm(formType).map((fieldName) => {
    const raw = formData[fieldName];

    if (!raw) {
      return { fieldName, value: "", flagged: false };
    }

    // [REVIEW] prefix signals Claude found the value but flagged it for producer review
    const flagged = raw.startsWith("[REVIEW]");
    const value = flagged ? raw.replace("[REVIEW]", "").trim() : raw;

    return { fieldName, value, flagged, flagReason: flagged ? "Requires producer review" : undefined };
  });
}

function emptyResult(formType: AcordFormType): FormExtractionResult {
  return {
    formType,
    fields: [],
    fillRate: 0,
    totalFields: getFieldsForForm(formType).length,
    filledFields: 0,
    flaggedFields: 0,
  };
}
