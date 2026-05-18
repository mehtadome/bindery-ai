import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { NextRequest } from "next/server";

// lightweight single call — only resolves the 5 identity fields, not full extraction
export async function POST(req: NextRequest) {
  const { rawData } = await req.json() as { rawData: Record<string, string> };

  if (!rawData) {
    return new Response(JSON.stringify({ error: "Missing rawData" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const fields = Object.entries(rawData)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: `You are an insurance data assistant. Given raw AMS export fields, identify the insured business name and basic identity fields. Return ONLY valid JSON, no prose.`,
    prompt: `From the following AMS record fields, identify the business identity. Return JSON with exactly these keys (null if not found):
{
  "insuredName": string | null,
  "city": string | null,
  "state": string | null,
  "businessType": string | null,
  "zipCode": string | null
}

AMS fields:
${fields}`,
    maxOutputTokens: 256,
  });

  try {
    const cleaned = text.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
    return new Response(cleaned, { headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to parse response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
