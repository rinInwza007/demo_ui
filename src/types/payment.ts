//src/types/payment.ts
export interface CashReceiptType {
  paymentMethod: 'cash'
  amount: string | number
}

export interface CheckReceiptType {
  paymentMethod: 'check'
  amount: string | number
  bankName: string
  checkNumber: string
  numInCheck: string
}

export interface TransferReceiptType {
  paymentMethod: 'transfer'
  amount: string | number
  accountData: {
    accountNumber: string
    bankName: string
    accountName: string
  }
}