<template>
  <div class="text-slate-700 antialiased selection:bg-blue-200 selection:text-blue-900">
    <div id="app" class="relative w-full flex h-screen">
      <div class="mesh-bg"></div>
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <sidebar />
      <main class="flex-1 flex flex-col relative z-10">
        <header class="h-16 flex items-center justify-between px-8 pt-4 pb-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <i class="ph ph-file-plus"></i>
              {{ isEditMode ? 'แก้ไขใบนำส่ง' : 'เพิ่มใบนำส่ง' }}
            </h1>
            <p class="text-xs text-slate-800 mt-0.5">
              {{ isEditMode ? `รหัส: ${formData.projectCode}` : 'กรอกข้อมูลใบนำส่งเงิน' }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button
              class="w-10 h-10 rounded-full glass-input flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm"
            >
              <i class="ph ph-bell text-xl"></i>
            </button>
            <button
              class="w-10 h-10 rounded-full glass-input flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm"
            >
              <i class="ph ph-gear text-xl"></i>
            </button>
          </div>
        </header>
        <div v-if="isLoading" class="flex-1 flex justify-center items-center">
          <div class="glass-panel rounded-2xl p-8 flex flex-col items-center gap-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p class="text-slate-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
        <div v-else class="flex-1 overflow-y-auto px-8 pb-8">
          <div class="max-w-6xl mx-auto space-y-6">
            <div class="glass-panel rounded-2xl p-6 shadow-lg space-y-4">
              <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <span class="w-1 h-6 bg-blue-500 rounded-full"></span>ข้อมูลผู้บันทึก
              </h2>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-slate-700"
                    >ข้าพเจ้า <span class="text-red-500">*</span></label
                  >
                  <InputText
                    v-model="formData.fullName"
                    placeholder="กรอกชื่อ-นามสกุล"
                    class="glass-input"
                  />
                  <span v-if="errors.fullName" class="text-red-600 text-xs">{{
                    errors.fullName
                  }}</span>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-slate-700"
                    >เบอร์โทรติดต่อ <span class="text-red-500">*</span></label
                  >
                  <InputText
                    v-model="formData.phone"
                    placeholder="xxx-xxxx-xxx"
                    class="glass-input"
                    @keypress="allowOnlyDigits"
                  />
                  <span v-if="errors.phone" class="text-red-600 text-xs">{{ errors.phone }}</span>
                </div>
                <div>
                  <label class="text-sm font-medium text-slate-700"
                    >หน่วยงาน <span class="text-red-500">*</span></label
                  >
                  <select
                    v-model="mainCategory"
                    class="glass-input h-[44px] w-full rounded-xl px-3 text-sm"
                  >
                    <option value="" disabled>เลือกหน่วยงาน</option>
                    <option v-for="(sub, key) in options" :key="key" :value="key">{{ key }}</option>
                  </select>
                  <span v-if="errors.mainCategory" class="text-red-600 text-xs">{{
                    errors.mainCategory
                  }}</span>
                </div>
                <div>
                  <label class="text-sm font-medium text-slate-700"
                    >หน่วยงานย่อย <span class="text-red-500">*</span></label
                  >
                  <select
                    v-model="subCategory"
                    class="glass-input h-[44px] w-full rounded-xl px-3 text-sm"
                  >
                    <option value="" disabled>เลือกหน่วยงาน</option>
                    <option v-for="item in subOptions" :key="item" :value="item">{{ item }}</option>
                  </select>
                  <span v-if="errors.subCategory" class="text-red-600 text-xs">{{
                    errors.subCategory
                  }}</span>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-slate-700"
                    >กองทุน <span class="text-red-500">*</span></label
                  >
                  <Selects
                    v-model="formData.fundName"
                    :options="['กองทุนทั่วไป', 'กองทุนพิเศษ']"
                    placeholder="เลือกกองทุน"
                    value-type="string"
                    class="glass-select"
                  />
                  <span v-if="errors.fundName" class="text-red-600 text-xs">{{
                    errors.fundName
                  }}</span>
                </div>
                <div class="flex flex-col gap-2 ">
                  <label class="text-sm font-medium text-slate-700"
                    >ขอนำส่งเงิน <span class="text-red-500">*</span></label
                  >
                  <SendMoneySelect
                  class="-mt-2"
                    ref="sendmoneySelectRef"
                    v-model="formData.sendmoney"
                    input-id="sendmoney"
                    placeholder="เลือกประเภท"
                    :required="true"
                    :error-message="errors.sendmoney"
                    :options="[
                      { value: 'รายได้', text: 'รายได้' },
                      { value: 'เงินโครงการ', text: 'เงินโครงการ' },
                    ]"
                    :create-new-option="true"
                    @change="clearError('sendmoney')"
                  />
                  <span v-if="errors.sendmoney" class="text-red-600 text-xs">{{
                    errors.sendmoney
                  }}</span>
                </div>
                <div class="flex flex-col gap-2 lg:col-span-2">
                  <label class="text-sm font-medium text-slate-700"
                    >รหัสโครงงาน <span class="text-red-500">*</span></label
                  >
                  <InputText
                    v-model="formData.projectCode"
                    placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ"
                    class="glass-input"
                    :class="{ 'readonly-force': isEditMode }"
                  />
                  <span v-if="errors.projectCode" class="text-red-600 text-xs">{{
                    errors.projectCode
                  }}</span>
                </div>
              </div>
            </div>
            <div class="glass-panel rounded-2xl p-6 shadow-lg space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <span class="w-1 h-6 bg-green-500 rounded-full"></span>รายการนำส่งเงิน
                </h2>
                <span class="text-xs text-slate-600 bg-white/60 px-3 py-1 rounded-full"
                  >{{ morelist.length }} รายการ</span
                >
              </div>
              <div
                class="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 px-2 pb-2 border-b border-white/40 items-center text-center"
              >
                <div class="text-xs font-semibold text-slate-600 uppercase">รายการ</div>
                <div class="text-xs font-semibold text-slate-600 uppercase">จำนวนเงิน</div>
                <div class="text-xs font-semibold text-slate-600 uppercase">ค่าธรรมเนียม</div>
                <div class="text-xs font-semibold text-slate-600 uppercase">หมายเหตุ</div>
              </div>
              <div class="space-y-4">
                <div
                  v-for="(row, index) in morelist"
                  :key="row.id"
                  class="bg-white/40 rounded-xl p-4 border border-white/50 hover:bg-white/60 transition-all"
                >
                  <div
                    class="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-start"
                  >
                    <div class="flex flex-col gap-2">
                      <ItemNameSelect
                        v-model="row.itemName"
                        :input-id="`itemName-${index}`"
                        @input="() => clearRowError(index, 'itemName')"
                      />
                      <span v-if="errors.rows?.[index]?.itemName" class="text-red-600 text-xs">{{
                        errors.rows[index].itemName
                      }}</span>
                    </div>
                    <div class="flex flex-col gap-2 mt-2">
                      <button
                        class="glass-button-primary px-4 py-2 rounded-md text-sm transition-all active:scale-95 h-[42px]"
                        @click="openModalForRow(index)"
                      >
                        จำนวนเงินรวม
                      </button>

                      <span
                        v-if="errors.rows?.[index]?.selectedItems"
                        class="text-red-600 text-xs"
                        >{{ errors.rows[index].selectedItems }}</span
                      >
                    </div>
                    <div class="flex flex-col gap-1.5 mt-2">
                      <InputText
                        v-model="row.fee"
                        placeholder="ค่าธรรมเนียม"
                        class="glass-input w-full"
                        @keypress="allowOnlyDigits"
                        @input="() => clearRowError(index, 'fee')"
                      />
                    </div>
                    <div class="flex flex-col gap-1.5 mt-2">
                      <InputText
                        v-model="row.note"
                        placeholder="หมายเหตุ"
                        class="glass-input w-full"
                        @input="() => clearRowError(index, 'note')"
                      />
                      <span v-if="errors.rows?.[index]?.note" class="text-red-600 text-xs">{{
                        errors.rows[index].note
                      }}</span>
                    </div>
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
                  <div v-if="getRowDetail(index)" class="mt-4 border-t border-white/40 pt-4">
                    <div class="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
                      <h4 class="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <i class="ph ph-info text-blue-600"></i>รายละเอียดรายการ
                      </h4>
                      <div v-if="getRowDetail(index).hasItemName" class="mb-3">
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-semibold text-slate-600">ชื่อรายการ:</span>
                          <span class="text-sm font-medium text-slate-800">{{
                            getRowDetail(index).itemName
                          }}</span>
                        </div>
                      </div>
                      <div class="space-y-2 mb-3">
                        <div
                          v-for="(item, itemIdx) in getRowDetail(index).items"
                          :key="itemIdx"
                          class="bg-white rounded p-3 text-sm shadow-sm"
                        >
                          <div class="flex justify-between items-start mb-2">
                            <span
                              class="font-medium px-2 py-1 rounded text-xs"
                              :class="{
                                'bg-green-100 text-green-700': item.type === 'เงินสด',
                                'bg-blue-100 text-blue-700': item.type === 'เช็คธนาคาร',
                                'bg-orange-100 text-orange-700': item.type === 'ฝากเข้าบัญชี',
                                'bg-gray-100 text-gray-700': !item.type,
                              }"
                              >{{ item.type || 'ไม่ระบุประเภท' }}</span
                            >
                            <span class="font-bold text-slate-800"
                              >{{ formatNumber(item.amount) }} ฿</span
                            >
                          </div>
                          <div class="space-y-1 text-xs text-slate-600 ml-2">
                            <div
                              v-if="item.type === 'เช็คธนาคาร' && item.checkNumber"
                              class="flex justify-between"
                            >
                              <span>เลขที่เช็ค:</span
                              ><span class="font-medium">{{ item.checkNumber }}</span>
                            </div>
                            <template v-if="item.type === 'ฝากเข้าบัญชี'">
                              <div v-if="item.accountName" class="flex justify-between">
                                <span>ชื่อบัญชี:</span
                                ><span class="font-medium">{{ item.accountName }}</span>
                              </div>
                              <div v-if="item.accountNumber" class="flex justify-between">
                                <span>เลขบัญชี:</span
                                ><span class="font-medium">{{ item.accountNumber }}</span>
                              </div>
                              <div v-if="item.bankName" class="flex justify-between">
                                <span>ธนาคาร:</span
                                ><span class="font-medium">{{ item.bankName }}</span>
                              </div>
                            </template>
                            <div class="flex justify-between">
                              <span>เลขที่อ้างอิง:</span
                              ><span class="font-medium">{{ item.referenceNo || '–' }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="border-t border-blue-200 pt-3 space-y-2">
                        <div class="flex justify-between items-center text-sm">
                          <span class="text-slate-600">ยอดรวม:</span
                          ><span class="font-semibold text-slate-800"
                            >{{ formatNumber(getRowDetail(index).subtotal) }} ฿</span
                          >
                        </div>
                        <div
                          v-if="getRowDetail(index).fee && getRowDetail(index).fee > 0"
                          class="flex justify-between items-center text-sm"
                        >
                          <span class="text-slate-600">ค่าธรรมเนียม:</span
                          ><span class="font-semibold text-red-600"
                            >- {{ formatNumber(getRowDetail(index).fee) }} ฿</span
                          >
                        </div>
                        <div
                          v-if="getRowDetail(index).note"
                          class="flex justify-between items-center text-sm"
                        >
                          <span class="text-slate-600">หมายเหตุ:</span
                          ><span class="text-slate-700 italic">{{ getRowDetail(index).note }}</span>
                        </div>
                        <div class="border-t border-blue-300 my-2"></div>
                        <div class="flex justify-between items-center">
                          <span class="font-bold text-slate-800">ยอดสุทธิ:</span>
                          <span
                            class="font-bold text-lg"
                            :class="
                              getRowDetail(index).netAmount >= 0 ? 'text-green-600' : 'text-red-600'
                            "
                            >{{ formatNumber(getRowDetail(index).netAmount) }} ฿</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                @click="addRow"
                class="w-full py-3 px-4 border-2 border-dashed border-white/50 rounded-xl text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:bg-white/30 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <i class="ph ph-plus-circle text-xl"></i>เพิ่มรายการ
              </button>
            </div>
            <div
              v-if="
                morelist.some(
                  (row) => row.itemName && row.selectedItems?.some((item) => item.checked),
                )
              "
              class="glass-panel rounded-2xl p-6 shadow-lg"
            >
              <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <i class="ph ph-clipboard-text text-blue-600 text-xl"></i>สรุปรายการทั้งหมด
              </h3>
              <div class="space-y-3">
                <div
                  v-for="(row, index) in morelist"
                  :key="row.id"
                  v-show="row.itemName && row.selectedItems?.some((item) => item.checked)"
                  class="flex justify-between items-center py-3 border-b border-white/40 last:border-b-0"
                >
                  <div class="flex items-center gap-3">
                    <span
                      class="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold"
                      >{{ index + 1 }}</span
                    >
                    <div>
                      <div class="font-medium text-slate-800">{{ row.itemName }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-semibold text-slate-800 font-mono">
                      {{ formatNumber(getRowDetail(index)?.netAmount || 0) }} ฿
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="glass-panel rounded-2xl p-6 shadow-lg bg-gradient-to-br from-purple-500/20 to-purple-700/20"
            >
              <div class="flex justify-between items-center">
                <span class="text-2xl font-bold text-slate-800">ยอดสุทธิทั้งหมด</span>
                <span class="text-3xl font-bold text-purple-700 font-mono"
                  >{{ formatNumber(netTotalAmount) }} บาท</span
                >
              </div>
            </div>
            <div
              class="bg-yellow-50/80 backdrop-blur-sm border border-yellow-300 rounded-xl p-4 shadow-sm"
            >
              <p class="text-sm text-yellow-900 m-0 flex items-start gap-2">
                <i class="ph ph-warning text-xl flex-shrink-0 mt-0.5"></i>
                <span
                  ><strong>หมายเหตุ:</strong> กรุณาตรวจสอบข้อมูลให้ถูกต้องและครบถ้วนก่อนกด{{
                    isEditMode ? 'อัพเดต' : 'บันทึก'
                  }}ข้อมูล (ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก)</span
                >
              </p>
            </div>
            <div class="flex justify-end gap-3 pb-4">
              <button
                @click="gotomainpage"
                class="px-6 py-3 rounded-xl bg-white/60 backdrop-blur-sm text-slate-700 hover:bg-white/80 border border-white/60 transition-all shadow-sm"
              >
                <i class="ph ph-arrow-left mr-2"></i>กลับ
              </button>
              <button
                @click="saveData"
                :disabled="reciptStore.loading || isLoading"
                class="glass-button-primary px-6 py-3 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <i class="ph ph-floppy-disk mr-2"></i>{{ isEditMode ? 'อัพเดต' : 'บันทึก' }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

        <Teleport to="body">
      <div v-if="showModal !== null" class="modal-portal-container">
        <Modal
          :show="true"
          :items="rowItems[showModal]"
          @close="showModal = null"
          @input="() => clearRowError(showModal, 'selectedItems')"
          @update:selected="(selected) => updateSelectedItems(showModal, selected)"
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import TomSelect from 'tom-select'
import 'tom-select/dist/css/tom-select.css'
import Selects from '@/components/input/select/select.vue'
import InputText from '@/components/input/inputtext.vue'
import Modal from '@/components/modal/modalwaybill.vue'
import ItemNameSelect from '@/components/TomSelect/ItemNameSelect.vue'
import SendMoneySelect from '@/components/TomSelect/SendMoneyTomSelect.vue'
import sidebar from '@/components/bar/sidebar.vue'
// Stores & Composables
import { useReceiptStore } from '@/stores/recipt'
import { useRowManager } from '@/components/Function/FuncForm'
import { setupAxiosMock } from '@/fake/mockAxios'

// Initialize
const route = useRoute()
const router = useRouter()
const reciptStore = useReceiptStore()
setupAxiosMock()

// Check if edit mode
const isEditMode = computed(() => !!route.params.id)
const receiptId = computed(() => route.params.id)
const isLoading = ref(false)

// Form data
const formData = ref({
  fullName: '',
  phone: '',
  MainAffiliationName: '',
  subAffiliationName: '',
  fundName: '',
  projectCode: '',
  sendmoney: '',
  receiptList: '',
})

const {
  allowOnlyDigits,
  netTotalAmount,
  getRowDetail,
  morelist,
  addRow,
  removeRow,
  openModalForRow,
  updateSelectedItems,
  showModal,
  rowItems,
  initTomSelect,
} = useRowManager()

const itemNameInstances = ref({})
const errors = ref({})
const mainCategory = ref('')
const subCategory = ref('')

// Options
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

const gotomainpage = () => {
  router.push('/')
}

// Format number
const formatNumber = (num) => {
  return Number(num).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Load receipt data for edit mode
const loadReceiptData = async () => {
  if (!receiptId.value) return

  isLoading.value = true
  try {
    const response = await axios.get(`/getReceipt/${receiptId.value}`)
    const data = response.data

    console.log('Loaded data:', data) // เพิ่ม log เพื่อ debug

    // Populate form data
    formData.value.fullName = data.fullName || ''
    formData.value.phone = data.phone || ''
    formData.value.fundName = data.fundName || ''
    formData.value.projectCode = data.projectCode || ''

    mainCategory.value = data.mainAffiliationName || ''
    subCategory.value = data.subAffiliationName || ''

    // *** แก้ไขส่วนนี้ ***
    // ดึงค่า sendmoney โดยตรง
    const moneyTypeValue = data.sendmoney || data.moneyType || ''
    console.log('Money type value:', moneyTypeValue) // เพิ่ม log

    formData.value.sendmoney = moneyTypeValue

    // Populate receipt list
    if (data.receiptList && data.receiptList.length > 0) {
      morelist.value = data.receiptList.map((item, index) => ({
        id: index + 1,
        itemName: item.itemName || '',
        note: item.note || '',
        fee: item.fee || 0,
        selectedItems:
          item.paymentDetails?.map((detail) => ({
            checked: true,
            moneyType: detail.moneyType || '',
            amount: detail.amount || 0,
            referenceNo: detail.referenceNo || '',
            checkNumber: detail.checkNumber || '',
            accountName: detail.accountName || '',
            accountNumber: detail.accountNumber || '',
            bankName: detail.bankName || '',
          })) || [],
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
      router.push('/')
    })
  } finally {
    isLoading.value = false
  }
}
// Initialize TomSelect
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

// Clear row error
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

// Save data
const saveData = async () => {
  errors.value = {}
  let hasError = false

  // Validation
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

  errors.value.rows = {}
  morelist.value.forEach((row, index) => {
    const rowErrors = {}
    if (!row.itemName) rowErrors.itemName = 'กรุณากรอก "ชื่อรายการ"'
    if (!row.note) rowErrors.note = 'กรุณากรอก "หมายเหตุ"'

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

  Swal.fire({
    title: isEditMode.value ? 'กำลังอัพเดตข้อมูล...' : 'กำลังบันทึกข้อมูล...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })
  const currentDateTime = new Date().toISOString()

  const payload = {
    fullName: formData.value.fullName,
    moneyTypeNote: 'Waybill',
    phone: formData.value.phone,
    mainAffiliationName: mainCategory.value,
    subAffiliationName: subCategory.value,
    fundName: formData.value.fundName,
    moneyType: formData.value.sendmoney,
    projectCode: formData.value.projectCode,
    sendmoney: formData.value.sendmoney,
    netTotalAmount: netTotalAmount.value,
    receiptList: morelist.value.map((row) => {
      const rowTotal =
        row.selectedItems?.reduce((sum, item) => {
          return item.checked ? sum + (Number(item.amount) || 0) : sum
        }, 0) || 0

      const rowFee = Number(row.fee) || 0
      const rowNetAmount = rowTotal - rowFee

      return {
        itemName: row.itemName,
        note: row.note || '',
        fee: rowFee,
        subtotal: rowTotal,
        amount: rowNetAmount,
        paymentDetails:
          row.selectedItems
            ?.filter((item) => item.checked)
            .map((item) => ({
              moneyType: item.moneyType,
              amount: Number(item.amount) || 0,
              referenceNo: item.referenceNo || '',
              checkNumber: item.checkNumber || item.NumCheck || null,
              accountName: item.accountName || item.AccountName || null,
              accountNumber: item.accountNumber || item.AccountNum || null,
              bankName: item.bankName || item.BankName || null,
            })) || [],
      }
    }),
  }
  // เพิ่ม createdAt และ updatedAt
  if (isEditMode.value) {
    // กรณีแก้ไข: เพิ่มเฉพาะ updatedAt (createdAt จะเก็บไว้เดิมที่ backend)
    payload.updatedAt = currentDateTime
  } else {
    // กรณีสร้างใหม่: เพิ่มทั้ง createdAt และ updatedAt
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
      text: `${isEditMode.value ? 'อัพเดต' : 'บันทึก'}ใบนำส่งเงิน ${formData.value.projectCode} เรียบร้อยแล้ว`,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#7E22CE',
      timer: 2000,
      timerProgressBar: true,
    })

    router.push('/')
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

// แก้ไข onMounted
onMounted(async () => {
  // Initialize TomSelect for sendmoney first

  morelist.value.forEach((_, i) => {
    initItemNameTomSelect(i)
    initTomSelect(i)
  })

  // รอให้ TomSelect พร้อมใช้งาน
  await nextTick()

  // Load data if edit mode
  if (isEditMode.value) {
    await loadReceiptData()
  }
})

// Watch for new rows
watch(
  morelist,
  (newVal, oldVal) => {
    if (newVal.length > oldVal.length) {
      const newIndex = newVal.length - 1
      initItemNameTomSelect(newIndex)
      initTomSelect(newIndex)
    }
  },
  { deep: true },
)

// Watch for form changes to clear errors
watch(
  () => [formData.value, mainCategory.value, subCategory.value],
  () => {
    // Clear errors for formData
    for (const key in formData.value) {
      if (errors.value[key] && formData.value[key]) {
        delete errors.value[key]
      }
    }

    // Clear errors for mainCategory
    if (errors.value.mainCategory && mainCategory.value) {
      delete errors.value.mainCategory
    }

    // Clear errors for subCategory
    if (errors.value.subCategory && subCategory.value) {
      delete errors.value.subCategory
    }
  },
  { deep: true },
)
</script>

<style lang="scss" scoped>
/* Animated Background Mesh */
.mesh-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
  background-image:
    radial-gradient(at 0% 0%, hsla(253, 16%, 7%, 1) 0, transparent 50%),
    radial-gradient(at 50% 0%, hsla(225, 39%, 30%, 1) 0, transparent 50%),
    radial-gradient(at 100% 0%, hsla(339, 49%, 30%, 1) 0, transparent 50%);
  background-size: cover;
  z-index: -2;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: -1;
  opacity: 0.8;
  animation: float 10s infinite ease-in-out;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: #56ccf2;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: #ac32e4;
  bottom: -50px;
  right: -100px;
  animation-delay: 2s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: #7918f2;
  top: 40%;
  left: 40%;
  animation-delay: 4s;
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(20px, 40px) rotate(10deg);
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
}

/* Glassmorphism Utilities */
.glass-panel {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

.glass-input {
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.8);
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.glass-button-primary {
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
}

.glass-button-primary:hover {
  box-shadow: 0 6px 20px rgba(126, 34, 206, 0.4);
  transform: translateY(-1px);
}

/* Readonly Input Force Style */
.readonly-force input {
  pointer-events: none;
  background-color: #e9ecef !important;
  color: #6c757d !important;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

.swal2-container {
    z-index: 99999 !important;
}

.swal2-popup {
    z-index: 100000 !important;
}

.swal2-overlay {
    z-index: 99998 !important;
}

/* ถ้าใช้ Custom Modal */
[role="dialog"] {
    z-index: 99999 !important;
}
</style>
