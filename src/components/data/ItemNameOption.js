// itemOptions.js
// ไฟล์สำหรับเก็บข้อมูล options ของรายการนำส่งเงินและลูกหนี้

/**
 * ========================================
 * 1. รายการนำส่งเงิน (รายได้ - บวก)
 * ========================================
 */
export const incomeOptions = [
  { value: 'ค่าบริการทางการแพทย์ (สปสช)', type: 'income' },
  { value: 'ค่าบริการทางการแพทย์ (กรมบัญชีกลาง)', type: 'income' },
  { value: 'ค่าบริการทางการแพทย์ (ประกันสังคม)', type: 'income' },
  { value: 'ค่าบริการทางการแพทย์ (อื่นๆ)', type: 'income' },
  { value: 'ค่าบริการทางการแพทย์ (อื่นๆสิทธิ - ค้างชำระ)', type: 'income' },
  { value: 'ค่าบริการทางการแพทย์ (สปสช) เหมาจ่าย', type: 'income' },
  { value: 'ค่าบริการทางการแพทย์ (ประกันสังคม) เหมาจ่าย', type: 'income' },
]

/**
 * ========================================
 * 2. รายการลูกหนี้แยกตามหน่วยงาน (รายจ่าย - ลบ)
 * ========================================
 */

// 2.1 ลูกหนี้ทั่วไป (ใช้ได้กับทุกหน่วยงาน)
export const generalReceivableOptions = [
  { value: 'ลูกหนี้ค่ารักษาพยาบาล', type: 'receivable', department: 'general' },
  { value: 'ลูกหนี้ค่าห้องพิเศษ', type: 'receivable', department: 'general' },
  { value: 'ลูกหนี้ค่ายา', type: 'receivable', department: 'general' },
  { value: 'ลูกหนี้ค่าตรวจวิเคราะห์', type: 'receivable', department: 'general' },
  { value: 'ลูกหนี้ค่าเอกซเรย์', type: 'receivable', department: 'general' },
]

// 2.2 ลูกหนี้ของคณะพยาบาลศาสตร์
export const nursingReceivableOptions = [
  { value: 'ลูกหนี้ค่ารักษาพยาบาล - คณะพยาบาล', type: 'receivable', department: 'nursing' },
  { value: 'ลูกหนี้ค่าบริการพยาบาล', type: 'receivable', department: 'nursing' },
  { value: 'ลูกหนี้ค่าตรวจสุขภาพ', type: 'receivable', department: 'nursing' },
  { value: 'ลูกหนี้ค่าดูแลผู้ป่วย', type: 'receivable', department: 'nursing' },
]

// 2.3 ลูกหนี้ของคณะทันตแพทยศาสตร์
export const dentistryReceivableOptions = [
  { value: 'ลูกหนี้ค่ารักษาทันตกรรม', type: 'receivable', department: 'dentistry' },
  { value: 'ลูกหนี้ค่าจัดฟัน', type: 'receivable', department: 'dentistry' },
  { value: 'ลูกหนี้ค่าถอนฟัน', type: 'receivable', department: 'dentistry' },
  { value: 'ลูกหนี้ค่าอุดฟัน', type: 'receivable', department: 'dentistry' },
  { value: 'ลูกหนี้ค่าทำฟันปลอม', type: 'receivable', department: 'dentistry' },
]

// 2.4 ลูกหนี้ของโรงพยาบาลมหาวิทยาลัยพะเยา
export const hospitalReceivableOptions = [
  { value: 'ลูกหนี้ค่าห้องพักผู้ป่วย', type: 'receivable', department: 'hospital' },
  { value: 'ลูกหนี้ค่าผ่าตัด', type: 'receivable', department: 'hospital' },
  { value: 'ลูกหนี้ค่าห้องฉุกเฉิน', type: 'receivable', department: 'hospital' },
  { value: 'ลูกหนี้ค่าเครื่องมือแพทย์', type: 'receivable', department: 'hospital' },
]

/**
 * ========================================
 * 3. ฟังก์ชันช่วยเหลือ (Helper Functions)
 * ========================================
 */

/**
 * ดึง option ตามประเภทใบนำส่ง
 * @param {string} waybillType - 'income' (ใบนำส่งเงิน) หรือ 'receivable' (ใบนำส่งลูกหนี้)
 * @returns {Array}
 */
export const getOptionsByWaybillType = (waybillType) => {
  if (waybillType === 'income') {
    return incomeOptions
  }

  if (waybillType === 'receivable') {
    return [
      ...generalReceivableOptions,
      ...nursingReceivableOptions,
      ...dentistryReceivableOptions,
      ...hospitalReceivableOptions,
    ]
  }

  return []
}

