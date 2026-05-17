"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import PipelineCard from "./PipelineCard";
import { HERO_STATS } from "@/app/lib/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const, delay },
  }),
};

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center pt-20">
      <div className="max-w-6xl mx-auto px-6 w-full grid md:grid-cols-2 gap-16 items-center py-16">

        {/* Left: copy */}
        <div className="flex flex-col gap-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="inline-flex items-center gap-2 w-fit bg-red/10 text-red text-xs font-semibold px-3 py-1.5 rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red" />
            Powered by Claude Haiku · Vercel AI SDK
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.12}
            className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight text-foreground"
          >
            From messy AMS data
          </motion.h1>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.24}
            className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight text-brown -mt-4"
          >
            to filled ACORD forms.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.36}
            className="text-base md:text-lg text-muted leading-relaxed max-w-md"
          >
            Upload your AMS CSV export. Claude extracts every field your
            producers would have re-keyed by hand — and populates ACORD 125,
            126, and 130 in under 30 seconds.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.48}
            className="flex flex-wrap items-center gap-4"
          >
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-3 rounded-full hover:bg-red-dark transition-colors text-sm"
            >
              Open Portal
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/architecture"
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              View architecture →
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.58}
            className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2"
          >
            {HERO_STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col">
                <span className="text-2xl font-black text-foreground">{value}</span>
                <span className="text-xs text-muted">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: pipeline card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        >
          <PipelineCard />
        </motion.div>

      </div>
    </section>
  );
}
