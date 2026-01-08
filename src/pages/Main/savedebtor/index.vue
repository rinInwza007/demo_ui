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

        <!-- Tabs Navigation -->
        <div class="px-8 py-4 flex-shrink-0">
          <div class="glass-panel p-2 rounded-2xl flex gap-2 shadow-sm">
            <button
              @click="activeTab = 'new'"
              class="flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              :class="
                activeTab === 'new'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-white/50'
              "
            >
              <i class="ph ph-plus-circle text-lg"></i>
              สร้างรายการใหม่
            </button>
            <button
              @click="activeTab = 'history'"
              class="flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              :class="
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-white/50'
              "
            >
              <i class="ph ph-clock-clockwise text-lg"></i>
              ประวัติการทำรายการ
            </button>
          </div>
        </div>

        <!-- TAB 1: NEW ENTRY (Selection) -->
        <div v-if="activeTab === 'new'" class="flex-1 px-8 pb-8 flex flex-col min-h-0">
          <div class="glass-panel rounded-2xl flex-1 flex flex-col shadow-lg min-h-0">
            <div class="px-6 py-4 border-b border-white/40 bg-white/20 flex-shrink-0">
              <h2 class="text-xl font-bold text-slate-900">เลือกรายการลูกหนี้</h2>
              <p class="text-sm text-slate-600 mt-1">
                กรุณาเลือกรายการลูกหนี้ที่ต้องการล้างบัญชี (สามารถเลือกได้หลายรายการ)
              </p>
            </div>

            <div class="overflow-y-auto flex-1 p-6">
              <div v-if="filteredItems.length === 0" class="text-center py-12 text-slate-500">
                <i class="ph ph-folder-open text-6xl mb-4 opacity-30"></i>
                <p>ไม่พบรายการลูกหนี้</p>
              </div>

              <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="item in filteredItems"
                  :key="item.id"
                  @click="toggleSelectItem(item.id)"
                  class="glass-input rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-xl border-2"
                  :class="
                    selectedItems.has(item.id)
                      ? 'border-blue-500 bg-blue-50/50 shadow-lg'
                      : 'border-transparent hover:border-blue-200'
                  "
                >
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0">
                      <div
                        class="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm"
                        :class="
                          selectedItems.has(item.id)
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                            : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600'
                        "
                      >
                        <i class="ph-fill ph-buildings text-2xl"></i>
                      </div>
                    </div>

                    <div class="flex-grow min-w-0">
                      <div class="flex justify-between items-start mb-2">
                        <div class="flex-grow min-w-0">
                          <h3 class="font-bold text-slate-800 text-sm truncate">{{ item.itemName }}</h3>
                          <p class="text-xs text-slate-500 font-mono mt-1">{{ item.department }}</p>
                        </div>
                        <div class="flex-shrink-0 ml-2">
                          <i
                            class="ph-fill ph-check-circle text-xl transition-all"
                            :class="
                              selectedItems.has(item.id)
                                ? 'text-blue-600 opacity-100 scale-100'
                                : 'text-slate-500 opacity-40 scale-95'
                            "
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
                  style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white"
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
                  class="glass-input rounded-xl overflow-hidden hover:shadow-md transition-all"
                >
                  <div class="p-5">
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-sm"
                        >
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
                      <span
                        class="px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 border border-green-200"
                      >
                        ชำระสำเร็จ
                      </span>
                      <div class="flex items-center gap-3">
                        <!-- PDF BUTTON -->
                        <button
                          @click="viewPdf(item.referenceId)"
                          class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                        >
                          <i class="ph ph-file-text text-base"></i>
                          ดู PDF
                        </button>
                        <div class="w-px h-4 bg-gray-300 mx-1"></div>
                        <button
                          @click="toggleHistoryDetail(item.id)"
                          class="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                        >
                          {{ expandedHistory.has(item.id) ? 'ซ่อน' : 'ดู' }}รายละเอียด
                          <i
                            class="ph text-base transition-transform duration-200"
                            :class="expandedHistory.has(item.id) ? 'ph-caret-up' : 'ph-caret-right'"
                          ></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    leave-active-class="transition-all duration-200 ease-in"
                    enter-from-class="opacity-0 max-h-0"
                    enter-to-class="opacity-100 max-h-[1000px]"
                    leave-from-class="opacity-100 max-h-[1000px]"
                    leave-to-class="opacity-0 max-h-0"
                  >
                    <div
                      v-if="expandedHistory.has(item.id)"
                      class="border-t border-slate-200 bg-slate-50/50 p-5"
                    >
                      <div v-if="item.payments && item.payments.length > 0">
                        <div class="flex items-center gap-2 mb-4">
                          <i class="ph-fill ph-currency-circle-dollar text-lg text-slate-600"></i>
                          <h3 class="font-bold text-slate-700 text-sm">วิธีการชำระเงิน</h3>
                        </div>

                        <div class="space-y-3">
                          <div
                            v-for="(payment, idx) in item.payments"
                            :key="idx"
                            class="bg-white rounded-lg p-4 border border-slate-200 shadow-sm"
                          >
                            <div class="flex items-start justify-between mb-3">
                              <div class="flex items-center gap-2">
                                <div
                                  class="w-8 h-8 rounded-lg flex items-center justify-center"
                                  :class="
                                    payment.type === 'transfer'
                                      ? 'bg-blue-100 text-blue-600'
                                      : payment.type === 'cash'
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-purple-100 text-purple-600'
                                  "
                                >
                                  <i
                                    class="ph-fill text-lg"
                                    :class="
                                      payment.type === 'transfer'
                                        ? 'ph-bank'
                                        : payment.type === 'cash'
                                          ? 'ph-money'
                                          : 'ph-credit-card'
                                    "
                                  ></i>
                                </div>
                                <div>
                                  <p class="font-bold text-slate-800 text-sm">
                                    {{
                                      payment.type === 'transfer'
                                        ? 'ฝากเข้าบัญชี'
                                        : payment.type === 'cash'
                                          ? 'เงินสด'
                                          : 'เช็ค'
                                    }}
                                  </p>
                                  <p class="text-xs text-slate-500" v-if="payment.bankName">
                                    {{ payment.bankName }}
                                  </p>
                                </div>
                              </div>
                              <p class="font-bold text-slate-800">{{ formatCurrency(payment.amount) }}</p>
                            </div>

                            <div class="space-y-1.5 text-xs">
                              <div v-if="payment.type === 'transfer' && payment.accountNumber" class="flex justify-between text-slate-600">
                                <span>เลขที่บัญชี:</span>
                                <span class="font-mono">{{ payment.accountNumber }}</span>
                              </div>
                              <div v-if="payment.type === 'check' && payment.checkNumber" class="flex justify-between text-slate-600">
                                <span>เลขที่เช็ค:</span>
                                <span class="font-mono">{{ payment.checkNumber }}</span>
                              </div>
                              <div v-if="payment.referenceId" class="flex justify-between text-slate-500">
                                <span>เลขที่อ้างอิง:</span>
                                <span class="font-mono">{{ payment.referenceId }}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="mt-4 pt-3 border-t border-slate-200 text-right">
                          <span class="text-xs text-slate-400">รหัสอ้างอิง: {{ item.referenceId }}</span>
                        </div>
                      </div>

                      <div v-else class="text-center py-4 text-slate-400 text-sm">
                        <i class="ph ph-info text-2xl mb-2"></i>
                        <p>ไม่มีข้อมูลการชำระเงิน</p>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </div>

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
import { ref, onMounted, computed, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import sidebar from '@/components/bar/sidebar.vue'
import { setupAxiosMock } from '@/fake/mockAxios'
import { useAuthStore } from '@/stores/auth'

setupAxiosMock()

const router = useRouter()
const auth = useAuthStore()
const viewPdf = (id: string) => {
  router.push(`/pdfclear/${id}`)
}
const activeTab = ref<'new' | 'history'>('new')
const searchText = ref('')
const rawData = ref<any[]>([])
const selectedMain = ref('')
const selectedSub1 = ref('')
const selectedSub2 = ref('')
const selectedItems = ref<Set<string>>(new Set())
const historyItems = ref<any[]>([])
const isLoading = ref(false)
const expandedHistory = ref<Set<string>>(new Set())

let storageWatcher: any = null
const currentUpdateTime = ref('')

const isReceivableItem = (itemName: string) => {
  const receivableKeywords = [
    'ลูกหนี้',
    'ค่ารักษาพยาบาล',
    'ค่าห้องพิเศษ',
    'ค่ายา',
    'ค่าตรวจวิเคราะห์',
    'ค่าเอกซเรย์',
    'ค่าบริการพยาบาล',
    'ค่าตรวจสุขภาพ',
    'ค่าดูแลผู้ป่วย',
    'ค่ารักษาทันตกรรม',
    'ค่าจัดฟัน',
    'ค่าถอนฟัน',
    'ค่าอุดฟัน',
    'ค่าทำฟันปลอม',
    'ค่าห้องพักผู้ป่วย',
    'ค่าผ่าตัด',
    'ค่าห้องฉุกเฉิน',
    'ค่าเครื่องมือแพทย์',
    'ค่าบริการทดสอบวัสดุ',
    'ค่าบริการวิเคราะห์ดิน',
    'ค่าบริการออกแบบ',
    'ค่าบริการที่ปรึกษา',
    'ค่าเช่าอุปกรณ์',
    'ค่าตรวจวินิจฉัย',
    'ค่าตรวจทางห้องปฏิบัติการ',
    'ค่าบริการเวชกรรม',
    'ค่าใช้ห้องผ่าตัด',
    'ค่าบริการจัดยา',
    'ค่าตรวจวิเคราะห์ยา',
    'ค่าบริการเภสัชกรรม'
  ]

  return receivableKeywords.some(keyword => itemName?.includes(keyword))
}

const createStableId = (receipt, item, idx) => {
  const dataString = `${receipt.id}-${receipt.projectCode}-${idx}-${item.itemName}-${item.debtorAmount || item.amount || item.subtotal || 0}`;
  const hash = dataString.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
  }, 0);
  return `${receipt.projectCode}-item-${idx}-${Math.abs(hash).toString(36)}`;
};

