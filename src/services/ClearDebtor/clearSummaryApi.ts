// src/fake/api/clearSummaryApi.ts

import type { ClearSummary, CreateClearSummaryInput } from '@/types/summary'

const STORAGE_KEY = 'fakeApi.clearSummaries'

/**
 * Load DB from localStorage
 */
function loadDB(): ClearSummary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    console.error('❌ Error loading clear summaries DB:', error)
    return []
  }
}

/**
 * Save DB to localStorage
 */
function saveDB(db: ClearSummary[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch (error) {
    console.error('❌ Error saving clear summaries DB:', error)
  }
}

/**
 * Generate unique Reference ID
 */
function generateReferenceId(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `CLR-${timestamp}-${random}`
}

/**
 * Create new clear summary
 */
export function createClearSummary(input: CreateClearSummaryInput): ClearSummary {
  console.log('📝 Creating clear summary:', input)

  const db = loadDB()

  // ✅ สร้างออบเจ็กต์ใหม่ก่อน
  const newSummary: ClearSummary = {
    id: `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    referenceId: generateReferenceId(),
    fullName: input.fullName || '',
    phone: input.phone || '',
    mainAffiliationId: input.mainAffiliationId || '',
    mainAffiliationName: input.mainAffiliationName || '',
    subAffiliationId1: input.subAffiliationId1 || '',
    subAffiliationName1: input.subAffiliationName1 || '',
    subAffiliationId2: input.subAffiliationId2 || '',
    subAffiliationName2: input.subAffiliationName2 || '',
    fundName: input.fundName || '',
    sendmoney: input.sendmoney || '',
    projectCode: input.projectCode || '',
    debtorList: input.debtorList || [],
    payments: input.payments || [],
    totalAmount: input.totalAmount || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  // ✅ เพิ่มเข้า array
  db.unshift(newSummary)

  // ✅ บันทึก
  saveDB(db)

  console.log('✅ Clear summary created:', newSummary.id, newSummary.referenceId)

  // ✅ ตอนนี้ return ได้แล้ว
  return newSummary
}

/**
 * Get all clear summaries with optional filters
 */
export function getClearSummaries(filters?: {
  affiliationId?: string
  startDate?: string
  endDate?: string
}): ClearSummary[] {
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

  return db
}

/**
 * Get clear summary by ID
 */
export function getClearSummaryById(id: string): ClearSummary | null {
  const db = loadDB()
  const found = db.find(s => s.id === id || s.referenceId === id)

  console.log('🔍 Fetched clear summary by ID:', id, found ? '✅' : '❌')

  return found || null
}

/**
 * Update clear summary
 */
export function updateClearSummary(id: string, payload: Partial<ClearSummary>): ClearSummary | null {
  const db = loadDB()
  const index = db.findIndex(s => s.id === id || s.referenceId === id)

  if (index === -1) {
    console.warn('⚠️ Clear summary not found:', id)
    return null
  }

  db[index] = {
    ...db[index],
    ...payload,
    id: db[index].id, // Keep original ID
    referenceId: db[index].referenceId, // Keep original referenceId
    updatedAt: new Date().toISOString()
  }

  saveDB(db)

  console.log('✏️ Clear summary updated:', id)

  return db[index]
}

/**
 * Delete clear summary
 */
export function deleteClearSummary(id: string): { success: boolean; deleted: number } {
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
export function getClearSummariesByWaybill(waybillNumber: string): ClearSummary[] {
  const db = loadDB()
  
  // แก้ไข: ค้นหาจาก debtorList แทน waybillNumbers
  const found = db.filter(s => 
    s.debtorList?.some(d => d.waybillNumber === waybillNumber)
  )

  console.log('🔍 Fetched clear summaries by waybill:', waybillNumber, found.length)

  return found
}