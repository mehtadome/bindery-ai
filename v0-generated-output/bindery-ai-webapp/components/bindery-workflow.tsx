'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CSVUpload } from '@/components/csv-upload'
import { AccountPicker } from '@/components/account-picker'
import { FormSelector } from '@/components/form-selector'
import { ExtractionLog } from '@/components/extraction-log'
import { ResultsView } from '@/components/results-view'
import { StepIndicator } from '@/components/step-indicator'
import {
  WorkflowStep,
  AccountData,
  ACORDFormType,
  ExtractionLogEntry,
  FormExtractionResult,
} from '@/lib/types'
import { parseExtractedFields, calculateFillRate } from '@/lib/acord-fields'

export function BinderyWorkflow() {
  const [step, setStep] = useState<WorkflowStep>('upload')
  const [csvData, setCsvData] = useState<AccountData[]>([])
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null)
  const [selectedForms, setSelectedForms] = useState<ACORDFormType[]>([])
  const [extractionLog, setExtractionLog] = useState<ExtractionLogEntry[]>([])
  const [extractionResults, setExtractionResults] = useState<FormExtractionResult[]>([])
  const [isExtracting, setIsExtracting] = useState(false)

  const addLogEntry = useCallback(
    (type: ExtractionLogEntry['type'], message: string, field?: string) => {
      setExtractionLog((prev) => [...prev, { timestamp: new Date(), type, message, field }])
    },
    []
  )

  const handleCSVUpload = useCallback((data: AccountData[]) => {
    setCsvData(data)
    setStep('select-account')
  }, [])

  const handleAccountSelect = useCallback((account: AccountData) => {
    setSelectedAccount(account)
  }, [])

  const handleFormToggle = useCallback((formType: ACORDFormType) => {
    setSelectedForms((prev) =>
      prev.includes(formType) ? prev.filter((f) => f !== formType) : [...prev, formType]
    )
  }, [])

  const startExtraction = useCallback(async () => {
    if (!selectedAccount || selectedForms.length === 0) return

    setStep('extracting')
    setIsExtracting(true)
    setExtractionLog([])
    setExtractionResults([])

    addLogEntry('info', `Starting extraction for ${selectedAccount.insuredName}`)
    addLogEntry('info', `Forms selected: ${selectedForms.map((f) => `ACORD ${f}`).join(', ')}`)

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: selectedAccount,
          formTypes: selectedForms,
        }),
      })

      if (!response.ok) {
        throw new Error('Extraction failed')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const decoder = new TextDecoder()
      let fullText = ''
      let currentForm: ACORDFormType | null = null

      addLogEntry('info', 'Claude is analyzing your data...')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk

        // Detect form headers in the stream
        if (chunk.includes('ACORD 125') && currentForm !== '125') {
          currentForm = '125'
          addLogEntry('success', 'Extracting ACORD 125 fields...', 'ACORD 125')
        } else if (chunk.includes('ACORD 126') && currentForm !== '126') {
          currentForm = '126'
          addLogEntry('success', 'Extracting ACORD 126 fields...', 'ACORD 126')
        } else if (chunk.includes('ACORD 130') && currentForm !== '130') {
          currentForm = '130'
          addLogEntry('success', 'Extracting ACORD 130 fields...', 'ACORD 130')
        }

        // Log field extractions
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.includes(':') && !line.includes('===')) {
            const fieldName = line.split(':')[0].trim()
            if (fieldName && fieldName.length < 50 && !fieldName.includes('#')) {
              addLogEntry('info', `Found: ${fieldName}`, fieldName)
            }
          }
        }
      }

      addLogEntry('success', 'Extraction complete!')

      // Parse results for each form
      const results: FormExtractionResult[] = selectedForms.map((formType) => {
        const fields = parseExtractedFields(fullText, formType)
        const stats = calculateFillRate(fields, formType)

        addLogEntry(
          'success',
          `ACORD ${formType}: ${stats.filledFields}/${stats.totalFields} fields (${stats.fillRate}%)`,
          `ACORD ${formType}`
        )

        return {
          formType,
          fields,
          ...stats,
        }
      })

      setExtractionResults(results)
      setIsExtracting(false)

      // Short delay then show results
      setTimeout(() => setStep('results'), 1500)
    } catch (error) {
      addLogEntry('error', `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsExtracting(false)
    }
  }, [selectedAccount, selectedForms, addLogEntry])

  const handleBack = useCallback(() => {
    switch (step) {
      case 'select-account':
        setStep('upload')
        setCsvData([])
        setSelectedAccount(null)
        break
      case 'select-forms':
        setStep('select-account')
        setSelectedForms([])
        break
      case 'extracting':
        setStep('select-forms')
        setExtractionLog([])
        break
      case 'results':
        setStep('select-forms')
        setExtractionResults([])
        setExtractionLog([])
        break
    }
  }, [step])

  const handleNext = useCallback(() => {
    switch (step) {
      case 'select-account':
        if (selectedAccount) setStep('select-forms')
        break
      case 'select-forms':
        if (selectedForms.length > 0) startExtraction()
        break
    }
  }, [step, selectedAccount, selectedForms, startExtraction])

  const handleReset = useCallback(() => {
    setStep('upload')
    setCsvData([])
    setSelectedAccount(null)
    setSelectedForms([])
    setExtractionLog([])
    setExtractionResults([])
    setIsExtracting(false)
  }, [])

  const canGoNext =
    (step === 'select-account' && selectedAccount !== null) ||
    (step === 'select-forms' && selectedForms.length > 0)

  const canGoBack = step !== 'upload' && step !== 'extracting'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">B</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Bindery AI</h1>
              <p className="text-xs text-muted-foreground">ACORD Form Extraction</p>
            </div>
          </div>

          {step === 'results' && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <StepIndicator currentStep={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 'upload' && <CSVUpload onUpload={handleCSVUpload} />}

            {step === 'select-account' && (
              <AccountPicker
                accounts={csvData}
                selectedAccount={selectedAccount}
                onSelect={handleAccountSelect}
              />
            )}

            {step === 'select-forms' && (
              <FormSelector selectedForms={selectedForms} onToggle={handleFormToggle} />
            )}

            {step === 'extracting' && (
              <ExtractionLog entries={extractionLog} isExtracting={isExtracting} />
            )}

            {step === 'results' && <ResultsView results={extractionResults} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {(canGoBack || canGoNext) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex items-center justify-between max-w-4xl mx-auto"
          >
            <div>
              {canGoBack && (
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>

            <div>
              {canGoNext && (
                <Button onClick={handleNext}>
                  {step === 'select-forms' ? 'Start Extraction' : 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
