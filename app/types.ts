export type AcordFormType = "ACORD 125" | "ACORD 126" | "ACORD 130";

export type WorkflowStep = "upload" | "select-account" | "select-forms" | "extracting" | "results";

export interface AccountData {
  id: string;
  insuredName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  naicsCode?: string;
  sicCode?: string;
  businessType?: string;
  yearsInBusiness?: string;
  numberOfEmployees?: string;
  annualRevenue?: string;
  effectiveDate?: string;
  expirationDate?: string;
  policyNumber?: string;
  carrier?: string;
  premium?: string;
  deductible?: string;
  coverageDetails?: string;
  rawData: Record<string, string>;
}

export interface ExtractionLogEntry {
  timestamp: Date;
  type: "info" | "success" | "warning" | "error";
  message: string;
  field?: string;
}

export interface ExtractedField {
  fieldName: string;
  value: string;
  flagged?: boolean;
  flagReason?: string;
}

export interface FormExtractionResult {
  formType: AcordFormType;
  fields: ExtractedField[];
  fillRate: number;
  totalFields: number;
  filledFields: number;
  flaggedFields: number;
}
