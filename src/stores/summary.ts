// stores/summary.ts
import { defineStore } from 'pinia'
import type { Receipt } from '@/types/recipt'
import type {
  LedgerEntry,
  UnitAgg,
  DashboardTotals,
} from '@/types/summary'
import { getItemType } from '@/components/data/ItemNameOption'

import { ReceiptMode} from "@/types/summary"

/* =========================
 * Utils
 * ========================= */
const toNum = (v: any) => {
  const n = Number(String(v ?? 0).replaceAll(',', '').trim())
  return Number.isFinite(n) ? n : 0
}
const safeStr = (v: any) => String(v ?? '').trim()
const makeUnitKey = (f: string, s1: string, s2: string) => `${f}|${s1}|${s2}`

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
 * Receipt → Ledger
 * ========================= */
const receiptToLedgers = (
  receipt: Receipt,
  mode: ReceiptMode
): LedgerEntry[] => {
  const ledgers: LedgerEntry[] = []

  const delNumber =
    safeStr((receipt as any).delNumber) ||
    safeStr((receipt as any).id)

  if (!delNumber) return ledgers
  if (!Array.isArray(receipt.receiptList)) return ledgers

  const faculty = safeStr(receipt.mainAffiliationName)
  const sub1 = safeStr(receipt.subAffiliationName1)
  const sub2 = safeStr(receipt.subAffiliationName2)
  const unitKey = makeUnitKey(faculty, sub1, sub2)
  const affiliationId = getAffiliationId(faculty)

  const createdAt = safeStr(receipt.createdAt)
  const updatedAt = safeStr(receipt.updatedAt || receipt.createdAt)
  const fullName = safeStr(receipt.fullName)

  receipt.receiptList.forEach((item, index) => {
    const amount = toNum(item.amount)
    if (amount <= 0) return

    const itemName = safeStr(item.itemName)
    const itemType = getItemType(itemName)
    const isClearedDebt = item.isClearedDebt === true

    /* =========================
     * DEBT NEW
     * ========================= */
    if (itemType === 'receivable') {
      ledgers.push({
        docKey: `${delNumber}-DEBT-${index}`,
        delNumber,

        eventType: 'DEBTOR_NEW',
        direction: 'DEBT_NEW',

        amount,
        signed: -amount,

        unitKey,
        faculty,
        sub1,
        sub2,

        affiliationId,
        fundName: itemName,
        fullName,

        createdAt,
        updatedAt,

        isClearedDebt,
      })
    }

    /* =========================
     * CLEAR DEBT
     * ========================= */
    if (itemType === 'clear') {
      ledgers.push({
        docKey: `${delNumber}-CLR-${index}`,
        delNumber,

        eventType: 'CLEAR_DEBTOR',
        direction: 'DEBT_CLEAR',

        amount,
        signed: amount,

        unitKey,
        faculty,
        sub1,
        sub2,

        affiliationId,
        fundName: itemName,
        fullName,

        createdAt,
        updatedAt,

        isClearedDebt: true,
      })
    }

    /* =========================
     * INCOME (ถ้ามี)
     * ========================= */
    if (itemType === 'income') {
      ledgers.push({
        docKey: `${delNumber}-INC-${index}`,
        delNumber,

        eventType: 'WAYBILL',
        direction: 'INCOME',

        amount,
        signed: amount,

        unitKey,
        faculty,
        sub1,
        sub2,

        affiliationId,
        fundName: itemName,
        fullName,

        createdAt,
        updatedAt,
      })
    }
  })

  return ledgers
}


/* =========================
 * Store
 * ========================= */
export const useSummaryStore = defineStore('Summary', {
  state: () => ({
    totals: emptyTotals(),
    unitsByKey: {} as Record<string, UnitAgg>,

    // 🔑 cache ledger ต่อ receipt
    ledgerByDoc: {} as Record<string, LedgerEntry[]>,
  }),

  getters: {
    units: (s) => Object.values(s.unitsByKey),
  },

  actions: {
    /* =========================
     * core ledger ops
     * ========================= */

    applyLedger(e: LedgerEntry) {
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
     * public APIs (Step 3)
     * ========================= */

    ingestUpsert(
      receipt: Receipt,
      mode: 'create' | 'update' | 'clear'
    ) {
      const docKey = safeStr(
        (receipt as any).projectCode || (receipt as any).id
      )
      if (!docKey) return

      // ♻️ rollback old
      if (mode !== 'create' && this.ledgerByDoc[docKey]) {
        this.ledgerByDoc[docKey].forEach((e) => this.rollbackLedger(e))
      }

      // 🔄 apply new
      const ledgers = receiptToLedgers(receipt, mode)
      ledgers.forEach((e) => this.applyLedger(e))

      this.ledgerByDoc[docKey] = ledgers
    },

    ingestDelete(docKey: string) {
      const key = safeStr(docKey)
      const ledgers = this.ledgerByDoc[key]
      if (!ledgers) return

      ledgers.forEach((e) => this.rollbackLedger(e))
      delete this.ledgerByDoc[key]
    },

    ingestMany(receipts: Receipt[]) {
      this.reset()
      receipts.forEach((r) => this.ingestUpsert(r, 'create'))
    },

    reset() {
      this.totals = emptyTotals()
      this.unitsByKey = {}
      this.ledgerByDoc = {}
    },
  },
})
