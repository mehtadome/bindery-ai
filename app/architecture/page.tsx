"use client";

import { motion } from "framer-motion";
import ArchTopBar from "./components/ArchTopBar";
import DiagramPlaceholder from "./components/DiagramPlaceholder";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const, delay: i * 0.1 },
  }),
};

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-white">
      <ArchTopBar />

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-12">
          <span className="inline-flex items-center gap-2 bg-red/10 text-red text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-red" />
            Four-layer pipeline
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-brown">
            Architecture
          </h1>
          <p className="text-muted mt-3 max-w-xl leading-relaxed text-sm">
            Extraction is decoupled from mapping. Claude solves the hard AI problem once — producing a canonical Account Schema JSON. Adding a new form type is a YAML config change, not a code change.
          </p>
        </motion.div>

        {/* Diagrams */}
        <div className="flex flex-col gap-8">
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
            <DiagramPlaceholder
              badge="Current · MVP"
              title="MVP Pipeline"
              description="CSV + dec page PDF in → Claude extraction → YAML mapping → filled ACORD PDF out."
            />
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
            <DiagramPlaceholder
              badge="T1 · Production"
              title="T1 Production Architecture"
              description="Multi-form routing, confidence scoring, AMS write-back, web UI, and carrier portal push."
            />
          </motion.div>
        </div>

      </div>
    </div>
  );
}
