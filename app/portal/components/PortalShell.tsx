"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Home, RotateCcw } from "lucide-react";
import type {
  WorkflowStep, AccountData, AcordFormType, ExtractionLogEntry, FormExtractionResult,
} from "@/app/types";
import { ACORD_FORMS } from "@/app/lib/constants";
import { parseCSV, resolveAccounts } from "@/app/lib/csv-parser";
import { parseNDJSONLine, emptyResult, recalcFillRate } from "@/app/lib/extract";
import StepIndicator from "./StepIndicator";
import UploadPanel from "./UploadPanel";
import AccountPicker from "./AccountPicker";
import FormSelector from "./FormSelector";
import ExtractionLog from "./ExtractionLog";
import ResultsPanel from "./ResultsPanel";

const STEP_ORDER: WorkflowStep[] = [
  "upload", "select-account", "select-forms", "extracting", "results",
];

const slide = {
  initial:    { opacity: 0, x: 16 },
  animate:    { opacity: 1, x: 0  },
  exit:       { opacity: 0, x: -16 },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

export default function PortalShell() {
  // active panel — drives AnimatePresence + StepIndicator; advanced in handleFileAccepted, handleBack, runExtraction
  const [step, setStep] = useState<WorkflowStep>("upload");
  // parsed from uploaded CSV in handleFileAccepted via parseCSV (csv-parser.ts)
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  // set by AccountPicker.onSelect; passed to /api/extract as the extraction subject
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  // toggled in FormSelector; passed to /api/extract; defaults to all three forms
  const [selectedForms, setSelectedForms] = useState<AcordFormType[]>([...ACORD_FORMS]);
  // built entry-by-entry in runExtraction as stream chunks arrive; rendered by ExtractionLog
  const [extractionLog, setExtractionLog] = useState<ExtractionLogEntry[]>([]);
  // true while stream is open; drives ExtractionLog spinner and disables navigation
  const [isExtracting, setIsExtracting] = useState(false);
  // pre-populated with emptyResult() before stream opens; fields appended as SSE events arrive
  const [results, setResults] = useState<FormExtractionResult[]>([]);

  const addLog = useCallback((type: ExtractionLogEntry["type"], message: string) => {
    setExtractionLog((prev) => [...prev, { timestamp: new Date(), type, message }]);
  }, []);

  // parse CSV on upload, advance to account selection, then async-resolve any pending accounts
  async function handleFileAccepted(file: File) {
    const text = await file.text();
    const parsed = parseCSV(text);
    setAccounts(parsed);
    setStep("select-account");
    // fire resolution in background — onUpdate spreads state so pending cards re-render as they resolve
    resolveAccounts(parsed, () => setAccounts([...parsed]));
  }

  function handleFormToggle(form: AcordFormType) {
    setSelectedForms((prev) =>
      prev.includes(form) ? prev.filter((f) => f !== form) : [...prev, form]
    );
  }

  async function runExtraction() {
    if (!selectedAccount || selectedForms.length === 0) return;

    setStep("extracting");
    setIsExtracting(true);
    setExtractionLog([]);
    // initialize one empty result per form so ResultsPanel can render immediately without waiting
    setResults(selectedForms.map(emptyResult));

    addLog("info", `Starting extraction for ${selectedAccount.insuredName}`);
    addLog("info", `Forms selected: ${selectedForms.join(", ")}`);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: selectedAccount, formTypes: selectedForms }),
      });

      if (!res.ok || !res.body) {
        console.error("[runExtraction] API request failed:", res.status, res.statusText);
        addLog("error", "API request failed — check your API key and try again.");
        setIsExtracting(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      addLog("info", "Claude is analyzing your AMS data...");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const parsed = parseNDJSONLine(line.slice(6));
          if (!parsed) {
            addLog("warning", `Skipped malformed line from Claude: ${line.slice(6)}`);
            continue;
          }

          const { formType, field } = parsed;

          // log each field as it arrives — [REVIEW] fields surface as warnings
          if (field.value) {
            addLog(field.flagged ? "warning" : "success", `${field.fieldName} · ${formType}: ${field.value}`);
          }

          // Claude emits each field once in order — no overwrite needed, only append
          setResults((prev) =>
            prev.map((r) =>
              r.formType !== formType ? r : recalcFillRate({ ...r, fields: [...r.fields, field] })
            )
          );
        }
      }

      addLog("success", "Extraction complete — review your results below");
      setIsExtracting(false);
      setStep("results");

    } catch (err) {
      console.error("[runExtraction] Network error:", err);
      addLog("error", "Network request failed.");
      setIsExtracting(false);
    }
  }

  function handleBack() {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  }

  function handleReset() {
    setStep("upload");
    setAccounts([]);
    setSelectedAccount(null);
    setSelectedForms([...ACORD_FORMS]);
    setExtractionLog([]);
    setResults([]);
    setIsExtracting(false);
  }

  // allow back on extracting step only after stream ends (failure) — not while actively running
  const canGoBack = step !== "upload" && !(step === "extracting" && isExtracting);
  const canGoNext =
    (step === "select-account" && selectedAccount !== null) ||
    (step === "select-forms"   && selectedForms.length > 0) ||
    (step === "extracting"     && !isExtracting && results.length > 0);
  const isLastStep = step === "results";

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          Home
        </a>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black text-foreground tracking-tight">Bindery</span>
          <span className="text-sm font-black text-brown tracking-tight">AI</span>
          <span className="text-muted mx-1">·</span>
          <span className="text-sm font-semibold text-muted">Portal</span>
        </div>
        {isLastStep ? (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Start Over
          </button>
        ) : (
          <div className="w-16" />
        )}
      </div>

      {/* Step indicator */}
      <div className="border-b border-border px-6 py-5 flex items-center justify-center">
        <StepIndicator currentStep={step} />
      </div>

      {/* Main content */}
      <main className="flex-1 px-6">
        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div key="upload" {...slide}>
              <UploadPanel onFileAccepted={handleFileAccepted} />
            </motion.div>
          )}

          {step === "select-account" && (
            <motion.div key="select-account" {...slide}>
              <AccountPicker
                accounts={accounts}
                selectedAccount={selectedAccount}
                onSelect={setSelectedAccount}
              />
            </motion.div>
          )}
          {/* STEP 4: Form selection */}
          {step === "select-forms" && (
            <motion.div key="select-forms" {...slide}>
              <FormSelector selectedForms={selectedForms} onToggle={handleFormToggle} />
            </motion.div>
          )}
          {/* STEP 5: Extraction log */}
          {step === "extracting" && (
            <motion.div key="extracting" {...slide}>
              <ExtractionLog entries={extractionLog} isExtracting={isExtracting} />
            </motion.div>
          )}

          {step === "results" && (
            <motion.div key="results" {...slide}>
              <ResultsPanel results={results} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Back / Continue navigation */}
      {(canGoBack || canGoNext) && (
        <div className="sticky bottom-0 w-full bg-white/80 backdrop-blur-md border-t border-border">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            {canGoBack && (
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>
          <div>
            {canGoNext && (
              // advances to next WorkflowStep in STEP_ORDER; select-forms is special-cased to trigger extraction
              <button
                onClick={step === "select-forms" ? runExtraction : () => setStep(STEP_ORDER[STEP_ORDER.indexOf(step) + 1])}
                className="inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-red-dark transition-colors"
              >
                {step === "select-forms" ? "Start Extraction" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          </div>
        </div>
      )}

    </div>
  );
}
