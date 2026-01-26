import type { Receipt } from '@/types/recipt'
import type { LedgerEntry } from '@/types/summary'

import {
  deriveEventType,
  deriveDirection,
} from './ledger.event'
import { deriveUnit } from './ledger.unit'

export function receiptToLedgerEntry(
  receipt: Receipt
): LedgerEntry {
  const eventType = deriveEventType(receipt.moneyTypeNote)
  const direction = deriveDirection(eventType)

  const amount = Number(receipt.netTotalAmount ?? 0)

  let signed = amount
  if (direction === 'DEBT_CLEAR') signed = -amount

  const unit = deriveUnit(receipt)

  return {
    docKey: receipt.id,
    delNumber: receipt.waybillNumber,

    eventType,
    direction,

    amount,
    signed,

    unitKey: unit.unitKey,
    faculty: unit.faculty,
    sub1: unit.sub1,
    sub2: unit.sub2,

    affiliationId: receipt.affiliationId,

    fundName: receipt.fundName,
    fullName: receipt.fullName,

    createdAt: new Date(receipt.createdAt),
    updatedAt: new Date(receipt.updatedAt),

    isClearedDebt: eventType === 'CLEAR_DEBTOR',
  }
}
