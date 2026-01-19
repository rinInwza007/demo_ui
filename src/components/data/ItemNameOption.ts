// src/components/data/ItemNameOption.ts
import { Item } from '@/types/recipt';

/**
 * ========================================
 * 1. รายการนำส่งเงิน (รายได้ - บวก)
 * ========================================
 */
export const incomeOptions: Item[] = [
  { id: 101, name: 'รายการใบนำส่งที่ 1', type: 'income', affiliationId: '', createdAt: new Date(), updatedAt: new Date() },
  { id: 102, name: 'รายการใบนำส่งที่ 2', type: 'income', affiliationId: '', createdAt: new Date(), updatedAt: new Date() },
  { id: 103, name: 'รายการใบนำส่งที่ 3', type: 'income', affiliationId: '', createdAt: new Date(), updatedAt: new Date() },
  { id: 104, name: 'รายการใบนำส่งที่ 4', type: 'income', affiliationId: '', createdAt: new Date(), updatedAt: new Date() },
  { id: 105, name: 'รายการใบนำส่งที่ 5', type: 'income', affiliationId: '', createdAt: new Date(), updatedAt: new Date() },
]

/**
 * ========================================
 * 2. รายการลูกหนี้ (แบ่งตามคณะ) - มี affiliationId
 * ========================================
 */

// 2.1 คณะแพทยศาสตร์ (MED)
export const medicineReceivableOptions: Item[] = [
  { id: 201, name: 'ค่าบริการทางการแพทย์ (สปสช) - ลูกหนี้', type: 'receivable', affiliationId: 'MED', createdAt: new Date(), updatedAt: new Date() },
  { id: 202, name: 'ค่าบริการทางการแพทย์ (กรมบัญชีกลาง) - ลูกหนี้', type: 'receivable', affiliationId: 'MED', createdAt: new Date(), updatedAt: new Date() },
  { id: 203, name: 'ค่าบริการทางการแพทย์ (ประกันสังคม) - ลูกหนี้', type: 'receivable', affiliationId: 'MED', createdAt: new Date(), updatedAt: new Date() },
  { id: 204, name: 'ค่าบริการทางการแพทย์ (อื่นๆ) - ลูกหนี้', type: 'receivable', affiliationId: 'MED', createdAt: new Date(), updatedAt: new Date() },
  { id: 205, name: 'ค่าบริการทางการแพทย์ (อื่นๆสิทธิ - ค้างชำระ) - ลูกหนี้', type: 'receivable', affiliationId: 'MED', createdAt: new Date(), updatedAt: new Date() },
  { id: 206, name: 'ค่าบริการทางการแพทย์ (สปสช) เหมาจ่าย - ลูกหนี้', type: 'receivable', affiliationId: 'MED', createdAt: new Date(), updatedAt: new Date() },
  { id: 207, name: 'ค่าบริการทางการแพทย์ (ประกันสังคม) เหมาจ่าย - ลูกหนี้', type: 'receivable', affiliationId: 'MED', createdAt: new Date(), updatedAt: new Date() },
]

// 2.2 คณะพยาบาลศาสตร์ (NUR)
export const nursingReceivableOptions: Item[] = [
  { id: 301, name: 'ลูกหนี้ค่ารักษาพยาบาล - คณะพยาบาล', type: 'receivable', affiliationId: 'NUR', createdAt: new Date(), updatedAt: new Date() },
  { id: 302, name: 'ลูกหนี้ค่าบริการพยาบาล', type: 'receivable', affiliationId: 'NUR', createdAt: new Date(), updatedAt: new Date() },
  { id: 303, name: 'ลูกหนี้ค่าตรวจสุขภาพ', type: 'receivable', affiliationId: 'NUR', createdAt: new Date(), updatedAt: new Date() },
  { id: 304, name: 'ลูกหนี้ค่าดูแลผู้ป่วย', type: 'receivable', affiliationId: 'NUR', createdAt: new Date(), updatedAt: new Date() },
]

