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
}

const LS_TOKEN = 'auth_token'
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
    role: (s) => s.user?.role ?? null,
    affiliationId: (s) => s.user?.affiliationId ?? null,
  },

  actions: {
    /**
     * ✅ Login ผ่าน AuthService
     * - Mock Mode: ใช้ MOCK_USERS จาก mockAxios
     * - Real API: เรียก Backend จริง
     */
    async login(payload: { email: string; password: string }) {
      try {
        const response = await authService.login(payload)

        if (!response.success) {
          throw new Error(response.message || 'Login failed')
        }

        this.token = response.token
        this.user = response.user

        localStorage.setItem(LS_TOKEN, response.token)
        localStorage.setItem(LS_USER, JSON.stringify(response.user))

        return response
      } catch (error: any) {
        // แปลง error message ให้เป็นภาษาไทย
        const message = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาด'
        throw new Error(message)
      }
    },

    /**
     * ✅ Logout
     */
    async logout() {
      try {
        await authService.logout()
      } catch (error) {
        console.warn('Logout API failed, continuing with client-side logout')
      } finally {
        this.token = null
        this.user = null
        localStorage.removeItem(LS_TOKEN)
        localStorage.removeItem(LS_USER)
      }
    },

    /**
     * ✅ Verify Token - ตรวจสอบว่า token ยังใช้ได้อยู่หรือไม่
     */
    async verifyToken(): Promise<boolean> {
      if (!this.token) return false

      try {
        const result = await authService.verifyToken(this.token)
        
        if (result.valid && result.user) {
          this.user = result.user
          localStorage.setItem(LS_USER, JSON.stringify(result.user))
          return true
        }

        // Token ไม่ valid ให้ logout
        await this.logout()
        return false
      } catch (error) {
        await this.logout()
        return false
      }
    },

    /**
     * ✅ Refresh User Data
     */
    async refreshUser() {
      if (!this.token) return

      try {
        const user = await authService.getCurrentUser()
        this.user = user
        localStorage.setItem(LS_USER, JSON.stringify(user))
      } catch (error) {
        console.error('Failed to refresh user:', error)
      }
    },

    /**
     * ✅ ใช้เช็ค role ได้ง่าย ๆ
     */
    isRole(...roles: roleType[]) {
      if (!this.user) return false
      return roles.includes(this.user.role)
    },

    /**
     * ✅ เช็ค affiliationId
     */
    isAffiliation(...affIds: string[]) {
      if (!this.user) return false
      return affIds.includes(this.user.affiliationId)
    },

    /**
     * ✅ helper สำหรับ "กรองข้อมูลตาม affiliationId"
     * - superadmin เห็นทั้งหมด
     * - คนอื่นเห็นเฉพาะของตัวเอง
     */
    filterByAffiliation<T extends { affiliationId?: string | null }>(rows: T[]) {
      if (!this.user) return []
      if (this.user.role === 'superadmin') return rows
      return rows.filter((r) => r.affiliationId === this.user!.affiliationId)
    },
  },
})