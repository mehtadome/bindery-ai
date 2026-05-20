"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import type { ExtractionLogEntry } from "@/app/types";

interface ExtractionLogProps {
  entries: ExtractionLogEntry[];
  isExtracting: boolean;
}

interface LogEntryRowProps {
  entry: ExtractionLogEntry;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function LogEntryRow({ entry }: LogEntryRowProps) {
  const styles = {
    info:    { border: "border-border",   icon: <span className="w-4 h-4 flex items-center justify-center text-muted text-xs">·</span>, text: "text-foreground" },
    success: { border: "border-brown/40", icon: <CheckCircle2 className="w-4 h-4 text-brown shrink-0" />,   text: "text-foreground" },
    warning: { border: "border-amber-300",icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />, text: "text-amber-700" },
    error:   { border: "border-red/40",   icon: <XCircle className="w-4 h-4 text-red shrink-0" />,          text: "text-red"        },
  }[entry.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border-l-2 bg-gray-50 ${styles.border}`}
    >
      {styles.icon}
      <span className={`text-xs flex-1 ${styles.text}`}>{entry.message}</span>
      <span className="text-xs text-muted shrink-0 tabular-nums">{formatTime(entry.timestamp)}</span>
    </motion.div>
  );
}

export default function ExtractionLog({ entries, isExtracting }: ExtractionLogProps) {
  // ref to the bottom sentinel div so useEffect can scroll it into view on each new entry
  const bottomRef = useRef<HTMLDivElement>(null);

  // auto-scroll to bottom as new entries arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  const isDone = !isExtracting && entries.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className="mb-4">
        <h2 className="text-2xl font-black text-brown mb-1">Extracting Data</h2>
        <p className="text-sm text-muted">Claude is reading your AMS data and mapping fields in real time.</p>
      </div>

      <div className="flex flex-col gap-1.5 max-h-96 overflow-y-auto pr-1">

        {/* extracting header row */}
        {isExtracting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red/5 border border-red/20 mb-1"
          >
            <Loader2 className="w-4 h-4 text-red animate-spin shrink-0" />
            <span className="text-xs font-semibold text-red">Claude is analyzing your data...</span>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {entries.map((entry, i) => (
            <LogEntryRow key={i} entry={entry} />
          ))}
        </AnimatePresence>

        {/* completion banner */}
        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brown/10 border border-brown/20 mt-1"
          >
            <CheckCircle2 className="w-4 h-4 text-brown shrink-0" />
            <span className="text-xs font-semibold text-brown">Extraction complete — scroll down to review results</span>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
