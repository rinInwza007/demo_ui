// utils/filterdebtor.ts
import {
  getItemById,
  getReceivableOptionsByAffiliationId,
  getAllReceivableOptions
} from '@/components/data/ItemNameOption'
import type { Item } from '@/types/recipt'

/**
 * ✅ แปลง faculty name เป็น affiliationId
 */
export const getAffiliationId = (faculty: string): string => {
  const mapping: Record<string, string> = {
    'คณะแพทยศาสตร์': 'MED',
    'คณะพยาบาลศาสตร์': 'NUR',
    'คณะทันตแพทยศาสตร์': 'DEN',
  }
  return mapping[faculty] || ''
}

/**
 * ✅ ดึงรายการลูกหนี้ที่ผู้ใช้มีสิทธิ์เข้าถึงตาม itemId
 * @param itemIds - รายการ itemId ที่ต้องการกรอง
 * @param auth - ข้อมูล authentication ของผู้ใช้
 * @returns รายการลูกหนี้ที่ผู้ใช้มีสิทธิ์เข้าถึง
 */
export const filterDebtorsByPermission = (
  itemIds: number[],
  auth: any
): Item[] => {
  if (!auth?.user) return []

  // 1️⃣ ดึงรายการที่ผู้ใช้มีสิทธิ์เข้าถึง
  let allowedItems: Item[] = []

  if (auth.isRole('superadmin', 'admin', 'treasury')) {
    // Admin/Treasury เห็นทุกรายการลูกหนี้
    allowedItems = getAllReceivableOptions()
  } else {
    // User ทั่วไป เห็นเฉพาะคณะของตัวเอง
    allowedItems = getReceivableOptionsByAffiliationId(auth.user.affiliationId)
  }

  // 2️⃣ สร้าง Set ของ allowedItemIds เพื่อความเร็วในการค้นหา
  const allowedItemIds = new Set(allowedItems.map(item => item.id))

  // 3️⃣ กรองเฉพาะ itemId ที่ผู้ใช้มีสิทธิ์
  return itemIds
    .filter(id => allowedItemIds.has(id))
    .map(id => getItemById(id))
    .filter((item): item is Item => item !== undefined)
}

/**
 * ✅ ตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึง itemId นี้หรือไม่
 * @param itemId - itemId ที่ต้องการตรวจสอบ
 * @param auth - ข้อมูล authentication ของผู้ใช้
 * @returns true ถ้ามีสิทธิ์, false ถ้าไม่มีสิทธิ์
 */
export const hasPermissionForItem = (
  itemId: number,
  auth: any
): boolean => {
  if (!auth?.user) return false

  const item = getItemById(itemId)
  if (!item || item.type !== 'receivable') return false

  // Admin/Treasury เข้าถึงได้ทุกรายการ
  if (auth.isRole('superadmin', 'admin', 'treasury')) {
    return true
  }

  // User ทั่วไป ตรวจสอบว่าเป็นคณะเดียวกันหรือไม่
  return item.affiliationId === auth.user.affiliationId
}

/**
 * ✅ ดึงรายการลูกหนี้ตามช่วง itemId และกรองตามสิทธิ์
 * @param startId - itemId เริ่มต้น
 * @param endId - itemId สิ้นสุด
 * @param auth - ข้อมูล authentication ของผู้ใช้
 * @returns รายการลูกหนี้ที่อยู่ในช่วงและผู้ใช้มีสิทธิ์
 */
export const getDebtorsByIdRange = (
  startId: number,
  endId: number,
  auth: any
): Item[] => {
  const itemIds: number[] = []
  for (let id = startId; id <= endId; id++) {
    itemIds.push(id)
  }
  return filterDebtorsByPermission(itemIds, auth)
}

/**
 * ✅ ดึงรายการลูกหนี้ตาม affiliationId โดยตรง
 * เช่น 'MED' จะได้ itemId 201-207
 * @param affiliationId - รหัสคณะ (MED, NUR, DEN)
 * @param auth - ข้อมูล authentication ของผู้ใช้
 * @returns รายการลูกหนี้ของคณะนั้น (ถ้าผู้ใช้มีสิทธิ์)
 */
export const getDebtorsByAffiliation = (
  affiliationId: string,
  auth: any
): Item[] => {
  if (!auth?.user) return []

  // ตรวจสอบสิทธิ์
  const isAdmin = auth.isRole('superadmin', 'admin', 'treasury')
  const isSameAffiliation = auth.user.affiliationId === affiliationId

  if (!isAdmin && !isSameAffiliation) {
    return [] // ไม่มีสิทธิ์เข้าถึงคณะนี้
  }

  return getReceivableOptionsByAffiliationId(affiliationId)
}

/**
 * ✅ แปลง affiliationId เป็นช่วง itemId
 */
const AFFILIATION_ID_RANGES: Record<string, { start: number; end: number }> = {
  'MED': { start: 201, end: 207 },
  'NUR': { start: 301, end: 304 },
  'DEN': { start: 401, end: 405 },
}

export const getItemIdRangeByAffiliation = (
  affiliationId: string
): { start: number; end: number } | null => {
  return AFFILIATION_ID_RANGES[affiliationId] || null
}

/**
 * ✅ ตัวอย่างการใช้งานใน Component
 */
export const exampleUsage = (auth: any) => {
  // ตัวอย่าง 1: กรองรายการลูกหนี้จาก itemIds
  const myItemIds = [201, 202, 301, 401]
  const allowedItems = filterDebtorsByPermission(myItemIds, auth)
  console.log('รายการที่มีสิทธิ์:', allowedItems)

  // ตัวอย่าง 2: ตรวจสอบสิทธิ์รายการเดียว
  const canAccess = hasPermissionForItem(201, auth)
  console.log('สามารถเข้าถึง itemId 201:', canAccess)

  // ตัวอย่าง 3: ดึงรายการตามช่วง (201-207)
  const medItems = getDebtorsByIdRange(201, 207, auth)
  console.log('รายการคณะแพทย์:', medItems)

  // ตัวอย่าง 4: ดึงรายการตาม affiliationId
  const nursingItems = getDebtorsByAffiliation('NUR', auth)
  console.log('รายการคณะพยาบาล:', nursingItems)
}
