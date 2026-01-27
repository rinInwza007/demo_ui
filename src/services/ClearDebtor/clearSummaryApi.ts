// src/services/ClearDebtor/clearSummaryApi.ts

import type { ClearSummary } from '@/types/summary'

const STORAGE_KEY = 'fakeApi.clearSummaries'

/**
 * ✅ Load from localStorage
 */
function loadClearSummaries(): ClearSummary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * ✅ Save to localStorage
 */
function saveClearSummaries(data: ClearSummary[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/* Create */
export function createClearSummary(data: ClearSummary) {
  const db = loadClearSummaries()
  const exists = db.find(s => s.id === data.id)

  if (exists) {
    return {
      success: false,
      message: 'Summary already exists'
    }
  }

  db.push(data)
  saveClearSummaries(db)

  console.log('💾 Clear Summary saved to localStorage:', data.id)

  return {
    success: true,
    data
  }
}

/* Get All */
export function getClearSummaries() {
  const db = loadClearSummaries()
  
  return {
    success: true,
    data: db
  }
}

/* Get By ID */
export function getClearSummaryById(id: string) {
  const db = loadClearSummaries()
  const found = db.find(s => s.id === id)

  return {
    success: !!found,
    data: found || null
  }
}

/* Update */
export function updateClearSummary(id: string, payload: Partial<ClearSummary>) {
  const db = loadClearSummaries()
  const index = db.findIndex(s => s.id === id)

  if (index === -1) {
    return {
      success: false,
      message: 'Summary not found'
    }
  }

  db[index] = {
    ...db[index],
    ...payload,
    debtorList: payload.debtorList ?? db[index].debtorList
  }

  saveClearSummaries(db)

  return {
    success: true,
    data: db[index]
  }
}

/* Delete */
export function deleteClearSummary(id: string) {
  const db = loadClearSummaries()
  const index = db.findIndex(s => s.id === id)

  if (index === -1) {
    return {
      success: false,
      deleted: 0
    }
  }

  db.splice(index, 1)
  saveClearSummaries(db)

  return {
    success: true,
    deleted: 1
  }
}