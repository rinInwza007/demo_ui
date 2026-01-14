// stores/summary.ts
import { defineStore } from 'pinia'
import type { Receipt } from '@/types/recipt'
import { getItemType } from '@/components/data/ItemNameOption'

/* =========================
 * Types
 * ========================= */
type EventType = 'WAYBILL' | 'DEBTOR_NEW' | 'CLEAR_DEBTOR'
type Direction = 'INCOME' | 'DEBT_NEW' | 'DEBT_CLEAR'

export type LedgerEntry = {
  docKey: string
  delNumber: string

  eventType: EventType
  direction: Direction

  amount: number
  signed: number

  unitKey: string
  faculty: string
  sub1: string
  sub2: string

  // ✅ เพิ่ม affiliationId
  affiliationId: string

  fundName: string
  fullName: string

  createdAt: string
  updatedAt: string
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
 * ✅ แมป mainAffiliationName → affiliationId
 * ========================= */
const getAffiliationId = (mainAffiliationName: string): string => {
  const mapping: Record<string, string> = {
    'คณะแพทยศาสตร์': 'MED',
    'โรงพยาบาลมหาวิทยาลัยพะเยา': 'MED',
    'คณะพยาบาลศาสตร์': 'NUR',
    'คณะวิศวกรรมศาสตร์': 'ENG',
    'โรงพยาบาลทันตกรรมมหาวิทยาลัยพะเยา': 'DEN',
    'คณะทันตแพทยศาสตร์': 'DEN',
    'คณะเภสัชศาสตร์': 'PHA',
    'กองคลัง': 'FIN',
  }

  return mapping[mainAffiliationName] || 'UNKNOWN'
}

/* =========================
 * CORE: Receipt → Ledger
 * ========================= */
const receiptToLedgers = (r: Receipt): LedgerEntry[] => {
  const entries: LedgerEntry[] = []

  const delNumber = safeStr((r as any).delNumber)
  if (!delNumber) {
    console.warn('⚠️ No delNumber in receipt:', r)
    return entries
  }

  const faculty = safeStr((r as any).mainAffiliationName || '')
  const sub1 = safeStr((r as any).subAffiliationName1 || '')
  const sub2 = safeStr((r as any).subAffiliationName2 || '')
  const unitKey = makeUnitKey(faculty, sub1, sub2)

  // ✅ แปลงชื่อเป็น affiliationId
  const affiliationId = getAffiliationId(faculty)

  const createdAt = safeStr((r as any).createdAt || new Date().toISOString())
  const updatedAt = safeStr((r as any).updatedAt || createdAt)
  const fullName = safeStr((r as any).fullName || '')

  if (!Array.isArray(r.receiptList)) {
    console.warn(`⚠️ No receiptList in ${delNumber}`)
    return entries
  }

  console.log(`🔍 Processing receipt ${delNumber}`)
  console.log(`   🏢 Faculty: ${faculty} → AffiliationId: ${affiliationId}`)

  r.receiptList.forEach((item: any, i: number) => {
    const amount = toNum(item.amount)
    if (!amount) return

    const itemName = safeStr(item.itemName)
    const actualType = getItemType(itemName)

    if (actualType === 'receivable') {
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
        affiliationId,  // ✅ เพิ่ม
        fundName: itemName,
        fullName,
        createdAt,
        updatedAt,
      })
    } else if (actualType === 'clear') {
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
        affiliationId,  // ✅ เพิ่ม
        fundName: itemName,
        fullName,
        createdAt,
        updatedAt,
      })
    }
  })

  console.log(`✅ Receipt ${delNumber}: Created ${entries.length} ledger entries`)
  return entries
}

/* =========================
 * Store
 * ========================= */
export const useSummaryStore = defineStore('Summary', {
  state: () => ({
    ledgerByDoc: {} as Record<string, LedgerEntry>,
    unitsByKey: {} as Record<string, UnitAgg>,
    totals: emptyTotals(),
  }),

  getters: {
    ledger: (s) => Object.values(s.ledgerByDoc),
    units: (s) => Object.values(s.unitsByKey),

    pendingDebts: (s) => {
      const balanceMap = new Map<string, {
        debtAmount: number
        clearedAmount: number
        balance: number
        entry: LedgerEntry
      }>()

      for (const e of Object.values(s.ledgerByDoc)) {
        if (e.direction === 'DEBT_NEW' || e.direction === 'DEBT_CLEAR') {
          const key = `${e.delNumber}|${e.fundName}`

          const current = balanceMap.get(key) || {
            debtAmount: 0,
            clearedAmount: 0,
            balance: 0,
            entry: e
          }

          if (e.direction === 'DEBT_NEW') {
            current.debtAmount += e.amount
            current.balance -= e.amount
          } else {
            current.clearedAmount += e.amount
            current.balance += e.amount
          }

          if (new Date(e.updatedAt) > new Date(current.entry.updatedAt)) {
            current.entry = e
          }

          balanceMap.set(key, current)
        }
      }

      return [...balanceMap.entries()]
        .filter(([, data]) => data.balance < 0)
        .map(([key, data]) => ({
          id: key,
          delNumber: data.entry.delNumber,
          receiptId: data.entry.delNumber,
          itemName: data.entry.fundName,
          debtorAmount: data.debtAmount,
          depositNetAmount: data.clearedAmount,
          balanceAmount: Math.abs(data.balance),
          department: data.entry.faculty,
          subDepartment: data.entry.sub1,
          affiliationId: data.entry.affiliationId,  // ✅ เพิ่ม
          fundName: data.entry.fundName,
          responsible: data.entry.fullName,
          status: 'pending',
          createdAt: data.entry.createdAt,
          updatedAt: data.entry.updatedAt,
          _ledgerEntry: data.entry,
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    },
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
      console.log('📥 Ingesting receipts:', receipts.length)

      this.ledgerByDoc = {}

      receipts
        .flatMap(receiptToLedgers)
        .forEach((e) => {
          this.ledgerByDoc[e.docKey] = e
        })

      this.rebuildAll()

      console.log('✅ Summary updated')
      console.log('📋 Total ledger entries:', Object.keys(this.ledgerByDoc).length)
      console.log('💰 Debt entries:', Object.values(this.ledgerByDoc).filter(e => e.direction === 'DEBT_NEW').length)
      console.log('🧹 Clear entries:', Object.values(this.ledgerByDoc).filter(e => e.direction === 'DEBT_CLEAR').length)
      console.log('📊 Totals:', this.totals)
    },
  },
})
