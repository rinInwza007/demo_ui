// src/services/itemName/ItemNameService.ts
import type { Item } from '@/types/recipt'
import {
  getAllOptions,
  getItemById,
  getItemByName,
  getOptionsForUser,
  isReceivableItem,
  getItemType,
  getItemAffiliationId,
} from '@/components/data/ItemNameOption'
import * as ItemNameApi from './itemNameApi'
import type { ItemNameFilters, ItemNameCreatePayload, ItemNameUpdatePayload } from './itemNameApi'

/**
 * ========================================
 * ItemName Service Layer
 * - ตรวจสอบว่าใช้ Mock หรือ Real API
 * - สลับระหว่าง Mock Data และ API โดยอัตโนมัติ
 * ========================================
 */

const useMockAPI = import.meta.env.DEV && import.meta.env.VITE_USE_FAKE_API === 'true'

console.log('🔧 ItemNameService initialized:', useMockAPI ? 'MOCK MODE' : 'API MODE')

/**
 * ========================================
 * CRUD Operations
 * ========================================
 */

/**
 * ✅ ดึงรายการทั้งหมดตาม filters
 */
export const getItemNames = async (filters?: ItemNameFilters): Promise<Item[]> => {
  if (useMockAPI) {
    console.log('🧪 [Mock] Getting items from ItemNameOption.ts')

    // ถ้าไม่มี filter ให้คืนทั้งหมด
    if (!filters) {
      return getAllOptions()
    }

    // Filter ตาม type
    let items = getAllOptions()

    if (filters.type && filters.type !== 'all') {
      items = items.filter(item => item.type === filters.type)
    }

    // Filter ตาม affiliationId
    if (filters.affiliationId) {
      items = items.filter(item => item.affiliationId === filters.affiliationId)
    }

    // Filter ตาม search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchLower)
      )
    }

    console.log('✅ [Mock] Filtered items:', items.length)
    return items
  }

  // Real API
  return ItemNameApi.fetchItemNames(filters)
}

/**
 * ✅ ดึงรายการตาม ID
 */
export const getItemNameById = async (id: number): Promise<Item | null> => {
  if (useMockAPI) {
    console.log('🧪 [Mock] Getting item by ID:', id)
    const item = getItemById(id)
    console.log('✅ [Mock] Found:', item?.name || 'Not found')
    return item || null
  }

  // Real API
  try {
    return await ItemNameApi.fetchItemNameById(id)
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn('⚠️ Item not found:', id)
      return null
    }
    console.error('❌ Error fetching item:', error)
    throw error
  }
}

/**
 * ✅ ดึงรายการตาม name
 */
export const getItemNameByName = async (name: string): Promise<Item | null> => {
  if (useMockAPI) {
    console.log('🧪 [Mock] Getting item by name:', name)
    const item = getItemByName(name)
    console.log('✅ [Mock] Found:', item?.id || 'Not found')
    return item || null
  }

  // Real API - ใช้ search filter
  const items = await ItemNameApi.fetchItemNames({ search: name })
  return items.find(item => item.name === name) || null
}

/**
 * ✅ ดึงรายการตามสิทธิ์ผู้ใช้
 */
export const getItemNamesForUser = async (
  auth: any,
  waybillType: string = 'all'
): Promise<Item[]> => {
  if (useMockAPI) {
    console.log('🧪 [Mock] Getting items for user:', {
      role: auth?.user?.role,
      affiliationId: auth?.user?.affiliationId,
      waybillType
    })
    const items = getOptionsForUser(auth, waybillType)
    console.log('✅ [Mock] User items:', items.length)
    return items
  }

  // Real API - ส่ง filters ตาม user
  const filters: ItemNameFilters = {
    type: waybillType === 'all' ? undefined : (waybillType as 'income' | 'receivable')
  }

  // ถ้าไม่ใช่ superadmin/admin/treasury ให้ filter ตาม affiliationId
  if (!auth?.isRole?.('superadmin', 'admin', 'treasury')) {
    filters.affiliationId = auth?.user?.affiliationId
  }

  return ItemNameApi.fetchItemNames(filters)
}

/**
 * ✅ สร้างรายการใหม่
 */
