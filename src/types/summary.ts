// types/summary.ts

export type EventType = 'WAYBILL' | 'DEBTOR_NEW' | 'CLEAR_DEBTOR'
export type Direction = 'INCOME' | 'DEBT_NEW' | 'DEBT_CLEAR'

export type ReceiptMode = 'create' | 'update' | 'clear'

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

  affiliationId: string

  fundName: string
  fullName: string

  createdAt: Date;
  updatedAt: Date;

  isClearedDebt?: boolean
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
