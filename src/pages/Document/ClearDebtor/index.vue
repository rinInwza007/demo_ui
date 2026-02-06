<template>
  <div class="text-slate-700 antialiased selection:bg-blue-200 selection:text-blue-900">
    <div id="app" class="relative w-full h-screen flex">
      <!-- Background Elements -->
      <div class="mesh-bg"></div>
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>

      <!-- Sidebar -->
      <sidebar />

      <!-- Main Content -->
      <main class="flex-1 flex flex-col relative z-10 min-h-0">
        <!-- Header Bar -->
        <header class="h-16 flex items-center justify-between px-8 pt-4 pb-2 flex-shrink-0">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <i class="ph ph-receipt"></i>
              รายละเอียดหนี้รวม
            </h1>
            <p class="text-xs text-slate-800 mt-0.5">จัดการและติดตามรายละเอียดหนี้จากหลายหน่วยงาน</p>
          </div>
          <div class="flex items-center gap-3">
            <button class="w-10 h-10 rounded-full glass-input flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm">
              <i class="ph ph-bell text-xl"></i>
            </button>
            <button class="w-10 h-10 rounded-full glass-input flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm">
              <i class="ph ph-gear text-xl"></i>
            </button>
          </div>
        </header>

        <!-- Content Area -->
        <div class="flex-1 px-8 pb-8 overflow-y-auto">
          <div class="max-w-7xl mx-auto space-y-6">

            <!-- ✅ Form สำหรับกรอกข้อมูล -->
            <div class="glass-panel rounded-2xl p-6 shadow-lg space-y-4">
              <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span class="w-1 h-6 bg-blue-500 rounded-full"></span>
                ข้อมูลผู้ทำรายการ
              </h2>

              <!-- แถวที่ 1: เลขที่นำส่ง | ชื่อ -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    เลขที่นำส่ง <span class="text-red-500">*</span>
                  </label>
                  <InputText
                    v-model="formData.waybillNumber"
                    placeholder="เลขที่นำส่ง"
                    readonly
                    class="transition-all duration-200 "
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    ข้าพเจ้า <span class="text-red-500">*</span>
                  </label>
                  <InputText
                    v-model="formData.fullName"
                    placeholder="กรอกชื่อ-นามสกุล"
                    class="transition-all duration-200"
                  />
                </div>
              </div>

              <!-- แถวที่ 2: เบอร์โทรศัพท์ | หน่วยงาน -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    เบอร์โทรติดต่อ <span class="text-red-500">*</span>
                  </label>
                  <InputText
                    v-model="formData.phone"
                    placeholder="xxx-xxxx-xxx"
                    maxlength="12"
                    class="transition-all duration-200"
                    @keypress="allowOnlyDigits"
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">
                    หน่วยงาน <span class="text-red-500">*</span>
                  </label>
                  <Selects
                    v-model="mainCategory"
                    :options="mainCategoryOptions"
                    placeholder="เลือกหน่วยงาน"
                    value-type="string"
                  />
                </div>
              </div>

              <!-- กรณีไม่มีหน่วยงานรอง -->
              <template v-if="!hasAnySub">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
                      :options="[
                        { value: 'รายได้', text: 'รายได้' },
                        { value: 'เงินโครงการ', text: 'เงินโครงการ' },
                      ]"
                      :create-new-option="true"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                      รหัสโครงงาน <span class="text-red-500">*</span>
                    </label>
                    <InputText
                      v-model="formData.projectCode"
                      placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ"
                    />
                  </div>
                  <div></div>
                </div>
              </template>

              <!-- กรณีมีหน่วยงานรองแต่ไม่มีหน่วยงานย่อย -->
              <template v-if="hasAnySub && !hasSub2">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                      หน่วยงานรอง <span class="text-red-500">*</span>
                    </label>
                    <Selects
                      v-model="subCategory"
                      :options="sub1OptionsForSelect"
                      option-label="label"
                      option-value="value"
                      placeholder="เลือกหน่วยงานรอง"
                      value-type="string"
                    />
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
                  </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
                      :options="[
                        { value: 'รายได้', text: 'รายได้' },
                        { value: 'เงินโครงการ', text: 'เงินโครงการ' },
                      ]"
                      :create-new-option="true"
                      class="mt-[2.5px]"
                    />
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                      รหัสโครงงาน <span class="text-red-500">*</span>
                    </label>
                    <InputText
                      v-model="formData.projectCode"
                      placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ"
                    />
                  </div>
                </div>
              </template>

              <!-- กรณีมีหน่วยงานรองและหน่วยงานย่อย -->
              <template v-if="hasSub2">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                      หน่วยงานรอง <span class="text-red-500">*</span>
                    </label>
                    <Selects
                      v-model="subCategory"
                      :options="sub1OptionsForSelect"
                      option-label="label"
                      option-value="value"
                      placeholder="เลือกหน่วยงานรอง"
                      value-type="string"
                    />
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                      หน่วยงานย่อย <span class="text-red-500">*</span>
                    </label>
                    <Selects
                      v-model="subCategory2"
                      :options="sub2OptionsForSelect"
                      option-label="label"
                      option-value="value"
                      placeholder="เลือกหน่วยงานย่อย"
                      value-type="string"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
                      :options="[
                        { value: 'รายได้', text: 'รายได้' },
                        { value: 'เงินโครงการ', text: 'เงินโครงการ' },
                      ]"
                      :create-new-option="true"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                      รหัสโครงงาน <span class="text-red-500">*</span>
                    </label>
                    <InputText
                      v-model="formData.projectCode"
                      placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ"
                    />
                  </div>
                  <div></div>
                </div>
              </template>
            </div>

            <!-- ✅ สรุปจำนวนหน่วยงานและยอดรวม -->
            <div class="glass-panel rounded-2xl p-6 shadow-lg">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-slate-900">
                  จำนวนหน่วยงาน
                </h2>
                <span class="text-xl font-bold text-slate-900">
                  {{ groupedReceipts.length }} หน่วยงาน
                </span>
              </div>
              <div class="flex items-center justify-between mt-4 pt-4 border-t border-white/40">
                <span class="text-base text-slate-700">ยอดหนี้รวมทั้งหมด</span>
                <span class="text-2xl font-bold text-red-600">
                  {{ formatMoney(totalDebt) }} บาท
                </span>
              </div>
              <div class="flex items-center justify-between mt-2">
                <span class="text-base text-slate-700">จำนวนรายการทั้งหมด</span>
                <span class="text-xl font-bold text-slate-900">
                  {{ totalItemsCount }} รายการ
                </span>
              </div>
            </div>

            <!-- ✅ ตารางรายละเอียดหนี้แบ่งกลุ่มตาม waybillNumber -->
            <div
              v-for="(group, index) in groupedReceipts"
              :key="group.waybillNumber"
              class="glass-panel rounded-2xl shadow-lg overflow-hidden"
            >
              <!-- หัวข้อกลุ่ม -->
              <div class="px-6 py-4 bg-white/30 border-b border-white/40">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-bold text-slate-900">
                    {{ group.department }}
                  </h3>
                  <span class="text-lg font-bold text-red-600">
                    {{ formatMoney(group.totalAmount) }} บาท
                  </span>
                </div>
                <p class="text-sm text-slate-600 mt-1">
                  {{ group.items.length }} รายการ - {{ group.waybillNumber }}
                </p>
              </div>

              <!-- Table Header -->
              <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-white/10 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div class="col-span-2">เลขที่ใบเสร็จ</div>
                <div class="col-span-3">รายการ</div>
                <div class="col-span-2 text-right">หนี้</div>
                <div class="col-span-3 text-right">จำนวนเงินที่ชำระ</div>
                <div class="col-span-2">หมายเหตุ</div>
              </div>

              <!-- รายการ Items -->
              <div class="pb-2">
                <div
                  v-for="item in group.items"
                  :key="item.id"
                  class="group grid grid-cols-12 gap-4 px-6 py-4 items-center transition-all duration-200 border-b border-white/20 hover:bg-white/30"
                >
                  <!-- Receipt Number -->
                  <div class="col-span-2">
                    <input
                      type="text"
                      v-model="item.receiptNumber"
                      class="glass-input w-full px-3 py-2 rounded-md text-sm"
                      placeholder="เลขที่ใบเสร็จ"
                    />
                  </div>

                  <!-- Item Name -->
                  <div class="col-span-3">
                    <div class="font-medium text-slate-800 text-sm">{{ item.itemName }}</div>
                  </div>

                  <!-- Debt Amount -->
                  <div class="col-span-2 text-right">
                    <span class="font-bold text-red-600 font-mono text-sm whitespace-nowrap">
                      {{ formatMoney(item.debtorAmount) }}
                    </span>
                  </div>

                  <!-- Payment Input -->
                  <div class="col-span-3 flex justify-end">
                    <input
                      type="text"
                      v-model="item.paymentInput"
                      @input="(e) => handlePaymentInputChange(item, e)"
                      @blur="() => formatPaymentInput(item)"
                      class="glass-input w-40 px-3 py-2 rounded-md text-sm text-right"
                      placeholder="0.00"
                    />
                  </div>

                  <!-- Note -->
                  <div class="col-span-2">
                    <input
                      type="text"
                      v-model="item.note"
                      class="glass-input w-full px-3 py-2 rounded-md text-sm"
                      placeholder="หมายเหตุ"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- ยอดที่ต้องชำระ -->
            <div
              class="rounded-xl p-6 shadow-lg mb-6"
              style="background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);"
            >
              <div class="flex flex-col sm:flex-row justify-between items-center gap-2 text-white">
                <div class="flex items-center gap-3">
                  <i class="ph-fill ph-money text-3xl"></i>
                  <span class="text-xl font-bold">ยอดที่ต้องชำระ</span>
                </div>
                <span class="text-3xl font-bold">
                  {{ formatNumber(totalPaymentInput) }} บาท
                </span>
              </div>
            </div>

            <!-- Payment Section -->
            <div class="glass-panel rounded-2xl p-6 shadow-lg">
              <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <span class="w-1 h-6 bg-red-500 rounded-full"></span>การชำระเงิน
              </h2>

              <!-- Payment Methods -->
              <div
                v-for="(bank, index) in bankTransfers"
                :key="bank.id"
                class="bg-white/40 rounded-xl p-4 border border-white/50 transition-all mb-3"
              >
                <div class="grid grid-cols-[1.2fr_1.2fr_1fr_0.2fr] gap-3 items-start">
                  <!-- เลขบัญชี -->
                  <div class="flex flex-col gap-1.5">
                    <BankAccountSelect
                      placeholder="กรอกเลขบัญชี"
                      v-model="bank.accountData"
                      :input-id="`bank-account-${bank.id}`"
                      :error-message="errors.bankTransfers?.[index]?.accountNumber"
                      :bank-account-options="bankAccountOptions"
                      @change="() => clearBankError(index, 'accountNumber', errors)"
                    />
                  </div>

                  <!-- จำนวนเงิน -->
                  <div class="flex items-center gap-2 whitespace-nowrap ml-10 mt-3">
                    <span class="text-sm text-slate-700">จำนวนเงิน</span>
                    <InputText
                      :model-value="formatDisplayPaymentAmount(bank.amount)"
                      @input="(e) => handleBankAmountInput(index, e)"
                      @blur="() => formatBankAmountOnBlur(index)"
                      placeholder="0.00"
                      class="w-40"
                    />
                    <span class="text-sm text-slate-700">บาท</span>
                  </div>

                  <!-- ปุ่มลบ -->
                  <button
                    @click="removeBankTransfer(index)"
                    class="px-3 py-2 mt-5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 self-start"
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

              <!-- ปุ่มเพิ่มรายการธนาคาร -->
              <button
                @click="addBankTransfer"
                class="w-full border-2 border-dashed border-red-500 rounded-lg py-3 text-gray-600 hover:border-red-600 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                เพิ่มรายการธนาคาร
              </button>

              <!-- ยอดรวมที่จะจ่าย -->
              <div
                class="rounded-xl p-6 shadow-lg mb-4 mt-6"
                style="background: linear-gradient(135deg, #A855F7 0%, #7E22CE 100%);"
              >
                <div class="flex flex-col sm:flex-row justify-between items-center gap-2 text-white">
                  <div class="flex items-center gap-3">
                    <i class="ph-fill ph-wallet text-3xl"></i>
                    <span class="text-xl font-bold">ยอดรวมที่จะจ่าย</span>
                  </div>
                  <span class="text-3xl font-bold">
                    {{ formatNumber(totalBankAmount) }} บาท
                  </span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end gap-3">
                <button
                  class="px-8 py-3 rounded-xl font-medium shadow-lg transition-all active:scale-95 hover:shadow-xl"
                  style="background: linear-gradient(135deg, #10B981 0%, #059669 100%);"
                  @click="clearAllDebts"
                >
                  <span class="flex items-center gap-2 text-white">
                    <i class="ph ph-eraser text-lg"></i>
                    ยืนยันการล้างหนี้ทั้งหมด
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import sidebar from '@/components/bar/sidebar.vue'
import BankAccountSelect from '@/components/TomSelect/BankAccountSelect.vue'
import InputText from '@/components/input/inputtext.vue'
import Selects from '@/components/input/select/select.vue'
import SendMoneySelect from '@/components/TomSelect/SendMoneyTomSelect.vue'
import { useBankTransferManager } from '@/components/Function/FuncClear.js'
import { useSummaryStore } from '@/stores/summary'
import { reciptService } from '@/services/ReciptService'
import AffiliationService from '@/services/affiliation/AffiliationService'
import { departmentOptions, initializeDepartmentOptions } from '@/components/data/TSdepartments'

