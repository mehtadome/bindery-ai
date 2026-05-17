'use client'

import { motion } from 'framer-motion'
import { FileSpreadsheet, Building2, FileText, Sparkles, CheckCircle2 } from 'lucide-react'
import { WorkflowStep } from '@/lib/types'

interface StepIndicatorProps {
  currentStep: WorkflowStep
}

const STEPS: { key: WorkflowStep; label: string; icon: React.ElementType }[] = [
  { key: 'upload', label: 'Upload CSV', icon: FileSpreadsheet },
  { key: 'select-account', label: 'Select Account', icon: Building2 },
  { key: 'select-forms', label: 'Choose Forms', icon: FileText },
  { key: 'extracting', label: 'Extract Data', icon: Sparkles },
  { key: 'results', label: 'Review Results', icon: CheckCircle2 },
]

const STEP_ORDER: WorkflowStep[] = ['upload', 'select-account', 'select-forms', 'extracting', 'results']

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep)

  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isUpcoming = index > currentIndex

          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted
                      ? 'var(--primary)'
                      : isCurrent
                      ? 'var(--card)'
                      : 'var(--muted)',
                  }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    border-2 transition-colors duration-300
                    ${
                      isCompleted
                        ? 'border-primary'
                        : isCurrent
                        ? 'border-primary'
                        : 'border-border'
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isCompleted
                        ? 'text-primary-foreground'
                        : isCurrent
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                </motion.div>
                <span
                  className={`
                    mt-2 text-xs font-medium transition-colors duration-300
                    ${
                      isCurrent
                        ? 'text-foreground'
                        : isCompleted
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={`
                    w-12 h-0.5 mx-2 transition-colors duration-300
                    ${index < currentIndex ? 'bg-primary' : 'bg-border'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
