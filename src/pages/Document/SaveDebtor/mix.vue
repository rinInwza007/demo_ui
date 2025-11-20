<template>
  <div>
    <Navbar />
    <SecondNavbar />


    <div class="max-w-5xl mx-auto p-6 pt-5">

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


     <div class="gap-2 flex flex-col mt-5">
        <div>ล้างลูกหนี้</div>

        <div class="flex flex-col gap-2">
          <div
            v-for="(row, index) in morelist"
            :key="index"
            class="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-2"
          >

          <div>
            <InputText v-model="row.item" type="text" placeholder="เพิ่มรายการ" />
            <span v-if="errors.rows?.[index]?.item" class="text-red-600 text-xs -mt-2 -mb-[14px] ">{{ errors.rows[index].item }}</span>
            </div>
            <div>
            <InputText v-model="row.ref" type="text" placeholder="เลขที่เอกสารอ้างอิง" />
            <span v-if="errors.rows?.[index]?.ref" class="text-red-600 text-xs -mt-2 -mb-[14px] ">{{ errors.rows[index].ref }}</span>
            </div>
<div>
            <InputText v-model="row.amount" type="text" placeholder="จำนวนเงิน" />
            <span v-if="errors.rows?.[index]?.amount" class="text-red-600 text-xs -mt-2 -mb-[14px] ">{{ errors.rows[index].amount }}</span>
            </div>
            <div>
            <InputText v-model="row.type" type="text" placeholder="หมายเหตุ" />
            <span v-if="errors.rows?.[index]?.type" class="text-red-600 text-xs -mt-2 -mb-[14px] ">{{ errors.rows[index].type }}</span>
</div>
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
                selectedItems: []
              })
            "
          >
            [+] เพิ่มรายการ
          </button>
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

})

const morelist = ref([
  {
    item: '',
    ref: '',
    amount: '',
    type: '',
  },
])


const errors = ref({})

const saveData = () => {
  errors.value = {} // reset


  if (!formData.value.name) {
    errors.value.name = 'กรุณากรอก "ชื่อ"'
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
  errors.value.rows = {}
  for (let i = 0; i < morelist.value.length; i++) {
    const row = morelist.value[i]
    errors.value.rows[i] = {}

    if (!row.item) {
      errors.value.rows[i].item = 'กรุณากรอก "ชื่อรายการ"'
      return
    }

    if (!row.ref) {
      errors.value.rows[i].ref = 'กรุณากรอก "เลขที่เอกสารอ้างอิง"'
      return
    }

    if (!row.amount) {
      errors.value.rows[i].amount = 'กรุณากรอก "จำนวนเงิน"'
      return
    }

    if (!row.type) {
      errors.value.rows[i].type = 'กรุณากรอก "หมายเหตุ"'
      return
    }
  }

  // ถ้าไม่มี error ถึงจะบันทึก
  const dataToSave = {
    formData: formData.value,
    morelist: morelist.value
  }

  console.log('=== ข้อมูลที่บันทึก ===')
  console.log(JSON.stringify(dataToSave, null, 2))

  alert('บันทึกข้อมูลสำเร็จ! ดูข้อมูลใน Console')
}
</script>
