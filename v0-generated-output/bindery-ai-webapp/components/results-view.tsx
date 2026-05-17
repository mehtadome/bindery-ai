'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Percent,
} from 'lucide-react'
import { FormExtractionResult, ExtractedField, ACORDFormType } from '@/lib/types'
import { getFormName } from '@/lib/acord-fields'

interface ResultsViewProps {
  results: FormExtractionResult[]
}

export function ResultsView({ results }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<ACORDFormType>(
    results[0]?.formType || '125'
  )
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['filled']))

  const activeResult = results.find((r) => r.formType === activeTab)

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const filledFields = activeResult?.fields.filter((f) => !f.flagged) || []
  const flaggedFields = activeResult?.fields.filter((f) => f.flagged) || []

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-xl font-semibold text-foreground">Extraction Results</h2>
        <p className="text-muted-foreground mt-1">
          Review extracted fields and make any necessary corrections
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {results.map((result) => (
          <button
            key={result.formType}
            onClick={() => setActiveTab(result.formType)}
            className={`
              relative px-4 py-3 text-sm font-medium transition-colors
              ${
                activeTab === result.formType
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>ACORD {result.formType}</span>
              <span
                className={`
                  px-1.5 py-0.5 text-xs rounded-full
                  ${
                    result.fillRate >= 80
                      ? 'bg-primary/20 text-primary'
                      : result.fillRate >= 50
                      ? 'bg-chart-3/20 text-chart-3'
                      : 'bg-destructive/20 text-destructive'
                  }
                `}
              >
                {result.fillRate}%
              </span>
            </div>
            {activeTab === result.formType && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* Stats */}
      {activeResult && (
        <motion.div
          key={activeResult.formType}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Percent className="w-4 h-4" />
              <span className="text-sm">Fill Rate</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {activeResult.fillRate}%
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm">Fields Filled</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {activeResult.filledFields}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                / {activeResult.totalFields}
              </span>
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertTriangle className="w-4 h-4 text-chart-3" />
              <span className="text-sm">Needs Review</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {activeResult.flaggedFields}
            </p>
          </div>
        </motion.div>
      )}

      {/* Field Sections */}
      <div className="space-y-4">
        {/* Filled Fields */}
        <FieldSection
          title="Extracted Fields"
          icon={CheckCircle2}
          iconColor="text-primary"
          fields={filledFields}
          isExpanded={expandedSections.has('filled')}
          onToggle={() => toggleSection('filled')}
          formType={activeTab}
        />

        {/* Flagged Fields */}
        {flaggedFields.length > 0 && (
          <FieldSection
            title="Fields Needing Review"
            icon={AlertTriangle}
            iconColor="text-chart-3"
            fields={flaggedFields}
            isExpanded={expandedSections.has('flagged')}
            onToggle={() => toggleSection('flagged')}
            formType={activeTab}
          />
        )}
      </div>
    </div>
  )
}

interface FieldSectionProps {
  title: string
  icon: React.ElementType
  iconColor: string
  fields: ExtractedField[]
  isExpanded: boolean
  onToggle: () => void
  formType: ACORDFormType
}

function FieldSection({
  title,
  icon: Icon,
  iconColor,
  fields,
  isExpanded,
  onToggle,
}: FieldSectionProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <span className="font-medium text-foreground">{title}</span>
          <span className="text-sm text-muted-foreground">({fields.length})</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="divide-y divide-border">
              {fields.map((field, index) => (
                <motion.div
                  key={field.fieldName}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="px-4 py-3 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {field.fieldName}
                    </p>
                    {field.flagReason && (
                      <p className="text-xs text-chart-3 mt-0.5">{field.flagReason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm text-muted-foreground max-w-xs truncate">
                      {field.value}
                    </span>
                    {field.confidence && (
                      <span
                        className={`
                          px-1.5 py-0.5 text-xs rounded
                          ${
                            field.confidence === 'high'
                              ? 'bg-primary/20 text-primary'
                              : field.confidence === 'medium'
                              ? 'bg-chart-3/20 text-chart-3'
                              : 'bg-destructive/20 text-destructive'
                          }
                        `}
                      >
                        {field.confidence}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}

              {fields.length === 0 && (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  No fields in this section
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
