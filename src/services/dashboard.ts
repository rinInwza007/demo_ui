// src/services/dashboard.ts
import http from '@/lib/http'
import type { Receipt } from '@/types/recipt'

/* =========================
 * Receipt APIs
 * ========================= */

/** 📄 Get receipts list */
export async function fetchReceipts(params?: {
  q?: string
  affiliationId?: string
  fullName?: string
  delNumber?: string
}) {
  const res = await http.get<Receipt[]>('/receipts', { params })
  return res.data
}

/** 🔍 Get receipt by delNumber / id */
export async function fetchReceiptById(id: string) {
  const res = await http.get<Receipt>(
    `/receipts/${encodeURIComponent(id)}`
  )
  return res.data
}

/** 🔍 Find one receipt (id หรือ delNumber) */
export async function findOneReceipt(id: string) {
  const res = await http.get<Receipt>(
    `/findOneReceipt/${encodeURIComponent(id)}`
  )
  return res.data
}

/** ✅ Check duplicate delNumber */
export async function checkDelNumber(delNumber: string) {
  const res = await http.get<{
    exists: boolean
    delNumber: string
  }>(
    `/checkDelNumber/${encodeURIComponent(delNumber)}`
  )
  return res.data
}

/** ➕ Create receipt */
export async function createReceipt(payload: Receipt) {
  const res = await http.post<Receipt>('/saveReceipt', payload)
  return res.data
}

/** ✏️ Update receipt (POST style – legacy) */
export async function updateReceipt(payload: Receipt) {
  const res = await http.post('/updateReceipt', {
    receipt: payload,
  })
  return res.data
}

/** ✏️ Update receipt (PUT style) */
export async function updateReceiptById(
  id: string,
  payload: Partial<Receipt>
) {
  const res = await http.put<Receipt>(
    `/updateReceipt/${encodeURIComponent(id)}`,
    payload
  )
  return res.data
}

/** 🗑️ Delete receipt */
export async function deleteReceipt(id: string) {
  const res = await http.delete<{
    success: boolean
    deletedCount: number
  }>(
    `/deleteReceipt/${encodeURIComponent(id)}`
  )
  return res.data
}

/* =========================
 * Summary APIs
 * ========================= */

/** 📊 Get summary storage */
export async function fetchSummary(params?: {
  affiliationId?: string
  q?: string
}) {
  const res = await http.get<Receipt[]>('/getSummary', { params })
  return res.data
}

/** 📈 Get summary events */
export async function fetchSummaryEvents(params?: {
  search?: string
  faculty?: string
  sub1?: string
  sub2?: string
  start?: string // YYYY-MM-DD
  end?: string   // YYYY-MM-DD
}) {
  const res = await http.get<{
    items: {
      createdAt: string
      type: 'WAYBILL' | 'DEBTOR_NEW' | 'CLEAR_DEBTOR'
      faculty: string
      amount: number
      sub1?: string
      sub2?: string
      fundName?: string
      fullName?: string
      delNumber?: string
    }[]
  }>('/summary/events', { params })

  return res.data.items
}
