// src/fake/api/clearSummaryApi.ts

import { clearSummaryDB } from './clearSummaryDB'
import type { ClearSummary } from '@/types/summary'

/* Create */
export function createClearSummary(data: ClearSummary) {
  clearSummaryDB.push(data)

  return {
    success: true,
    data
  }
}

/* Get All */
export function getClearSummaries() {
  return {
    success: true,
    data: clearSummaryDB
  }
}

/* Get By ID */
export function getClearSummaryById(id: string) {
  const found = clearSummaryDB.find(s => s.id === id)

  return {
    success: !!found,
    data: found || null
  }
}

/* Update */
export function updateClearSummary(id: string, payload: Partial<ClearSummary>) {
  const index = clearSummaryDB.findIndex(s => s.id === id)

  if (index === -1) {
    return {
      success: false,
      message: 'Summary not found'
    }
  }

  clearSummaryDB[index] = {
    ...clearSummaryDB[index],
    ...payload
  }

  return {
    success: true,
    data: clearSummaryDB[index]
  }
}

/* Delete */
export function deleteClearSummary(id: string) {
  const before = clearSummaryDB.length

  clearSummaryDB = clearSummaryDB.filter(s => s.id !== id)

  return {
    success: true,
    deleted: before - clearSummaryDB.length
  }
}
