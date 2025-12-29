
<template>
  <div class="text-slate-700 antialiased selection:bg-blue-200 selection:text-blue-900">
    <div id="app" class="relative w-full h-screen flex overflow-hidden">
      <div class="mesh-bg"></div>
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>

      <sidebar />

      <main class="flex-1 flex flex-col relative z-10 min-h-0">
        <header class="h-16 flex items-center justify-between px-8 pt-4 pb-2 flex-shrink-0">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <i class="ph ph-files"></i>
              ระบบล้างลูกหนี้
            </h1>
            <p class="text-xs text-slate-800 mt-0.5">จัดการล้างลูกหนี้และติดตามประวัติการทำรายการ</p>
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

        <!-- Tabs Navigation -->
        <div class="px-8 py-4 flex-shrink-0">
          <div class="glass-panel p-2 rounded-2xl flex gap-2 shadow-sm">
            <button
              @click="activeTab = 'new'"
              class="flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              :class="activeTab === 'new'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-slate-600 hover:bg-white/50'"
            >
              <i class="ph ph-plus-circle text-lg"></i>
              สร้างรายการใหม่
            </button>
            <button
              @click="activeTab = 'history'"
              class="flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              :class="activeTab === 'history'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-slate-600 hover:bg-white/50'"
            >
              <i class="ph ph-clock-clockwise text-lg"></i>
              ประวัติการทำรายการ
            </button>
          </div>
        </div>

        <!-- TAB 1: NEW ENTRY (Selection) -->
        <div v-if="activeTab === 'new'" class="flex-1 px-8 pb-8 flex flex-col min-h-0">
          <div class="glass-panel rounded-2xl flex-1 flex flex-col shadow-lg min-h-0">

            <!-- Table Header -->
            <div class="px-6 py-4 border-b border-white/40 bg-white/20 flex-shrink-0">
              <h2 class="text-xl font-bold text-slate-900">เลือกรายการลูกหนี้</h2>
              <p class="text-sm text-slate-600 mt-1">กรุณาเลือกรายการลูกหนี้ที่ต้องการล้างบัญชี (สามารถเลือกได้หลายรายการ)</p>
            </div>

            <!-- Content Area -->
            <div class="overflow-y-auto flex-1 p-6">
              <div v-if="filteredItems.length === 0" class="text-center py-12 text-slate-500">
                <i class="ph ph-folder-open text-6xl mb-4 opacity-30"></i>
                <p>ไม่พบรายการลูกหนี้</p>
              </div>

              <!-- Selection Grid -->
              <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="item in filteredItems"
                  :key="item.id"
                  @click="toggleSelectItem(item.id)"
                  class="glass-input rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-xl border-2"
                  :class="selectedItems.has(item.id)
                    ? 'border-blue-500 bg-blue-50/50 shadow-lg'
                    : 'border-transparent hover:border-blue-200'"
                >
                  <div class="flex items-start gap-4">
                    <!-- Icon -->
                    <div class="flex-shrink-0">
                      <div
                        class="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm"
                        :class="selectedItems.has(item.id)
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                          : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600'"
                      >
                        <i class="ph-fill ph-buildings text-2xl"></i>
                      </div>
                    </div>

                    <!-- Content -->
                    <div class="flex-grow min-w-0">
                      <div class="flex justify-between items-start mb-2">
                        <div class="flex-grow min-w-0">
                          <h3 class="font-bold text-slate-800 text-sm truncate">{{ item.itemName }}</h3>
                          <p class="text-xs text-slate-500 font-mono mt-1">{{ item.department }}</p>
                        </div>
                        <div class="flex-shrink-0 ml-2">
                          <i
                            class="ph-fill ph-check-circle text-xl transition-all"
                            :class="selectedItems.has(item.id)
                              ? 'text-blue-600 opacity-100 scale-100'
                              : 'text-slate-500 opacity-40 scale-95'"
                          ></i>
                        </div>
                      </div>

                      <div class="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                        <span class="text-xs text-slate-500">ยอดหนี้</span>
                        <span
                          class="text-base font-bold"
                          :class="selectedItems.has(item.id) ? 'text-blue-600' : 'text-red-600'"
                        >
                          {{ formatCurrency(item.debtorAmount) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer with Summary & Action -->
            <div class="px-6 py-4 border-t border-white/40 bg-white/10 flex-shrink-0">
              <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-6">
                  <div class="text-center">
                    <p class="text-xs text-slate-500 mb-1">รายการที่เลือก</p>
                    <p class="text-2xl font-bold text-blue-600">{{ selectedItems.size }}</p>
                  </div>
                  <div class="h-12 w-px bg-slate-300"></div>
                  <div class="text-center">
                    <p class="text-xs text-slate-500 mb-1">ยอดรวม</p>
                    <p class="text-2xl font-bold text-red-600">{{ formatCurrency(selectedTotal) }}</p>
                  </div>
                </div>

                <button
                  @click="clearSelectedDebtors"
                  :disabled="selectedItems.size === 0"
                  class="px-8 py-3 rounded-xl font-medium shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white;"
                >
                  <i class="ph ph-broom text-lg"></i>
                  ดำเนินการล้างหนี้
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- TAB 2: HISTORY LIST -->
        <div v-if="activeTab === 'history'" class="flex-1 px-8 pb-8 flex flex-col min-h-0">
          <div class="glass-panel rounded-2xl flex-1 flex flex-col shadow-lg min-h-0">

            <!-- Table Header -->
            <div class="px-6 py-4 border-b border-white/40 bg-white/20 flex-shrink-0">
              <h2 class="text-xl font-bold text-slate-900">ประวัติการล้างลูกหนี้</h2>
            </div>

            <div class="overflow-y-auto flex-1 p-6">
              <div v-if="historyItems.length === 0" class="text-center py-12 text-slate-500">
                <i class="ph ph-folder-open text-6xl mb-4 opacity-30"></i>
                <p>ยังไม่มีประวัติการทำรายการ</p>
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="item in historyItems"
                  :key="item.id"
                  class="glass-input rounded-xl p-5 hover:shadow-md transition-all"
                >
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-sm">
                        <i class="ph-fill ph-check text-xl"></i>
                      </div>
                      <div>
                        <p class="font-bold text-slate-800">{{ item.items }}</p>
                        <p class="text-xs text-slate-500">{{ item.date }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-xs text-slate-500 mb-1">ยอดเงิน</p>
                      <p class="text-xl font-bold text-green-600">{{ formatCurrency(item.total) }}</p>
                    </div>
                  </div>

                  <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span class="px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                      ชำระสำเร็จ
                    </span>
                    <span class="text-xs text-slate-400">รหัสอ้างอิง: {{ item.referenceId }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-3 border-t border-white/40 bg-white/10 flex items-center justify-center flex-shrink-0">
              <p class="text-xs text-slate-500">แสดงประวัติทั้งหมด {{ historyItems.length }} รายการ</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { setupAxiosMock } from '@/fake/mockAxios'
import { options } from "@/components/data/departments"
import sidebar from '@/components/bar/sidebar.vue'
import CascadingSelect from '@/components/input/select/CascadingSelect.vue'

setupAxiosMock()

const router = useRouter()

const activeTab = ref('new')
const searchText = ref('')
const rawData = ref<any[]>([])
const selectedMain = ref("")
const selectedSub1 = ref("")
const selectedSub2 = ref("")
const selectedItems = ref<Set<string>>(new Set())

// ✅ ประวัติการทำรายการ
const historyItems = ref<any[]>([])

// ✅ แก้ไขฟังก์ชัน mapReceiptToDebtorItems
const mapReceiptToDebtorItems = (receipt: any) => {
  const items: any[] = []

  // ✅ รองรับทั้งโครงสร้างเก่า (receiptList) และใหม่ (debtorList + depositList)
  let itemList: any[] = []

  if (receipt.debtorList && receipt.depositList) {
    // โครงสร้างใหม่
    itemList = receipt.debtorList.map((debtor: any, idx: number) => {
      const deposit = receipt.depositList[idx] || {}
      return {
        itemName: debtor.itemName,
        note: debtor.debtornote || debtor.note || '',
        debtorAmount: Number(debtor.amount || 0),
        depositNetAmount: Number(deposit.netAmount || 0),
        fee: Number(deposit.fee || 0),
      }
    })
  } else if (receipt.receiptList) {
    // ✅ โครงสร้างเก่า (waybilldebtor) - แปลง receiptList
    itemList = receipt.receiptList.map((item: any) => ({
      itemName: item.itemName || '-',
      note: item.note || '',
      // ✅ สำคัญ: ใช้ amount เป็น debtorAmount
      debtorAmount: Number(item.amount || item.debtorAmount || 0),
      depositNetAmount: Number(item.depositNetAmount || 0),
      fee: Number(item.fee || 0),
    }))
  }

  if (!Array.isArray(itemList)) return items

  itemList.forEach((item: any, idx: number) => {
    // ✅ ตรวจสอบว่ามี debtorAmount จริงๆ
    const debtAmount = Number(item.debtorAmount || 0)

    if (debtAmount > 0) {
      items.push({
        id: `${receipt.projectCode}-item-${idx}`,
        receiptId: receipt.projectCode,
        itemName: item.itemName || '-',
        note: item.note || '',
        debtorAmount: debtAmount,
        depositNetAmount: Number(item.depositNetAmount || 0),
        fee: Number(item.fee || 0),
        department: receipt.mainAffiliationName || 'ไม่ระบุ',
        subDepartment: receipt.subAffiliationName1 || '-',
        fundName: receipt.fundName || '-',
        responsible: receipt.fullName || '-',
        phone: receipt.phone || '-',
        status: 'pending',
        _originalReceipt: receipt,
        _originalItem: item,
      })
    }
  })

  return items
}

// ✅ แก้ไขฟังก์ชัน loadData
const loadReceiptData = async () => {
  try {
    const stored = localStorage.getItem('fakeApi.receipts')

    if (!stored) {
      rawData.value = []
      return
    }

    const allReceipts = JSON.parse(stored)

    if (!Array.isArray(allReceipts)) {
      rawData.value = []
      return
    }

    // ✅ กรองเฉพาะ receipts ที่เป็น Debtor หรือ Waybill ที่มี receiptList
    const debtorReceipts = allReceipts.filter((r: any) =>
      r.moneyTypeNote === 'Debtor' ||
      (r.moneyTypeNote === 'Waybill' && r.receiptList && r.receiptList.length > 0)
    )

    console.log('📊 Debtor Receipts:', debtorReceipts)

    const allDebtorItems = debtorReceipts.flatMap(mapReceiptToDebtorItems)

    console.log('📋 All Debtor Items:', allDebtorItems)
    console.log('💰 Total Debtor Amount:', allDebtorItems.reduce((sum, item) => sum + item.debtorAmount, 0))

    rawData.value = allDebtorItems

  } catch (error) {
    console.error('❌ Error loading data:', error)
    rawData.value = []
  }
}

// ✅ โหลดประวัติ
const loadHistory = () => {
  try {
    const stored = localStorage.getItem('debtorClearHistory')
    if (stored) {
      historyItems.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('❌ Error loading history:', error)
  }
}

const filteredItems = computed(() => {
  let filtered = [...rawData.value]

  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.itemName?.toLowerCase().includes(search) ||
      item.note?.toLowerCase().includes(search) ||
      item.department?.toLowerCase().includes(search) ||
      item.subDepartment?.toLowerCase().includes(search)
    )
  }

  if (selectedMain.value) {
    filtered = filtered.filter(item => item.department === selectedMain.value)
  }

  if (selectedSub1.value) {
    filtered = filtered.filter(item => item.subDepartment === selectedSub1.value)
  }

  if (selectedSub2.value) {
    filtered = filtered.filter(item =>
      item._originalReceipt?.subAffiliationName2 === selectedSub2.value
    )
  }

  return filtered
})

const selectedTotal = computed(() => {
  const selectedIds = Array.from(selectedItems.value)
  return rawData.value
    .filter(item => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + item.debtorAmount, 0)
})

const formatCurrency = (amount: number | string) => {
  const n = typeof amount === 'string'
    ? Number(amount.toString().replace(/[^0-9.-]/g, ''))
    : amount || 0

  return n.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ✅ แก้ไขฟังก์ชัน clearSelectedDebtors
const clearSelectedDebtors = () => {
  if (selectedItems.value.size === 0) return

  const selectedIds = Array.from(selectedItems.value)
  const selectedList = rawData.value.filter(item =>
    selectedIds.includes(item.id)
  )

  if (selectedList.length === 0) return

  const groupedByReceipt = selectedList.reduce((acc, item) => {
    if (!acc[item.receiptId]) {
      acc[item.receiptId] = []
    }
    acc[item.receiptId].push(item)
    return acc
  }, {} as Record<string, any[]>)

  const receipts = Object.keys(groupedByReceipt).map(receiptId => {
    const itemsInReceipt = groupedByReceipt[receiptId]
    const firstItem = itemsInReceipt[0]
    const originalReceipt = firstItem._originalReceipt

    // ✅ สร้าง items โดยใช้ debtorAmount
    const items = itemsInReceipt.map(item => {
      const debtAmount = Number(item.debtorAmount || 0)

      console.log('📝 Creating item:', {
        itemName: item.itemName,
        debtorAmount: debtAmount
      })

      return {
        id: item.id,
        itemName: item.itemName,
        note: item.note,
        amount: debtAmount, // ✅ ส่งเป็น amount
        debtorAmount: debtAmount, // ✅ เก็บทั้งสองค่า
        depositNetAmount: Number(item.depositNetAmount || 0),
        fee: Number(item.fee || 0),
        responsible: item.responsible || originalReceipt?.fullName || 'ไม่ระบุ',
      }
    })

    const totalDebtorAmount = items.reduce((sum, item) =>
      sum + Number(item.debtorAmount || 0), 0
    )

    const totalPaidAmount = items.reduce((sum, item) =>
      sum + Number(item.depositNetAmount || 0), 0
    )

    console.log('📊 Receipt summary:', {
      receiptId,
      itemsCount: items.length,
      totalDebtorAmount,
    })

    return {
      receiptId,
      items: items,
      totalDebtorAmount: totalDebtorAmount,
      totalPaidAmount: totalPaidAmount,
      fullName: originalReceipt?.fullName || 'ไม่ระบุ',
      phone: originalReceipt?.phone || '-',
      department: firstItem.department || originalReceipt?.mainAffiliationName || 'ไม่ระบุ',
      subDepartment: firstItem.subDepartment || originalReceipt?.subAffiliationName1 || '-',
      fundName: originalReceipt?.fundName || '-',
      projectCode: receiptId,
      sendmoney: originalReceipt?.sendmoney || '-',
      mainAffiliationName: originalReceipt?.mainAffiliationName || firstItem.department || 'ไม่ระบุ',
      subAffiliationName1: originalReceipt?.subAffiliationName1 || firstItem.subDepartment || '-',
      subAffiliationName2: originalReceipt?.subAffiliationName2 || '',
      createdAt: originalReceipt?.createdAt || new Date().toISOString(),
      updatedAt: originalReceipt?.updatedAt || new Date().toISOString(),
    }
  })

  const summary = {
    receipts,
    totalDebtorAmount: receipts.reduce((sum, r) => sum + r.totalDebtorAmount, 0),
    totalPaidAmount: receipts.reduce((sum, r) => sum + r.totalPaidAmount, 0),
    totalItems: selectedList.length,
  }

  console.log('📤 Final Summary:', summary)
  console.log('💰 Total Debtor Amount:', summary.totalDebtorAmount)

  localStorage.setItem('clearDebtorSummary', JSON.stringify(summary))
  router.push(`/cleardebtor/multi`)
}

const toggleSelectItem = (id: string) => {
  if (selectedItems.value.has(id)) {
    selectedItems.value.delete(id)
  } else {
    selectedItems.value.add(id)
  }
}

onMounted(() => {
  loadReceiptData()
  loadHistory()
  window.addEventListener('focus', loadReceiptData)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', loadReceiptData)
})
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
