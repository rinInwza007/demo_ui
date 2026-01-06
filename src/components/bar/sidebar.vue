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

    <!-- User Profile + Dropdown -->
    <div class="p-4 border-t border-white/30 relative" ref="profileAreaRef">
      <!-- Profile Row (click to toggle) -->
      <button
        type="button"
        @click="toggleMenu"
        class="w-full flex items-center gap-3 bg-white/30 p-2 rounded-xl backdrop-blur-sm hover:bg-white/40 transition relative"
      >
        <img :src="avatarUrl" class="w-9 h-9 rounded-full shadow-sm" />

        <div class="hidden lg:block text-left flex-1">
          <p class="text-sm font-semibold text-slate-800">
            {{ auth.user?.fullName ?? 'ผู้ใช้งาน' }}
          </p>
          <p class="text-xs text-slate-500">
            {{ auth.user?.affiliation ?? '-' }} • {{ auth.user?.role ?? '-' }}
          </p>
        </div>

        <!-- caret -->
        <i
          class="ph ph-caret-up-down hidden lg:block text-slate-500 transition-transform"
          :class="isOpen ? 'rotate-180' : ''"
        ></i>
      </button>

      <!-- Dropdown -->
      <transition name="fade-slide">
        <div
          v-if="isOpen"
          class="absolute left-4 right-4 bottom-[84px] hidden lg:block"
        >
          <div class="glass-panel rounded-xl overflow-hidden shadow-lg border border-white/40">
            <button
              type="button"
              @click="handleLogout"
              class="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-white/50 transition"
            >
              <i class="ph ph-sign-out text-lg text-rose-500"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </transition>

      <!-- Mobile (sidebar collapsed): show only icon dropdown -->
      <transition name="fade-slide">
        <div
          v-if="isOpen"
          class="absolute left-3 bottom-[84px] lg:hidden"
        >
          <div class="glass-panel rounded-xl overflow-hidden shadow-lg border border-white/40 w-44">
            <button
              type="button"
              @click="handleLogout"
              class="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-white/50 transition"
            >
              <i class="ph ph-sign-out text-lg text-rose-500"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, type roleType } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

type MenuItem = {
  id: string
  label: string
  icon: string
  routeName: string
  roles?: roleType[]
}

const menuItems: MenuItem[] = [
  { id: 'main', label: 'ใบนำส่งเงิน', icon: 'ph ph-files', routeName: 'main', roles: ['user','treasury','admin','superadmin'] },
  { id: 'indexsavedebtor', label: 'ล้างลูกหนี้', icon: 'ph ph-files', routeName: 'indexsavedebtor', roles: ['user','admin','superadmin'] },
  { id: 'Report_submit', label: 'รายงานสรุป', icon: 'ph ph-chart-bar', routeName: 'Report_submit', roles: ['treasury','admin','superadmin'] },
  { id: 'daily_closing', label: 'สรุปยอดรายวัน', icon: 'ph ph-files', routeName: 'daily_closing', roles: ['treasury','admin','superadmin'] },
]

const filteredMenuItems = computed(() => {
  if (!auth.user) return []
  const role = auth.user.role
  return menuItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true
    return item.roles.includes(role)
  })
})

const avatarUrl = computed(() => {
  const name = encodeURIComponent(auth.user?.fullName || 'User')
  return `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff`
})

/** Dropdown state */
const isOpen = ref(false)
const profileAreaRef = ref<HTMLElement | null>(null)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

const onClickOutside = (e: MouseEvent) => {
  const el = profileAreaRef.value
  if (!el) return
  const target = e.target as Node
  if (!el.contains(target)) closeMenu()
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})

const handleLogout = async () => {
  closeMenu()

  // ถ้ามี auth.logout() ใช้ได้เลย
  if (typeof (auth as any).logout === 'function') {
    await (auth as any).logout()
  } else {
    // fallback เผื่อยังไม่ทำ logout ใน store
    ;(auth as any).token = ''
    ;(auth as any).user = null
  }

  router.push({ name: 'testlogin' })
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.18s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
