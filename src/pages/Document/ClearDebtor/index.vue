<!-- //ClearDebtor/index-->
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
                    {{ totalItemsCount }} <span class="text-sm text-slate-500">รายการ</span>
                  </span>
                </div>
              </div>
            </div>
<!-- ✅ ตารางเดียว มีหัวข้อคณะด้านบน -->
<div class="glass-panel rounded-2xl shadow-lg overflow-hidden">

  <!-- ✅ หัวข้อคณะ (แสดงคณะแรก หรือรวมชื่อทุกคณะ) -->
  <div class="px-6 py-4 border-b border-white/40 bg-white/20">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-slate-900">
  {{ receipts[0]?.department || 'รายละเอียดหนี้' }}
</h2>
      <h2 class="text-xl font-bold text-slate-900"></h2>
      <span class="text-lg font-bold text-red-600">
        {{ formatMoney(totalDebt) }} บาท
      </span>
    </div>

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

  <!-- ✅ รายการทั้งหมดต่อกัน (รวมแล้ว) -->
  <div class="px-6">
    <template v-for="receipt in receipts" :key="receipt.receiptId">
      <div
        v-for="item in receipt.items"
        :key="item.id"
        class="group grid grid-cols-12 gap-4 py-4 items-center border-b border-white/20 hover:bg-white/30 transition-all duration-200"
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

        <!-- Item Name (แสดงชื่อรายการธรรมดา) -->
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

        <!-- Debt Amount (แสดงยอดรวม) -->
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
    </template>
  </div>
</div>
            <!-- ยอดที่ต้องชำระ -->
<div
  class="rounded-xl p-6 shadow-lg mb-6"
  style="background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);"
>
  <div class="flex flex-col sm:flex-row justify-between items-center gap-2 text-white">
    <div class="flex items-center gap-3">
      <i class="ph-fill ph-money text-3xl"></i> <!-- ✅ เพิ่มบรรทัดนี้ -->
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
import { clearDebtorService } from '@/services/ClearDebtorService' // ✅ ใช้ clearDebtorService
import { reciptService } from '@/services/ReciptService'

const route = useRoute()
const router = useRouter()

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
const paymentHistory = ref([])

const totalDebt = computed(() =>
  allItems.value.reduce((sum, i) => sum + Number(i.debtorAmount || 0), 0)
)

const totalPaid = computed(() =>
  paymentHistory.value.reduce((sum, p) => sum + Number(p.amount || 0), 0)
)

// ✅ คำนวณจำนวนรายการที่แสดง (นับจากรายการที่รวมแล้ว)
const totalItemsCount = computed(() => {
  return receipts.value.reduce((total, receipt) => {
    return total + receipt.items.length
  }, 0)
})

const formatNumber = (num) =>
  Number(num || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })

const formatMoney = formatNumber

// ✅ Load Data
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

    console.log('📦 Raw summary:', summary)
    console.log('📋 Receipts count:', summary.receipts?.length)

    const baseReceipts = Array.isArray(summary.receipts) ? summary.receipts : []

    const waybillNumbers = baseReceipts.map(r => r.waybillNumber)
    const uniqueWaybills = new Set(waybillNumbers)

    if (waybillNumbers.length !== uniqueWaybills.size) {
      console.error('❌ Duplicate waybills detected!', waybillNumbers)
    } else {
      console.log('✅ No duplicates')
    }

    // ✅ สร้าง items แบบธรรมดาก่อน
    const items = baseReceipts.flatMap(r =>
      (r.items || [])
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
            responsible: r.fullName || '-',
            _originalReceipt: {
              ...r,
              projectCode: r.projectCode || r.receiptId,
              createdAt: r.createdAt || new Date().toISOString()
            }
          }
        })
    )

   allItems.value = items

// ✅ รวมรายการทั้งหมดจากทุก receipt เป็นรายการเดียว
const globalGroupedMap = new Map()

// วนลูปทุก item และรวมตามชื่อรายการ
items.forEach(item => {
  const key = item.itemName

  if (globalGroupedMap.has(key)) {
    const existing = globalGroupedMap.get(key)
    // รวมยอดเงิน
    existing.debtorAmount += Number(item.debtorAmount || 0)
    existing.amount += Number(item.amount || 0)
    // อัปเดตผู้ทำรายการเป็นคนล่าสุด
    existing.responsible = item.responsible
    // เก็บ waybillNumber และ original items
    if (!existing._mergedWaybills) {
      existing._mergedWaybills = [existing._originalReceipt.waybillNumber]
    }
    if (!existing._mergedWaybills.includes(item._originalReceipt.waybillNumber)) {
      existing._mergedWaybills.push(item._originalReceipt.waybillNumber)
    }
    if (!existing._mergedItems) {
      existing._mergedItems = [existing.id]
    }
    existing._mergedItems.push(item.id)
  } else {
    globalGroupedMap.set(key, {
      ...item,
      paymentInput: '',
      _mergedWaybills: [item._originalReceipt.waybillNumber],
      _mergedItems: [item.id]
    })
  }
})

