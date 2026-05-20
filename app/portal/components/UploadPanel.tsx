"use client";

import { useState, useRef } from "react";

interface UploadPanelProps {
  onFileAccepted: (file: File) => void;
}

export default function UploadPanel({ onFileAccepted }: UploadPanelProps) {
  const [dragging, setDragging] = useState(false);
  // ref to the hidden file input so the styled button can trigger .click() on it
  const inputRef = useRef<HTMLInputElement>(null);

  // STEP 1:validates .csv extension, then fires onFileAccepted prop
  function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) return;
    onFileAccepted(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-black text-brown mb-2">Upload AMS Export</h2>
        <p className="text-sm text-muted">
          Drop your AMS360 CSV export here. We&apos;ll parse the accounts and let you choose which one to extract.
        </p>
      </div>

      {/* drag-drop CSV zone + sample CSV download link */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`max-w-md w-full border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-4 transition-colors cursor-pointer ${
          dragging ? "border-red bg-red/5" : "border-border hover:border-red/50 hover:bg-red/5"
        }`}
      >
        <div className="text-4xl text-muted">⬆</div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            Drag & drop a CSV file
          </p>
          <p className="text-xs text-muted mt-1">or click to browse</p>
        </div>
        <span className="text-xs text-muted bg-border/60 px-3 py-1 rounded-full">
          .csv only
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      {/* triggers GET /api/sample-csv — browser auto-saves to device via download attribute, user still uploads manually */}
      <p className="text-xs text-muted">
        Try{" "}
        <a
          href="/api/sample-csv"
          download="ams_export.csv"
          className="font-mono font-semibold text-red hover:underline"
        >
          data/ams_export.csv
        </a>
        {" "}from the repo
      </p>
    </div>
  );
}
