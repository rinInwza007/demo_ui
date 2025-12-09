import {ReceiptItem} from './recipt';
import {User} from './user';
import { Affiliation } from './affiliation';
export interface Template {
  /** Template ID */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description?: string;
  /** List of receipt items in the template */
  receiptItems: ReceiptItem[];
  /** Created by user */
  createdBy: User;
  /** Creation date */
  createdAt: Date;
  /** Affiliation associated with the template */
  affiliation: Affiliation;
}