const globalGroupedItems = Array.from(globalGroupedMap.values())

// สร้าง receipt เดียวที่มีรายการรวมทั้งหมด
const totalDebtorAmount = globalGroupedItems.reduce(
  (sum, i) => sum + Number(i.debtorAmount || 0),
  0
)

receipts.value = [{
  receiptId: 'MERGED_ALL',
  waybillNumber: 'MERGED_ALL',
  department: baseReceipts[0]?.mainAffiliationName || baseReceipts[0]?.affiliationName || 'รายการรวมทั้งหมด',
  subDepartment: `${globalGroupedItems.length} รายการ - รวมจากทุกหน่วยงาน - ${formatMoney(totalDebtorAmount)} บาท`,
  items: globalGroupedItems,
  totalDebtorAmount,
  originalDepartment: baseReceipts[0]?.mainAffiliationName || baseReceipts[0]?.affiliationName,
  originalSubDepartment: baseReceipts[0]?.subAffiliationName1,
  fullName: baseReceipts[0]?.fullName || '-',
  phone: baseReceipts[0]?.phone || '-',
  sendmoney: baseReceipts[0]?.sendmoney || '-',
  fundName: baseReceipts[0]?.fundName || '-',
  _allOriginalReceipts: baseReceipts // เก็บ receipts ต้นฉบับทั้งหมด
}]

    console.log('✅ Final receipts:', receipts.value.length)
    console.log('✅ Total items (merged):', totalItemsCount.value)

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

// ✅ ฟังก์ชันนี้ยังทำงานได้เหมือนเดิม เพราะวนลูปผ่านทุก item ใน receipts
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

