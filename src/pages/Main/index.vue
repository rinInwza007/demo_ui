<template>
  <div >
    <Navbar/>
    <SecondNavbar />
<div class="border border-gray-200 rounded-xl shadow  m-6">
    <div class="ml-12 mt-8 flex">
  <main>
    <h1 class="text-4xl font-extrabold text-gray-900 mb-6 mx-auto text-left">
      ใบนำส่งเงิน
    </h1>
  </main>
</div>

    <div class="flex flex-col gap-4 px-12 w-full md:flex-row md:items-end">
  <!-- กลุ่มซ้าย: วันที่และหน่วยงาน -->

    <!-- กล่องวันที่ (ซ้าย + ขวา) -->
    <div class="flex">
      <selectdatetime />
      <span class="text-gray-500">-</span>
      <selectdatetime />
    </div>

    <!-- หน่วยงาน -->
    <div >
      <Select
        v-model="category"
        :options="['กองแผน','กองคลัง','โรงพยาบาลมอพะเยา']"
        placeholder="หน่วยงาน"
      />
    </div>

  <!-- ช่องค้นหา -->
  <div >
    <search />
  </div>


  <!-- ปุ่มต่างๆ -->
  <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
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

            <div class="mt-6 flex justify-end mb-4">
        <button class="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-red-500 mr-10">กลับ</button>
      </div>
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
import selectdatetime from '@/components/DateTime/selectdatetime.vue'

const router = useRouter()

// ฟังก์ชันสำหรับปุ่ม "ใบนำส่ง"
const goTowaybill = () => {
  router.push('/waybill')
}

const goTowaybilldebtor = () =>{
  router.push('/waybilldebtor')
}



const actions = [
  { key: 'export', label: 'export', icon:"🖫", handler: () => {} },
  { key: 'main', label: 'ใบนำส่ง', icon:"🞢", handler: goTowaybill },
  { key: 'research', label: 'ใบนำส่งวิจัย', icon:"🞢", handler: () => {} },
  { key: 'debtor', label: 'ใบนำส่งลูกหนี้', icon:"🞢", handler: goTowaybilldebtor},
]
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Sarabun:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap');

body, * {
  font-family: 'Sarabun', 'sans-serif';
}
</style>
