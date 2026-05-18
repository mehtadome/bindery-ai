import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  const csv = readFileSync(join(process.cwd(), "data/ams_export.csv"), "utf-8");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="ams_export.csv"',
    },
  });
}
