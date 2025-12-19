// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

import Main from '@/pages/Main/waybill/index.vue'
import Waybill from '@/pages/Document/Waybill/index.vue'
import WaybillDebtor from '@/pages/Document/WaybillDebtor/index.vue'
import WaybillResearch from '@/pages/Document/WaybillResearch/index.vue'
import Report_submit from "@/pages/Main/Report_submit/index.vue"
import pdfpage from "@/pages/Document/Pdfpage/index.vue"
import pdfDebtor from "@/pages/Document/Pdfpage/PdfDebtor.vue"
import indexsavedebtor from "@/pages/Main/savedebtor/index.vue"
import indexwaybilldebtor from "@/pages/Main/waybilldebtor/index.vue"
import ClearDebtor from '@/pages/Document/ClearDebtor/index.vue'
import daily_closing from '@/pages/Main/daily_closing/index.vue'

const routes = [
  { path: '/', name: 'main', component: Main },

  { path: '/waybill', name: 'waybill', component: Waybill },
  {
    path: '/waybill/edit/:id',
    name: 'waybill-edit',  // ✅ เปลี่ยนชื่อให้ชัดเจน
    component: Waybill     // ✅ ใช้ component เดียวกัน
  },


  { path: '/waybilldebtor', name: 'waybilldebtor', component: WaybillDebtor },
  { path: '/waybilldebtor/edit/:id', name: 'waybilldebtor-edit', component: WaybillDebtor },


  { path: '/waybillresearch', name: 'waybillresearch', component: WaybillResearch },
  { path: '/Report_submit', name: 'Report_submit', component: Report_submit },
  { path: '/pdfpage/:id?', name: 'pdfpage', component: pdfpage }, // ✅ เพิ่ม :id parameter
  { path: '/pdfDebtor/:id?', name: 'pdfDebtor', component: pdfDebtor }, // ✅ เพิ่ม :id parameter
  { path: '/indexsavedebtor', name: 'indexsavedebtor', component: indexsavedebtor },
  { path: '/cleardebtor/:id', name: 'cleardebtor', component: ClearDebtor },
  { path: '/indexwaybilldebtor', name: 'indexwaybilldebtor', component: indexwaybilldebtor },
  { path: '/daily_closing', name: 'daily_closing', component: daily_closing },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
