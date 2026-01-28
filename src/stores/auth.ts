// src/stores/auth.ts
import { defineStore } from 'pinia'
import axios from 'axios'
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
     * =========================
     * ✅ LOGIN
     * =========================
     */
    async login(payload: { email: string; password: string }) {
      try {
        const response = await authService.login(payload)

        if (!response.success || !response.token || !response.user) {
          throw new Error(response.message || 'Login failed')
        }

        this.token = response.token
        this.user = response.user

        localStorage.setItem(LS_TOKEN, response.token)
        localStorage.setItem(LS_USER, JSON.stringify(response.user))

        // ⭐ สำคัญมาก: set Authorization header
        axios.defaults.headers.common.Authorization = `Bearer ${response.token}`

        return response
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          error.message ||
          'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
        throw new Error(message)
      }
    },

    /**
     * =========================
     * ✅ LOGOUT (Production-style)
     * =========================
     */
    async logout() {
      try {
        if (this.token) {
          await authService.logout()
        }
      } catch (error) {
        // backend พังได้ แต่ frontend ต้อง logout ต่อ
        console.warn('Logout API failed, continue client-side logout')
      } finally {
        this.clearAuth()
      }
    },

    /**
     * =========================
     * ✅ VERIFY TOKEN
     * =========================
     */
    async verifyToken(): Promise<boolean> {
      if (!this.token) return false

      try {
        const result = await authService.verifyToken(this.token)

        if (result.valid && result.user) {
          this.user = result.user
          localStorage.setItem(LS_USER, JSON.stringify(result.user))

          // ป้องกันกรณี refresh หน้า
          axios.defaults.headers.common.Authorization = `Bearer ${this.token}`

          return true
        }

        await this.logout()
        return false
      } catch {
        await this.logout()
        return false
      }
    },

    /**
     * =========================
     * ✅ REFRESH USER
     * =========================
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
     * =========================
     * ✅ CLEAR AUTH (internal)
     * =========================
     */
    clearAuth() {
      this.token = null
      this.user = null

      localStorage.removeItem(LS_TOKEN)
      localStorage.removeItem(LS_USER)

      // ⭐ ล้าง Authorization header
      delete axios.defaults.headers.common.Authorization
    },

    /**
     * =========================
     * ✅ ROLE HELPERS
     * =========================
     */
    isRole(...roles: roleType[]) {
      if (!this.user) return false
      return roles.includes(this.user.role)
    },

    isAffiliation(...affIds: string[]) {
      if (!this.user) return false
      return affIds.includes(this.user.affiliationId)
    },

    filterByAffiliation<T extends { affiliationId?: string | null }>(rows: T[]) {
      if (!this.user) return []
      if (this.user.role === 'superadmin') return rows
      return rows.filter((r) => r.affiliationId === this.user!.affiliationId)
    },
  },
})
