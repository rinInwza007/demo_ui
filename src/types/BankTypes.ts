// src/types/BankTypes.ts
export interface BankAccount {
  id: string
  accountNumber: string
  bankName: string
  accountName: string
  isActive?: boolean
}

export interface BankOption {
  label: string
  value: string
}

export interface BankAccountData {
  accountNumber: string
  bankName: string
  accountName: string
}

export interface BankTransfer {
  id: number
  accountData: BankAccountData
  amount: string | number
}