const mapReceiptToDebtorItems = (receipt) => {
  const items = [];
  let itemList = [];

  if (receipt.debtorList && Array.isArray(receipt.debtorList)) {
    itemList = receipt.debtorList.map((debtor, idx) => {
      const deposit = receipt.depositList?.[idx] || {};
      return {
        itemName: debtor.itemName,
        note: debtor.debtornote || debtor.note || '',
        debtorAmount: Number(debtor.amount || 0),
        depositNetAmount: Number(deposit.netAmount || 0),
        fee: Number(deposit.fee || 0),
      };
    });
  } else if (receipt.receiptList && Array.isArray(receipt.receiptList)) {
    itemList = receipt.receiptList.map((item) => ({
      itemName: item.itemName || '-',
      note: item.note || '',
      debtorAmount: Number(item.amount || item.debtorAmount || item.subtotal || 0),
      depositNetAmount: Number(item.depositNetAmount || 0),
      fee: Number(item.fee || 0),
    }));
  }

  if (!Array.isArray(itemList) || itemList.length === 0) {
    return items;
  }

  itemList.forEach((item, idx) => {
    const itemName = item.itemName || '-';
    const debtAmount = Number(item.debtorAmount || 0);

    if (isReceivableItem(itemName)) {
      const uniqueId = createStableId(receipt, item, idx);

      items.push({
        id: uniqueId,
        receiptId: receipt.projectCode,
        itemName: itemName,
        note: item.note || '',
        debtorAmount: debtAmount,
        depositNetAmount: Number(item.depositNetAmount || 0),
        fee: Number(item.fee || 0),
        department: receipt.mainAffiliationName || receipt.affiliationName || 'ไม่ระบุ',
        subDepartment: receipt.subAffiliationName1 || '-',
        fundName: receipt.fundName || '-',
        responsible: receipt.fullName || '-',
        phone: receipt.phone || '-',
        status: 'pending',
        _originalReceipt: receipt,
        _originalItem: item,
        _originalIndex: idx,
      });
    }
  });

  return items;
};

