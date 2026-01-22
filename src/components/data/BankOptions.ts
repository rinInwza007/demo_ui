// src/components/data/BankOptions.ts
import type { BankOption, BankAccount } from '@/types/BankTypes'

/**
 * รายการธนาคารทั้งหมด (สำหรับ dropdown เลือกธนาคาร)
 */
export const bankOptions: BankOption[] = [
  { label: 'ธนาคารกรุงไทย', value: 'ธนาคารกรุงไทย' },
  { label: 'ธนาคารกสิกรไทย', value: 'ธนาคารกสิกรไทย' },
  { label: 'ธนาคารไทยพาณิชย์', value: 'ธนาคารไทยพาณิชย์' },
  { label: 'ธนาคารกรุงเทพ', value: 'ธนาคารกรุงเทพ' },
  { label: 'ธนาคารทหารไทยธนชาต', value: 'ธนาคารทหารไทยธนชาต' }
]

/**
 * รายการบัญชีธนาคารที่กำหนดไว้ล่วงหน้า
 */
export const bankAccountOptions: BankAccount[] = [
  {
    id: 'ACC_KTB_001',
    accountNumber: '671-2-90667-9',
    bankName: 'ธนาคารกรุงไทย',
    accountName: 'โรงพยาบาลมหาวิทยาลัยพะเยา',
    isActive: true,
  },
    {
    id: 'ACC_KTB_002',
    accountNumber: '123-2-45678-9',
    bankName: 'ธนาคารกรุงไทย',
    accountName: 'โรงพยาบาลมหาวิทยาลัยพะเยา2',
    isActive: true,
  },
  {
    id: 'ACC_KBANK_001',
    accountNumber: '671-2-90668-9',
    bankName: 'ธนาคารกสิกรไทย',
    accountName: 'มหาวิทยาลัยพะเยา (กองทุนทั่วไป)',
    isActive: true,
  },
  {
    id: 'ACC_KTB_002',
    accountNumber: '662-0-96023-5',
    bankName: 'ธนาคารกรุงไทย',
    accountName: 'กองทุนเพื่อการจัดตั้งธนาคารเลือด',
    isActive: true,
  },
  {
    id: 'ACC_SCB_001',
    accountNumber: '123-4-56789-0',
    bankName: 'ธนาคารไทยพาณิชย์',
    accountName: 'มหาวิทยาลัยพะเยา',
    isActive: true,
  }
]