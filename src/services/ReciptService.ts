// services/ReciptService.ts
import http from '@/lib/http'
import type { ApprovalStatus, Receipt } from '@/types/recipt'

/**
 * DTO สำหรับการสร้างใบนำส่งใหม่
 */
export type CreateReceiptInput = Omit<
  Receipt,
  'id' | 'createdAt' | 'updatedAt' | 'isLocked' | 'approvalStatus'
> & {
  waybillNumber: string
}

/**
 * DTO สำหรับการอัปเดตใบนำส่ง
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
 * Service สำหรับจัดการใบนำส่งเงิน
 */
class ReciptService {
  /**
   * 📋 ดึงข้อมูลใบนำส่งทั้งหมด
   */
  async getAll(): Promise<Receipt[]> {
    try {
      const res = await http.get('/receipts')
      const data = res.data

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

      return receipts.filter(
        r => r && typeof r === 'object' && r.approvalStatus
      )
    } catch (error) {
      console.error('❌ Error fetching receipts:', error)
      throw new Error('ไม่สามารถโหลดข้อมูลใบนำส่งได้')
    }
  }

  /**
   * 🔍 ดึงข้อมูลใบนำส่งตาม waybillNumber
   */
  async getById(waybillNumber: string): Promise<Receipt> {
    try {
      const res = await http.get<Receipt>(
        `/receipts/${encodeURIComponent(waybillNumber)}`
      )

      if (!res.data) {
        throw new Error('ไม่พบข้อมูลใบนำส่ง')
      }

      return res.data
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
      const res = await http.get<CheckWaybillNumberResponse>(
        `/checkwaybillNumber/${encodeURIComponent(waybillNumber)}`
      )
      return res.data.exists
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
      const exists = await this.checkWaybillNumber(input.waybillNumber)
      if (exists) {
        throw new Error(`เลขที่นำส่ง "${input.waybillNumber}" มีอยู่ในระบบแล้ว`)
      }

      const receipt: Receipt = {
        ...input,
        id: input.waybillNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvalStatus: 'pending',
        isLocked: false,
      }

      const res = await http.post<Receipt>('/receipts/save', receipt)

      this.notifyUpdate('create')
      return res.data
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
      const current = await this.getById(waybillNumber)

      const updated: Receipt = {
        ...current,
        ...input,
        id: waybillNumber,
        updatedAt: new Date().toISOString(),
      }

      const res = await http.put<Receipt>(
        `/updateReceipt/${encodeURIComponent(waybillNumber)}`,
        updated
      )

      this.notifyUpdate('update')
      return res.data
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
      await http.delete(
        `/deleteReceipt/${encodeURIComponent(waybillNumber)}`
      )
      this.notifyUpdate('delete')
    } catch (error) {
      console.error('❌ Error deleting receipt:', error)
      throw new Error('ไม่สามารถลบใบนำส่งได้')
    }
  }

  /**
   * ✅ อนุมัติใบนำส่ง
   */
  async approve(
    waybillNumber: string,
    approverName: string
  ): Promise<Receipt> {
    try {
      const current = await this.getById(waybillNumber)

      if (current.approvalStatus === 'approved') {
        throw new Error('ใบนำส่งนี้ได้รับการอนุมัติแล้ว')
      }

      if (current.isLocked) {
        throw new Error('ไม่สามารถอนุมัติได้ เนื่องจากวันนี้ปิดยอดแล้ว')
      }

      const approved: Receipt = {
        ...current,
        approvalStatus: 'approved',
        updatedAt: new Date().toISOString(),
      }

      const res = await http.post<Receipt>('/updateReceipt', {
        receipt: approved,
      })

      this.notifyUpdate('approve')
      return res.data
    } catch (error: any) {
      console.error('❌ Error approving receipt:', error)
      throw new Error(error.message || 'ไม่สามารถอนุมัติใบนำส่งได้')
    }
  }