const route = useRoute()
const router = useRouter()
const summaryStore = useSummaryStore()

// Bank Transfer Manager
const {
  bankTransfers,
  addBankTransfer,
  removeBankTransfer,
  handleBankAmountInput,
  formatBankAmountOnBlur,
  formatDisplayBankAmount,
  totalBankAmount,
  formattedTotalBankAmount,
  getBankTransfersData,
} = useBankTransferManager()

const bankAccountOptions = ref([
  {
    accountNumber: '512-1-43488-6',
    bankName: 'ธ.กรุงไทย',
    accountName: 'มหาวิทยาลัยพะเยา สาขาพะเยา'
  },
  {
    accountNumber: '891-2-00225-5',
    bankName: 'ธ.ไทยพาณิชย์',
    accountName: 'มหาวิทยาลัยพะเยา สาขามหาวิทยาลัย'
  }
])

const errors = ref({ bankTransfers: {} })
const receipts = ref([])
const allItems = ref([])

// Form Data
const formData = ref({
  waybillNumber: '',
  fullName: '',
  phone: '',
  affiliationName: '',
  subAffiliationName1: '',
  subAffiliationName2: '',
  fundName: '',
  sendmoney: '',
  projectCode: ''
})

// Category states
const mainCategory = ref('')
const subCategory = ref('')
const subCategory2 = ref('')
const mainCategoryId = ref('')
const subCategoryId = ref('')
const subCategoryId2 = ref('')

