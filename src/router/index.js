// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

import indexwaybill from '@/pages/Main/waybill/index.vue'
import Waybill from '@/pages/Document/Waybill/index.vue'
import WaybillResearch from '@/pages/Document/WaybillResearch/index.vue'
import Report_submit from '@/pages/Main/Report_submit/index.vue'
import pdfpage from '@/pages/Document/Pdfpage/index.vue'
import pdfDebtor from '@/pages/Document/Pdfpage/PdfDebtor.vue'
import indexsavedebtor from '@/pages/Main/savedebtor/index.vue'
import indexwaybilldebtor from '@/pages/Main/waybilldebtor/index.vue'
import ClearDebtor from '@/pages/Document/ClearDebtor/index.vue'
import daily_closing from '@/pages/Main/daily_closing/index.vue'
import testlogin from '@/pages/Main/testlogin.vue'
import Daily_Report from '@/pages/Document/Pdfpage/Daily_Report.vue'
import pdfclear from '@/pages/Document/Pdfpage/pdfclear.vue'

const routes = [
  {
    path: '/',
    redirect: '/testlogin',
  },
  {
    path: '/testlogin',
    name: 'testlogin',
    component: testlogin,
    meta: { requiresAuth: false },
  },
  {
    path: '/indexwaybill',
    name: 'main',
    component: indexwaybill,
    meta: { requiresAuth: true },
  },
  {
    path: '/waybill',
    name: 'waybill',
    component: Waybill,
    meta: { requiresAuth: true, roles: ['user'] },
  },
  {
    path: '/waybill/edit/:id',
    name: 'waybill-edit',
    component: Waybill,
    meta: { requiresAuth: true, roles: ['user', 'treasury'] },
  },
  {
    path: '/waybillresearch',
    name: 'waybillresearch',
    component: WaybillResearch,
    meta: { requiresAuth: true },
  },
  {
    path: '/Report_submit',
    name: 'Report_submit',
    component: Report_submit,
    meta: { requiresAuth: true },
  },
  {
    path: '/pdfpage/:id?',
    name: 'pdfpage',
    component: pdfpage,
    meta: { requiresAuth: true },
  },
  {
    path: '/pdfDebtor/:id?',
    name: 'pdfDebtor',
    component: pdfDebtor,
    meta: { requiresAuth: true },
  },
  {
    path: '/indexsavedebtor',
    name: 'indexsavedebtor',
    component: indexsavedebtor,
    meta: { requiresAuth: true },
  },
  {
    path: '/cleardebtor/multi',
    name: 'cleardebtor-multi',
    component: ClearDebtor,
    meta: { requiresAuth: true, roles: ['user'] },
  },
  {
    path: '/indexwaybilldebtor',
    name: 'indexwaybilldebtor',
    component: indexwaybilldebtor,
    meta: { requiresAuth: true },
  },
  {
    path: '/daily_closing',
    name: 'daily_closing',
    component: daily_closing,
    meta: { requiresAuth: true, roles: ['treasury', 'admin', 'superadmin'] },
  },
  {
    path: '/daily_report/:dateKey',
    name: 'daily_report',
    component: Daily_Report,
    meta: { requiresAuth: true },
  },
  {
    path: '/pdfclear/:id',
    name: 'pdfclear',
    component: pdfclear,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ✅ Global Navigation Guard - ตรวจสอบ Token ก่อนเข้าทุกหน้า
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  console.log('🔍 Router Guard:', {
    from: from.name,
    to: to.name,
    requiresAuth: to.meta.requiresAuth,
    isLoggedIn: authStore.isLoggedIn,
  })

  // ✅ ถ้าเป็นหน้าที่ต้อง Login
  if (to.meta.requiresAuth) {
    // ✅ ตรวจสอบว่า Login แล้วหรือยัง
    if (!authStore.isLoggedIn) {
      console.warn('⚠️ Not logged in - Redirecting to login')
      return next({
        name: 'testlogin',
        query: { redirect: to.fullPath },
      })
    }

    // ✅ ตรวจสอบ Token ว่ายังใช้งานได้หรือไม่
    try {
      const isValid = await authStore.verifyToken()

      if (!isValid) {
        console.error('❌ Token invalid - Redirecting to login')
        return next({
          name: 'testlogin',
          query: { redirect: to.fullPath },
        })
      }
    } catch (error) {
      console.error('❌ Token verification failed:', error)
      return next({
        name: 'testlogin',
        query: { redirect: to.fullPath },
      })
    }

    // ✅ ตรวจสอบสิทธิ์ตาม Role (ถ้ามี)
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      const hasRole = authStore.isRole(...to.meta.roles)

      if (!hasRole) {
        console.error('❌ Insufficient permissions')
        
        await Swal.fire({
          icon: 'error',
          title: 'ไม่มีสิทธิ์เข้าถึง',
          text: 'คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#DC2626',
        })

        return next({ name: 'main' })
      }
    }
  }

  // ✅ ถ้า Login แล้วแต่พยายามเข้าหน้า Login
  if (to.name === 'testlogin' && authStore.isLoggedIn) {
    console.log('✅ Already logged in - Redirecting to main')
    return next({ name: 'main' })
  }

  // ✅ อนุญาตให้ผ่าน
  next()
})

export default router