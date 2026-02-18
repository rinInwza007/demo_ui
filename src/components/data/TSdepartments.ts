// src/components/data/TSdepartments.ts
import { ref } from 'vue'
import { getAffiliations } from '@/services/affiliation/AffiliationService'

export const departmentOptions = ref<Record<string, any>>({})

export const initializeDepartmentOptions = async () => {
  try {
    console.log('📡 Initializing departmentOptions...')

    const affiliations = await getAffiliations()
    const options: Record<string, any> = {}

    const faculties = affiliations.filter(a => !a.parentId)

    faculties.forEach(faculty => {
      const directChildren = affiliations.filter(
        a => a.parentId === faculty.id
      )

      const grandchildren = affiliations.filter(a =>
        a.parentId && directChildren.some(dc => dc.id === a.parentId)
      )

      options[faculty.name] = {
        id: faculty.id,
        main:
          directChildren.length > 0
            ? directChildren.map(c => ({ id: c.id, name: c.name }))
            : null,
        subs:
          grandchildren.length > 0
            ? grandchildren.map(gc => ({ id: gc.id, name: gc.name }))
            : []
      }
    })

    departmentOptions.value = options

    console.log('✅ departmentOptions ready:', options)

    return options
  } catch (error) {
    console.error('❌ Failed to initialize departmentOptions:', error)
  }
}