// Computed for categories
const mainCategoryOptions = computed(() => {
  if (!departmentOptions.value) return []
  return Object.keys(departmentOptions.value)
})

const sub1OptionsArray = computed(() => {
  if (!mainCategory.value || !departmentOptions.value) return []
  const data = departmentOptions.value[mainCategory.value]
  if (!data || !Array.isArray(data.main)) return []
  return data.main
})

const sub2OptionsArray = computed(() => {
  if (!mainCategory.value || !subCategory.value || !departmentOptions.value) return []
  const data = departmentOptions.value[mainCategory.value]
  if (!data || !Array.isArray(data.subs)) return []
  return data.subs
})

const sub1OptionsForSelect = computed(() =>
  sub1OptionsArray.value.map(opt => ({
    label: opt.name,
    value: opt.id
  }))
)

const sub2OptionsForSelect = computed(() => {
  return sub2OptionsArray.value.map(opt => ({
    label: opt.name,
    value: opt.id ?? opt.name,
  }))
})

const hasAnySub = computed(() => {
  if (!mainCategory.value || !departmentOptions.value) return false
  const data = departmentOptions.value[mainCategory.value]
  if (!data) return false
  const main = data.main
  return main !== null && (typeof main === 'string' || (Array.isArray(main) && main.length > 0))
})

