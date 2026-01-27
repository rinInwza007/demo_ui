// src/services/clearSummaryService.ts

import axios from 'axios'
import type { ClearSummary } from '@/types/summary'

const API_BASE = '/clear-summaries'

export const clearSummaryService = {
  /**
   * ✅ สร้าง Clear Summary ใหม่
   */
  async create(data: ClearSummary) {
    try {
      const response = await axios.post(API_BASE, data)
      console.log('✅ Clear Summary Created:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Create Clear Summary Error:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * ✅ ดึงรายการ Clear Summary ทั้งหมด
   */
  async getAll() {
    try {
      const response = await axios.get(API_BASE)
      console.log('✅ Clear Summaries Loaded:', response.data.data?.length || 0)
      return response.data
    } catch (error: any) {
      console.error('❌ Get Clear Summaries Error:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * ✅ ดึง Clear Summary ตาม ID
   */
  async getById(id: string) {
    try {
      const response = await axios.get(`${API_BASE}/${id}`)
      console.log('✅ Clear Summary Found:', id)
      return response.data
    } catch (error: any) {
      console.error('❌ Get Clear Summary Error:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * ✅ อัปเดต Clear Summary
   */
  async update(id: string, payload: Partial<ClearSummary>) {
    try {
      const response = await axios.put(`${API_BASE}/${id}`, payload)
      console.log('✅ Clear Summary Updated:', id)
      return response.data
    } catch (error: any) {
      console.error('❌ Update Clear Summary Error:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * ✅ ลบ Clear Summary
   */
  async delete(id: string) {
    try {
      const response = await axios.delete(`${API_BASE}/${id}`)
      console.log('✅ Clear Summary Deleted:', id)
      return response.data
    } catch (error: any) {
      console.error('❌ Delete Clear Summary Error:', error.response?.data || error.message)
      throw error
    }
  }
}