// src/services/BankAccountService.ts
import axios from 'axios'
import type { BankAccount } from '@/types/BankTypes'

export const bankAccountService = {
  /**
   * ✅ ดึงบัญชีธนาคารทั้งหมด
   */
  async getAll(): Promise<BankAccount[]> {
    const response = await axios.get<BankAccount[]>('/bank-accounts')
    return response.data
  },

  /**
   * ✅ ดึงเฉพาะบัญชีที่ active
   */
  async getActive(): Promise<BankAccount[]> {
    const response = await axios.get<BankAccount[]>('/bank-accounts', {
      params: { isActive: true },
    })
    return response.data
  },

  /**
   * ✅ ดึงบัญชีตาม ID
   */
  async getById(id: string): Promise<BankAccount> {
    const response = await axios.get<BankAccount>(`/bank-accounts/${id}`)
    return response.data
  },

  /**
   * ✅ ค้นหาบัญชีตามเลขบัญชี
   */
  async findByAccountNumber(accountNumber: string): Promise<BankAccount | null> {
    const response = await axios.get<BankAccount[]>('/bank-accounts', {
      params: { accountNumber },
    })
    return response.data[0] || null
  },

  /**
   * ✅ สร้างบัญชีใหม่ (เฉพาะ admin/superadmin)
   */
  async create(data: Omit<BankAccount, 'id'>): Promise<BankAccount> {
    const response = await axios.post<BankAccount>('/bank-accounts', data)
    return response.data
  },

  /**
   * ✅ อัพเดทบัญชี (เฉพาะ admin/superadmin)
   */
  async update(id: string, data: Partial<BankAccount>): Promise<BankAccount> {
    const response = await axios.put<BankAccount>(`/bank-accounts/${id}`, data)
    return response.data
  },

  /**
   * ✅ ลบบัญชี (เฉพาะ superadmin)
   */
  async delete(id: string): Promise<void> {
    await axios.delete(`/bank-accounts/${id}`)
  },

  /**
   * ✅ เปิด/ปิดใช้งานบัญชี
   */
  async toggleActive(id: string): Promise<BankAccount> {
    const response = await axios.patch<BankAccount>(`/bank-accounts/${id}/toggle-active`)
    return response.data
  },
}