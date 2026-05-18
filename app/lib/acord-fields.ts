import type { AcordFormType, ExtractedField } from "@/app/types";

export const ACORD_125_FIELDS: string[] = [
  "Named Insured",
  "Mailing Address",
  "City",
  "State",
  "Zip Code",
  "Phone Number",
  "Email",
  "Website",
  "FEIN/SSN",
  "NAICS Code",
  "SIC Code",
  "Business Type",
  "Nature of Business",
  "Years in Business",
  "Year Business Started",
  "Number of Employees Full Time",
  "Number of Employees Part Time",
  "Annual Gross Sales/Receipts",
  "Contact Name",
  "Contact Title",
  "Agency Name",
  "Agency Address",
  "Agency Phone",
  "Producer Name",
  "Producer Email",
  "Effective Date",
  "Expiration Date",
  "Policy Number",
  "Carrier Name",
  "Billing Plan",
  "Payment Plan",
  "Audit",
  "Prior Insurance Carrier",
  "Prior Policy Number",
  "Prior Premium",
  "Loss History - 3 Years",
  "Claims Description",
  "Additional Remarks",
];

export const ACORD_126_FIELDS: string[] = [
  "Named Insured",
  "Policy Number",
  "Effective Date",
  "Expiration Date",
  "Carrier",
  "Each Occurrence Limit",
  "General Aggregate Limit",
  "Products/Completed Operations Aggregate",
  "Personal and Advertising Injury Limit",
  "Medical Expense Limit",
  "Fire Damage Legal Liability",
  "Policy Form",
  "Limits Apply Per",
  "Deductible",
  "Premium",
  "Classification Description",
  "Classification Code",
  "Premium Basis",
  "Premium Basis Amount",
  "Subcontracted Work Percentage",
  "Subcontracted Work Dollar Amount",
  "Employee Benefits Liability",
  "EBL Deductible",
  "EBL Number of Employees",
  "EBL Retroactive Date",
  "Contractor Questionnaire - Plans/Specs for Others",
  "Contractor Questionnaire - Blasting/Explosives",
  "Contractor Questionnaire - Excavation/Underground",
  "Contractor Questionnaire - Subs Carry Lower Limits",
  "Contractor Questionnaire - Subs Work Without COI",
  "Contractor Questionnaire - Equipment Leased to Others",
  "Products - Install/Service/Demo",
  "Products - Foreign Products",
  "Products - Warranties/Hold Harmless",
  "Products - Recalled Products",
  "Products - Vendors Coverage",
  "Additional Insureds",
  "General Info - Hazardous Materials",
  "General Info - Watercraft",
  "General Info - Structural Alterations",
  "General Info - Joint Ventures",
];

export const ACORD_130_FIELDS: string[] = [
  "Named Insured",
  "Mailing Address",
  "City",
  "State",
  "Zip Code",
  "Policy Number",
  "Effective Date",
  "Expiration Date",
  "Description of Operations",
  "Classification Code",
  "Classification Description",
  "Annual Payroll",
  "Rate",
  "Estimated Premium",
  "State of Operations",
  "Governing Class",
  "Experience Mod Rate",
  "Experience Mod Effective Date",
  "Part 1 Employer Liability Limit Each Accident",
  "Part 1 Employer Liability Limit Disease Policy",
  "Part 1 Employer Liability Limit Disease Each",
  "NCCI Carrier Code",
  "Federal ID Number",
  "Sole Proprietor/Partner Included",
  "Officers Included/Excluded",
  "Subcontractor Costs",
  "Prior Carrier",
  "Prior Policy Number",
  "Prior Premium",
  "Claims History 3 Years",
  "Safety Programs",
  "OSHA Citations",
  "Drug Testing Program",
];

// returns the field list for a given form type — drives both the extraction prompt and fill-rate calc
export function getFieldsForForm(formType: AcordFormType): string[] {
  switch (formType) {
    case "ACORD 125": return ACORD_125_FIELDS;
    case "ACORD 126": return ACORD_126_FIELDS;
    case "ACORD 130": return ACORD_130_FIELDS;
  }
}

// returns the full human-readable form name for UI labels
export function getFormName(formType: AcordFormType): string {
  switch (formType) {
    case "ACORD 125": return "ACORD 125 — Commercial Insurance Application";
    case "ACORD 126": return "ACORD 126 — Commercial General Liability Section";
    case "ACORD 130": return "ACORD 130 — Workers' Compensation Application";
  }
}

// counts filled / flagged fields against the total expected for a form
export function calculateFillRate(
  fields: ExtractedField[],
  formType: AcordFormType
): { fillRate: number; totalFields: number; filledFields: number; flaggedFields: number } {
  const totalFields = getFieldsForForm(formType).length;
  const filledFields = fields.filter((f) => f.value && f.value.length > 0).length;
  const flaggedFields = fields.filter((f) => f.flagged).length;
  const fillRate = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  return { fillRate, totalFields, filledFields, flaggedFields };
}
