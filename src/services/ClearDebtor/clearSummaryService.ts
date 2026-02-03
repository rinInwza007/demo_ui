// src/services/ClearDebtor/clearSummaryService.ts

import axios from 'axios'
import type { ClearSummary } from '@/types/summary'

/**
 * รายการหนี้แต่ละรายการ
 */
export interface DebtorItem {
  waybillNumber: string
  itemName: string
  amount: number
  isCleared: boolean
  note?: string
  receiptNumber?: string
}

/**
 * รายละเอียดการชำระเงิน
 */
export interface PaymentDetail {
  type: 'transfer' | 'cash' | 'check'
  bankName?: string
  accountName?: string
  accountNumber?: string
  amount: number
  checkNumber?: string
  referenceId?: string
}

/**
 * Payload สำหรับสร้างรายการล้างหนี้ใหม่
 */
export interface CreateClearSummaryPayload {
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

/**
 * Service สำหรับจัดการรายการล้างหนี้
 */
export const clearSummaryService = {
  /**
   * สร้างรายการล้างหนี้ใหม่
   */
  async create(data: CreateClearSummaryPayload): Promise<ClearSummary> {
    console.log('📝 Creating clear summary:', data)

    try {
      const referenceId = `CLEAR-${Date.now()}`

      const waybillNumbers = Array.from(
        new Set(data.debtorList.map(item => item.waybillNumber))
      )

      const payload: Partial<ClearSummary> = {
        id: referenceId,
        referenceId,
        createdAt: new Date().toISOString(),
        fullName: data.fullName,
        phone: data.phone,
        mainAffiliationId: data.mainAffiliationId,
        mainAffiliationName: data.mainAffiliationName,
        subAffiliationId1: data.subAffiliationId1,
        subAffiliationName1: data.subAffiliationName1,
        subAffiliationId2: data.subAffiliationId2,
        subAffiliationName2: data.subAffiliationName2,
        fundName: data.fundName,
        sendmoney: data.sendmoney,
        projectCode: data.projectCode,
        waybillNumbers,
        debtorList: data.debtorList,
        totalItems: data.debtorList.length,
        totalAmount: data.totalAmount,
        payments: data.payments,
        status: 'completed'
      }

      const response = await axios.post<{ success: boolean; data: ClearSummary }>(
        '/clear-summaries',
        payload
      )

      if (!response.data.success) {
        throw new Error('Failed to create clear summary')
      }

      console.log('✅ Clear summary created:', response.data.data.id)

      this.notifyUpdate('create', response.data.data)

      return response.data.data
    } catch (error) {
      console.error('❌ Error creating clear summary:', error)
      throw new Error('ไม่สามารถบันทึกรายการล้างหนี้ได้')
    }
  },

  /**
   * ดึงรายการล้างหนี้ทั้งหมด
   */
  async getAll(filters?: {
    affiliationId?: string
    startDate?: string
    endDate?: string
  }): Promise<ClearSummary[]> {
    try {
      const params = new URLSearchParams()

      if (filters?.affiliationId) {
        params.append('affiliationId', filters.affiliationId)
      }
      if (filters?.startDate) {
        params.append('startDate', filters.startDate)
      }
      if (filters?.endDate) {
        params.append('endDate', filters.endDate)
      }

      const response = await axios.get<{ success: boolean; data: ClearSummary[] }>(
        `/clear-summaries?${params.toString()}`
      )

      if (!response.data.success) {
        throw new Error('Failed to fetch clear summaries')
      }

      return response.data.data
    } catch (error) {
      console.error('❌ Error fetching clear summaries:', error)
      return []
    }
  },

  /**
   * ดึงรายการล้างหนี้ตาม ID
   */
  async getById(id: string): Promise<ClearSummary | null> {
    try {
      const response = await axios.get<{ success: boolean; data: ClearSummary | null }>(
        `/clear-summaries/${id}`
      )

      return response.data.data
    } catch (error) {
      console.error('❌ Error fetching clear summary:', error)
      return null
    }
  },

  /**
   * ดึงรายการล้างหนี้ตาม referenceId
   */
  async getByReferenceId(referenceId: string): Promise<ClearSummary | null> {
    try {
      const allSummaries = await this.getAll()
      return allSummaries.find(s => s.referenceId === referenceId) || null
    } catch (error) {
      console.error('❌ Error fetching clear summary by reference:', error)
      return null
    }
  },

  /**
   * ดึงประวัติการล้างหนี้ของ waybillNumber ที่ระบุ
   */
  async getByWaybillNumber(waybillNumber: string): Promise<ClearSummary[]> {
    try {
      const allSummaries = await this.getAll()
      return allSummaries.filter(s =>
        s.waybillNumbers?.includes(waybillNumber)
      )
    } catch (error) {
      console.error('❌ Error fetching summaries by waybill:', error)
      return []
    }
  },

  /**
   * อัพเดทรายการล้างหนี้
   */
  async update(id: string, payload: Partial<ClearSummary>): Promise<ClearSummary> {
    try {
      const response = await axios.put<{ success: boolean; data: ClearSummary }>(
        `/clear-summaries/${id}`,
        payload
      )

      if (!response.data.success) {
        throw new Error('Failed to update clear summary')
      }

      this.notifyUpdate('update', response.data.data)

      return response.data.data
    } catch (error) {
      console.error('❌ Error updating clear summary:', error)
      throw new Error('ไม่สามารถอัปเดตรายการล้างหนี้ได้')
    }
  },

  /**
   * ลบรายการล้างหนี้
   */
  async delete(id: string): Promise<boolean> {
    try {
      const response = await axios.delete<{ success: boolean; deleted: number }>(
        `/clear-summaries/${id}`
      )

      if (response.data.success && response.data.deleted > 0) {
        this.notifyUpdate('delete', { id } as any)
        return true
      }

      return false
    } catch (error) {
      console.error('❌ Error deleting clear summary:', error)
      return false
    }
  },

  /**
   * แจ้งเตือนการอัปเดตข้อมูล
   */
  notifyUpdate(
    action: 'create' | 'update' | 'delete',
    data: ClearSummary
  ): void {
    localStorage.setItem('clear_summaries_last_update', Date.now().toString())

    window.dispatchEvent(
      new CustomEvent('clear-summaries-updated', {
        detail: { action, data },
      })
    )
  },

  /**
   * รอการอัปเดตข้อมูล
   */
  onUpdate(callback: (action: string, data: ClearSummary) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent
      callback(
        customEvent.detail?.action || 'unknown',
        customEvent.detail?.data
      )
    }

    window.addEventListener('clear-summaries-updated', handler)

    return () => {
      window.removeEventListener('clear-summaries-updated', handler)
    }
  }
}
