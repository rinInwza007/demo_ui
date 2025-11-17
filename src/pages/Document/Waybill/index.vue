<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#ffffff]">
    <!-- Navbar / second navbar -->
    <Navbar class="fixed top-0 left-0 w-full z-50" />
    <SecondNavbar class="fixed top-16 left-0 w-full z-40" />

    <section class="mt-40 mx-20">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
        <div>
          <div class="flex flex-col gap-1.5">
            <span>ข้าพเจ้า *</span>
            <InputText
              type="text"
            />
          </div>
        </div>
        <div>
          <div class="flex flex-col gap-1.5 w-8/12" >
            <span>เบอร์โทรติดต่อ *</span>
            <InputText
              type="text"
            />
          </div>
        </div>
        <div>
          <div class="flex flex-col gap-1.5">
            <span>สังกัด *</span>
            <div class="flex flex-col gap-0.5">
              <InputText
                type="text"
              />
            </div>
          </div>
        </div>
        <div>
          <div class="flex flex-col gap-1.5 w-8/12">
            <span>กองทุน *</span>
            <Selects
              type="text"
              v-model="category"
              :options="['กองทุนที่ 1', 'กองทุนที่ 2', 'กองทุนที่ 3', 'กองทุนที่ 4']"
              placeholder="เลือกหมวดหมู่"
              value-type="string"
            />
          </div>
        </div>
        <div>
          <div class="flex flex-col gap-1.5">
            <span>ขอนำส่งเงิน *</span>
            <InputText
              type="text"
              placeholder="รายได้/เงินโครงการ "
            />
          </div>
        </div>
        <div>
          <div class="flex flex-col gap-1.5 w-8/12">
            <span>รหัสโครงงาน *</span>
            <InputText
              type="text"
              placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ"
            />
          </div>
        </div>
      </div>

      <div class="gap-2 flex flex-col mt-5">
        <div>นำส่งเงิน</div>

        <div class="flex flex-col gap-2">
          <div
            v-for="(row, index) in morelist"
            :key="index"
            class="grid grid-cols-1 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 h-9"
          >
            <InputText
              v-model="row.item"
              type="text"
              placeholder="ชื่อรายการ"
            />
              <InputText
              v-model="row.ref"
              type="text"
              placeholder="เลขที่เอกสารอ้างอิง"
              />
              <InputText
              v-model="row.amount"
              type="number"
              placeholder="จำนวนเงิน"
              />
              <InputText
              v-model="row.note"
              type="text"
              />
              <InputText
              v-model="row.type"
              type="text"
              placeholder="ภายใน,ภายนอก"
              class="placeholder"
            />
          </div>
        </div>
      </div>

      <div>
        <div>
          <button
            class="mt-3 text-gray-500"
            @click="
              morelist.push({
                item: '',
                ref: '',
                amount: '',
                note: '',
                type: '',
              })
            "
          >
            [+] เพิ่มรายการ
          </button>
        </div>
      </div>

      <div class="mt-5">
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-2 items-start">
          <div>นำส่งเป็น * checkbox</div>
          <div>
            <div>จำนวนเงินรวม</div>
            <input class="mt-2 bg-gray-300 border border-gray-500 px-5 rounded-md shadow-md shadow-gray-500" type="number" placeholder="xx,xxx" />
          </div>
        </div>
      </div>

      <div class="mt-5">
        <div>กรุณากรอกช่อง*ทุกช่อง
        </div>
      </div>

    </section>

    <div class="mt-6 flex justify-end gap-3 mx-20">
      <button class="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-green-300">
        บันทึก
      </button>
      <button class="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-red-300" @click="gotomainpage()">กลับ</button>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import Selects from '@/components/input/select.vue'
import router from '@/router'
import InputText from '@/components/input/inputtext.vue'
import { ref } from 'vue'

const morelist = ref([
  {
    item: '',
    ref: '',
    amount: '',
    note: '',
    type: '',
  },
])

const gotomainpage = ()=> {
  router.push ('/')
}

</script>

<style scoped></style>
