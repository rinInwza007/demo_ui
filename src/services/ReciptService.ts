// services/ReciptService.ts
import axios from 'axios'
import type { AxiosResponse } from 'axios'
import type { ApprovalStatus, Receipt } from '@/types/recipt'

/**
 * DTO สำหรับการสร้างใบนำส่งใหม่
 * ไม่ต้องส่ง id, timestamps, approvalStatus (ระบบจะสร้างให้)
 */
export type CreateReceiptInput = Omit<
  Receipt,
  'id' | 'createdAt' | 'updatedAt' | 'isLocked' | 'approvalStatus'
> & {
  waybillNumber: string // required
}

/**
 * DTO สำหรับการอัปเดตใบนำส่ง
 * ทุกฟิลด์เป็น optional ยกเว้น id/timestamps/waybillNumber
 */
export type UpdateReceiptInput = Partial<
  Omit<Receipt, 'id' | 'waybillNumber' | 'createdAt'>
>

/**
 * Response จากการตรวจสอบเลขที่นำส่งซ้ำ
 */
export interface CheckWaybillNumberResponse {
  exists: boolean
}

/**
 * Service สำหรับจัดการใบนำส่งเงิน (Waybill/Receipt)
 */
class ReciptService {
  /**
   * 📋 ดึงข้อมูลใบนำส่งทั้งหมด
   */
async getAll(): Promise<Receipt[]> {
  try {
    const res = await axios.get('/getReceipt')
    const data = res.data

    // กันทุก format
    let receipts: any[] = []

    if (Array.isArray(data)) {
      receipts = data
    } else if (Array.isArray(data?.data)) {
      receipts = data.data
    } else if (Array.isArray(data?.receipts)) {
      receipts = data.receipts
    } else {
      console.warn('⚠️ Unexpected API format:', data)
      return []
    }

    // ✅ กรองเฉพาะ receipts ที่ valid และมี approvalStatus
    return receipts.filter(r => r && typeof r === 'object' && r.approvalStatus)
  } catch (error) {
    console.error('❌ Error fetching receipts:', error)
    throw new Error('ไม่สามารถโหลดข้อมูลใบนำส่งได้')
  }
}

  /**
   * 🔍 ดึงข้อมูลใบนำส่งตาม ID (waybillNumber)
   */
  async getById(waybillNumber: string): Promise<Receipt> {
    try {
      const response: AxiosResponse<Receipt> = await axios.get(
        `/getReceipt/${waybillNumber}`
      )

      if (!response.data) {
        throw new Error('ไม่พบข้อมูลใบนำส่ง')
      }

      return response.data
    } catch (error) {
      console.error(`❌ Error fetching receipt ${waybillNumber}:`, error)
      throw new Error('ไม่สามารถโหลดข้อมูลใบนำส่งได้')
    }
  }

  /**
   * ✅ ตรวจสอบว่าเลขที่นำส่งซ้ำหรือไม่
   */
  async checkWaybillNumber(waybillNumber: string): Promise<boolean> {
    try {
      const response: AxiosResponse<CheckWaybillNumberResponse> = await axios.get(
        `/checkwaybillNumber/${waybillNumber}`
      )
      return response.data.exists
    } catch (error) {
      console.error('❌ Error checking waybill number:', error)
      return false
    }
  }

  /**
   * ➕ สร้างใบนำส่งใหม่
   */
  async create(input: CreateReceiptInput): Promise<Receipt> {
    try {
      // ✅ ตรวจสอบเลขที่นำส่งซ้ำก่อน
      const exists = await this.checkWaybillNumber(input.waybillNumber)
      if (exists) {
        throw new Error(`เลขที่นำส่ง "${input.waybillNumber}" มีอยู่ในระบบแล้ว`)
      }

      // ✅ สร้าง Receipt object จาก input
      const receipt: Receipt = {
        ...input,
        id: input.waybillNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvalStatus: 'pending',
        isLocked: false,
      }

      const response: AxiosResponse<Receipt> = await axios.post(
        '/saveReceipt',
        receipt
      )

      // ✅ แจ้งเตือนการอัปเดต
      this.notifyUpdate('create')

      return response.data
    } catch (error: any) {
      console.error('❌ Error creating receipt:', error)

      if (error.response?.status === 409) {
        throw new Error('เลขที่นำส่งนี้มีอยู่ในระบบแล้ว')
      }

      throw new Error(error.message || 'ไม่สามารถบันทึกใบนำส่งได้')
    }
  }

  /**
   * ✏️ แก้ไขใบนำส่ง
   */
  async update(
    waybillNumber: string,
    input: UpdateReceiptInput
  ): Promise<Receipt> {
    try {
      // ✅ ดึงข้อมูลเดิมมาก่อน
      const current = await this.getById(waybillNumber)

      // ✅ Merge ข้อมูลใหม่เข้ากับข้อมูลเดิม
      const updated: Receipt = {
        ...current,
        ...input,
        id: waybillNumber,
        updatedAt: new Date().toISOString(),
      }

      const response: AxiosResponse<Receipt> = await axios.put(
        `/updateReceipt/${waybillNumber}`,
        updated
      )

      // ✅ แจ้งเตือนการอัปเดต
      this.notifyUpdate('update')

      return response.data
    } catch (error: any) {
      console.error('❌ Error updating receipt:', error)
      throw new Error(
        error.response?.data?.message || 'ไม่สามารถอัปเดตใบนำส่งได้'
      )
    }
  }

