import type { AcordFormType, ExtractedField, FormExtractionResult } from "@/app/types";
import { getFieldsForForm, calculateFillRate } from "@/app/lib/acord-fields";

// parses one SSE data line from Claude into a single ExtractedField + which form it belongs to
export function parseNDJSONLine(
  line: string
): { formType: AcordFormType; field: ExtractedField } | null {
  try {
    const { form, field, value } = JSON.parse(line) as {
      form: AcordFormType;
      field: string;
      value: string | null;
    };

    if (!form || !field) return null;

    const raw = value ?? "";
    const flagged = raw.startsWith("[REVIEW]");
    const resolvedValue = flagged ? raw.replace("[REVIEW]", "").trim() : raw;

    return {
      formType: form,
      field: { fieldName: field, value: resolvedValue, flagged, flagReason: flagged ? "Requires producer review" : undefined },
    };
  } catch {
    return null;
  }
}

// initializes an empty FormExtractionResult for a form before fields start arriving
export function emptyResult(formType: AcordFormType): FormExtractionResult {
  return {
    formType,
    fields: [],
    fillRate: 0,
    totalFields: getFieldsForForm(formType).length,
    filledFields: 0,
    flaggedFields: 0,
  };
}

// recalculates fill rate after upserting a field — called by PortalShell on each SSE event
export function recalcFillRate(result: FormExtractionResult): FormExtractionResult {
  const { fillRate, filledFields, flaggedFields } = calculateFillRate(result.fields, result.formType);
  return { ...result, fillRate, filledFields, flaggedFields };
}
