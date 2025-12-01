export type moneySource = 'internal' | 'external';



export type MoneyType = 'bank' | 'cash' | 'transfer' | 'debtor'|'other' ;

export interface ReceiptItem {
  /** Item name */
  itemName: string;

  /** Reference number */
  referenceNo: string;

  /** Amount */
  amount: number;

  /** Type of money*/
  moneyType: MoneyType;

  moneyTypeNote?: string;

 /** internal or external */
  moneySource: moneySource;
  note?: string;
  fee?: number; // 👈 fee อยู่ตรงนี้
  keyword?: string[];
  subtotal?: number;
  netAmount?: number;
  paymentDetails?: PaymentDetail[];
}

export interface Receipt {
  /** Full name */
  fullName: string;

  /** Phone number */
  phone: string;

  /** Affiliation ID */
  affiliationId: string;
  mainAffiliationName?: string;
  subAffiliationName?: string;
  /** Affiliation name */
  affiliationName: string;

  /** Fund ID */
  fundId: string;

  /** Fund name */
  fundName: string;

  /** Project code */
  projectCode: string;

  /** List of receipt items */
  receiptList: ReceiptItem[];
}
export interface PaymentDetail {
  moneyType: MoneyType | string;
  amount: number;
  referenceNo: string;
  checkNumber?: string;
  accountNumber?: string;
  accountName?: string | null;
}

export interface user {
  /** User ID */
  id: string;
  /** User full name */
  fullName: string;
  /** User affiliation */
  affiliation: string;
  /** User affiliation ID */
  affiliation_ID: string;
  // User role */
  role: string;
  // User email */
  email: string;
  // User phone */
  phone: string;
}


export interface ReceiptTemplate {
  /** Template ID */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description?: string;
  /** List of receipt items in the template */
  receiptItems: ReceiptItem[];
}
