// src/services/Auth_Service/AuthService.ts
import { AuthAPI, type LoginRequest, type LoginResponse } from './AuthApi'
import type { User } from '@/stores/auth'

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('📤 Login attempt:', credentials.email)

      const response = await AuthAPI.login(credentials)

      // ✅ ตรวจสอบว่า response มี error หรือไม่
      if ('error' in response && response.error) {
        console.error('❌ Login failed:', response.error)
        throw new Error(response.error)
      }

      // ✅ ตรวจสอบว่ามี success flag
      if (!response.success) {
        console.error('❌ Login failed: No success flag')
        throw new Error(response.message || 'เข้าสู่ระบบไม่สำเร็จ')
      }

      // ✅ ตรวจสอบว่ามี token และ user
      if (!response.token) {
        console.error('❌ No token in response')
        throw new Error('ไม่ได้รับ token จากระบบ')
      }

      if (!response.user) {
        console.error('❌ No user in response')
        throw new Error('ไม่ได้รับข้อมูลผู้ใช้')
      }

      console.log('✅ Login successful:', {
        user: response.user.email,
        role: response.user.role,
        hasToken: !!response.token
      })

      return response
    } catch (err: any) {
      console.error('❌ Login error:', err.message || err)
      
      // ✅ Re-throw error เพื่อให้ AuthStore จัดการต่อ
      throw err
    }
  }

  async logout(): Promise<void> {
    try {
      await AuthAPI.logout()
    } catch (error) {
      console.warn('Logout API failed, continuing with client-side logout')
    }
  }

  async verifyToken(token: string): Promise<{ valid: boolean; user?: User }> {
    try {
      console.log('🔍 Verifying token...')
      return await AuthAPI.verifyToken(token)
    } catch (error: any) {
      console.error('❌ Token verification failed:', error.message)
      return { valid: false }
    }
  }

  async getCurrentUser(): Promise<User> {
    return await AuthAPI.getCurrentUser()
  }

  hasRole(user: User | null, ...roles: string[]): boolean {
    if (!user) return false
    return roles.includes(user.role)
  }

  hasAffiliation(user: User | null, ...affiliationIds: string[]): boolean {
    if (!user) return false
    return affiliationIds.includes(user.affiliationId)
  }
}

export const authService = new AuthService()