// src/services/AuthService/AuthService.ts
import { AuthAPI, type LoginRequest, type LoginResponse } from './auth.api'
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
  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const result = await AuthAPI.verifyToken()

      // ✅ ถ้า Backend บอกว่า valid และต้องการ user ข้อมูลเต็ม → เรียก /auth/me
      if (result.isValid) {
        try {
          const user = await this.getCurrentUser()
          return { valid: true, user }
        } catch (error) {
          console.warn('Failed to get user details after verification:', error)
          return { valid: true } // Token valid แต่ไม่มี user detail
        }
      }

      return { valid: false }
    } catch (error) {
      console.error('Token verification failed:', error)
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
