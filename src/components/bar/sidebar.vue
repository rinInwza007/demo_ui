<!-- src/components/layout/Sidebar.vue -->
<template>
  <aside
    class="w-20 lg:w-64 h-full flex flex-col glass-panel border-r border-white/40 z-20 transition-all duration-300"
  >
    <!-- Logo -->
    <div class="p-6 flex flex-col items-center text-center gap-2">
      <img
        src="/src/assets/Gemini_Generated_Image_f4qddcf4qddcf4qd.png"
        class="size-54 rounded-full shadow-sm"
        alt="UP Logo"
      />

      <div class="hidden lg:block leading-tight">
        <div class="font-bold text-[18px] text-purple-800">UP</div>
        <div class="font-bold text-[18px] text-slate-800">ระบบใบนำส่งเงิน</div>
      </div>
    </div>

    <!-- Menu -->
    <nav class="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
      <RouterLink
        v-for="item in filteredMenuItems"
        :key="item.id"
        :to="{ name: item.routeName }"
        class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group"
        active-class="bg-white/60 shadow-sm text-blue-600 font-semibold"
        exact-active-class="bg-white/60 shadow-sm text-blue-600 font-semibold"
      >
        <i :class="item.icon" class="text-xl"></i>
        <span class="hidden lg:block">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- User Profile -->
    <div class="p-4 border-t border-white/30">
      <div class="flex items-center gap-3 bg-white/30 p-2 rounded-xl backdrop-blur-sm">
        <img
          :src="avatarUrl"
          class="w-9 h-9 rounded-full shadow-sm"
        />
        <div class="hidden lg:block">
          <p class="text-sm font-semibold text-slate-800">
            {{ auth.user?.fullName ?? 'ผู้ใช้งาน' }}
          </p>
          <p class="text-xs text-slate-500">
            {{ auth.user?.affiliation ?? '-' }} • {{ auth.user?.role ?? '-' }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore, type roleType } from '@/stores/auth'

const auth = useAuthStore()

type MenuItem = {
  id: string
  label: string
  icon: string
  routeName: string

  /**
   * ✅ ถ้าไม่ใส่ roles = ทุก role เห็นได้
   * ✅ ถ้าใส่ roles = เห็นเฉพาะ role ที่กำหนด
   */
  roles?: roleType[]

  /**
   * ✅ (optional) ถ้าคุณทำ auth.can() แล้วค่อยเปิดใช้ได้
   * permissions?: Array<'view'|'edit'|'delete'|...>
   */
  // permissions?: string[]
}

const menuItems: MenuItem[] = [
  {
    id: 'main',
    label: 'ใบนำส่งเงิน',
    icon: 'ph ph-files',
    routeName: 'main',
    roles: ['user', 'treasury', 'admin', 'superadmin'], // ทุกคนเห็น
  },
  {
    id: 'indexsavedebtor',
    label: 'ล้างลูกหนี้',
    icon: 'ph ph-files',
    routeName: 'indexsavedebtor',
    roles: ['user', 'treasury', 'admin', 'superadmin'], // ทุกคนเห็น
  },
  {
    id: 'Report_submit',
    label: 'รายงานสรุป',
    icon: 'ph ph-chart-bar',
    routeName: 'Report_submit',
    roles: ['user', 'treasury', 'admin', 'superadmin'], // ทุกคนเห็น
  },
  {
    id: 'daily_closing',
    label: 'สรุปยอดรายวัน',
    icon: 'ph ph-files',
    routeName: 'daily_closing',
    roles: ['user', 'treasury', 'admin', 'superadmin'], // ทุกคนเห็น
  },
]

const filteredMenuItems = computed(() => {
  // ยังไม่ login → จะให้แสดงอะไรบ้างแล้วแต่คุณ
  if (!auth.user) return []

  const role = auth.user.role

  return menuItems.filter((item) => {
    // ถ้าไม่กำหนด roles = แสดงได้ทุกคน
    if (!item.roles || item.roles.length === 0) return true
    return item.roles.includes(role)
  })
})

const avatarUrl = computed(() => {
  const name = encodeURIComponent(auth.user?.fullName || 'User')
  // UI Avatars (ปลอดภัยสำหรับ demo)
  return `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff`
})
</script>
