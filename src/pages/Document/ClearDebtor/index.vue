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
                    {{ item.responsible.charAt(0) }}
                  </div>
                  <span class="text-sm text-slate-700 truncate">{{ item.responsible }}</span>
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
              <button
                class="glass-button-primary px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all active:scale-95 mb-6"
                @click="openModalForRow(0)"
              >
                <i class="ph ph-plus-circle text-lg"></i>
                <span>เพิ่มข้อมูลการชำระเงิน</span>
              </button>

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

              <!-- Action Button -->
              <div class="flex justify-end">
                <button
                  class="px-8 py-3 rounded-xl font-medium shadow-lg transition-all active:scale-95"
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
    <Teleport to="body">
      <div v-if="showModal !== null" class="modal-portal-container">
        <Modal
          :show="showModal === 0"
          :items="rowItems[0]"
          :usedAccounts="usedAccounts"
          @close="showModal = null"
          @update:selected="applyPayment"
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import sidebar from '@/components/bar/sidebar.vue'
import Modal from "@/components/modal/clearmodal.vue"
import { useRowManager2 } from "@/components/Function/FuncClear.js"
import Swal from "sweetalert2"

const { showModal, rowItems, openModalForRow } = useRowManager2()
const route = useRoute()

const loadReceipts = () => {
  try {
    const raw = localStorage.getItem('fakeApi.receipts')
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data)
      ? data.map(r => ({
          ...r,
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
        }))
      : []
  } catch {
    return []
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const receipts = ref([])
const allItems = ref([])
const paymentHistory = ref([])
const usedAccounts = ref([])
const paidAmount = ref(0)

// ✅ คำนวณยอดหนี้รวมทั้งหมด
const totalDebt = computed(() =>
  allItems.value.reduce((sum, item) => sum + item.debtorAmount, 0)
)

// ✅ ยอดคงเหลือ
const remainingAmount = computed(() =>
  Math.max(0, totalDebt.value - paidAmount.value)
)

const totalPaid = computed(() => {
  return paymentHistory.value.reduce((sum, payment) => {
    return sum + payment.amount
  }, 0)
})

onMounted(() => {
  // ✅ อ่านข้อมูลจาก localStorage
  const summaryStr = localStorage.getItem('clearDebtorSummary')

  if (!summaryStr) {
    Swal.fire({
      title: 'ข้อผิดพลาด',
      text: 'ไม่พบข้อมูลที่เลือก',
      icon: 'error',
      confirmButtonColor: '#7E22CE'
    }).then(() => {
      window.location.href = '/indexsavedebtor'
    })
    return
  }

  try {
    const summary = JSON.parse(summaryStr)
    receipts.value = summary.receipts || []
    allItems.value = receipts.value.flatMap(r => r.items)

    console.log('✅ Loaded Multi Debtor Data:', {
      receipts: receipts.value.length,
      items: allItems.value.length,
      totalDebt: summary.totalDebtorAmount
    })

  } catch (error) {
    console.error('❌ Error parsing summary:', error)
    Swal.fire({
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถอ่านข้อมูลได้',
      icon: 'error',
      confirmButtonColor: '#7E22CE'
    }).then(() => {
      window.location.href = '/indexsavedebtor'
    })
  }
})

function applyPayment({ selected, totalFee }) {
  if (!totalFee || isNaN(totalFee)) return

  paidAmount.value += totalFee

  selected.forEach(item => {
    if (item.AccountName && !usedAccounts.value.includes(item.AccountName)) {
      usedAccounts.value.push(item.AccountName)
    }

    paymentHistory.value.push({
      id: Date.now() + Math.random(),
      type: item.type || item.paymentType || 'ไม่ระบุ',
      amount: parseFloat(item.amount) || 0,
      referenceNo: item.referenceNo || '-',
      AccountName: item.AccountName || null,
      AccountNum: item.AccountNum || null,
      BankName: item.BankName || null,
      NumCheck: item.NumCheck || null,
      timestamp: new Date().toLocaleString('th-TH')
    })
  })
}

const formatNumber = (num) => Number(num).toLocaleString("th-TH", { minimumFractionDigits: 2 })
const formatMoney = (num) => formatNumber(num)

function clearAllDebts() {
  if (paymentHistory.value.length === 0) {
    Swal.fire({
      title: 'ไม่สามารถล้างหนี้ได้',
      text: 'กรุณาเพิ่มข้อมูลการชำระเงินก่อน',
      icon: 'warning',
      confirmButtonColor: '#7E22CE'
    })
    return
  }

  Swal.fire({
    title: 'ต้องการล้างหนี้ทั้งหมดหรือไม่?',
    text: `จำนวน ${allItems.value.length} รายการ จาก ${receipts.value.length} หน่วยงาน`,
    icon: 'warning',
    showCancelButton: true,
    cancelButtonText: 'ยกเลิก',
    confirmButtonText: 'ยืนยันการล้างหนี้',
    confirmButtonColor: '#7E22CE',
    cancelButtonColor: '#6B7280',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      try {
        const allReceiptsData = loadReceipts()
        let remainingPayment = totalPaid.value

        // ✅ อัพเดทแต่ละ receipt
        const updatedReceipts = allReceiptsData.map(r => {
          // หา receipt ที่ต้องอัพเดท
          const receiptToUpdate = receipts.value.find(rec => rec.receiptId === r.projectCode)

          if (!receiptToUpdate || r.moneyTypeNote !== 'Debtor') {
            return r // ไม่เกี่ยวข้อง
          }

          // อัพเดทรายการ
          const updatedReceiptList = (r.receiptList || []).map((item, idx) => {
            const itemId = `${r.projectCode}-item-${idx}`
            const isSelected = allItems.value.some(si => si.id === itemId)

            if (!isSelected) return item

            const currentDebt = Number(
  item.debtorAmount ??
  item.amount ??        // 🔥 fallback สำคัญ
  item.fee ??
  0
)

            const alreadyPaid = Number(item.depositNetAmount || 0)

           if (remainingPayment >= currentDebt && currentDebt > 0) {
  remainingPayment -= currentDebt
  return null
}
 else if (remainingPayment > 0) {
              const paymentForThisItem = remainingPayment
              const newDebt = currentDebt - paymentForThisItem
              const newPaid = alreadyPaid + paymentForThisItem
              remainingPayment = 0

              return {
                ...item,
                debtorAmount: newDebt,
                depositNetAmount: newPaid,
                fee: newDebt
              }
            }

            return item
          }).filter(item => item !== null)

          const newTotalDebt = updatedReceiptList.reduce((sum, item) =>
            sum + Number(item.debtorAmount || 0), 0
          )

          if (updatedReceiptList.length === 0 || newTotalDebt <= 0) {
            return null // ลบ receipt
          }

          return {
            ...r,
            receiptList: updatedReceiptList,
            netTotalAmount: newTotalDebt
          }
        }).filter(r => r !== null)

        localStorage.setItem('fakeApi.receipts', JSON.stringify(updatedReceipts))

        // ✅ บันทึกประวัติการล้างหนี้
        const historyEntry = {
          id: `CLEAR-${Date.now()}`,
          referenceId: `CLR${Date.now().toString().slice(-8)}`,
          date: new Date().toLocaleDateString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          items: receipts.value.map(r => r.department).join(', '),
          itemCount: allItems.value.length,
          total: totalPaid.value,
          departments: receipts.value.map(r => r.department).join(', '),
          status: 'เสร็จสมบูรณ์',
          paymentDetails: paymentHistory.value.map(p => ({
            type: p.type,
            amount: p.amount,
            referenceNo: p.referenceNo,
            timestamp: p.timestamp
          }))
        }

        // บันทึกลง localStorage
        const existingHistory = JSON.parse(localStorage.getItem('debtorClearHistory') || '[]')
        existingHistory.unshift(historyEntry)
        localStorage.setItem('debtorClearHistory', JSON.stringify(existingHistory))

        localStorage.removeItem('clearDebtorSummary')

        Swal.fire({
          title: 'ล้างหนี้สำเร็จ',
          html: `
            <div class="text-center">
              <p class="text-lg mb-2">บันทึกรายการเรียบร้อยแล้ว</p>
              <p class="text-sm text-gray-600">รหัสอ้างอิง: <strong>${historyEntry.referenceId}</strong></p>
            </div>
          `,
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        }).then(() => {
          window.location.href = '/indexsavedebtor'
        })
      } catch (error) {
        console.error('Error clearing debts:', error)
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถล้างหนี้ได้ กรุณาลองใหม่อีกครั้ง',
          icon: 'error',
          confirmButtonColor: '#7E22CE'
        })
      }
    }
  })
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

.glass-button-primary {
  background: linear-gradient(135deg, #A855F7 0%, #7E22CE 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
}

.glass-button-primary:hover {
  box-shadow: 0 6px 20px rgba(126, 34, 206, 0.4);
  transform: translateY(-1px);
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
