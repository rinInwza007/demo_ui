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
                <div class="col-span-3">รายการ</div>
                <div class="col-span-3">ผู้ทำรายการ</div>
                <div class="col-span-2 text-right pr-8">จำนวนเงิน</div>
                <div class="col-span-2 text-center">วันที่</div>
                <div class="col-span-2">หมายเหตุ</div>
              </div>

              <div
                v-for="item in receipt.items"
                :key="item.id"
                class="group grid grid-cols-12 gap-4 px-4 py-4 mb-2 items-center rounded-xl
                       transition-all duration-200 border border-white/50 hover:bg-white/50"
              >
                <!-- Item Name -->
                <div class="col-span-3">
                  <div class="font-medium text-slate-800 text-sm">{{ item.itemName }}</div>
                </div>

                <!-- Full Name -->
                <div class="col-span-3 flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 text-white flex items-center justify-center text-[10px] shadow-sm">
                    {{ (item.responsible || '-').charAt(0) }}
                  </div>
                  <span class="text-sm text-slate-700 truncate">{{ item.responsible || '-' }}</span>
                </div>

                <!-- Amount -->
                <div class="col-span-2 text-right pr-8">
                  <div class="font-bold text-red-600 font-mono text-sm">
                    {{ formatMoney(item.debtorAmount) }}
                  </div>
                  <div class="text-[10px] text-slate-400">บาท</div>
                </div>

                <!-- Date -->
                <div class="col-span-2 text-center">
                  <div class="text-xs text-slate-600">
                    {{ formatDate(item._originalReceipt.createdAt) }}
                  </div>
                </div>

                <!-- Note -->
                <div class="col-span-2">
                  <div class="text-sm text-slate-600 truncate">
                    {{ item.note }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Section -->
            <div class="glass-panel rounded-2xl p-6 shadow-lg">
              <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <span class="w-1 h-6 bg-red-500 rounded-full"></span>การชำระเงิน
              </h2>

              <!-- Payment Methods -->
              <div class="space-y-4 mb-6">
                <!-- ธ.กรุงไทย -->
                <div class="bg-white/40 rounded-xl p-4 border border-white/50">
                  <div class="flex items-start gap-3">
                    <input
                      type="checkbox"
                      v-model="paymentMethods.krungthai.checked"
                      class="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-slate-800">
                        ธ.กรุงไทย สาขาพะเยา (มหาวิทยาลัยพะเยา)
                      </div>
                      <div class="text-sm text-slate-600">บช.ที่ 512-1-43488-6</div>
                      <div class="mt-2 flex items-center gap-2">
                        <span class="text-sm text-slate-700">จำนวนเงิน</span>
                        <input
                          type="text"
                          v-model="paymentMethods.krungthai.amount"
                          @input="handleAmountInput('krungthai', $event)"
                          @blur="formatAmountOnBlur('krungthai')"
                          :disabled="!paymentMethods.krungthai.checked"
                          placeholder="0.00"
                          class="glass-input px-3 py-2 rounded-lg w-48 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span class="text-sm text-slate-700">บาท</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ธ.ไทยพาณิชย์ -->
                <div class="bg-white/40 rounded-xl p-4 border border-white/50">
                  <div class="flex items-start gap-3">
                    <input
                      type="checkbox"
                      v-model="paymentMethods.scb.checked"
                      class="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-slate-800">
                        ธ.ไทยพาณิชย์ สาขามหาวิทยาลัยพะเยา
                      </div>
                      <div class="text-sm text-slate-600">บช.ที่ 891-2-00225-5</div>
                      <div class="mt-2 flex items-center gap-2">
                        <span class="text-sm text-slate-700">จำนวนเงิน</span>
                        <input
                          type="text"
                          v-model="paymentMethods.scb.amount"
                          @input="handleAmountInput('scb', $event)"
                          @blur="formatAmountOnBlur('scb')"
                          :disabled="!paymentMethods.scb.checked"
                          placeholder="0.00"
                          class="glass-input px-3 py-2 rounded-lg w-48 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span class="text-sm text-slate-700">บาท</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- เงินสด -->
                <div class="bg-white/40 rounded-xl p-4 border border-white/50">
                  <div class="flex items-start gap-3">
                    <input
                      type="checkbox"
                      v-model="paymentMethods.cash.checked"
                      class="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-slate-800">เงินสด</div>
                      <div class="mt-2 flex items-center gap-2">
                        <span class="text-sm text-slate-700">จำนวนเงิน</span>
                        <input
                          type="text"
                          v-model="paymentMethods.cash.amount"
                          @input="handleAmountInput('cash', $event)"
                          @blur="formatAmountOnBlur('cash')"
                          :disabled="!paymentMethods.cash.checked"
                          placeholder="0.00"
                          class="glass-input px-3 py-2 rounded-lg w-48 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span class="text-sm text-slate-700">บาท</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- เช็ค -->
                <div class="bg-white/40 rounded-xl p-4 border border-white/50">
                  <div class="flex items-start gap-3">
                    <input
                      type="checkbox"
                      v-model="paymentMethods.check.checked"
                      class="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-slate-800">เช็ค</div>
                      <div class="mt-2 space-y-2">
                        <div class="flex items-center gap-2">
                          <span class="text-sm text-slate-700">เลขที่เช็ค</span>
                          <input
                            type="text"
                            v-model="paymentMethods.check.num"
                            :disabled="!paymentMethods.check.checked"
                            placeholder="ระบุเลขที่เช็ค"
                            class="glass-input px-3 py-2 rounded-lg w-48 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="text-sm text-slate-700">จำนวนเงิน</span>
                          <input
                            type="text"
                            v-model="paymentMethods.check.amount"
                            @input="handleAmountInput('check', $event)"
                            @blur="formatAmountOnBlur('check')"
                            :disabled="!paymentMethods.check.checked"
                            placeholder="0.00"
                            class="glass-input px-3 py-2 rounded-lg w-48 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span class="text-sm text-slate-700">บาท</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- อื่น ๆ -->
                <div class="bg-white/40 rounded-xl p-4 border border-white/50">
                  <div class="flex items-start gap-3">
                    <input
                      type="checkbox"
                      v-model="paymentMethods.other.checked"
                      class="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="font-medium text-slate-800">อื่น ๆ</span>
                        <input
                          type="text"
                          v-model="paymentMethods.other.name"
                          :disabled="!paymentMethods.other.checked"
                          placeholder="ระบุประเภท"
                          class="glass-input px-3 py-2 rounded-lg w-64 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-sm text-slate-700">จำนวนเงิน</span>
                        <input
                          type="text"
                          v-model="paymentMethods.other.amount"
                          @input="handleAmountInput('other', $event)"
                          @blur="formatAmountOnBlur('other')"
                          :disabled="!paymentMethods.other.checked"
                          placeholder="0.00"
                          class="glass-input px-3 py-2 rounded-lg w-48 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span class="text-sm text-slate-700">บาท</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- สรุปยอดเงินที่ชำระใหม่ -->
                <div class="bg-blue-500 rounded-xl p-4 mt-4">
                  <div class="flex justify-between items-center">
                    <span class="text-lg font-bold text-white">ยอดเงินที่ชำระใหม่</span>
                    <span class="text-2xl font-bold text-white">{{ formattedNewPayment }} บาท</span>
                  </div>
                </div>
              </div>

              <!-- Payment History -->
              <div v-if="paymentHistory.length > 0" class="space-y-3 mb-6">
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

              <!-- Remaining Debt -->
              <div
                class="rounded-xl p-6 shadow-lg mb-4"
                style="background: linear-gradient(135deg, #A855F7 0%, #7E22CE 100%);"
              >
                <div class="flex flex-col sm:flex-row justify-between items-center gap-2 text-white">
                  <div class="flex items-center gap-3">
                    <i class="ph-fill ph-wallet text-3xl"></i>
                    <span class="text-xl font-bold">ยอดหนี้คงเหลือ</span>
                  </div>
                  <span class="text-3xl font-bold">
                    {{ formatNumber(remainingAmount) }} บาท
                  </span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end gap-3">
                <!-- ปุ่มบันทึกการจ่าย -->
                <button
                  class="px-8 py-3 rounded-xl font-medium shadow-lg text-white transition-all active:scale-95 hover:shadow-xl"
                  style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);"
                  @click="confirmPayment"
                >
                  <i class="ph ph-credit-card mr-2"></i>
                  ยืนยันการชำระเงิน
                </button>

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

