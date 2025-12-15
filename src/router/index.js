import { createRouter, createWebHistory } from 'vue-router'

import Main from '@/pages/Main/waybill/index.vue'
import Waybill from '@/pages/Document/Waybill/index.vue'
import EditWaybill from '@/pages/Document/Waybill/EditWaybill.vue'
import WaybillDebtor from '@/pages/Document/WaybillDebtor/index.vue'
import WaybillResearch from '@/pages/Document/WaybillResearch/index.vue'
import Report_submit from "@/pages/Main/Report_submit/index.vue"
import pdfpage from "@/pages/Document/Pdfpage/index.vue"
import indexsavedebtor from "@/pages/Main/savedebtor/index.vue"
import indexwaybilldebtor from "@/pages/Main/waybilldebtor/index.vue"
import ClearDebtor from '@/pages/Document/ClearDebtor/index.vue'


const routes = [
  { path: '/', name: 'main', component: Main },
  { path: '/waybill', name: 'waybill', component: Waybill },
    {path: '/waybill/edit/:id',name: 'EditReceipt',component: Waybill},
  { path: '/waybilldebtor', name: 'waybilldebtor', component: WaybillDebtor },
  { path: '/waybilldebtor/edit/:id', name: 'EditReceipt', component: WaybillDebtor },
  { path: '/waybillresearch', name: 'waybillresearch', component: WaybillResearch },
  { path: '/Report_submit', name: 'Report_submit',component:Report_submit},
  { path: '/pdfpage', name: 'pdfpage',component:pdfpage},
  { path: '/indexsavedebtor', name: 'indexsavedebtor',component:indexsavedebtor},
  { path: '/pdfpage', name: 'pdfpage',component:pdfpage},
  { path: '/cleardebtor', name: 'cleardebtor',component:ClearDebtor},
  { path: '/indexwaybilldebtor', name: 'indexwaybilldebtor',component:indexwaybilldebtor},
  { path: '/EditWaybill', name: 'EditWaybill',component:EditWaybill}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