const loadReceiptData = async () => {
  console.log('📥 Loading receipt data...')
  isLoading.value = true

  try {
    if (!auth.isLoggedIn) {
      rawData.value = []
      return
    }

    // ✅ เปลี่ยนจาก localStorage เป็น API
    const res = await axios.get('/getReceipt')
    const allReceipts = res.data || []

    if (!Array.isArray(allReceipts)) {
      console.log('⚠️ Invalid data format')
      rawData.value = []
      return
    }

    const scopedReceipts =
      auth.role === 'user'
        ? allReceipts.filter((r: any) => {
            const rid =
              r.affiliationId ||
              r.mainAffiliationId ||
              r.mainAffiliationCode ||
              r._affiliationId ||
              null
            if (!rid) return false
            return rid === auth.affiliationId
          })
        : allReceipts

    const debtorReceipts = scopedReceipts.filter((r: any) =>
      r.moneyTypeNote === 'Debtor' ||
      (r.moneyTypeNote === 'Waybill' &&
        (
          (Array.isArray(r.debtorList) && r.debtorList.length >= 0) ||
          (Array.isArray(r.receiptList) && r.receiptList.length > 0)
        )
      )
    )

    const allDebtorItems = debtorReceipts.flatMap(mapReceiptToDebtorItems)
    rawData.value = allDebtorItems

    console.log('✅ Loaded', allDebtorItems.length, 'debtor items')
  } catch (error) {
    console.error('❌ Load error:', error)
    rawData.value = []
  } finally {
    isLoading.value = false
  }
}

