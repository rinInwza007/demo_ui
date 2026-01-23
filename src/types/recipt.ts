// src/types/recipt.ts
import { User } from './user'
import { Affiliation } from './affiliation'
// ✅ Import Types ของธนาคารจากไฟล์เดียว
import type { BankAccountData, BankTransfer } from './BankTypes'

export type moneySource = 'นำส่ง' | 'ลูกหนี้' | 'วิจัย'

export type nagativeMoneyType = 'add' | 'other'

export type MoneyType = 'bank' | 'cash' | 'transfer' | 'debtor' | 'other'
export type ItemType = 'income' | 'receivable' | 'research'
export type ReceiptItemType = 'income' | 'expense'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface indexsavedebtor {
  id: number
  item: Item
  beginningOFTheYear: number
  totalOftheYear: number
  createAt: Date
  updateAt: Date
}

export interface Item {
  id: number
  name: string
  type: ItemType
  affiliationId: string
  createdAt: Date
  updatedAt: Date
}

export interface ReceiptItem {
  itemId?: number
  itemName: string
  note?: string
  referenceNo?: string
  amount: number
  subtotal?: number
  type: ReceiptItemType
}

export interface PaymentMethod {
  checked: boolean
  amount: number | string
  bankName?: string
  checkNumber?: string
  NumIncheck?: string
  name?: string
}

export interface PaymentMethods {
  cash?: PaymentMethod
  check?: PaymentMethod
  debtor?: PaymentMethod
  other?: PaymentMethod
}

// ✅ ลบ BankAccountData และ BankTransfer ออก (ใช้จาก BankTypes แทน)

export interface Receipt {
  id: string
  waybillNumber: string

  fullName: string
  phone: string

  fundName: string
  projectCode: string | null
  mainAffiliationId?: string
  mainAffiliationName?: string
  subAffiliationId1?: string
  subAffiliationName1?: string
  subAffiliationId2?: string
  subAffiliationName2?: string
  affiliationId: string
  affiliationName: string
  approvalStatus?: ApprovalStatus
  moneyType: string
  sendmoney?: string
  moneyTypeNote?: string
  netTotalAmount: number
  totalPaymentAmount: number

  receiptList: ReceiptItem[]

  paymentMethods?: PaymentMethods
  bankTransfers?: BankTransfer[] // ✅ ใช้จาก BankTypes

  isLocked?: boolean
  createdAt: string
  updatedAt: string
}

// ✅ Re-export เพื่อความสะดวก
export type { BankAccountData, BankTransfer } from './BankTypes'