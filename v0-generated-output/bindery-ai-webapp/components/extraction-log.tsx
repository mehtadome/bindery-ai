'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react'
import { ExtractionLogEntry } from '@/lib/types'

interface ExtractionLogProps {
  entries: ExtractionLogEntry[]
  isExtracting: boolean
}

const TYPE_CONFIG = {
  info: {
    icon: Info,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
  },
  error: {
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
}

export function ExtractionLog({ entries, isExtracting }: ExtractionLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries])

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-medium text-foreground text-sm">Extraction Log</h3>
          </div>
          {isExtracting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <span className="text-xs text-muted-foreground">Extracting...</span>
            </motion.div>
          )}
        </div>

        <div
          ref={scrollRef}
          className="h-80 overflow-y-auto p-4 font-mono text-sm space-y-2"
        >
          <AnimatePresence mode="popLayout">
            {entries.map((entry, index) => {
              const { icon: Icon, color, bgColor } = TYPE_CONFIG[entry.type]

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-start gap-3 p-2.5 rounded-md ${bgColor}`}
                >
                  <Icon className={`w-4 h-4 ${color} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm leading-relaxed">
                      {entry.message}
                    </p>
                    {entry.field && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-background/50 text-muted-foreground">
                        {entry.field}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {entries.length === 0 && !isExtracting && (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>Waiting for extraction to start...</p>
            </div>
          )}

          {isExtracting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-2 text-muted-foreground"
            >
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {'▍'}
              </motion.span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
