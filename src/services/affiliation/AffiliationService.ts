// src/services/affiliation/AffiliationService.ts
import type { Affiliation } from '@/types/affiliation'
import { defaultAffiliation } from '@/components/data/Affiliation'
import { departmentOptions, initializeDepartmentOptions } from '@/components/data/TSdepartments'
import * as AffiliationApi from './affiliationApi'
import type {
  AffiliationFilters,
  AffiliationCreatePayload,
  AffiliationUpdatePayload
} from './affiliationApi'

/**
 * ========================================
 * Affiliation Service Layer
 * - ตรวจสอบว่าใช้ Mock หรือ Real API
 * - สลับระหว่าง Mock Data และ API โดยอัตโนมัติ
 * ========================================
 */

const useMockAPI = import.meta.env.DEV && import.meta.env.VITE_USE_FAKE_API === 'true'

console.log('🔧 AffiliationService initialized:', useMockAPI ? 'MOCK MODE' : 'API MODE')

/**
 * ========================================
 * CRUD Operations
 * ========================================
 */


/**
 * ✅ ดึงรายการทั้งหมดตาม filters
 */
export const getAffiliations = async (filters?: AffiliationFilters): Promise<Affiliation[]> => {
  if (useMockAPI) {
    console.log('🧪 [Mock] Getting affiliations from Affiliation.ts')

    let items = [...defaultAffiliation]

    // Filter ตาม type
    if (filters?.type) {
      items = items.filter(item => item.type === filters.type)
    }

    // Filter ตาม parentId
    if (filters?.parentId !== undefined) {
      if (filters.parentId === null || filters.parentId === '') {
        items = items.filter(item => !item.parentId)
      } else {
        items = items.filter(item => item.parentId === filters.parentId)
      }
    }

    // Filter ตาม search
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.id.toLowerCase().includes(searchLower)
      )
    }

    console.log('✅ [Mock] Filtered affiliations:', items.length)
    return items
  }

  // Real API
  return AffiliationApi.fetchAffiliations(filters)
}

/**
 * ✅ ดึงรายการตาม ID
 */
export const getAffiliationById = async (id: string): Promise<Affiliation | undefined> => {
  if (useMockAPI) {
    console.log('🧪 [Mock] Getting affiliation by ID:', id)
    const item = defaultAffiliation.find(a => a.id === id)
    console.log('✅ [Mock] Found:', item?.name || 'Not found')
    return item
  }

  // Real API
  try {
    return await AffiliationApi.fetchAffiliationById(id)
  } catch (error) {
    console.error('Affiliation not found:', id)
    return undefined
  }
}

/**
 * ✅ ดึงหน่วยงานลูก (children)
 */
export const getChildrenAffiliations = async (parentId: string): Promise<Affiliation[]> => {
  if (useMockAPI) {
    console.log('🧪 [Mock] Getting children of:', parentId)
    const children = defaultAffiliation.filter(a => a.parentId === parentId)
    console.log('✅ [Mock] Found children:', children.length)
    return children
  }

  // Real API
  return AffiliationApi.fetchChildrenAffiliations(parentId)
}

/**
 * ✅ ดึงหน่วยงานระดับบนสุด (root/คณะ)
 */
export const getRootAffiliations = async (): Promise<Affiliation[]> => {
  if (useMockAPI) {
    console.log('🧪 [Mock] Getting root affiliations')
    const roots = defaultAffiliation.filter(a => !a.parentId)
    console.log('✅ [Mock] Found roots:', roots.length)
    return roots
  }

  // Real API
  return AffiliationApi.fetchAffiliations({ parentId: null })
}

/**
 * ✅ สร้างรายการใหม่
 */
export const createAffiliation = async (
  payload: AffiliationCreatePayload
): Promise<Affiliation> => {
  if (useMockAPI) {
    console.error('❌ [Mock] Cannot create affiliations in mock mode')
    throw new Error('Create operation not supported in mock mode. Please use real API.')
  }

  return AffiliationApi.createAffiliation(payload)
}

