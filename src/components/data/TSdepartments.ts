// src/components/data/TSdepartments.ts
import { defaultAffiliation } from './Affiliation'

export const departmentOptions: Record<string, any> = {}

// ✅ สร้าง mapping จาก Affiliation
defaultAffiliation.forEach(aff => {
  if (!aff.parentId) {
    // ✅ หาหน่วยงานรอง (ลูกโดยตรงของคณะ)
    const directChildren = defaultAffiliation.filter(child => child.parentId === aff.id)
    
    // ✅ หาหน่วยงานย่อย (หลานของคณะ - ลูกของหน่วยงานรอง)
    const grandchildren = defaultAffiliation.filter(child => {
      // ตรวจสอบว่า parent ของ child เป็นลูกของ aff หรือไม่
      return child.parentId && directChildren.some(dc => dc.id === child.parentId)
    })

    departmentOptions[aff.name] = {
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

console.log('📋 Generated departmentOptions:', departmentOptions) 