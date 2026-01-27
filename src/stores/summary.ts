import { defineStore } from 'pinia'
import { toRaw } from 'vue'

/* =========================
   Types (ปรับตามโปรเจคมึงได้)
========================= */
export interface ReceiptItem {
  type: string
  itemName: string
  amount: number
}

export interface Receipt {
  id: string
  waybillNumber: string

  fullName: string

  affiliationId: string
  affiliationName: string

  subAffiliationName1?: string
  subAffiliationName2?: string

  netTotalAmount: number

  receiptList: ReceiptItem[]
}

export interface Debtor {
  itemName: string

  originalAmount: number
  paidAmount: number
  balance: number

  isCleared: boolean

  history: {
    amount: number
    date: string
    ref?: string
  }[]
}

export interface LedgerEntry {
  docKey: string

  unitKey: string
  faculty: string

  sub1?: string
  sub2?: string

  direction: 'IN' | 'OUT' | 'MIXED'

  income: number
  debtNew: number
  debtClear: number

  amount: number
  signed: number

  fullName: string
  affiliationId: string
}

/* =========================
   Helpers
========================= */

function emptyTotals() {
  return {
    income: 0,
    debtNew: 0,
    debtClear: 0,
    signed: 0
  }
}

/* =========================
   Store
========================= */

export const useSummaryStore = defineStore('summary', {
  state: () => ({
    /* ---------- Main Storage ---------- */

    // receipt ต้นทาง (ไม่แก้)
    receiptsByDoc: {} as Record<string, Receipt>,

    // debtor แยกเก็บเอง
    debtorsByDoc: {} as Record<string, Debtor[]>,

    // ledger ต่อ doc
    ledgerByDoc: {} as Record<string, LedgerEntry>,

    // รวมทั้งหมด
    totals: emptyTotals()
  }),

  getters: {
    getDebtors:
      (state) =>
      (docKey: string): Debtor[] => {
        return state.debtorsByDoc[docKey] || []
      },

    getLedger:
      (state) =>
      (docKey: string): LedgerEntry | undefined => {
        return state.ledgerByDoc[docKey]
      }
  },

  actions: {
    /* =========================
       Ingest Receipt (ครั้งแรก / update receipt)
    ========================= */

    ingestUpsert(receipt: Receipt) {
      const docKey = receipt.id || receipt.waybillNumber
      if (!docKey) return

      const clean = toRaw(receipt)

      /* เก็บ receipt */
      this.receiptsByDoc[docKey] = clean

      /* ถ้ายังไม่มี debtor → init */
      if (!this.debtorsByDoc[docKey]) {
        this.debtorsByDoc[docKey] = this.buildInitialDebtors(clean)
      }

      /* rebuild ledger */
      this.rebuildLedger(docKey)
    },

    /* =========================
       Build debtor ครั้งแรกจาก receipt
    ========================= */

    buildInitialDebtors(receipt: Receipt): Debtor[] {
      const list: Debtor[] = []

      receipt.receiptList.forEach((item) => {
        // filter ตามระบบมึง
        if (item.type !== 'income') return
        if (!item.itemName.includes('ลูกหนี้')) return

        list.push({
          itemName: item.itemName,

          originalAmount: item.amount,
          paidAmount: 0,
          balance: item.amount,

          isCleared: false,

          history: []
        })
      })

      return list
    },

    /* =========================
       Apply Clear Debt
    ========================= */

    applyDebtClear(
      docKey: string,
      payload: {
        itemName: string
        amount: number
        ref?: string
      }
    ) {
      const list = this.debtorsByDoc[docKey]
      if (!list) return

      const target = list.find(
        (d) => d.itemName === payload.itemName
      )

      if (!target) return

      /* update debt */
      target.paidAmount += payload.amount

      target.balance = Math.max(
        0,
        target.originalAmount - target.paidAmount
      )

      target.isCleared = target.balance <= 0.01

      /* history */
      target.history.push({
        amount: payload.amount,
        date: new Date().toISOString(),
        ref: payload.ref
      })

      /* rebuild ledger */
      this.rebuildLedger(docKey)
    },

    /* =========================
       Rebuild Ledger per doc
    ========================= */

    rebuildLedger(docKey: string) {
      const receipt = this.receiptsByDoc[docKey]
      const debtors = this.debtorsByDoc[docKey] || []

      if (!receipt) return

      /* rollback ของเก่า */
      if (this.ledgerByDoc[docKey]) {
        this.rollbackLedger(this.ledgerByDoc[docKey])
      }

      /* calc debt */
      let debtNew = 0
      let debtClear = 0

      debtors.forEach((d) => {
        debtNew += d.originalAmount
        debtClear += d.paidAmount
      })

      const income = receipt.netTotalAmount

      const ledger: LedgerEntry = {
        docKey,

        unitKey: receipt.affiliationId,
        faculty: receipt.affiliationName,

        sub1: receipt.subAffiliationName1,
        sub2: receipt.subAffiliationName2,

        direction: 'MIXED',

        income,

        debtNew,
        debtClear,

        amount: 0,

        signed: income - debtClear,

        fullName: receipt.fullName,
        affiliationId: receipt.affiliationId
      }

      this.applyLedger(ledger)

      this.ledgerByDoc[docKey] = ledger
    },

    /* =========================
       Apply Ledger to Totals
    ========================= */

    applyLedger(entry: LedgerEntry) {
      this.totals.income += entry.income
      this.totals.debtNew += entry.debtNew
      this.totals.debtClear += entry.debtClear
      this.totals.signed += entry.signed
    },

    rollbackLedger(entry: LedgerEntry) {
      this.totals.income -= entry.income
      this.totals.debtNew -= entry.debtNew
      this.totals.debtClear -= entry.debtClear
      this.totals.signed -= entry.signed
    },

    /* =========================
       Reset (optional)
    ========================= */

    resetAll() {
      this.receiptsByDoc = {}
      this.debtorsByDoc = {}
      this.ledgerByDoc = {}
      this.totals = emptyTotals()
    }
  }
})
