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

            <!-- Summary Card -->
            <div class="glass-panel rounded-2xl p-6 shadow-lg">
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-white/40 pb-4">
                  <span class="text-sm font-medium text-slate-600">จำนวนหน่วยงาน</span>
                  <span class="text-lg font-semibold text-slate-900">{{ receipts.length }} หน่วยงาน</span>
                </div>

                <div class="flex items-center justify-between border-b border-white/40 pb-4">
                  <span class="text-sm font-medium text-slate-600">ยอดหนี้รวมทั้งหมด</span>
                  <span class="text-2xl font-bold text-red-600">
                    {{ formatMoney(totalDebt) }} <span class="text-base">บาท</span>
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-slate-600">จำนวนรายการทั้งหมด</span>
                  <span class="text-lg font-semibold text-slate-900">
                    {{ allItems.length }} <span class="text-sm text-slate-500">รายการ</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Grouped by Receipt -->
            <div v-for="receipt in receipts" :key="receipt.receiptId" class="glass-panel rounded-2xl shadow-lg overflow-hidden">
              <div class="px-6 py-4 border-b border-white/40 bg-white/20">
                <div class="flex items-center justify-between">
                  <h2 class="text-xl font-bold text-slate-900">{{ receipt.department }}</h2>
                  <span class="text-lg font-bold text-red-600">{{ formatMoney(receipt.totalDebtorAmount) }} บาท</span>
                </div>
                <p class="text-xs text-slate-600 mt-1">{{ receipt.subDepartment }} • {{ receipt.items.length }} รายการ</p>
              </div>

              <!-- Table Header -->
<div class="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/40 bg-white/10 text-xs font-semibold text-slate-500 uppercase tracking-wider">
  <div class="col-span-2">เลขที่ใบเสร็จ</div>
  <div class="col-span-2">รายการ</div>
  <div class="col-span-2">ผู้ทำรายการ</div>
  <div class="col-span-1 text-right">หนี้</div>
  <div class="col-span-3 text-right">จำนวนเงินที่ชำระ</div>
  <div class="col-span-2">หมายเหตุ</div>
