// src/services/AuthService/AuthService.ts
import { AuthAPI, type LoginRequest, type LoginResponse } from './auth.api'
import  { User } from '@/types/user'
import http from '@/lib/http'

/**
 * AuthService - จัดการ Authentication
 *
 * ✅ ระบบจะตรวจสอบ mode อัตโนมัติ:
 * - Mock Mode (DEV + VITE_USE_FAKE_API=true): ใช้ Mock Users จาก mockAxios
 * - Real API Mode: เรียก Backend API จริง
 *
 * ⚠️ ไม่ต้องมี if-else เช็ค Mock ใน Service
 * เพราะ Axios Mock Adapter จะจัดการให้อัตโนมัติ
 */
class AuthService {

  /**
   * Login - เข้าสู่ระบบ
   * @param credentials - email และ password
   * @returns Token และข้อมูล User
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    console.log('📤 Sending login request:', {
      url: `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
      payload: credentials
    })

    const res = await http.post('/auth/login', credentials)
    const data = res.data

    console.log('📥 Login response:', data)

    // ❌ Backend ส่ง error มาแบบ 2xx status
    if (data?.error || data?.message?.includes('Invalid')) {
      throw new Error(data.error || data.message || 'Invalid credentials')
    }

    // ✅ ตรวจสอบว่ามี access_token
    const token = data.access_token || data.token
    if (!token) {
      console.error('❌ No token in response:', data)
      throw new Error('No token received from server')
    }

    // ✅ ตรวจสอบว่ามี user
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


  /**
   * Logout - ออกจากระบบ
   * (อาจจะเรียก API เพื่อ invalidate token ที่ backend)
   */
  async logout(): Promise<void> {
    try {
      await AuthAPI.logout()
    } catch (error) {
      // ถ้า API ล้มเหลว ก็ไม่เป็นไร ให้ logout ที่ frontend อยู่ดี
      console.warn('Logout API failed, continuing with client-side logout')
    }
  }

  /**
   * Verify Token - ตรวจสอบว่า token ยังใช้งานได้หรือไม่
   */
  async verifyToken(token: string): Promise<{ valid: boolean; user?: User }> {
    try {
      return await AuthAPI.verifyToken(token)
    } catch (error) {
      return { valid: false }
    }
  }

  /**
   * Get Current User - ดึงข้อมูล user ที่ login อยู่
   */
  async getCurrentUser(): Promise<User> {
    return await AuthAPI.getCurrentUser()
  }

  /**
   * Check if user has specific role
   */
  hasRole(user: User | null, ...roles: string[]): boolean {
    if (!user) return false
    return roles.includes(user.role)
  }

  /**
   * Check if user belongs to specific affiliation
   */
  hasAffiliation(user: User | null, ...affiliationIds: string[]): boolean {
    if (!user) return false
    return affiliationIds.includes(user.affiliationId)
  }
}

export const authService = new AuthService()
