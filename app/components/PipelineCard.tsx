"use client";

import { motion } from "framer-motion";
import { PIPELINE_STEPS } from "@/app/lib/constants";

export default function PipelineCard() {
  return (
    <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex flex-col gap-3">
      <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">
        Pipeline
      </p>
      {PIPELINE_STEPS.map((step, i) => (
        <motion.div
          key={step.label}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 + i * 0.12, ease: "easeOut" }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-brown/10 flex items-center justify-center text-brown text-xs font-black flex-shrink-0">
            {i + 1}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{step.label}</p>
            <p className="text-xs text-muted">{step.sub}</p>
          </div>
          {i < PIPELINE_STEPS.length - 1 && (
            <div className="absolute left-10 mt-8 w-px h-3 bg-border" style={{ marginLeft: "16px" }} />
          )}
        </motion.div>
      ))}
      <div className="mt-2 pt-3 border-t border-border flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red animate-pulse" />
        <span className="text-xs text-muted">Ready to extract</span>
      </div>
    </div>
  );
}
