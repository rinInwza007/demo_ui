// src/services/itemName/itemNameApi.ts
import axios from 'axios'
import type { Item } from '@/types/recipt'

/**
 * ========================================
 * ItemName API Layer
 * - ทำหน้าที่เป็น API Client
 * - รองรับทั้ง Real API และ Mock API
 * ========================================
 */

export interface ItemNameFilters {
  type?: 'income' | 'receivable' | 'all'
  affiliationId?: string
  search?: string
}

export interface ItemNameCreatePayload {
  name: string
  type: 'income' | 'receivable'
  affiliationId?: string
}

export interface ItemNameUpdatePayload {
  id: number
  name?: string
  type?: 'income' | 'receivable'
  affiliationId?: string
}

/**
 * ✅ GET /item-names - ดึงรายการทั้งหมด
 */
export const fetchItemNames = async (filters?: ItemNameFilters): Promise<Item[]> => {
  try {
    const params = new URLSearchParams()
    
    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type)
    }
    
    if (filters?.affiliationId) {
      params.append('affiliationId', filters.affiliationId)
    }
    
    if (filters?.search) {
      params.append('search', filters.search)
    }

    const queryString = params.toString()
    const url = queryString ? `/item-names?${queryString}` : '/item-names'
    
    console.log('📡 [API] GET', url)
    
    const response = await axios.get<{ success: boolean; data: Item[] }>(url)
    
    console.log('✅ [API] Fetched items:', response.data.data.length)
    
    return response.data.data
  } catch (error) {
    console.error('❌ [API] Error fetching item names:', error)
    throw error
  }
}

/**
 * ✅ GET /item-names/:id - ดึงรายการตาม ID
 */
export const fetchItemNameById = async (id: number): Promise<Item> => {
  try {
    console.log('📡 [API] GET /item-names/', id)
    
    const response = await axios.get<{ success: boolean; data: Item }>(`/item-names/${id}`)
    
    console.log('✅ [API] Fetched item:', response.data.data.name)
    
    return response.data.data
  } catch (error) {
    console.error('❌ [API] Error fetching item name by ID:', error)
    throw error
  }
}

/**
 * ✅ POST /item-names - สร้างรายการใหม่
 */
export const createItemName = async (payload: ItemNameCreatePayload): Promise<Item> => {
  try {
    console.log('📡 [API] POST /item-names', payload)
    
    const response = await axios.post<{ success: boolean; data: Item }>('/item-names', payload)
    
    console.log('✅ [API] Created item:', response.data.data.name)
    
    return response.data.data
  } catch (error) {
    console.error('❌ [API] Error creating item name:', error)
    throw error
  }
}

/**
 * ✅ PUT /item-names/:id - อัปเดตรายการ
 */
export const updateItemName = async (payload: ItemNameUpdatePayload): Promise<Item> => {
  try {
    console.log('📡 [API] PUT /item-names/', payload.id)
    
    const { id, ...updateData } = payload
    
    const response = await axios.put<{ success: boolean; data: Item }>(
      `/item-names/${id}`,
      updateData
    )
    
    console.log('✅ [API] Updated item:', response.data.data.name)
    
    return response.data.data
  } catch (error) {
    console.error('❌ [API] Error updating item name:', error)
    throw error
  }
}

/**
 * ✅ DELETE /item-names/:id - ลบรายการ
 */
export const deleteItemName = async (id: number): Promise<void> => {
  try {
    console.log('📡 [API] DELETE /item-names/', id)
    
    await axios.delete(`/item-names/${id}`)
    
    console.log('✅ [API] Deleted item:', id)
  } catch (error) {
    console.error('❌ [API] Error deleting item name:', error)
    throw error
  }
}

/**
 * ✅ GET /item-names/check-duplicate - ตรวจสอบชื่อซ้ำ
 */
export const checkDuplicateItemName = async (name: string, excludeId?: number): Promise<boolean> => {
  try {
    const params = new URLSearchParams({ name })
    if (excludeId) {
      params.append('excludeId', excludeId.toString())
    }
    
    console.log('📡 [API] GET /item-names/check-duplicate?', params.toString())
    
    const response = await axios.get<{ exists: boolean }>(`/item-names/check-duplicate?${params}`)
    
    console.log('✅ [API] Duplicate check result:', response.data.exists)
    
    return response.data.exists
  } catch (error) {
    console.error('❌ [API] Error checking duplicate:', error)
    throw error
  }
}