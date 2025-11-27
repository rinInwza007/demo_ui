<template>
  <div>
    <Navbar />
    <SecondNavbar />

    <div class="max-w-6xl mx-auto p-4 sm:p-6 pt-5">
      <div class="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-10 space-y-8">

        <!-- Header Section -->
        <div class="text-center space-y-2 pb-4 border-b border-gray-200">
          <h1 class=" text-3xl sm:text-4xl font-bold text-gray-800">ล้างลูกหนี้</h1>

        </div>

        <!-- Form Section -->
        <div class="max-w-5xl mx-auto space-y-8">

          <!-- ข้อมูลผู้บันทึก -->
          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <span class="w-1 h-6 bg-blue-500 rounded-full"></span>
              ข้อมูลผู้บันทึก
            </h2>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700">
                  ข้าพเจ้า <span class="text-red-500">*</span>
                </label>
                <InputText
                  v-model="formData.name"
                  placeholder="กรอกชื่อ-นามสกุล"
                  class="transition-all duration-200"
                />
                <span v-if="errors.name" class="text-red-600 text-xs">
                  {{ errors.name }}
                </span>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700">
                  เบอร์โทรติดต่อ <span class="text-red-500">*</span>
                </label>
                <InputText
                  v-model="formData.phone"
                  placeholder="กรอกเบอร์โทรศัพท์"
                  class="transition-all duration-200"
                />
                <span v-if="errors.phone" class="text-red-600 text-xs">
                  {{ errors.phone }}
                </span>
              </div>

              <div class="flex flex-col gap-2 ">
                <label class="text-sm font-medium text-gray-700">
                  สังกัด <span class="text-red-500">*</span>
                </label>
                <Selects
                  v-model="formData.department"
                  :options="['กองทุนที่ 1', 'กองทุนที่ 2', 'กองทุนที่ 3', 'กองทุนที่ 4']"
                  placeholder="เลือกสังกัด"
                  value-type="string"
                />
                <span v-if="errors.department" class="text-red-600 text-xs">
                  {{ errors.department }}
                </span>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700">
                  จำนวนเงินรวม <span class="text-red-500">*</span>
                </label>
                <InputText
                  v-model="formData.fund"
                  placeholder="กรอกจำนวนเงิน (บาท)"
                  class="transition-all duration-200"
                />
                <span v-if="errors.fund" class="text-red-600 text-xs">
                  {{ errors.fund }}
                </span>
              </div>
            </div>
          </div>

          <!-- รายการล้างลูกหนี้ -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                รายการล้างลูกหนี้
              </h2>
              <span class="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {{ morelist.length }} รายการ
              </span>
            </div>

            <div class="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-4 ">
              <!-- Header Labels (Hidden on mobile) -->
              <div class="hidden sm:grid sm:grid-cols-[2fr_1.2fr_1fr_1.2fr_auto] gap-3 px-2 pb-2 border-b border-gray-300">
                <div class="text-xs font-semibold text-gray-600 uppercase">รายการ</div>
                <div class="text-xs font-semibold text-gray-600 uppercase">เลขที่อ้างอิง</div>
                <div class="text-xs font-semibold text-gray-600 uppercase">จำนวนเงิน</div>
                <div class="text-xs font-semibold text-gray-600 uppercase">หมายเหตุ</div>
                <div class="text-xs font-semibold text-gray-600 uppercase w-10"></div>
              </div>
              <!-- Dynamic Rows -->
              <div class="space-y-4">
                <div
                  v-for="(row, index) in morelist"
                  :key="index"
                  class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-blue-300 transition-all duration-200"
                >
                <div>
                  <div class="grid grid-cols-1 sm:grid-cols-[2fr_1.2fr_1fr_1.2fr_auto] gap-3 items-start">

                    <!-- รายการ -->
                    <div class="flex flex-col gap-1.5">
                      <label class="text-xs font-medium text-gray-600 sm:hidden">
                        รายการ <span class="text-red-500">*</span>
                      </label>
                      <InputText
                        v-model="row.item"
                        placeholder="ระบุรายการ"
                        class="w-full"
                      />
                      <span v-if="errors.rows?.[index]?.item" class="text-red-600 text-xs">
                        {{ errors.rows[index].item }}
                      </span>
                    </div>

                    <!-- เลขที่อ้างอิง -->
                    <div class="flex flex-col gap-1.5">
                      <label class="text-xs font-medium text-gray-600 sm:hidden">
                        เลขที่อ้างอิง <span class="text-red-500">*</span>
                      </label>
                      <InputText
                        v-model="row.ref"
                        placeholder="เลขที่เอกสาร"
                        class="w-full"
                      />
                      <span v-if="errors.rows?.[index]?.ref" class="text-red-600 text-xs">
                        {{ errors.rows[index].ref }}
                      </span>
                    </div>

                    <!-- จำนวนเงิน -->
                    <div class="flex flex-col gap-1.5 ">
                      <label class="text-xs font-medium text-gray-600 sm:hidden">
                        จำนวนเงิน <span class="text-red-500">*</span>
                      </label>
                      <InputText
                        v-model="row.amount"
                        placeholder="0.00"
                        class="w-full"
                      />
                      <span v-if="errors.rows?.[index]?.amount" class="text-red-600 text-xs">
                        {{ errors.rows[index].amount }}
                      </span>
                    </div>

                    <!-- หมายเหตุ -->
                    <div class="flex flex-col gap-1.5">
                      <label class="text-xs font-medium text-gray-600 sm:hidden">
                        หมายเหตุ <span class="text-red-500">*</span>
                      </label>
                      <InputText
                        v-model="row.type"
                        placeholder="หมายเหตุ"
                        class="w-full"
                      />
                      <span v-if="errors.rows?.[index]?.type" class="text-red-600 text-xs">
                        {{ errors.rows[index].type }}
                      </span>
                    </div>
                    <!-- Delete Button -->
                    <button
                      v-if="morelist.length > 1"
                      @click="removeRow(index)"
                      class="mt-0 sm:mt-0 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 self-start sm:self-center"
                      title="ลบรายการ"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                     <div class="mt-2">
                      <input
                        :ref="(el) => (keywordInputs[index] = el)"
                        v-model="row.keyword"
                        type="text"
                        placeholder="keyword"
                        class="mb-2 mr-3"
                        @input="() => clearRowError(index, 'keyword')"
                      />
                      <span
                        v-if="errors.rows?.[index]?.keyword"
                        class="text-red-600 text-xs -mt-2 -mb-[14px]"
                        >{{ errors.rows[index].keyword }}</span
                      >
                    </div>

                </div>
                </div>
              </div>

              <!-- Add Row Button -->
              <button
                @click="addRow"
                class="w-120  py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มรายการ
              </button>
            </div>

          </div>
          <div class="mt-5">
              <div class="bg-[#7E22CE] border border-blue-200 rounded p-6 mb-6">
                <div class="flex justify-between items-center">
                  <span class="text-2xl font-bold text-white">จำนวนเงินรวมทั้งหมด</span>
                  <span class="text-3xl font-bold text-white"
                    >{{ formatNumber(totalAmount) }} บาท</span
                  >
                </div>
              </div>
            </div>
          <div class="bg-yellow-50 border border-yellow-300 rounded p-3 mb-6 mt-6 ">
              <p class="text-sm text-yellow-900 m-0">
                <strong>หมายเหตุ:</strong>
                กรุณาตรวจสอบข้อมูลให้ถูกต้องและครบถ้วนก่อนกดปุ่มบันทึกข้อมูล (ช่องที่มีเครื่องหมาย *
                จำเป็นต้องกรอก)
              </p>
            </div>

          <!-- Action Buttons -->
   <div class="mt-6 flex justify-end gap-3 mb-4">
  <button
    @click="gotomainpage"
    class="px-6 py-2 rounded-md bg-gray-600 text-white btn-back"
  >
    กลับ
  </button>

  <button
    @click="saveData"
    class="px-6 py-2 rounded-md bg-gray-600 text-white btn-save"
  >
    บันทึก
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
import Selects from '@/components/input/select/select.vue'
import router from '@/router'
import InputText from '@/components/input/inputtext.vue'
import { ref, computed, watch } from 'vue'
import TomSelect from 'tom-select'
import 'tom-select/dist/css/tom-select.css'
import { nextTick,onMounted} from 'vue'
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
     keyword: '',
  },
])

