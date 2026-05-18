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

    // rows with no insured name get status: pending for async Haiku resolution instead of being dropped
    if (!account.insuredName) account.status = "pending";
    accounts.push(account);
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

// fires parallel Haiku calls for all pending accounts, backfills fields in place, calls onUpdate after each resolution
export async function resolveAccounts(
  accounts: AccountData[],
  onUpdate: () => void
): Promise<void> {
  const pending = accounts.filter((a) => a.status === "pending");
  await Promise.all(
    pending.map(async (account) => {
      try {
        const res = await fetch("/api/resolve-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawData: account.rawData }),
        });
        if (!res.ok) throw new Error("resolve failed");
        const data = await res.json() as {
          insuredName: string | null;
          city: string | null;
          state: string | null;
          businessType: string | null;
          zipCode: string | null;
        };
        // backfill resolved fields directly into the existing AccountData object
        if (data.insuredName)  account.insuredName  = data.insuredName;
        if (data.city)         account.city         = data.city;
        if (data.state)        account.state        = data.state;
        if (data.businessType) account.businessType = data.businessType;
        if (data.zipCode)      account.zipCode      = data.zipCode;
        account.status = "resolved";
      } catch {
        account.status = "failed";
      }
      // trigger re-render after each account resolves, not just when all finish
      onUpdate();
    })
  );
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
