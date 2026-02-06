// src/services/Auth_Service/AuthApi.ts
import http from '@/lib/http'
import type { User } from '@/stores/auth'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  token: string
  user: User
  message?: string
  error?: string
}

// ✅ Mock Users สำหรับ Development
const MOCK_USERS = [
  {
    id: '1',
    email: 'user@up.ac.th',
    password: '1234',
    fullName: 'ผู้ใช้ทั่วไป',
    affiliation: 'คณะแพทย์ศาสตร์',
    affiliationId: 'MED',
    role: 'user' as const,
    phone: '081-234-5678'
  },
  {
    id: '2',
    email: 'treasury@up.ac.th',
    password: '1234',
    fullName: 'เจ้าหน้าที่การเงิน',
    affiliation: 'กองคลัง',
    affiliationId: 'FIN',
    role: 'treasury' as const,
    phone: '081-234-5679'
  },
  {
    id: '3',
    email: 'admin@up.ac.th',
    password: '1234',
    fullName: 'ผู้ดูแลระบบ',
    affiliation: 'มหาวิทยาลัย',
    affiliationId: 'UP',
    role: 'admin' as const,
    phone: '081-234-5680'
  },
  {
    id: '4',
    email: 'superadmin@up.ac.th',
    password: '1234',
    fullName: 'ผู้ดูแลระบบสูงสุด',
    affiliation: 'มหาวิทยาลัย',
    affiliationId: 'UP',
    role: 'superadmin' as const,
    phone: '081-234-5681'
  }
]

export const AuthAPI = {
  /**
   * Login - รองรับทั้ง Mock และ Real API
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const useMock = import.meta.env.VITE_USE_FAKE_API === 'true'

    // ✅ Mock Mode
    if (useMock) {
      console.log('🧪 Using Mock API for login')

      // ค้นหา user ที่ตรงกัน
      const user = MOCK_USERS.find(
        u => u.email === credentials.email && u.password === credentials.password
      )

      // ถ้าไม่เจอ user หรือ password ผิด
      if (!user) {
        console.error('❌ Mock: Invalid credentials for', credentials.email)
        return {
          success: false,
          error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
          token: '',
          user: {} as User
        }
      }

      // ✅ Login สำเร็จ - สร้าง mock token
      const mockToken = `mock_token_${user.id}_${Date.now()}`
      
      const { password, ...userWithoutPassword } = user

      console.log('✅ Mock: Login successful for', user.email)

      return {
        success: true,
        token: mockToken,
        user: userWithoutPassword,
        message: 'เข้าสู่ระบบสำเร็จ'
      }
    }

    // ✅ Real API Mode
    console.log('🔗 Using Real API for login')
    
    try {
      const res = await http.post('/auth/login', credentials)
      
      return {
        success: true,
        token: res.data.access_token || res.data.token,
        user: res.data.user,
        message: res.data.message || 'เข้าสู่ระบบสำเร็จ'
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ',
        token: '',
        user: {} as User
      }
    }
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    const useMock = import.meta.env.VITE_USE_FAKE_API === 'true'

    if (useMock) {
      console.log('🧪 Mock: Logout')
      return
    }

    try {
      await http.post('/auth/logout')
    } catch (error) {
      console.warn('Logout API failed')
    }
  },

  /**
   * Verify Token - ตรวจสอบว่า token ยังใช้งานได้หรือไม่
   */
  async verifyToken(token: string): Promise<{ valid: boolean; user?: User }> {
    const useMock = import.meta.env.VITE_USE_FAKE_API === 'true'

    if (useMock) {
      console.log('🧪 Mock: Verifying token')
      
      // ดึง user จาก localStorage
      const userData = localStorage.getItem('auth_user')
      if (!userData) {
        return { valid: false }
      }

      try {
        const user = JSON.parse(userData)
        
        // ตรวจสอบว่า token ยังไม่หมดอายุ (mock: ตรวจแค่ว่ามี user หรือไม่)
        return { valid: true, user }
      } catch {
        return { valid: false }
      }
    }

    // Real API
    try {
      const res = await http.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })

      return {
        valid: res.data.valid || false,
        user: res.data.user
      }
    } catch {
      return { valid: false }
    }
  },

  /**
   * Get Current User
   */
  async getCurrentUser(): Promise<User> {
    const userData = localStorage.getItem('auth_user')
    if (!userData) {
      throw new Error('No user data found')
    }

    return JSON.parse(userData)
  }
}