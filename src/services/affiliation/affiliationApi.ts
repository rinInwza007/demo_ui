// src/services/affiliation/affiliationApi.ts
import axios from 'axios'
import type { Affiliation } from '@/types/affiliation'

/**
 * ========================================
 * Affiliation API Layer
 * - ทำหน้าที่เป็น API Client
 * - รองรับทั้ง Real API และ Mock API
 * ========================================
 */

export interface AffiliationFilters {
  type?: string 
  parentId?: string | null
  search?: string
}

export interface AffiliationCreatePayload {
  id: string
  name: string
  type: string
  parentId?: string | null
}

export interface AffiliationUpdatePayload {
  id: string
  name?: string
  type?: string
  parentId?: string | null
}

/**
 * ✅ GET /affiliations - ดึงรายการทั้งหมด
 */
export const fetchAffiliations = async (filters?: AffiliationFilters): Promise<Affiliation[]> => {
  try {
    const params = new URLSearchParams()

    if (filters?.type) {
      params.append('type', filters.type)
    }

    if (filters?.parentId !== undefined) {
      params.append('parentId', filters.parentId || '')
    }

    if (filters?.search) {
      params.append('search', filters.search)
    }

    const queryString = params.toString()
    const url = queryString ? `/affiliations?${queryString}` : '/affiliations'

    console.log('📡 [API] GET', url)

    const response = await axios.get<{ success: boolean; data: Affiliation[] }>(url)

    console.log('✅ [API] Fetched affiliations:', response.data.data.length)

    return response.data.data
  } catch (error) {
    console.error('❌ [API] Error fetching affiliations:', error)
    throw error
  }
}

/**
 * ✅ GET /affiliations/:id - ดึงรายการตาม ID
 */
export const fetchAffiliationById = async (id: string): Promise<Affiliation> => {
  try {
    console.log('📡 [API] GET /affiliations/', id)

    const response = await axios.get<{ success: boolean; data: Affiliation }>(`/affiliations/${id}`)

    console.log('✅ [API] Fetched affiliation:', response.data.data.name)

    return response.data.data
  } catch (error) {
    console.error('❌ [API] Error fetching affiliation by ID:', error)
    throw error
  }
}

/**
 * ✅ GET /affiliations/children/:parentId - ดึงหน่วยงานลูก
 */
export const fetchChildrenAffiliations = async (parentId: string): Promise<Affiliation[]> => {
  try {
    console.log('📡 [API] GET /affiliations/children/', parentId)

    const response = await axios.get<{ success: boolean; data: Affiliation[] }>(
      `/affiliations/children/${parentId}`
    )

    console.log('✅ [API] Fetched children:', response.data.data.length)

    return response.data.data
  } catch (error) {
    console.error('❌ [API] Error fetching children affiliations:', error)
    throw error
  }
}

/**
 * ✅ POST /affiliations - สร้างรายการใหม่
 */
export const createAffiliation = async (payload: AffiliationCreatePayload): Promise<Affiliation> => {
  try {
    console.log('📡 [API] POST /affiliations', payload)

    const response = await axios.post<{ success: boolean; data: Affiliation }>('/affiliations', payload)

    console.log('✅ [API] Created affiliation:', response.data.data.name)

    return response.data.data
  } catch (error) {
    console.error('❌ [API] Error creating affiliation:', error)
    throw error
  }
}

/**
 * ✅ PUT /affiliations/:id - อัปเดตรายการ
 */
export const updateAffiliation = async (payload: AffiliationUpdatePayload): Promise<Affiliation> => {
  try {
    console.log('📡 [API] PUT /affiliations/', payload.id)

    const { id, ...updateData } = payload

    const response = await axios.put<{ success: boolean; data: Affiliation }>(
      `/affiliations/${id}`,
      updateData
    )

    console.log('✅ [API] Updated affiliation:', response.data.data.name)

    return response.data.data
  } catch (error) {
    console.error('❌ [API] Error updating affiliation:', error)
    throw error
  }
}

/**
 * ✅ DELETE /affiliations/:id - ลบรายการ
 */
export const deleteAffiliation = async (id: string): Promise<void> => {
  try {
    console.log('📡 [API] DELETE /affiliations/', id)

    await axios.delete(`/affiliations/${id}`)

    console.log('✅ [API] Deleted affiliation:', id)
  } catch (error) {
    console.error('❌ [API] Error deleting affiliation:', error)
    throw error
  }
}

/**
 * ✅ GET /affiliations/check-duplicate - ตรวจสอบ ID ซ้ำ
 */
export const checkDuplicateAffiliationId = async (
  id: string,
  excludeId?: string
): Promise<boolean> => {
  try {
    const params = new URLSearchParams({ id })
    if (excludeId) {
      params.append('excludeId', excludeId)
    }

    console.log('📡 [API] GET /affiliations/check-duplicate?', params.toString())

    const response = await axios.get<{ exists: boolean }>(
      `/affiliations/check-duplicate?${params}`
    )

    console.log('✅ [API] Duplicate check result:', response.data.exists)

    return response.data.exists
  } catch (error) {
    console.error('❌ [API] Error checking duplicate:', error)
    throw error
  }
}
