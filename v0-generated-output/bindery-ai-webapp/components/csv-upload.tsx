'use client'

import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import { AccountData } from '@/lib/types'
import { parseCSV } from '@/lib/csv-parser'

interface CSVUploadProps {
  onUpload: (data: AccountData[]) => void
}

export function CSVUpload({ onUpload }: CSVUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      setError(null)
      setFileName(file.name)

      if (!file.name.endsWith('.csv')) {
        setError('Please upload a CSV file')
        setFileName(null)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const data = parseCSV(text)

          if (data.length === 0) {
            setError('No valid accounts found in CSV. Make sure it has a header row with account data.')
            setFileName(null)
            return
          }

          onUpload(data)
        } catch {
          setError('Failed to parse CSV file. Please check the format.')
          setFileName(null)
        }
      }
      reader.readAsText(file)
    },
    [onUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative flex flex-col items-center justify-center w-full h-64 
            border-2 border-dashed rounded-lg cursor-pointer
            transition-all duration-200
            ${
              isDragging
                ? 'border-primary bg-primary/10 scale-[1.02]'
                : 'border-border hover:border-primary/50 hover:bg-card/50'
            }
          `}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <AnimatePresence mode="wait">
            {fileName ? (
              <motion.div
                key="file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="p-4 rounded-full bg-primary/20">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <p className="text-foreground font-medium">{fileName}</p>
                <p className="text-sm text-muted-foreground">Processing...</p>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  className="p-4 rounded-full bg-muted"
                  animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </motion.div>
                <div className="text-center">
                  <p className="text-foreground font-medium">
                    Drop your AMS CSV export here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse files
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded bg-muted">CSV</span>
                  <span>Up to 10MB</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </label>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Upload Error</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