const hasSub2 = computed(() => {
  if (!mainCategory.value || !subCategory.value || !departmentOptions.value) return false
  const data = departmentOptions.value[mainCategory.value]
  if (!data) return false
  const subs = data.subs
  return Array.isArray(subs) && subs.length > 0
})

// Watch categories
watch(mainCategory, (newVal) => {
  if (!departmentOptions.value) return
  const data = departmentOptions.value[newVal]
  mainCategoryId.value = data?.id || ''
  subCategory.value = ''
  subCategoryId.value = ''
  subCategory2.value = ''
  subCategoryId2.value = ''
})

watch(subCategory, (newVal) => {
  if (!newVal) {
    subCategoryId.value = ''
    subCategory2.value = ''
    subCategoryId2.value = ''
    return
  }
  subCategoryId.value = newVal
  subCategory2.value = ''
  subCategoryId2.value = ''
})

watch(subCategory2, (newVal) => {
  if (!newVal) {
    subCategoryId2.value = ''
    return
  }
  subCategoryId2.value = newVal
})

// Helper functions
const allowOnlyDigits = (event) => {
  const charCode = event.which ? event.which : event.keyCode
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    event.preventDefault()
  }
}

const totalDebt = computed(() =>
  allItems.value.reduce((sum, i) => sum + Number(i.debtorAmount || 0), 0)
)

