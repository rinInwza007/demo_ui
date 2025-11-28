export interface PaymentDetail {
  type: string; // 'เงินสด' | 'เช็คธนาคาร' | 'ฝากเข้าบัญชี'
  amount: number;
  referenceNo?: string;
  // เฉพาะเช็ค
  checkNumber?: string | null;
  // เฉพาะฝากเข้าบัญชี
  accountNumber?: string | null;
  accountName?: string | null;
  // ❌ ลบ fee ออก (fee อยู่ที่ ReceiptItem)
}

export interface ReceiptItem {
  itemName: string;
  note?: string;
  fee?: number; // 👈 fee อยู่ตรงนี้
  keyword?: string[];
  subtotal?: number;
  netAmount?: number;
  paymentDetails?: PaymentDetail[];
  
  // เก่า (backward compatible)
  referenceNo?: string;
  amount?: number;
  moneyType?: string;
  moneyTypeNote?: string;
  moneySource?: string;
}

export interface Receipt {
  fullName: string;
  phone: string;
  
  // เก่า (backward compatible)
  affiliationId?: string;
  affiliationName?: string;
  fundId?: string;
  
  // ใหม่
  mainAffiliationName?: string;
  subAffiliationName?: string;
  
  fundName: string;
  moneyType?: string;
  projectCode: string;
  
  // ยอดเงิน
  totalAmount?: number;
  totalFee?: number;
  netTotalAmount?: number;
  
  receiptList: ReceiptItem[];
}