// types/debtor.ts

export type DebtorKey = string
// หรือ branded type
// export type DebtorKey = string & { __brand: 'DebtorKey' }

export type DebtorSummary = {
  debtorKey: DebtorKey

  fullName: string
  affiliationId: string
  affiliationName: string

  totalDebt: number
  totalCleared: number
  balance: number
  createdAt: Date;
  updatedAt: Date;
}

export type DebtorOutstanding = {
  totalDebtors: number
  totalOutstandingAmount: number
  byAffiliation: {
    affiliationId: string
    amount: number
  }[]
}
