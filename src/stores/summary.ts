// stores/summary.ts
import { defineStore } from 'pinia'
import type { Receipt } from '@/types/recipt'

type EventType = 'WAYBILL' | 'DEBTOR_NEW' | 'CLEAR_DEBTOR'
type Direction = 'INCOME' | 'DEBT_NEW' | 'DEBT_CLEAR'

export type LedgerEntry = {
  /** 🔑 เลขเอกสาร + suffix (INC / DEBT / CLR) */
  docKey: string

  /** 🔑 เลขใบนำส่งจริง (1 ใบ ต่อ 1 เลข) */
  delNumber: string

  eventType: EventType
  direction: Direction
  amount: number
  signed: number

  unitKey: string
  faculty: string
  sub1: string
  sub2: string

  createdAt: string
  updatedAt: string

  fundName: string
  fullName: string
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

  byDoc: Record<string, LedgerEntry>
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

/* =========================================================
 * 🔥 CORE: Receipt → LedgerEntries
 * ========================================================= */
const receiptToLedgers = (r: Receipt): LedgerEntry[] => {
  const entries: LedgerEntry[] = []

  const delNumber = safeStr((r as any).delNumber)
  if (!delNumber) return entries // ❗ ไม่มีเลขนำส่ง = ไม่เอาเข้า summary

  const faculty = safeStr((r as any).mainAffiliationName || 'มหาวิทยาลัยพะเยา')
  const sub1 = safeStr((r as any).subAffiliationName1 || '')
  const sub2 = safeStr((r as any).subAffiliationName2 || '')
  const unitKey = makeUnitKey(faculty, sub1, sub2)

  const createdAt = safeStr((r as any).createdAt || new Date().toISOString())
  const updatedAt = safeStr((r as any).updatedAt || createdAt)

  /* ---------- รายรับ ---------- */
  r.receiptList?.forEach((item: any, i: number) => {
    const amount = toNum(item.amount)
    if (!amount) return

    entries.push({
      docKey: `${delNumber}-INC-${i}`,
      delNumber,
      eventType: 'WAYBILL',
      direction: 'INCOME',
      amount,
      signed: amount,
      unitKey,
      faculty,
      sub1,
      sub2,
      createdAt,
      updatedAt,
      fundName: safeStr(item.itemName),
      fullName: '',
    })
  })

  /* ---------- ลูกหนี้ใหม่ ---------- */
  r.debtorList?.forEach((item: any, i: number) => {
    const amount = toNum(item.amount)
    if (!amount) return

    entries.push({
      docKey: `${delNumber}-DEBT-${i}`,
      delNumber,
      eventType: 'DEBTOR_NEW',
      direction: 'DEBT_NEW',
      amount,
      signed: -amount,
      unitKey,
      faculty,
      sub1,
      sub2,
      createdAt,
      updatedAt,
      fundName: '',
      fullName: safeStr(item.fullName),
    })
  })

  /* ---------- ล้างลูกหนี้ ---------- */
  r.depositList?.forEach((item: any, i: number) => {
    const amount = toNum(item.amount)
    if (!amount) return

    entries.push({
      docKey: `${delNumber}-CLR-${i}`,
      delNumber,
      eventType: 'CLEAR_DEBTOR',
      direction: 'DEBT_CLEAR',
      amount,
      signed: amount,
      unitKey,
      faculty,
      sub1,
      sub2,
      createdAt,
      updatedAt,
      fundName: '',
      fullName: safeStr(item.fullName),
    })
  })

  return entries
}

/* ========================================================= */

export const useSummaryStore = defineStore('Summary', {
  state: () => ({
    ledgerByDoc: {} as Record<string, LedgerEntry>,
    unitsByKey: {} as Record<string, UnitAgg>,
    totals: emptyTotals(),
  }),

  getters: {
    ledger: (s) => Object.values(s.ledgerByDoc),
    units: (s) => Object.values(s.unitsByKey),
  },

  actions: {
    rebuildAll() {
      const totals = emptyTotals()
      const units: Record<string, UnitAgg> = {}

      for (const e of Object.values(this.ledgerByDoc)) {
        totals.docs++
        if (e.direction === 'INCOME') totals.income += e.amount
        if (e.direction === 'DEBT_NEW') totals.debtNew += e.amount
        if (e.direction === 'DEBT_CLEAR') totals.debtClear += e.amount
        totals.net += e.signed

        if (!units[e.unitKey]) units[e.unitKey] = initUnitAgg(e)
        const u = units[e.unitKey]

        u.docs++
        u.byDoc[e.docKey] = e
        if (e.direction === 'INCOME') u.income += e.amount
        if (e.direction === 'DEBT_NEW') u.debtNew += e.amount
        if (e.direction === 'DEBT_CLEAR') u.debtClear += e.amount
        u.net += e.signed
      }

      this.totals = totals
      this.unitsByKey = units
    },

    ingestMany(receipts: Receipt[]) {
      this.ledgerByDoc = {}
      receipts.flatMap(receiptToLedgers).forEach(e => {
        this.ledgerByDoc[e.docKey] = e
      })
      this.rebuildAll()
    },
  },
})