const loadHistory = () => {
  console.log('📜 Loading history...')
  try {
    const stored = localStorage.getItem('debtorClearHistory')

    if (stored) {
      const parsed = JSON.parse(stored)
      console.log('📦 History data found:', parsed)

      const hasPayments = parsed.some((item: any) => item.payments && item.payments.length > 0)

      if (hasPayments) {
        historyItems.value = parsed
        console.log('✅ Using stored history with payments')
      } else {
        console.log('⚠️ Stored history has no payments, using mock data')
        historyItems.value = getMockHistory()
      }
    } else {
      console.log('📭 No history found, using mock data')
      historyItems.value = getMockHistory()
    }
  } catch (error) {
    console.error('❌ History load error:', error)
    historyItems.value = getMockHistory()
  }
}

const getMockHistory = () => {
  return [
    {
      id: 'hist-001',
      items: '2 หน่วยงาน (5 รายการ)',
      date: '6 ม.ค. 2026 14:30',
      total: 15000,
      referenceId: 'CLEAR-1234567',
      payments: [
        {
          type: 'transfer',
          amount: 10000,
          bankName: 'ธนาคารกรุงไทย',
          accountNumber: '512-1-43488-6',
          referenceId: 'PAY-1234567890'
        },
        {
          type: 'cash',
          amount: 5000,
          referenceId: 'PAY-1234567891'
        }
      ]
    },
    {
      id: 'hist-002',
      items: '3 หน่วยงาน (8 รายการ)',
      date: '5 ม.ค. 2026 10:15',
      total: 25000,
      referenceId: 'CLEAR-2345678',
      payments: [
        {
          type: 'transfer',
          amount: 15000,
          bankName: 'ธนาคารกสิกรไทย',
          accountNumber: '123-4-56789-0',
          referenceId: 'PAY-2345678901'
        },
        {
          type: 'check',
          amount: 10000,
          bankName: 'ธนาคารไทยพาณิชย์',
          checkNumber: 'CHK-9876543',
          referenceId: 'PAY-2345678902'
        }
      ]
    },
    {
      id: 'hist-003',
      items: '1 หน่วยงาน (3 รายการ)',
      date: '4 ม.ค. 2026 16:45',
      total: 8500,
      referenceId: 'CLEAR-3456789',
      payments: [
        {
          type: 'cash',
          amount: 8500,
          referenceId: 'PAY-3456789012'
        }
      ]
    }
  ]
}

const filteredItems = computed(() => {
  let filtered = [...rawData.value]

  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter((item) => {
      return (
        item.itemName?.toLowerCase().includes(search) ||
        item.note?.toLowerCase().includes(search) ||
        item.department?.toLowerCase().includes(search) ||
        item.subDepartment?.toLowerCase().includes(search)
      )
    })
  }

  if (selectedMain.value) filtered = filtered.filter((item) => item.department === selectedMain.value)
  if (selectedSub1.value) filtered = filtered.filter((item) => item.subDepartment === selectedSub1.value)
  if (selectedSub2.value) {
    filtered = filtered.filter((item) => item._originalReceipt?.subAffiliationName2 === selectedSub2.value)
  }

  return filtered
})

const selectedTotal = computed(() => {
  const selectedIds = Array.from(selectedItems.value)
  return rawData.value
    .filter((item) => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + Number(item.debtorAmount || 0), 0)
})

