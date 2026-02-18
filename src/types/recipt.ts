// src/types/recipt.ts
import { User } from './user'
import { Affiliation } from './affiliation'
import {Profile} from './Profile'
import {CashReceiptType,CheckReceiptType,TransferReceiptType} from './payment'
import { BankAccount ,BankTransfer} from './BankTypes'

export type moneySource = 'นำส่ง' | 'ลูกหนี้' | 'วิจัย'

export type nagativeMoneyType = 'add' | 'other'
export type ItemType = 'RECEIPT' | 'DEBTOR'
export type ReceiptItemType = 'income' | 'expense'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type PaymentType = CashReceiptType | CheckReceiptType | TransferReceiptType
export type PaymentMethodType = PaymentType['paymentMethod']  // 'cash' | 'check' | 'transfer'



export interface indexsavedebtor {
  id: number
  item: Item
  beginningOFTheYear: number
  totalOftheYear: number
  createAt: Date
  updateAt: Date
}

export interface Item {
  id: string
  name: string
  type: ItemType
  affiliationId: string
  userId?: string
  affiliation?: {
    id: string
    name: string
    type: string
  }
  createdAt: string
  updatedAt: string
}



export interface ReceiptItem {
  itemId?: number
  itemName: string
  note?: string
  referenceNo?: string
  amount: number
  type: ReceiptItemType
  isCancelled?: boolean
  receiptType?: PaymentType[]
}

export interface Receipt {
  id: string
  waybillNumber: string

  // ✅ Required fields สำหรับ backend
  fullName: string
  phone?: string

  // ✅ Foreign Keys
  affiliationId?: string     // รหัสสังกัด
  userId?: string            // รหัสผู้ใช้

  // ✅ Profile (optional)
  profile?: Profile

  // ✅ Approval
  approvalStatus?: ApprovalStatus
  isLocked?: boolean

  // ✅ Amounts
  netTotalAmount: number
  totalPaymentAmount?: number

  // ✅ Payment Details
  paymentMethods?: PaymentMethodType
  bankTransfers?: BankTransfer[]

  // ✅ Receipt Items
  receiptList: ReceiptItem[]

  // ✅ Timestamps
  createdAt: string
  updatedAt: string
}
