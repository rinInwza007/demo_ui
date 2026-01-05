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

// 2.5 ลูกหนี้ของคณะวิศวกรรมศาสตร์
export const engineeringReceivableOptions = [
  { value: 'ลูกหนี้ค่าบริการทดสอบวัสดุ', type: 'receivable', department: 'engineering' },
  { value: 'ลูกหนี้ค่าบริการวิเคราะห์ดิน', type: 'receivable', department: 'engineering' },
  { value: 'ลูกหนี้ค่าบริการออกแบบ', type: 'receivable', department: 'engineering' },
  { value: 'ลูกหนี้ค่าบริการที่ปรึกษา', type: 'receivable', department: 'engineering' },
  { value: 'ลูกหนี้ค่าเช่าอุปกรณ์', type: 'receivable', department: 'engineering' },
]

// 2.6 ลูกหนี้ของคณะแพทยศาสตร์
export const medicineReceivableOptions = [
  { value: 'ลูกหนี้ค่าตรวจวินิจฉัย', type: 'receivable', department: 'medicine' },
  { value: 'ลูกหนี้ค่าตรวจทางห้องปฏิบัติการ', type: 'receivable', department: 'medicine' },
  { value: 'ลูกหนี้ค่าบริการเวชกรรม', type: 'receivable', department: 'medicine' },
  { value: 'ลูกหนี้ค่าใช้ห้องผ่าตัด', type: 'receivable', department: 'medicine' },
]

// 2.7 ลูกหนี้ของคณะเภสัชศาสตร์
export const pharmacyReceivableOptions = [
  { value: 'ลูกหนี้ค่ายา', type: 'receivable', department: 'pharmacy' },
  { value: 'ลูกหนี้ค่าบริการจัดยา', type: 'receivable', department: 'pharmacy' },
  { value: 'ลูกหนี้ค่าตรวจวิเคราะห์ยา', type: 'receivable', department: 'pharmacy' },
  { value: 'ลูกหนี้ค่าบริการเภสัชกรรม', type: 'receivable', department: 'pharmacy' },
]

/**
 * ========================================
 * 3. ฟังก์ชันช่วยเหลือ (Helper Functions)
 * ========================================
 */

/**
 * ✅ แมป affiliationId กับ department
 * @param {string} affiliationId - รหัสหน่วยงานจาก auth (เช่น 'ENG', 'NUR')
 * @returns {string} - department name
 */
export const getDepartmentFromAffiliationId = (affiliationId) => {
  const mapping = {
    'ENG': 'engineering',
    'NUR': 'nursing',
    'DEN': 'dentistry',
    'HOS': 'hospital',
    'MED': 'medicine',
    'PHA': 'pharmacy',
  }
  return mapping[affiliationId] || 'general'
}

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
      ...engineeringReceivableOptions,
      ...medicineReceivableOptions,
      ...pharmacyReceivableOptions,
    ]
  }
  
  return []
}

/**
 * ดึง option ลูกหนี้ตามหน่วยงาน
 * @param {string} department - 'general', 'nursing', 'dentistry', 'hospital', 'engineering', 'medicine', 'pharmacy'
 * @returns {Array}
 */
export const getReceivableOptionsByDepartment = (department) => {
  const departmentMap = {
    general: generalReceivableOptions,
    nursing: [...generalReceivableOptions, ...nursingReceivableOptions],
    dentistry: [...generalReceivableOptions, ...dentistryReceivableOptions],
    hospital: [...generalReceivableOptions, ...hospitalReceivableOptions],
    engineering: [...generalReceivableOptions, ...engineeringReceivableOptions],
    medicine: [...generalReceivableOptions, ...medicineReceivableOptions],
    pharmacy: [...generalReceivableOptions, ...pharmacyReceivableOptions],
  }
  
  return departmentMap[department] || generalReceivableOptions
}

/**
 * ✅ ดึง option สำหรับผู้ใช้ตามสิทธิ์และคณะ
 * @param {Object} auth - store auth (ต้องมี user.role และ user.affiliationId)
 * @param {string} waybillType - 'income', 'receivable', 'all'
 * @returns {Array}
 */
export const getOptionsForUser = (auth, waybillType = 'all') => {
  let result = []

  // ✅ รายรับ - ทุกคนเห็นเหมือนกัน (แสดงเสมอ)
  if (waybillType === 'income' || waybillType === 'all') {
    result = [...result, ...incomeOptions]
  }

  // ✅ ลูกหนี้ - แสดงตามสิทธิ์ (ไม่เอา general)
  if (waybillType === 'receivable' || waybillType === 'all') {
    if (!auth?.user) {
      // ไม่มี user ไม่แสดงลูกหนี้เลย
      return result
    } else if (auth.isRole('superadmin', 'admin', 'treasury')) {
      // สิทธิ์สูง เห็นลูกหนี้ทั้งหมดของทุกคณะ (ไม่รวม general)
      result = [
        ...result,
        ...nursingReceivableOptions,
        ...dentistryReceivableOptions,
        ...hospitalReceivableOptions,
        ...engineeringReceivableOptions,
        ...medicineReceivableOptions,
        ...pharmacyReceivableOptions,
      ]
    } else {
      // user ทั่วไป เห็นแค่ลูกหนี้ของคณะตัวเอง (ไม่รวม general)
      const userDepartment = getDepartmentFromAffiliationId(auth.user.affiliationId)
      
      const departmentOnlyMap = {
        nursing: nursingReceivableOptions,
        dentistry: dentistryReceivableOptions,
        hospital: hospitalReceivableOptions,
        engineering: engineeringReceivableOptions,
        medicine: medicineReceivableOptions,
        pharmacy: pharmacyReceivableOptions,
      }
      
      const departmentOptions = departmentOnlyMap[userDepartment] || []
      result = [...result, ...departmentOptions]
    }
  }

  return result
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
    ...engineeringReceivableOptions,
    ...medicineReceivableOptions,
    ...pharmacyReceivableOptions,
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
    ...engineeringReceivableOptions,
    ...medicineReceivableOptions,
    ...pharmacyReceivableOptions,
  ]
  
  const foundOption = allOptions.find(opt => opt.value === itemName)
  return foundOption ? foundOption.type : 'unknown'
}

/**
 * ดึงหน่วยงานของรายการลูกหนี้
 * @param {string} itemName - ชื่อรายการ
 * @returns {string} - 'general', 'nursing', 'dentistry', 'hospital', 'engineering', 'medicine', 'pharmacy' หรือ 'unknown'
 */
export const getItemDepartment = (itemName) => {
  const allReceivables = [
    ...generalReceivableOptions,
    ...nursingReceivableOptions,
    ...dentistryReceivableOptions,
    ...hospitalReceivableOptions,
    ...engineeringReceivableOptions,
    ...medicineReceivableOptions,
    ...pharmacyReceivableOptions,
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