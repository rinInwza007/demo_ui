<template>
  <div>
    <Navbar />
    <SecondNavbar />

    <div class="max-w-6xl mx-auto p-4 sm:p-6 pt-5">
      <div class="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-10 space-y-8">
        <!-- Header Section -->
        <div class="text-center space-y-2 pb-4 border-b border-gray-200">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-800">เพิ่มใบนำส่ง</h1>
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
                  class="h-[44px] w-full rounded-md border border-gray-500 px-2 text-sm disabled:bg-gray-200 disabled:text-gray-400"
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
                <select
                  id="moneyType"
                  placeholder=""
                  autocomplete="off"
                  v-model="formData.moneyType"
                  class="transition-all duration-200"
                >
                  <option value=""></option>
                  <option value="รายได้">รายได้</option>
                  <option value="เงินโครงการ">เงินโครงการ</option>
                </select>
                <span v-if="errors.moneyType" class="text-red-600 text-xs">
                  {{ errors.moneyType }}
                </span>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700">
                  รหัสโครงงาน <span class="text-red-500">*</span>
                </label>
                <InputText
                  v-model="formData.projectCode"
                  placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ"
                  class="transition-all duration-200"
                />
                <span v-if="errors.projectCode" class="text-red-600 text-xs">
                  {{ errors.projectCode }}
                </span>
              </div>
            </div>
          </div>

          <!-- รายการนำส่งเงิน -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                รายการนำส่งเงิน
              </h2>
              <span class="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {{ morelist.length }} รายการ
              </span>
            </div>
            <div class="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-4">
              <!-- Header Labels (Hidden on mobile) -->
              <div
                class="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 px-2 pb-2 border-b border-gray-300 items-center js"
              >
                <div class="text-xs font-semibold text-gray-600 uppercase">รายการ</div>
                <div class="text-xs font-semibold text-gray-600 uppercase">จำนวนเงิน</div>
                <div class="text-xs font-semibold text-gray-600 uppercase">ค่าธรรมเนียม</div>
                <div class="text-xs font-semibold text-gray-600 uppercase">หมายเหตุ</div>
                <div class="text-xs font-semibold text-gray-600 uppercase">คำสำคัญ</div>
              </div>

              <!-- Dynamic Rows -->
              <div class="space-y-4">
                <div
                  v-for="(row, index) in morelist"
                  :key="row.id"
                  class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-blue-300 transition-all duration-200"
                >
                  <div>
                    <div
                      class="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 items-start"
                    >
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
                      <!-- จำนวนเงิน -->
                      <div class="flex flex-col gap-1.5">
                        <button
                          class="w-full sm:w-auto px-4 py-2 bg-[#7E22CE] text-white rounded-md hover:bg-[#6B21A8] transition-colors duration-200"
                          @click="openModalForRow(index)"
                        >
                          จำนวนเงินรวม
                        </button>
                        <Modal
                          v-if="showModal === index"
                          :show="true"
                          :items="rowItems[index]"
                          @close="showModal = null"
                          @input="() => clearRowError(index, 'selectedItems')"
                          @update:selected="(selected) => updateSelectedItems(index, selected)"
                        />
                        <span
                          v-if="errors.rows?.[index]?.selectedItems"
                          class="text-red-600 text-xs"
                        >
                          {{ errors.rows[index].selectedItems }}
                        </span>
                      </div>
                      <div class="flex flex-col gap-1.5">
                        <InputText
                          v-model="row.fee"
                          placeholder="ค่าธรรมเนียม"
                          class="w-full"
                          @input="() => clearRowError(index, 'fee')"
                        />
                        <span v-if="errors.rows?.[index]?.fee" class="text-red-600 text-xs">
                          {{ errors.rows[index].fee }}
                        </span>
                      </div>

                      <!-- ประเภท -->
                      <div class="flex flex-col gap-1.5">
                        <InputText
                          v-model="row.note"
                          placeholder="หมายเหตุ"
                          class="w-full"
                          @input="() => clearRowError(index, 'note')"
                        />
                        <span v-if="errors.rows?.[index]?.note" class="text-red-600 text-xs">
                          {{ errors.rows[index].note }}
                        </span>
                      </div>
                      <KeywordTomSelect
                        v-model="row.keyword"
                        :input-id="`keyword-${index}`"
                        :error="errors.rows?.[index]?.keyword"
                        @input="() => clearRowError(index, 'keyword')"
                      />
                      <!-- Delete Button -->
                      <button
                        v-if="morelist.length > 1"
                        @click="removeRow(index)"
                        class="mt-0 sm:mt-0 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 self-start sm:self-center"
                        title="ลบรายการ"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add Row Button -->
              <button
                @click="addRow"
                class="py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                เพิ่มรายการ
              </button>
            </div>
          </div>

          <!-- Total Amount -->
  <div>
    <div
      v-if="detailsByRow.length > 0"
      class="bg-white border border-gray-200 rounded-xl p-6 mb-6"
    >
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span class="w-1 h-6 bg-blue-500 rounded-full"></span>
        รายละเอียดการชำระเงิน
      </h3>

      <div class="space-y-4">
        <div
          v-for="(detail, idx) in detailsByRow"
          :key="idx"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <!-- Header รายการ -->
          <div class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
              >รายการที่ {{ detail.rowIndex + 1 }}</span
            >
            <span>{{ detail.itemName || 'ไม่ระบุชื่อรายการ' }}</span>
          </div>

          <!-- รายการชำระเงิน -->
          <div class="space-y-2 mb-4">
  <div
    v-for="(item, itemIdx) in detail.items"
    :key="itemIdx"
    class="bg-gray-50 rounded p-3 text-sm"
  >
    <div class="flex justify-between items-start mb-2">
      <!-- แสดง type พร้อม fallback -->
      <span
        class="font-medium px-2 py-1 rounded"
        :class="{
          'bg-green-100 text-green-700': item.type === 'เงินสด',
          'bg-blue-100 text-blue-700': item.type === 'เช็คธนาคาร',
          'bg-orange-100 text-orange-700': item.type === 'ฝากเข้าบัญชี',
          'bg-gray-100 text-gray-700': !item.type || item.type === 'ไม่ระบุ'
        }"
      >
        {{ item.type || 'ไม่ระบุประเภท' }}
      </span>
      <span class="font-bold text-gray-800">
        {{ formatNumber(item.amount) }} ฿
      </span>
    </div>

    <div class="space-y-1 text-xs text-gray-600">
      <div class="flex justify-between">
        <span>เลขที่อ้างอิง:</span>
        <span class="font-medium">{{ item.referenceNo || '–' }}</span>
      </div>

      <!-- แสดงเฉพาะเช็คธนาคาร -->
      <div v-if="item.type === 'เช็คธนาคาร' && item.checkNumber" class="flex justify-between">
        <span>เลขที่เช็ค:</span>
        <span class="font-medium">{{ item.checkNumber }}</span>
      </div>

      <!-- แสดงเฉพาะฝากเข้าบัญชี -->
      <template v-if="item.type === 'ฝากเข้าบัญชี'">
        <div v-if="item.accountNumber" class="flex justify-between">
          <span>เลขบัญชี:</span>
          <span class="font-medium">{{ item.accountNumber }}</span>
        </div>
        <div v-if="item.accountName" class="flex justify-between">
          <span>ชื่อบัญชี:</span>
          <span class="font-medium">{{ item.accountName }}</span>
        </div>
      </template>
    </div>
  </div>
          </div>

          <!-- Summary ของรายการนี้ -->
          <div class="border-t border-gray-200 pt-3 space-y-2">
            <!-- ยอดรวมก่อนหักค่าธรรมเนียม -->
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-600">ยอดรวม:</span>
              <span class="font-semibold text-gray-800">
                {{ formatNumber(detail.subtotal) }} ฿
              </span>
            </div>

            <!-- ค่าธรรมเนียม -->
            <div 
              v-if="detail.fee && detail.fee > 0" 
              class="flex justify-between items-center text-sm"
            >
              <span class="text-gray-600">หัก ค่าธรรมเนียม:</span>
              <span class="font-semibold text-red-600">
                - {{ formatNumber(detail.fee) }} ฿
              </span>
            </div>

            <!-- หมายเหตุ -->
            <div 
              v-if="detail.note" 
              class="flex justify-between items-center text-sm"
            >
              <span class="text-gray-600">หมายเหตุ:</span>
              <span class="text-gray-700 italic">{{ detail.note }}</span>
            </div>

            <!-- เส้นแบ่ง -->
            <div class="border-t border-gray-300 my-2"></div>

            <!-- ยอดสุทธิ -->
            <div class="flex justify-between items-center">
              <span class="font-bold text-gray-800">ยอดสุทธิ:</span>
              <span class="font-bold text-lg" 
                :class="detail.netAmount >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ formatNumber(detail.netAmount) }} ฾
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ยอดรวมทั้งหมด -->
    <div class="space-y-4">

      <!-- ยอดสุทธิสุดท้าย -->
      <div class="bg-[#7E22CE] border rounded-lg p-6">
        <div class="flex justify-between items-center">
          <span class="text-2xl font-bold text-white">ยอดสุทธิทั้งหมด </span>
          <span class="text-3xl font-bold text-white">
            {{ formatNumber(netTotalAmount) }} บาท
          </span>
        </div>
      </div>
    </div>
  </div>

          <!-- Note -->
          <div class="bg-yellow-50 border border-yellow-300 rounded p-3 mb-6 mt-6">
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
              :disabled="reciptStore.loading"
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
import { ref, computed, onMounted, watch } from 'vue'
import Modal from '@/components/modal/modal.vue'
import TomSelect from 'tom-select'
import 'tom-select/dist/css/tom-select.css'
import { useReceiptStore } from '@/stores/recipt' // เพิ่ม import
import { useRowManager } from '@/components/Function/FuncForm'
import KeywordTomSelect from '@/components/TomSelect/KeywordTomSelect.vue'
import ItemNameSelect from '@/components/TomSelect/ItemNameSelect.vue'
import axios from 'axios'
import { setupAxiosMock } from '@/fake/mockAxios'
const reciptStore = useReceiptStore() // สร้าง instance
setupAxiosMock()
const gotomainpage = () => {
  router.push('/')
}
const {
    netTotalAmount,
  detailsByRow,
  morelist,
  addRow,
  removeRow,
  openModalForRow,
  updateSelectedItems,
  showModal,
  rowItems,
  initTomSelect,
} = useRowManager()
const formData = ref({
  fullName: '',
  phone: '',
  MainAffiliationName: '',
  subAffiliationName: '',
  fundName: '',
  projectCode: '',
  moneyType: null,
  receiptList: '',
})
const itemNameInstances = ref({})
const errors = ref({})

