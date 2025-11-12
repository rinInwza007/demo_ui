import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/pages/home.vue'
import CreateBlade from '@/pages/createblade.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/createblade', name: 'createblade', component: CreateBlade },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
