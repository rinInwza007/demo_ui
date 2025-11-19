import { createRouter, createWebHistory } from 'vue-router'

import Main from '@/pages/Main/index.vue'
import Waybill from '@/pages/Document/Waybill/index.vue'
import pdfview from '@/pages/Pdf/pdfview.vue'
import WaybillDebtor from '@/pages/Document/WaybillDebtor/index.vue'
import SaveDebtor from '@/pages/Document/SaveDebtor/index.vue'
import pdfpage from '@/pages/Document/PDF-Page/index.vue'

const routes = [
  { path: '/', name: 'mmain', component: Main },
  { path: '/waybill', name: 'waybill', component: Waybill },
  { path: '/viewpdf/:id', name: 'viewpdf', component: pdfview },
  { path: '/waybilldebtor', name: 'waybilldebtor', component: WaybillDebtor },
  { path: '/savedebtor', name: 'savedebtor', component: SaveDebtor },
  { path: '/pdfview', name: 'pdfview', component: pdfview },
  { path: '/pdfpage', name: 'pdfpage', component: pdfpage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

