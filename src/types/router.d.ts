// src/types/router.d.ts
import 'vue-router'
import type { roleType } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: roleType[]
  }
}