// 2.3 คณะทันตแพทยศาสตร์ (DEN)
export const dentistryReceivableOptions: Item[] = [
  { id: 401, name: 'ลูกหนี้ค่ารักษาทันตกรรม', type: 'receivable', affiliationId: 'DEN', createdAt: new Date(), updatedAt: new Date() },
  { id: 402, name: 'ลูกหนี้ค่าจัดฟัน', type: 'receivable', affiliationId: 'DEN', createdAt: new Date(), updatedAt: new Date() },
  { id: 403, name: 'ลูกหนี้ค่าถอนฟัน', type: 'receivable', affiliationId: 'DEN', createdAt: new Date(), updatedAt: new Date() },
  { id: 404, name: 'ลูกหนี้ค่าอุดฟัน', type: 'receivable', affiliationId: 'DEN', createdAt: new Date(), updatedAt: new Date() },
  { id: 405, name: 'ลูกหนี้ค่าทำฟันปลอม', type: 'receivable', affiliationId: 'DEN', createdAt: new Date(), updatedAt: new Date() },
]

/**
 * ========================================
 * 3. Helper Functions
 * ========================================
 */

/**
 * ✅ ดึง receivable options ตาม affiliationId
 */
export const getItemById = (id: number): Item | undefined => {
  const allOptions = getAllOptions()
  return allOptions.find(item => item.id === id)
}

/**
 * ✅ ดึง Item object จาก name
 */
export const getItemByName = (name: string): Item | undefined => {
  const allOptions = getAllOptions()
  return allOptions.find(item => item.name === name)
}

/**
 * ✅ ดึง receivable options ตาม affiliationId
 */
export const getReceivableOptionsByAffiliationId = (affiliationId: string): Item[] => {
  const mapping: Record<string, Item[]> = {
    'MED': medicineReceivableOptions,
    'NUR': nursingReceivableOptions,
    'DEN': dentistryReceivableOptions,
  }
  return mapping[affiliationId] || []
}

/**
 * ✅ ดึง receivable options ทั้งหมด
 */
export const getAllReceivableOptions = (): Item[] => {
  return [
    ...medicineReceivableOptions,
    ...nursingReceivableOptions,
    ...dentistryReceivableOptions,
  ]
}

/**
 * ✅ ดึง options สำหรับผู้ใช้ตามสิทธิ์
 */
export const getOptionsForUser = (auth: any, waybillType: string = 'all'): Item[] => {
  let result: Item[] = []

  if (waybillType === 'income' || waybillType === 'all') {
    result = [...result, ...incomeOptions]
  }

  if (waybillType === 'receivable' || waybillType === 'all') {
    if (!auth?.user) {
      return result
    }

    if (auth.isRole('superadmin', 'admin', 'treasury')) {
      result = [...result, ...getAllReceivableOptions()]
    } else {
      const userOptions = getReceivableOptionsByAffiliationId(auth.user.affiliationId)
      result = [...result, ...userOptions]
    }
  }

  return result
}

/**
 * ✅ ตรวจสอบว่ารายการเป็นลูกหนี้หรือไม่ (รับทั้ง id และ name)
 */
export const isReceivableItem = (itemIdOrName: number | string): boolean => {
  if (typeof itemIdOrName === 'number') {
    const item = getItemById(itemIdOrName)
    return item?.type === 'receivable'
  }
  const item = getItemByName(itemIdOrName)
  return item?.type === 'receivable'
}

/**
 * ✅ ดึงประเภทของรายการ (รับทั้ง id และ name)
 */
export const getItemType = (itemIdOrName: number | string): string => {
  if (typeof itemIdOrName === 'number') {
    const item = getItemById(itemIdOrName)
    return item?.type || 'unknown'
  }
  const item = getItemByName(itemIdOrName)
  return item?.type || 'unknown'
}

/**
 * ✅ ดึง affiliationId ของรายการลูกหนี้ (รับทั้ง id และ name)
 */
export const getItemAffiliationId = (itemIdOrName: number | string): string => {
  if (typeof itemIdOrName === 'number') {
    const item = getItemById(itemIdOrName)
    return item?.affiliationId || 'unknown'
  }
  const item = getItemByName(itemIdOrName)
  return item?.affiliationId || 'unknown'
}

/**
 * ========================================
 * 4. Export สำหรับ Backward Compatibility
 * ========================================
 */
export const getAllOptions = (): Item[] => {
  return [
    ...incomeOptions,
    ...getAllReceivableOptions(),
  ]
}
