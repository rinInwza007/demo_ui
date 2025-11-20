<template>
  <div>
    <Navbar />
    <SecondNavbar />

    <!-- Container หลัก -->
    <div class="bg-gray-50 min-h-screen py-6 px-4">
      <div class="max-w-6xl mx-auto">
        <!-- Card หลัก -->
        <div class="bg-white border border-gray-300 rounded shadow-md">
          
          <!-- Header -->
          <div class="bg-blue-900 px-8 py-5 border-b-4 border-blue-800">
            <h1 class="text-2xl font-semibold text-white m-0">
              แบบฟอร์มเพิ่มใบนำส่งใหม่
            </h1>
            <p class="text-blue-100 text-sm mt-1">ระบบจัดการใบนำส่งเงิน</p>
          </div>

          <!-- เนื้อหาฟอร์ม -->
          <div class="p-8">
            
            <!-- ข้อมูลพนักงาน -->
            <section class="mb-8">
              <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
                ข้อมูลพนักงาน
              </h2>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-gray-700">
                    ชื่อพนักงาน <span class="text-red-600">*</span>
                  </label>
                  <InputText v-model="formData.name" type="text" placeholder="กรอกชื่อ-นามสกุล" />
                  <span v-if="errors.name" class="text-red-600 text-xs">{{ errors.name }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-gray-700">
                    เบอร์โทรศัพท์ติดต่อ <span class="text-red-600">*</span>
                  </label>
                  <InputText v-model="formData.phone" type="text" placeholder="0XX-XXX-XXXX" />
                  <span v-if="errors.phone" class="text-red-600 text-xs">{{ errors.phone }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-gray-700">
                    สังกัด <span class="text-red-600">*</span>
                  </label>
                  <InputText v-model="formData.department" type="text" placeholder="ระบุหน่วยงาน/สังกัด" />
                  <span v-if="errors.department" class="text-red-600 text-xs">{{ errors.department }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-gray-700">
                    กองทุน <span class="text-red-600">*</span>
                  </label>
                  <Selects
                    v-model="formData.fund"
                    :options="['กองทุนที่ 1', 'กองทุนที่ 2', 'กองทุนที่ 3', 'กองทุนที่ 4']"
                    placeholder="-- เลือกกองทุน --"
                    value-type="string"
                  />
                  <span v-if="errors.fund" class="text-red-600 text-xs">{{ errors.fund }}</span>
                </div>
              </div>
            </section>

            <!-- ข้อมูลโครงการ -->
            <section class="mb-8">
              <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
                ข้อมูลโครงการ
              </h2>
              
              <div class="grid grid-cols-1 gap-5">
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-gray-700">
                    ชื่อนำส่งเงิน <span class="text-red-600">*</span>
                  </label>
                  <InputText 
                    v-model="formData.moneyType" 
                    type="text" 
                    placeholder="ระบุชื่อโครงการหรือแหล่งเงิน เช่น รายได้เงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ" 
                  />
                  <span v-if="errors.moneyType" class="text-red-600 text-xs">{{ errors.moneyType }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-gray-700">
                    รหัสโครงงาน <span class="text-red-600">*</span>
                  </label>
                  <InputText 
                    v-model="formData.projectCode" 
                    type="text" 
                    placeholder="ระบุรหัสโครงการ (กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ)" 
                  />
                  <span v-if="errors.projectCode" class="text-red-600 text-xs">{{ errors.projectCode }}</span>
                </div>
              </div>
            </section>

            <!-- รายการนำส่งเงิน -->
            <section class="mb-8">
              <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
                รายการนำส่งเงิน
              </h2>

              <!-- รายการ -->
              <div class="space-y-4 mb-4">
                <div 
                  v-for="(row, index) in morelist" 
                  :key="index" 
                  class="bg-gray-50 border border-gray-200 rounded p-5 relative"
                >
                  <!-- หัวข้อรายการ -->
                  <div class="flex justify-between items-center mb-4">
                    <span class="text-sm font-semibold text-gray-700">รายการที่ {{ index + 1 }}</span>
                    <button 
                      v-if="morelist.length > 1"
                      @click="morelist.splice(index, 1)"
                      class="bg-white border border-red-600 text-red-600 px-3 py-1 rounded text-xs font-medium hover:bg-red-50 transition"
                    >
                      ลบรายการ
                    </button>
                  </div>

                  <!-- ฟิลด์รายการ -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700">ชื่อรายการ</label>
                      <InputText v-model="row.item" type="text" placeholder="ระบุชื่อรายการ" />
                      <span v-if="errors.rows?.[index]?.item" class="text-red-600 text-xs">{{ errors.rows[index].item }}</span>
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700">เลขที่เอกสารอ้างอิง</label>
                      <InputText v-model="row.ref" type="text" placeholder="ระบุเลขที่เอกสาร" />
                      <span v-if="errors.rows?.[index]?.ref" class="text-red-600 text-xs">{{ errors.rows[index].ref }}</span>
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700">จำนวนเงิน (บาท)</label>
                      <button 
                        @click="openModalForRow(index)"
                        class="w-full px-4 py-2 bg-blue-900 text-white rounded text-sm font-medium hover:bg-blue-800 transition"
                      >
                        เลือกประเภทเงิน
                      </button>
                      <Modal
                        v-if="showModal === index"
                        :show="true"
                        :items="rowItems[index]"
                        @close="showModal = null"
                        @update:selected="(selected) => updateSelectedItems(index, selected)"
                      />
                      <span v-if="errors.rows?.[index]?.selectedItems" class="text-red-600 text-xs">{{ errors.rows[index].selectedItems }}</span>
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700">Keyword</label>
                      <InputText v-model="row.note" type="text" placeholder="คำค้นหา" />
                      <span v-if="errors.rows?.[index]?.note" class="text-red-600 text-xs">{{ errors.rows[index].note }}</span>
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700">ภาษีนอก/ภายใน</label>
                      <InputText v-model="row.type" type="text" placeholder="ระบุประเภทภาษี" />
                      <span v-if="errors.rows?.[index]?.type" class="text-red-600 text-xs">{{ errors.rows[index].type }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ปุ่มเพิ่มรายการ -->
              <button
                @click="morelist.push({ item: '', ref: '', amount: '', note: '', type: '', selectedItems: [] })"
                class="w-full border border-dashed border-gray-400 bg-white text-blue-900 py-3 rounded text-sm font-medium hover:bg-gray-50 hover:border-blue-900 transition"
              >
                + เพิ่มรายการใหม่
              </button>
            </section>

            <!-- สรุปยอดรวม -->
            <div class="bg-blue-50 border border-blue-200 rounded p-6 mb-6">
              <div class="flex justify-between items-center">
                <span class="text-base font-semibold text-blue-900">จำนวนเงินรวมทั้งหมด</span>
                <span class="text-3xl font-bold text-blue-900">{{ formatNumber(totalAmount) }} บาท</span>
              </div>
            </div>

            <!-- หมายเหตุ -->
            <div class="bg-yellow-50 border border-yellow-300 rounded p-3 mb-6">
              <p class="text-sm text-yellow-900 m-0">
                <strong>หมายเหตุ:</strong> กรุณาตรวจสอบข้อมูลให้ถูกต้องและครบถ้วนก่อนกดปุ่มบันทึกข้อมูล (ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก)
              </p>
            </div>

            <!-- ปุ่มดำเนินการ -->
            <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                @click="gotomainpage()"
                class="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition"
              >
                ยกเลิก
              </button>
              <button
                @click="saveData"
                class="px-6 py-2 bg-blue-900 border border-blue-900 text-white rounded text-sm font-medium hover:bg-blue-800 transition"
              >
                บันทึกข้อมูล
              </button>
            </div>
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
import { ref, computed } from 'vue'
import Modal from '@/components/modal/modal.vue'

const formData = ref({
  name: '',
  phone: '',
  department: '',
  fund: '',
  moneyType: '',
  projectCode: ''
})

const morelist = ref([
  {
    item: '',
    ref: '',
    amount: '',
    note: '',
    type: '',
    selectedItems: []
  }
])

const errors = ref({})

const totalAmount = computed(() => {
  return morelist.value.reduce((sum, row) => {
    if (!row.selectedItems) return sum

    const rowTotal = row.selectedItems.reduce((s, item) => {
      const amount = Number(item.amount) || 0
      return s + amount
    }, 0)

    return sum + rowTotal
  }, 0)
})

const formatNumber = (num) => {
  return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const updateSelectedItems = (rowIndex, selected) => {
  morelist.value[rowIndex].selectedItems = selected.filter(i => i.checked)
}

const showModal = ref(null)
const rowItems = ref([])

const openModalForRow = (index) => {
  if (!rowItems.value[index]) {
    rowItems.value[index] = JSON.parse(JSON.stringify([
      { name: 'เงินสด', checked: false, amount: '' },
      { name: 'เช็คธนาคาร', checked: false, amount: '', NumCheck: '' },
      { name: 'ฝากเข้าบัญชีธนาคาร', checked: false, amount: '', AccountNum: '', AccountName: '' }
    ]))
  }
  showModal.value = index
}

const saveData = () => {
  errors.value = {}

  // ตรวจสอบฟอร์มหลัก
  if (!formData.value.name) {
    errors.value.name = 'กรุณากรอก "ชื่อ"'
    return
  }
  if (!formData.value.phone) {
    errors.value.phone = 'กรุณากรอก "เบอร์โทรติดต่อ"'
    return
  }
  if (!formData.value.department) {
    errors.value.department = 'กรุณากรอก "สังกัด"'
    return
  }
  if (!formData.value.fund) {
    errors.value.fund = 'กรุณาเลือก "กองทุน"'
    return
  }
  if (!formData.value.moneyType) {
    errors.value.moneyType = 'กรุณากรอก "ขอนำส่งเงิน"'
    return
  }
  if (!formData.value.projectCode) {
    errors.value.projectCode = 'กรุณากรอก "รหัสโครงงาน"'
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

    if (!row.selectedItems || row.selectedItems.length === 0) {
      errors.value.rows[i].selectedItems = 'กรุณาเลือกและกรอก "จำนวนเงิน"'
      return
    }

    if (!row.note) {
      errors.value.rows[i].note = 'กรุณากรอก "keyword"'
      return
    }

    if (!row.type) {
      errors.value.rows[i].type = 'กรุณากรอก "ภายนอก/ภายใน"'
      return
    }
  }

  // ถ้าผ่านการตรวจสอบทั้งหมด
  const dataToSave = {
    formData: formData.value,
    morelist: morelist.value,
    totalAmount: totalAmount.value
  }

  console.log('=== ข้อมูลที่บันทึก ===')
  console.log(JSON.stringify(dataToSave, null, 2))

  alert('บันทึกข้อมูลสำเร็จ! ดูข้อมูลใน Console')
  errors.value = {}
}

const gotomainpage = () => {
  router.push('/')
}
</script>

<style scoped>
/* Custom styles ถ้าจำเป็น */
</style>