const errors = ref({})

const keywordInputs = [] // array ref เก็บ element ของแต่ละแถว

onMounted(() => {
  // ลบส่วนนี้ออกทั้งหมด เพราะไม่มี element moneyType ใน template
  // const selectEl = document.getElementById("moneyType");
  // ...

  // เหลือแค่ init TomSelect สำหรับ keyword
  morelist.value.forEach((_, i) => initTomSelect(i))
})

const initTomSelect = (index) => {
  nextTick(() => {
    const input = keywordInputs[index]
    console.log('Init TomSelect for index:', index, 'input:', input) // debug

    if (!input) {
      console.log('Input not found for index:', index)
      return
    }

    // เช็คว่า init ไปแล้วหรือยัง
    if (input.tomselect) {
      console.log('TomSelect already initialized for index:', index)
      return
    }

    new TomSelect(input, {
      persist: false,
      createOnBlur: true,
      create: true,
      controlClass: 'Style-Tom',
      dropdownClass: 'custom-dropdown',
      options: [],
      onChange(value) {
        morelist.value[index].keyword = value
        console.log('Keyword changed for row', index, ':', value) // debug
      },
    })
  })
}

// watch ตอนเพิ่มแถวใหม่
watch(morelist, (newVal, oldVal) => {
  if (newVal.length > oldVal.length) {
    initTomSelect(newVal.length - 1)
  }
})

