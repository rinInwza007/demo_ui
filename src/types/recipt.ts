export type MoneySouce = 'internal' | 'external';



export type MoneyType = 'bank' | 'cash' | 'transfer';

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
  MoneySouce: MoneySouce;

  /** Keyword for tagging or searching */
  keyword?: string;
}

export interface Receipt {
  /** Full name */
  fullName: string;

  /** Phone number */
  phone: string;

  /** Affiliation ID */
  affiliationId: string;

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