const formatNumber = (num) =>
  Number(num || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })

const formatMoney = formatNumber

const totalItemsCount = computed(() => {
  return receipts.value.reduce((total, receipt) => {
    return total + receipt.items.length
  }, 0)
})

// ✅ จัดกลุ่มรายการตาม waybillNumber
const groupedReceipts = computed(() => {
  const groups = new Map()

  receipts.value.forEach(receipt => {
    receipt.items.forEach(item => {
      const originalReceipt = item._originalReceipt
      const waybillNumber = originalReceipt?.waybillNumber || receipt.waybillNumber

      if (!groups.has(waybillNumber)) {
        groups.set(waybillNumber, {
          waybillNumber,
          department: originalReceipt?.affiliationName || receipt.department,
          subDepartment: originalReceipt?.subAffiliationName1 || receipt.subDepartment,
          items: [],
          totalAmount: 0
        })
      }

      const group = groups.get(waybillNumber)
      group.items.push(item)
      group.totalAmount += Number(item.debtorAmount || 0)
    })
  })

  return Array.from(groups.values())
})

// Load department options
const loadDepartmentOptions = async () => {
  try {
    console.log('🔄 Loading department options from AffiliationService...')
    const options = await AffiliationService.generateDepartmentOptions()

    if (!options || Object.keys(options).length === 0) {
      console.warn('⚠️ No department options generated, using fallback')
      initializeDepartmentOptions()
    }

    console.log('✅ Loaded department options:', Object.keys(departmentOptions.value).length, 'faculties')
  } catch (error) {
    console.error('❌ Error loading department options:', error)
    initializeDepartmentOptions()
  }
}

