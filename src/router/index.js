import { createRouter, createWebHistory } from 'vue-router'

import Main from '@/pages/Main/index.vue'
import Waybill from '@/pages/Document/Waybill/index.vue'
import WaybillDebtor from '@/pages/Document/WaybillDebtor/index.vue'
import SaveDebtor from '@/pages/Document/SaveDebtor/index.vue'
import WaybillResearch from '@/pages/Document/WaybillResearch/index.vue'
import resultsubmit from "@/pages/Document/results submitted/index.vue"
import pdfpage from "@/pages/Document/Pdfpage/index.vue"
import edit from "@/pages/Edit/index.vue"


const routes = [
  { path: '/', name: 'mmain', component: Main },
  { path: '/waybill', name: 'waybill', component: Waybill },
  { path: '/waybilldebtor', name: 'waybilldebtor', component: WaybillDebtor },
  { path: '/savedebtor', name: 'savedebtor', component: SaveDebtor },
  { path: '/waybillresearch', name: 'waybillresearch', component: WaybillResearch },
  { path: '/resultsubmit', name: 'resultsubmit',component:resultsubmit},
  { path: '/pdfpage', name: 'pdfpage',component:pdfpage},
  { path: '/edit', name: 'edit',component:edit}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

