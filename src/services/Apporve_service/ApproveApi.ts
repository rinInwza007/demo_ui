// src/services/Approve/ApproveApi.ts
import axios from 'axios'
import type { Receipt } from '@/types/recipt'

/**
 * ========================================
 * Approve/Reject API Layer
 * - ทำหน้าที่เป็น API Client
 * - รองรับทั้ง Real API และ Mock API
 * ========================================
 */

export interface ApprovePayload {
  approverName: string
}

export interface RejectPayload {
  approverName: string
  reason?: string
}

export interface ApproveResponse {
  success: boolean
  data?: Receipt
  message?: string
}

/**
 * ✅ POST /receipts/:waybillNumber/approve - อนุมัติใบนำส่ง
 */
export const approveReceipt = async (
  waybillNumber: string,
  payload: ApprovePayload
): Promise<Receipt> => {
  try {
    const encodedWaybillNumber = encodeURIComponent(waybillNumber)
    
    console.log('📡 [API] POST /receipts/' + waybillNumber + '/approve', payload)
    
    const response = await axios.post<ApproveResponse>(
      `/receipts/${encodedWaybillNumber}/approve`,
      payload
    )
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'ไม่สามารถอนุมัติได้')
    }
    
    console.log('✅ [API] Approved:', waybillNumber)
    
    return response.data.data
  } catch (error: any) {
    console.error('❌ [API] Error approving receipt:', error)
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('ไม่พบใบนำส่งที่ต้องการอนุมัติ')
    }
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'ไม่สามารถอนุมัติได้')
    }
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    
    throw error
  }
}

/**
 * 🔄 GET /receipts/:waybillNumber/approval-status - ดึงสถานะการอนุมัติ (Optional)
 */
export const getApprovalStatus = async (waybillNumber: string): Promise<{
  status: 'pending' | 'approved' | 'rejected'
  canApprove: boolean
  reason?: string
}> => {
  try {
    const encodedWaybillNumber = encodeURIComponent(waybillNumber)
    
    console.log('📡 [API] GET /receipts/' + waybillNumber + '/approval-status')
    
    const response = await axios.get<{
      success: boolean
      data: {
        status: 'pending' | 'approved' | 'rejected'
        canApprove: boolean
        reason?: string
      }
    }>(`/receipts/${encodedWaybillNumber}/approval-status`)
    
    if (!response.data.success) {
      throw new Error('ไม่สามารถดึงสถานะได้')
    }
    
    console.log('✅ [API] Got approval status:', response.data.data.status)
    
    return response.data.data
  } catch (error: any) {
    console.error('❌ [API] Error getting approval status:', error)
    throw error
  }
}