export interface AccountData {
  id: string
  insuredName: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  phone?: string
  email?: string
  naicsCode?: string
  sicCode?: string
  businessType?: string
  yearsInBusiness?: string
  numberOfEmployees?: string
  annualRevenue?: string
  effectiveDate?: string
  expirationDate?: string
  policyNumber?: string
  carrier?: string
  premium?: string
  deductible?: string
  coverageDetails?: string
  rawData: Record<string, string>
}

export type ACORDFormType = '125' | '126' | '130'

export interface ExtractedField {
  fieldName: string
  value: string
  confidence?: 'high' | 'medium' | 'low'
  source?: string
  flagged?: boolean
  flagReason?: string
}

export interface FormExtractionResult {
  formType: ACORDFormType
  fields: ExtractedField[]
  fillRate: number
  totalFields: number
  filledFields: number
  flaggedFields: number
}

export interface ExtractionLogEntry {
  timestamp: Date
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  field?: string
}

export type WorkflowStep = 'upload' | 'select-account' | 'select-forms' | 'extracting' | 'results'

export interface WorkflowState {
  step: WorkflowStep
  csvData: AccountData[]
  selectedAccount: AccountData | null
  selectedForms: ACORDFormType[]
  extractionResults: FormExtractionResult[]
  extractionLog: ExtractionLogEntry[]
  isExtracting: boolean
}
