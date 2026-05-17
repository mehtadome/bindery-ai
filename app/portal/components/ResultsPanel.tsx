"use client";

import { useState } from "react";
import type { AcordFormType } from "@/app/types";
import { ACORD_FORMS, ACORD_FORM_LABELS } from "@/app/lib/constants";

interface ResultsPanelProps {
  output: string;
}

export default function ResultsPanel({ output }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<AcordFormType>("ACORD 125");

  return (
    <div className="flex flex-col gap-6 py-8 max-w-2xl mx-auto w-full">
      <div>
        <h2 className="text-2xl font-black text-brown mb-1">Extraction Results</h2>
        <p className="text-sm text-muted">
          Review the fields Claude extracted. Flagged fields need producer review before form submission.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {ACORD_FORMS.map((form) => (
          <button
            key={form}
            onClick={() => setActiveTab(form)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === form
                ? "bg-red text-white"
                : "bg-border/60 text-muted hover:bg-border hover:text-foreground"
            }`}
          >
            {form}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-gray-50/50">
          <p className="text-sm font-black text-brown">{activeTab}</p>
          <p className="text-xs text-muted mt-0.5">{ACORD_FORM_LABELS[activeTab]}</p>
        </div>

        <div className="p-5">
          {output ? (
            <pre className="text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap">
              {output}
            </pre>
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <p className="text-sm font-semibold text-muted">No extraction output yet</p>
              <p className="text-xs text-muted/70">
                Structured field-by-field results will appear here once the extraction logic is wired up.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted border border-border rounded-xl px-4 py-3 bg-gray-50/50">
        <span className="text-brown font-semibold">Next step:</span>
        The extraction layer will parse this output into structured form fields, flag gaps, and generate a fill-rate report.
      </div>
    </div>
  );
}
