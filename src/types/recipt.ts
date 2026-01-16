import {User} from './user';
import { Affiliation } from './affiliation';


export type moneySource = 'นำส่ง' | 'ลูกหนี้' | 'วิจัย';

export type nagativeMoneyType = 'add' | 'other';

export type MoneyType = 'bank' | 'cash' | 'transfer' | 'debtor' | 'other';
export type ItemType =  'นำส่ง' | 'ลูกหนี้' | 'วิจัย';

export interface  Item {
  id: number;
  name: string;
  type: ItemType;
  Affiliation: Affiliation;
  crerateAt: Date;
  updateAt: Date;

}


export interface indexsavedebtor {
  id:number;
  item: Item;
  beginningOFTheYear:number;
  totalOftheYear:number;
  crerateAt: Date;
  updateAt: Date;


}


export interface ReceiptItem {
  /** Item name */
  itemName: Item;

  /** Reference number */
  referenceNo: string;
  delNumber: string;
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

  crerateAt: Date;
  updateAt: Date;
  paymentDetails: paymentDetails[]
}


 export interface paymentDetails {
    moneyType: string
    amount: number
    referenceNo?: string
    checkNumber?: string | null
    accountNumber?: string | null
    accountName?: string | null
    bankName?: string | null
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
sendmoney?: string;
  moneyTypeNote?: string;

  /** Net total amount */
  netTotalAmount: number;
  totalDebtorAmount?: number;
  totalDepositAmount?: number;
  totalFee?: number;
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

export interface debtorList {
  itemName: string;
  debtornote: string;
  amount: number;
}

export interface depositList {
  itemName: string;
  depositnote: string;
  subtotal: number;
  fee: number;
  netAmount: number;
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