</div>
<div
  v-for="item in receipt.items"
  :key="item.id"
  class="group grid grid-cols-12 gap-4 px-6 py-4 mb-2 items-center rounded-xl
         transition-all duration-200 border border-white/50 hover:bg-white/50"
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
  <div class="col-span-2">
    <div class="font-medium text-slate-800 text-sm">{{ item.itemName }}</div>
  </div>

  <!-- Full Name -->
  <div class="col-span-2 flex items-center gap-2">
    <div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 text-white flex items-center justify-center text-[10px] shadow-sm flex-shrink-0">
      {{ (item.responsible || '-').charAt(0) }}
    </div>
    <span class="text-sm text-slate-700 truncate">{{ item.responsible || '-' }}</span>
  </div>

  <!-- Debt Amount -->
  <div class="col-span-1 text-right">
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

            <!-- ยอดที่ต้องชำระ -->
            <div
              class="rounded-xl p-6 shadow-lg mb-6"
              style="background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);"
            >
              <div class="flex flex-col sm:flex-row justify-between items-center gap-2 text-white">
                <div class="flex items-center gap-3">
                  <i class="ph-fill ph-coins text-3xl"></i>
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

              <!-- Payment History -->
              <div v-if="paymentHistory.length > 0" class="space-y-3 mb-6 mt-6">
                <h3 class="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-white/40 pb-3">
                  <i class="ph ph-clock-clockwise text-xl"></i>
                  ประวัติการชำระเงิน
                </h3>

                <div
                  v-for="payment in paymentHistory"
                  :key="payment.id"
                  class="glass-input rounded-xl p-4 hover:shadow-md transition-all"
                >
                  <div class="flex items-center justify-between mb-3">
                    <span
                      class="px-3 py-1 rounded-lg text-xs font-medium border"
                      :class="{
                        'bg-green-50/50 text-green-700 border-green-100': payment.type === 'เงินสด',
                        'bg-blue-50/50 text-blue-700 border-blue-100': payment.type === 'เช็คธนาคาร',
                        'bg-orange-50/50 text-orange-700 border-orange-100': payment.type === 'ฝากเข้าบัญชี',
                        'bg-gray-50/50 text-gray-700 border-gray-100': !['เงินสด', 'เช็คธนาคาร', 'ฝากเข้าบัญชี'].includes(payment.type)
                      }"
                    >
                      {{ payment.type }}
                    </span>
                    <span class="text-xs text-slate-500">{{ payment.timestamp }}</span>
                  </div>

                  <div class="space-y-2 text-sm mb-3">
                    <div class="flex justify-between items-center">
                      <span class="text-slate-500">เลขที่อ้างอิง:</span>
                      <span class="text-slate-700 font-medium">{{ payment.referenceNo }}</span>
                    </div>

                    <div v-if="payment.AccountName" class="flex justify-between items-center">
                      <span class="text-slate-500">ชื่อบัญชี:</span>
                      <span class="text-slate-700">{{ payment.AccountName }}</span>
                    </div>

                    <div v-if="payment.BankName" class="flex justify-between items-center">
                      <span class="text-slate-500">ธนาคาร:</span>
                      <span class="text-slate-700">{{ payment.BankName }}</span>
                    </div>

                    <div v-if="payment.AccountNum" class="flex justify-between items-center">
                      <span class="text-slate-500">เลขที่บัญชี:</span>
                      <span class="text-slate-700">{{ payment.AccountNum }}</span>
                    </div>

                    <div v-if="payment.NumCheck" class="flex justify-between items-center">
                      <span class="text-slate-500">เลขที่เช็ค:</span>
                      <span class="text-slate-700">{{ payment.NumCheck }}</span>
                    </div>
                  </div>

                  <div class="border-t border-slate-200 pt-3 flex justify-between items-center">
                    <span class="font-semibold text-slate-800">ยอดชำระ</span>
                    <span class="font-bold text-lg text-red-600">
                      - {{ formatNumber(payment.amount) }} ฿
                    </span>
                  </div>
                </div>

                <!-- Total Paid -->
                <div class="glass-input rounded-xl p-4 border-2 border-blue-200/50">
                  <div class="flex justify-between items-center">
                    <span class="text-lg font-bold text-slate-800">ยอดชำระรวม</span>
                    <span class="text-xl font-bold text-red-600">
                      - {{ formatNumber(totalPaid) }} ฿
                    </span>
                  </div>
                </div>
              </div>

              <!-- ยอดรวมที่จะจ่าย -->
              <div
                class="rounded-xl p-6 shadow-lg mb-4"
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
                <!-- ปุ่มล้างหนี้ -->
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import sidebar from '@/components/bar/sidebar.vue'
import BankAccountSelect from '@/components/TomSelect/BankAccountSelect.vue'
import InputText from '@/components/input/inputtext.vue'
import { useBankTransferManager } from '@/components/Function/FuncClear.js'

const route = useRoute()
const router = useRouter()

// ✅ ใช้ Bank Transfer Manager
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

// ✅ รายการธนาคารที่มีอยู่แล้ว (สำหรับ dropdown)
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

// State
const receipts = ref([])
const allItems = ref([])
const paymentHistory = ref([])

// Payment Methods State
const paymentMethods = ref({
  krungthai: { checked: false, amount: '' },
  scb: { checked: false, amount: '' },
  other: { checked: false, name: '', amount: '' }
})

// Computed Properties
const totalDebt = computed(() =>
  allItems.value.reduce((sum, i) => sum + Number(i.debtorAmount || 0), 0)
)

const totalPaid = computed(() =>
  paymentHistory.value.reduce((sum, p) => sum + Number(p.amount || 0), 0)
)

// คำนวณยอดที่กำลังจะชำระ (จากช่องกรอก)
const currentPaymentAmount = computed(() => totalBankAmount.value)

