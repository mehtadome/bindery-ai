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
  "Location Number",
  "Building Number",
  "Street Address",
  "City",
  "State",
  "Zip Code",
  "County",
  "Construction Type",
  "Year Built",
  "Number of Stories",
  "Square Footage",
  "Roof Type",
  "Roof Age",
  "Heating Type",
  "Wiring Type",
  "Plumbing Type",
  "Building Value",
  "Business Personal Property",
  "Business Income Limit",
  "Extra Expense",
  "Occupancy",
  "Protection Class",
  "Fire District",
  "Sprinklered",
  "Alarm Type",
  "Distance to Fire Hydrant",
  "Distance to Fire Station",
  "Mortgagee Name",
  "Mortgagee Address",
  "Causes of Loss Form",
  "Coinsurance",
  "Deductible",
  "Valuation",
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
    case "ACORD 126": return "ACORD 126 — Commercial Property Section";
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
