// src/mappers/clearDebtor.mapper.ts
export type ClearDebtorItem = {
  id: string
  amount: number
  debtorAmount: number
  balanceAmount: number
  fundName: string
}

export type ClearDebtorReceipt = {
  receiptId: string
  projectCode: string
  fullName: string
  phone: string
  department: string
  subDepartment: string
  sendmoney: string
  fundName: string
  createdAt: string
  items: ClearDebtorItem[]
}

export type ClearDebtorSummary = {
  receipts: ClearDebtorReceipt[]
}

/* =========================
 * Mapper
 * ========================= */

export function mapPendingDebtsToClearSummary(
  pendingItems: any[]
): ClearDebtorSummary {
  const grouped: Record<string, ClearDebtorReceipt> = {}

  for (const item of pendingItems) {
    const original = item._originalReceipt || {}

    const receiptId =
      original.projectCode || item.receiptId || 'unknown'

    if (!grouped[receiptId]) {
      grouped[receiptId] = {
        receiptId,
        projectCode: original.projectCode || receiptId,
        fullName: original.fullName || item.responsible || '-',
        phone: original.phone || '-',
        department:
          item.department ||
          original.mainAffiliationName ||
          '-',
        subDepartment:
          item.subDepartment ||
          original.subAffiliationName1 ||
          '-',
        sendmoney: original.sendmoney || 'รายได้',
        fundName: original.fundName || '-',
        createdAt:
          original.createdAt || new Date().toISOString(),
        items: [],
      }
    }

    grouped[receiptId].items.push({
      id: item.id,
      fundName: item.fundName,
      amount: Number(item.balanceAmount || 0),
      debtorAmount: Number(item.balanceAmount || 0),
      balanceAmount: Number(item.balanceAmount || 0),
    })
  }

  return {
    receipts: Object.values(grouped),
  }
}
