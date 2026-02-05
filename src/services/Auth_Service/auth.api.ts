// src/services/AuthService/auth.api.ts
import http from '@/lib/http'
import { User } from '@/types/user'

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

// ✅ Response type จาก Backend
export interface BackendUserResponse {
  id: string
  email: string
  name: string
  createdAt: string
  userProfile: {
    id: string
    userId: string
    fullName: string
    phone: string
    roleId: string
    fundName: string
    affiliationId: string
    subAffiliationId: string
    sendmoney: string
    role: {
      id: string
      name: string
      description: string
    }
    affiliation: {
      id: string
      name: string
      type: string
    }
  }
}

export const AuthAPI = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const res = await http.post('/auth/login', credentials)
    const data = res.data

    return {
      success: true,
      token: data.access_token || data.token,
      user: data.user,
      message: data.message || 'เข้าสู่ระบบสำเร็จ'
    }
  },

  async logout(): Promise<void> {
    await http.post('/auth/logout')
  },

  async verifyToken(token: string): Promise<{ valid: boolean; user?: User }> {
    try {
      const res = await http.post('/auth/verify', { token })
      return res.data
    } catch {
      return { valid: false }
    }
  },

  async getCurrentUser(): Promise<User> {
    const res = await http.get<BackendUserResponse>('/auth/me')
    const data = res.data

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      createdAt: data.createdAt,
      userProfile: {
        fullName: data.userProfile.fullName,
        phone: data.userProfile.phone,
        role: {
          id: data.userProfile.role.id,
          name: data.userProfile.role.name,
        },
        affiliation: {
          id: data.userProfile.affiliation.id,
          name: data.userProfile.affiliation.name,
          type: data.userProfile.affiliation.type,
        },
      },
    }
  },
}

