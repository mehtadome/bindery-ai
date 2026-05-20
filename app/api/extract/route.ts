import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { NextRequest } from "next/server";
import type { AccountData, AcordFormType } from "@/app/types";
import { getFieldsForForm, getFormName } from "@/app/lib/acord-fields";

export async function POST(req: NextRequest) {
  const { account, formTypes } = await req.json() as {
    account: AccountData;
    formTypes: AcordFormType[];
  };

  if (!account || !Array.isArray(formTypes) || formTypes.length === 0) {
    return new Response(JSON.stringify({ error: "Missing account or formTypes" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // field names only, no account data — just tells Claude what to fill; account data is injected separately via formatAccountContext
  const formSections = formTypes.map((formType) => `
### ${getFormName(formType)}
${getFieldsForForm(formType).map((f) => `- ${f}`).join("\n")}
`).join("\n");

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    // one field per line — client parses each SSE event independently, no waiting for full JSON
    system: `You are Bindery AI, an expert insurance data extraction system.
You receive AMS (Agency Management System) account data and extract values into ACORD form fields.

RULES:
- Extract only values explicitly present in the source data. Never hallucinate.
- If a field is not found, use null (not the string "null").
- If a value is present but ambiguous or needs producer review, prefix it with [REVIEW].
- Normalize dates to MM/DD/YYYY. Strip currency symbols from numeric fields.
- Output ONLY newline-delimited JSON — one object per line, no markdown, no prose.

Each line must be exactly:
{"form": "<form name>", "field": "<field name>", "value": "<extracted value>"}`,
    prompt: `Extract ACORD form fields from the following AMS account data.

${formatAccountContext(account)}

Output every field listed below, in order, one per line:

${formSections}`,
    maxOutputTokens: 8192, // 108 fields × ~18 tokens each = ~1944; 8192 gives 4× headroom for all 3 forms
  });

  // split stream chunks on \n, hold incomplete trailing line in buffer until next chunk completes it
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      for await (const chunk of result.textStream) {
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed) controller.enqueue(encoder.encode(`data: ${trimmed}\n\n`));
        }
      }
      if (buffer.trim()) controller.enqueue(encoder.encode(`data: ${buffer.trim()}\n\n`));
      controller.close();
    },
  });

  // SSE response — client reads data: events and upserts fields into state as they arrive
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}

function formatAccountContext(account: AccountData): string {
  const lines: string[] = [];

  // normalized fields first — gives Claude confident anchors
  lines.push("=== PARSED FIELDS ===");
  if (account.insuredName)      lines.push(`Named Insured: ${account.insuredName}`);
  if (account.address)          lines.push(`Address: ${account.address}`);
  if (account.city)             lines.push(`City: ${account.city}`);
  if (account.state)            lines.push(`State: ${account.state}`);
  if (account.zipCode)          lines.push(`Zip Code: ${account.zipCode}`);
  if (account.phone)            lines.push(`Phone: ${account.phone}`);
  if (account.email)            lines.push(`Email: ${account.email}`);
  if (account.naicsCode)        lines.push(`NAICS Code: ${account.naicsCode}`);
  if (account.sicCode)          lines.push(`SIC Code: ${account.sicCode}`);
  if (account.businessType)     lines.push(`Business Type: ${account.businessType}`);
  if (account.yearsInBusiness)  lines.push(`Years in Business: ${account.yearsInBusiness}`);
  if (account.numberOfEmployees)lines.push(`Number of Employees: ${account.numberOfEmployees}`);
  if (account.annualRevenue)    lines.push(`Annual Revenue: ${account.annualRevenue}`);
  if (account.effectiveDate)    lines.push(`Effective Date: ${account.effectiveDate}`);
  if (account.expirationDate)   lines.push(`Expiration Date: ${account.expirationDate}`);
  if (account.policyNumber)     lines.push(`Policy Number: ${account.policyNumber}`);
  if (account.carrier)          lines.push(`Carrier: ${account.carrier}`);
  if (account.premium)          lines.push(`Premium: ${account.premium}`);
  if (account.deductible)       lines.push(`Deductible: ${account.deductible}`);
  if (account.coverageDetails)  lines.push(`Coverage Details: ${account.coverageDetails}`);

  // raw AMS data second — fills gaps normalization missed
  lines.push("\n=== RAW AMS DATA ===");
  Object.entries(account.rawData).forEach(([key, value]) => {
    if (value && value.trim()) lines.push(`${key}: ${value}`);
  });

  return lines.join("\n");
}
