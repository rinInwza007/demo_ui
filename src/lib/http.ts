// src/lib/http.ts
import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://up-income-nestjs.vercel.app',
  timeout: 10000,
})

// ✅ เพิ่ม interceptor เพื่อป้องกัน cache สำหรับ auth endpoints
http.interceptors.request.use((config) => {
  // ✅ ถ้าเป็น auth/verify ห้าม cache
  if (config.url?.includes('/auth/verify')) {
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    config.headers['Pragma'] = 'no-cache'
    config.headers['Expires'] = '0'
  }

  return config
})

export default http