/**
 * ดึง option ลูกหนี้ตามหน่วยงาน
 * @param {string} department - 'general', 'nursing', 'dentistry', 'hospital'
 * @returns {Array}
 */
export const getReceivableOptionsByDepartment = (department) => {
  const departmentMap = {
    general: generalReceivableOptions,
    nursing: [...generalReceivableOptions, ...nursingReceivableOptions],
    dentistry: [...generalReceivableOptions, ...dentistryReceivableOptions],
    hospital: [...generalReceivableOptions, ...hospitalReceivableOptions],
  }

  return departmentMap[department] || generalReceivableOptions
}

/**
 * ดึง option ทั้งหมด (รายได้ + ลูกหนี้)
 * @param {string} department - หน่วยงาน (ถ้าไม่ระบุจะให้ลูกหนี้ทั่วไป)
 * @returns {Array}
 */
export const getAllOptions = (department = 'general') => {
  return [
    ...incomeOptions,
    ...getReceivableOptionsByDepartment(department),
  ]
}

/**
 * ดึง option สำหรับ dropdown (เฉพาะ value)
 * @param {string} waybillType - 'income' หรือ 'receivable'
 * @param {string} department - หน่วยงาน (ใช้เมื่อ waybillType = 'receivable')
 * @returns {Array<string>}
 */
export const getDropdownOptions = (waybillType, department = 'general') => {
  let options = []

  if (waybillType === 'income') {
    options = incomeOptions
  } else if (waybillType === 'receivable') {
    options = getReceivableOptionsByDepartment(department)
  } else {
    options = getAllOptions(department)
  }

  return options.map(opt => opt.value)
}

/**
 * ตรวจสอบว่ารายการเป็นลูกหนี้หรือไม่
 * @param {string} itemName - ชื่อรายการ
 * @returns {boolean}
 */
export const isReceivableItem = (itemName) => {
  const allReceivables = [
    ...generalReceivableOptions,
    ...nursingReceivableOptions,
    ...dentistryReceivableOptions,
    ...hospitalReceivableOptions,
  ]

  return allReceivables.some(opt => opt.value === itemName)
}

/**
 * ดึงประเภทของรายการ
 * @param {string} itemName - ชื่อรายการ
 * @returns {string} - 'income' หรือ 'receivable' หรือ 'unknown'
 */
export const getItemType = (itemName) => {
  const allOptions = [
    ...incomeOptions,
    ...generalReceivableOptions,
    ...nursingReceivableOptions,
    ...dentistryReceivableOptions,
    ...hospitalReceivableOptions,
  ]

  const foundOption = allOptions.find(opt => opt.value === itemName)
  return foundOption ? foundOption.type : 'unknown'
}

/**
 * ดึงหน่วยงานของรายการลูกหนี้
 * @param {string} itemName - ชื่อรายการ
 * @returns {string} - 'general', 'nursing', 'dentistry', 'hospital' หรือ 'unknown'
 */
export const getItemDepartment = (itemName) => {
  const allReceivables = [
    ...generalReceivableOptions,
    ...nursingReceivableOptions,
    ...dentistryReceivableOptions,
    ...hospitalReceivableOptions,
  ]

  const foundOption = allReceivables.find(opt => opt.value === itemName)
  return foundOption ? foundOption.department : 'unknown'
}

/**
 * ========================================
 * 4. Export สำหรับ Backward Compatibility
 * ========================================
 */

// Export ชื่อเดิมเพื่อให้โค้ดเก่าใช้งานได้
export const itemOptions = getAllOptions('general')

/**
 * ========================================
 * 5. ตัวอย่างการใช้งาน
 * ========================================
 */

// ตัวอย่าง: ดึง option สำหรับใบนำส่งเงิน (รายได้)
// const incomeOpts = getOptionsByWaybillType('income')

// ตัวอย่าง: ดึง option ลูกหนี้สำหรับคณะพยาบาล
// const nursingOpts = getReceivableOptionsByDepartment('nursing')

// ตัวอย่าง: ดึง option ทั้งหมดสำหรับคณะทันตแพทย์
// const dentistryAllOpts = getAllOptions('dentistry')

// ตัวอย่าง: ดึง option สำหรับ dropdown (เฉพาะ value)
// const dropdownValues = getDropdownOptions('receivable', 'hospital')

// ตัวอย่าง: เช็คว่าเป็นลูกหนี้หรือไม่
// const isReceivable = isReceivableItem('ลูกหนี้ค่ารักษาพยาบาล') // true

// ตัวอย่าง: ดึงประเภทของรายการ
// const type = getItemType('ค่าบริการทางการแพทย์ (สปสช)') // 'income'

// ตัวอย่าง: ดึงหน่วยงานของรายการลูกหนี้
// const dept = getItemDepartment('ลูกหนี้ค่าจัดฟัน') // 'dentistry'
