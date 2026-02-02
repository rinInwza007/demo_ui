// src/services/Approve/ApproveService.ts
import type { Receipt } from '@/types/recipt'
import { approveReceipt, rejectReceipt } from './ApproveApi'

/**
 * ============================================
 * 📝 Approve Service
 * - รับผิดชอบการอนุมัติ/ยกเลิกการอนุมัติใบนำส่ง
 * - ไม่แก้ไขข้อมูลอื่นๆ เปลี่ยนแค่สถานะ
 * - ใช้ ApproveApi เป็น API Client
 * ============================================
 */

class ApproveService {
  /**
   * ✅ อนุมัติใบนำส่ง
   */
  async approve(
    waybillNumber: string,
    approverName: string
  ): Promise<Receipt> {
    try {
      console.log('✅ [Service] Approving receipt:', waybillNumber)

      const receipt = await approveReceipt(waybillNumber, { approverName })

      console.log('✅ [Service] Approved successfully:', waybillNumber)
      
      // แจ้งเตือนการอัปเดต
      this.notifyUpdate('approve', waybillNumber)

      return receipt

    } catch (error: any) {
      console.error('❌ [Service] Approve error:', error)
      throw error
    }
  }

  /**
   * 🔄 ยกเลิกการอนุมัติใบนำส่ง (เปลี่ยนกลับเป็น pending)
   */
  async reject(
    waybillNumber: string,
    approverName?: string,
    reason?: string
  ): Promise<Receipt> {
    try {
      console.log('🔄 [Service] Reverting receipt to pending:', waybillNumber)

      const receipt = await rejectReceipt(waybillNumber, { 
        approverName,
        reason 
      })

      console.log('✅ [Service] Reverted to pending successfully:', waybillNumber)
      
      // แจ้งเตือนการอัปเดต
      this.notifyUpdate('reject', waybillNumber)

      return receipt

    } catch (error: any) {
      console.error('❌ [Service] Reject error:', error)
      throw error
    }
  }

  /**
   * ✅ ตรวจสอบว่าสามารถอนุมัติได้หรือไม่
   */
  canApprove(receipt: Receipt): { canApprove: boolean; reason?: string } {
    // ถ้าปิดยอดแล้ว
    if (receipt.isLocked) {
      return {
        canApprove: false,
        reason: 'ไม่สามารถดำเนินการได้ เนื่องจากวันนี้ปิดยอดแล้ว'
      }
    }

    // ถ้าไม่ใช่สถานะ pending
    if (receipt.approvalStatus !== 'pending') {
      return {
        canApprove: false,
        reason: 'สามารถอนุมัติได้เฉพาะใบนำส่งที่มีสถานะ "รอดำเนินการ" เท่านั้น'
      }
    }

    return { canApprove: true }
  }

  /**
   * 🔄 ตรวจสอบว่าสามารถยกเลิกการอนุมัติได้หรือไม่
   */
  canReject(receipt: Receipt): { canReject: boolean; reason?: string } {
    // ถ้าปิดยอดแล้ว
    if (receipt.isLocked) {
      return {
        canReject: false,
        reason: 'ไม่สามารถดำเนินการได้ เนื่องจากวันนี้ปิดยอดแล้ว'
      }
    }

    // ✅ สามารถยกเลิกได้เฉพาะสถานะ approved
    if (receipt.approvalStatus !== 'approved') {
      return {
        canReject: false,
        reason: 'สามารถยกเลิกการอนุมัติได้เฉพาะใบนำส่งที่มีสถานะ "อนุมัติแล้ว" เท่านั้น'
      }
    }

    return { canReject: true }
  }

  /**
   * 📊 สรุปสถานะการอนุมัติ
   */
  summarizeApprovalStatus(receipts: Receipt[]): {
    total: number
    pending: number
    approved: number
    rejected: number
    canApprove: number
    canReject: number
  } {
    const total = receipts.length
    const pending = receipts.filter(r => r.approvalStatus === 'pending').length
    const approved = receipts.filter(r => r.approvalStatus === 'approved').length
    const rejected = receipts.filter(r => r.approvalStatus === 'rejected').length
    const canApprove = receipts.filter(r => this.canApprove(r).canApprove).length
    const canReject = receipts.filter(r => this.canReject(r).canReject).length

    return {
      total,
      pending,
      approved,
      rejected,
      canApprove,
      canReject
    }
  }

  /**
   * 🔔 แจ้งเตือนการอัปเดตสถานะ
   */
  private notifyUpdate(action: 'approve' | 'reject', waybillNumber: string): void {
    const ts = Date.now().toString()
    localStorage.setItem('receipts_last_update', ts)

    window.dispatchEvent(
      new CustomEvent('receipts-updated', {
        detail: {
          action,
          waybillNumber,
          timestamp: ts
        }
      })
    )

    console.log('🔔 [Service] Notified update:', action, waybillNumber)
  }

  /**
   * 🔄 รอการอัปเดตสถานะ
   */
  onUpdate(callback: (action: string, waybillNumber: string) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent
      const { action, waybillNumber } = customEvent.detail || {}
      
      if (action === 'approve' || action === 'reject') {
        callback(action, waybillNumber)
      }
    }

    window.addEventListener('receipts-updated', handler)

    return () => {
      window.removeEventListener('receipts-updated', handler)
    }
  }
}

// ✅ Export singleton instance
export const approveService = new ApproveService()

// ✅ Export class for testing
export default ApproveService