export const createItemName = async (payload: ItemNameCreatePayload): Promise<Item> => {
  if (useMockAPI) {
    console.error('❌ [Mock] Cannot create items in mock mode')
    throw new Error('Create operation not supported in mock mode. Please use real API.')
  }

  return ItemNameApi.createItemName(payload)
}

/**
 * ✅ อัปเดตรายการ
 */
export const updateItemName = async (payload: ItemNameUpdatePayload): Promise<Item> => {
  if (useMockAPI) {
    console.error('❌ [Mock] Cannot update items in mock mode')
    throw new Error('Update operation not supported in mock mode. Please use real API.')
  }

  return ItemNameApi.updateItemName(payload)
}

/**
 * ✅ ลบรายการ
 */
export const deleteItemName = async (id: string): Promise<void> => { // ✅ เปลี่ยนเป็น string
  if (useMockAPI) {
    console.error('❌ [Mock] Cannot delete items in mock mode')
    throw new Error('Delete operation not supported in mock mode. Please use real API.')
  }

  return ItemNameApi.deleteItemName(id)
}

/**
 * ✅ ตรวจสอบชื่อซ้ำ
 */
export const checkDuplicateName = async (name: string, excludeId?: string ): Promise<boolean> => { // ✅ เปลี่ยนเป็น string
  if (useMockAPI) {
    console.log('🧪 [Mock] Checking duplicate name:', name)
    const allItems = getAllOptions()
    const exists = allItems.some(item =>
      item.name === name && (!excludeId || item.id !== excludeId)
    )
    console.log('✅ [Mock] Duplicate check:', exists)
    return exists
  }

  return ItemNameApi.checkDuplicateItemName(name, excludeId)
}

/**
 * ========================================
 * Helper Functions (แก้ไขให้เป็น async)
 * ========================================
 */

/**
 * ✅ ตรวจสอบว่ารายการเป็นลูกหนี้หรือไม่
 * @param itemId - ID ของรายการ
 * @returns Promise<boolean>
 */
export const checkIsReceivableItem = async (itemId: string): Promise<boolean> => { // ✅ เปลี่ยนเป็น string
  if (useMockAPI) {
    return isReceivableItem(itemId)
  }

  // Real API - ดึงข้อมูลมาตรวจสอบ
  try {
    const item = await getItemNameById(itemId)
    return item?.type === 'receivable'
  } catch (error) {
    console.error('❌ Error checking receivable item:', error)
    return false
  }
}

/**
 * ✅ ดึงประเภทของรายการ
 * @param itemId - ID ของรายการ
 * @returns Promise<string>
 */
export const getType = async (itemId: string): Promise<string> => { // ✅ เปลี่ยนเป็น string
  if (useMockAPI) {
    return getItemType(itemId)
  }

  // Real API - ดึงข้อมูลมาตรวจสอบ
  try {
    const item = await getItemNameById(itemId)
    return item?.type || 'unknown'
  } catch (error) {
    console.error('❌ Error getting item type:', error)
    return 'unknown'
  }
}

/**
 * ✅ ดึง affiliationId ของรายการ
 * @param itemId - ID ของรายการ
 * @returns Promise<string>
 */
export const getAffiliationId = async (itemId: string): Promise<string> => { // ✅ เปลี่ยนเป็น string
  if (useMockAPI) {
    return getItemAffiliationId(itemId)
  }

  // Real API - ดึงข้อมูลมาตรวจสอบ
  try {
    const item = await getItemNameById(itemId)
    return item?.affiliationId || 'unknown'
  } catch (error) {
    console.error('❌ Error getting affiliation ID:', error)
    return 'unknown'
  }
}

/**
 * ========================================
 * Export ค่าคงที่และ utilities
 * ========================================
 */

export { useMockAPI }

export default {
  // CRUD
  getItemNames,
  getItemNameById,
  getItemNameByName,
  getItemNamesForUser,
  createItemName,
  updateItemName,
  deleteItemName,
  checkDuplicateName,

  // Helpers
  checkIsReceivableItem,
  getType,
  getAffiliationId,

  // Config
  useMockAPI,
}
