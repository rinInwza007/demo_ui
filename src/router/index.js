// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

import Main from '@/pages/Main/waybill/index.vue'
import Waybill from '@/pages/Document/Waybill/index.vue'
// ❌ ลบ EditWaybill component ออก (ใช้ Waybill แทน)
import WaybillDebtor from '@/pages/Document/WaybillDebtor/index.vue'
import WaybillResearch from '@/pages/Document/WaybillResearch/index.vue'
import Report_submit from "@/pages/Main/Report_submit/index.vue"
import pdfpage from "@/pages/Document/Pdfpage/index.vue"
import indexsavedebtor from "@/pages/Main/savedebtor/index.vue"
import indexwaybilldebtor from "@/pages/Main/waybilldebtor/index.vue"
import ClearDebtor from '@/pages/Document/ClearDebtor/index.vue'

const routes = [
  { path: '/', name: 'main', component: Main },
  
  // ✅ Waybill routes - ใช้ component เดียวกัน
  { path: '/waybill', name: 'waybill', component: Waybill },
  { 
    path: '/waybill/edit/:id', 
    name: 'waybill-edit',  // ✅ เปลี่ยนชื่อให้ชัดเจน
    component: Waybill     // ✅ ใช้ component เดียวกัน
  },
  
  // Waybill Debtor routes
  { path: '/waybilldebtor', name: 'waybilldebtor', component: WaybillDebtor },
  { path: '/waybilldebtor/edit/:id', name: 'waybilldebtor-edit', component: WaybillDebtor },
  
  // Other routes
  { path: '/waybillresearch', name: 'waybillresearch', component: WaybillResearch },
  { path: '/Report_submit', name: 'Report_submit', component: Report_submit },
  { path: '/pdfpage/:id?', name: 'pdfpage', component: pdfpage }, // ✅ เพิ่ม :id parameter
  { path: '/indexsavedebtor', name: 'indexsavedebtor', component: indexsavedebtor },
  { path: '/cleardebtor', name: 'cleardebtor', component: ClearDebtor },
  { path: '/indexwaybilldebtor', name: 'indexwaybilldebtor', component: indexwaybilldebtor },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router