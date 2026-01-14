// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

import indexwaybill from '@/pages/Main/waybill/index.vue'
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
import testlogin from '@/pages/Main/testlogin.vue'
import Daily_Report from '@/pages/Document/Pdfpage/Daily_Report.vue'
import pdfclear from '@/pages/Document/Pdfpage/pdfclear.vue'

const routes = [
  {
    path: '/',
    redirect: '/testlogin'
  },

  { path: '/indexwaybill', name: 'main', component: indexwaybill },
  { path: '/testlogin', name: 'testlogin', component: testlogin },

  { path: '/waybill', name: 'waybill', component: Waybill },
  {
    path: '/waybill/edit/:id',
    name: 'waybill-edit',
    component: Waybill
  },


  { path: '/waybilldebtor', name: 'waybilldebtor', component: WaybillDebtor },
  { path: '/waybilldebtor/edit/:id', name: 'waybilldebtor-edit', component: WaybillDebtor },


  { path: '/waybillresearch', name: 'waybillresearch', component: WaybillResearch },
  { path: '/Report_submit', name: 'Report_submit', component: Report_submit },
  { path: '/pdfpage/:id?', name: 'pdfpage', component: pdfpage },
  { path: '/pdfDebtor/:id?', name: 'pdfDebtor', component: pdfDebtor },
  { path: '/indexsavedebtor', name: 'indexsavedebtor', component: indexsavedebtor },
  { path: '/cleardebtor/multi', name: 'cleardebtor-multi', component: ClearDebtor },
  { path: '/indexwaybilldebtor', name: 'indexwaybilldebtor', component: indexwaybilldebtor },
  { path: '/daily_closing', name: 'daily_closing', component: daily_closing },
{ path: '/daily_report/:dateKey', name: 'daily_report', component: Daily_Report },
{ path: '/pdfclear/:id', name: 'pdfclear', component: pdfclear }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