// ✅ Clear All Debts - รองรับรายการรวมทั้งหมด
async function clearAllDebts() {
  const totalPaymentInputValue = totalPaymentInput.value
  const totalBankValue = totalBankAmount.value
  const paymentDifference = Math.abs(totalPaymentInputValue - totalBankValue)

  // ✅ เก็บข้อมูลรายการที่จะล้าง (ขยายให้ครบทุก waybill และ item ID)
  const itemsToMark = []

  receipts.value.forEach(receipt => {
    receipt.items.forEach((item) => {
      const paymentValue = parseFloat(String(item.paymentInput || '0').replace(/,/g, ''))
      if (paymentValue > 0) {
        // ✅ ถ้ามีการรวมหลาย waybill ต้องขยายให้ครบ
        const waybills = item._mergedWaybills || [receipt.waybillNumber]
        const itemIds = item._mergedItems || [item.id]

        waybills.forEach(waybillNumber => {
          itemsToMark.push({
            waybillNumber: waybillNumber,
            itemName: item.itemName,
            paymentAmount: paymentValue,
            receiptNumber: item.receiptNumber || '',
            note: item.note || '',
            originalItem: item,
            itemIds: itemIds // เก็บทุก ID ที่ต้อง mark
          })
        })
      }
    })
  })

  console.log('🎯 Items to mark:', itemsToMark)

  // ✅ ตรวจสอบว่ามีรายการที่จะล้างหรือไม่
  if (itemsToMark.length === 0) {
    await Swal.fire({
      icon: 'warning',
      title: 'ไม่พบรายการ',
      text: 'กรุณากรอกจำนวนเงินที่ต้องการชำระ',
      confirmButtonColor: '#F59E0B'
    })
    return
  }

  // ✅ ตรวจสอบยอดเงิน
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

  // ✅ Confirm Dialog
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

    // ✅ โหลด receipts ทั้งหมดจาก service
    const allReceipts = await reciptService.getAll()
    console.log('📦 Loaded receipts:', allReceipts.length)

    // ✅ Group items by waybillNumber
    const itemsByWaybill = new Map()

    itemsToMark.forEach(item => {
      if (!itemsByWaybill.has(item.waybillNumber)) {
        itemsByWaybill.set(item.waybillNumber, [])
      }
      itemsByWaybill.get(item.waybillNumber).push(item)
    })

    console.log('📦 Grouped by waybill:', itemsByWaybill.size, 'receipts')

    let markedCount = 0
    const updatePromises = []

    // ✅ Process each waybill
    for (const [waybillNumber, items] of itemsByWaybill) {
      console.log(`🔍 Processing waybill: ${waybillNumber}`)

      // ✅ Find the receipt
      const receipt = allReceipts.find(r => r.waybillNumber === waybillNumber)

      if (!receipt) {
        console.warn(`⚠️ Receipt not found: ${waybillNumber}`)
        continue
      }

      // ✅ ใช้ debtorList แทน receiptList
      if (!Array.isArray(receipt.debtorList)) {
        console.warn(`⚠️ debtorList not array for: ${waybillNumber}`)
        continue
      }

      // ✅ Create a set of item names to mark
      const itemNamesToMark = new Set(items.map(i => i.itemName))

      let hasChanges = false

      // ✅ Mark items as cleared
      const updatedDebtorList = receipt.debtorList.map(debtorItem => {
        if (itemNamesToMark.has(debtorItem.itemName) && !debtorItem.isClearedDebt) {
          console.log(`✅ MARKING: ${debtorItem.itemName} (ID: ${debtorItem.id})`)
          markedCount++
          hasChanges = true

          return {
            ...debtorItem,
            isClearedDebt: true,
            clearedDate: new Date().toISOString()
          }
        }
        return debtorItem
      })

      // ✅ Update receipt if there are changes
      if (hasChanges) {
        updatePromises.push(
          reciptService.update(waybillNumber, {
            debtorList: updatedDebtorList
          })
        )
      }
    }

    console.log(`📊 Updating ${updatePromises.length} receipts...`)
    await Promise.all(updatePromises)

    console.log(`✅ Successfully marked ${markedCount} items`)

    // ✅ รวมรายการที่มีชื่อเดียวกันก่อนบันทึกประวัติ
    const groupedHistoryItems = new Map()

    itemsToMark.forEach(item => {
      const key = item.itemName

      if (groupedHistoryItems.has(key)) {
        // ถ้ามีอยู่แล้ว ไม่ต้องรวมเงิน เพราะเงินถูกบันทึกครั้งเดียวต่อรายการแล้ว
        const existing = groupedHistoryItems.get(key)
        // อัปเดต note ถ้ามี
        if (item.note && !existing.note) {
          existing.note = item.note
        }
        // อัปเดต receiptNumber ถ้ามี
        if (item.receiptNumber && !existing.receiptNumber) {
          existing.receiptNumber = item.receiptNumber
        }
      } else {
        groupedHistoryItems.set(key, {
          itemName: item.itemName,
          amount: item.paymentAmount,
          note: item.note,
          receiptNumber: item.receiptNumber || item.waybillNumber
        })
      }
    })

    const uniqueHistoryItems = Array.from(groupedHistoryItems.values())

    console.log('📝 Unique history items:', uniqueHistoryItems)

    // ✅ บันทึกประวัติ
    const historyRecord = {
      id: Date.now().toString(),
      referenceId: `CLEAR-${Date.now()}`,
      date: new Date().toLocaleString('th-TH'),
      items: uniqueHistoryItems.map(i => ({
        itemName: i.itemName,
        amount: i.amount,
        note: i.note || '',
        referenceId: i.receiptNumber
      })),
      payments: getBankTransfersData().map(p => ({
        type: 'transfer',
        bankName: p.accountData.bankName,
        accountName: p.accountData.accountName,
        accountNumber: p.accountData.accountNumber,
        amount: p.amount
      })),
      total: totalPaymentInputValue,
      fullName: receipts.value[0]?.fullName || '-',
      phone: receipts.value[0]?.phone || '-',
      department: receipts.value[0]?.originalDepartment || '-',
      sendmoney: receipts.value[0]?.sendmoney || '-',
      fundName: receipts.value[0]?.fundName || '-',
      receiptId: receipts.value[0]?.waybillNumber || `CLEAR-${Date.now()}`
    }

    clearDebtorService.saveHistory(historyRecord)
    localStorage.removeItem('clearDebtorSummary')

    await Swal.fire({
      title: 'ล้างหนี้สำเร็จ!',
      html: `
        <div class="text-left space-y-2">
          <p>✅ ล้างหนี้สำเร็จ: <span class="font-bold text-green-600">${markedCount} รายการ</span></p>
          <p>💰 ยอดเงินรวม: <span class="font-bold text-green-600">${formatNumber(totalPaymentInputValue)} บาท</span></p>
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
