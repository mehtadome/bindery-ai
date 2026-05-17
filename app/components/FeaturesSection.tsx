"use client";

import { motion } from "framer-motion";
import { FEATURES } from "@/app/lib/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.1 },
  }),
};

export default function FeaturesSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <div className="grid md:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={i}
            className="border border-border rounded-2xl p-8 flex flex-col gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-brown/10 flex items-center justify-center text-brown text-lg font-bold">
              {f.icon}
            </div>
            <h3 className="text-xl font-black text-brown tracking-tight">{f.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
