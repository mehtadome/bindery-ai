import { streamText } from 'ai'
import { ACORDFormType, AccountData } from '@/lib/types'
import { getFieldsForForm, getFormName } from '@/lib/acord-fields'

export async function POST(req: Request) {
  const { account, formTypes } = (await req.json()) as {
    account: AccountData
    formTypes: ACORDFormType[]
  }

  const accountContext = formatAccountContext(account)
  const formsToExtract = formTypes.map((type) => ({
    type,
    name: getFormName(type),
    fields: getFieldsForForm(type),
  }))

  const systemPrompt = `You are an expert insurance data extraction assistant. Your job is to extract field values from AMS export data and map them to ACORD form fields.

IMPORTANT RULES:
1. Only extract values that are EXPLICITLY present in the source data
2. NEVER hallucinate or make up values that aren't in the source
3. If a field cannot be found, output "N/A" as the value
4. Parse coverage limit strings (e.g., "$1M each occurrence / $2M aggregate") into individual field values
5. Normalize date formats to MM/DD/YYYY
6. Normalize currency to numbers without symbols
7. If a value seems ambiguous or unclear, prefix with [REVIEW NEEDED]

Output format:
For each form, output the form name as a header, then list each field on its own line as:
FieldName: value

Be thorough but accurate. Extraction quality is more important than speed.`

  const userPrompt = `Extract data from the following AMS account export into ACORD form fields.

SOURCE DATA:
${accountContext}

FORMS TO FILL:
${formsToExtract
  .map(
    (form) => `
### ${form.name}
Fields to extract:
${form.fields.map((f) => `- ${f}`).join('\n')}
`
  )
  .join('\n')}

Begin extraction now. Output each form's fields in order.`

  const result = streamText({
    model: 'anthropic/claude-3-5-haiku-latest',
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    maxOutputTokens: 4096,
    temperature: 0.1,
  })

  return result.toTextStreamResponse()
}

function formatAccountContext(account: AccountData): string {
  const lines: string[] = []

  lines.push('=== PARSED FIELDS ===')
  if (account.insuredName) lines.push(`Insured Name: ${account.insuredName}`)
  if (account.address) lines.push(`Address: ${account.address}`)
  if (account.city) lines.push(`City: ${account.city}`)
  if (account.state) lines.push(`State: ${account.state}`)
  if (account.zipCode) lines.push(`Zip Code: ${account.zipCode}`)
  if (account.phone) lines.push(`Phone: ${account.phone}`)
  if (account.email) lines.push(`Email: ${account.email}`)
  if (account.naicsCode) lines.push(`NAICS Code: ${account.naicsCode}`)
  if (account.sicCode) lines.push(`SIC Code: ${account.sicCode}`)
  if (account.businessType) lines.push(`Business Type: ${account.businessType}`)
  if (account.yearsInBusiness) lines.push(`Years in Business: ${account.yearsInBusiness}`)
  if (account.numberOfEmployees) lines.push(`Number of Employees: ${account.numberOfEmployees}`)
  if (account.annualRevenue) lines.push(`Annual Revenue: ${account.annualRevenue}`)
  if (account.effectiveDate) lines.push(`Effective Date: ${account.effectiveDate}`)
  if (account.expirationDate) lines.push(`Expiration Date: ${account.expirationDate}`)
  if (account.policyNumber) lines.push(`Policy Number: ${account.policyNumber}`)
  if (account.carrier) lines.push(`Carrier: ${account.carrier}`)
  if (account.premium) lines.push(`Premium: ${account.premium}`)
  if (account.deductible) lines.push(`Deductible: ${account.deductible}`)
  if (account.coverageDetails) lines.push(`Coverage Details: ${account.coverageDetails}`)

  lines.push('\n=== RAW CSV DATA ===')
  Object.entries(account.rawData).forEach(([key, value]) => {
    if (value && value.trim()) {
      lines.push(`${key}: ${value}`)
    }
  })

  return lines.join('\n')
}
