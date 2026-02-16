// stores/auth.ts
import { defineStore } from 'pinia'
import { authService } from '@/services/Auth_Service/AuthService'
import { User,roleType } from '@/types/user'



interface AuthState {
  token: string | null
  user: User | null
  lastVerified: number | null
}

const LS_TOKEN = 'access_token'
const LS_USER = 'auth_user'
const LS_LAST_VERIFIED = 'last_verified'

const VERIFY_INTERVAL = 5 * 60 * 1000 // 5 minutes

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
    lastVerified: Number(localStorage.getItem(LS_LAST_VERIFIED)) || null,
  }),

  getters: {
    isLoggedIn: (s) => !!s.token && !!s.user,
    role: (s) => s.user?.userProfile?.role ?? null, // ✅ ไม่ต้องเข้าถึง .name
    affiliationId: (s) => s.user?.userProfile?.affiliationId ?? null, // ✅ ใช้ field โดยตรง
    fullName: (s) => s.user?.userProfile?.fullName ?? null,
    phone: (s) => s.user?.userProfile?.phone ?? null,
    affiliation: (s) => s.user?.userProfile?.affiliationName ?? null, // ✅ ใช้ affiliationName

    shouldVerifyToken: (s) => {
  if (!s.token) return false
  if (!s.lastVerified) return true

  const now = Date.now()
  return (now - s.lastVerified) > VERIFY_INTERVAL
},
  },

  actions: {
    async login(payload: { email: string; password: string }) {
      console.log('🔐 [Auth Store] Starting login...')

      const response = await authService.login(payload)

      this.token = response.token
      this.user = response.user
      this.lastVerified = Date.now()

      localStorage.setItem(LS_TOKEN, response.token)
      localStorage.setItem(LS_USER, JSON.stringify(response.user))
      localStorage.setItem(LS_LAST_VERIFIED, String(this.lastVerified))

      console.log('✅ [Auth Store] Login successful, token saved')

      try {
        console.log('📤 [Auth Store] Fetching user profile from /auth/me...')
        await this.refreshUser()
        console.log('✅ [Auth Store] User profile refreshed')
      } catch (error) {
        console.warn('⚠️ [Auth Store] Failed to refresh user after login:', error)
      }

      return response
    },

    async logout(callApi = true) {
  try {
    if (callApi && this.token) {
      await authService.logout()
    }
  } catch (e) {
    console.warn('Logout API failed, continuing...')
  } finally {
    this.token = null
    this.user = null
    this.lastVerified = null

    localStorage.removeItem(LS_TOKEN)
    localStorage.removeItem(LS_USER)
    localStorage.removeItem(LS_LAST_VERIFIED)
  }
},
    // stores/auth.ts
async verifyToken(): Promise<boolean> {
  if (!this.token) {
    console.log('⚠️ [Auth Store] No token to verify')
    return false
  }

  if (!this.shouldVerifyToken) {
    console.log('⏭️ [Auth Store] Token recently verified, skip')
    return true
  }

  console.log('🔍 [Auth Store] Verifying token...')

  try {
    const result = await authService.verifyToken()

    if (result.valid) {
      console.log('✅ [Auth Store] Token valid')

      this.lastVerified = Date.now()
      localStorage.setItem(LS_LAST_VERIFIED, String(this.lastVerified))

      if (result.user) {
        this.user = result.user
        localStorage.setItem(LS_USER, JSON.stringify(result.user))
      }

      return true
    }

    // ❌ Token ไม่ valid → logout แบบไม่เรียก API
    console.warn('❌ [Auth Store] Token invalid')
    await this.logout(false) // 👈 สำคัญ! ส่ง false
    return false

  } catch (error) {
    console.error('❌ [Auth Store] Verify token error:', error)
    await this.logout(false) // 👈 สำคัญ! ส่ง false
    return false
  }
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
      const userRole = this.user?.userProfile?.role // ✅ ไม่ต้องเข้าถึง .name
      return !!userRole && roles.includes(userRole)
    },

    isAffiliation(...affIds: string[]) {
      const userAffId = this.user?.userProfile?.affiliationId // ✅ ใช้ affiliationId
      return !!userAffId && affIds.includes(userAffId)
    },

    filterByAffiliation<T extends { affiliationId?: string | null }>(rows: T[]) {
      if (!this.user) return []

      const userRole = this.user.userProfile?.role // ✅ ไม่ต้องเข้าถึง .name
      const userAffId = this.user.userProfile?.affiliationId // ✅ ใช้ affiliationId

      if (userRole === 'superadmin') return rows

      return rows.filter((r) => r.affiliationId === userAffId)
    },
  },
})
