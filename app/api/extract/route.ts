import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { csvRow, formTypes } = await req.json();

  if (!csvRow || !Array.isArray(formTypes) || formTypes.length === 0) {
    return new Response(JSON.stringify({ error: "Missing csvRow or formTypes" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: `You are Bindery AI, an expert insurance data extraction system.
You receive raw AMS (Agency Management System) export data — a single CSV row with headers — and extract structured information needed to fill ACORD insurance forms.
Be precise: extract only what is explicitly present in the data.
Flag fields that are missing, ambiguous, or require producer review.
Format your response as a clear field-by-field breakdown grouped by form type.`,
    prompt: `Extract the relevant fields from the following AMS account data for these forms: ${formTypes.join(", ")}.

AMS Data (CSV row with headers):
${csvRow}

For each requested form, list the key fields you found and any fields that were missing or unclear. Be concise.`,
    maxOutputTokens: 1024,
  });

  return result.toTextStreamResponse();
}
