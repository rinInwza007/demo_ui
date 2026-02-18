// src/lib/http.ts
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
import Swal from 'sweetalert2'

let isHandling401 = false

// ✅ Request Interceptor
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

// ✅ Response Interceptor - ปรับปรุงแล้ว
axios.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      status: response.status,
      url: response.config.url,
    })
    return response
  },
  async (error) => {
    const url = error.config?.url || ''

    console.error('❌ API Error:', {
      status: error.response?.status,
      url,
      message: error.message,
    })

    // ✅ ข้าม 401 จาก login/verify/logout endpoints
    if (
      url.includes('/auth/login') ||
      url.includes('/auth/verify') ||
      url.includes('/auth/logout')
    ) {
      return Promise.reject(error)
    }

    // ✅ จัดการ 401 เฉพาะ API endpoints อื่นๆ
    if (error.response?.status === 401) {
      // ❌ ถ้ากำลังจัดการอยู่ → ข้าม
      if (isHandling401) {
        return Promise.reject(error)
      }

      isHandling401 = true

      try {
        const authStore = useAuthStore()

        // ❌ ถ้าไม่มี token → ข้าม
        if (!authStore.token) {
          return Promise.reject(error)
        }

        console.error('🔒 Session expired - Logging out')

        // ✅ Logout โดยไม่เรียก API (เพราะ token หมดอายุแล้ว)
        await authStore.logout(false)

        await Swal.fire({
          icon: 'warning',
          title: 'Session หมดอายุ',
          text: 'กรุณาเข้าสู่ระบบอีกครั้ง',
          confirmButtonText: 'เข้าสู่ระบบ',
          confirmButtonColor: '#7E22CE',
          allowOutsideClick: false,
        })

        // ✅ Redirect ไป login
        if (router.currentRoute.value.name !== 'testlogin') {
          await router.push({
            name: 'testlogin',
            query: { redirect: router.currentRoute.value.fullPath }
          })
        }

      } finally {
        // ✅ Reset flag หลัง 1 วินาที
        setTimeout(() => {
          isHandling401 = false
        }, 1000)
      }

      return Promise.reject(error)
    }

    // ✅ 403 Forbidden
    if (error.response?.status === 403) {
      await Swal.fire({
        icon: 'error',
        title: 'ไม่มีสิทธิ์เข้าถึง',
        text: 'คุณไม่มีสิทธิ์ในการเข้าถึงส่วนนี้',
        confirmButtonColor: '#7E22CE',
      })
    }

    return Promise.reject(error)
  }
)

export default axios