onMounted(async () => {
  await loadDepartmentOptions()

  const raw = localStorage.getItem('clearDebtorSummary')

  if (!raw) {
    Swal.fire({
      title: 'ไม่พบข้อมูล',
      text: 'กรุณาเลือกรายการลูกหนี้ก่อน',
      icon: 'error',
      confirmButtonColor: '#7E22CE'
    }).then(() => {
      router.push('/indexsavedebtor')
    })
    return
  }

  try {
    const summary = JSON.parse(raw)
    console.log('📦 Raw summary:', summary)

    const baseReceipts = Array.isArray(summary.receipts) ? summary.receipts : []

    if (baseReceipts.length > 0) {
      const firstReceipt = baseReceipts[0]

      formData.value = {
        waybillNumber: firstReceipt.waybillNumber || '',
        fullName: firstReceipt.fullName || '',
        phone: firstReceipt.phone || '',
        affiliationName: firstReceipt.mainAffiliationName || firstReceipt.affiliationName || '',
        subAffiliationName1: firstReceipt.subAffiliationName1 || '',
        subAffiliationName2: firstReceipt.subAffiliationName2 || '',
        fundName: firstReceipt.fundName || '',
        sendmoney: firstReceipt.sendmoney || '',
        projectCode: firstReceipt.projectCode || ''
      }

      if (firstReceipt.mainAffiliationId && firstReceipt.mainAffiliationName) {
        mainCategoryId.value = firstReceipt.mainAffiliationId
        mainCategory.value = firstReceipt.mainAffiliationName
        await nextTick()
      }

      if (firstReceipt.subAffiliationId1) {
        subCategoryId.value = firstReceipt.subAffiliationId1
        subCategory.value = firstReceipt.subAffiliationId1
        await nextTick()
      }

      if (firstReceipt.subAffiliationId2) {
        subCategoryId2.value = firstReceipt.subAffiliationId2
        subCategory2.value = firstReceipt.subAffiliationId2
        await nextTick()
      }
    }

    // ✅ แยกรายการออกแต่ละอัน (ไม่รวมกัน)
    const allSeparatedItems = []

    baseReceipts.forEach(receipt => {
      const receiptItems = (receipt.items || [])
        .filter(item => !item.isClearedDebt)
        .map(item => {
          const debtorAmount = item.debtorAmount != null
            ? Number(item.debtorAmount)
            : Number(item.amount || 0)

          return {
            ...item,
            debtorAmount,
            amount: debtorAmount,
            paymentInput: '',
            _originalReceipt: {
              ...receipt,
              projectCode: receipt.projectCode || receipt.receiptId,
              createdAt: receipt.createdAt || new Date().toISOString()
            }
          }
        })

      allSeparatedItems.push(...receiptItems)
    })

    allItems.value = allSeparatedItems

    console.log('✅ Items (separated):', allSeparatedItems.length)

    const totalDebtorAmount = allSeparatedItems.reduce(
      (sum, i) => sum + Number(i.debtorAmount || 0),
      0
    )

    receipts.value = [{
      receiptId: 'MERGED_ALL',
      waybillNumber: 'MERGED_ALL',
      department: baseReceipts[0]?.mainAffiliationName || baseReceipts[0]?.affiliationName || 'รายการรวมทั้งหมด',
      subDepartment: '',
      items: allSeparatedItems,
      totalDebtorAmount,
      originalDepartment: baseReceipts[0]?.mainAffiliationName || baseReceipts[0]?.affiliationName,
      originalSubDepartment: baseReceipts[0]?.subAffiliationName1,
      fullName: baseReceipts[0]?.fullName || '-',
      phone: baseReceipts[0]?.phone || '-',
      sendmoney: baseReceipts[0]?.sendmoney || '-',
      fundName: baseReceipts[0]?.fundName || '-',
      _allOriginalReceipts: baseReceipts
    }]

    console.log('✅ Final receipts:', receipts.value.length)
    console.log('✅ Total items (separated):', totalItemsCount.value)

  } catch (err) {
    console.error('❌ Error:', err)
    Swal.fire({
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถอ่านข้อมูลได้',
      icon: 'error',
      confirmButtonColor: '#7E22CE'
    }).then(() => {
      router.push('/indexsavedebtor')
    })
  }
})

// Payment Input Handlers
const handlePaymentInputChange = (item, event) => {
  const value = event.target.value.replace(/[^0-9.]/g, '')
  const parts = value.split('.')
  if (parts.length > 2) return
  item.paymentInput = value
}

