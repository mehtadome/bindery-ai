"use client";

import { useState } from "react";
import { Download, CheckCircle2, AlertTriangle, XCircle, Pencil } from "lucide-react";
import type { AcordFormType, FormExtractionResult } from "@/app/types";
import { ACORD_FORM_LABELS } from "@/app/lib/constants";
import { getFieldsForForm } from "@/app/lib/acord-fields";
import { generatePdf } from "@/app/lib/generate-pdf";

interface ResultsPanelProps {
  results: FormExtractionResult[];
}

interface FieldRowProps {
  fieldName: string;
  value?: string;
  flagged?: boolean;
}

interface FillRateBadgeProps {
  filledFields: number;
  totalFields: number;
  flaggedFields: number;
}

function FieldRow({ fieldName, value, flagged }: FieldRowProps) {
  const isEmpty = !value;

  return (
    <div className="group flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      {/* status icon */}
      {flagged  ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" /> :
       isEmpty  ? <XCircle className="w-3.5 h-3.5 text-red/50 shrink-0" />        :
                  <CheckCircle2 className="w-3.5 h-3.5 text-brown/60 shrink-0" />}

      <span className="text-xs text-muted w-48 shrink-0">{fieldName}</span>

      <span className={`text-xs flex-1 ${
        flagged ? "text-amber-600 font-medium" :
        isEmpty ? "text-muted/50 italic"        :
                  "text-foreground font-medium"
      }`}>
        {flagged ? `[FLAGGED] ${value}` : isEmpty ? "—" : value}
      </span>

      {/* edit icon — inline editing not yet implemented */}
      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-border shrink-0" tabIndex={-1}>
        <Pencil className="w-3 h-3 text-muted" />
      </button>
    </div>
  );
}

function FillRateBadge({ filledFields, totalFields, flaggedFields }: FillRateBadgeProps) {
  const pct = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="font-black text-brown text-sm">{pct}%</span>
      <span className="text-muted">{filledFields}/{totalFields} fields filled</span>
      {flaggedFields > 0 && (
        <span className="text-amber-600 font-semibold">· {flaggedFields} flagged for review</span>
      )}
    </div>
  );
}

const FORM_ORDER: AcordFormType[] = ["ACORD 125", "ACORD 126", "ACORD 130"];

export default function ResultsPanel({ results }: ResultsPanelProps) {
  const sorted = [...results].sort((a, b) => FORM_ORDER.indexOf(a.formType) - FORM_ORDER.indexOf(b.formType));
  const firstForm = sorted[0]?.formType ?? "ACORD 125";
  const [activeTab, setActiveTab] = useState<AcordFormType>(firstForm);

  const activeResult = results.find((r) => r.formType === activeTab);

  // build field rows — all expected fields, filled where available
  const fieldRows = getFieldsForForm(activeTab).map((fieldName) => {
    const match = activeResult?.fields.find((f) => f.fieldName === fieldName);
    return { fieldName, value: match?.value ?? "", flagged: match?.flagged ?? false };
  });

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-brown mb-1">Extraction Results</h2>
        <p className="text-sm text-muted">
          Review extracted fields. Flagged fields need producer review before submission.
        </p>
      </div>

      {/* tab bar */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {sorted.map((r) => (
          <button
            key={r.formType}
            onClick={() => setActiveTab(r.formType)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              activeTab === r.formType
                ? "bg-red text-white"
                : "bg-border/60 text-muted hover:bg-border hover:text-foreground"
            }`}
          >
            {r.formType}
          </button>
        ))}
      </div>

      {/* results card */}
      <div className="border border-border rounded-2xl overflow-hidden">

        {/* card header — form name, fill rate, download */}
        <div className="px-5 py-4 border-b border-border bg-gray-50/50 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-brown">{activeTab}</p>
            <p className="text-xs text-muted mt-0.5">{ACORD_FORM_LABELS[activeTab]}</p>
            {activeResult && (
              <div className="mt-2">
                <FillRateBadge
                  filledFields={activeResult.filledFields}
                  totalFields={activeResult.totalFields}
                  flaggedFields={activeResult.flaggedFields}
                />
              </div>
            )}
          </div>

          {activeResult && (
            <button
              onClick={() => generatePdf(activeResult)}
              className="inline-flex items-center gap-2 bg-red text-white font-semibold px-4 py-2 rounded-full text-xs hover:bg-red-dark transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
          )}
        </div>

        {/* field grid */}
        <div className="px-5 py-2 max-h-96 overflow-y-auto">
          {fieldRows.length > 0 ? (
            fieldRows.map((row) => (
              <FieldRow key={row.fieldName} {...row} />
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-muted">No results yet — run an extraction first.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