const addRow = () => {
  morelist.value.push({
    item: '',
    ref: '',
    amount: '',
    type: '',
    keyword: '', // เพิ่มฟิลด์ keyword
  })

  nextTick(() => {
    initTomSelect(morelist.value.length - 1)
  })
}

const removeRow = (index) => {
  if (morelist.value.length > 1) {
    morelist.value.splice(index, 1)
  }
}
const formatNumber = (num) => {
  return Number(num).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
const totalAmount = computed(() => {
  return morelist.value.reduce((sum, row) => {
    const num = parseFloat(row.amount)
    return sum + (isNaN(num) ? 0 : num)
  }, 0)
})
watch(totalAmount, (newVal) => {
  formData.value.fund = newVal.toFixed(2)
})



const saveData = () => {
  errors.value = {}
  let hasError = false

  // Validate main form
  if (!formData.value.name) {
    errors.value.name = 'กรุณากรอก "ชื่อ"'
    hasError = true
  }
  if (!formData.value.phone) {
    errors.value.phone = 'กรุณากรอก "เบอร์โทรติดต่อ"'
    hasError = true
  }
  if (!formData.value.department) {
    errors.value.department = 'กรุณาเลือก "สังกัด"'
    hasError = true
  }
  if (!formData.value.fund) {
    errors.value.fund = 'กรุณากรอก "จำนวนเงิน"'
    hasError = true
  }

  // Validate rows
  errors.value.rows = {}
  morelist.value.forEach((row, index) => {
    errors.value.rows[index] = {}

    if (!row.item) {
      errors.value.rows[index].item = 'กรุณากรอก "ชื่อรายการ"'
      hasError = true
    }
    if (!row.ref) {
      errors.value.rows[index].ref = 'กรุณากรอก "เลขที่เอกสารอ้างอิง"'
      hasError = true
    }
    if (!row.amount) {
      errors.value.rows[index].amount = 'กรุณากรอก "จำนวนเงิน"'
      hasError = true
    }
    if (!row.type) {
      errors.value.rows[index].type = 'กรุณากรอก "หมายเหตุ"'
      hasError = true
    }
  })

  // ถ้ามี error ให้หยุดตรงนี้
  if (hasError) {
    return
  }

  // Save data
  const dataToSave = {
    formData: formData.value,
    morelist: morelist.value
  }

  console.log('=== ข้อมูลที่บันทึก ===')
  console.log(JSON.stringify(dataToSave, null, 2))

  alert('บันทึกข้อมูลสำเร็จ! ✓')
}

</script>
<style lang="scss" scoped>
.btn-back,
.btn-save {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.btn-back:hover {
  transform: scale(1.06);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  background-color: #b91c1c; /* แดง */
}

.btn-save:hover {
  transform: scale(1.06);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  background-color: green; /* เขียว */
}

:deep(.Style-Tom) {
  border: 1px solid #6b7280 !important;
  width: 100%;
  border-radius: 0.375rem !important;
  padding: 0.19rem 0.5rem !important;
  display: flex !important;
  flex-wrap: wrap !important;
  align-items: flex-start !important; /* เปลี่ยนจาก center เป็น flex-start */
  gap: 0.15rem !important;
  background-color: #ffffff !important;
  font-size: medium;
}

:deep(.Style-Tom input) {
  flex: none !important; /* ไม่ให้ขยาย */
  min-width: 50px !important;
  width: 100px !important; /* กำหนดความกว้างแน่นอน */
  padding: 0.25rem !important;
  text-align: center;
}
:deep(.Style-Tom .item) {
  background-color: #f3f4f6; /* เทาอ่อน */
  border: 1px solid #d1d5db; /* เส้นกรอบ */
  border-radius: 0.375rem; /* โค้งนิดๆ */
  padding: 2px 8px;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}


:deep(#moneyType.tom-select) {
  width: 100%;
  height: 2.5rem; /* h-10 */
}

:deep(#moneyType.tom-select .ts-control) {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 0.5rem; /* px-2 */
}


</style>
