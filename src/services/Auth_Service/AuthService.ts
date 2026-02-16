// src/services/AuthService/AuthService.ts
import { AuthAPI, type LoginRequest, type LoginResponse } from './AuthApi'
import { User } from '@/types/user'
import http from '@/lib/http'

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('📤 Sending login request:', {
        url: `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        payload: credentials
      })

      const res = await http.post('/auth/login', credentials)
      const data = res.data

      console.log('📥 Login response:', data)

      if (data?.error || data?.message?.includes('Invalid')) {
        throw new Error(data.error || data.message || 'Invalid credentials')
      }

      const token = data.access_token || data.token
      if (!token) {
        console.error('❌ No token in response:', data)
        throw new Error('No token received from server')
      }

      if (!data.user) {
        console.error('❌ No user in response:', data)
        throw new Error('No user data received from server')
      }

      console.log('✅ Login successful:', {
        token: token.substring(0, 20) + '...',
        user: data.user.email
      })

      return {
        success: true,
        token,
        user: data.user,
        message: data.message || 'เข้าสู่ระบบสำเร็จ',
      }
    } catch (err: any) {
      console.error('❌ Login error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })

      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'เข้าสู่ระบบไม่สำเร็จ'

      throw new Error(errorMessage)
    }
  }

  async logout(): Promise<void> {
    try {
      await AuthAPI.logout()
    } catch (error) {
      console.warn('Logout API failed, continuing with client-side logout')
    }
  }

  /**
   * ✅ Verify Token - เรียก GET /auth/verify (token ส่งผ่าน header อัตโนมัติ)
   */
  // src/services/AuthService/AuthService.ts
async verifyToken(): Promise<{ valid: boolean; user?: User }> {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) {
      console.log('⚠️ No token found')
      return { valid: false }
    }

    console.log('🔍 Verifying token...')
    const result = await AuthAPI.verifyToken()

    if (!result.isValid) {
      console.warn('❌ Token is invalid')
      return { valid: false }
    }

    console.log('✅ Token is valid')

    // ✅ ถ้ามี user ใน localStorage อยู่แล้ว → ใช้ต่อ
    const existingUser = localStorage.getItem('auth_user')
    if (existingUser) {
      return { valid: true }
    }

    // ✅ ถ้ายังไม่มี → ดึงใหม่
    console.log('📤 Fetching user profile...')
    const user = await this.getCurrentUser()
    return { valid: true, user }

  } catch (error: any) {
    // ✅ ถ้าเป็น 401 → ไม่ต้อง log error (เพราะ interceptor จัดการแล้ว)
    if (error.response?.status === 401) {
      console.log('⚠️ Token expired (401)')
      return { valid: false }
    }

    console.error('❌ Verify token error:', error)
    return { valid: false }
  }
}



  async getCurrentUser(): Promise<User> {
    return await AuthAPI.getCurrentUser()
  }

  hasRole(user: User | null, ...roles: string[]): boolean {
    if (!user) return false
    const userRole = user.userProfile?.role?.name
    return !!userRole && roles.includes(userRole)
  }

  hasAffiliation(user: User | null, ...affiliationIds: string[]): boolean {
    if (!user) return false
    const userAffId = user.userProfile?.affiliation?.id
    return !!userAffId && affiliationIds.includes(userAffId)
  }
}

export const authService = new AuthService()
