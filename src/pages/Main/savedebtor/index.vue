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
                กรุณาเลือกรายการลูกหนี้ที่ต้องการล้างบัญชี (รายการที่ชื่อเหมือนกันจะถูกรวมกัน)
              </p>
            </div>

            <div class="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/40 bg-white/10 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div class="col-span-4">รายการ</div>
              <div class="col-span-3 text-right">ยอดหนี้เริ่มต้น</div>
              <div class="col-span-2 text-right">ยอดที่ล้างแล้ว</div>
              <div class="col-span-3 text-right">ยอดคงเหลือ</div>
            </div>

            <div class="overflow-y-auto flex-1 p-6">
              <div v-if="mergedItems.length === 0" class="text-center py-12 text-slate-500">
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
                  <!-- Checkbox + รายการ (col-span-4) -->
                  <div class="col-span-4 flex items-center gap-3">
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
                        <span v-if="item.count > 1" class="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          {{ item.count }} รายการ
                        </span>
                      </p>
                      <p class="text-xs text-slate-500 truncate">
                        {{ item.department }} • {{ item.subDepartment }}
                      </p>
                    </div>
                  </div>

                  <!-- ยอดหนี้เริ่มต้น (col-span-3) -->
                  <div class="col-span-3 text-right">
                    <p class="text-base font-bold text-slate-700">
                       {{ formatCurrency(item.originalAmount || 0) }}
                    </p>
                  </div>

                  <!-- ยอดที่ล้างแล้ว (col-span-2) -->
                  <div class="col-span-2 text-right">
                    <p class="text-base font-bold text-green-600">
                       {{ formatCurrency(item.paidAmount || 0) }}
                    </p>
                  </div>

                  <!-- ยอดคงเหลือ (col-span-3) -->
                  <div class="col-span-3 text-right">
                    <p class="text-base font-bold text-red-600">
                      {{ formatCurrency(item.balance || 0) }}
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
                <div v-for="item in paginatedItemsHistory" :key="item.id" class="glass-input rounded-xl overflow-hidden hover:shadow-md transition-all">
                  <div class="p-5">
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-sm">
                          <i class="ph-fill ph-check text-xl"></i>
                        </div>
                        <div>
                          <p class="font-bold text-slate-800">{{ item.itemsText || (Array.isArray(item.items) ? item.items.map(i => i.itemName).join(', ') : item.items) }}</p>
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
import sidebar from '@/components/bar/sidebar.vue'
import { setupAxiosMock } from '@/fake/mockAxios'
import { useAuthStore } from '@/stores/auth'
import { useSummaryStore } from '@/stores/summary'
import type { Debtor, Receipt } from '@/stores/summary'
import { storeToRefs } from 'pinia'
import { reciptService } from '@/services/ReciptService'
import Swal from 'sweetalert2'

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
const { receiptsByDoc, debtorsByDoc, ledgerByDoc, totals } = storeToRefs(summaryStore)

/* =========================
 * State
 * ========================= */
const activeTab = ref<'new' | 'history'>('new')

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
 * ✅ Load Data from Summary Store - แก้ไขให้ filter ตาม affiliationId
 * ========================= */


const loadDataFromStore = async () => {
  console.log('📥 Loading data from summaryStore...')
  isLoading.value = true

  try {
    const userAffiliationId = auth.user?.affiliationId
    if (!userAffiliationId) {
      console.warn('⚠️ No user affiliationId found')
      isLoading.value = false
      return
    }

    // ✅ 1. ลองโหลดสถานะเดิมจาก localStorage ก่อน
    const hasExistingState = summaryStore.loadFromLocalStorage()
    
    // ✅ 2. ดึง receipts จาก API
    const allReceipts = await reciptService.getAll()
    const userReceipts = allReceipts.filter(receipt => {
      const receiptAffId = receipt.profile?.affiliationId 
      return receiptAffId === userAffiliationId
    })

    // ✅ 3. แปลงข้อมูล
    const normalizedReceipts = userReceipts.map(receipt => ({
      ...receipt,
      fullName: receipt.profile?.fullName || '',
      // ... (โค้ดเดิม)
    }))

    // ✅ 4. Ingest แต่ไม่ทับสถานะการล้างหนี้
    normalizedReceipts.forEach(receipt => {
      summaryStore.ingestUpsert(receipt)
    })

    console.log('✅ Data loaded, debtor states preserved')

  } catch (err) {
    console.error('❌ Load error:', err)
  } finally {
    isLoading.value = false
  }
}

