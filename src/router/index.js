// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import indexwaybill from '@/pages/Main/waybill/index.vue'
import Waybill from '@/pages/Document/Waybill/index.vue'
import WaybillResearch from '@/pages/Document/WaybillResearch/index.vue'
import Report_submit from "@/pages/Main/Report_submit/index.vue"
import pdfpage from "@/pages/Document/Pdfpage/index.vue"
import pdfDebtor from "@/pages/Document/Pdfpage/PdfDebtor.vue"
import indexsavedebtor from "@/pages/Main/savedebtor/index.vue"
import indexwaybilldebtor from "@/pages/Main/waybilldebtor/index.vue"
import ClearDebtor from '@/pages/Document/ClearDebtor/index.vue'
import daily_closing from '@/pages/Main/daily_closing/index.vue'
import testlogin from '@/pages/Main/testlogin.vue'
import Daily_Report from '@/pages/Document/Pdfpage/Daily_Report.vue'
import pdfclear from '@/pages/Document/Pdfpage/pdfclear.vue'

const routes = [
  {
    path: '/',
    redirect: '/testlogin'
  },

  // ✅ หน้า login - ไม่ต้อง auth
  {
    path: '/testlogin',
    name: 'testlogin',
    component: testlogin,
    meta: { requiresAuth: false }
  },

  // ✅ หน้าที่ต้อง auth
  {
    path: '/indexwaybill',
    name: 'main',
    component: indexwaybill,
    meta: { requiresAuth: true }
  },
  {
    path: '/waybill',
    name: 'waybill',
    component: Waybill,
    meta: { requiresAuth: true }
  },
  {
    path: '/waybill/edit/:id',
    name: 'waybill-edit',
    component: Waybill,
    meta: { requiresAuth: true }
  },
  {
    path: '/waybillresearch',
    name: 'waybillresearch',
    component: WaybillResearch,
    meta: { requiresAuth: true }
  },
  {
    path: '/Report_submit',
    name: 'Report_submit',
    component: Report_submit,
    meta: { requiresAuth: true }
  },
  {
    path: '/pdfpage/:id?',
    name: 'pdfpage',
    component: pdfpage,
    meta: { requiresAuth: true }
  },
  {
    path: '/pdfDebtor/:id?',
    name: 'pdfDebtor',
    component: pdfDebtor,
    meta: { requiresAuth: true }
  },
  {
    path: '/indexsavedebtor',
    name: 'indexsavedebtor',
    component: indexsavedebtor,
    meta: { requiresAuth: true }
  },
  {
    path: '/cleardebtor/multi',
    name: 'cleardebtor-multi',
    component: ClearDebtor,
    meta: { requiresAuth: true }
  },
  {
    path: '/indexwaybilldebtor',
    name: 'indexwaybilldebtor',
    component: indexwaybilldebtor,
    meta: { requiresAuth: true }
  },
  {
    path: '/daily_closing',
    name: 'daily_closing',
    component: daily_closing,
    meta: { requiresAuth: true }
  },
  {
    path: '/daily_report/:dateKey',
    name: 'daily_report',
    component: Daily_Report,
    meta: { requiresAuth: true }
  },
  {
    path: '/pdfclear/:id',
    name: 'pdfclear',
    component: pdfclear,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ✅ Navigation Guard - ตรวจสอบ Auth ก่อนเข้าหน้า
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  console.log('🔀 [Router] Navigating to:', to.name, 'from:', from.name)
  console.log('🔍 [Router] requiresAuth:', to.meta.requiresAuth)
  console.log('👤 [Router] isLoggedIn:', auth.isLoggedIn)

  // ✅ ถ้าหน้าไม่ต้องการ auth → ผ่านเลย
  if (to.meta.requiresAuth === false) {
    console.log('✅ [Router] Public route, continue')
    return next()
  }

  // ✅ ถ้าหน้าต้องการ auth (default)
  if (!auth.isLoggedIn) {
    console.log('❌ [Router] Not logged in, redirect to login')
    return next({ name: 'testlogin' })
  }

  // ✅ Verify token เฉพาะเมื่อครบรอบ (5 นาที)
  if (auth.shouldVerifyToken) {
    console.log('🔍 [Router] Verifying token before navigation...')

    try {
      const isValid = await auth.verifyToken()

      if (!isValid) {
        console.log('❌ [Router] Token invalid, redirect to login')
        return next({ name: 'testlogin' })
      }

      console.log('✅ [Router] Token valid, continue')
    } catch (error) {
      console.error('❌ [Router] Verification error:', error)
      return next({ name: 'testlogin' })
    }
  } else {
    console.log('⏭️ [Router] Token recently verified, skip verification')
  }

  next()
})

export default router
