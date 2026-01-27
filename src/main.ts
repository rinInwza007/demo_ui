// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'

import './index.css'
import App from './App.vue'
import router from './router'
import tippyDirective from './directives/tippy'
import { VueDatePicker } from "@vuepic/vue-datepicker"
import '@vuepic/vue-datepicker/dist/main.css'
import "hover.css"
import VueApexCharts from "vue3-apexcharts"
import Swal from 'sweetalert2'

async function bootstrap() {
  // ===================================
  // ✅ ตั้งค่า Axios BaseURL สำหรับ Backend
  // ===================================
  const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
  axios.defaults.baseURL = apiBaseURL
  axios.defaults.timeout = 10000

  // ===================================
  // ✅ Request Interceptor - สำหรับ Debug
  // ===================================
  axios.interceptors.request.use(
    (config) => {
      const fullURL = `${config.baseURL}${config.url}`
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: fullURL
      })
      return config
    },
    (error) => {
      console.error('❌ Request Error:', error)
      return Promise.reject(error)
    }
  )

  // ===================================
  // ✅ Response Interceptor - สำหรับ Debug
  // ===================================
  axios.interceptors.response.use(
    (response) => {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        dataType: Array.isArray(response.data) ? 'Array' : typeof response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : undefined
      })
      return response
    },
    (error) => {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data
      })
      return Promise.reject(error)
    }
  )

  // ===================================
  // ✅ เฉพาะ DEV + VITE_USE_FAKE_API=true → ใช้ Mock
  // ===================================
  const useMockAPI = import.meta.env.DEV && import.meta.env.VITE_USE_FAKE_API === 'true'

  if (useMockAPI) {
    const { setupAxiosMock } = await import('@/fake/mockAxios')
    setupAxiosMock()
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🧪 Mock API Enabled (Development Mode)')
    console.log('   📝 All API calls will use localStorage')
    console.log('   🔧 To use real backend, set VITE_USE_FAKE_API=false in .env')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🌐 Real API Mode')
    console.log('   📝 API Base URL:', apiBaseURL)
    console.log('   🔌 Make sure backend is running!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }

  // ===================================
  // ✅ Initialize Vue App
  // ===================================
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(VueApexCharts)
  app.component('VueDatePicker', VueDatePicker)
  app.use(router)
  app.directive('tippy', tippyDirective)
  app.mount('#app')
}

bootstrap()
