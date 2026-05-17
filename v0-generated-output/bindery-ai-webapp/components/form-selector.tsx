'use client'

import { motion } from 'framer-motion'
import { FileText, Check, Building2, HardHat, Flame } from 'lucide-react'
import { ACORDFormType } from '@/lib/types'
import { getFormName } from '@/lib/acord-fields'

interface FormSelectorProps {
  selectedForms: ACORDFormType[]
  onToggle: (formType: ACORDFormType) => void
}

const FORM_DETAILS: Record<
  ACORDFormType,
  { icon: React.ElementType; description: string; color: string }
> = {
  '125': {
    icon: Building2,
    description: 'General commercial insurance application with business information',
    color: 'text-chart-1',
  },
  '126': {
    icon: Flame,
    description: 'Property coverage details including building and contents',
    color: 'text-chart-2',
  },
  '130': {
    icon: HardHat,
    description: "Workers' compensation with employee and payroll data",
    color: 'text-chart-3',
  },
}

export function FormSelector({ selectedForms, onToggle }: FormSelectorProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-xl font-semibold text-foreground">Select ACORD Forms</h2>
        <p className="text-muted-foreground mt-1">
          Choose which forms to extract data for
        </p>
      </motion.div>

      <div className="grid gap-4">
        {(['125', '126', '130'] as ACORDFormType[]).map((formType, index) => {
          const isSelected = selectedForms.includes(formType)
          const { icon: Icon, description, color } = FORM_DETAILS[formType]

          return (
            <motion.button
              key={formType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onToggle(formType)}
              className={`
                w-full p-5 rounded-lg border text-left transition-all duration-200
                ${
                  isSelected
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`
                    p-3 rounded-lg transition-colors duration-200
                    ${isSelected ? 'bg-primary/20' : 'bg-muted'}
                  `}
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">
                      {getFormName(formType)}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>

                <div
                  className={`
                    w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0
                    transition-all duration-200
                    ${
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/30'
                    }
                  `}
                >
                  {isSelected && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {selectedForms.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 rounded-lg bg-muted/50 border border-border"
        >
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{selectedForms.length}</span>{' '}
            form{selectedForms.length !== 1 ? 's' : ''} selected for extraction
          </p>
        </motion.div>
      )}
    </div>
  )
}
