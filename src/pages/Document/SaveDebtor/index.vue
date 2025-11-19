<template>
  <div >
    <Navbar/>
    <SecondNavbar />

    <!-- Main container -->
    <div class="max-w-5xl mx-auto p-6 pt-5 ">

      <!-- 🔲 กล่องใหญ่ครอบทุกอย่าง -->
      <div class="bg-white border border-gray-300 rounded-xl shadow-sm p-10 space-y-9">


    <h1 class="text-center text-3xl ">
      บันทึกลูกหนี้
    </h1>
    <div class="max-w-4xl mx-auto p-6 pt-8 mt-10">

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-4 ">
          <div class="flex flex-col gap-1.5">
            <span>ข้าพเจ้า</span>
            <InputText type="text" />
          </div>

          <div class="flex flex-col gap-1.5">
            <span>เบอร์โทรติดต่อ</span>
            <InputText type="text" />
          </div>

          <div class="flex flex-col gap-1.5">
            <span>สังกัด</span>
            <Selects
              v-model="category"
              :options="['กองทุนที่ 1','กองทุนที่ 2','กองทุนที่ 3','กองทุนที่ 4']"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <span>จำนวนเงิน</span>
            <InputText />
          </div>
        </div>


        <!-- ==========================
             2) ฟอร์มล้างลูกหนี้
        ============================ -->
        <div class="space-y-4">
          <span class="font-medium text-lg">ล้างลูกหนี้</span>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Selects
              v-model="debts"
              :options="['กองทุนที่ 1','กองทุนที่ 2','กองทุนที่ 3','กองทุนที่ 4']"
              placeholder="เพิ่มรายการ"
            />
            <InputText placeholder="เลขที่เอกสารอ้างอิง" />
            <InputText placeholder="จำนวนเงิน" />
            <InputText placeholder="หมายเหตุ" />
          </div>
        </div>


        <!-- ==========================
             3) checkbox ต่าง ๆ
        ============================ -->
        <div class="space-y-4">
          <div>
            <input type="checkbox" v-model="check3">
            นำฝากเข้าธนาคาร
          </div>
          <div v-if="check3" class="text-gray-600">ติ๊กถูกแล้วครับ ลูกอี่ต้อม!</div>
        </div>


        <!-- ==========================
             4) ปุ่มอยู่ในกรอบเดียวกัน
        ============================ -->
        <div class="flex justify-end gap-3 pt-4">
          <button class="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-green-500">
            บันทึก
          </button>
          <button
            class="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-red-700"
            @click="gotomainpage"
          >
            กลับ
          </button>
        </div>
       </div>
      </div>

    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import Selects from '@/components/input/select.vue'
import InputText from '@/components/input/inputtext.vue'
import router from '@/router'

const category = ref('')
const debts = ref('')
const check3 = ref(false)

const gotomainpage = () => router.push('/')
</script>
