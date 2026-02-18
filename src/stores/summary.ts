import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { isReceivableItem } from '@/components/data/ItemNameOption'
import { ReceiptItem ,ReceiptItemType } from '@/types/recipt'
/* =========================
   Types
========================= */


export interface Receipt {
  id: string
  waybillNumber: string
  fullName: string
  affiliationId: string
  affiliationName: string
  subAffiliationName1?: string
  subAffiliationName2?: string
  fundName?: string
  netTotalAmount: number
  receiptList: ReceiptItem[]

  // ✅ เพิ่ม profile support
  profile?: {
    affiliationId?: string
    affiliationName?: string
    subAffiliationName1?: string
    subAffiliationName2?: string
    fundName?: string
  }
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
  fundName?: string
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
    receiptsByDoc: {} as Record<string, Receipt>,
    debtorsByDoc: {} as Record<string, Debtor[]>,
    ledgerByDoc: {} as Record<string, LedgerEntry>,
    totals: emptyTotals(),

    clearHistory: {} as Record<string, Array<{
      itemName: string
      amount: number
      date: string
      ref?: string
    }>>
  }),

  actions: {
buildInitialDebtors(receipt: Receipt): Debtor[] {
  if (!receipt.receiptList || !Array.isArray(receipt.receiptList)) {
    console.warn('⚠️ No receiptList found:', receipt.id)
    return []
  }

  return receipt.receiptList
    .filter(item => {
      // ✅ กรองเฉพาะรายการที่เป็น receivable (ลูกหนี้)
      // ใช้ itemId หรือ itemName ในการตรวจสอบ
      if (item.itemId) {
        return isReceivableItem(item.itemId)
      } else if (item.itemName) {
        return isReceivableItem(item.itemName)
      }
      return false
    })
    .map(item => ({
      itemName: item.itemName,
      originalAmount: Number(item.amount) || 0,
      paidAmount: 0,
      balance: Number(item.amount) || 0,
      isCleared: false,
      history: []
    }))
},

    /* =========================
       ✅ Rebuild Ledger - สร้าง ledger entry
    ========================= */
    rebuildLedger(docKey: string) {
      const receipt = this.receiptsByDoc[docKey]
      const debtors = this.debtorsByDoc[docKey]

      if (!receipt) {
        console.warn('⚠️ No receipt found for docKey:', docKey)
        return
      }

      // ✅ ดึงข้อมูลจาก profile หรือ receipt
      const affiliationName = receipt.profile?.affiliationName || receipt.affiliationName || ''
      const affiliationId = receipt.profile?.affiliationId || receipt.affiliationId || ''
      const sub1 = receipt.profile?.subAffiliationName1 || receipt.subAffiliationName1 || ''
      const sub2 = receipt.profile?.subAffiliationName2 || receipt.subAffiliationName2 || ''
      const fundName = receipt.profile?.fundName || receipt.fundName || ''

      // ✅ คำนวณยอดรวม
      const totalDebt = debtors?.reduce((sum, d) => sum + d.originalAmount, 0) || 0
      const totalCleared = debtors?.reduce((sum, d) => sum + d.paidAmount, 0) || 0
      const totalBalance = debtors?.reduce((sum, d) => sum + d.balance, 0) || 0

      // ✅ สร้าง unitKey
      const unitKey = [affiliationName, sub1, sub2, fundName]
        .filter(Boolean)
        .join('::')

      this.ledgerByDoc[docKey] = {
        docKey,
        unitKey,
        faculty: affiliationName,
        sub1,
        sub2,
        direction: 'IN',
        income: receipt.netTotalAmount || 0,
        debtNew: totalDebt,
        debtClear: totalCleared,
        amount: totalBalance,
        signed: totalBalance,
        fullName: receipt.fullName || '',
        affiliationId,
        fundName
      }

      // ✅ อัปเดท totals
      this.recalculateTotals()
    },

    /* =========================
       ✅ Recalculate Totals
    ========================= */
    recalculateTotals() {
      const totals = {
        income: 0,
        debtNew: 0,
        debtClear: 0,
        signed: 0
      }

      Object.values(this.ledgerByDoc).forEach(ledger => {
        totals.income += ledger.income
        totals.debtNew += ledger.debtNew
        totals.debtClear += ledger.debtClear
        totals.signed += ledger.signed
      })

      this.totals = totals
    },

    /* =========================
       Ingest Receipt
    ========================= */
    ingestUpsert(receipt: Receipt) {
      const docKey = receipt.id || receipt.waybillNumber
      if (!docKey) {
        console.warn('⚠️ No docKey found:', receipt)
        return
      }

      const clean = toRaw(receipt)
      this.receiptsByDoc[docKey] = clean

      // ✅ ถ้ามี debtor อยู่แล้ว → รักษาสถานะไว้
      if (this.debtorsByDoc[docKey]) {
        console.log(`📦 Preserving existing debtor state for ${docKey}`)
      } else {
        // ✅ สร้างใหม่
        this.debtorsByDoc[docKey] = this.buildInitialDebtors(clean)
        console.log(`✨ Created new debtors for ${docKey}:`, this.debtorsByDoc[docKey].length)
      }

      this.rebuildLedger(docKey)
      this.saveToLocalStorage()
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
      if (!list) {
        console.warn('⚠️ No debtors found for docKey:', docKey)
        return
      }

      const target = list.find(d => d.itemName === payload.itemName)
      if (!target) {
        console.warn('⚠️ Debtor not found:', payload.itemName)
        return
      }

      // ✅ Update debt
      target.paidAmount += payload.amount
      target.balance = Math.max(0, target.originalAmount - target.paidAmount)
      target.isCleared = target.balance <= 0.01

      // ✅ History
      target.history.push({
        amount: payload.amount,
        date: new Date().toISOString(),
        ref: payload.ref
      })

      // ✅ เก็บประวัติ
      if (!this.clearHistory[docKey]) {
        this.clearHistory[docKey] = []
      }
      this.clearHistory[docKey].push({
        itemName: payload.itemName,
        amount: payload.amount,
        date: new Date().toISOString(),
        ref: payload.ref
      })

      this.rebuildLedger(docKey)
      this.saveToLocalStorage()

      console.log('✅ Debt cleared:', {
        docKey,
        itemName: payload.itemName,
        amount: payload.amount,
        newBalance: target.balance,
        isCleared: target.isCleared
      })
    },

    /* =========================
       Reset All
    ========================= */
    resetAll() {
      this.receiptsByDoc = {}
      this.debtorsByDoc = {}
      this.ledgerByDoc = {}
      this.clearHistory = {}
      this.totals = emptyTotals()
      localStorage.removeItem('summaryStore_state')
      console.log('🗑️ Summary store reset')
    },

    /* =========================
       LocalStorage
    ========================= */
    saveToLocalStorage() {
      try {
        const data = {
          debtorsByDoc: this.debtorsByDoc,
          clearHistory: this.clearHistory,
          savedAt: Date.now()
        }
        localStorage.setItem('summaryStore_state', JSON.stringify(data))
        console.log('💾 Summary state saved to localStorage')
      } catch (error) {
        console.error('❌ Error saving to localStorage:', error)
      }
    },

    loadFromLocalStorage(): boolean {
      try {
        const raw = localStorage.getItem('summaryStore_state')
        if (!raw) return false

        const data = JSON.parse(raw)

        this.debtorsByDoc = data.debtorsByDoc || {}
        this.clearHistory = data.clearHistory || {}

        console.log('📦 Summary state loaded from localStorage')
        console.log('   Debtors:', Object.keys(this.debtorsByDoc).length)
        console.log('   Clear history:', Object.keys(this.clearHistory).length)

        return true
      } catch (error) {
        console.error('❌ Error loading summary state:', error)
        return false
      }
    }
  }
})
