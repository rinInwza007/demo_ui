// src/services/AuthService.ts
import axios from 'axios'
import type { User } from '@/types/user'

interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: User
}

export const authService = {
  /**
   * ✅ Login
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>('/auth/login', payload)
    return response.data
  },

  /**
   * ✅ Logout
   */
  async logout(): Promise<void> {
    await axios.post('/auth/logout')
  },

  /**
   * ✅ Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await axios.get<User>('/auth/me')
    return response.data
  },

  /**
   * ✅ Refresh token
   */
  async refreshToken(): Promise<{ token: string }> {
    const response = await axios.post<{ token: string }>('/auth/refresh')
    return response.data
  },

  /**
   * ✅ Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await axios.post('/auth/change-password', { oldPassword, newPassword })
  },
}