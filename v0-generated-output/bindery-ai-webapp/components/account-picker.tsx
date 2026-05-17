'use client'

import { motion } from 'framer-motion'
import { Building2, MapPin, Users, Calendar, DollarSign, Check } from 'lucide-react'
import { AccountData } from '@/lib/types'
import { formatCurrency } from '@/lib/csv-parser'

interface AccountPickerProps {
  accounts: AccountData[]
  selectedAccount: AccountData | null
  onSelect: (account: AccountData) => void
}

export function AccountPicker({ accounts, selectedAccount, onSelect }: AccountPickerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-xl font-semibold text-foreground">Select an Account</h2>
        <p className="text-muted-foreground mt-1">
          Found {accounts.length} account{accounts.length !== 1 ? 's' : ''} in your CSV export
        </p>
      </motion.div>

      <div className="grid gap-3">
        {accounts.map((account, index) => {
          const isSelected = selectedAccount?.id === account.id

          return (
            <motion.button
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(account)}
              className={`
                w-full p-4 rounded-lg border text-left transition-all duration-200
                ${
                  isSelected
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
                }
              `}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                    <h3 className="font-semibold text-foreground truncate">
                      {account.insuredName}
                    </h3>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground"
                      >
                        Selected
                      </motion.span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {account.city && account.state && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">
                          {account.city}, {account.state}
                        </span>
                      </div>
                    )}
                    {account.numberOfEmployees && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span>{account.numberOfEmployees} employees</span>
                      </div>
                    )}
                    {account.effectiveDate && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{account.effectiveDate}</span>
                      </div>
                    )}
                    {account.premium && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{formatCurrency(account.premium)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
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
    </div>
  )
}
