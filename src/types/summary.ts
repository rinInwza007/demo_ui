// src/types/summary.ts

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
  updatedAt: string  // ✅ เพิ่ม updatedAt

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
  debtorList: DebtorItem[]

  // จำนวนและยอดเงิน
  totalAmount: number

  // การชำระเงิน
  payments: PaymentDetail[]

  // สถานะ (optional - ถ้าไม่ใช้ก็ไม่ต้องมี)
  status?: 'pending' | 'completed' | 'cancelled'
}

// ✅ Input สำหรับสร้าง ClearSummary ใหม่
export interface CreateClearSummaryInput {
  fullName: string
  phone: string
  mainAffiliationId: string
  mainAffiliationName: string
  subAffiliationId1?: string
  subAffiliationName1?: string
  subAffiliationId2?: string
  subAffiliationName2?: string
  fundName?: string
  sendmoney?: string
  projectCode?: string
  debtorList: DebtorItem[]
  payments: PaymentDetail[]
  totalAmount: number
}