  /**
   * 🗑️ ลบใบนำส่ง
   */
  async delete(waybillNumber: string): Promise<void> {
    try {
      await axios.delete(`/deleteReceipt/${waybillNumber}`)

      // ✅ แจ้งเตือนการอัปเดต
      this.notifyUpdate('delete')
    } catch (error) {
      console.error('❌ Error deleting receipt:', error)
      throw new Error('ไม่สามารถลบใบนำส่งได้')
    }
  }

  /**
   * ✅ อนุมัติใบนำส่ง (สำหรับกองคลัง)
   */
  async approve(waybillNumber: string, approverName: string): Promise<Receipt> {
    try {
      // 1. ดึงข้อมูลปัจจุบัน
      const current = await this.getById(waybillNumber)

      // 2. ตรวจสอบสถานะ
      if (current.approvalStatus === 'approved') {
        throw new Error('ใบนำส่งนี้ได้รับการอนุมัติแล้ว')
      }

      if (current.isLocked) {
        throw new Error('ไม่สามารถอนุมัติได้ เนื่องจากวันนี้ปิดยอดแล้ว')
      }

      // 3. อัปเดตสถานะ
      const approved: Receipt = {
        ...current,
        approvalStatus: 'approved',
        // approverName, // ⚠️ ถ้า Receipt type ไม่มี approverName ให้เอาออก
        // approvedAt: new Date().toISOString(), // ⚠️ ถ้า Receipt type ไม่มี approvedAt ให้เอาออก
        updatedAt: new Date().toISOString(),
      }

      const response: AxiosResponse<Receipt> = await axios.post(
        '/updateReceipt',
        {
          receipt: approved,
        }
      )

      // ✅ แจ้งเตือนการอัปเดต
      this.notifyUpdate('approve')

      return response.data
    } catch (error: any) {
      console.error('❌ Error approving receipt:', error)
      throw new Error(error.message || 'ไม่สามารถอนุมัติใบนำส่งได้')
    }
  }
  /**
   * 🔒 ตรวจสอบว่าใบนำส่งถูกล็อก (ปิดยอด) หรือไม่
   */
  isReceiptLocked(receipt: Receipt): boolean {
    if (receipt.isLocked) return true

    // ตรวจสอบจาก createdAt
    if (!receipt.createdAt) return false

    const createdDate = new Date(receipt.createdAt)
    const today = new Date()

    // ถ้าสร้างก่อนวันนี้ถือว่าถูกล็อก (ตาม business logic ของคุณ)
    return createdDate.toDateString() !== today.toDateString()
  }

  /**
   * 📊 กรองใบนำส่งตามสถานะ
   */
  filterByStatus(receipts: Receipt[], status: ApprovalStatus): Receipt[] {
  return receipts.filter((r) => r && r.approvalStatus === status)
}

  /**
   * 📊 กรองใบนำส่งตามสังกัด
   */
  filterByAffiliation(receipts: Receipt[], affiliationId: string): Receipt[] {
  return receipts.filter((r) => r && r.affiliationId === affiliationId)
}

  /**
   * 📊 คำนวณสถิติ
   */
calculateStats(receipts: Receipt[]): {
  total: number
  pending: number
  approved: number
  totalAmount: number
  pendingAmount: number
  approvedAmount: number
} {
  // กรอง receipts ที่ valid ก่อน
  const validReceipts = receipts.filter(r => r && r.approvalStatus)

  return {
    total: validReceipts.length,
    pending: this.filterByStatus(validReceipts, 'pending').length,
    approved: this.filterByStatus(validReceipts, 'approved').length,
    totalAmount: validReceipts.reduce(
      (sum, r) => sum + (Number(r.netTotalAmount) || 0),
      0
    ),
    pendingAmount: this.filterByStatus(validReceipts, 'pending').reduce(
      (sum, r) => sum + (Number(r.netTotalAmount) || 0),
      0
    ),
    approvedAmount: this.filterByStatus(validReceipts, 'approved').reduce(
      (sum, r) => sum + (Number(r.netTotalAmount) || 0),
      0
    ),
  }
}

  /**
   * 🔔 แจ้งเตือนการอัปเดตข้อมูล (สำหรับ sync ระหว่างหน้า)
   */
  private notifyUpdate(
    action: 'create' | 'update' | 'delete' | 'approve' 
  ): void {
    // อัปเดต localStorage timestamp
    localStorage.setItem('receipts_last_update', Date.now().toString())

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent('receipts-updated', {
        detail: { action },
      })
    )
  }

  /**
   * 🔄 รอการอัปเดตข้อมูล
   */
  onUpdate(callback: (action: string) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent
      callback(customEvent.detail?.action || 'unknown')
    }

    window.addEventListener('receipts-updated', handler)

    // Return cleanup function
    return () => {
      window.removeEventListener('receipts-updated', handler)
    }
  }
}

// ✅ Export singleton instance
export const reciptService = new ReciptService()

// ✅ Export class สำหรับ testing
export default ReciptService