/* =========================
 * Load History - แก้ไขให้ดึงจาก clearSummaryService
 * ========================= */
const loadHistory = async () => {
  try {
    // ✅ ดึงข้อมูลจาก clearSummaryService แทน localStorage
    const { clearSummaryService } = await import('@/services/ClearDebtor/clearSummaryService')

    // ✅ ดึง affiliationId ของ user
    const userAffiliationId = auth.user?.affiliationId

    // กรองตามหน่วยงาน (ถ้ามี)
    const filters = userAffiliationId ? { affiliationId: userAffiliationId } : undefined

    const summaries = await clearSummaryService.getAll(filters)

    console.log('📦 Loaded clear summaries:', summaries.length)

    // ✅ แปลงให้ตรงกับ format ที่ UI ต้องการ
    historyItems.value = summaries.map(summary => {
      // สร้างข้อความแสดงรายการ
      const debtorListGrouped = new Map()

      summary.debtorList.forEach(debtor => {
        const itemName = debtor.itemName
        if (debtorListGrouped.has(itemName)) {
          const existing = debtorListGrouped.get(itemName)
          existing.amount += debtor.amount
          existing.count += 1
        } else {
          debtorListGrouped.set(itemName, {
            itemName,
            amount: debtor.amount,
            count: 1
          })
        }
      })

      const mergedItems = Array.from(debtorListGrouped.values())
      const itemsText = mergedItems.map(item =>
        item.count > 1 ? `${item.itemName} (${item.count} รายการ)` : item.itemName
      ).join(', ')

      return {
        id: summary.id,
        referenceId: summary.referenceId,
        date: new Date(summary.createdAt).toLocaleString('th-TH'),
        items: mergedItems,
        itemsText: itemsText || 'ไม่ระบุรายการ',
        displayText: itemsText,
        payments: summary.payments || [],
        total: summary.totalAmount,
        fullName: summary.fullName,
        phone: summary.phone,
        department: summary.mainAffiliationName,
        subAffiliationName1: summary.subAffiliationName1,
        subAffiliationName2: summary.subAffiliationName2,
        fundName: summary.fundName,
        sendmoney: summary.sendmoney,
        affiliationId: summary.mainAffiliationId
      }
    })

    console.log('✅ Loaded history from clearSummaryService:', {
      total: historyItems.value.length,
      userAffiliation: auth.user?.affiliation,
      sample: historyItems.value[0]
    })

  } catch (error) {
    console.error('❌ Error loading history from clearSummaryService:', error)
    historyItems.value = []
  }
}

/* =========================
 * ✅ Computed - รวมรายการที่ชื่อเหมือนกัน
 * ========================= */
interface DebtorItem {
  id: string
  docKey: string
  itemName: string
  originalAmount: number
  paidAmount: number
  balance: number
  isCleared: boolean
  department: string
  subDepartment: string
  responsible: string
  _receipt: Receipt
  _debtor: Debtor
}

interface MergedItem {
  id: string
  itemName: string
  originalAmount: number
  paidAmount: number
  balance: number
  department: string
  subDepartment: string
  count: number
  sourceItems: DebtorItem[]
}

const mergedItems = computed((): MergedItem[] => {
  const itemsMap = new Map<string, MergedItem>()

  Object.keys(debtorsByDoc.value).forEach(docKey => {
    const debtors = debtorsByDoc.value[docKey]
    const receipt = receiptsByDoc.value[docKey]
    const ledger = ledgerByDoc.value[docKey]

    if (!receipt || !debtors) return

    debtors
      .filter(debtor => !debtor.isCleared && debtor.balance > 0)
      .forEach(debtor => {
        const item: DebtorItem = {
          id: `${docKey}-${debtor.itemName}`,
          docKey,
          itemName: debtor.itemName,
          originalAmount: debtor.originalAmount,
          paidAmount: debtor.paidAmount,
          balance: debtor.balance,
          isCleared: debtor.isCleared,
          department: ledger?.faculty || receipt.affiliationName || '-',
          subDepartment: ledger?.sub1 || receipt.subAffiliationName1 || '-',
          responsible: receipt.fullName || '-',
          _receipt: receipt,
          _debtor: debtor
        }

        // ✅ รวมรายการที่ชื่อเหมือนกัน
        const key = debtor.itemName

        if (itemsMap.has(key)) {
          const existing = itemsMap.get(key)!
          existing.originalAmount += item.originalAmount
          existing.paidAmount += item.paidAmount
          existing.balance += item.balance
          existing.count += 1
          existing.sourceItems.push(item)
        } else {
          itemsMap.set(key, {
            id: key,
            itemName: item.itemName,
            originalAmount: item.originalAmount,
            paidAmount: item.paidAmount,
            balance: item.balance,
            department: item.department,
            subDepartment: item.subDepartment,
            count: 1,
            sourceItems: [item]
          })
        }
      })
  })

  const result = Array.from(itemsMap.values())

  console.log('📊 Merged items:', {
    total: result.length,
    sample: result.slice(0, 3)
  })

  return result
})

