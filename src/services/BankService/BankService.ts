// src/services/BankService/BankService.ts
import { BankAPI } from './bank.api'
import type { BankAccount } from '@/types/BankTypes'

/**
 * BankService - จัดการข้อมูลบัญชีธนาคาร
 * 
 * ✅ ระบบจะตรวจสอบ mode อัตโนมัติ:
 * - Mock Mode (DEV + VITE_USE_FAKE_API=true): ใช้ข้อมูลจาก BankOptions.ts
 * - Real API Mode: เรียก API จริง
 * 
 * ⚠️ ไม่ต้องมี if-else เช็ค Mock ใน Service
 * เพราะ Axios Mock Adapter จะจัดการให้อัตโนมัติ
 */
class BankService {
  
  /**
   * ดึงข้อมูลบัญชีธนาคารทั้งหมด
   */
  async getAll(): Promise<BankAccount[]> {
    return await BankAPI.getAll()
  }

  /**
   * ดึงข้อมูลบัญชีธนาคารตาม ID
   */
  async getById(id: string): Promise<BankAccount> {
    return await BankAPI.getById(id)
  }

  /**
   * ดึงเฉพาะบัญชีที่ active
   */
  async getActive(): Promise<BankAccount[]> {
    const accounts = await this.getAll()
    return accounts.filter(acc => acc.isActive === true)
  }

  /**
   * สร้างบัญชีธนาคารใหม่
   */
  async create(account: BankAccount): Promise<BankAccount> {
    return await BankAPI.create(account)
  }

  /**
   * อัพเดทบัญชีธนาคาร
   */
  async update(id: string, account: Partial<BankAccount>): Promise<BankAccount> {
    return await BankAPI.update(id, account)
  }

  /**
   * ลบบัญชีธนาคาร
   */
  async delete(id: string): Promise<void> {
    return await BankAPI.delete(id)
  }

  /**
   * ค้นหาบัญชีธนาคารด้วยเลขบัญชี
   */
  async findByAccountNumber(accountNumber: string): Promise<BankAccount | undefined> {
    const accounts = await this.getAll()
    return accounts.find(acc => acc.accountNumber === accountNumber)
  }
}

export const bankService = new BankService()