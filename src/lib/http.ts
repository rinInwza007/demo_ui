import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
})

// 🔐 ใส่ token ให้อัตโนมัติ (ถ้ามี)
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ❌ จัดการ error กลาง
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network / CORS error
    if (!error.response) {
      console.error('🌐 Network / CORS error:', error)
    }
    return Promise.reject(error)
  }
)

export default http
