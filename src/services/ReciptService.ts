// src/services/ReciptService.ts
import type { Receipt } from '@/types/recipt'
import { http } from '@/services/http'

/** 🔍 Find one receipt (id หรือ delNumber) */
export const findOneReceipt = async (id: string): Promise<Receipt> => {
  const res = await http.get<Receipt>(
    `/findOneReceipt/${encodeURIComponent(id)}`
  )
  return res.data
}

/** 📄 Get receipts (with query params) */
export const getReceipt = async (params?: any): Promise<Receipt[]> => {
  const res = await http.get<Receipt[]>('/getReceipt', { params })
  return res.data
}

/** ➕ Create receipt */
export const saveReceipt = async (payload: Receipt): Promise<Receipt> => {
  const res = await http.post<Receipt>('/saveReceipt', payload)
  return res.data
}

/** ✏️ Update receipt */
export const updateReceipt = async (payload: Receipt): Promise<Receipt> => {
  const res = await http.put<Receipt>('/updateReceipt', payload)
  return res.data
}

/** 🗑️ Delete receipt */
export const deleteReceipt = async (
  id: string
): Promise<{ success: boolean }> => {
  const res = await http.delete<{ success: boolean }>(
    `/deleteReceipt/${encodeURIComponent(id)}`
  )
  return res.data
}
