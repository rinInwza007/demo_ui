// src/types/recipt.ts
import type { User } from '@/types/user'
import { Affiliation } from './affiliation'
import {Profile} from './Profile'
export type moneySource = 'นำส่ง' | 'ลูกหนี้' | 'วิจัย'



export type nagativeMoneyType = 'add' | 'other'
export type MoneyType = 'bank' | 'cash' | 'transfer' | 'debtor' | 'other'
export type ItemType = 'RECEIPT' | 'DEBTOR'
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
  id: string
  name: string
  type: ItemType
  affiliationId: string
  userId: string
  createdAt: string
  updatedAt: string
  affiliation?: Affiliation
}

export interface ReceiptItem {
  itemId?: number
  itemName: string
  note?: string
  referenceNo?: string
  amount: number
  subtotal?: number
  type: ReceiptItemType
  isCancelled?: boolean

  // ✅ เพิ่มฟิลด์สำหรับประเภทการชำระ
  paymentTypes?: {
    cash: boolean
    check: boolean
    transfer: boolean
  }

 cashDetails?: {
    amount: string | number
  }

  // ✅ แก้ไข checkDetails ให้มี amount
  checkDetails?: {
    amount: string | number
    bankName: string
    checkNumber: string
    numInCheck: string
  }

  // ✅ แก้ไข transferDetails ให้มี amount
  transferDetails?: {
    amount: string | number
    accountData: {
      accountNumber: string
      bankName: string
      accountName: string
    }
  }
}

export interface Receipt {
  id: string
  profile:Profile
  waybillNumber: string
  approvalStatus?: ApprovalStatus
  netTotalAmount: number
  receiptList: ReceiptItem[]
  affiliationId?: string
  affiliationName: string
  isLocked?: boolean
  createdAt: string
  updatedAt: string
  projectCode:string
}
