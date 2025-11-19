<template>
  <div
    class="trezo-card bg-white p-[20px] md:p-[25px] rounded-md"
  >
    <div class="trezo-card-content">
      <ul
        class="navs mb-[20px] border-b border-gray-200 grid grid-cols-4 ml-16"
      >
        <!-- เพิ่มใบนำส่งใหม่ -->
        <li>
          <RouterLink
            to="/waybill"
            :class="tabClass(isStatus1)"
          >
            เพิ่มใบนำส่งใหม่
          </RouterLink>
        </li>

        <!-- ใบนำส่งที่อยู่ในขั้นตอนดำเนินงาน -->
        <li>
          <RouterLink
            to="/"
            :class="tabClass(isStatus2)"
          >
            ใบนำส่งที่อยู่ในขั้นตอนดำเนินงาน
          </RouterLink>
        </li>

        <!-- รายการผลการนำส่ง -->
        <li>
          <RouterLink
            to="/resultsubmit"
            :class="tabClass(isStatus3)"
          >
            รายการผลการนำส่ง
          </RouterLink>
        </li>

        <!-- บันทึกลูกหนี้ -->
        <li>
          <RouterLink
            to="/savedebtor"
            :class="tabClass(isStatus4)"
          >
            บันทึกลูกหนี้
          </RouterLink>
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
    ? 'tab-link border-b-2 border-blue-600 text-blue-600 '
    : 'tab-link text-gray-600'
}
</script>

<style scoped>


:deep(.router-link-exact-active.tab-link) {
  @apply text-blue-600 border-blue-600;
}
</style>
