// src/types/summary.ts (เพิ่มเติม)

export interface DebtorItem {
  waybillNumber: string
  itemName: string
  amount: number
  isCleared: boolean
  note?: string
  receiptNumber?: string
}

export interface PaymentDetail {
  type: 'transfer' | 'cash' | 'check'
  bankName?: string
  accountName?: string
  accountNumber?: string
  amount: number
  checkNumber?: string
  referenceId?: string
}

export interface ClearSummary {
  // ID และอ้างอิง
  id: string
  referenceId: string
  createdAt: string

  // ข้อมูลผู้ทำรายการ
  fullName: string
  phone: string

  // ข้อมูลหน่วยงาน
  mainAffiliationId: string
  mainAffiliationName: string
  subAffiliationId1?: string
  subAffiliationName1?: string
  subAffiliationId2?: string
  subAffiliationName2?: string

  // ข้อมูลกองทุน/โครงการ
  fundName?: string
  sendmoney?: string
  projectCode?: string

  // รายการที่เกี่ยวข้อง
  waybillNumbers: string[]
  debtorList: DebtorItem[]

  // จำนวนและยอดเงิน
  totalItems: number
  totalAmount: number

  // การชำระเงิน
  payments: PaymentDetail[]

  // สถานะ
  status: 'pending' | 'completed' | 'cancelled'
}
