// src/lib/http.ts
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
import Swal from 'sweetalert2'

// ✅ Request Interceptor - แนบ Token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasToken: !!token,
    })
    
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// ✅ Response Interceptor - จัดการ Error
axios.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      status: response.status,
      url: response.config.url,
    })
    return response
  },
  async (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
    })

    // ✅ ตรวจสอบว่าเป็น Mock Mode หรือไม่
    const useMock = import.meta.env.VITE_USE_FAKE_API === 'true'

    // ✅ กรณี Token หมดอายุ (401 Unauthorized)
    if (error.response?.status === 401) {
      // ✅ ใน Mock Mode: ข้าม 401 (เพราะ Mock Service จัดการเอง)
      if (useMock) {
        console.warn('⚠️ Mock Mode: Ignoring 401 - Mock Service handles this')
        return Promise.reject(error)
      }

      // ✅ Real API Mode: Logout และ Redirect
      console.error('🔒 Token expired or invalid - Logging out...')
      
      const authStore = useAuthStore()
      await authStore.logout()
      
      await Swal.fire({
        icon: 'warning',
        title: 'Session หมดอายุ',
        text: 'กรุณาเข้าสู่ระบบอีกครั้ง',
        confirmButtonText: 'เข้าสู่ระบบ',
        confirmButtonColor: '#7E22CE',
        allowOutsideClick: false,
      })
      
      router.push({ 
        name: 'testlogin',
        query: { redirect: router.currentRoute.value.fullPath }
      })
    }
    
    // ✅ กรณีไม่มีสิทธิ์ (403 Forbidden)
    if (error.response?.status === 403 && !useMock) {
      console.error('🚫 Access forbidden')
      
      await Swal.fire({
        icon: 'error',
        title: 'ไม่มีสิทธิ์เข้าถึง',
        text: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#DC2626',
      })
    }
    
    return Promise.reject(error)
  }
)

export default axios