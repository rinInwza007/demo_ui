import { defineStore } from 'pinia'
import type { Receipt } from '@/types/recipt'
import type {
  LedgerEntry,
  UnitAgg,
  DashboardTotals,
} from '@/types/summary'

import { receiptToLedgerEntry } from '@/mappers/ledger/receiptToLedger'

/* =========================
 * Utils
 * ========================= */
const emptyTotals = (): DashboardTotals => ({
  docs: 0,
  income: 0,
  debtNew: 0,
  debtClear: 0,
  net: 0,
})

const initUnitAgg = (e: LedgerEntry): UnitAgg => ({
  unitKey: e.unitKey,
  faculty: e.faculty,
  sub1: e.sub1,
  sub2: e.sub2,

  docs: 0,
  income: 0,
  debtNew: 0,
  debtClear: 0,
  net: 0,

  byDoc: {},
})

/* =========================
 * Store
 * ========================= */
export const useSummaryStore = defineStore('Summary', {
  state: () => ({
    totals: emptyTotals(),
    unitsByKey: {} as Record<string, UnitAgg>,

    // 1 receipt = 1 ledger entry
    ledgerByDoc: {} as Record<string, LedgerEntry>,

    receiptsByDoc: {} as Record<string, Receipt>,
  }),

  getters: {
    units: (s) => Object.values(s.unitsByKey),

    ledger: (s) => Object.values(s.ledgerByDoc),

    /**
     * ลูกหนี้คงค้าง (ใช้กับ UI หน้า clear)
     * derive จาก ledger โดยตรง
     */
    pendingDebtors: (s) => {
      const map = new Map<string, any>()

      Object.values(s.ledgerByDoc).forEach((e) => {
        if (e.direction !== 'DEBT_NEW' && e.direction !== 'DEBT_CLEAR') return

        const key = e.fullName
        if (!key) return

        if (!map.has(key)) {
          map.set(key, {
            debtorKey: key,
            fullName: e.fullName,
            affiliationId: e.affiliationId,
            faculty: e.faculty,
            totalDebt: 0,
            totalCleared: 0,
            balance: 0,
          })
        }

        const row = map.get(key)

        if (e.direction === 'DEBT_NEW') row.totalDebt += e.amount
        if (e.direction === 'DEBT_CLEAR') row.totalCleared += e.amount

        row.balance = row.totalDebt - row.totalCleared
      })

      return Array.from(map.values()).filter((r) => r.balance > 0)
    },
  },

  actions: {
    /* =========================
     * core apply / rollback
     * ========================= */

    applyLedger(e: LedgerEntry) {
      // ---------- unit agg ----------
      if (!this.unitsByKey[e.unitKey]) {
        this.unitsByKey[e.unitKey] = initUnitAgg(e)
      }
      const u = this.unitsByKey[e.unitKey]

      if (!u.byDoc[e.docKey]) u.docs++
      u.byDoc[e.docKey] = e

      if (e.direction === 'INCOME') u.income += e.amount
      if (e.direction === 'DEBT_NEW') u.debtNew += e.amount
      if (e.direction === 'DEBT_CLEAR') u.debtClear += e.amount
      u.net += e.signed

      // ---------- totals ----------
      this.totals.docs++
      if (e.direction === 'INCOME') this.totals.income += e.amount
      if (e.direction === 'DEBT_NEW') this.totals.debtNew += e.amount
      if (e.direction === 'DEBT_CLEAR') this.totals.debtClear += e.amount
      this.totals.net += e.signed
    },

    rollbackLedger(e: LedgerEntry) {
      const u = this.unitsByKey[e.unitKey]
      if (!u || !u.byDoc[e.docKey]) return

      delete u.byDoc[e.docKey]
      u.docs--

      if (e.direction === 'INCOME') u.income -= e.amount
      if (e.direction === 'DEBT_NEW') u.debtNew -= e.amount
      if (e.direction === 'DEBT_CLEAR') u.debtClear -= e.amount
      u.net -= e.signed

      this.totals.docs--
      if (e.direction === 'INCOME') this.totals.income -= e.amount
      if (e.direction === 'DEBT_NEW') this.totals.debtNew -= e.amount
      if (e.direction === 'DEBT_CLEAR') this.totals.debtClear -= e.amount
      this.totals.net -= e.signed

      if (u.docs <= 0) delete this.unitsByKey[e.unitKey]
    },

    /* =========================
     * ingest
     * ========================= */

    ingestUpsert(receipt: Receipt) {
      const docKey = receipt.id
      if (!docKey) return

      // rollback old
      if (this.ledgerByDoc[docKey]) {
        this.rollbackLedger(this.ledgerByDoc[docKey])
      }

      const ledger = receiptToLedgerEntry(receipt)
      this.applyLedger(ledger)

      this.ledgerByDoc[docKey] = ledger
      this.receiptsByDoc[docKey] = receipt
    },

    ingestDelete(docKey: string) {
      const ledger = this.ledgerByDoc[docKey]
      if (!ledger) return

      this.rollbackLedger(ledger)
      delete this.ledgerByDoc[docKey]
      delete this.receiptsByDoc[docKey]
    },

    ingestMany(receipts: Receipt[]) {
      this.reset()
      receipts.forEach((r) => this.ingestUpsert(r))
    },
  clearAll() {
    this.reset()
  },
  reset() {
    this.totals = emptyTotals()
    this.unitsByKey = {}
    this.ledgerByDoc = {}
    this.receiptsByDoc = {}
  },
  },
})
