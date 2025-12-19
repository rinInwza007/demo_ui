// src/services/dashboard.ts
import axios from 'axios'
import type { Receipt } from '@/types/recipt'

export async function fetchReceipts(params?: {
  q?: string
  affiliationId?: string
  fullName?: string
  projectCode?: string
}) {
  const res = await axios.get<Receipt[]>('/getReceipt', { params })
  return res.data
}
