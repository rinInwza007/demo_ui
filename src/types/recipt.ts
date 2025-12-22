import {User} from './user';
import { Affiliation } from './affiliation';


export type moneySource = 'นำส่ง' | 'ลูกหนี้' | 'วิจัย';

export type nagativeMoneyType = 'add' | 'other';

export type MoneyType = 'bank' | 'cash' | 'transfer' | 'debtor' | 'other';

export interface ReceiptItem {
  /** Item name */
  itemName: string;

  /** Reference number */
  referenceNo: string;

  /** Amount */
  amount: number;
  debtorAmount?: number
  depositSubtotal?: number
  depositNetAmount?: number
  /** Type of money*/
  moneyType: MoneyType;

  moneyTypeNote?: string;

 /** internal or external */
  moneySource: moneySource;
  nagativeMoneyType: nagativeMoneyType;
  note?: string;
  fee?: number; // 👈 fee อยู่ตรงนี้
  keyword?: string[];
  subtotal?: number;
  netAmount?: number;
    paymentDetails: {
    moneyType: string
    amount: number
    referenceNo?: string
    checkNumber?: string | null
    accountNumber?: string | null
    accountName?: string | null
    bankName?: string | null
  }[]
}

export interface Receipt {
  /** Full name */
  fullName: string;

  /** Phone number */
  phone: string;
isLocked?: boolean; 
 moneyType: string;  
  /** Affiliation ID */
  affiliationId: string;
  mainAffiliationName?: string;
  subAffiliationName1?: string;
  subAffiliationName2?: string;
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

  /** Creation date */
  createdAt: Date;
  /** update date */
  updatedAt: Date;
  /** Created by user ID */
  createdBy: User;
  /** Affiliation  */
  affiliation: Affiliation;

}

