import { AccountData } from './types'

export function parseCSV(csvText: string): AccountData[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim())
  if (lines.length < 2) return []
  
  const headers = parseCSVLine(lines[0])
  const accounts: AccountData[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === 0) continue
    
    const rawData: Record<string, string> = {}
    headers.forEach((header, index) => {
      rawData[header] = values[index] || ''
    })
    
    const account: AccountData = {
      id: `account-${i}`,
      insuredName: findFieldValue(rawData, ['insured name', 'named insured', 'name', 'company', 'insured', 'business name']),
      address: findFieldValue(rawData, ['address', 'street', 'mailing address', 'street address']),
      city: findFieldValue(rawData, ['city']),
      state: findFieldValue(rawData, ['state', 'st']),
      zipCode: findFieldValue(rawData, ['zip', 'zip code', 'postal code', 'zipcode']),
      phone: findFieldValue(rawData, ['phone', 'telephone', 'phone number', 'contact phone']),
      email: findFieldValue(rawData, ['email', 'e-mail', 'contact email']),
      naicsCode: findFieldValue(rawData, ['naics', 'naics code']),
      sicCode: findFieldValue(rawData, ['sic', 'sic code']),
      businessType: findFieldValue(rawData, ['business type', 'entity type', 'type']),
      yearsInBusiness: findFieldValue(rawData, ['years in business', 'years', 'years operating']),
      numberOfEmployees: findFieldValue(rawData, ['employees', 'number of employees', 'employee count', 'full time employees']),
      annualRevenue: findFieldValue(rawData, ['revenue', 'annual revenue', 'gross sales', 'annual gross sales']),
      effectiveDate: findFieldValue(rawData, ['effective date', 'eff date', 'policy effective']),
      expirationDate: findFieldValue(rawData, ['expiration date', 'exp date', 'policy expiration']),
      policyNumber: findFieldValue(rawData, ['policy number', 'policy no', 'policy #']),
      carrier: findFieldValue(rawData, ['carrier', 'insurance carrier', 'insurance company']),
      premium: findFieldValue(rawData, ['premium', 'annual premium', 'total premium']),
      deductible: findFieldValue(rawData, ['deductible', 'ded']),
      coverageDetails: findFieldValue(rawData, ['coverage', 'coverage details', 'limits', 'coverage limits']),
      rawData,
    }
    
    if (account.insuredName) {
      accounts.push(account)
    }
  }
  
  return accounts
}

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  values.push(current.trim())
  return values
}

function findFieldValue(data: Record<string, string>, possibleNames: string[]): string {
  for (const name of possibleNames) {
    const key = Object.keys(data).find(k => k.toLowerCase().includes(name.toLowerCase()))
    if (key && data[key]) {
      return data[key]
    }
  }
  return ''
}

export function formatCurrency(value: string): string {
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''))
  if (isNaN(num)) return value
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatDate(value: string): string {
  try {
    const date = new Date(value)
    if (isNaN(date.getTime())) return value
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return value
  }
}
