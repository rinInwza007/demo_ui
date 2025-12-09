<template>
  <Menu as="div" class="relative inline-block text-left">
    <!-- ปุ่มหลัก -->
    <MenuButton
  class="px-6 h-[44px] bg-blue-600/50 text-white rounded-lg flex items-center gap-2
         transition-all duration-300 ease-out
         hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-blue-600/90
         hover:after:content-[''] hover:after:absolute
         relative
         after:absolute after:left-1/2 after:-translate-x-1/2
         after:bottom-[-6px]
         after:w-[12px] after:h-[6px]
         after:bg-blue-600 after:rounded-b-full
         after:opacity-0 hover:after:opacity-60"
>
  เพิ่มใบนำส่งเงิน
  <span class="material-symbols-outlined">expand_more</span>
</MenuButton>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <MenuItems
        class="absolute mt-2 w-56 right-0 bg-white shadow-lg rounded-lg border z-50 "
      >
        <!-- loop actions[] -->
        <MenuItem
          v-for="act in actions"
          :key="act.key"
          v-slot="{ active }"
        >
          <button
            @click="act.handler()"
            class="menu-item flex items-center dropdown-item w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center gap-2 "
            :class="{ 'bg-gray-100': active }"
          >
            <span class="material-symbols-outlined text-[18px]">
              {{ act.icon }}
            </span>
            <span>{{ act.label }}</span>
          </button>
        </MenuItem>
      </MenuItems>
    </Transition>
  </Menu>
</template>
<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { useRouter } from "vue-router";

const router = useRouter();

const goTowaybill = () => router.push("/waybill");
const goTowaybillResearch = () => router.push("/waybillresearch");
const goTowaybilldebtor = () => router.push("/waybilldebtor");


const actions = [
  { key: "export", label: "Export", icon: "file_export", handler: () => {} },
  { key: "main", label: "ใบนำส่ง", icon: "add", handler: goTowaybill },
  { key: "main", label: "ใบนำลูกหนี้", icon: "add", handler: goTowaybilldebtor },
  { key: "research", label: "ใบนำส่งวิจัย", icon: "add", handler: goTowaybillResearch },

];
</script>
