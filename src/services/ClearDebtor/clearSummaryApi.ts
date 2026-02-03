// src/fake/api/clearSummaryApi.ts

import type { ClearSummary } from '@/types/summary'

const STORAGE_KEY = 'clearSummaryDB'

/**
 * Load from localStorage
 */
function loadDB(): ClearSummary[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('❌ Error loading clearSummaryDB:', error)
    return []
  }
}

/**
 * Save to localStorage
 */
function saveDB(data: ClearSummary[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    console.log('💾 Saved clearSummaryDB:', data.length, 'items')
  } catch (error) {
    console.error('❌ Error saving clearSummaryDB:', error)
  }
}

/**
 * Create new clear summary
 */
export function createClearSummary(data: Partial<ClearSummary>) {
  console.log('📝 Creating clear summary:', data)

  const db = loadDB()

  const newSummary: ClearSummary = {
    // IDs
    id: data.id || `CS-${Date.now()}`,
    referenceId: data.referenceId || data.id || `CLEAR-${Date.now()}`,
    createdAt: data.createdAt || new Date().toISOString(),

    // ข้อมูลผู้ทำรายการ
    fullName: data.fullName || '',
    phone: data.phone || '',

    // ข้อมูลหน่วยงาน
    mainAffiliationId: data.mainAffiliationId || '',
    mainAffiliationName: data.mainAffiliationName || '',
    subAffiliationId1: data.subAffiliationId1,
    subAffiliationName1: data.subAffiliationName1,
    subAffiliationId2: data.subAffiliationId2,
    subAffiliationName2: data.subAffiliationName2,

    // ข้อมูลกองทุน
    fundName: data.fundName,
    sendmoney: data.sendmoney,
    projectCode: data.projectCode,

    // รายการ
    waybillNumbers: data.waybillNumbers || [],
    debtorList: data.debtorList || [],
    totalItems: data.totalItems || (data.debtorList?.length ?? 0),
    totalAmount: data.totalAmount || 0,

    // การชำระเงิน
    payments: data.payments || [],

    // สถานะ
    status: data.status || 'completed'
  }

  db.unshift(newSummary)
  saveDB(db)

  console.log('✅ Clear summary created:', newSummary.id)

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
