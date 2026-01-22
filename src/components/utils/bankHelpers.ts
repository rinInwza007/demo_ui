// src/components/utils/bankHelpers.ts
import type { BankAccount, BankOption } from '@/types/BankTypes'
import { bankOptions as rawBankOptions, bankAccountOptions as rawBankAccountOptions } from '@/components/data/BankOptions'

/**
 * Export ข้อมูลจาก BankOptions (re-export)
 */
export const bankOptions: BankOption[] = rawBankOptions
export const bankAccountOptions: BankAccount[] = rawBankAccountOptions

/**
 * ดึงรายการบัญชีที่ active เท่านั้น
 */
export function getActiveAccounts(): BankAccount[] {
  return rawBankAccountOptions.filter(account => account.isActive !== false)
}

/**
 * ค้นหาบัญชีจากเลขบัญชี
 */
export function getBankAccountByNumber(accountNumber: string): BankAccount | undefined {
  if (!accountNumber) return undefined
  return rawBankAccountOptions.find(account => account.accountNumber === accountNumber)
}

/**
 * ตรวจสอบว่าเลขบัญชีนี้มีในระบบหรือไม่
 */
export function isValidAccountNumber(accountNumber: string): boolean {
  return rawBankAccountOptions.some(account => account.accountNumber === accountNumber)
}

/**
 * ค้นหาบัญชีจาก ID
 */
export function getBankAccountById(id: string): BankAccount | undefined {
  return rawBankAccountOptions.find(account => account.id === id)
}

/**
 * Format เลขบัญชีให้อ่านง่าย (ถ้าต้องการ)
 */
export function formatAccountNumber(accountNumber: string): string {
  return accountNumber.replace(/(\d{3})(\d{1})(\d{5})(\d{1})/, '$1-$2-$3-$4')
}