// Components (คุณต้องมี components เหล่านี้)
// import sidebar from '@/components/bar/sidebar.vue'

const route = useRoute()
const router = useRouter()

// State
const receipts = ref([])
const allItems = ref([])
const paymentHistory = ref([])

// Payment Methods State
const paymentMethods = ref({
  krungthai: { checked: false, amount: '' },
  scb: { checked: false, amount: '' },
  cash: { checked: false, amount: '' },
  check: { checked: false, amount: '', num: '' },
  other: { checked: false, name: '', amount: '' }
})

// Computed Properties
const totalDebt = computed(() =>
  allItems.value.reduce((sum, i) => sum + Number(i.debtorAmount || 0), 0)
)

const totalPaid = computed(() =>
  paymentHistory.value.reduce((sum, p) => sum + Number(p.amount || 0), 0)
)

const remainingAmount = computed(() =>
  Math.max(0, totalDebt.value - totalPaid.value)
)

const formattedNewPayment = computed(() => {
  const methods = paymentMethods.value
  let total = 0

  Object.keys(methods).forEach(key => {
    if (methods[key].checked && methods[key].amount) {
      const cleanValue = methods[key].amount.toString().replace(/,/g, '')
      const num = parseFloat(cleanValue)
      if (!isNaN(num)) {
        total += num
      }
    }
  })

  return total.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
})

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
      (r.items || []).map(item => {
        const debtorAmount =
          item.debtorAmount != null
            ? Number(item.debtorAmount)
            : Number(item.amount || 0)

        return {
          ...item,
          debtorAmount,
          amount: debtorAmount,
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

  if (map.cash.checked) {
    const amount = parseFloat(String(map.cash.amount).replace(/,/g, ''))
    if (amount > 0) {
      payments.push({
        type: 'เงินสด',
        amount: amount
      })
    }
  }

  if (map.check.checked) {
    const amount = parseFloat(String(map.check.amount).replace(/,/g, ''))
    if (amount > 0) {
      payments.push({
        type: 'เช็คธนาคาร',
        NumCheck: map.check.num || '-',
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

// Clear All Debts
async function clearAllDebts() {
  if (remainingAmount.value > 0) {
    await Swal.fire({
      title: 'ยังชำระเงินไม่ครบ',
      html: `
        <div class="text-left space-y-2">
          <p class="text-gray-700">ยอดหนี้ทั้งหมด: <span class="font-bold text-red-600">${formatNumber(totalDebt.value)} บาท</span></p>
          <p class="text-gray-700">ชำระแล้ว: <span class="font-bold text-green-600">${formatNumber(totalPaid.value)} บาท</span></p>
          <p class="text-gray-700">คงเหลือ: <span class="font-bold text-orange-600">${formatNumber(remainingAmount.value)} บาท</span></p>
        </div>
      `,
      icon: 'warning',
      confirmButtonText: 'รับทราบ',
      confirmButtonColor: '#7E22CE'
    })
    return
  }

  const result = await Swal.fire({
    title: 'ยืนยันการล้างหนี้?',
    html: `
      <div class="text-left space-y-2">
        <p class="text-gray-700">ยอดหนี้ทั้งหมด: <span class="font-bold">${formatNumber(totalDebt.value)} บาท</span></p>
        <p class="text-gray-700">จำนวนรายการ: <span class="font-bold">${allItems.value.length} รายการ</span></p>
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
    const historyRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      items: `${receipts.value.length} หน่วยงาน (${allItems.value.length} รายการ)`,
      total: totalDebt.value,
      paid: totalPaid.value,
      referenceId: `CLEAR-${Date.now()}`,
      receipts: receipts.value.map(r => ({
        department: r.department,
        subDepartment: r.subDepartment,
        projectCode: r.projectCode,
        totalAmount: r.totalDebtorAmount,
        items: r.items.map(i => ({
          itemName: i.itemName,
          amount: i.debtorAmount,
          note: i.note
        }))
      })),
      payments: paymentHistory.value
    }

    const existingHistory = JSON.parse(localStorage.getItem('debtorClearHistory') || '[]')
    existingHistory.unshift(historyRecord)
    localStorage.setItem('debtorClearHistory', JSON.stringify(existingHistory))

    const storedReceipts = JSON.parse(localStorage.getItem('fakeApi.receipts') || '[]')
    const projectCodesToDelete = new Set()

    receipts.value.forEach(receipt => {
      const projectCode = receipt.projectCode || receipt.receiptId
      if (projectCode) {
        projectCodesToDelete.add(projectCode)
      }
    })

    let removedCount = 0

    const updatedReceipts = storedReceipts.filter(receipt => {
      const projectCode = receipt.projectCode

      if (!projectCodesToDelete.has(projectCode)) {
        return true
      }

      if (receipt.moneyTypeNote === 'Waybill' || receipt.moneyTypeNote === 'Debtor') {
        removedCount++
        return false
      }

      return true
    })

    localStorage.setItem('fakeApi.receipts', JSON.stringify(updatedReceipts))

    const updateTime = Date.now().toString()
    localStorage.setItem('receipts_last_update', updateTime)

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'receipts_last_update',
      newValue: updateTime,
      url: window.location.href
    }))

    window.dispatchEvent(new CustomEvent('receipts-updated', {
      detail: {
        timestamp: updateTime,
        action: 'clear-debts',
        removed: removedCount
      }
    }))

    localStorage.removeItem('clearDebtorSummary')

    await Swal.fire({
      title: 'สำเร็จ!',
      html: `
        <div class="text-center space-y-2">
          <p class="text-lg font-bold text-green-600">✅ ล้างหนี้เรียบร้อยแล้ว</p>
          <div class="bg-gray-50 p-4 rounded-lg mt-4 text-left">
            <p class="text-sm text-gray-700">🗑️ ลบ receipts: <strong>${removedCount}</strong></p>
            <p class="text-sm text-gray-700">📋 ลบรายการทั้งหมด: <strong>${allItems.value.length}</strong></p>
            <p class="text-sm text-gray-500 mt-2">รหัส: ${historyRecord.referenceId}</p>
          </div>
        </div>
      `,
      icon: 'success',
      confirmButtonColor: '#10B981',
      timer: 4000,
      timerProgressBar: true
    })

    await new Promise(resolve => setTimeout(resolve, 500))
    router.push('/indexsavedebtor')

  } catch (error) {
    console.error('Error:', error)
    await Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      html: `
        <p>${error.message || 'ไม่สามารถล้างหนี้ได้'}</p>
        <p class="text-xs text-gray-500 mt-2">กรุณาลองใหม่อีกครั้ง</p>
      `,
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
