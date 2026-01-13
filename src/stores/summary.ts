// stores/summary.ts
import { defineStore } from 'pinia'
import type { Receipt } from '@/types/recipt'

type EventType = 'WAYBILL' | 'DEBTOR_NEW' | 'CLEAR_DEBTOR'

type Direction = 'INCOME' | 'DEBT_NEW' | 'DEBT_CLEAR'

export type LedgerEntry = {
  docKey: string            // projectCode หรือ id
  eventType: EventType
  direction: Direction
  amount: number            // บวกเสมอ (absolute)
  signed: number            // ค่าที่ใช้รวมสุทธิ (INCOME/DEBT_CLEAR = +, DEBT_NEW = -)

  unitKey: string           // faculty|sub1|sub2 (ละเอียดสุด)
  faculty: string
  sub1: string
  sub2: string

  createdAt: string
  updatedAt: string

  // meta เพื่อ audit
  fundName: string
  fullName: string
  projectCode: string
}

export type UnitAgg = {
  unitKey: string
  faculty: string
  sub1: string
  sub2: string

  docs: number
  income: number
  debtNew: number
  debtClear: number
  net: number

  byDoc: Record<string, LedgerEntry> // docKey -> entry (ตรวจสอบย้อนกลับ)
}

export type DashboardTotals = {
  docs: number
  income: number
  debtNew: number
  debtClear: number
  net: number
}

const toNum = (v: any) => {
  const n = Number(String(v ?? 0).replaceAll(',', '').trim())
  return Number.isFinite(n) ? n : 0
}

const safeStr = (v: any) => String(v ?? '').trim()

const detectEventType = (r: any): EventType => {
  const note = String(r.moneyTypeNote || '').toLowerCase()
  if (note.includes('clear')) return 'CLEAR_DEBTOR'
  if (note.includes('debtor')) return 'DEBTOR_NEW'
  return 'WAYBILL'
}

const eventTypeToDirection = (t: EventType): Direction => {
  if (t === 'DEBTOR_NEW') return 'DEBT_NEW'
  if (t === 'CLEAR_DEBTOR') return 'DEBT_CLEAR'
  return 'INCOME'
}

const signedByDirection = (dir: Direction, amount: number) => {
  const a = Math.abs(amount)
  return dir === 'DEBT_NEW' ? -a : a
}

const makeUnitKey = (faculty: string, sub1: string, sub2: string) => `${faculty}|${sub1}|${sub2}`

const emptyTotals = (): DashboardTotals => ({
  docs: 0,
  income: 0,
  debtNew: 0,
  debtClear: 0,
  net: 0,
})

const initUnitAgg = (u: { unitKey: string; faculty: string; sub1: string; sub2: string }): UnitAgg => ({
  unitKey: u.unitKey,
  faculty: u.faculty,
  sub1: u.sub1,
  sub2: u.sub2,
  docs: 0,
  income: 0,
  debtNew: 0,
  debtClear: 0,
  net: 0,
  byDoc: {},
})

/**
 * ✅ สำคัญ: amount ที่ใช้ใน summary ต้อง “ตรงนิยาม” ที่คุณต้องการ
 * - ถ้าคุณเชื่อถือ netTotalAmount/totalPaymentAmount ใน Receipt แล้ว: ใช้ได้เลย (เร็ว)
 * - ถ้าคุณอยากละเอียดถึงระดับรายการย่อย: ต้องคำนวณจาก receiptList/depositList/debtorList
 *
 * ตอนนี้ผมตั้งให้ใช้:
 *   amount = netTotalAmount (fallback totalPaymentAmount)
 * เพื่อให้ตรงกับ mock ที่คุณมีอยู่แล้วและไม่พัง
 */
const calcAmountFromReceipt = (r: any, eventType: EventType) => {
  // ถ้าหนี้ใหม่: อาจใช้ netTotalAmount (หรือ sum debtorList ถ้าคุณเก็บ)
  const a = toNum(r.netTotalAmount) || toNum(r.totalPaymentAmount) || toNum(r.amount)
  return a
}

