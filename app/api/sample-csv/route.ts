import { readFileSync } from "fs";
import { join } from "path";

// serves data/ams_export.csv as a file download — browser saves to device automatically via Content-Disposition header
export async function GET() {
  const csv = readFileSync(join(process.cwd(), "data/ams_export.csv"), "utf-8");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="ams_export.csv"',
    },
  });
}