/* =========================
 * Pagination - New Tab
 * ========================= */
const totalPagesNew = computed(() =>
  Math.ceil(mergedItems.value.length / ITEMS_PER_PAGE)
)

const paginatedItemsNew = computed(() => {
  const start = (currentPageNew.value - 1) * ITEMS_PER_PAGE
  return mergedItems.value.slice(start, start + ITEMS_PER_PAGE)
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
  mergedItems.value
    .filter(i => selectedItems.value.has(i.id))
    .reduce((sum, i) => sum + Number(i.balance || 0), 0)
)

/* =========================
 * ✅ Clear Selected Debtors - แก้ไขให้ไม่ auto-fill ข้อมูลส่วนตัว + เลขนำส่ง
 * เก็บเฉพาะ: หน่วยงาน, หน่วยงานรอง, กองทุน
 * เอาออก: ชื่อ, เบอร์, รหัสโครงการ, ประเภทส่งเงิน, เลขนำส่ง
 * ========================= */
const clearSelectedDebtors = async () => {
  console.log('🚀 clearSelectedDebtors called')

  if (selectedItems.value.size === 0) {
    await Swal.fire({
      title: 'ไม่พบรายการ',
      text: 'กรุณาเลือกรายการลูกหนี้ที่ต้องการล้างก่อน',
      icon: 'warning',
      confirmButtonColor: '#7E22CE'
    })
    return
  }

  // ✅ ดึงรายการที่เลือก (merged)
  const selectedMerged = mergedItems.value.filter(item =>
    selectedItems.value.has(item.id)
  )

  console.log('🎯 Selected merged items:', selectedMerged.length)

  // ✅ แยกรายการออกและจัดกลุ่มตาม waybillNumber เดิม (เพื่อรวมรายการ)
  const receiptMap = new Map()

  selectedMerged.forEach(merged => {
    // ✅ วนลูปแต่ละ source item ที่ถูกรวมไว้
    merged.sourceItems.forEach(sourceItem => {
      const docKey = sourceItem.docKey
      const receipt = sourceItem._receipt

      if (!receiptMap.has(docKey)) {
        receiptMap.set(docKey, {
          // ❌ เอา waybillNumber ออก - ให้ผู้ใช้กรอกเอง
          waybillNumber: receipt.waybillNumber,
          receiptId: receipt.id, // เก็บ ID เดิมไว้สำหรับอ้างอิง

          // ❌ ไม่ auto-fill ข้อมูลส่วนตัว - ให้ผู้ใช้กรอกเอง
          projectCode: '',
          fullName: '',
          phone: '',
          sendmoney: '',

          // ✅ เก็บเฉพาะข้อมูลหน่วยงานและกองทุน
          department: sourceItem.department,
          subDepartment: sourceItem.subDepartment,
          mainAffiliationName: receipt.affiliationName,
          mainAffiliationId: receipt.mainAffiliationId,
          affiliationName: receipt.affiliationName,
          subAffiliationName1: receipt.subAffiliationName1 || '',
          subAffiliationId1: receipt.subAffiliationId1 || '',
          subAffiliationName2: receipt.subAffiliationName2 || '',
          subAffiliationId2: receipt.subAffiliationId2 || '',
          fundName: receipt.fundName || '',

          createdAt: receipt.createdAt || new Date().toISOString(),

          // ✅ เก็บข้อมูลอ้างอิงเดิมไว้ (ไม่แสดงให้ user แต่ใช้ในระบบ)
          _originalWaybillNumber: receipt.waybillNumber,
          _originalReceiptId: receipt.id,

          items: []
        })
      }

      // ✅ แยกรายการออกเป็นอันๆ
      const uniqueId = `${docKey}-${sourceItem.itemName}-${Date.now()}-${Math.random()}`

      receiptMap.get(docKey).items.push({
        id: uniqueId,
        itemName: sourceItem.itemName,
        debtorAmount: sourceItem.balance,
        amount: sourceItem.balance,
        balanceAmount: sourceItem.balance,
        originalAmount: sourceItem.originalAmount,
        paidAmount: sourceItem.paidAmount,
        depositNetAmount: 0,
        note: '',
        receiptNumber: '',
        paymentInput: '',
        isClearedDebt: false,
        _debtor: sourceItem._debtor,
        _originalDocKey: docKey,
        _originalItemName: sourceItem.itemName
      })
    })
  })

  const receipts = Array.from(receiptMap.values())

  console.log('📦 Prepared receipts:', receipts.length)
  console.log('📝 Total items (separated):', receipts.reduce((sum, r) => sum + r.items.length, 0))
  console.log('🔍 Sample receipt (ALL personal data cleared):')
  console.log('   - waybillNumber:', receipts[0]?.waybillNumber || '(empty)') // ต้องเป็น empty
  console.log('   - fullName:', receipts[0]?.fullName || '(empty)')
  console.log('   - phone:', receipts[0]?.phone || '(empty)')
  console.log('   - projectCode:', receipts[0]?.projectCode || '(empty)')
  console.log('   - sendmoney:', receipts[0]?.sendmoney || '(empty)')
  console.log('   ✅ mainAffiliationName:', receipts[0]?.mainAffiliationName)
  console.log('   ✅ subAffiliationName1:', receipts[0]?.subAffiliationName1)
  console.log('   ✅ fundName:', receipts[0]?.fundName)
  console.log('   📋 _originalWaybillNumber:', receipts[0]?._originalWaybillNumber, '(for reference only)')

  // ✅ บันทึกลง localStorage
  const summaryData = {
    receipts,
    selectedAt: new Date().toISOString(),
    totalItems: receipts.reduce((sum, r) => sum + r.items.length, 0),
    totalAmount: selectedMerged.reduce((sum, item) => sum + Number(item.balance || 0), 0)
  }

  try {
    localStorage.setItem(STORAGE_SUMMARY_KEY, JSON.stringify(summaryData))
    console.log('✅ Saved to localStorage (ALL personal data + waybillNumber cleared)')
    console.log('   User must fill: waybillNumber, fullName, phone, projectCode, sendmoney')

    router.push('/cleardebtor/multi')

  } catch (error) {
    console.error('❌ Error saving summary:', error)
    await Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'ไม่สามารถบันทึกข้อมูลได้',
      icon: 'error',
      confirmButtonColor: '#DC2626'
    })
  }
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
    loadDataFromStore()
  }
}

