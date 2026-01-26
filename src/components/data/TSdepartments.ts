// src/components/data/TSdepartments.ts
import { defaultAffiliation } from './Affiliation'
import { ref } from 'vue'

// ✅ ใช้ ref เพื่อให้ reactive
export const departmentOptions = ref<Record<string, any>>({})

// ✅ สร้าง function สำหรับ initialize
export const initializeDepartmentOptions = () => {
  const options: Record<string, any> = {}

  // ✅ สร้าง mapping จาก Affiliation
  defaultAffiliation.forEach(aff => {
    if (!aff.parentId) {
      // ✅ หาหน่วยงานรอง (ลูกโดยตรงของคณะ)
      const directChildren = defaultAffiliation.filter(child => child.parentId === aff.id)
      
      // ✅ หาหน่วยงานย่อย (หลานของคณะ - ลูกของหน่วยงานรอง)
      const grandchildren = defaultAffiliation.filter(child => {
        return child.parentId && directChildren.some(dc => dc.id === child.parentId)
      })

      options[aff.name] = {
        id: aff.id,
        main: directChildren.length > 0 
          ? directChildren.map(c => ({ id: c.id, name: c.name })) 
          : null,
        subs: grandchildren.length > 0 
          ? grandchildren.map(gc => ({ id: gc.id, name: gc.name })) 
          : []
      }
    }
  })

  departmentOptions.value = options
  console.log('📋 Generated departmentOptions:', options)
  return options
}

// ✅ Initialize ตอน import ครั้งแรก
initializeDepartmentOptions()