import type { Receipt } from '@/types/recipt'
import { http } from './http'

export async function fetchReceipts(params?: any) {
  const res = await http.get<Receipt[]>('/getReceipt', { params })
  return res.data
}

export async function fetchReceiptById(id: string) {
  const res = await http.get<Receipt>(`/getReceipt/${encodeURIComponent(id)}`)
  return res.data
}

export async function findOneReceipt(id: string) {
  const res = await http.get<Receipt>(`/findOneReceipt/${encodeURIComponent(id)}`)
  return res.data
}

export async function checkDelNumber(delNumber: string) {
  const res = await http.get<{ exists: boolean; delNumber: string }>(
    `/checkDelNumber/${encodeURIComponent(delNumber)}`
  )
  return res.data
}

export async function createReceipt(payload: Receipt) {
  const res = await http.post<Receipt>('/saveReceipt', payload)
  return res.data
}

export async function updateReceipt(payload: Receipt) {
  const res = await http.post('/updateReceipt', { receipt: payload })
  return res.data
}

export async function updateReceiptById(id: string, payload: Partial<Receipt>) {
  const res = await http.put<Receipt>(
    `/updateReceipt/${encodeURIComponent(id)}`,
    payload
  )
  return res.data
}

export async function deleteReceipt(id: string) {
  const res = await http.delete<{ success: boolean; deletedCount: number }>(
    `/deleteReceipt/${encodeURIComponent(id)}`
  )
  return res.data
}

/* =========================
 * Summary APIs
 * ========================= */

export async function fetchSummary(params?: {
  affiliationId?: string
  q?: string
}) {
  const res = await http.get<Receipt[]>('/getSummary', { params })
  return res.data
}

export async function fetchSummaryEvents(params?: any) {
  const res = await http.get<{ items: any[] }>('/summary/events', { params })
  return res.data.items
}
