import { ACORDFormType, ExtractedField } from './types'

export const ACORD_125_FIELDS: string[] = [
  'Named Insured',
  'Mailing Address',
  'City',
  'State',
  'Zip Code',
  'Phone Number',
  'Email',
  'Website',
  'FEIN/SSN',
  'NAICS Code',
  'SIC Code',
  'Business Type',
  'Nature of Business',
  'Years in Business',
  'Year Business Started',
  'Number of Employees Full Time',
  'Number of Employees Part Time',
  'Annual Gross Sales/Receipts',
  'Contact Name',
  'Contact Title',
  'Agency Name',
  'Agency Address',
  'Agency Phone',
  'Producer Name',
  'Producer Email',
  'Effective Date',
  'Expiration Date',
  'Policy Number',
  'Carrier Name',
  'Billing Plan',
  'Payment Plan',
  'Audit',
  'Prior Insurance Carrier',
  'Prior Policy Number',
  'Prior Premium',
  'Loss History - 3 Years',
  'Claims Description',
  'Additional Remarks',
]

export const ACORD_126_FIELDS: string[] = [
  'Named Insured',
  'Policy Number',
  'Effective Date',
  'Expiration Date',
  'Location Number',
  'Building Number',
  'Street Address',
  'City',
  'State',
  'Zip Code',
  'County',
  'Construction Type',
  'Year Built',
  'Number of Stories',
  'Square Footage',
  'Roof Type',
  'Roof Age',
  'Heating Type',
  'Wiring Type',
  'Plumbing Type',
  'Building Value',
  'Business Personal Property',
  'Business Income Limit',
  'Extra Expense',
  'Occupancy',
  'Protection Class',
  'Fire District',
  'Sprinklered',
  'Alarm Type',
  'Distance to Fire Hydrant',
  'Distance to Fire Station',
  'Mortgagee Name',
  'Mortgagee Address',
  'Causes of Loss Form',
  'Coinsurance',
  'Deductible',
  'Valuation',
]

export const ACORD_130_FIELDS: string[] = [
  'Named Insured',
  'Mailing Address',
  'City',
  'State',
  'Zip Code',
  'Policy Number',
  'Effective Date',
  'Expiration Date',
  'Description of Operations',
  'Classification Code',
  'Classification Description',
  'Annual Payroll',
  'Rate',
  'Estimated Premium',
  'State of Operations',
  'Governing Class',
  'Experience Mod Rate',
  'Experience Mod Effective Date',
  'Part 1 Employer Liability Limit Each Accident',
  'Part 1 Employer Liability Limit Disease Policy',
  'Part 1 Employer Liability Limit Disease Each',
  'NCCI Carrier Code',
  'Federal ID Number',
  'Sole Proprietor/Partner Included',
  'Officers Included/Excluded',
  'Subcontractor Costs',
  'Prior Carrier',
  'Prior Policy Number',
  'Prior Premium',
  'Claims History 3 Years',
  'Safety Programs',
  'OSHA Citations',
  'Drug Testing Program',
]

export function getFieldsForForm(formType: ACORDFormType): string[] {
  switch (formType) {
    case '125':
      return ACORD_125_FIELDS
    case '126':
      return ACORD_126_FIELDS
    case '130':
      return ACORD_130_FIELDS
    default:
      return []
  }
}

export function getFormName(formType: ACORDFormType): string {
  switch (formType) {
    case '125':
      return 'ACORD 125 - Commercial Insurance Application'
    case '126':
      return 'ACORD 126 - Commercial Property Section'
    case '130':
      return "ACORD 130 - Workers' Compensation"
    default:
      return `ACORD ${formType}`
  }
}

export function parseExtractedFields(
  rawOutput: string,
  formType: ACORDFormType
): ExtractedField[] {
  const fields: ExtractedField[] = []
  const expectedFields = getFieldsForForm(formType)
  
  const lines = rawOutput.split('\n')
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue
    
    const fieldName = line.substring(0, colonIndex).trim()
    const value = line.substring(colonIndex + 1).trim()
    
    if (!fieldName || !value || value.toLowerCase() === 'n/a' || value === '-') continue
    
    const matchedField = expectedFields.find(
      f => f.toLowerCase() === fieldName.toLowerCase() ||
           fieldName.toLowerCase().includes(f.toLowerCase()) ||
           f.toLowerCase().includes(fieldName.toLowerCase())
    )
    
    if (matchedField) {
      const flagged = value.includes('[') || value.includes('unclear') || value.includes('not found')
      
      fields.push({
        fieldName: matchedField,
        value: value.replace(/\[.*?\]/g, '').trim(),
        confidence: flagged ? 'low' : value.length > 2 ? 'high' : 'medium',
        flagged,
        flagReason: flagged ? 'Value may need verification' : undefined,
      })
    }
  }
  
  return fields
}

export function calculateFillRate(
  fields: ExtractedField[],
  formType: ACORDFormType
): { fillRate: number; totalFields: number; filledFields: number; flaggedFields: number } {
  const totalFields = getFieldsForForm(formType).length
  const filledFields = fields.filter(f => f.value && f.value.length > 0).length
  const flaggedFields = fields.filter(f => f.flagged).length
  const fillRate = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0
  
  return { fillRate, totalFields, filledFields, flaggedFields }
}
