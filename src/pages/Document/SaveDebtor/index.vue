<template>
  <div>
    <Navbar />
    <SecondNavbar />

    <!-- Main container -->
    <div class="max-w-5xl mx-auto p-6 pt-5">
      <!-- 🔲 กล่องใหญ่ครอบทุกอย่าง -->
      <div class="bg-white border border-gray-300 rounded-xl shadow-sm p-10 space-y-9">
        <h1 class="text-center text-3xl">บันทึกลูกหนี้</h1>
        <div class="max-w-4xl mx-auto p-6 pt-8 mt-10">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-4">
            <div class="flex flex-col gap-1.5">
              <span>ข้าพเจ้า *</span>
              <InputText v-model="formData.name" /><span
                v-if="errors.name"
                class="text-red-600 text-xs -mt-2 -mb-6"
                >{{ errors.name }}</span
              >
            </div>

            <div class="flex flex-col gap-1.5">
              <span>เบอร์โทรติดต่อ *</span>
              <InputText v-model="formData.phone" /><span
                v-if="errors.phone"
                class="text-red-600 text-xs -mt-2 -mb-6"
                >{{ errors.phone }}</span
              >
            </div>

            <div class="flex flex-col gap-1.5">
              <span>สังกัด *</span>
              <Selects
                type="text"
                v-model="formData.department"
                :options="['กองทุนที่ 1', 'กองทุนที่ 2', 'กองทุนที่ 3', 'กองทุนที่ 4']"
                placeholder=""
                value-type="string"
              /><span v-if="errors.department" class="text-red-600 text-xs -mb-6">{{errors.department}}</span>
            </div>

            <div class="flex flex-col gap-1.5">
              <span>จำนวนเงิน *</span>
              <InputText v-model="formData.fund" /><span
                v-if="errors.fund"
                class="text-red-600 text-xs -mt-2 -mb-[14px]"
                >{{ errors.fund }}</span
              >
            </div>
          </div>

          <!-- ==========================
             2) ฟอร์มล้างลูกหนี้
        ============================ -->
          <div class="space-y-4 mt-5">
            <span class="font-medium text-lg ">ล้างลูกหนี้</span>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
<div class="grid grid-cols-1 gap-1 justify-items-center">
  <InputText v-model="formData.moneyType" placeholder="เพิ่มรายการ" />
  <span v-if="errors.moneyType" class="text-red-600 text-xs ">
    {{ errors.moneyType }}
  </span>
</div>

<div class="grid grid-cols-1 gap-1 justify-items-center">
  <InputText v-model="formData.projectCode" placeholder="เลขที่เอกสารอ้างอิง" />
  <span v-if="errors.projectCode" class="text-red-600 text-xs">
    {{ errors.projectCode }}
  </span>
</div>

<div class="grid grid-cols-1 gap-1 justify-items-center">
  <InputText v-model="formData.amount" placeholder="จำนวนเงิน" />
  <span v-if="errors.amount" class="text-red-600 text-xs">
    {{ errors.amount }}
  </span>
</div>

<div class="grid grid-cols-1 gap-1 justify-items-center">
  <InputText v-model="formData.note" placeholder="หมายเหตุ" />
  <span v-if="errors.note" class="text-red-600 text-xs justify-center">
    {{ errors.note }}
  </span>
</div>
            </div>
          </div>

          <!-- ==========================
             3) checkbox ต่าง ๆ
        ============================ -->
          <div>
            <div class="mt-10">
            <div>
              <input type="checkbox" v-model="check3" class="mt-3" />
              นำฝากเข้าธนาคาร
            </div>
          </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              class="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400"
              @click="saveData"
            >
              บันทึก
            </button>
            <button
              class="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700"
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
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import Selects from '@/components/input/select.vue'
import router from '@/router'
import InputText from '@/components/input/inputtext.vue'
import { ref } from 'vue'
const gotomainpage = () => {
  router.push('/')
}

const formData = ref({
  name: '',
  phone: '',
  department: '',
  fund: '',
  moneyType: '',
  projectCode: '',
  amount: '',
  note: '',
})


const check3 = ref(false)

const errors = ref({})

const saveData = () => {
  errors.value = {} // reset

  // เช็คทีละฟิลด์
  if (!formData.value.name) {
    errors.value.name = 'กรุณากรอก "ข้าพเจ้า"'
    return
  }
  if (!formData.value.phone) {
    errors.value.phone = 'กรุณากรอก "เบอร์โทรติดต่อ"'
    return
  }
  if (!formData.value.department) {
    errors.value.department = 'กรุณาเลือก "สังกัด"'
    return
  }
  if (!formData.value.fund) {
    errors.value.fund = 'กรุณากรอก "จำนวนเงิน"'
    return
  }
  if (!formData.value.moneyType) {
    errors.value.moneyType = 'กรุณาเลือกรายการ'
    return
  }
  if (!formData.value.projectCode) {
    errors.value.projectCode = 'กรุณากรอก "เลขที่เอกสารอ้างอิง"'
    return
  }
  if (!formData.value.amount) {
    errors.value.amount = 'กรุณากรอก "จำนวนเงิน"'
    return
  }
  if (!formData.value.note) {
    errors.value.note = 'กรุณากรอก "หมายเหตุ"'
    return
  }

  // ถ้าไม่มี error ถึงจะบันทึก
  const dataToSave = {
    formData: formData.value,
  }

  console.log('=== ข้อมูลที่บันทึก ===')
  console.log(JSON.stringify(dataToSave, null, 2))

  alert('บันทึกข้อมูลสำเร็จ! ดูข้อมูลใน Console')
}
</script>
