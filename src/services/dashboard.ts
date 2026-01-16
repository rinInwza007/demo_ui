// src/services/dashboard.ts
import axios from 'axios'
import type { Receipt } from '@/types/recipt'


export async function fetchReceipts(params?: {
  q?: string
  affiliationId?: string
  fullName?: string
  delNumber?: string
}) {
  const res = await axios.get<Receipt[]>('/getReceipt', { params })
  return res.data
}

/** 🔍 Get receipt by delNumber / id */
export async function fetchReceiptById(id: string) {
  const res = await axios.get<Receipt>(`/getReceipt/${encodeURIComponent(id)}`)
  return res.data
}

/** 🔍 Find one receipt (id หรือ delNumber) */
export async function findOneReceipt(id: string) {
  const res = await axios.get<Receipt>(`/findOneReceipt/${encodeURIComponent(id)}`)
  return res.data
}

/** ✅ Check duplicate delNumber */
export async function checkDelNumber(delNumber: string) {
  const res = await axios.get<{
    exists: boolean
    delNumber: string
  }>(`/checkDelNumber/${encodeURIComponent(delNumber)}`)
  return res.data
}

/** ➕ Create receipt */
export async function createReceipt(payload: Receipt) {
  const res = await axios.post<Receipt>('/saveReceipt', payload)
  return res.data
}

/** ✏️ Update receipt (POST style) */
export async function updateReceipt(payload: Receipt) {
  const res = await axios.post('/updateReceipt', {
    receipt: payload,
  })
  return res.data
}

/** ✏️ Update receipt (PUT style) */
export async function updateReceiptById(id: string, payload: Partial<Receipt>) {
  const res = await axios.put<Receipt>(
    `/updateReceipt/${encodeURIComponent(id)}`,
    payload,
  )
  return res.data
}

/** 🗑️ Delete receipt */
export async function deleteReceipt(id: string) {
  const res = await axios.delete<{
    success: boolean
    deletedCount: number
  }>(`/deleteReceipt/${encodeURIComponent(id)}`)
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
  const res = await axios.get<Receipt[]>('/getSummary', { params })
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
  const res = await axios.get<{
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
