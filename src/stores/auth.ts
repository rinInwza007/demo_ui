// src/stores/auth.ts
import { defineStore } from 'pinia'

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

/** ✅ mock users สำหรับทดสอบ */
const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: 'u-001',
    fullName: 'User Demo',
    affiliation: 'คณะวิศวกรรมศาสตร์',
    affiliationId: 'ENG',
    role: 'user',
    email: 'user02@up.ac.th',
    phone: '0999999999',
    password: '1234',
  },
    {
    id: 'u-002',
    fullName: 'User Demo',
    affiliation: 'คณะพยาบาลศาสตร์',
    affiliationId: 'NUR',
    role: 'user',
    email: 'user01@up.ac.th',
    phone: '0999999999',
    password: '1234',
  },    
  {
    id: 'u-003',
    fullName: 'User Demo',
    affiliation: 'โรงพยาบาลทันตกรรมมหาวิทยาลัยพะเยา',
    affiliationId: 'DEN',
    role: 'user',
    email: 'user03@up.ac.th',
    phone: '0999999999',
    password: '1234',
  },
    {
    id: 'u-004',
    fullName: 'User Demo',
    affiliation: 'โรงพยาบาลมหาวิทยาลัยพะเยา',
    affiliationId: 'MED',
    role: 'user',
    email: 'user@up.ac.th',
    phone: '0999999999',
    password: '1234',
  },
  {
    id: 't-001',
    fullName: 'Treasury Demo',
    affiliation: 'กองคลัง',
    affiliationId: 'FIN',
    role: 'treasury',
    email: 'treasury@up.ac.th',
    phone: '0888888888',
    password: '1234',
  },
  {
    id: 'a-001',
    fullName: 'Admin Demo',
    affiliation: 'กองคลัง',
    affiliationId: 'FIN',
    role: 'admin',
    email: 'admin@up.ac.th',
    phone: '0777777777',
    password: '1234',
  },
  {
    id: 'sa-001',
    fullName: 'Super Admin Demo',
    affiliation: 'มหาวิทยาลัยพะเยา',
    affiliationId: 'UP',
    role: 'superadmin',
    email: 'superadmin@up.ac.th',
    phone: '0666666666',
    password: '1234',
  },
]

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
    /** ✅ login แบบ mock */
    async login(payload: { email: string; password: string }) {
      const found = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === payload.email.toLowerCase() && u.password === payload.password
      )

      if (!found) {
        throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      }

      // token mock
      const token = `mock_${found.id}_${Date.now()}`

      const user: User = {
        id: found.id,
        fullName: found.fullName,
        affiliation: found.affiliation,
        affiliationId: found.affiliationId,
        role: found.role,
        email: found.email,
        phone: found.phone,
      }

      this.token = token
      this.user = user

      localStorage.setItem(LS_TOKEN, token)
      localStorage.setItem(LS_USER, JSON.stringify(user))
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem(LS_TOKEN)
      localStorage.removeItem(LS_USER)
    },

    /** ✅ ใช้เช็ค role ได้ง่าย ๆ */
    isRole(...roles: roleType[]) {
      if (!this.user) return false
      return roles.includes(this.user.role)
    },

    /** ✅ เช็ค affiliationId */
    isAffiliation(...affIds: string[]) {
      if (!this.user) return false
      return affIds.includes(this.user.affiliationId)
    },

    /**
     * ✅ helper สำหรับ “กรองข้อมูลตาม affiliationId”
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
