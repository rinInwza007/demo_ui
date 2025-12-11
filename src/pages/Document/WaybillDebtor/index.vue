<template>
  <div>
    <Navbar />
    <SecondNavbar />

    <div class="max-w-6xl mx-auto p-4 sm:p-6 pt-5">
      <div class="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-10 space-y-8">
        <!-- Header Section -->
        <div class="text-center space-y-2 pb-4 border-b border-gray-200">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-800">
            {{ isEditMode ? 'แก้ไขใบนำส่งลูกหนี้' : 'เพิ่มใบนำส่งลูกหนี้' }}
          </h1>
          <p v-if="isEditMode" class="text-sm text-gray-500">
            รหัส: {{ formData.projectCode }}
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>

        <!-- Form Section -->
        <div v-else class="max-w-5xl mx-auto space-y-8">
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
                  v-model="formData.fullName"
                  placeholder="กรอกชื่อ-นามสกุล"
                  class="transition-all duration-200"
                />
                <span v-if="errors.fullName" class="text-red-600 text-xs">
                  {{ errors.fullName }}
                </span>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700">
                  เบอร์โทรติดต่อ <span class="text-red-500">*</span>
                </label>
                <InputText
                  v-model="formData.phone"
                  placeholder="xxx-xxxx-xxx"
                  class="transition-all duration-200"
                  @keypress="allowOnlyDigits"
                />
                <span v-if="errors.phone" class="text-red-600 text-xs">
                  {{ errors.phone }}
                </span>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-700">
                  หน่วยงาน <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="mainCategory"
                  class="h-[44px] w-full rounded-md border border-gray-500 px-2 text-sm"
                >
                  <option value="">-- เลือกหน่วยงาน --</option>
                  <option v-for="(sub, key) in options" :key="key" :value="key">
                    {{ key }}
                  </option>
                </select>
                <span v-if="errors.mainCategory" class="text-red-600 text-xs">
                  {{ errors.mainCategory }}
                </span>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-700">
                  หน่วยงานย่อย <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="subCategory"
                  class="h-[44px] w-full rounded-md border border-gray-500 px-2 text-sm"
                >
                  <option value="">-- เลือกหัวข้อย่อย --</option>
                  <option v-for="item in subOptions" :key="item" :value="item">
                    {{ item }}
                  </option>
                </select>
                <span v-if="errors.subCategory" class="text-red-600 text-xs">
                  {{ errors.subCategory }}
                </span>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700">
                  กองทุน <span class="text-red-500">*</span>
                </label>
                <Selects
                  v-model="formData.fundName"
                  :options="['กองทุนทั่วไป', 'กองทุนพิเศษ']"
                  placeholder="เลือกกองทุน"
                  value-type="string"
                />
                <span v-if="errors.fundName" class="text-red-600 text-xs">
                  {{ errors.fundName }}
                </span>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700">
                  ขอนำส่งเงิน <span class="text-red-500">*</span>
                </label>
              <SendMoneySelect
                ref="sendmoneySelectRef"
                v-model="formData.sendmoney"
                input-id="sendmoney"
                placeholder="เลือกประเภท"
                :required="true"
                :error-message="errors.sendmoney"
                :options="[
                  { value: 'รายได้', text: 'รายได้' },
                  { value: 'เงินโครงการ', text: 'เงินโครงการ' }
                ]"
                :create-new-option="true"
                @change="clearError('sendmoney')"
              />
                <span v-if="errors.sendmoney" class="text-red-600 text-xs">
                  {{ errors.sendmoney }}
                </span>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700">
                  รหัสโครงงาน <span class="text-red-500">*</span>
                </label>
                <InputText
                  v-model="formData.projectCode"
                  placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ"
                  :class="{ 'readonly-force': isEditMode }"
                />
                <span v-if="errors.projectCode" class="text-red-600 text-xs">
                  {{ errors.projectCode }}
                </span>
              </div>
            </div>
          </div>

          <!-- รายการลูกหนี้ -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                รายการลูกหนี้
              </h2>
              <span class="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {{ morelist.length }} รายการ
              </span>
            </div>

            <div class="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-4">
              <!-- Header Labels -->
              <div class="hidden sm:grid sm:grid-cols-[2fr_2fr_1.5fr] gap-3 px-2 pb-2 border-b border-gray-300 text-center mr-5">
                <div class="text-xs font-semibold text-gray-600 uppercase">รายการ</div>
                <div class="text-xs font-semibold text-gray-600 uppercase">จำนวนเงิน</div>
                <div class="text-xs font-semibold text-gray-600 uppercase">หมายเหตุ</div>
              </div>

              <!-- Dynamic Rows -->
              <div class="space-y-4">
                <div
                  v-for="(row, index) in morelist"
                  :key="row.id"
                  class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-blue-300 transition-all"
                >
                  <div class="grid grid-cols-1 sm:grid-cols-[3fr_2fr_2fr_auto] gap-3 items-start">
                    <div class="flex flex-col gap-2">
                      <ItemNameSelect
                        v-model="row.itemName"
                        :input-id="`itemName-${index}`"
                        @input="() => clearRowError(index, 'itemName')"
                        class="-ml-2 -mr-2"
                      />
                      <span v-if="errors.rows?.[index]?.itemName" class="text-red-600 text-xs">
                        {{ errors.rows[index].itemName }}
                      </span>
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <InputText
                        placeholder="จำนวนเงิน"
                        v-model="row.money"
                        @keypress="allowOnlyDigits"
                        @input="() => clearRowError(index, 'money')"
                      />
                      <span v-if="errors.rows?.[index]?.money" class="text-red-600 text-xs">
                        {{ errors.rows[index].money }}
                      </span>
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <InputText
                        v-model="row.note"
                        placeholder="หมายเหตุ"
                        @input="() => clearRowError(index, 'note')"
                      />
                      <span v-if="errors.rows?.[index]?.note" class="text-red-600 text-xs">
                        {{ errors.rows[index].note }}
                      </span>
                    </div>

                    <button
                      v-if="morelist.length > 1"
                      @click="removeRow(index)"
                      class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="ลบรายการ"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Add Row Button -->
              <button
                @click="addRow"
                class="py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มรายการ
              </button>
            </div>
          </div>

          <!-- รายละเอียดรายการ -->
          <div v-if="detailsByRow.length > 0" class="bg-white border border-gray-200 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span class="w-1 h-6 bg-blue-500 rounded-full"></span>
              รายละเอียดรายการ
            </h3>

            <div class="space-y-4">
              <div
                v-for="(detail, idx) in detailsByRow"
                :key="idx"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    รายการที่ {{ detail.rowIndex + 1 }}
                  </span>
                  <span>{{ detail.itemName || 'ไม่ระบุชื่อรายการ' }}</span>
                </div>

                <div class="border-t border-gray-200 pt-3 space-y-2">
                  <div v-if="detail.note" class="flex justify-between items-center text-sm">
                    <span class="text-gray-600">หมายเหตุ:</span>
                    <span class="text-gray-700 italic">{{ detail.note }}</span>
                  </div>

                  <div class="border-t border-gray-300 my-2"></div>

                  <div class="flex justify-between items-center">
                    <span class="font-bold text-gray-800">จำนวนเงิน:</span>
                    <span class="font-bold text-lg" :class="detail.netAmount >= 0 ? 'text-green-600' : 'text-red-600'">
                      {{ formatNumber(detail.netAmount) }} ฿
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ยอดรวมทั้งหมด -->
          <div class="bg-[#7E22CE] border rounded-lg p-6">
            <div class="flex justify-between items-center">
              <span class="text-2xl font-bold text-white">ยอดสุทธิทั้งหมด</span>
              <span class="text-3xl font-bold text-white">
                {{ formatNumber(netTotalAmount) }} บาท
              </span>
            </div>
          </div>

          <!-- Note -->
          <div class="bg-yellow-50 border border-yellow-300 rounded p-3">
            <p class="text-sm text-yellow-900 m-0">
              <strong>หมายเหตุ:</strong>
              กรุณาตรวจสอบข้อมูลให้ถูกต้องและครบถ้วนก่อนกด{{ isEditMode ? 'อัพเดต' : 'บันทึก' }}ข้อมูล 
              (ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก)
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3">
            <button
              @click="gotomainpage"
              class="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors"
            >
              กลับ
            </button>

            <button
              @click="saveData"
              :disabled="reciptStore.loading || isLoading"
              class="px-6 py-2 rounded-md bg-[#7E22CE] text-white hover:bg-[#6B21A8] transition-colors disabled:opacity-50"
            >
              {{ isEditMode ? 'อัพเดต' : 'บันทึก' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import TomSelect from 'tom-select'
import 'tom-select/dist/css/tom-select.css'

// Components
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import Selects from '@/components/input/select/select.vue'
import InputText from '@/components/input/inputtext.vue'
import ItemNameSelect from '@/components/TomSelect/ItemNameSelect.vue'
import SendMoneySelect from '@/components/TomSelect/SendMoneyTomSelect.vue'
// Stores & Composables
import { useReceiptStore } from '@/stores/recipt'
import { useRowManagerDebtor } from '@/components/Function/FunctionDebtor'
import { setupAxiosMock } from '@/fake/mockAxios'

// Initialize
const route = useRoute()
const router = useRouter()
const reciptStore = useReceiptStore()
setupAxiosMock()

// ========== STATE MANAGEMENT ==========
const isEditMode = computed(() => !!route.params.id)
const receiptId = computed(() => route.params.id)
const isLoading = ref(false)

const formData = ref({
  fullName: '',
  phone: '',
  MainAffiliationName: '',
  subAffiliationName: '',
  fundName: '',
  projectCode: '',
  sendmoney: null,
  receiptList: '',
})

const itemNameInstances = ref({})
const errors = ref({})
const mainCategory = ref('')
const subCategory = ref('')

// ========== COMPOSABLES ==========
const {
  allowOnlyDigits,
  netTotalAmount,
  detailsByRow,
  morelist,
  addRow,
  removeRow,
  initTomSelect,
} = useRowManagerDebtor()

// ========== OPTIONS ==========
const options = {
  คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ: [
    'ศูนย์ศึกษาเศรษฐกิจพอเพียงและความอยู่รอดของมนุษยชาติ',
    'ศูนย์ฝึกอบรมวิชาชีพและบริการนานาชาติด้านเกษตรและอาหาร',
  ],
  คณะทันตแพทยศาสตร์: ['โรงพยาบาลทันตกรรมมหาวิทยาลัยพะเยา'],
  คณะพยาบาลศาสตร์: ['ศูนย์พัฒนาเด็กเล็ก'],
  คณะพลังงานและสิ่งแวดล้อม: [
    '1.ศูนย์วิจัยพลังงานทดแทนและสิ่งแวดล้อม',
    '1.1หน่วยปฏิบัติการทดสอบทางสิ่งแวดล้อม',
    '1.2 หน่วยรับรองการจัดการก๊าซเรือนกระจก',
  ],
  คณะแพทยศาสตร์: ['โรงพยาบาลมหาวิทยาลัยพะเยา'],
  คณะเภสัชศาสตร์: ['สถานปฏิบัติการเภสัชกรรมชุมชน'],
  คณะวิทยาศาสตร์: ['ศูนย์การเรียนรู้ความเป็นเลิศทางวิทยาศาสตร์และบริการวิชาการ'],
  คณะวิศวกรรมศาสตร์: ['ศูนย์วิจัยและบริการวิชาการวิศวกรรม', 'ศูนย์เทคโนโลยียานยนต์และขนส่ง'],
  คณะสถาปัตยกรรมศาสตร์และศิลปกรรมศาสตร์: ['ศูนย์บริการวิชาการงานสร้างสรรค์'],
  คณะศิลปศาสตร์: ['ศูนย์ภาษา'],
  คณะสหเวชศาสตร์: ['ศูนย์บริการสุขภาพสหเวชศาสตร์'],
  วิทยาลัยการจัดการ: [],
  กองทรัพย์สิน: ['งานบริหารพื้นที่', 'งานโรงแรมฟ้ามุ่ยและเอื้องคำ', 'งานร้านค้าสวัสดิการ'],
  โรงเรียนสาธิตมหาวิทยาลัยพะเยา: [],
  วิทยาเขตเชียงราย: [],
  สถาบันนวัตกรรมและถ่ายทอดเทคโนโลยี: [],
  สถาบันนวัตกรรมการเรียนรู้: [],
}

const subOptions = computed(() => {
  return mainCategory.value ? options[mainCategory.value] : []
})

// ========== NAVIGATION ==========
const gotomainpage = () => {
  router.push('/indexwaybilldebtor')
}

// ========== FORMATTING ==========
const formatNumber = (num) => {
  return Number(num).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ========== TOMSELECT FUNCTIONS ==========
const applyCSSToTomSelect = (selectEl) => {
  const control = selectEl.tomselect.control
  control.style.height = '2.5rem'
  control.style.width = '100%'
  control.style.padding = '0 0.5rem'
  control.style.display = 'flex'
  control.style.alignItems = 'center'
  control.style.borderRadius = '0.375rem'
  control.style.border = '1px solid #6b7280'
  control.style.fontSize = '1rem'

  const input = control.querySelector('input')
  if (input) {
    input.style.fontSize = '1.01rem'
    input.style.height = '1rem'
    input.style.padding = '0.5rem'
  }
}

const initItemNameTomSelect = (index) => {
  const elementId = `itemName-${index}`

  setTimeout(() => {
    const el = document.getElementById(elementId)

    if (el && !el.tomselect) {
      const tomselect = new TomSelect(el, {
        create: true,
        placeholder: 'ระบุรายการ',
        allowEmptyOption: true,
        onChange(value) {
          morelist.value[index].itemName = value
          clearRowError(index, 'itemName')
        },
      })

      applyCSSToTomSelect(el)
      itemNameInstances.value[index] = tomselect
    }
  }, 100)
}

// ========== ERROR HANDLING ==========
const clearRowError = (rowIndex, field) => {
  if (errors.value.rows?.[rowIndex]?.[field]) {
    if (morelist.value[rowIndex][field]) {
      delete errors.value.rows[rowIndex][field]

      if (Object.keys(errors.value.rows[rowIndex]).length === 0) {
        delete errors.value.rows[rowIndex]
      }
    }
  }
}

// ========== LOAD DATA (EDIT MODE) ==========
const loadReceiptData = async () => {
  if (!receiptId.value) return

  isLoading.value = true
  try {
    const response = await axios.get(`/getReceipt/${receiptId.value}`)
    const data = response.data

    // Populate form data
    formData.value.fullName = data.fullName || ''
    formData.value.phone = data.phone || ''
    formData.value.fundName = data.fundName || ''
    formData.value.projectCode = data.projectCode || ''
    
    mainCategory.value = data.mainAffiliationName || ''
    subCategory.value = data.subAffiliationName || ''

    const moneyTypeValue = data.sendmoney || data.moneyType || ''
    formData.value.sendmoney = moneyTypeValue

    // Populate receipt list
    if (data.receiptList && data.receiptList.length > 0) {
      morelist.value = data.receiptList.map((item, index) => ({
        id: index + 1,
        itemName: item.itemName || '',
        note: item.note || '',
        money: item.amount || 0,
        selectedItems: item.paymentDetails?.map(detail => ({
          checked: true,
          moneyType: detail.moneyType || 'debtor'
        })) || []
      }))
    }

    Swal.fire({
      icon: 'success',
      title: 'โหลดข้อมูลสำเร็จ',
      timer: 1500,
      showConfirmButton: false,
    })
  } catch (err) {
    console.error('Load error:', err)
    Swal.fire({
      icon: 'error',
      title: 'ไม่พบข้อมูล',
      text: 'ไม่สามารถโหลดข้อมูลใบนำส่งได้',
      confirmButtonColor: '#DC2626',
    }).then(() => {
      router.push('/indexwaybilldebtor')
    })
  } finally {
    isLoading.value = false
  }
}

// ========== VALIDATION & SAVE ==========
const saveData = async () => {
  errors.value = {}
  let hasError = false

  // Validation ฟอร์มหลัก
  if (!formData.value.fullName) {
    errors.value.fullName = 'กรุณากรอก "ชื่อ"'
    hasError = true
  }
  if (!formData.value.phone) {
    errors.value.phone = 'กรุณากรอก "เบอร์โทรติดต่อ"'
    hasError = true
  }
  if (!formData.value.fundName) {
    errors.value.fundName = 'กรุณาเลือก "กองทุน"'
    hasError = true
  }
  if (!mainCategory.value) {
    errors.value.mainCategory = 'กรุณาเลือก "หน่วยงาน"'
    hasError = true
  }
  if (!subCategory.value) {
    errors.value.subCategory = 'กรุณาเลือก "หน่วยงานย่อย"'
    hasError = true
  }
  if (!formData.value.sendmoney) {
    errors.value.sendmoney = 'กรุณาเลือก "ขอนำส่งเงิน"'
    hasError = true
  }
  if (!formData.value.projectCode) {
    errors.value.projectCode = 'กรุณากรอก "รหัสโครงงาน"'
    hasError = true
  }

  // Validation รายการ
  errors.value.rows = {}
  morelist.value.forEach((row, index) => {
    const rowErrors = {}
    if (!row.itemName) rowErrors.itemName = 'กรุณากรอก "ชื่อรายการ"'
    if (!row.note) rowErrors.note = 'กรุณากรอก "หมายเหตุ"'
    if (!row.money) rowErrors.money = 'กรุณากรอก "จำนวนเงิน"'

    if (Object.keys(rowErrors).length > 0) {
      errors.value.rows[index] = rowErrors
      hasError = true
    }
  })

  if (hasError) {
    Swal.fire({
      icon: 'error',
      title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      text: 'มีข้อมูลบางช่องที่ยังไม่ได้กรอกหรือกรอกไม่ถูกต้อง',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#7E22CE',
    })
    return
  }

  // แสดง loading
  Swal.fire({
    title: isEditMode.value ? 'กำลังอัพเดตข้อมูล...' : 'กำลังบันทึกข้อมูล...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })

  // สร้าง payload
  const currentDateTime = new Date().toISOString()
  
  const payload = {
    fullName: formData.value.fullName,
    moneyTypeNote: 'Debtor',
    phone: formData.value.phone,
    mainAffiliationName: mainCategory.value,
    subAffiliationName: subCategory.value,
    fundName: formData.value.fundName,
    moneyType: 'debtor',
    projectCode: formData.value.projectCode,
    sendmoney: formData.value.sendmoney,
    netTotalAmount: netTotalAmount.value,
  receiptList: morelist.value.map((row) => ({
    itemName: row.itemName,
    note: row.note || '',
    amount: Number(row.money) || 0,
paymentDetails: row.selectedItems
  ?.filter(item => item.checked)
  .map(item => ({
    ...item,      // เอาค่าที่เหลือมาจาก UI
    moneyType: 'debtor' // กำหนดตรงๆ เป็น 'debtor'
  })) || []
  })),
  }

  // เพิ่ม createdAt และ updatedAt
  if (isEditMode.value) {
    payload.updatedAt = currentDateTime
  } else {
    payload.createdAt = currentDateTime
    payload.updatedAt = currentDateTime
  }

  try {
    let response
    if (isEditMode.value) {
      response = await axios.put(`/updateReceipt/${receiptId.value}`, payload)
    } else {
      response = await axios.post('/saveReceipt', payload)
    }

    console.log('บันทึกสำเร็จ:', response.data)

    await Swal.fire({
      icon: 'success',
      title: isEditMode.value ? 'อัพเดตสำเร็จ!' : 'บันทึกสำเร็จ!',
      text: `${isEditMode.value ? 'อัพเดต' : 'บันทึก'}ใบนำส่งลูกหนี้ ${formData.value.projectCode} เรียบร้อยแล้ว`,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#7E22CE',
      timer: 2000,
      timerProgressBar: true,
    })

    router.push('/indexwaybilldebtor')
  } catch (err) {
    console.error('Error:', err)

    let errorMessage = isEditMode.value 
      ? 'เกิดข้อผิดพลาดในการอัพเดตข้อมูล'
      : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'

    if (err.response) {
      if (err.response.status === 409) {
        errorMessage = 'รหัสโครงการนี้มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น'
      } else if (err.response.status === 400) {
        errorMessage = err.response.data.message || 'ข้อมูลไม่ถูกต้อง'
      } else {
        errorMessage = err.response.data.message || errorMessage
      }
    } else if (err.request) {
      errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
    } else {
      errorMessage = err.message
    }

    Swal.fire({
      icon: 'error',
      title: isEditMode.value ? 'อัพเดตไม่สำเร็จ' : 'บันทึกไม่สำเร็จ',
      text: errorMessage,
      confirmButtonText: 'ลองอีกครั้ง',
      confirmButtonColor: '#DC2626',
    })
  }
}

// ========== LIFECYCLE HOOKS ==========
onMounted(async () => {
  // Initialize TomSelect for sendmoney

  // Initialize TomSelect for rows
  morelist.value.forEach((_, i) => {
    initItemNameTomSelect(i)
    initTomSelect(i)
  })

  await nextTick()

  // Load data if edit mode
  if (isEditMode.value) {
    await loadReceiptData()
  }
})

// ========== WATCHERS ==========
watch(
  morelist,
  (newVal, oldVal) => {
    if (newVal.length > oldVal.length) {
      const newIndex = newVal.length - 1
      initItemNameTomSelect(newIndex)
      initTomSelect(newIndex)
    }
  },
  { deep: true }
)

watch(
  [formData, mainCategory, subCategory],
  ([newFormData]) => {
    for (const key in newFormData) {
      if (errors.value[key] && newFormData[key]) {
        delete errors.value[key]
      }
    }
  },
  { deep: true }
)
</script>
<style scoped>
.readonly-force :deep(input) {
  pointer-events: none;
  background-color: #e9ecef;
  color: #6c757d;
}
</style>

