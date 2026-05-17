"use client";

import { useState, useEffect, useRef } from "react";
import type { AcordFormType, CsvRow } from "@/app/types";
import { ACORD_FORMS, ACORD_FORM_LABELS } from "@/app/lib/constants";

interface RunPanelProps {
  file: File;
  onRunComplete: (output: string, selectedRow: CsvRow) => void;
}

function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return { headers: [], rows: [] };

  // Basic CSV parse — handles quoted fields with commas
  function parseLine(line: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { result.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    result.push(cur.trim());
    return result;
  }

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const vals = parseLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
  return { headers, rows };
}

export default function RunPanel({ file, onRunComplete }: RunPanelProps) {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedForms, setSelectedForms] = useState<AcordFormType[]>([...ACORD_FORMS]);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [log, setLog] = useState("");
  const logRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    file.text().then((text) => {
      const { headers, rows } = parseCsv(text);
      setHeaders(headers);
      setRows(rows);
    });
  }, [file]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  function toggleForm(form: AcordFormType) {
    setSelectedForms((prev) =>
      prev.includes(form) ? prev.filter((f) => f !== form) : [...prev, form]
    );
  }

  async function runExtraction() {
    if (rows.length === 0 || selectedForms.length === 0) return;
    const row = rows[selectedIdx];
    const headerLine = headers.join(",");
    const valueLine = headers.map((h) => `"${(row[h] ?? "").replace(/"/g, '""')}"`).join(",");
    const csvRow = `${headerLine}\n${valueLine}`;

    setStatus("running");
    setLog("");

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvRow, formTypes: selectedForms }),
      });

      if (!res.ok || !res.body) {
        setStatus("error");
        setLog("Error: API call failed.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullOutput = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullOutput += chunk;
        setLog((prev) => prev + chunk);
      }

      setStatus("done");
      onRunComplete(fullOutput, row);
    } catch {
      setStatus("error");
      setLog("Error: Network request failed.");
    }
  }

  const selectedAccount = rows[selectedIdx];

  return (
    <div className="flex flex-col gap-8 py-8 max-w-2xl mx-auto w-full">
      <div>
        <h2 className="text-2xl font-black text-brown mb-1">Configure Extraction</h2>
        <p className="text-sm text-muted">
          Choose an account from your CSV and which ACORD forms to populate.
        </p>
      </div>

      {/* Account picker */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground">Account</label>
        <select
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(Number(e.target.value))}
          className="border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-red/30"
        >
          {rows.map((row, i) => (
            <option key={i} value={i}>
              {row["InsuredName"] || row["named_insured"] || `Row ${i + 1}`}
            </option>
          ))}
        </select>
        {selectedAccount && (
          <p className="text-xs text-muted">
            {selectedAccount["MailCity"]}, {selectedAccount["MailState"]} ·{" "}
            NAICS {selectedAccount["NAICSCode"]} · {selectedAccount["EntityType"]}
          </p>
        )}
      </div>

      {/* Form type checkboxes */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground">Forms to extract</label>
        <div className="flex flex-col gap-2">
          {ACORD_FORMS.map((form) => (
            <label key={form} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedForms.includes(form)}
                onChange={() => toggleForm(form)}
                className="w-4 h-4 accent-red rounded"
              />
              <span className="text-sm text-foreground group-hover:text-brown transition-colors">
                <span className="font-semibold">{form}</span>
                <span className="text-muted ml-2">— {ACORD_FORM_LABELS[form]}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Run button */}
      <button
        onClick={runExtraction}
        disabled={status === "running" || selectedForms.length === 0}
        className="self-start inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-3 rounded-full hover:bg-red-dark transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "running" ? (
          <>
            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Extracting…
          </>
        ) : (
          <>Run Extraction →</>
        )}
      </button>

      {/* Stream log */}
      {log && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest">
            Extraction log
          </p>
          <pre
            ref={logRef}
            className="bg-gray-50 border border-border rounded-xl p-4 text-xs font-mono text-foreground leading-relaxed overflow-y-auto max-h-64 whitespace-pre-wrap"
          >
            {log}
          </pre>
          {status === "done" && (
            <p className="text-xs text-brown font-semibold">
              ✓ Extraction complete — scroll down or click View Results
            </p>
          )}
        </div>
      )}
    </div>
  );
}