const receiptToLedger = (r: Receipt): LedgerEntry | null => {
  const docKey = safeStr((r as any).projectCode || (r as any).id)
  if (!docKey) return null

  const eventType = detectEventType(r as any)
  const direction = eventTypeToDirection(eventType)

  const faculty = safeStr((r as any).mainAffiliationName || (r as any).affiliationName || 'มหาวิทยาลัยพะเยา')
  const sub1 = safeStr((r as any).subAffiliationName1 || '')
  const sub2 = safeStr((r as any).subAffiliationName2 || '')
  const unitKey = makeUnitKey(faculty, sub1, sub2)

  const amount = Math.abs(calcAmountFromReceipt(r as any, eventType))
  const signed = signedByDirection(direction, amount)

  const createdAt = safeStr((r as any).createdAt || new Date().toISOString())
  const updatedAt = safeStr((r as any).updatedAt || createdAt)

  return {
    docKey,
    eventType,
    direction,
    amount,
    signed,
    unitKey,
    faculty,
    sub1,
    sub2,
    createdAt,
    updatedAt,
    fundName: safeStr((r as any).fundName || (r as any).moneyTypeNote || ''),
    fullName: safeStr((r as any).fullName || ''),
    projectCode: safeStr((r as any).projectCode || ''),
  }
}

export const useSummaryStore = defineStore('Summary', {
  state: () => ({
    /** ledger ล่าสุดต่อเอกสาร (ละเอียดสุด ตรวจสอบย้อนกลับได้) */
    ledgerByDoc: {} as Record<string, LedgerEntry>, // docKey -> entry

    /** รวมยอดแยกหน่วยแบบละเอียดสุด */
    unitsByKey: {} as Record<string, UnitAgg>, // unitKey -> agg

    /** รวมยอดภาพรวม */
    totals: emptyTotals(),

    logs: [] as Array<{ time: number; message: string }>,
  }),

  getters: {
    /** list หน่วยงานเรียงตาม net มาก -> น้อย */
    units(state): UnitAgg[] {
      return Object.values(state.unitsByKey).sort((a, b) => b.net - a.net)
    },

    /** หน่วยงานที่ติดหนี้ (net < 0) */
    debtUnits(state): UnitAgg[] {
      return Object.values(state.unitsByKey)
        .filter((u) => u.net < 0)
        .sort((a, b) => a.net - b.net)
    },

    /** ledger เรียง updated ล่าสุดก่อน */
    ledger(state): LedgerEntry[] {
      return Object.values(state.ledgerByDoc).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    },
  },

  actions: {
    log(message: string) {
      this.logs.unshift({ time: Date.now(), message })
      if (this.logs.length > 50) this.logs.length = 50
    },

    /** ✅ rebuild ทั้งหมดจาก ledgerByDoc (ชัวร์สุดสำหรับเงิน) */
    rebuildAll() {
      const totals = emptyTotals()
      const units: Record<string, UnitAgg> = {}

      const entries = Object.values(this.ledgerByDoc)
      for (const e of entries) {
        totals.docs += 1
        if (e.direction === 'INCOME') totals.income += e.amount
        if (e.direction === 'DEBT_NEW') totals.debtNew += e.amount
        if (e.direction === 'DEBT_CLEAR') totals.debtClear += e.amount
        totals.net += e.signed

        if (!units[e.unitKey]) units[e.unitKey] = initUnitAgg(e)
        const u = units[e.unitKey]

        u.docs += 1
        u.byDoc[e.docKey] = e
        if (e.direction === 'INCOME') u.income += e.amount
        if (e.direction === 'DEBT_NEW') u.debtNew += e.amount
        if (e.direction === 'DEBT_CLEAR') u.debtClear += e.amount
        u.net += e.signed
      }

      this.totals = totals
      this.unitsByKey = units
    },

    /** ✅ create/update ใช้ชุดเดียวกัน: upsert ledger */
    ingestUpsert(receipt: Receipt, source: 'create' | 'update' | 'clear') {
      const entry = receiptToLedger(receipt)
      if (!entry) return

      this.ledgerByDoc[entry.docKey] = entry
      this.rebuildAll()
      this.log(`ingestUpsert(${source}): ${entry.docKey} ${entry.direction} ${entry.amount}`)
    },

    ingestDelete(docKey: string) {
      const key = safeStr(docKey)
      if (!key) return
      if (this.ledgerByDoc[key]) delete this.ledgerByDoc[key]
      this.rebuildAll()
      this.log(`ingestDelete: ${key}`)
    },

    ingestMany(receipts: Receipt[]) {
      for (const r of receipts) {
        const entry = receiptToLedger(r)
        if (entry) this.ledgerByDoc[entry.docKey] = entry
      }
      this.rebuildAll()
      this.log(`ingestMany: ${receipts.length}`)
    },

    reset() {
      this.ledgerByDoc = {}
      this.unitsByKey = {}
      this.totals = emptyTotals()
      this.log('reset summary')
    },
  },
})
