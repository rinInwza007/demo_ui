// src/services/itemName/itemNameApi.ts
import axios from 'axios'
import type { Item, ItemType } from '@/types/recipt'

export interface ItemNameFilters {
  type?: ItemType | 'all'
  affiliationId?: string
  search?: string
}

export interface ItemNameCreatePayload {
  name: string
  type: ItemType
  affiliationId?: string
  userId?: string
}

export interface ItemNameUpdatePayload {
  id: string          // ✅ string, not number
  name?: string
  type?: ItemType
  affiliationId?: string
}

/** GET /items */
export const fetchItemNames = async (filters?: ItemNameFilters): Promise<Item[]> => {
  try {
    const params = new URLSearchParams()
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type)
    if (filters?.affiliationId) params.append('affiliationId', filters.affiliationId)
    if (filters?.search) params.append('search', filters.search)

    const queryString = params.toString()
    const url = queryString ? `/items?${queryString}` : '/items'

    console.log('📡 [API] GET', url)
    const response = await axios.get(url)

    // ✅ รองรับทุก format
    let items: Item[] = []
    if (Array.isArray(response.data)) {
      items = response.data                      // ← backend ส่ง array ตรงๆ ✅
    } else if (Array.isArray(response.data?.data)) {
      items = response.data.data
    } else {
      console.warn('⚠️ Unexpected response format:', response.data)
      items = []
    }

    console.log('✅ [API] Fetched items:', items.length)
    return items
  } catch (error) {
    console.error('❌ [API] Error fetching item names:', error)
    throw error
  }
}

/** GET /items/:id */
export const fetchItemNameById = async (id: string): Promise<Item> => {  // ✅ string id
  try {
    const response = await axios.get<{ success: boolean; data: Item }>(`/items/${id}`)
    return response.data.data
  } catch (error) {
    console.error('❌ [API] Error fetching item name by ID:', error)
    throw error
  }
}

/** POST /items */
export const createItemName = async (payload: ItemNameCreatePayload): Promise<Item> => {
  try {
    const response = await axios.post<{ success: boolean; data: Item }>('/items', payload)
    return response.data.data
  } catch (error) {
    console.error('❌ [API] Error creating item name:', error)
    throw error
  }
}

/** PUT /items/:id */
export const updateItemName = async (payload: ItemNameUpdatePayload): Promise<Item> => {
  try {
    const { id, ...updateData } = payload
    const response = await axios.put<{ success: boolean; data: Item }>(`/items/${id}`, updateData)
    return response.data.data
  } catch (error) {
    console.error('❌ [API] Error updating item name:', error)
    throw error
  }
}

/** DELETE /items/:id */
export const deleteItemName = async (id: string): Promise<void> => {  // ✅ string id
  try {
    await axios.delete(`/items/${id}`)
    console.log('✅ [API] Deleted item:', id)
  } catch (error) {
    console.error('❌ [API] Error deleting item name:', error)
    throw error
  }
}

/** GET /items/check-duplicate */
export const checkDuplicateItemName = async (name: string, excludeId?: string): Promise<boolean> => {
  try {
    const params = new URLSearchParams({ name })
    if (excludeId) params.append('excludeId', excludeId)
    const response = await axios.get<{ exists: boolean }>(`/items/check-duplicate?${params}`)
    return response.data.exists
  } catch (error) {
    console.error('❌ [API] Error checking duplicate:', error)
    throw error
  }
}
