"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Step, CsvRow } from "@/app/types";
import StepIndicator from "./StepIndicator";
import UploadPanel from "./UploadPanel";
import RunPanel from "./RunPanel";
import ResultsPanel from "./ResultsPanel";

const slide = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -16 },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

export default function PortalShell() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState("");

  function handleFileAccepted(f: File) {
    setFile(f);
    setStep("run");
  }

  function handleRunComplete(rawOutput: string, _row: CsvRow) {
    setOutput(rawOutput);
    setStep("results");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
        <a href="/" className="text-xs font-semibold text-muted hover:text-foreground transition-colors">
          ← Home
        </a>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black text-foreground tracking-tight">Bindery</span>
          <span className="text-sm font-black text-brown tracking-tight">AI</span>
          <span className="text-muted mx-1">·</span>
          <span className="text-sm font-semibold text-muted">Portal</span>
        </div>
        <div className="w-16" />
      </div>

      {/* Step indicator */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-center">
        <StepIndicator current={step} />
      </div>

      {/* File name pill */}
      {file && step !== "upload" && (
        <div className="px-6 pt-4 flex justify-center">
          <span className="inline-flex items-center gap-2 bg-brown/10 text-brown text-xs font-semibold px-3 py-1.5 rounded-full">
            📄 {file.name}
            {step === "results" && (
              <button
                onClick={() => { setFile(null); setOutput(""); setStep("upload"); }}
                className="ml-1 text-brown/60 hover:text-brown transition-colors"
                aria-label="Upload new file"
              >
                ✕
              </button>
            )}
          </span>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 px-6">
        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div key="upload" {...slide}>
              <UploadPanel onFileAccepted={handleFileAccepted} />
            </motion.div>
          )}

          {step === "run" && file && (
            <motion.div key="run" {...slide}>
              <RunPanel file={file} onRunComplete={handleRunComplete} />
              {output && (
                <div className="max-w-2xl mx-auto pb-8">
                  <button
                    onClick={() => setStep("results")}
                    className="inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-3 rounded-full hover:bg-red-dark transition-colors text-sm"
                  >
                    View Results →
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {step === "results" && (
            <motion.div key="results" {...slide}>
              <ResultsPanel output={output} />
              <div className="max-w-2xl mx-auto pb-8 flex gap-3">
                <button
                  onClick={() => setStep("run")}
                  className="text-sm font-semibold text-muted hover:text-foreground transition-colors"
                >
                  ← Back to Run
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}
