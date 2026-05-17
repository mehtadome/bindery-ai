"use client";

import { motion } from "framer-motion";
import { FileSpreadsheet, Building2, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import type { WorkflowStep } from "@/app/types";

interface StepIndicatorProps {
  currentStep: WorkflowStep;
}

interface StepCircleProps {
  icon: React.ElementType;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface StepLabelProps {
  label: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

const STEPS: { key: WorkflowStep; label: string; icon: React.ElementType }[] = [
  { key: "upload",         label: "Upload CSV",     icon: FileSpreadsheet },
  { key: "select-account", label: "Select Account", icon: Building2       },
  { key: "select-forms",   label: "Choose Forms",   icon: FileText        },
  { key: "extracting",     label: "Extract Data",   icon: Sparkles        },
  { key: "results",        label: "Review Results", icon: CheckCircle2    },
];

const STEP_ORDER: WorkflowStep[] = [
  "upload", "select-account", "select-forms", "extracting", "results",
];

function StepCircle({ icon: Icon, isCompleted, isCurrent }: StepCircleProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        backgroundColor: isCompleted ? "#6b4226" : "#ffffff",
        scale: isCurrent ? 1.1 : 1,
      }}
      transition={{ duration: 0.2 }}
      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
        isCompleted ? "border-brown" :
        isCurrent   ? "border-red"   :
                      "border-border"
      }`}
    >
      <Icon className={`w-5 h-5 ${
        isCompleted ? "text-white" :
        isCurrent   ? "text-red"   :
                      "text-muted"
      }`} />
    </motion.div>
  );
}

function StepLabel({ label, isCompleted, isCurrent }: StepLabelProps) {
  return (
    <span className={`mt-2 text-xs font-semibold transition-colors duration-200 ${
      isCurrent   ? "text-foreground" :
      isCompleted ? "text-brown"      :
                    "text-muted"
    }`}>
      {label}
    </span>
  );
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent   = index === currentIndex;

          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <StepCircle icon={step.icon} isCompleted={isCompleted} isCurrent={isCurrent} />
                <StepLabel label={step.label} isCompleted={isCompleted} isCurrent={isCurrent} />
              </div>

              {/* connecting line — fills brown once the step to its left is completed */}
              {index < STEPS.length - 1 && (
                <div className={`w-10 h-0.5 mx-2 mb-5 transition-colors duration-300 ${
                  index < currentIndex ? "bg-brown" : "bg-border"
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