const formatPaymentInput = (item) => {
  const value = item.paymentInput
  if (!value) {
    item.paymentInput = ''
    return
  }

  const cleanValue = String(value).replace(/,/g, '')
  const numValue = parseFloat(cleanValue)

  if (isNaN(numValue)) {
    item.paymentInput = ''
    return
  }

  item.paymentInput = numValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const totalPaymentInput = computed(() => {
  return receipts.value.reduce((total, receipt) => {
    return total + receipt.items.reduce((sum, item) => {
      const value = item.paymentInput || '0'
      const cleanValue = String(value).replace(/,/g, '')
      return sum + (parseFloat(cleanValue) || 0)
    }, 0)
  }, 0)
})

const formatDisplayPaymentAmount = (value) => formatDisplayBankAmount(value)

const clearBankError = (index, field) => {
  if (errors.value.bankTransfers?.[index]?.[field]) {
    delete errors.value.bankTransfers[index][field]
    if (Object.keys(errors.value.bankTransfers[index]).length === 0) {
      delete errors.value.bankTransfers[index]
    }
  }
}

async function clearAllDebts() {
  const totalPaymentInputValue = totalPaymentInput.value
  const totalBankValue = totalBankAmount.value
  const paymentDifference = Math.abs(totalPaymentInputValue - totalBankValue)

  // ✅ 1. รวบรวมรายการที่จะล้างหนี้
  const itemsToMark: Array<{
    waybillNumber: string
    itemName: string
    paymentAmount: number
    receiptNumber: string
    note: string
  }> = []

  receipts.value.forEach(receipt => {
    receipt.items.forEach((item) => {
      const paymentValue = parseFloat(String(item.paymentInput || '0').replace(/,/g, ''))
      if (paymentValue > 0) {
        const originalReceipt = item._originalReceipt

        const waybillNumber = originalReceipt?._originalWaybillNumber ||
                              originalReceipt?.waybillNumber || ''

        if (!waybillNumber || waybillNumber === 'MERGED_ALL') {
          console.error('❌ Invalid waybillNumber:', {
            itemName: item.itemName,
            found: waybillNumber
          })
          return
        }

        itemsToMark.push({
          waybillNumber,
          itemName: item.itemName,
          paymentAmount: paymentValue,
          receiptNumber: item.receiptNumber || '',
          note: item.note || ''
        })
      }
    })
  })

  console.log('✅ Items to mark:', itemsToMark.length)
  console.log('   Sample:', itemsToMark[0])

  if (itemsToMark.length === 0) {
    await Swal.fire({
      icon: 'warning',
      title: 'ไม่พบรายการ',
      text: 'กรุณากรอกจำนวนเงินที่ต้องการชำระ',
      confirmButtonColor: '#F59E0B'
    })
    return
  }

  // ✅ 2. ตรวจสอบยอดเงิน
  if (paymentDifference > 0.01) {
    await Swal.fire({
      icon: 'error',
      title: 'ยอดไม่ตรงกัน',
      html: `
        <div class="text-left space-y-2">
          <p class="text-gray-700 mb-2">ยอดที่กรอกใน 2 ช่องต้องเท่ากัน</p>
          <hr class="my-3">
          <p class="text-gray-700">
            <span class="font-bold text-blue-600">• ยอดที่ต้องชำระ:</span>
            <span class="float-right">${formatNumber(totalPaymentInputValue)} บาท</span>
          </p>
          <p class="text-gray-700">
            <span class="font-bold text-purple-600">• ยอดรวมที่จะจ่าย:</span>
            <span class="float-right">${formatNumber(totalBankValue)} บาท</span>
          </p>
          <hr class="my-3">
          <p class="text-gray-700">
            <span class="font-bold text-red-600">✗ ส่วนต่าง:</span>
            <span class="float-right font-bold">${formatNumber(paymentDifference)} บาท</span>
          </p>
        </div>
      `,
      confirmButtonText: 'รับทราบ',
      confirmButtonColor: '#DC2626',
      width: '500px',
    })
    return
  }

  // ✅ 3. ยืนยันการล้างหนี้
  const result = await Swal.fire({
    title: 'ยืนยันการล้างหนี้?',
    html: `
      <div class="text-left space-y-2">
        <p class="text-gray-700">ยอดหนี้ทั้งหมด: <span class="font-bold">${formatNumber(totalDebt.value)} บาท</span></p>
        <p class="text-gray-700">ยอดที่จะชำระ: <span class="font-bold text-green-600">${formatNumber(totalPaymentInputValue)} บาท</span></p>
        <p class="text-gray-700">จำนวนรายการที่จะล้าง: <span class="font-bold">${itemsToMark.length} รายการ</span></p>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#10B981',
    cancelButtonColor: '#64748b'
  })

  if (!result.isConfirmed) return

  try {
    console.log('🧹 Starting debt clearing process...')

    // ✅ 4. Import clearSummaryService
    const { clearSummaryService } = await import('@/services/ClearDebtor/clearSummaryService')

    // ✅ 5. เตรียมข้อมูล DebtorItem list
    const debtorList = itemsToMark.map(item => ({
      waybillNumber: item.waybillNumber,
      itemName: item.itemName,
      amount: item.paymentAmount,
      isCleared: true,
      note: item.note || item.receiptNumber || '',
      receiptNumber: item.receiptNumber
    }))

    // ✅ 6. เตรียมข้อมูล payments
    const payments = getBankTransfersData().map(p => ({
      type: 'transfer' as const,
      bankName: p.accountData.bankName,
      accountName: p.accountData.accountName,
      accountNumber: p.accountData.accountNumber,
      amount: p.amount
    }))

    // ✅ 7. เตรียมข้อมูลหน่วยงาน
    const getSubName1 = () => {
      if (!subCategoryId.value) return ''
      const found = sub1OptionsArray.value.find(opt => opt.id === subCategoryId.value)
      return found?.name || ''
    }

    const getSubName2 = () => {
      if (!subCategoryId2.value) return ''
      const found = sub2OptionsArray.value.find(opt => opt.id === subCategoryId2.value)
      return found?.name || ''
    }

    // ✅ 8. สร้าง ClearSummary ผ่าน service
    console.log('💾 Creating clear summary via service...')

    const clearSummary = await clearSummaryService.create({
      fullName: formData.value.fullName,
      phone: formData.value.phone,
      mainAffiliationId: mainCategoryId.value,
      mainAffiliationName: mainCategory.value,
      subAffiliationId1: subCategoryId.value,
      subAffiliationName1: getSubName1(),
      subAffiliationId2: subCategoryId2.value,
      subAffiliationName2: getSubName2(),
      fundName: formData.value.fundName,
      sendmoney: formData.value.sendmoney,
      projectCode: formData.value.projectCode,
      debtorList,
      payments,
      totalAmount: totalPaymentInputValue
    })

    console.log('✅ Clear summary created:', clearSummary.id)

    // ✅ 9. อัพเดท Summary Store
    console.log('🔄 Updating Summary Store...')

    const grouped = new Map()
    itemsToMark.forEach(item => {
      if (!grouped.has(item.waybillNumber)) {
        grouped.set(item.waybillNumber, [])
      }
      grouped.get(item.waybillNumber).push(item)
    })

    let totalMarkedCount = 0

    for (const [waybillNumber, items] of grouped) {
      console.log(`   📝 Processing waybill: ${waybillNumber}`)

      try {
        for (const item of items) {
          const ref = item.receiptNumber || clearSummary.referenceId

          // ✅ อัพเดทใน summary store
          summaryStore.applyDebtClear(waybillNumber, {
            itemName: item.itemName,
            amount: item.paymentAmount,
            ref: ref
          })

          totalMarkedCount++
          console.log(`      ✅ Cleared: ${item.itemName} - ${formatNumber(item.paymentAmount)} บาท`)
        }
      } catch (error) {
        console.error(`❌ Error clearing waybill ${waybillNumber}:`, error)
      }
    }

    console.log(`✅ Total: Marked ${totalMarkedCount} items`)

    // ✅ 10. บันทึกสถานะลง localStorage
    summaryStore.saveToLocalStorage()
    console.log('💾 Summary state saved to localStorage')

    // ✅ 11. Dispatch event
    window.dispatchEvent(new CustomEvent('receipts-updated', {
      detail: { action: 'clear' }
    }))

    // ✅ 12. เคลียร์ localStorage
    localStorage.removeItem('clearDebtorSummary')

    // ✅ 13. แสดงผลสำเร็จ
    await Swal.fire({
      title: 'ล้างหนี้สำเร็จ!',
      html: `
        <div class="text-left space-y-2">
          <p>✅ ทำเครื่องหมายล้างแล้ว: <span class="font-bold text-blue-600">${totalMarkedCount} รายการ</span></p>
          <p>💰 ยอดเงินรวม: <span class="font-bold text-green-600">${formatNumber(totalPaymentInputValue)} บาท</span></p>
          <p>📄 เลขที่อ้างอิง: <span class="font-mono text-sm">${clearSummary.referenceId}</span></p>
        </div>
      `,
      icon: 'success',
      confirmButtonColor: '#10B981'
    })

    router.push('/indexsavedebtor')

  } catch (error) {
    console.error('❌ Error:', error)
    await Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: error.message || 'ไม่สามารถล้างหนี้ได้',
      icon: 'error',
      confirmButtonColor: '#DC2626'
    })
  }
}
</script>

<style scoped>
body {
  font-family: 'Prompt', 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}

.mesh-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
  background-image:
    radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%),
    radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%),
    radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
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

.orb-1 { width: 600px; height: 600px; background: #56CCF2; top: -100px; left: -100px; animation-delay: 0s; }
.orb-2 { width: 500px; height: 500px; background: #AC32E4; bottom: -50px; right: -100px; animation-delay: 2s; }
.orb-3 { width: 400px; height: 400px; background: #7918F2; top: 40%; left: 40%; animation-delay: 4s; }

@keyframes float {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(20px, 40px) rotate(10deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}

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

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.2);
}
</style>
