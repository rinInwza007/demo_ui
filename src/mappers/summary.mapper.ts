// src/mappers/summary.mapper.ts
import type {
  LedgerEntry,
  UnitAgg,
  DashboardTotals,
} from '@/types/summary'

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
 * 1) Aggregate → Dashboard + Units
 * ========================= */

export function aggregateLedgers(
  ledgers: LedgerEntry[]
): {
  totals: DashboardTotals
  unitsByKey: Record<string, UnitAgg>
} {
  const totals = emptyTotals()
  const unitsByKey: Record<string, UnitAgg> = {}

  for (const e of ledgers) {
    /* ---------- Unit ---------- */
    if (!unitsByKey[e.unitKey]) {
      unitsByKey[e.unitKey] = initUnitAgg(e)
    }
    const u = unitsByKey[e.unitKey]

    if (!u.byDoc[e.docKey]) u.docs++
    u.byDoc[e.docKey] = e

    if (e.direction === 'INCOME') u.income += e.amount
    if (e.direction === 'DEBT_NEW') u.debtNew += e.amount
    if (e.direction === 'DEBT_CLEAR') u.debtClear += e.amount
    u.net += e.signed

    /* ---------- Totals ---------- */
    totals.docs++
    if (e.direction === 'INCOME') totals.income += e.amount
    if (e.direction === 'DEBT_NEW') totals.debtNew += e.amount
    if (e.direction === 'DEBT_CLEAR') totals.debtClear += e.amount
    totals.net += e.signed
  }

  return { totals, unitsByKey }
}

/* =========================
 * 2) Pending Debts (ลูกหนี้คงค้าง)
 * ========================= */

export type PendingDebt = {
  key: string
  delNumber: string
  fullName: string
  fundName: string

  debtorAmount: number
  clearedAmount: number
  balanceAmount: number

  unitKey: string
  faculty: string
  sub1: string
  sub2: string
}

export function mapPendingDebts(
  ledgers: LedgerEntry[]
): PendingDebt[] {
  const map = new Map<string, PendingDebt>()

  for (const e of ledgers) {
    if (e.direction !== 'DEBT_NEW' && e.direction !== 'DEBT_CLEAR') continue

    const key = `${e.delNumber}|${e.fundName}`

    if (!map.has(key)) {
      map.set(key, {
        key,
        delNumber: e.delNumber,
        fullName: e.fullName,
        fundName: e.fundName,

        debtorAmount: 0,
        clearedAmount: 0,
        balanceAmount: 0,

        unitKey: e.unitKey,
        faculty: e.faculty,
        sub1: e.sub1,
        sub2: e.sub2,
      })
    }

    const row = map.get(key)!
    if (e.direction === 'DEBT_NEW') row.debtorAmount += e.amount
    if (e.direction === 'DEBT_CLEAR') row.clearedAmount += e.amount
  }

  for (const r of map.values()) {
    r.balanceAmount = r.debtorAmount - r.clearedAmount
  }

  return [...map.values()].filter(r => r.balanceAmount > 0)
}

/* =========================
 * 3) Helper
 * ========================= */

export function flattenLedgerByDoc(
  ledgerByDoc: Record<string, LedgerEntry[]>
): LedgerEntry[] {
  return Object.values(ledgerByDoc).flat()
}
