<template>
  <div>
    <Navbar class="fixed top-0 left-0 w-full z-50" />
    <SecondNavbar class="fixed top-16 left-0 w-full z-40" />


     <main class="pt-32 px-6 mt-10">
      <h1 class="text-4xl font-extrabold text-gray-900 mb-6 mx-auto text-left ">
        ใบนำส่งเงิน
      </h1>
    </main>
    <div
  class="
    flex flex-col gap-4
    md:flex-row md:items-end md:gap-6
    md:justify-between
  "
>
  <!-- กล่อง Select 1 -->

  <div class="w-full md:w-56">
    <Select
      v-model="category"
      :options="['11/11/2025-12/12/2025','11/11/2025-12/12/2025','11/11/2025-12/12/2025','11/11/2025-12/12/2025']"
      placeholder="11/11/2025-12/12/2025"
      value-type="time"
    />
  </div>

  <!-- กล่อง Select 2 -->
  <div class="w-full md:w-56">
    <Select
      v-model="category"
      :options="['กองแผน','กองคลัง','โรงพยาบาลมอพะเยา']"
      placeholder="หน่วยงาน"
      value-type="string"
    />
  </div>


  <!-- Search box -->
  <div class="w-full md:flex-1">
    <search />
  </div>

  <!-- ปุ่มต่างๆ -->
  <div
    class="
      grid grid-cols-2 gap-3
      md:grid-cols-4 md:gap-4
    "
  >
    <phillbutton
      v-for="btn in actions"
      :key="btn.key"
      @click="btn.handler"
      grow
    >
      <template #icon>{{ btn.icon }}</template>
      {{ btn.label }}
    </phillbutton>
  </div>
</div>


        <div class="pt-10 px-6 mt-1">
          <list />
          </div>
          <div class="flex items-center justify-between mt-6">
          <nextpage />

            <div class="mt-6 flex justify-end gap-3">
        <button class="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-red-300">กลับ</button>
      </div>

          </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import Select from '@/components/input/select.vue'
import search from '@/components/input/search.vue'
import phillbutton from '@/components/input/PillButton.vue'
import list from '@/components/list/list.vue'
import nextpage from '@/components/list/nextpage.vue'

const router = useRouter()

// ฟังก์ชันสำหรับปุ่ม "ใบนำส่ง"
const goTowaybill = () => {
  router.push('/waybill')
}

const goTowaybilldebtor = () =>{
  router.push('/waybilldebtor')
}



const actions = [
  { key: 'export', label: 'export', icon:"★", handler: () => {} },
  { key: 'main', label: 'ใบนำส่ง', icon:"+ ", handler: goTowaybill },
  { key: 'research', label: 'ใบนำส่งวิจัย', icon:"+ ", handler: () => {} },
  { key: 'debtor', label: 'ใบนำส่งลูกหนี้', icon:"+ ", handler: goTowaybilldebtor},
]
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

body, * {
  font-family: 'Kanit', sans-serif;
}
</style>



