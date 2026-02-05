import { defineStore } from 'pinia'
import { authService } from '@/services/Auth_Service/AuthService'
import { User } from '@/types/user'

export type roleType = 'user' | 'treasury' | 'admin' | 'superadmin'

interface AuthState {
  token: string | null
  user: User | null
}

const LS_TOKEN = 'access_token'
const LS_USER = 'auth_user'

function safeJsonParse<T>(val: string | null): T | null {
  if (!val) return null
  try {
    return JSON.parse(val) as T
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem(LS_TOKEN),
    user: safeJsonParse<User>(localStorage.getItem(LS_USER)),
  }),

  getters: {
    isLoggedIn: (s) => !!s.token && !!s.user,
    role: (s) => (s.user?.userProfile?.role?.name as roleType) ?? null,
    affiliationId: (s) => s.user?.userProfile?.affiliation?.id ?? null,
    fullName: (s) => s.user?.userProfile?.fullName ?? null,
    phone: (s) => s.user?.userProfile?.phone ?? null,
    affiliation: (s) => s.user?.userProfile?.affiliation ?? null,
  },

  actions: {
    async login(payload: { email: string; password: string }) {
      console.log('🔐 [Auth Store] Starting login...')

      const response = await authService.login(payload)

      this.token = response.token
      this.user = response.user

      localStorage.setItem(LS_TOKEN, response.token)
      localStorage.setItem(LS_USER, JSON.stringify(response.user))

      console.log('✅ [Auth Store] Login successful, token saved')

      // ✅ เรียก /auth/me เพื่อดึงข้อมูล user ล่าสุดจาก Backend
      try {
        console.log('📤 [Auth Store] Fetching user profile from /auth/me...')
        await this.refreshUser()
        console.log('✅ [Auth Store] User profile refreshed')
      } catch (error) {
        console.warn('⚠️ [Auth Store] Failed to refresh user after login:', error)
        // ไม่ throw error เพราะ login สำเร็จแล้ว แค่ไม่ได้ข้อมูลเพิ่มเติม
      }

      return response
    },

    async logout() {
      try {
        await authService.logout()
      } finally {
        this.token = null
        this.user = null
        localStorage.removeItem(LS_TOKEN)
        localStorage.removeItem(LS_USER)
      }
    },

    async verifyToken(): Promise<boolean> {
      if (!this.token) return false

      const result = await authService.verifyToken(this.token)

      if (result.valid && result.user) {
        this.user = result.user
        localStorage.setItem(LS_USER, JSON.stringify(result.user))
        return true
      }

      await this.logout()
      return false
    },

    async refreshUser() {
      if (!this.token) {
        console.warn('⚠️ [Auth Store] No token available for refreshUser')
        return
      }

      console.log('📤 [Auth Store] Calling getCurrentUser()...')
      const user = await authService.getCurrentUser()

      console.log('📥 [Auth Store] Received user data:', user)

      this.user = user
      localStorage.setItem(LS_USER, JSON.stringify(user))

      console.log('✅ [Auth Store] User data saved to localStorage')
    },

    isRole(...roles: roleType[]) {
      const userRole = this.user?.userProfile?.role?.name as roleType
      return !!userRole && roles.includes(userRole)
    },

    isAffiliation(...affIds: string[]) {
      const userAffId = this.user?.userProfile?.affiliation?.id
      return !!userAffId && affIds.includes(userAffId)
    },

    filterByAffiliation<T extends { affiliationId?: string | null }>(rows: T[]) {
      if (!this.user) return []

      const userRole = this.user.userProfile?.role?.name as roleType
      const userAffId = this.user.userProfile?.affiliation?.id

      if (userRole === 'superadmin') return rows

      return rows.filter((r) => r.affiliationId === userAffId)
    },
  },
})
