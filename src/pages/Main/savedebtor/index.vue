<!-- //SaveDebtor/index-->
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
              :class="activeTab === 'new' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg' : 'text-slate-600 hover:bg-white/50'"
            >
              <i class="ph ph-plus-circle text-lg"></i>
              สร้างรายการใหม่
            </button>
            <button
              @click="activeTab = 'history'"
              class="flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              :class="activeTab === 'history' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg' : 'text-slate-600 hover:bg-white/50'"
            >
              <i class="ph ph-clock-clockwise text-lg"></i>
              ประวัติการทำรายการ
            </button>
          </div>
        </div>

        <!-- TAB 1: NEW ENTRY -->
        <div v-if="activeTab === 'new'" class="flex-1 px-8 pb-8 flex flex-col min-h-0">
          <div class="glass-panel rounded-2xl flex-1 flex flex-col shadow-lg min-h-0">
            <div class="px-6 py-4 border-b border-white/40 bg-white/20 flex-shrink-0">
              <h2 class="text-xl font-bold text-slate-900">เลือกรายการลูกหนี้</h2>
              <p class="text-sm text-slate-600 mt-1">
                กรุณาเลือกรายการลูกหนี้ที่ต้องการล้างบัญชี (แสดงเฉพาะรายการที่ยังไม่ได้ล้าง)
              </p>
            </div>

            <div class="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/40 bg-white/10 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div class="col-span-3">รายการ</div>
              <div class="col-span-3 text-right">ยอดยกยอดจากต้นปี</div>
              <div class="col-span-3 text-right">ยอดที่ล้างสะสมในปีนี้</div>
              <div class="col-span-3 text-right">ยอดคงเหลือสุทธิ</div>
            </div>

            <div class="overflow-y-auto flex-1 p-6">
              <div v-if="filteredItems.length === 0" class="text-center py-12 text-slate-500">
                <i class="ph ph-folder-open text-6xl mb-4 opacity-30"></i>
                <p>ไม่พบรายการลูกหนี้ที่ยังไม่ได้ล้าง</p>
              </div>

              <div v-else class="space-y-2">
                <div
                  v-for="item in paginatedItemsNew"
                  :key="item.id"
                  @click="toggleSelectItem(item.id)"
                  class="grid grid-cols-12 gap-4 px-4 py-3 cursor-pointer
                       transition-colors duration-150
                       rounded-xl items-center"
                  :class="selectedItems.has(item.id)
                    ? 'bg-blue-50'
                    : 'hover:bg-slate-50'"
                >
                  <!-- Checkbox + รายการ (col-span-3) -->
                  <div class="col-span-3 flex items-center gap-3">
                    <div
                      class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                             border transition-all duration-150"
                      :class="selectedItems.has(item.id)
                        ? 'bg-green-600 text-white border-green-600 shadow-sm'
                        : 'bg-white text-slate-400 border-slate-300 group-hover:border-green-400'"
                    >
                      <i
                        class="ph-bold text-sm leading-none"
                        :class="selectedItems.has(item.id) ? 'ph-check' : ''"
                      ></i>
                    </div>
                    <div class="min-w-0">
                      <p class="font-bold text-slate-800 text-sm truncate">
                        {{ item.itemName }}
                      </p>
                      <span
                        v-if="item._count && item._count > 1"
                        class="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold"
                      >
                        {{ item._count }} รายการ
                      </span>
                      <p class="text-xs text-slate-500 truncate">
                        {{ item.department }} • {{ item.subDepartment }}
                      </p>
                      <p v-if="item.note" class="text-xs text-slate-400 truncate mt-0.5">
                        {{ item.note }}
                      </p>
                    </div>
                  </div>

                  <!-- ยอดยกยอดจากต้นปี (col-span-3) -->
                  <div class="col-span-3 text-right">
                    <p class="text-base font-bold text-slate-700">
                       {{ formatCurrency(item.depositNetAmount || 0) }}
                    </p>
                  </div>

                  <!-- ยอดที่ล้างสะสมในปีนี้ (col-span-3) -->
                  <div class="col-span-3 text-right">
                    <p class="text-base font-bold text-green-600">
                       {{ formatCurrency(item.debtorAmount) }}
                    </p>
                  </div>

                  <!-- ยอดคงเหลือสุทธิ (col-span-3) -->
                  <div class="col-span-3 text-right">
                    <p class="text-base font-bold text-red-600">
                      {{ formatCurrency(item.balanceAmount || 0) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination Controls for New Tab -->
            <div v-if="totalPagesNew > 1" class="px-6 py-3 border-t border-white/40 bg-white/5 flex items-center justify-center flex-shrink-0">
              <div class="flex items-center gap-2">
                <button
                  @click="goToPageNew(currentPageNew - 1)"
                  :disabled="currentPageNew === 1"
                  class="w-9 h-9 rounded-lg glass-input flex items-center justify-center text-slate-600 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <i class="ph ph-caret-left text-lg"></i>
                </button>

                <template v-for="page in totalPagesNew" :key="page">
                  <button
                    v-if="page === 1 || page === totalPagesNew || (page >= currentPageNew - 1 && page <= currentPageNew + 1)"
                    @click="goToPageNew(page)"
                    class="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
                    :class="currentPageNew === page
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
                      : 'glass-input text-slate-600 hover:text-purple-600'"
                  >
                    {{ page }}
                  </button>
                  <span v-else-if="page === currentPageNew - 2 || page === currentPageNew + 2" class="text-slate-400 px-1">...</span>
                </template>

                <button
                  @click="goToPageNew(currentPageNew + 1)"
                  :disabled="currentPageNew === totalPagesNew"
                  class="w-9 h-9 rounded-lg glass-input flex items-center justify-center text-slate-600 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <i class="ph ph-caret-right text-lg"></i>
                </button>
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
        <p class="text-xs text-slate-500 mb-1">ยอดที่เลือก</p>
        <p class="text-2xl font-bold text-purple-600">{{ formatCurrency(selectedTotal) }}</p>
      </div>
      <div class="h-12 w-px bg-slate-300"></div>
      <div class="text-center">
        <p class="text-xs text-slate-500 mb-1">ยอดคงเหลือสุทธิทั้งหมด</p>
        <p class="text-2xl font-bold text-red-600">{{ formatCurrency(totalBalanceAmount) }}</p>
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
                <div v-for="item in paginatedItemsHistory" :key="item.id" class="glass-input rounded-xl overflow-hidden hover:shadow-md transition-all">
                  <div class="p-5">
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-sm">
                          <i class="ph-fill ph-check text-xl"></i>
                        </div>
                        <div>
                       <div>
  <p class="font-bold text-slate-800">{{ item.itemsText || (Array.isArray(item.items) ? item.items.map(i => i.itemName).join(', ') : item.items) }}</p>
  <p class="text-xs text-slate-500">{{ item.date }}</p>
</div>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="text-xs text-slate-500 mb-1">ยอดเงิน</p>
                        <p class="text-xl font-bold text-green-600">{{ formatCurrency(item.total) }}</p>
                      </div>
                    </div>

                    <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span class="px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                        ล้างลูกหนี้สำเร็จ
                      </span>
                      <div class="flex items-center gap-3">
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
                          <i class="ph text-base transition-transform duration-200" :class="expandedHistory.has(item.id) ? 'ph-caret-up' : 'ph-caret-right'"></i>
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
                    <div v-if="expandedHistory.has(item.id)" class="border-t border-slate-200 bg-slate-50/50 p-5">
                      <div v-if="item.payments && item.payments.length > 0">
                        <div class="flex items-center gap-2 mb-4">
                          <i class="ph-fill ph-currency-circle-dollar text-lg text-slate-600"></i>
                          <h3 class="font-bold text-slate-700 text-sm">วิธีการชำระเงิน</h3>
                        </div>

                        <div class="space-y-3">
                          <div v-for="(payment, idx) in item.payments" :key="idx" class="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
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
                                    {{ payment.type === 'transfer' ? 'ฝากเข้าบัญชี' : payment.type === 'cash' ? 'เงินสด' : 'เช็ค' }}
                                  </p>
                                  <p class="text-xs text-slate-500" v-if="payment.bankName">{{ payment.bankName }}</p>
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

            <!-- Pagination Controls for History Tab -->
            <div v-if="totalPagesHistory > 1" class="px-6 py-3 border-t border-white/40 bg-white/5 flex items-center justify-center flex-shrink-0">
              <div class="flex items-center gap-2">
                <button
                  @click="goToPageHistory(currentPageHistory - 1)"
                  :disabled="currentPageHistory === 1"
                  class="w-9 h-9 rounded-lg glass-input flex items-center justify-center text-slate-600 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <i class="ph ph-caret-left text-lg"></i>
                </button>

                <template v-for="page in totalPagesHistory" :key="page">
                  <button
                    v-if="page === 1 || page === totalPagesHistory || (page >= currentPageHistory - 1 && page <= currentPageHistory + 1)"
                    @click="goToPageHistory(page)"
                    class="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
                    :class="currentPageHistory === page
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
                      : 'glass-input text-slate-600 hover:text-purple-600'"
                  >
                    {{ page }}
                  </button>
                  <span v-else-if="page === currentPageHistory - 2 || page === currentPageHistory + 2" class="text-slate-400 px-1">...</span>
                </template>
                <button
                  @click="goToPageHistory(currentPageHistory + 1)"
                  :disabled="currentPageHistory === totalPagesHistory"
                  class="w-9 h-9 rounded-lg glass-input flex items-center justify-center text-slate-600 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <i class="ph ph-caret-right text-lg"></i>
                </button>
              </div>
            </div>

            <div class="px-6 py-3 border-t border-white/40 bg-white/10 flex items-center justify-center flex-shrink-0">
              <p class="text-xs text-slate-500">
                แสดงประวัติ {{ ((currentPageHistory - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPageHistory * itemsPerPage, historyItems.length) }} จาก {{ historyItems.length }} รายการ
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, onActivated } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import sidebar from '@/components/bar/sidebar.vue'
import { setupAxiosMock } from '@/fake/mockAxios'
import { useAuthStore } from '@/stores/auth'
import { useSummaryStore } from '@/stores/summary'
import { storeToRefs } from 'pinia'
import { filterDebtorsByPermission } from '@/components/utils/filterdebtor'
import { reciptService } from '@/services/ReciptService'
import { getAllOptions, getItemById, getItemByName } from '@/components/data/ItemNameOption'
import { clearDebtorService } from '@/services/ClearDebtorService'

/* =========================
 * Constants
 * ========================= */
const ITEMS_PER_PAGE = 5
const STORAGE_HISTORY_KEY = 'debtorClearHistory'
const STORAGE_SUMMARY_KEY = 'clearDebtorSummary'
const DEBUG = import.meta.env.DEV

const debug = (...args: any[]) => {
  if (DEBUG) console.log(...args)
}

/* =========================
 * Setup
 * ========================= */
setupAxiosMock()
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

/* =========================
 * Stores
 * ========================= */
const summaryStore = useSummaryStore()
const { ledger, totals } = storeToRefs(summaryStore)

/* =========================
 * State
 * ========================= */
const activeTab = ref<'new' | 'history'>('new')

const rawData = ref<any[]>([])
const historyItems = ref<any[]>([])

const selectedItems = ref<Set<string>>(new Set())
const expandedHistory = ref<Set<string>>(new Set())

const isLoading = ref(false)

/* =========================
 * Pagination State
 * ========================= */
const currentPageNew = ref(1)
const currentPageHistory = ref(1)
const itemsPerPage = ITEMS_PER_PAGE

/* =========================
 * Utils
 * ========================= */
const formatCurrency = (amount: number | string) => {
  const n =
    typeof amount === 'string'
      ? Number(amount.replace(/[^0-9.-]/g, ''))
      : amount || 0

  return n.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
/* =========================
 * ✅ Load Receipt Data (กรองรายการที่ล้างแล้ว)
 * ========================= */
/* =========================
 * ✅ Load Receipt Data (กรองรายการที่ล้างแล้ว)
 * ========================= */
const loadReceiptData = async () => {
  console.log('📥 Loading debtor data...')
  isLoading.value = true

  try {
    const receipts = await reciptService.getAll()
    console.log('📦 Total receipts loaded:', receipts.length)

    // ✅ แปลง receipts เป็น array ของ items
    const allItems: any[] = []

    receipts.forEach((receipt) => {
      console.log('🔍 Processing receipt:', {
        waybillNumber: receipt.waybillNumber,
        hasDebtorList: !!receipt.debtorList,
        debtorListLength: receipt.debtorList?.length || 0
      })

      // ✅ ใช้ debtorList แทน receiptList
      if (!receipt.debtorList || receipt.debtorList.length === 0) {
        console.warn(`⚠️ Receipt ${receipt.waybillNumber} has no debtorList`)
        return
      }

      receipt.debtorList.forEach((item: any) => {
        // ✅ ตรวจสอบว่าเป็น receivable และยังไม่ได้ล้าง
        const itemType = getItemType(item.itemName)
        const isClearedDebt = item.isClearedDebt === true

        console.log(`📝 Processing debtor item:`, {
          itemName: item.itemName,
          amount: item.amount,
          detectedType: itemType,
          isClearedDebt,
          willShow: itemType === 'receivable' && !isClearedDebt
        })

        // ✅ เฉพาะ receivable ที่ยังไม่ได้ล้าง
        if (itemType === 'receivable' && !isClearedDebt) {
          allItems.push({
            // ✅ ใช้ waybillNumber + itemName + timestamp เป็น unique ID
            id: `${receipt.waybillNumber}-${item.itemName}-${Date.now()}-${Math.random()}`,
            receiptId: receipt.waybillNumber,
            itemName: item.itemName,

            // ✅ ใช้ amount จาก debtorList (ยอดลูกหนี้)
            debtorAmount: Number(item.amount || 0),

            // ✅ ยอดคงเหลือ = ยอดลูกหนี้ (เพราะยังไม่ได้ล้าง)
            balanceAmount: Number(item.amount || 0),

            // ✅ ไม่ต้องมี depositNetAmount
            depositNetAmount: 0,

            // ข้อมูลหน่วยงาน
            department: receipt.mainAffiliationName || receipt.affiliationName || '-',
            subDepartment: receipt.subAffiliationName1 || '-',
            responsible: receipt.fullName || '-',

            // เก็บ reference กลับไป receipt ต้นฉบับ
            _originalReceipt: receipt,
            note: item.debtornote || ''
          })
        }
      })
    })

    rawData.value = allItems

    console.log('✅ Processed items:', {
      total: allItems.length,
      sample: allItems.slice(0, 3)
    })

  } catch (err) {
    console.error('❌ Load error:', err)
    rawData.value = []
  } finally {
    isLoading.value = false
  }
}

/* =========================
 * Load History
 * ========================= */
const loadHistory = () => {
  historyItems.value = clearDebtorService.getHistory()
}
/* =========================
 * Computed - Group Items
 * ========================= */
const filteredItems = computed(() => {
  // ✅ ไม่ต้อง group แล้ว แสดงทีละรายการตามที่กรอกมา
  return rawData.value
})
/* =========================
 * Pagination - New Tab
 * ========================= */
const totalPagesNew = computed(() =>
  Math.ceil(filteredItems.value.length / ITEMS_PER_PAGE)
)

const paginatedItemsNew = computed(() => {
  const start = (currentPageNew.value - 1) * ITEMS_PER_PAGE
  return filteredItems.value.slice(start, start + ITEMS_PER_PAGE)
})

/* =========================
 * Pagination - History Tab
 * ========================= */
const totalPagesHistory = computed(() =>
  Math.ceil(historyItems.value.length / ITEMS_PER_PAGE)
)

const paginatedItemsHistory = computed(() => {
  const start = (currentPageHistory.value - 1) * ITEMS_PER_PAGE
  return historyItems.value.slice(start, start + ITEMS_PER_PAGE)
})

/* =========================
 * Selected Total
 * ========================= */
const selectedTotal = computed(() =>
  rawData.value
    .filter(i => selectedItems.value.has(i.id))
    .reduce((sum, i) => sum + Number(i.balanceAmount || 0), 0)
)
/* =========================
 * Clear Selected Debtors
 * ========================= */
const clearSelectedDebtors = async () => {
}
/* =========================
 * Actions
 * ========================= */
const toggleSelectItem = (id: string) => {
  selectedItems.value.has(id)
    ? selectedItems.value.delete(id)
    : selectedItems.value.add(id)
}

const toggleHistoryDetail = (id: string) => {
  expandedHistory.value.has(id)
    ? expandedHistory.value.delete(id)
    : expandedHistory.value.add(id)
}

const viewPdf = (id: string) => {
  router.push(`/pdfclear/${id}`)
}

/* =========================
 * Pagination Actions
 * ========================= */
const goToPageNew = (page: number) => {
  if (page >= 1 && page <= totalPagesNew.value) currentPageNew.value = page
}

const goToPageHistory = (page: number) => {
  if (page >= 1 && page <= totalPagesHistory.value)
    currentPageHistory.value = page
}

/* =========================
 * Lifecycle
 * ========================= */
const handleStorageChange = (e: StorageEvent) => {
  if (e.key === 'fakeApi.receipts' || e.key === 'receipts_last_update') {
    console.log('🔄 Storage changed - reloading data')
    loadReceiptData()
  }
}

// ✅ เพิ่ม listener สำหรับ custom event จาก ReciptService
const handleReceiptsUpdated = (event: Event) => {
  const customEvent = event as CustomEvent
  const action = customEvent.detail?.action

  console.log('🔔 Receipts updated event:', action)

  // Reload เมื่อมีการ create, update, delete
  if (['create', 'update', 'delete', 'approve', 'reject'].includes(action)) {
    loadReceiptData()
  }
}

onMounted(async () => {
  console.log('🚀 Component mounted')
  await loadReceiptData()
  loadHistory()

  // Listen to storage events
  window.addEventListener('storage', handleStorageChange)

  // ✅ Listen to custom receipts-updated events
  window.addEventListener('receipts-updated', handleReceiptsUpdated)
})

// ✅ เพิ่ม onActivated เพื่อ reload เมื่อกลับมาหน้านี้
onActivated(async () => {
  console.log('🔄 Component activated - reloading data')
  await loadReceiptData()
  loadHistory()
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('receipts-updated', handleReceiptsUpdated)
})

/* =========================
 * Watchers
 * ========================= */
watch(activeTab, async tab => {
  console.log('🔄 Tab changed to:', tab)
  if (tab === 'new') {
    await loadReceiptData()
    currentPageNew.value = 1
  } else {
    loadHistory()
    currentPageHistory.value = 1
  }
})

// ✅ เพิ่ม watcher สำหรับ route changes
watch(
  () => route.path,
  async path => {
    if (path === '/indexsavedebtor') {
      console.log('🔄 Route changed to /indexsavedebtor - reloading')
      await loadReceiptData()
      loadHistory()
    }
  }
)

// ✅ เพิ่ม watcher สำหรับ filteredItems เพื่อ debug
watch(
  () => filteredItems.value,
  (newVal) => {
    console.log('📊 Filtered items updated:', {
      total: newVal.length,
      sample: newVal.slice(0, 3).map(i => ({
        id: i.id,
        itemName: i.itemName,
        balanceAmount: i.balanceAmount
      }))
    })
  },
  { deep: true }
)

/* =========================
 * Debug Helper
 * ========================= */
if (DEBUG && typeof window !== 'undefined') {
  ;(window as any).debugClearDebtor = {
    ledger,
    rawData,
    totals,
    loadReceiptData,
  }
}
/**
 * ✅ Helper: ดึง itemType จาก itemId หรือ itemName
 */
const getItemType = (itemName: string | null): 'income' | 'receivable' | 'expense' | 'unknown' => {
  if (!itemName) {
    console.warn('⚠️ getItemType: No itemName provided')
    return 'unknown'
  }

  const item = getItemByName(itemName)
  if (item) {
    console.log(`✅ Found item by name "${itemName}":`, item.name, item.type)
    return item.type
  }

  console.warn(`⚠️ Item name "${itemName}" not found`)
  return 'unknown'
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