/**
 * ✅ อัปเดตรายการ
 */
export const updateAffiliation = async (
  payload: AffiliationUpdatePayload
): Promise<Affiliation> => {
  if (useMockAPI) {
    console.error('❌ [Mock] Cannot update affiliations in mock mode')
    throw new Error('Update operation not supported in mock mode. Please use real API.')
  }

  return AffiliationApi.updateAffiliation(payload)
}

/**
 * ✅ ลบรายการ
 */
export const deleteAffiliation = async (id: string): Promise<void> => {
  if (useMockAPI) {
    console.error('❌ [Mock] Cannot delete affiliations in mock mode')
    throw new Error('Delete operation not supported in mock mode. Please use real API.')
  }

  return AffiliationApi.deleteAffiliation(id)
}

/**
 * ✅ ตรวจสอบ ID ซ้ำ
 */
export const checkDuplicateId = async (
  id: string,
  excludeId?: string
): Promise<boolean> => {
  if (useMockAPI) {
    console.log('🧪 [Mock] Checking duplicate ID:', id)
    const exists = defaultAffiliation.some(a =>
      a.id === id && (!excludeId || a.id !== excludeId)
    )
    console.log('✅ [Mock] Duplicate check:', exists)
    return exists
  }

  return AffiliationApi.checkDuplicateAffiliationId(id, excludeId)
}

/**
 * ========================================
 * Helper Functions สำหรับ departmentOptions
 * ========================================
 */

/**
 * ✅ สร้าง departmentOptions จาก Affiliation data
 */
export const generateDepartmentOptions = async (): Promise<Record<string, any>> => {
  if (useMockAPI) {
    console.log('🧪 [Mock] Generating departmentOptions from static data')
    // ✅ Re-initialize เพื่อให้แน่ใจว่าข้อมูลถูกต้อง
    return initializeDepartmentOptions()
  }

  // ✅ Real API Mode
  console.log('📡 [API] Generating departmentOptions from API')
  const affiliations = await getAffiliations()
  const options: Record<string, any> = {}

  const faculties = affiliations.filter(a => !a.parentId)

  faculties.forEach(faculty => {
    const directChildren = affiliations.filter(a => a.parentId === faculty.id)
    const grandchildren = affiliations.filter(a => {
      return a.parentId && directChildren.some(dc => dc.id === a.parentId)
    })

    options[faculty.name] = {
      id: faculty.id,
      main: directChildren.length > 0
        ? directChildren.map(c => ({ id: c.id, name: c.name }))
        : null,
      subs: grandchildren.length > 0
        ? grandchildren.map(gc => ({ id: gc.id, name: gc.name }))
        : []
    }
  })

  // ✅ อัพเดท departmentOptions
  departmentOptions.value = options
  console.log('✅ Generated departmentOptions:', options)

  return options
}

/**
 * ✅ หาชื่อ Affiliation จาก ID
 */
export const getAffiliationName = async (id: string): Promise<string> => {
  const affiliation = await getAffiliationById(id)
  return affiliation?.name || ''
}

/**
 * ✅ หา Path เต็ม (Faculty > Sub1 > Sub2)
 */
export const getAffiliationPath = async (id: string): Promise<string[]> => {
  const path: string[] = []
  let current = await getAffiliationById(id)

  while (current) {
    path.unshift(current.name)
    if (!current.parentId) break
    current = await getAffiliationById(current.parentId)
  }

  return path
}

/**
 * ========================================
 * Export ค่าคงที่และ utilities
 * ========================================
 */

export { useMockAPI }

export default {
  getAffiliations,
  getAffiliationById,
  getChildrenAffiliations,
  getRootAffiliations,
  createAffiliation,
  updateAffiliation,
  deleteAffiliation,
  checkDuplicateId,
  generateDepartmentOptions,
  getAffiliationName,
  getAffiliationPath,
  useMockAPI,
}
