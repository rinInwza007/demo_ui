// mappers/summary.mapper.ts
import type { Receipt } from '@/types/recipt'
import type { LedgerEntry, Direction, EventType } from '@/types/summary'

const num = (v: any) => Number(v || 0)
const str = (v: any) => String(v ?? '').trim()

export function receiptToLedger(
  receipt: Receipt,
  mode: 'create' | 'update' | 'clear'
): LedgerEntry[] {
  const docKey = str((receipt as any).projectCode || (receipt as any).id)

  const faculty = receipt.affiliationName || ''
  const sub1 = receipt.subAffiliationName1 || ''
  const sub2 = receipt.subAffiliationName2 || ''

  const base = {
    docKey,
    delNumber: str((receipt as any).delNumber),
    faculty,
    sub1,
    sub2,
    affiliationId: receipt.affiliationId,
    fundName: receipt.fundName,
    fullName: receipt.fullName,
    createdAt: String(receipt.createdAt),
    updatedAt: String(receipt.updatedAt),
  }

  const entries: LedgerEntry[] = []

  // ✅ income (waybill)
  if (num(receipt.netTotalAmount) > 0) {
    entries.push({
      ...base,
      eventType: 'WAYBILL',
      direction: 'INCOME',
      amount: num(receipt.netTotalAmount),
      signed: num(receipt.netTotalAmount),
      unitKey: `${faculty}|${sub1}|${sub2}`,
    })
  }

  // ✅ debtor new
  if (num(receipt.totalDebtorAmount) > 0 && mode !== 'clear') {
    entries.push({
      ...base,
      eventType: 'DEBTOR_NEW',
      direction: 'DEBT_NEW',
      amount: num(receipt.totalDebtorAmount),
      signed: -num(receipt.totalDebtorAmount),
      unitKey: `${faculty}|${sub1}|${sub2}`,
    })
  }

  // ✅ clear debt
  if (mode === 'clear' && num(receipt.totalDebtorAmount) > 0) {
    entries.push({
      ...base,
      eventType: 'CLEAR_DEBTOR',
      direction: 'DEBT_CLEAR',
      amount: num(receipt.totalDebtorAmount),
      signed: num(receipt.totalDebtorAmount),
      isClearedDebt: true,
      unitKey: `${faculty}|${sub1}|${sub2}`,
    })
  }

  return entries
}