  /**
   * 🔒 ตรวจสอบว่าใบนำส่งถูกล็อกหรือไม่
   */
  isReceiptLocked(receipt: Receipt): boolean {
    if (receipt.isLocked) return true
    if (!receipt.createdAt) return false

    const createdDate = new Date(receipt.createdAt)
    const today = new Date()

    return createdDate.toDateString() !== today.toDateString()
  }

  /**
   * 📊 กรองใบนำส่งตามสถานะ
   */
  filterByStatus(receipts: Receipt[], status: ApprovalStatus): Receipt[] {
    return receipts.filter(r => r && r.approvalStatus === status)
  }

  /**
   * 📊 กรองใบนำส่งตามสังกัด
   */
  filterByAffiliation(receipts: Receipt[], affiliationId: string): Receipt[] {
    return receipts.filter(r => r && r.affiliationId === affiliationId)
  }

  /**
   * 📊 คำนวณสถิติ
   */
  calculateStats(receipts: Receipt[]) {
    const validReceipts = receipts.filter(r => r && r.approvalStatus)

    const cancelledItemsCount = validReceipts.reduce((count, r) => {
      if (!Array.isArray(r.receiptList)) return count
      return count + r.receiptList.filter(i => i.isCancelled).length
    }, 0)

    const calcAmount = (r: Receipt) => {
      if (!Array.isArray(r.receiptList)) {
        return Number(r.netTotalAmount) || 0
      }

      return r.receiptList.reduce((sum, item) => {
        if (item.isCancelled) return sum
        const amount = Number(item.amount) || 0
        return sum + (item.type === 'expense' ? -amount : amount)
      }, 0)
    }

    return {
      total: validReceipts.length,
      pending: this.filterByStatus(validReceipts, 'pending').length,
      approved: this.filterByStatus(validReceipts, 'approved').length,
      totalAmount: validReceipts.reduce((s, r) => s + calcAmount(r), 0),
      pendingAmount: this.filterByStatus(validReceipts, 'pending')
        .reduce((s, r) => s + calcAmount(r), 0),
      approvedAmount: this.filterByStatus(validReceipts, 'approved')
        .reduce((s, r) => s + calcAmount(r), 0),
      cancelledItemsCount,
    }
  }

/**
 * 📊 ดึงข้อมูลลูกหนี้จาก receipt (แปลงจาก receiptList)
 */
getDebtorsFromReceipt(receipt: Receipt): Array<{
  itemName: string
  originalAmount: number
  paidAmount: number
  balance: number
  isCleared: boolean
  history: Array<{
    amount: number
    date: string
    ref?: string
  }>
}> {
  if (!receipt.receiptList) return []

  return receipt.receiptList
    .filter(item => item.type === 'income' && item.itemName.includes('ลูกหนี้'))
    .map(item => {
      // ✅ พยายามแปลง note เป็น debt data
      try {
        if (item.note) {
          const parsed = JSON.parse(item.note)
          if (parsed.originalAmount !== undefined) {
            return parsed
          }
        }
      } catch (e) {
        // ignore parse error
      }

      // ✅ ถ้าไม่มี note หรือ parse ไม่ได้ → สร้างใหม่
      return {
        itemName: item.itemName,
        originalAmount: item.amount,
        paidAmount: 0,
        balance: item.amount,
        isCleared: false,
        history: []
      }
    })
}
  /**
   * 🔔 แจ้งเตือนการอัปเดตข้อมูล
   */
  private notifyUpdate(
    action: 'create' | 'update' | 'delete' | 'approve'
  ) {
    localStorage.setItem(
      'receipts_last_update',
      Date.now().toString()
    )

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
      const e = event as CustomEvent
      callback(e.detail?.action || 'unknown')
    }

    window.addEventListener('receipts-updated', handler)
    return () =>
      window.removeEventListener('receipts-updated', handler)
  }
}

export const reciptService = new ReciptService()
export default ReciptService

