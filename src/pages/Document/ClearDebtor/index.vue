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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'

import sidebar from '@/components/bar/sidebar.vue'
import Modal from '@/components/modal/clearmodal.vue'
import { useRowManager2 } from '@/components/Function/FuncClear.js'

/* =======================
   basic setup
======================= */
const route = useRoute()
const router = useRouter()
const { showModal, rowItems, openModalForRow } = useRowManager2()

/* =======================
   state
======================= */
const receipts = ref([])
const allItems = ref([])
const paymentHistory = ref([])
const usedAccounts = ref([])
const paidAmount = ref(0)

/* =======================
   computed
======================= */
const totalDebt = computed(() =>
  allItems.value.reduce((sum, i) => sum + Number(i.debtorAmount || 0), 0)
)

const totalPaid = computed(() =>
  paymentHistory.value.reduce((sum, p) => sum + Number(p.amount || 0), 0)
)

const remainingAmount = computed(() =>
  Math.max(0, totalDebt.value - totalPaid.value)
)

/* =======================
   utils
======================= */
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

/* =======================
   MAIN FIX HERE 🔥
======================= */
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

    /* ---------- 1. ดึง receipts ---------- */
    const baseReceipts = Array.isArray(summary.receipts)
      ? summary.receipts
      : []

    /* ---------- 2. flatten items ---------- */
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

    /* ---------- 3. rebuild receipts (สำคัญที่สุด) ---------- */
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

    console.log('✅ receipts:', receipts.value)
    console.log('✅ allItems:', allItems.value)
    console.log('💰 totalDebt:', totalDebt.value)

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
      amount: Number(item.amount || 0),
      referenceNo: item.referenceNo || '-',
      AccountName: item.AccountName || null,
      AccountNum: item.AccountNum || null,
      BankName: item.BankName || null,
      NumCheck: item.NumCheck || null,
      timestamp: new Date().toLocaleString('th-TH')
    })
  })
}

/* =======================
   clear debts
======================= */
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
    console.log('🧹 Starting debt clearing process...')

    // 1. สร้างประวัติ
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

    // 2. บันทึกประวัติ
    const existingHistory = JSON.parse(localStorage.getItem('debtorClearHistory') || '[]')
    existingHistory.unshift(historyRecord)
    localStorage.setItem('debtorClearHistory', JSON.stringify(existingHistory))
    console.log('✅ History saved')

    // 3. โหลดข้อมูล receipts
    const storedReceipts = JSON.parse(localStorage.getItem('fakeApi.receipts') || '[]')
    console.log('📦 Total receipts before:', storedReceipts.length)

    // 4. สร้าง Set ของ projectCode ที่ต้องลบทั้งหมด
    const projectCodesToDelete = new Set()

    receipts.value.forEach(receipt => {
      const projectCode = receipt.projectCode || receipt.receiptId
      if (projectCode) {
        projectCodesToDelete.add(projectCode)
        console.log(`🎯 Will delete/modify receipt: ${projectCode}`)
      }
    })

    console.log(`🗑️ Project codes to process: ${projectCodesToDelete.size}`)

    // 5. ลบ receipts ทั้งหมดที่ตรงกับ projectCode
    let removedCount = 0

    const updatedReceipts = storedReceipts.filter(receipt => {
      const projectCode = receipt.projectCode

      // ถ้าไม่ใช่รายการที่จะลบ ให้เก็บไว้
      if (!projectCodesToDelete.has(projectCode)) {
        return true
      }

      console.log(`\n🔍 Processing: ${projectCode}`)
      console.log(`   Type: ${receipt.moneyTypeNote}`)

      // === กรณี Waybill ===
      if (receipt.moneyTypeNote === 'Waybill') {
        const itemCount = receipt.receiptList?.length || 0
        console.log(`   📦 Waybill with ${itemCount} items`)
        console.log(`   ❌ DELETE entire Waybill receipt`)
        removedCount++
        return false // ลบ receipt นี้
      }

      // === กรณี Debtor ===
      if (receipt.moneyTypeNote === 'Debtor') {
        const itemCount = receipt.debtorList?.length || 0
        console.log(`   📦 Debtor with ${itemCount} items`)
        console.log(`   ❌ DELETE entire Debtor receipt`)
        removedCount++
        return false // ลบ receipt นี้
      }

      console.log(`   ⚠️ Unknown type, keeping`)
      return true
    })

    console.log(`\n📊 ========== SUMMARY ==========`)
    console.log(`   Receipts before: ${storedReceipts.length}`)
    console.log(`   Receipts after: ${updatedReceipts.length}`)
    console.log(`   Receipts deleted: ${removedCount}`)
    console.log(`   Expected to delete: ${projectCodesToDelete.size}`)

    if (removedCount !== projectCodesToDelete.size) {
      console.warn(`⚠️ WARNING: Expected ${projectCodesToDelete.size} deleted, but only ${removedCount} deleted`)
    }

    // 6. บันทึกกลับ localStorage
    localStorage.setItem('fakeApi.receipts', JSON.stringify(updatedReceipts))
    console.log('💾 Saved to localStorage')

    // 7. ส่งสัญญาณอัพเดต (3 วิธี)
    const updateTime = Date.now().toString()

    localStorage.setItem('receipts_last_update', updateTime)

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'receipts_last_update',
      newValue: updateTime,
      url: window.location.href
    }))

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'fakeApi.receipts',
      newValue: JSON.stringify(updatedReceipts),
      url: window.location.href
    }))

    window.dispatchEvent(new CustomEvent('receipts-updated', {
      detail: {
        timestamp: updateTime,
        action: 'clear-debts',
        removed: removedCount
      }
    }))

    console.log('🔔 All update signals sent:', updateTime)

    // 8. ลบข้อมูล summary
    localStorage.removeItem('clearDebtorSummary')
    console.log('🗑️ Cleared summary')

    // 9. แสดงผลสำเร็จ
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

    console.log('✅ Redirecting to indexsavedebtor...')

    // 10. รอให้ storage event propagate
    await new Promise(resolve => setTimeout(resolve, 500))

    router.push('/indexsavedebtor')

  } catch (error) {
    console.error('❌ Error:', error)
    console.error('Stack:', error.stack)

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
