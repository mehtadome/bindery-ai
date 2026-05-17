"use client";

import type { AccountData } from "@/app/types";

export function parseCSV(csvText: string): AccountData[] {
  // handle both Windows (\r\n) and Unix (\n) line endings, drop blank lines
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const accounts: AccountData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    // zip headers + values so every column is preserved, even unrecognized ones
    const rawData: Record<string, string> = {};
    headers.forEach((header, index) => {
      rawData[header] = values[index] || "";
    });

    const account: AccountData = {
      id: `account-${i}`,
      insuredName: findFieldValue(rawData, ["insured name", "named insured", "insuredname"]),
      address:         findFieldValue(rawData, ["address", "street", "mailing address", "mailaddress"]),
      city:            findFieldValue(rawData, ["city", "mailcity"]),
      state:           findFieldValue(rawData, ["state", "mailstate", "st"]),
      zipCode:         findFieldValue(rawData, ["zip", "zipcode", "zip code", "mailzip", "postal code"]),
      phone:           findFieldValue(rawData, ["phone", "telephone", "phone number", "contactphone"]),
      email:           findFieldValue(rawData, ["email", "e-mail", "contact email"]),
      naicsCode:       findFieldValue(rawData, ["naics", "naics code", "naicscode"]),
      sicCode:         findFieldValue(rawData, ["sic", "sic code", "siccode"]),
      businessType:    findFieldValue(rawData, ["business type", "entity type", "entitytype"]),
      yearsInBusiness: findFieldValue(rawData, ["years in business", "yearsinbusiness", "years operating"]),
      numberOfEmployees: findFieldValue(rawData, ["employees", "number of employees", "fulltimeemployees"]),
      annualRevenue:   findFieldValue(rawData, ["revenue", "annual revenue", "gross sales", "annualrevenue"]),
      effectiveDate:   findFieldValue(rawData, ["effective date", "effdate", "policy effective"]),
      expirationDate:  findFieldValue(rawData, ["expiration date", "expdate", "policy expiration"]),
      policyNumber:    findFieldValue(rawData, ["policy number", "policy no", "policynumber"]),
      carrier:         findFieldValue(rawData, ["carrier", "insurance carrier", "insurancecarrier"]),
      premium:         findFieldValue(rawData, ["premium", "annual premium", "totalpremium"]),
      deductible:      findFieldValue(rawData, ["deductible", "ded"]),
      coverageDetails: findFieldValue(rawData, ["coverage", "coverage details", "gl_limits", "limits"]),
      rawData,
    };

    // skip rows where no insured name is found — blank rows, malformed lines
    if (account.insuredName) accounts.push(account);
  }

  return accounts;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      // "" inside a quoted field is an escaped quote — add one literal " and skip ahead
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      // comma outside quotes = field boundary
      values.push(current.trim()); current = "";
    } else {
      current += char;
    }
  }

  // push the final field — no trailing comma to trigger it
  values.push(current.trim());
  return values;
}

// only applied to structured fields (name, city, etc.) — not free-text blobs
function cleanValue(value: string): string {
  return value
    .replace(/^["']|["']$/g, "")  // strip wrapping quotes
    .replace(/,$/,         "")     // trailing comma
    .replace(/\.$/,        "")     // trailing period — catches LLC. Inc. Co.
    .trim();
}

// case-insensitive header search — returns cleaned value or empty string
// strips non-alphanumeric before comparing so "MailCity", "mail_city", "mail city" all match "mailcity"
function findFieldValue(data: Record<string, string>, possibleNames: string[]): string {
  for (const name of possibleNames) {
    const key = Object.keys(data).find(
      (k) => k.toLowerCase() === name.toLowerCase() ||
             k.toLowerCase().replace(/[^a-z0-9]/g, "") === name.toLowerCase().replace(/[^a-z0-9]/g, "")
    );
    if (key && data[key]) return cleanValue(data[key]);
  }
  return "";
}

export function formatCurrency(value: string): string {
  const num = parseFloat(value.replace(/[^0-9.-]/g, ""));
  if (isNaN(num)) return value;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
}

export function formatDate(value: string): string {
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return value;
  }
}
