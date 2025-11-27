<template>
  <div >
    <Navbar/>
    <SecondNavbar />
<div class="border border-gray-300 rounded-xl shadow  m-6 bg-white">
    <div class="ml-12 mt-8 grid grid-cols-3 items-center">
  <!-- ซ้าย -->
  <div class="flex">
    <dropdrowwork />
  </div>

  <!-- กลาง -->
  <h1 class="text-4xl font-extrabold text-gray-900 mb-6 text-center">
    บันทึกลูกหนี้
  </h1>

  <!-- ขวา (ปล่อยว่างเพื่อ balance) -->
  <div></div>
</div>

    <div class="flex flex-col gap-4 px-12 w-full md:flex-row md:items-end mt-12">

  <!-- วันที่ -->
  <div>
    <selectdatetime />
  </div>

  <!-- หน่วยงาน -->
  <div>
    <Select
      v-model="category"
      :options="['กองแผน','กองคลัง','โรงพยาบาลมอพะเยา']"
      placeholder="หน่วยงาน"
    />
  </div>

  <!-- ช่องค้นหา -->
  <div>
    <search />
  </div>

  <!-- ปุ่มต่างๆ = ชิดขวาสุดด้วย ml-auto  -->
  <div class="ml-auto">
  <dropdrow>
    <template #icon>
      <i class="material-symbols-outlined text-[22px] leading-none ">
      </i>
    </template>
    <template #menu>
      <div
        v-for="btn in actions"
        :key="btn.key"
        class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
        @click="btn.handler"
      >
        <i class="material-symbols-outlined text-[20px] leading-none">
          {{ btn.icon }}
        </i>
        <span class="text-sm">{{ btn.label }}</span>
      </div>
    </template>
  </dropdrow>
</div>


</div>

        <div class="pt-10 px-6 mt-1">
          <list />
          </div>
          <div class="flex items-center justify-between mt-6 ml-5">
          <nextpage />

            <div>
              <goback />
</div>
          </div>

  </div>
  </div>


</template>

<script setup>

import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import Select from '@/components/input/select.vue'
import search from '@/components/input/search.vue'
import list from '@/components/list/listbase.vue'
import nextpage from '@/components/list/nextpage.vue'
import selectdatetime from '@/components/DateTime/selectdatetime.vue'
import goback from '@/components/Button/goback.vue'
import dropdrow from '@/components/dropdrow/dropdrow.vue'
import dropdrowwork from '@/components/dropdrow/dropdrowwork.vue'

// ฟังก์ชันสำหรับปุ่ม "ใบนำส่ง"




</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Sarabun:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap');

body, * {
  font-family: 'Sarabun', 'sans-serif';
}
</style>