// คำนวณยอดหนี้คงเหลือ (หักทั้งที่จ่ายแล้ว + กำลังจะจ่าย)
const remainingAmount = computed(() =>
  Math.max(0, totalDebt.value - totalPaid.value - currentPaymentAmount.value)
)

// Utility Functions
const formatNumber = (num) =>
  Number(num || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })

const formatMoney = formatNumber

const formatDate = (date) => {
  if (!date) return '-'
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Payment Amount Handlers
const handleAmountInput = (method, event) => {
  const value = event.target.value.replace(/[^0-9.]/g, '')
  const parts = value.split('.')
  if (parts.length > 2) return

  paymentMethods.value[method].amount = value
}

const formatAmountOnBlur = (method) => {
  const value = paymentMethods.value[method].amount
  if (!value) return

  const cleanValue = value.toString().replace(/,/g, '')
  const numValue = parseFloat(cleanValue)

  if (isNaN(numValue)) {
    paymentMethods.value[method].amount = ''
    return
  }

  paymentMethods.value[method].amount = numValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Load Data on Mount
onMounted(() => {
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

    const baseReceipts = Array.isArray(summary.receipts)
      ? summary.receipts
      : []

    const items = baseReceipts.flatMap(r =>
      (r.items || [])
        .filter(item => !item.isClearedDebt)
        .map(item => {
          const debtorAmount =
            item.debtorAmount != null
              ? Number(item.debtorAmount)
              : Number(item.amount || 0)

          return {
            ...item,
            debtorAmount,
            amount: debtorAmount,
            paymentInput: '',
            _originalReceipt: {
              ...r,
              projectCode: r.projectCode || r.receiptId,
              createdAt: r.createdAt || new Date().toISOString()
            }
          }
        })
    )

    allItems.value = items

    receipts.value = baseReceipts.map(r => {
      const receiptItems = items.filter(
        i =>
          i._originalReceipt.projectCode ===
          (r.projectCode || r.receiptId)
      )

      const totalDebtorAmount = receiptItems.reduce(
        (sum, i) => sum + Number(i.debtorAmount || 0),
        0
      )

      return {
        ...r,
        items: receiptItems,
        totalDebtorAmount
      }
    })

  } catch (err) {
    console.error(err)
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

// Confirm Payment
function confirmPayment() {
  const payments = []
  const map = paymentMethods.value

  if (map.krungthai.checked) {
    const amount = parseFloat(String(map.krungthai.amount).replace(/,/g, ''))
    if (amount > 0) {
      payments.push({
        type: 'ฝากเข้าบัญชี',
        BankName: 'กรุงไทย',
        AccountName: 'มหาวิทยาลัยพะเยา',
        AccountNum: '512-1-43488-6',
        amount: amount
      })
    }
  }

  if (map.scb.checked) {
    const amount = parseFloat(String(map.scb.amount).replace(/,/g, ''))
    if (amount > 0) {
      payments.push({
        type: 'ฝากเข้าบัญชี',
        BankName: 'ไทยพาณิชย์',
        AccountName: 'มหาวิทยาลัยพะเยา',
        AccountNum: '891-2-00225-5',
        amount: amount
      })
    }
  }

  if (map.other.checked) {
    const amount = parseFloat(String(map.other.amount).replace(/,/g, ''))
    if (amount > 0) {
      payments.push({
        type: map.other.name || 'อื่น ๆ',
        amount: amount
      })
    }
  }

  if (payments.length === 0) {
    Swal.fire('ผิดพลาด', 'กรุณาเลือกวิธีชำระเงินและกรอกจำนวนเงิน', 'warning')
    return
  }

  payments.forEach(p => {
    paymentHistory.value.push({
      id: Date.now() + Math.random(),
      referenceNo: `PAY-${Date.now()}`,
      timestamp: new Date().toLocaleString('th-TH'),
      ...p
    })
  })

  Object.keys(paymentMethods.value).forEach(key => {
    paymentMethods.value[key].checked = false
    paymentMethods.value[key].amount = ''
    if (paymentMethods.value[key].name !== undefined) {
      paymentMethods.value[key].name = ''
    }
    if (paymentMethods.value[key].num !== undefined) {
      paymentMethods.value[key].num = ''
    }
  })

  Swal.fire('สำเร็จ', 'บันทึกการชำระเงินแล้ว', 'success')
}

// ✅ Format สำหรับแสดงผล
const formatDisplayPaymentAmount = (value) => {
  return formatDisplayBankAmount(value)
}

// ✅ Clear error
const clearBankError = (index, field) => {
  if (errors.value.bankTransfers?.[index]?.[field]) {
    delete errors.value.bankTransfers[index][field]
    if (Object.keys(errors.value.bankTransfers[index]).length === 0) {
      delete errors.value.bankTransfers[index]
    }
  }
}

const handlePaymentAmountInput = (method, event) => {
  const value = event.target.value.replace(/[^0-9.]/g, '')
  paymentMethods.value[method].amount = value
}

const formatPaymentAmountOnBlur = (method) => {
  const value = paymentMethods.value[method].amount
  if (!value) return
  const num = parseFloat(String(value).replace(/,/g, ''))
  if (isNaN(num)) {
    paymentMethods.value[method].amount = ''
    return
  }
  paymentMethods.value[method].amount = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

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
  return allItems.value.reduce((sum, item) => {
    const value = item.paymentInput || '0'
    const cleanValue = String(value).replace(/,/g, '')
    const numValue = parseFloat(cleanValue) || 0
    return sum + numValue
  }, 0)
})

// Clear All Debts Function
async function clearAllDebts() {
  // ✅ คำนวณยอดรวมที่จะจ่าย
  const totalPaymentInputValue = totalPaymentInput.value
  const totalBankValue = totalBankAmount.value
  const combinedPayment = totalPaymentInputValue + totalBankValue

  // ✅ ตรวจสอบว่ายอด 2 ช่องเท่ากันหรือไม่
  const paymentDifference = Math.abs(totalPaymentInputValue - totalBankValue)
     const itemIdsToMark = new Set()

    receipts.value.forEach(receipt => {
      receipt.items.forEach(item => {
        // ใช้ unique ID ของ item แทน
        if (item.id) {
          itemIdsToMark.add(item.id)
        }
      })
    })
    console.log('🎯 Item IDs to mark:', Array.from(itemIdsToMark))
   // ✅ โหลดข้อมูล receipts
    const storedReceipts = JSON.parse(localStorage.getItem('fakeApi.receipts') || '[]')
    console.log('📦 Total receipts:', storedReceipts.length)
    let markedCount = 0
  if (paymentDifference > 0.01) {
    await Swal.fire({
      icon: 'error',
      title: 'ยอดไม่ตรงกัน',
      html: `
        <div class="text-left space-y-2">
          <p class="text-gray-700 mb-2">ยอดที่กรอกใน 2 ช่องต้องเท่ากัน</p>
          <hr class="my-3">
          <p class="text-gray-700">
            <span class="font-bold text-blue-600">• ยอดที่ต้องชำระ (textbox):</span>
            <span class="float-right">${formatNumber(totalPaymentInputValue)} บาท</span>
          </p>
          <p class="text-gray-700">
            <span class="font-bold text-purple-600">• ยอดรวมที่จะจ่าย (ธนาคาร):</span>
            <span class="float-right">${formatNumber(totalBankValue)} บาท</span>
          </p>
          <hr class="my-3">
          <p class="text-gray-700">
            <span class="font-bold text-red-600">✗ ส่วนต่าง:</span>
            <span class="float-right font-bold">${formatNumber(paymentDifference)} บาท</span>
          </p>
          <p class="text-sm text-gray-500 mt-2">กรุณากรอกจำนวนเงินให้เท่ากันในทั้ง 2 ส่วน</p>
        </div>
      `,
      confirmButtonText: 'รับทราบ',
      confirmButtonColor: '#DC2626',
      width: '500px',
    })
    return
  }

  // ✅ คำนวณส่วนต่างกับยอดหนี้ทั้งหมด
  const debtDifference = totalDebt.value - totalPaymentInputValue

  // ✅ แสดงข้อความยืนยัน พร้อมส่วนต่าง (ถ้ามี)
  const confirmMessage = debtDifference > 0.01
    ? `
      <div class="text-left space-y-2">
        <p class="text-gray-700">ยอดหนี้ทั้งหมด: <span class="font-bold text-red-600">${formatNumber(totalDebt.value)} บาท</span></p>
        <p class="text-gray-700">ยอดที่จะชำระ: <span class="font-bold text-green-600">${formatNumber(totalPaymentInputValue)} บาท</span></p>
        <hr class="my-2">
        <p class="text-gray-700">
          <span class="font-bold text-orange-600">⚠️ ยอดคงเหลือ (ส่วนต่าง):</span>
          <span class="float-right font-bold text-orange-600">${formatNumber(debtDifference)} บาท</span>
        </p>
        <hr class="my-2">
        <p class="text-gray-700">จำนวนรายการ: <span class="font-bold">${allItems.value.length} รายการ</span></p>
        <p class="text-gray-700">จำนวนธนาคาร: <span class="font-bold">${bankTransfers.length} รายการ</span></p>
      </div>
    `
    : `
      <div class="text-left space-y-2">
        <p class="text-gray-700">ยอดหนี้ทั้งหมด: <span class="font-bold">${formatNumber(totalDebt.value)} บาท</span></p>
        <p class="text-gray-700">จำนวนรายการ: <span class="font-bold">${allItems.value.length} รายการ</span></p>
        <p class="text-gray-700">จำนวนธนาคาร: <span class="font-bold">${bankTransfers.length} รายการ</span></p>
      </div>
    `

  const result = await Swal.fire({
    title: 'ยืนยันการล้างหนี้?',
    html: confirmMessage,
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

    // ✅ ดึงข้อมูลธนาคาร
    const bankData = getBankTransfersData()
    console.log('🏦 Bank transfers:', bankData)

    // ✅ แปลงเป็น payments format
    const newPayments = bankData.map(bank => ({
      type: 'transfer',
      bankName: bank.accountData.bankName,
      accountName: bank.accountData.accountName,
      accountNumber: bank.accountData.accountNumber,
      amount: bank.amount
    }))
    console.log('💰 New payments:', newPayments)


 // ✅ 6. บันทึกประวัติ
    const historyRecord = {
      id: Date.now().toString(),
      referenceId: `CLEAR-${Date.now()}`,
      date: new Date().toLocaleString('th-TH'),
      items: allItems.value
        .filter(i => {
          const val = String(i.paymentInput || '0').replace(/,/g, '')
          return parseFloat(val) > 0
        })
        .map(i => ({
          itemName: i.itemName,
          amount: Number(String(i.paymentInput).replace(/,/g, '')),
          note: i.note || '',
          referenceId: i.receiptNumber || i._originalReceipt?.projectCode || i.receiptId || ''
        })),
      payments: getBankTransfersData().map(p => ({
        type: 'transfer',
        bankName: p.accountData.bankName,
        accountName: p.accountData.accountName,
        accountNumber: p.accountData.accountNumber,
        amount: p.amount
      })),
      total: totalPaymentInput.value,
      fullName: receipts.value[0]?.fullName || '-',
      phone: receipts.value[0]?.phone || '-',
      department: receipts.value[0]?.department || '-',
      sendmoney: receipts.value[0]?.sendmoney || '-',
      fundName: receipts.value[0]?.fundName || '-',
      receiptId: receipts.value[0]?.receiptId || receipts.value[0]?.projectCode || `CLEAR-${Date.now()}`
    }

    // ✅ บันทึกประวัติ
  const existingHistory = JSON.parse(localStorage.getItem('debtorClearHistory') || '[]')
    existingHistory.unshift(historyRecord)
    localStorage.setItem('debtorClearHistory', JSON.stringify(existingHistory))

    // ✅ สร้าง Map ของรายการที่ต้องล้าง
    const itemsToMark = new Map()
    receipts.value.forEach(receipt => {
      const delNumber = receipt.delNumber || receipt.projectCode || receipt.receiptId
      console.log(`   🔍 Mapping items for: ${delNumber}`)

      receipt.items.forEach(item => {
        const key = `${delNumber}:${item.itemName}`
        itemsToMark.set(key, {
          delNumber,
          itemName: item.itemName,
          debtorAmount: item.debtorAmount
        })
      })
    })

    console.log(`🎯 Items to mark: ${itemsToMark.size}`)



 const updatedReceipts = storedReceipts.map(receipt => {
      if (!Array.isArray(receipt.receiptList)) {
        return receipt
      }

      const newReceiptList = receipt.receiptList.map(item => {
        // ตรวจสอบจาก item.id โดยตรง
        if (itemIdsToMark.has(item.id)) {
          console.log(`✅ MARKING: ${item.itemName} (ID: ${item.id})`)
          markedCount++
          return { ...item, isClearedDebt: true }
        }
        return item
      })

      return {
        ...receipt,
        receiptList: newReceiptList
      }
    })
     // ตรวจสอบว่าทำเครื่องหมายครบหรือไม่
    if (markedCount !== itemIdsToMark.size) {
      console.warn('⚠️ Warning: Not all items were marked!')
      console.log('Expected:', itemIdsToMark.size, 'Actual:', markedCount)
    }

    // ✅ 4. บันทึกกลับ localStorage
    localStorage.setItem('fakeApi.receipts', JSON.stringify(updatedReceipts))

    // ✅ 5. Trigger update events
    const updateTime = Date.now().toString()
    localStorage.setItem('receipts_last_update', updateTime)

    console.log(`📊 Items marked: ${markedCount}/${itemIdsToMark.size}`)

    console.log(`\n📊 ========== SUMMARY ==========`)
    console.log(`   Total receipts: ${updatedReceipts.length}`)
    console.log(`   Items marked: ${markedCount}`)

    // ✅ บันทึกข้อมูลที่อัปเดตกลับเข้า localStorage
    localStorage.setItem('fakeApi.receipts', JSON.stringify(updatedReceipts))
    console.log('💾 Updated receipts saved to localStorage')
     window.dispatchEvent(new StorageEvent('storage', {
      key: 'fakeApi.receipts',
      newValue: JSON.stringify(updatedReceipts),
      url: window.location.href
    }))

    window.dispatchEvent(new CustomEvent('receipts-updated', {
      detail: {
        timestamp: updateTime,
        action: 'clear-debts',
        marked: markedCount
      }
    }))


    window.dispatchEvent(new StorageEvent('storage', {
      key: 'fakeApi.receipts',
      newValue: JSON.stringify(updatedReceipts),
      url: window.location.href
    }))

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'receipts_last_update',
      newValue: updateTime,
      url: window.location.href
    }))

    window.dispatchEvent(new CustomEvent('receipts-updated', {
      detail: {
        timestamp: updateTime,
        action: 'clear-debts',
        marked: markedCount
      }
    }))

    console.log('🔔 Update signals sent')

    // ✅ ลบข้อมูล summary ที่ใช้งานแล้ว
    localStorage.removeItem('clearDebtorSummary')
    console.log('🗑️ Cleared summary data')

await Swal.fire({
      title: 'ล้างหนี้สำเร็จ!',
      html: `
        <div class="text-left space-y-2">
          <p>✅ ล้างหนี้รายการ: <span class="font-bold">${markedCount} รายการ</span></p>
          <p>💰 ยอดเงินรวม: <span class="font-bold text-green-600">${formatNumber(totalDebt.value)} บาท</span></p>
          <p>🔖 เลขที่อ้างอิง: <span class="font-mono text-sm">${historyRecord.referenceId}</span></p>
        </div>
      `,
      icon: 'success',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#10B981'
    })

    router.push('/indexsavedebtor')

  } catch (error) {
    console.error('❌ Error:', error)
    await Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      html: `<p>${error.message || 'ไม่สามารถล้างหนี้ได้'}</p>`,
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
