"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import type { AcordFormType } from "@/app/types";
import { ACORD_FORMS, ACORD_FORM_LABELS } from "@/app/lib/constants";
import { getFieldsForForm } from "@/app/lib/acord-fields";

interface FormSelectorProps {
  selectedForms: AcordFormType[];
  onToggle: (form: AcordFormType) => void;
}

interface FormRowProps {
  form: AcordFormType;
  label: string;
  fieldCount: number;
  isSelected: boolean;
  index: number;
  onToggle: (form: AcordFormType) => void;
}

function FormRow({ form, label, fieldCount, isSelected, index, onToggle }: FormRowProps) {
  return (
    <motion.label
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.25, ease: "easeOut" }}
      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-red bg-red/5 ring-2 ring-red/20"
          : "border-border bg-white hover:border-red/40"
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(form)}
        className="w-4 h-4 accent-red rounded shrink-0"
      />

      <div className="flex items-center gap-3 flex-1 min-w-0">
        <FileText className={`w-5 h-5 shrink-0 ${isSelected ? "text-red" : "text-brown"}`} />
        <div>
          <span className="text-sm font-black text-foreground">{form}</span>
          <span className="text-sm text-muted ml-2">— {label}</span>
        </div>
      </div>

      {/* field count badge */}
      <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
        isSelected ? "bg-red/10 text-red" : "bg-border text-muted"
      }`}>
        {fieldCount} fields
      </span>
    </motion.label>
  );
}

export default function FormSelector({ selectedForms, onToggle }: FormSelectorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-brown mb-1">Choose Forms</h2>
        <p className="text-sm text-muted">
          Select which ACORD forms to populate — all checked by default.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {ACORD_FORMS.map((form, index) => (
          <FormRow
            key={form}
            form={form}
            label={ACORD_FORM_LABELS[form]}
            fieldCount={getFieldsForForm(form).length}
            isSelected={selectedForms.includes(form)}
            index={index}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
