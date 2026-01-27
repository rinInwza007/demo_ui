// src/types/ClearSummaryTypes.ts

export interface DebtorItem {
  waybillNumber: string
  itemName: string
  amount: number
  isCleared: boolean
  note?: string
}

export interface ClearSummary {
  id: string
  createdAt: string

  totalItems: number
  totalAmount: number

  debtorList: DebtorItem[]
}
