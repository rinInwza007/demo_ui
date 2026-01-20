import { ReceiptItem } from './recipt';
import { User } from './user';
import { Affiliation } from './affiliation';

export interface TemplateReceiptItem {
  /** Item ID from master data */
  itemId?: string;
  /** Item name */
  itemName: string;
  /** Is expense type */
  isExpense: boolean;
}

export interface TemplateBankTransfer {
  accountData: {
    accountNumber: string;
    bankName: string;
    accountName: string;
  };
}

export interface TemplateData {
  /** User full name */
  fullName: string;
  /** Phone number */
  phone: string;
  /** Main category ID */
  mainCategoryId: string;
  /** Main category name */
  mainCategory: string;
  /** Sub category ID level 1 */
  subCategoryId?: string;
  /** Sub category name level 1 */
  subCategory?: string;
  /** Sub category ID level 2 */
  subCategoryId2?: string;
  /** Sub category name level 2 */
  subCategory2?: string;
  /** Fund name */
  fundName: string;
  /** Money type for sending */
  sendmoney: string;
  /** Project code */
  projectCode?: string;
  /** Receipt items in template */
  receiptItems: TemplateReceiptItem[];
  /** Bank transfers configuration */
  bankTransfers?: TemplateBankTransfer[];
}

export interface Template {
  /** Template ID (timestamp-based) */
  id: number;
  /** Template name */
  name: string;
  /** Template data containing all form fields */
  data: TemplateData;
  /** User ID who created the template */
  userId: number;
  /** User name who created the template */
  userName: string;
  /** Affiliation ID */
  affiliationId: string;
  /** Affiliation name */
  affiliationName: string;
  /** Creation timestamp (ISO string) */
  createdAt: string;
}