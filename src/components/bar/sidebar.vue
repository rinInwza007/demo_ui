<!-- src/components/layout/Sidebar.vue -->
<template>
  <aside
    class="w-20 lg:w-64 h-full flex flex-col glass-panel border-r border-white/40 z-20 transition-all duration-300"
  >
    <!-- Logo -->
    <div class="p-6 flex flex-col items-center text-center gap-2">
  <!-- Logo center -->
  <img
    src="/src/assets/Gemini_Generated_Image_f4qddcf4qddcf4qd.png"
    class="size-54 rounded-full shadow-sm"
    alt="UP Logo"
  />

  <!-- Text under logo -->
  <div class="hidden lg:block leading-tight">
    <div class="font-bold text-[18px] text-purple-800">UP</div>
    <div class="font-bold text-[18px] text-slate-800">ระบบใบนำส่งเงิน</div>
  </div>
</div>


    <!-- Menu -->
    <nav class="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
      <RouterLink
        v-for="item in menuItems"
        :key="item.id"
        :to="{ name: item.routeName }"
        class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group"
        active-class="bg-white/60 shadow-sm text-blue-600 font-semibold"
        exact-active-class="bg-white/60 shadow-sm text-blue-600 font-semibold"
      >
        <i :class="item.icon" class="text-xl"></i>
        <span class="hidden lg:block">{{ item.label }}</span>

        <!-- dot ขวา -->

      </RouterLink>
    </nav>

    <!-- User Profile -->
    <div class="p-4 border-t border-white/30">
      <div
        class="flex items-center gap-3 bg-white/30 p-2 rounded-xl backdrop-blur-sm"
      >
        <img
          src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff"
          class="w-9 h-9 rounded-full shadow-sm"
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
const menuItems = [
  {
    id: 'main',
    label: 'ใบนำส่งเงิน',
    icon: 'ph ph-files',
    routeName: 'main',
  },
  {
    id: 'indexwaybilldebtor',
    label: 'ใบนำส่งลูกหนี้',
    icon: 'ph ph-files',
    routeName: 'indexwaybilldebtor',
  },
  {
    id: 'indexsavedebtor',
    label: 'ล้างลูกหนี้',
    icon: 'ph ph-files',
    routeName: 'indexsavedebtor',
  },
  {
    id: 'Report_submit',
    label: 'รายงานสรุป',
    icon: 'ph ph-chart-bar',
    routeName: 'Report_submit',
  },
]
</script>
