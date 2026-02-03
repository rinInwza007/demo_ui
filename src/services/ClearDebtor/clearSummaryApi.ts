// src/fake/api/clearSummaryApi.ts

import type { ClearSummary } from '@/types/summary'
export let clearSummaryDB: ClearSummary[] = []
/* Create */
export function createClearSummary(data: ClearSummary) {
  clearSummaryDB.push(data)

  return {
    success: true,
    data: newSummary
  }
}

/**
 * Get all clear summaries with optional filters
 */
export function getClearSummaries(filters?: {
  affiliationId?: string
  startDate?: string
  endDate?: string
}) {
  let db = loadDB()

  // Apply filters
  if (filters?.affiliationId) {
    db = db.filter(s => s.mainAffiliationId === filters.affiliationId)
  }

  if (filters?.startDate && filters?.endDate) {
    const start = new Date(filters.startDate).getTime()
    const end = new Date(filters.endDate).getTime()

    db = db.filter(s => {
      const date = new Date(s.createdAt).getTime()
      return date >= start && date <= end
    })
  }

  console.log('📋 Fetched clear summaries:', db.length)

  return {
    success: true,
    data: db,
    total: db.length
  }
}

/**
 * Get clear summary by ID
 */
export function getClearSummaryById(id: string) {
  const db = loadDB()
  const found = db.find(s => s.id === id || s.referenceId === id)

  console.log('🔍 Fetched clear summary by ID:', id, found ? '✅' : '❌')

  return {
    success: !!found,
    data: found || null
  }
}

/**
 * Update clear summary
 */
export function updateClearSummary(id: string, payload: Partial<ClearSummary>) {
  const db = loadDB()
  const index = db.findIndex(s => s.id === id || s.referenceId === id)

  if (index === -1) {
    console.warn('⚠️ Clear summary not found:', id)
    return {
      success: false,
      message: 'Summary not found'
    }
  }

  db[index] = {
    ...db[index],
    ...payload,
    id: db[index].id, // Keep original ID
    referenceId: db[index].referenceId // Keep original referenceId
  }

  saveDB(db)

  console.log('✏️ Clear summary updated:', id)

  return {
    success: true,
    data: db[index]
  }
}

/**
 * Delete clear summary
 */
export function deleteClearSummary(id: string) {
  const db = loadDB()
  const before = db.length

  const filtered = db.filter(s => s.id !== id && s.referenceId !== id)
  saveDB(filtered)

  const deleted = before - filtered.length

  console.log('🗑️ Clear summary deleted:', id, deleted > 0 ? '✅' : '❌')

  return {
    success: true,
    deleted
  }
}

/**
 * Get clear summaries by waybillNumber
 */
export function getClearSummariesByWaybill(waybillNumber: string) {
  const db = loadDB()
  const found = db.filter(s => s.waybillNumbers?.includes(waybillNumber))

  console.log('🔍 Fetched clear summaries by waybill:', waybillNumber, found.length)

  return {
    success: true,
    data: found,
    total: found.length
  }
}
