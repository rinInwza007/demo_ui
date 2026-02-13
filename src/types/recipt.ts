// src/types/recipt.ts
import { User } from './user'
import { Affiliation } from './affiliation'
import {Profile} from './Profile'
import {CashReceiptType,CheckReceiptType,TransferReceiptType} from './payment'
export type moneySource = 'นำส่ง' | 'ลูกหนี้' | 'วิจัย'

export type nagativeMoneyType = 'add' | 'other'
export type ItemType = 'income' | 'receivable' | 'research'
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
  type: ReceiptItemType
  isCancelled?: boolean
  receiptType?: PaymentType[]
}

export interface Receipt {
  id: string
  profile:Profile
  waybillNumber: string
  approvalStatus?: ApprovalStatus
  netTotalAmount: number
  receiptList: ReceiptItem[]
  isLocked?: boolean
  createdAt: string
  updatedAt: string
}
