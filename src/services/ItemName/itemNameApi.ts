import type { Item, ItemType } from '@/types/recipt'
import http from '@/lib/http'

/**
 * ========================================
 * Item API Layer (Real API)
 * Backend base route: /items
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
  affiliationId: string
  userId: string
}

export interface ItemNameUpdatePayload {
  id: string
  name?: string
  type?: 'income' | 'receivable'
  affiliationId?: string
}

/**
 * ========================================
 * Utils
 * ========================================
 */
const mapToBackendType = (type: 'income' | 'receivable'): ItemType =>
  type === 'income' ? 'RECEIPT' : 'DEBTOR'

/**
 * ========================================
 * API Functions
 * ========================================
 */

/**
 * ✅ GET /items
 */
export const fetchItemNames = async (
  filters?: ItemNameFilters
): Promise<Item[]> => {
  try {
    const params = new URLSearchParams()

    if (filters?.type && filters.type !== 'all') {
      params.append('type', mapToBackendType(filters.type))
    }

    if (filters?.affiliationId) {
      params.append('affiliationId', filters.affiliationId)
    }

    if (filters?.search) {
      params.append('search', filters.search)
    }

    const query = params.toString()
    const url = query ? `/items?${query}` : '/items'

    console.log('📡 [API] GET', url)

    const response = await http.get<Item[]>(url)

    console.log('✅ [API] Fetched items:', response.data.length)

    return response.data
  } catch (error) {
    console.error('❌ [API] Error fetching items:', error)
    throw error
  }
}

/**
 * ✅ GET /items/:id
 */
export const fetchItemNameById = async (id: string): Promise<Item> => {
  try {
    console.log('📡 [API] GET /items/', id)

    const response = await http.get<Item>(`/items/${id}`)

    console.log('✅ [API] Fetched item:', response.data.name)

    return response.data
  } catch (error) {
    console.error('❌ [API] Error fetching item by ID:', error)
    throw error
  }
}

/**
 * ✅ POST /items
 */
export const createItemName = async (
  payload: ItemNameCreatePayload
): Promise<Item> => {
  try {
    const body = {
      ...payload,
      type: mapToBackendType(payload.type),
    }

    console.log('📡 [API] POST /items', body)

    const response = await http.post<Item>('/items', body)

    console.log('✅ [API] Created item:', response.data.name)

    return response.data
  } catch (error) {
    console.error('❌ [API] Error creating item:', error)
    throw error
  }
}

/**
 * ✅ PUT /items/:id
 */
export const updateItemName = async (
  payload: ItemNameUpdatePayload
): Promise<Item> => {
  try {
    const { id, type, ...rest } = payload

    const body: any = { ...rest }

    if (type) {
      body.type = mapToBackendType(type)
    }

    console.log('📡 [API] PUT /items/', id, body)

    const response = await http.put<Item>(`/items/${id}`, body)

    console.log('✅ [API] Updated item:', response.data.name)

    return response.data
  } catch (error) {
    console.error('❌ [API] Error updating item:', error)
    throw error
  }
}

/**
 * ✅ DELETE /items/:id
 */
export const deleteItemName = async (id: string): Promise<void> => {
  try {
    console.log('📡 [API] DELETE /items/', id)

    await http.delete(`/items/${id}`)

    console.log('✅ [API] Deleted item:', id)
  } catch (error) {
    console.error('❌ [API] Error deleting item:', error)
    throw error
  }
}

