// itemOptions.js
// ไฟล์สำหรับเก็บข้อมูล options ของรายการนำส่งเงิน

/**
 * รายการประเภทต่างๆ
 * @property {string} value - ชื่อรายการ
 * @property {string} type - ประเภท: 'income' (นำส่งเงิน) หรือ 'receivable' (ลูกหนี้)
 */
export const itemOptions = [
  // รายการนำส่งเงิน (มีเลขที่อ้างอิง)
  {
    value: 'ค่าบริการทางการแพทย์ (สปสช)',
    type: 'income'
  },
  {
    value: 'ค่าบริการทางการแพทย์ (กรมบัญชีกลาง)',
    type: 'income'
  },
  {
    value: 'ค่าบริการทางการแพทย์ (ประกันสังคม)',
    type: 'income'
  },
  {
    value: 'ค่าบริการทางการแพทย์ (อื่นๆ)',
    type: 'income'
  },
  {
    value: 'ค่าบริการทางการแพทย์ (อื่นๆสิทธิ - ค้างชำระ)',
    type: 'income'
  },
  {
    value: 'ค่าบริการทางการแพทย์ (สปสช) เหมาจ่าย',
    type: 'income'
  },
  {
    value: 'ค่าบริการทางการแพทย์ (ประกันสังคม) เหมาจ่าย',
    type: 'income'
  },
  
  // รายการลูกหนี้ (ไม่มีเลขที่อ้างอิง)
  {
    value: 'ลูกหนี้ค่ารักษาพยาบาล',
    type: 'receivable'
  },
  {
    value: 'ลูกหนี้ค่าห้องพิเศษ',
    type: 'receivable'
  },
  {
    value: 'ลูกหนี้ค่ายา',
    type: 'receivable'
  },
  {
    value: 'ลูกหนี้ค่าตรวจวิเคราะห์',
    type: 'receivable'
  },
  {
    value: 'ลูกหนี้ค่าเอกซเรย์',
    type: 'receivable'
  }
]

/**
 * ตรวจสอบว่ารายการนี้เป็นลูกหนี้หรือไม่
 * @param {string} itemName - ชื่อรายการ
 * @param {string} note - หมายเหตุ
 * @param {string} referenceNo - เลขที่อ้างอิง
 * @returns {boolean}
 */
export const isReceivableItem = (itemName, note, referenceNo) => {
  // 1. เช็คจาก option ที่กำหนดไว้
  const foundOption = itemOptions.find(opt => opt.value === itemName)
  if (foundOption && foundOption.type === 'receivable') {
    return true
  }
  
  // 2. เช็คจากหมายเหตุและเลขที่อ้างอิง
  // ถ้าไม่มีเลขที่อ้างอิงและหมายเหตุมีคำว่า "ลูกหนี้"
  const hasNoReference = !referenceNo || referenceNo.trim() === ''
  const noteIncludesReceivable = note && note.includes('ลูกหนี้')
  
  if (hasNoReference && noteIncludesReceivable) {
    return true
  }
  
  return false
}

/**
 * กรองเฉพาะรายการนำส่งเงิน
 * @returns {Array}
 */
export const getIncomeItems = () => {
  return itemOptions.filter(opt => opt.type === 'income')
}

/**
 * กรองเฉพาะรายการลูกหนี้
 * @returns {Array}
 */
export const getReceivableItems = () => {
  return itemOptions.filter(opt => opt.type === 'receivable')
}

/**
 * ดึงประเภทของรายการ
 * @param {string} itemName - ชื่อรายการ
 * @returns {string} - 'income' หรือ 'receivable' หรือ 'unknown'
 */
export const getItemType = (itemName) => {
  const foundOption = itemOptions.find(opt => opt.value === itemName)
  return foundOption ? foundOption.type : 'unknown'
}