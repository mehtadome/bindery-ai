"use client";

import { motion } from "framer-motion";
import { Building2, MapPin, Briefcase, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import type { AccountData } from "@/app/types";
import { formatDate } from "@/app/lib/csv-parser";

interface AccountPickerProps {
  accounts: AccountData[];
  selectedAccount: AccountData | null;
  onSelect: (account: AccountData) => void;
}

interface AccountCardProps {
  account: AccountData;
  isSelected: boolean;
  index: number;
  onSelect: (account: AccountData) => void;
}

function AccountCardStatus({ status }: { status: AccountData["status"] }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted font-medium">
        <Loader2 className="w-3 h-3 animate-spin" />
        Resolving account...
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-medium">
        <AlertTriangle className="w-3 h-3" />
        Could not resolve — review manually
      </span>
    );
  }
  return null;
}

function AccountCard({ account, isSelected, index, onSelect }: AccountCardProps) {
  const isPending = account.status === "pending";

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25, ease: "easeOut" }}
      onClick={() => onSelect(account)}
      className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
        isSelected
          ? "border-red bg-red/5 ring-2 ring-red/20"
          : "border-border bg-white hover:border-red/40"
      } ${isPending ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">

          {/* name row */}
          <div className="flex items-center gap-2 mb-2">
            <Building2 className={`w-4 h-4 shrink-0 ${isSelected ? "text-red" : "text-brown"}`} />
            {isPending ? (
              <AccountCardStatus status="pending" />
            ) : (
              <span className="text-sm font-black text-foreground truncate">
                {account.insuredName || "Unknown Account"}
              </span>
            )}
          </div>

          {/* meta row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {(account.city || account.state) && (
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <MapPin className="w-3 h-3" />
                {[account.city, account.state].filter(Boolean).join(", ")}
              </span>
            )}
            {account.naicsCode && (
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <Briefcase className="w-3 h-3" />
                NAICS {account.naicsCode}
              </span>
            )}
            {account.effectiveDate && (
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <Calendar className="w-3 h-3" />
                Eff. {formatDate(account.effectiveDate)}
              </span>
            )}
          </div>

          {/* failed status */}
          {account.status === "failed" && (
            <div className="mt-2">
              <AccountCardStatus status="failed" />
            </div>
          )}

        </div>

        {/* selected indicator */}
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-red flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </motion.button>
  );
}

export default function AccountPicker({ accounts, selectedAccount, onSelect }: AccountPickerProps) {
  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-brown mb-1">Select an Account</h2>
        <p className="text-sm text-muted">
          Found {accounts.length} account{accounts.length !== 1 ? "s" : ""} in your CSV export
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {accounts.map((account, index) => (
          <AccountCard
            key={account.id}
            account={account}
            isSelected={selectedAccount?.id === account.id}
            index={index}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