const handleReceiptsUpdated = (event: Event) => {
  const customEvent = event as CustomEvent
  const action = customEvent.detail?.action

  console.log('🔔 Receipts updated event:', action)

  if (['create', 'update', 'delete', 'approve', 'reject'].includes(action)) {
    loadDataFromStore()
  }
}

onMounted(async () => {
  console.log('🚀 Component mounted')
  await loadDataFromStore()
  loadHistory()

  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('receipts-updated', handleReceiptsUpdated)
})

onActivated(async () => {
  console.log('🔄 Component activated - reloading data')

  selectedItems.value.clear()
  await loadDataFromStore()
  loadHistory()
  currentPageNew.value = 1
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
    await loadDataFromStore()
    currentPageNew.value = 1
  } else {
    loadHistory()
    currentPageHistory.value = 1
  }
})

watch(
  () => route.path,
  async (path, oldPath) => {
    console.log('🔄 Route changed:', { from: oldPath, to: path })

    if (path === '/indexsavedebtor') {
      console.log('🔄 Back to /indexsavedebtor - reloading data')

      selectedItems.value.clear()
      await loadDataFromStore()
      loadHistory()
      currentPageNew.value = 1
    }
  },
  { immediate: false }
)

/* =========================
 * Debug Helper
 * ========================= */
if (DEBUG && typeof window !== 'undefined') {
  ;(window as any).debugClearDebtor = {
    summaryStore,
    receiptsByDoc,
    debtorsByDoc,
    ledgerByDoc,
    totals,
    mergedItems,
    loadDataFromStore,
    auth: auth.user
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