onMounted(() => {
  // TomSelect สำหรับขอนำส่งเงิน
  const moneyTypeEl = document.getElementById('moneyType')
  if (moneyTypeEl && !moneyTypeEl.tomselect) {
    new TomSelect(moneyTypeEl, {
      create: true,
      sortField: { field: 'text', direction: 'asc' },
      allowEmptyOption: true,
      placeholder: 'รายได้/เงินโครงการ',
      onChange(value) {
        formData.value.moneyType = value
      },
    })
    applyCSSToTomSelect(moneyTypeEl)
  }

  // Initialize TomSelect สำหรับ itemName ในแถวแรก
  morelist.value.forEach((_, i) => {
    initItemNameTomSelect(i)
    initTomSelect(i) // keyword TomSelect
  })
})

// Function สำหรับสร้าง TomSelect ของ itemName
const initItemNameTomSelect = (index) => {
  const elementId = `itemName-${index}`

  // รอให้ DOM render ก่อน
  setTimeout(() => {
    const el = document.getElementById(elementId)

    if (el && !el.tomselect) {
      const tomselect = new TomSelect(el, {
        create: true, // อนุญาตให้สร้างตัวเลือกใหม่
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

// Function สำหรับ apply CSS
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

const mainCategory = ref('')
const subCategory = ref('')
const subOptions = computed(() => {
  return mainCategory.value ? options[mainCategory.value] : []
})

watch(
  morelist,
  (newVal, oldVal) => {
    if (newVal.length > oldVal.length) {
      const newIndex = newVal.length - 1
      initItemNameTomSelect(newIndex) // 👈 เพิ่มบรรทัดนี้
      initTomSelect(newIndex)
    }
  },
  { deep: true },
)
const formatNumber = (num) => {
  return Number(num).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}


const saveData = async () => {
  // รีเซ็ต error
  errors.value = {}
  let hasError = false

  // ---------- Validation ฟอร์มหลัก ----------
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
  if (!formData.value.moneyType) {
    errors.value.moneyType = 'กรุณาเลือก "ขอนำส่งเงิน"'
    hasError = true
  }
  if (!formData.value.projectCode) {
    errors.value.projectCode = 'กรุณากรอก "รหัสโครงงาน"'
    hasError = true
  }
  errors.value.rows = {}
  morelist.value.forEach((row, index) => {
    const rowErrors = {}
    if (!row.itemName) rowErrors.itemName = 'กรุณากรอก "ชื่อรายการ"'
    if (!row.note) rowErrors.note = 'กรุณากรอก "หมายเหตุ"'
    if (!row.fee) rowErrors.fee = 'กรุณากรอก "ค่าธรรมเนียม"'
    if (!row.keyword) rowErrors.keyword = 'กรุณากรอก "keyword"'

    // เช็ค selectedItems
    if (!row.selectedItems || row.selectedItems.filter((i) => i.checked).length === 0) {
      rowErrors.selectedItems = 'กรุณาเลือก "จำนวนเงิน" อย่างน้อย 1 รายการ'
    } else if (row.selectedItems.some((i) => i.checked && !i.amount)) {
      rowErrors.selectedItems = 'กรุณากรอกจำนวนเงินให้ครบถ้วน'
    }

    if (Object.keys(rowErrors).length > 0) {
      errors.value.rows[index] = rowErrors
      hasError = true
    }
  })

  if (hasError) return

  // สร้าง payload ที่มีข้อมูลครบถ้วน
  const payload = {
    // ข้อมูลผู้บันทึก
    fullName: formData.value.fullName,
    phone: formData.value.phone,
    
    // ข้อมูลหน่วยงาน
    mainAffiliationName: mainCategory.value,
    subAffiliationName: subCategory.value,
    
    // ข้อมูลกองทุนและโครงการ
    fundName: formData.value.fundName,
    moneyType: formData.value.moneyType,
    projectCode: formData.value.projectCode,
    netTotalAmount: netTotalAmount.value,
    receiptList: morelist.value.map(row => {
      const rowTotal = row.selectedItems?.reduce((sum, item) => {
        return item.checked ? sum + (Number(item.amount) || 0) : sum
      }, 0) || 0

      const rowFee = Number(row.fee) || 0
      const rowNetAmount = rowTotal - rowFee

      return {
        itemName: row.itemName,
        note: row.note || '',
        fee: rowFee,
        keyword: Array.isArray(row.keyword) ? row.keyword : (row.keyword ? [row.keyword] : []),
        subtotal: rowTotal,
        netAmount: rowNetAmount,
        paymentDetails: row.selectedItems
          ?.filter(item => item.checked)
          .map(item => ({
            type: item.type || item.paymentType || 'ไม่ระบุ',
            amount: Number(item.amount) || 0,
            referenceNo: item.referenceNo || '',
            checkNumber: item.checkNumber || item.NumCheck || null,
            accountNumber: item.accountNumber || item.AccountNum || null,
            accountName: item.accountName || item.AccountName || null
          })) || []
      }
    })
  }
axios.post('/saveReceipt', payload)
  .then(res => {
    console.log('บันทึกสำเร็จ:', res.data)
  })
  .catch(err => {
    if (err.response) {
      // server ตอบแล้ว แต่ error
      console.error('Status:', err.response.status)
      console.error('Data:', err.response.data)
    } else if (err.request) {
      // request ส่งไปแล้ว แต่ไม่มี response
      console.error('No response received:', err.request)
    } else {
      // error อื่นๆ
      console.error('Error', err.message)
    }
  })

}

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

watch(
  [formData, mainCategory, subCategory],
  ([newFormData]) => {
    // Clear errors สำหรับ formData
    for (const key in newFormData) {
      if (errors.value[key] && newFormData[key]) {
        delete errors.value[key]
      }
    }
  },
  { deep: true },
)
</script>

<style lang="scss" scoped></style>
