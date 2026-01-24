// src/services/BankService/bank.api.ts
import axios from 'axios'
import type { BankAccount } from '@/types/BankTypes'

/**
 * Bank API Layer
 * ใช้สำหรับเรียก API จริง (หรือ Mock ผ่าน Axios Mock Adapter)
 */
export const BankAPI = {

  /**
   * ดึงข้อมูลบัญชีธนาคารทั้งหมด
   */
  async getAll(): Promise<BankAccount[]> {
    const res = await axios.get('/bank-accounts')
    return res.data.data
  },

  /**
   * ดึงข้อมูลบัญชีธนาคารตาม ID
   */
  async getById(id: string): Promise<BankAccount> {
    const res = await axios.get(`/bank-accounts/${id}`)
    return res.data.data
  },

  /**
   * สร้างบัญชีธนาคารใหม่
   */
  async create(data: BankAccount): Promise<BankAccount> {
    const res = await axios.post('/bank-accounts', data)
    return res.data.data
  },

  /**
   * อัพเดทบัญชีธนาคาร
   */
  async update(id: string, data: Partial<BankAccount>): Promise<BankAccount> {
    const res = await axios.put(`/bank-accounts/${id}`, data)
    return res.data.data
  },

  /**
   * ลบบัญชีธนาคาร
   */
  async delete(id: string): Promise<void> {
    await axios.delete(`/bank-accounts/${id}`)
  }
}