const formatCurrency = (amount: number | string) => {
  const n =
    typeof amount === 'string'
      ? Number(amount.toString().replace(/[^0-9.-]/g, ''))
      : (amount as number) || 0

  return n.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const handleFocus = () => {
  console.log('window focused')
}

const clearSelectedDebtors = () => {
  if (selectedItems.value.size === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'กรุณาเลือกรายการ',
      text: 'โปรดเลือกรายการลูกหนี้ที่ต้องการล้างอย่างน้อย 1 รายการ',
      confirmButtonColor: '#7E22CE'
    })
    return
  }

  const selectedIds = Array.from(selectedItems.value)
  const selectedList = rawData.value.filter((item) => selectedIds.includes(item.id))
  if (selectedList.length === 0) return

  const groupedByReceipt = selectedList.reduce((acc, item) => {
    if (!acc[item.receiptId]) acc[item.receiptId] = []
    acc[item.receiptId].push(item)
    return acc
  }, {} as Record<string, any[]>)

  const receipts = Object.keys(groupedByReceipt).map((receiptId) => {
    const itemsInReceipt = groupedByReceipt[receiptId]
    const firstItem = itemsInReceipt[0]
    const originalReceipt = firstItem._originalReceipt

    const items = itemsInReceipt.map((item) => {
      const debtAmount = Number(item.debtorAmount || 0)
      return {
        id: item.id,
        itemName: item.itemName,
        note: item.note,
        amount: debtAmount,
        debtorAmount: debtAmount,
        depositNetAmount: Number(item.depositNetAmount || 0),
        fee: Number(item.fee || 0),
        responsible: item.responsible || originalReceipt?.fullName || 'ไม่ระบุ',
      }
    })

    const totalDebtorAmount = items.reduce((sum, i) => sum + Number(i.debtorAmount || 0), 0)
    const totalPaidAmount = items.reduce((sum, i) => sum + Number(i.depositNetAmount || 0), 0)

    return {
      receiptId,
      items,
      totalDebtorAmount,
      totalPaidAmount,
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
    totalDebtorAmount: receipts.reduce((sum, r) => sum + Number(r.totalDebtorAmount || 0), 0),
    totalPaidAmount: receipts.reduce((sum, r) => sum + Number(r.totalPaidAmount || 0), 0),
    totalItems: selectedList.length,
  }

  localStorage.setItem('clearDebtorSummary', JSON.stringify(summary))
  router.push(`/cleardebtor/multi`)
}

const toggleSelectItem = (id: string) => {
  if (selectedItems.value.has(id)) selectedItems.value.delete(id)
  else selectedItems.value.add(id)
}

const toggleHistoryDetail = (id: string) => {
  if (expandedHistory.value.has(id)) expandedHistory.value.delete(id)
  else expandedHistory.value.add(id)
}

const handleReceiptsUpdate = async (event?: CustomEvent) => {
  console.log('📢 Receipts updated:', event?.detail)
  await nextTick()
  await loadReceiptData()
  loadHistory()
}

watch(activeTab, async (newTab) => {
  console.log('📑 Tab changed:', newTab)
  await nextTick()

  if (newTab === 'new') {
    await loadReceiptData()
  } else if (newTab === 'history') {
    loadHistory()
  }
})

onMounted(async () => {
  console.log('🚀 Component mounted')

  await loadReceiptData()
  loadHistory()

  currentUpdateTime.value = localStorage.getItem('receipts_last_update') || Date.now().toString()

  window.addEventListener('focus', handleFocus)
  // ✅ แก้ไขตรงนี้
  window.addEventListener('receipts-updated', handleReceiptsUpdate as EventListener)

  storageWatcher = setInterval(async () => {
    const lastUpdate = localStorage.getItem('receipts_last_update')

    if (lastUpdate && lastUpdate !== currentUpdateTime.value) {
      console.log('🔄 Timestamp changed (fallback)')
      currentUpdateTime.value = lastUpdate
      await loadReceiptData()
      loadHistory() // ✅ เพิ่มบรรทัดนี้
    }
  }, 1000)
})

onBeforeUnmount(() => {
  console.log('👋 Component unmounting')

  window.removeEventListener('focus', handleFocus)
  // ✅ แก้ไขตรงนี้ด้วย
  window.removeEventListener('receipts-updated', handleReceiptsUpdate as EventListener)

  if (storageWatcher) {
    clearInterval(storageWatcher)
  }

  console.log('✅ Cleanup complete')
})

onBeforeUnmount(() => {
  window.removeEventListener('receipts-updated', handleReceiptsUpdate as EventListener)

  if (storageWatcher) {
    clearInterval(storageWatcher)
  }
})

if (typeof window !== 'undefined') {
  (window as any).debugSaveDebtor = {
    loadReceiptData,
    loadHistory,
    rawData,
    currentUpdateTime,
    selectedItems,
    expandedHistory
  }

  console.log('🔧 Debug tools available: window.debugSaveDebtor')
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
  background-image: radial-gradient(at 0% 0%, hsla(253, 16%, 7%, 1) 0, transparent 50%),
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
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>
