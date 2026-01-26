// src/services/AuthService/auth.api.ts
import axios from 'axios'
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
}

/**
 * Auth API Layer
 * ใช้สำหรับเรียก API จริง (หรือ Mock ผ่าน Axios Mock Adapter)
 */
export const AuthAPI = {
  
  /**
   * Login - เข้าสู่ระบบ
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const res = await axios.post<LoginResponse>('/auth/login', credentials)
    return res.data
  },

  /**
   * Logout - ออกจากระบบ (ถ้า backend ต้องการ)
   */
  async logout(): Promise<void> {
    await axios.post('/auth/logout')
  },

  /**
   * Verify Token - ตรวจสอบ token ยังใช้ได้อยู่หรือไม่
   */
  async verifyToken(token: string): Promise<{ valid: boolean; user?: User }> {
    const res = await axios.post('/auth/verify', { token })
    return res.data
  },

  /**
   * Get Current User - ดึงข้อมูล user ปัจจุบัน
   */
  async getCurrentUser(): Promise<User> {
    const res = await axios.get<{ success: boolean; user: User }>('/auth/me')
    return res.data.user
  }
}