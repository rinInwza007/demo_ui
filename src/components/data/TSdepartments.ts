// src/components/data/TSdepartments.ts
import { defaultAffiliation } from './Affiliation'

export const departmentOptions: Record<string, any> = {}

// ✅ สร้าง mapping จาก Affiliation
defaultAffiliation.forEach(aff => {
  if (!aff.parentId) {
    // คณะหลัก
    const children = defaultAffiliation.filter(child => child.parentId === aff.id && !defaultAffiliation.some(grandchild => grandchild.parentId === child.id))
    const grandchildren = defaultAffiliation.filter(child => child.parentId && defaultAffiliation.some(parent => parent.id === child.parentId && parent.parentId === aff.id))

    departmentOptions[aff.name] = {
      id: aff.id,  // ✅ เพิ่ม id
      main: children.length > 0 ? children.map(c => ({ id: c.id, name: c.name })) : null,
      subs: grandchildren.length > 0 ? grandchildren.map(gc => ({ id: gc.id, name: gc.name })) : []
    }
  }
})