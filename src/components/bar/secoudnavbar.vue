<template>
  <div class="trezo-card bg-gray p-[20px] md:p-[25px]">
    <div class="trezo-card-content">
      <ul class="mb-[20px] border-b border-purple-500 grid grid-cols-4 text-center">

        <!-- ตัวอย่าง tab -->
        <li class="relative group">
          <RouterLink
            to="/waybill"
            :class="tabClass(isStatus1)"
            class="flex items-center justify-center h-[48px] px-4"
          >
            <span class="md:hidden">เพิ่มใบนำส่งใหม่</span>
            <span class="hidden md:inline">เพิ่มใบนำส่งใหม่</span>
          </RouterLink>

          <!-- เส้นใต้ hover -->
          <span
            class="absolute bottom-0 left-0 h-[3px] bg-purple-500 w-0 group-hover:w-full transition-all duration-300"
          ></span>
        </li>

        <!-- ช่องอื่น copy เหมือนกัน -->
        <li class="relative group">
          <RouterLink
            to="/"
            :class="tabClass(isStatus2)"
            class="flex items-center justify-center h-[48px] px-4"
          >
            <span class="md:hidden">ดำเนินงาน</span>
            <span class="hidden md:inline">ใบนำส่งที่อยู่ในขั้นตอนดำเนินงาน</span>
          </RouterLink>
          <span class="absolute bottom-0 left-0 h-[3px] bg-purple-500 w-0 group-hover:w-full transition-all duration-300"></span>
        </li>

        <li class="relative group">
          <RouterLink
            to="/Report_submit"
            :class="tabClass(isStatus3)"
            class="flex items-center justify-center h-[48px] px-4"
          >
            <span class="md:hidden">ผลการนำส่ง</span>
            <span class="hidden md:inline">รายการผลการนำส่ง</span>
          </RouterLink>
          <span class="absolute bottom-0 left-0 h-[3px] bg-purple-500 w-0 group-hover:w-full transition-all duration-300"></span>
        </li>

        <li class="relative group">
          <RouterLink
            to="/savedebtor"
            :class="tabClass(isStatus4)"
            class="flex items-center justify-center h-[48px] px-4"
          >
            <span class="md:hidden">บันทึกลูกหนี้</span>
            <span class="hidden md:inline">บันทึกลูกหนี้</span>
          </RouterLink>
          <span class="absolute bottom-0 left-0 h-[3px] bg-purple-500 w-0 group-hover:w-full transition-all duration-300"></span>
        </li>

      </ul>
    </div>
  </div>
</template>



<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// ✔ กลุ่มหน้าในสถานะ "เพิ่มใบนำส่งใหม่"
const status1Names = ['waybill', 'waybilldebtor', 'waybillresearch']

// ✔ ตรวจ Active แต่ละสถานะ
const isStatus1 = computed(() => status1Names.includes(route.name))

const isStatus2 = computed(() => route.name === 'mmain')

const isStatus3 = computed(() => route.name === 'resultsubmit')

const isStatus4 = computed(() => route.name === 'savedebtor')

// ✔ ฟังก์ชันกำหนด class ตาม active
const tabClass = (active) => {
  return active
    ? 'text-purple-600 font-semibold border-b-2 border-purple-600'
    : 'text-gray-600'
}
</script>

<style scoped>


:deep(.router-link-exact-active.tab-link) {
  @apply text-purple-600 border-purple-600;
}
</style>
