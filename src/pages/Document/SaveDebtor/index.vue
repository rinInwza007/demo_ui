<template>
  <div >
    <!-- Navbar / second navbar -->
    <Navbar class="fixed top-0 left-0 w-full z-50" />
    <SecondNavbar class="fixed top-16 left-0 w-full z-40" />

    <!-- container หลัก -->
    <div class="max-w-4xl mx-auto p-6 pt-8 mt-20">


      <section class="mt-8">
       <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

  <div class="flex flex-col gap-1.5">
    <span>ข้าพเจ้า</span>
    <input class="border border-gray-500 rounded shadow-md shadow-gray-500 " type="text" />
  </div>

  <div class="flex flex-col gap-1.5">
    <span>เบอร์โทรติดต่อ</span>
    <input class="border border-gray-500 rounded shadow-md shadow-gray-500" type="phone" />
  </div>

  <div class="flex flex-col gap-1.5">
    <span>สังกัด</span>
      <Selects
              class="border border-gray-500 rounded-md  shadow-md shadow-gray-500"
              type="text"
              v-model="category"
              :options="['กองทุนที่ 1', 'กองทุนที่ 2', 'กองทุนที่ 3', 'กองทุนที่ 4']"
              placeholder=""
              value-type="string"
            />
  </div>

  <div class="flex flex-col gap-1.5">
    <span>จำนวนเงิน</span>
    <input class="border border-gray-500 rounded shadow-md shadow-gray-500" type="number" placeholder="xxxxx" />
  </div>

</div>

        <div class="gap-2 flex flex-col " >
          <span class="mt-5" >ล้างลูกหนี้</span>
       <div class="grid grid-cols-2 lg:grid-cols-4   gap-4 ">
   <Selects
              class="border border-gray-500 rounded-md  shadow-md shadow-gray-500 "
              type="text"
              v-model="category"
              :options="['กองทุนที่ 1', 'กองทุนที่ 2', 'กองทุนที่ 3', 'กองทุนที่ 4']"
              placeholder="เพิ่มรายการ"
              value-type="string"
            />
  <input type="text" placeholder="เลขที่เอกสารอ้างอิง" class="border border-gray-500 rounded shadow-md shadow-gray-500" />
  <input type="text" placeholder="จำนวนเงิน" class="border border-gray-500 rounded shadow-md shadow-gray-500" />
  <input type="text" placeholder="หมายเหตุ" class="border border-gray-500 rounded shadow-md shadow-gray-500" />


        </div>
         </div>
      </section>
 <div>
    <div class="mt-10">
      <input  type="checkbox" v-model="isChecked">
      นำฝากเข้าธนาคาร
    </div>
    <div v-if="isChecked">
      Description
    </div>
  </div>
   <div>
    <div>
      <input type="checkbox" v-model="isChecked" class="mt-3">
      นำฝากเข้าธนาคาร
    </div>
    <div v-if="isChecked">
      Description
    </div>
  </div>
   <div>
    <div>
      <input type="checkbox" v-model="isChecked" class="mt-3">
      นำฝากเข้าธนาคาร
    </div>
    <div v-if="isChecked">
      Description
    </div>
  </div>
      <!-- action buttons -->
      <div class="mt-6 flex justify-end gap-3">
        <button class="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-green-300">
          บันทึกข้อมูล
        </button>
        <button class="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-red-300" @click="gotomainpage()">กลับ</button>
      </div>
    </div>

  </div>

</template>

<script setup>

import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import Selects from '@/components/input/select.vue'
import router from '@/router'


const gotomainpage = ()=> {
  router.push ('/')
}



</script>

<style scoped></style>
