// src/services/AuthService/AuthService.ts
import { AuthAPI, type LoginRequest, type LoginResponse } from './AuthApi'
import type { User } from '@/stores/auth'

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
    return await AuthAPI.login(credentials)
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