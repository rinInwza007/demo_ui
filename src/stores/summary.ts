// stores/summary.ts
import { defineStore } from 'pinia'
import type { Receipt } from '@/types/recipt'
import type {
  LedgerEntry,
  UnitAgg,
  DashboardTotals,
} from '@/types/summary'
import { getItemType, getItemByName, getItemById } from '@/components/data/ItemNameOption'
import { ReceiptMode } from "@/types/summary"

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
  safeStr(receipt.waybillNumber) ||
  safeStr((receipt as any).delNumber) ||
  safeStr((receipt as any).id)

  console.log('🔍 Processing receipt:', { waybillNumber: receipt.waybillNumber, delNumber, hasReceiptList: !!receipt.receiptList })

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
    const itemId = item.itemId || null

    // ✅ ถ้าไม่มี itemId ให้หาจาก itemName
    const resolvedItemId = itemId || getItemByName(itemName)?.id || null

    const itemType = getItemType(resolvedItemId || itemName)
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
        itemId: resolvedItemId,
        fullName,

        createdAt,
        updatedAt,

        isClearedDebt,

        _originalReceipt: receipt,
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
        itemId: resolvedItemId,
        fullName,

        createdAt,
        updatedAt,

        isClearedDebt: true,

        _originalReceipt: receipt,
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
        itemId: resolvedItemId,
        fullName,

        createdAt,
        updatedAt,

        _originalReceipt: receipt,
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

    ledgerByDoc: {} as Record<string, LedgerEntry[]>,

    receiptsByDoc: {} as Record<string, Receipt>,
  }),

  getters: {
    units: (s) => Object.values(s.unitsByKey),

    ledger: (s) => {
      const all: LedgerEntry[] = []
      Object.values(s.ledgerByDoc).forEach(entries => {
        all.push(...entries)
      })
      return all
    },

    // ✅ รวมรายการลูกหนี้ตาม itemId
    pendingDebts: (s) => {
      const groupedByItemId: Record<string, any> = {}

      Object.values(s.ledgerByDoc).forEach(ledgers => {
        ledgers.forEach(ledger => {
          if (ledger.direction === 'DEBT_NEW' && !ledger.isClearedDebt) {
            // ✅ ใช้ itemId เป็น key หลัก (ถ้าไม่มีให้ใช้ fundName)
            const itemId = ledger.itemId || ledger.fundName
            const key = `item-${itemId}`

            if (!groupedByItemId[key]) {
              // ✅ ดึงข้อมูล Item จาก itemId
              const itemData = ledger.itemId ? getItemById(ledger.itemId) : null

              groupedByItemId[key] = {
                id: key,
                itemId: ledger.itemId,
                itemName: ledger.fundName,
                department: ledger.faculty,
                subDepartment: ledger.sub1 || ledger.sub2 || '-',

                // ✅ ยอดเงิน
                depositNetAmount: 0, // ยอดยกยอดจากต้นปี (ถ้ามี)
                debtorAmount: 0, // ยอดที่ล้างสะสมในปีนี้ (0 เพราะยังไม่ได้ล้าง)
                balanceAmount: 0, // ยอดคงเหลือสุทธิ (จะบวกทีละรายการ)

                affiliationId: ledger.affiliationId,

                // ✅ เก็บรายการต้นฉบับทั้งหมด
                _receipts: [],
                _originalReceipt: ledger._originalReceipt,
              }
            }

            // ✅ บวกยอดเงิน
            groupedByItemId[key].balanceAmount += ledger.amount

            // ✅ เก็บข้อมูลรายการย่อย
            groupedByItemId[key]._receipts.push({
              receiptId: ledger.delNumber,
              amount: ledger.amount,
              responsible: ledger.fullName,
              createdAt: ledger.createdAt,
              docKey: ledger.docKey,
            })
          }
        })
      })

      return Object.values(groupedByItemId)
    }
  },

  actions: {
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

    ingestUpsert(
      receipt: Receipt,
      mode: 'create' | 'update' | 'clear'
    ) {
      const docKey = safeStr(
        (receipt as any).projectCode || (receipt as any).id
      )
      if (!docKey) return

      if (mode !== 'create' && this.ledgerByDoc[docKey]) {
        this.ledgerByDoc[docKey].forEach((e) => this.rollbackLedger(e))
      }

      const ledgers = receiptToLedgers(receipt, mode)
      ledgers.forEach((e) => this.applyLedger(e))

      this.ledgerByDoc[docKey] = ledgers

      this.receiptsByDoc[docKey] = receipt
    },

    ingestDelete(docKey: string) {
      const key = safeStr(docKey)
      const ledgers = this.ledgerByDoc[key]
      if (!ledgers) return

      ledgers.forEach((e) => this.rollbackLedger(e))
      delete this.ledgerByDoc[key]
      delete this.receiptsByDoc[key]
    },

    ingestMany(receipts: Receipt[]) {
      this.reset()
      receipts.forEach((r) => this.ingestUpsert(r, 'create'))
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

function getAffiliationId(faculty: string): string {
  const mapping: Record<string, string> = {
    'คณะแพทยศาสตร์': 'MED',
    'คณะพยาบาลศาสตร์': 'NUR',
    'คณะทันตแพทยศาสตร์': 'DEN',
  }
  return mapping[faculty] || ''
}
