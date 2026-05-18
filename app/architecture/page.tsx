"use client";

import { motion } from "framer-motion";
import ArchTopBar from "./components/ArchTopBar";
import TierCard from "./components/TierCard";
import T0Diagram from "./components/T0Diagram";
import T1Diagram from "./components/T1Diagram";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const, delay: i * 0.1 },
  }),
};

const T0_DECISIONS = [
  {
    label: "LLM streaming",
    detail: "Claude outputs NDJSON — one {form, field, value} per line. Server emits each complete line as an SSE event. Client parses events and logs + populates results live as each field arrives.",
  },
  {
    label: "Extraction / mapping split",
    detail: "Claude outputs one field per line, form-agnostic. ACORD field lists are the mapping layer — adding a new form = new field list only, no prompt changes.",
  },
  {
    label: "Haiku fallback",
    detail: "Rows with blank insuredName are resolved async via a lightweight generateText call returning 5 identity fields. Backfilled in place before the account picker renders.",
  },
];

const T1_DECISIONS = [
  {
    label: "Generic ingestion",
    detail: "Data source abstracted to AMS / SFTP / S3 — Bindery adapts to whatever the client already uses. No new tooling required on their end.",
  },
  {
    label: "Broadcast output",
    detail: "Both outputs always fire — no routing logic, no client choice. Every extraction lands in the client's data store AND submits to the ACORD platform.",
  },
  {
    label: "Data retention guarantee",
    detail: "Write-back to the client's own environment satisfying SOC 2, NAIC, and state insurance data retention requirements. Client has a record before the carrier does.",
  },
];

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-white">
      <ArchTopBar />

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-12">
          <span className="inline-flex items-center gap-2 bg-red/10 text-red text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-red" />
            Two-tier design
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-brown">
            Architecture
          </h1>
          <p className="text-muted mt-3 max-w-xl leading-relaxed text-sm">
            Extraction is decoupled from mapping. Claude solves the hard AI problem once — producing a canonical Account Schema JSON. Adding a new form type is a field-list change, not a prompt change.
          </p>
        </motion.div>

        {/* Tier cards */}
        <TierCard
          badge="T0 · MVP"
          badgeClass="bg-red/10 text-red"
          borderClass="border-red/20"
          title="Current — Web Portal"
          subtitle="CSV in → Claude Haiku NDJSON stream → fields logged live via SSE → ACORD results → PDF export."
          diagram={<T0Diagram />}
          decisions={T0_DECISIONS}
          motionCustom={1}
          current
        />

        <TierCard
          badge="T1 · Production"
          badgeClass="bg-brown/10 text-brown"
          borderClass="border-brown/20"
          title="Production Pipeline"
          subtitle="Fivetran → Snowflake → dbt → extraction → carrier portal push + AMS write-back."
          diagram={<T1Diagram />}
          decisions={T1_DECISIONS}
          motionCustom={2}
        />

      </div>
    </div>
  );
}
