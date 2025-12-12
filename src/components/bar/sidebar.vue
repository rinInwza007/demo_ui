<!-- src/components/layout/Sidebar.vue -->
<template>
  <!-- Sidebar (Mac Style) -->
  <aside
    class="w-20 lg:w-64 h-full flex flex-col glass-panel border-r border-white/40 z-20 transition-all duration-300"
  >
    <!-- Logo & Title -->
    <div class="p-6 flex items-center gap-2">
      <img
        src="https://www.up.ac.th/en/img/logo_up.png"
        class="w-9 h-12 rounded-full shadow-sm"
        alt="UP Logo"
      />
      <span
        class="font-bold text-lg hidden lg:block text-slate-800 tracking-tight"
      >
        WayBill - <span class="text-purple-600">UP</span>
      </span>
    </div>

    <!-- Menu -->
    <nav class="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
      <a
        href="#"
        v-for="item in menuItems"
        :key="item.id"
        @click.prevent="handleMenuClick(item)"
        class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group"
        :class="
          activeMenu === item.id
            ? 'bg-white/60 shadow-sm text-blue-600 font-semibold'
            : 'text-slate-600 hover:bg-white/30 hover:text-slate-900'
        "
      >
        <i :class="item.icon" class="text-xl"></i>
        <span class="hidden lg:block">{{ item.label }}</span>

        <div
          v-if="activeMenu === item.id"
          class="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 hidden lg:block"
        ></div>
      </a>
    </nav>

    <!-- User Profile -->
    <div class="p-4 border-t border-white/30">
      <div
        class="flex items-center gap-3 bg-white/30 p-2 rounded-xl backdrop-blur-sm cursor-pointer hover:bg-white/50 transition-colors"
      >
        <img
          src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff"
          class="w-9 h-9 rounded-full shadow-sm"
          alt="User"
        />
        <div class="hidden lg:block">
          <p class="text-sm font-semibold text-slate-800">ผู้ดูแลระบบ</p>
          <p class="text-xs text-slate-500">การเงินและบัญชี</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// เมนู
const menuItems = ref([
  { id: '', label: 'ใบนำส่งเงิน', icon: 'ph ph-files' },
  { id: 'indexwaybilldebtor', label: 'ใบนำส่งลูกหนี้', icon: 'ph ph-files' },
  { id: 'indexsavedebtor', label: 'ล้างลูกหนี้', icon: 'ph ph-files' },
  { id: 'Report_submit', label: 'รายงานสรุป', icon: 'ph ph-chart-bar' },

])

// map id → ชื่อ route (จากไฟล์ router ที่พี่ส่งมา)
const menuRouteMap: Record<string, string> = {
  waybill: 'waybill',
  indexwaybilldebtor: 'indexwaybilldebtor',
  indexsavedebtor: 'indexsavedebtor',
  Report_submit: 'Report_submit',
}

const activeMenu = ref<string>('')

// sync activeMenu ตาม route ปัจจุบัน
const syncActiveFromRoute = () => {
  const currentName = route.name as string | undefined
  const found = menuItems.value.find((m) => menuRouteMap[m.id] === currentName)
  activeMenu.value = found ? found.id : ''
}

syncActiveFromRoute()

watch(
  () => route.name,
  () => syncActiveFromRoute()
)

// เวลากดเมนู
const handleMenuClick = (item: { id: string }) => {
  activeMenu.value = item.id
  const routeName = menuRouteMap[item.id]
  if (routeName) {
    router.push({ name: routeName })
  }
}
</script>
