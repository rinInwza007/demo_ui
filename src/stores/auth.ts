// src/stores/auth.ts
import { defineStore } from 'pinia'
import { authService } from '@/services/Auth_Service/AuthService'

export type roleType = 'user' | 'treasury' | 'admin' | 'superadmin'

export interface User {
  id: string
  fullName: string
  affiliation: string
  affiliationId: string
  role: roleType
  email: string
  phone: string
}

type AuthState = {
  token: string | null
  user: User | null
  isVerifying: boolean  // ✅ เพิ่ม flag สำหรับป้องกัน concurrent verification
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
    isVerifying: false,
  }),

  getters: {
    isLoggedIn: (s) => !!s.token && !!s.user,
    role: (s) => s.user?.role ?? null,
    affiliationId: (s) => s.user?.affiliationId ?? null,
  },

  actions: {
    async login(payload: { email: string; password: string }) {
      const response = await authService.login(payload)

      this.token = response.token
      this.user = response.user

      localStorage.setItem(LS_TOKEN, response.token)
      localStorage.setItem(LS_USER, JSON.stringify(response.user))

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

    // ✅ ตรวจสอบ Token ว่ายังใช้งานได้หรือไม่
    async verifyToken(): Promise<boolean> {
      // ✅ ถ้าไม่มี Token ให้ return false ทันที
      if (!this.token) {
        console.warn('⚠️ No token to verify')
        return false
      }

      // ✅ ป้องกันการเรียก verifyToken หลายครั้งพร้อมกัน
      if (this.isVerifying) {
        console.log('🔄 Already verifying token...')
        return true
      }

      this.isVerifying = true

      try {
        console.log('🔍 Verifying token...')
        const result = await authService.verifyToken(this.token)

        if (result.valid && result.user) {
          console.log('✅ Token valid')
          this.user = result.user
          localStorage.setItem(LS_USER, JSON.stringify(result.user))
          return true
        }

        console.error('❌ Token invalid')
        await this.logout()
        return false
      } catch (error) {
        console.error('❌ Token verification failed:', error)
        await this.logout()
        return false
      } finally {
        this.isVerifying = false
      }
    },

    async refreshUser() {
      if (!this.token) return
      const user = await authService.getCurrentUser()
      this.user = user
      localStorage.setItem(LS_USER, JSON.stringify(user))
    },

    isRole(...roles: roleType[]) {
      return !!this.user && roles.includes(this.user.role)
    },

    isAffiliation(...affIds: string[]) {
      return !!this.user && affIds.includes(this.user.affiliationId)
    },

    filterByAffiliation<T extends { affiliationId?: string | null }>(rows: T[]) {
      if (!this.user) return []
      if (this.user.role === 'superadmin') return rows
      return rows.filter(
        (r) => r.affiliationId === this.user!.affiliationId
      )
    },
  },
})