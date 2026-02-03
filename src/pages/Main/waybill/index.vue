<template>
  <div class="text-slate-700 antialiased selection:bg-blue-200 selection:text-blue-900">
    <div id="app" class="relative w-full h-screen flex overflow-hidden">
      <div class="mesh-bg"></div>
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>

      <sidebar />

      <main class="flex-1 flex flex-col relative z-10 min-h-0">
        <header class="px-8 pt-4 pb-3 flex-shrink-0 header-divider">
          <div class="flex items-start justify-between gap-6">
            <div class="min-w-0">
              <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <i class="ph ph-files"></i>
                ใบนำส่งเงิน
              </h1>

              <div class="flex flex-wrap items-center gap-2 mt-1">
                <p class="text-xs text-slate-800">จัดการใบนำส่งเงิน</p>

                <!-- ✅ Daily Close Status Banner -->
                <div
                  v-if="dailyClose.isTodayClosed"
                  class="text-[11px] text-red-700 px-3 py-1 rounded-full bg-red-50 border border-red-200 backdrop-blur flex items-center gap-1.5"
                >
                  <i class="ph ph-lock text-xs"></i>
                  <span class="font-semibold">ปิดยอดแล้ว - ไม่สามารถสร้าง/แก้ไข/ลบได้</span>
                </div>

                <div
                  v-if="activeFiltersText"
                  class="text-[11px] text-slate-600 px-2 py-1 rounded-full bg-white/45 border border-white/60 backdrop-blur"
                >
                  <i class="ph ph-funnel-simple text-xs mr-1"></i>
                  {{ activeFiltersText }}
                </div>
              </div>

              <div class="mt-2 flex flex-wrap items-center gap-2">
                <div class="flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-white/45 border border-white/60 backdrop-blur">
                  <i class="ph ph-files text-xs text-slate-500"></i>
                  <span class="text-slate-700">ทั้งหมด</span>
                  <span class="font-semibold text-slate-900">{{ headerStats.total }}</span>
                </div>

                <div class="flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-white/45 border border-white/60 backdrop-blur">
                  <i class="ph ph-clock text-xs text-amber-600"></i>
                  <span class="text-slate-700">รอดำเนินการ</span>
                  <span class="font-semibold text-slate-900">{{ headerStats.pending }}</span>
                </div>

                <div class="flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-white/45 border border-white/60 backdrop-blur">
                  <i class="ph ph-check-circle text-xs text-green-600"></i>
                  <span class="text-slate-700">สำเร็จ</span>
                  <span class="font-semibold text-slate-900">{{ headerStats.success }}</span>
                </div>

                <div class="flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-white/45 border border-white/60 backdrop-blur">
                  <i class="ph ph-currency-circle-dollar text-xs text-blue-600"></i>
                  <span class="text-slate-700">ยอดรวม</span>
                  <span class="font-semibold text-slate-900 font-mono">
                    {{ formatCurrency(headerStats.totalAmount) }}
                  </span>
                  <span class="text-slate-500">บาท</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 flex-shrink-0">
              <div
                v-if="auth.user"
                class="hidden md:flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-white/50 border border-white/60"
              >
                <span class="font-medium text-slate-800">{{ auth.user.fullName }}</span>
                <span class="text-slate-500">•</span>
                <span class="text-slate-700">{{ auth.user.role }}</span>
                <span class="text-slate-500">•</span>
                <span class="text-slate-700 font-mono">{{ auth.user.affiliationId }}</span>
              </div>

              <button class="w-10 h-10 rounded-full glass-input flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm">
                <i class="ph ph-bell text-xl"></i>
              </button>
              <button class="w-10 h-10 rounded-full glass-input flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm">
                <i class="ph ph-gear text-xl"></i>
              </button>
            </div>
          </div>
        </header>

        <div class="px-8 py-4 flex-shrink-0">
          <div
            v-if="auth.isRole('user')"
            class="glass-panel p-4 rounded-2xl flex items-center justify-end shadow-sm"
          >
            <button
              @click="gotowaybil"
              :disabled="dailyClose.isTodayClosed"
              class="glass-button-primary px-5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
              :class="dailyClose.isTodayClosed ? 'opacity-50 cursor-not-allowed' : ''"
            >
              <i class="ph ph-file-plus text-lg"></i>
              <span>เพิ่มใบนำส่งเงิน</span>
            </button>
          </div>

          <div
            v-else-if="auth.isRole('treasury')"
            class="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm"
          >
            <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div class="relative group">
                <i class="ph ph-calendar-blank absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors"></i>
                <input
                  type="text"
                  placeholder="เลือกช่วงวันเวลา..."
                  class="glass-input pl-10 pr-4 py-2.5 rounded-xl w-full md:w-48 text-sm placeholder-slate-400 focus:placeholder-blue-300/50"
                />
              </div>

              <CascadingSelect
                v-model:modelValueMain="selectedMain"
                v-model:modelValueSub1="selectedSub1"
                v-model:modelValueSub2="selectedSub2"
                :options="departmentOptions"
              />

              <div class="relative flex-1 md:w-64">
                <i class="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                <input
                  v-model="searchText"
                  type="text"
                  placeholder="ค้นหา สังกัด / หน่วยงาน..."
                  class="glass-input pl-10 pr-4 py-2.5 rounded-xl w-full text-sm"
                />
              </div>
            </div>
          </div>

          <div v-else class="hidden"></div>
        </div>

        <div class="flex-1 px-8 pb-8 flex flex-col min-h-0">
          <div class="glass-panel rounded-2xl flex-1 flex flex-col shadow-lg min-h-0">
            <div class="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/40 bg-white/20 text-xs font-semibold uppercase tracking-wider flex-shrink-0">
              <div class="col-span-2 text-center">เวลา</div>
              <div class="col-span-1 text-center">สถานะ</div>
              <div class="col-span-2 text-center">สังกัด</div>
              <div class="col-span-2 text-center">รายได้/โครงการ</div>
              <div class="col-span-2 text-center">ผู้รับผิดชอบ</div>
              <div class="col-span-1 text-center">ยอดเงิน</div>
              <div class="col-span-2 text-center">จัดการ</div>
            </div>

            <div class="flex-1 overflow-y-auto px-2">
              <div
                v-for="(row, index) in paginatedItems"
                :key="row.id ?? index"
                class="group grid grid-cols-12 gap-3 px-4 py-4 mb-2 items-center rounded-xl hover:bg-white/50 transition-all duration-200 cursor-default border border-transparent hover:border-white/50 hover:shadow-sm"
              >
                <div class="col-span-2 text-center">
                  <div class="text-xs font-medium text-slate-700 font-mono">
                    {{ row.time }}
                  </div>
                </div>

                <div class="col-span-1 flex justify-center">
                  <div
                    class="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center min-w-[100px] transition-all duration-300"
                    :class="{
                      'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-300 shadow-sm animate-pulse':
                        row.status === 'pending',
                      'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300 shadow-md':
                        row.status === 'approved',
                      'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-300 shadow-sm':
                        row.status === 'rejected'
                    }"
                  >
                    <i
                      class="mr-1.5 text-sm"
                      :class="{
                        'ph ph-clock text-yellow-600': row.status === 'pending',
                        'ph ph-check-circle text-green-600': row.status === 'approved',
                        'ph ph-x-circle text-red-600': row.status === 'rejected'
                      }"
                    ></i>
                    <span v-if="row.status === 'pending'">รอดำเนินการ</span>
                    <span v-else-if="row.status === 'approved'">อนุมัติแล้ว</span>
                    <span v-else>ไม่อนุมัติ</span>
                  </div>
                </div>

                <div class="col-span-2 items-center justify-center flex flex-col">
                  <div class="font-medium text-center text-slate-800">{{ row.department }}</div>
                  <div class="text-[11px] text-slate-700 mt-0.5 flex items-center gap-1">
                    <i class="ph ph-buildings text-xs"></i>
                    <span class="truncate">{{ row.subDepartment }}</span>
                  </div>
                </div>

                <div class="col-span-2 items-center justify-center flex">
                  <span class="bg-blue-50/50 text-blue-700 text-xs px-2.5 py-1 rounded-lg border border-blue-100 font-medium">
                    {{ row.project }}
                  </span>
                </div>

                <div class="col-span-2 flex items-center gap-2 ml-10">
                  <div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 text-white flex items-center justify-center text-[10px] shadow-sm">
                    {{ row.responsible?.charAt(0) }}
                  </div>
                  <span class="text-sm text-slate-700 truncate">{{ row.responsible }}</span>
                </div>

                <div class="col-span-1 text-right mr-4">
                  <div class="font-bold text-slate-800 font-mono text-sm">
                    {{ formatCurrency(row.amount) }}
                  </div>
                  <div class="text-[10px] text-slate-400">บาท</div>
                </div>

                <div class="col-span-2 flex justify-center">
                  <ActionButtons
                    :item="row"
                    :permissions="rowPermissions(row)"
                    :force-disabled="row.isLocked || dailyClose.isTodayClosed"
                    @view="view"
                    @edit="edit"
                    @delete="removeItem"
                    @approve="approveItem"
                    @reject="rejectItem"
                  />
                </div>
              </div>

              <div v-if="items.length === 0" class="p-8 text-center text-sm text-slate-500">
                ไม่พบรายการตามเงื่อนไขที่เลือก
              </div>
            </div>

<div v-if="totalPages > 1" class="px-6 py-3 border-t border-white/40 bg-white/5 flex items-center justify-center flex-shrink-0">
  <div class="flex items-center gap-2">
    <!-- Previous Button -->
    <button
      @click="prevPage"
      :disabled="currentPage === 1"
      class="w-9 h-9 rounded-lg glass-input flex items-center justify-center text-slate-600 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
    >
      <i class="ph ph-caret-left text-lg"></i>
    </button>

    <!-- Page Numbers -->
    <template v-for="page in totalPages" :key="page">
      <button
        v-if="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
        @click="goToPage(page)"
        class="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
        :class="currentPage === page
          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
          : 'glass-input text-slate-600 hover:text-purple-600'"
      >
        {{ page }}
      </button>
      <span 
        v-else-if="page === currentPage - 2 || page === currentPage + 2" 
        class="text-slate-400 px-1"
      >
        ...
      </span>
    </template>

    <!-- Next Button -->
    <button
      @click="nextPage"
      :disabled="currentPage === totalPages"
      class="w-9 h-9 rounded-lg glass-input flex items-center justify-center text-slate-600 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
    >
      <i class="ph ph-caret-right text-lg"></i>
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
import { ref, onMounted, onUnmounted, computed , watch } from 'vue'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDailyCloseStore } from '@/stores/DailyClose'
import { ApprovalStatus, Receipt } from '@/types/recipt'
import ActionButtons from '@/components/Actionbutton/ActionButtons.vue'
import sidebar from '@/components/bar/sidebar.vue'
import CascadingSelect from '@/components/input/select/CascadingSelect.vue'
import { departmentOptions } from '@/components/data/TSdepartments'
import { reciptService } from '@/services/ReciptService'
import { approveService } from '@/services/Apporve_service/ApproveService'
import type { Profile } from '@/types/Profile'

const isLoading = ref(false)
const router = useRouter()
const auth = useAuthStore()
const dailyClose = useDailyCloseStore()

const searchText = ref('')
const rawData = ref<Receipt[]>([])

const selectedMain = ref('')
const selectedSub1 = ref('')
const selectedSub2 = ref('')

const canCreateWaybill = computed(() => auth.isRole('user') && !dailyClose.isTodayClosed)
const canApprove = computed(() => auth.isRole('treasury'))

type ActionKey = 'view' | 'edit' | 'delete' | 'approve' | 'reject'

const formatThaiDateTime = (date: Date | null) => {
  if (!date || isNaN(date.getTime())) return '-'
  const day = date.getDate().toString().padStart(2, '0')
  const month = date.getMonth() + 1
  const year = date.getFullYear() + 543
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  return `${day} ${monthNames[month - 1]} ${year} ${hours}:${minutes}`
}

const formatCurrency = (amount: number | string) => {
  const n = typeof amount === 'string' ? Number(amount.toString().replace(/[^0-9.-]/g, '')) : amount || 0
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

type TableStatus = ApprovalStatus

type TableRow = {
  id: string
  status: TableStatus
  department: string
  subDepartment: string
  time: string
  lastTimeMs: number
  project: string
  responsible: string
  amount: number
  createdAt: Date | null
  updatedAt: Date | null
  isLocked: boolean
  _raw: Receipt
}

const getLastDate = (createdAt: Date | null, updatedAt: Date | null) => {
  if (createdAt && updatedAt) return updatedAt > createdAt ? updatedAt : createdAt
  return updatedAt || createdAt
}

/**
 * ✅ Helper function: เช็คว่าใบนำส่งนี้อยู่ในวันที่ปิดยอดหรือไม่
 */
const isReceiptClosed = (receipt: Receipt) => {
  if (!receipt.createdAt) return false

  const d = new Date(receipt.createdAt as any)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const dateKey = `${y}-${m}-${day}`

  return dailyClose.isDateClosed(dateKey)
}

function mapReceiptToRow(r: any): TableRow {
  const createdAt = r.createdAt ? new Date(r.createdAt) : null
  const updatedAt = r.updatedAt ? new Date(r.updatedAt) : null
  const lastDate = getLastDate(createdAt, updatedAt)

  // ✅ เพิ่ม type assertion
  const profile = (r.profile || {}) as Partial<Profile>
  
  return {
    id: r.waybillNumber || r.projectCode || r.id,
    status: r.approvalStatus || 'pending',
    
    // ✅ ใช้ Optional chaining
    department: profile.mainAffiliationName || r.mainAffiliationName || profile.affiliationName || r.affiliationName || '-',
    
    subDepartment: [
      profile.subAffiliationName1 || r.subAffiliationName1,
      profile.subAffiliationName2 || r.subAffiliationName2
    ].filter(Boolean).join(' / ') || '-',
    
    time: formatThaiDateTime(lastDate),
    lastTimeMs: lastDate?.getTime() || 0,
    
    project: profile.fundName || r.fundName || '-',
    responsible: profile.fullName || r.fullName || '-',
    
    amount: Number(r.netTotalAmount ?? 0),
    createdAt,
    updatedAt,
    isLocked: isReceiptClosed(r),
    _raw: r
  }
}

/**
 * ✅ 2. แก้ไข loadData() - เพิ่ม type assertion
 */
const loadData = async () => {
  isLoading.value = true
  try {
    const receipts = await reciptService.getAll()

    rawData.value = (receipts ?? [])
      .map((r: any) => {
        const kind = getReceiptKind(r)
        if (kind !== 'WAYBILL') return null

        // ✅ เพิ่ม type assertion
        const profile = (r.profile || {}) as Partial<Profile>
        
        return {
          ...r,

          // ✅ Normalize fields จาก profile สำหรับ UI
          affiliationId: profile.affiliationId || r.affiliationId || '',
          affiliationName: profile.affiliationName || r.affiliationName || '',
          mainAffiliationId: profile.mainAffiliationId || r.mainAffiliationId || '',
          mainAffiliationName: profile.mainAffiliationName || r.mainAffiliationName || profile.affiliationName || r.affiliationName || '',
          subAffiliationId1: profile.subAffiliationId1 || r.subAffiliationId1 || '',
          subAffiliationName1: profile.subAffiliationName1 || r.subAffiliationName1 || '',
          subAffiliationId2: profile.subAffiliationId2 || r.subAffiliationId2 || '',
          subAffiliationName2: profile.subAffiliationName2 || r.subAffiliationName2 || '',
          fullName: profile.fullName || r.fullName || '',
          fundName: profile.fundName || r.fundName || '',

          __kind: kind,
        }
      })
      .filter(Boolean)

    console.log('[loadData] waybills', rawData.value)
  } catch (err) {
    console.error('[loadData] failed', err)
    rawData.value = []
  } finally {
    isLoading.value = false
  }
}

/**
 * ✅ 3. แก้ไข items computed property - เพิ่ม type assertion
 */
const currentPage = ref(1)
const itemsPerPage = ref(5)
const items = computed<TableRow[]>(() => {
  let filtered: Receipt[] = [...rawData.value]
  if (!auth.user) return []

  // ✅ Filter by role
  if (auth.user.role === 'user') {
    filtered = filtered.filter((r) => {
      const profile = (r.profile || {}) as Partial<Profile>
      const affId = profile.affiliationId 
      return affId === auth.user!.affiliationId
    })
  }

  // ✅ Filter by main category
  if (selectedMain.value) {
    filtered = filtered.filter((r) => {
      const profile = (r.profile || {}) as Partial<Profile>
      const main = (
        profile.mainAffiliationName || 
        profile.affiliationName || 
        ''
      ).trim()
      return main === selectedMain.value.trim()
    })
  }

  // ✅ Filter by sub category 1
  if (selectedSub1.value) {
    filtered = filtered.filter((r) => {
      const profile = (r.profile || {}) as Partial<Profile>
      const sub1 = (profile.subAffiliationName1 || '').trim()
      return sub1 === selectedSub1.value.trim()
    })
  }

  // ✅ Filter by sub category 2
  if (selectedSub2.value) {
    filtered = filtered.filter((r) => {
      const profile = (r.profile || {}) as Partial<Profile>
      const sub2 = (profile.subAffiliationName2 || '').trim()
      return sub2 === selectedSub2.value.trim()
    })
  }

  // ✅ Filter by search text
  if (searchText.value.trim()) {
    const s = searchText.value.toLowerCase()
    filtered = filtered.filter((r) => {
      const profile = (r.profile || {}) as Partial<Profile>
      const main = (
        profile.mainAffiliationName || 
        profile.affiliationName || 
        ''
      ).toLowerCase()
      const sub1 = (profile.subAffiliationName1 || '').toLowerCase()
      const sub2 = (profile.subAffiliationName2 || '').toLowerCase()
      return main.includes(s) || sub1.includes(s) || sub2.includes(s)
    })
  }

  const rows = filtered.map(mapReceiptToRow)

  const rank = (s: TableStatus) => {
    if (s === 'pending') return 0
    if (s === 'approved') return 1
    return 2
  }

  // ✅ แก้ไขการ sort ให้ approved ล่าสุดอยู่ข้างบนสุด
  rows.sort((a, b) => {
    const byStatus = rank(a.status) - rank(b.status)
    if (byStatus !== 0) return byStatus
    
    // ✅ สำหรับ pending: เรียงจากใหม่ไปเก่า (updatedAt ล่าสุดก่อน)
    if (a.status === 'pending') {
      return (b.lastTimeMs ?? 0) - (a.lastTimeMs ?? 0)
    }
    
    // ✅ สำหรับ approved: เรียงจากใหม่ไปเก่า (approvedAt ล่าสุดก่อน)
    if (a.status === 'approved') {
      return (b.lastTimeMs ?? 0) - (a.lastTimeMs ?? 0)
    }
    
    // ✅ rejected: เรียงจากเก่าไปใหม่
    return (a.lastTimeMs ?? 0) - (b.lastTimeMs ?? 0)
  })

  return rows
})
const totalPages = computed(() => {
  return Math.ceil(items.value.length / itemsPerPage.value)
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return items.value.slice(start, end)
})

// ✅ 4. เพิ่มฟังก์ชัน pagination
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}
watch([selectedMain, selectedSub1, selectedSub2, searchText], () => {
  currentPage.value = 1
})

const headerStats = computed(() => {
  const receipts = items.value.map(r => r._raw)
  const stats = reciptService.calculateStats(receipts)

  return {
    total: stats.total,
    pending: stats.pending,
    success: stats.approved,
    totalAmount: stats.totalAmount
  }
})

const activeFiltersText = computed(() => {
  const parts: string[] = []
  if (selectedMain.value) parts.push(selectedMain.value)
  if (selectedSub1.value) parts.push(selectedSub1.value)
  if (selectedSub2.value) parts.push(selectedSub2.value)
  if (searchText.value.trim()) parts.push(`ค้นหา: "${searchText.value.trim()}"`)
  return parts.length ? `กำลังกรอง: ${parts.join(' · ')}` : ''
})
function getReceiptKind(r: any): 'WAYBILL' | 'DEBT_NEW' | 'DEBT_CLEAR' | 'UNKNOWN' {
  const note = r.moneyTypeNote?.toUpperCase?.()

  if (note === 'WAYBILL') return 'WAYBILL'
  if (note === 'DEBT_NEW') return 'DEBT_NEW'
  if (note === 'CLEAR_DEBTOR' || note === 'DEBT_CLEAR') return 'DEBT_CLEAR'

  // fallback จาก receiptList
  if (Array.isArray(r.receiptList)) {
    if (r.receiptList.some((i: any) => i.type === 'income')) return 'WAYBILL'
    if (r.receiptList.some((i: any) => i.type === 'receivable')) return 'DEBT_NEW'
  }

  return 'UNKNOWN'
}


/**
 * ✅ Row permissions: เช็คสิทธิ์ตาม role และสถานะการปิดยอด
 */
const rowPermissions = (row: TableRow): ActionKey[] => {
  const perms: ActionKey[] = ['view']

  // ✅ User สามารถแก้ไขได้ทั้ง pending และ approved (แต่ approved จะแก้ไขแบบจำกัด)
  if (auth.isRole('user') && !row.isLocked) {
    if (row.status === 'pending') {
      perms.push('edit', 'delete')
    } else if (row.status === 'approved') {
      perms.push('edit') // ✅ เพิ่ม: ให้แก้ไขได้แม้ approved
    }
  }

  if (canApprove.value && !row.isLocked) {
    // ✅ ถ้า pending: แสดงปุ่มอนุมัติ
    if (row.status === 'pending') {
      perms.push('approve')
    }
    // ✅ ถ้า approved: แสดงปุ่มยกเลิกการอนุมัติ (reject)
    else if (row.status === 'approved') {
      perms.push('reject')
    }
  }

  return perms
}

/**
 * ✅ Event Handlers
 */
const handleStorageChange = (e: StorageEvent) => {
  if (e.key === 'fakeApi.receipts' || e.key === 'receipts_last_update' || e.key === 'daily_close_records') {
    console.log('🔄 Storage changed, reloading data...')
    loadData()
  }
}

const handleReceiptsUpdate = (event?: CustomEvent) => {
  console.log('🔄 Receipts updated event:', event?.detail)
  if (event?.detail?.action === 'update') {
    console.log('   ⏭️ Skip reload for update action')
    return
  }
  console.log('   🔄 Reloading data...')
  loadData()
}

const handleDailyCloseUpdate = () => {
  console.log('🔄 Daily close status changed, reloading...')
  dailyClose.loadFromStorage()
}

/**
 * ✅ Lifecycle
 */
onMounted(async () => {
  if (!auth.isLoggedIn) {
    router.push({ name: 'login' })
    return
  }
  await loadData()

  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('receipts-updated', handleReceiptsUpdate)
  window.addEventListener('daily-close-updated', handleDailyCloseUpdate)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('receipts-updated', handleReceiptsUpdate)
  window.removeEventListener('daily-close-updated', handleDailyCloseUpdate)
})

/**
 * ✅ Actions
 */
const view = (row: TableRow) => {
  router.push(`/pdfpage/${row.id}`)
}

const edit = (row: TableRow) => {
  if (row.isLocked || dailyClose.isTodayClosed) {
    Swal.fire({
      icon: 'warning',
      title: 'ไม่สามารถแก้ไขได้',
      html: `
        <div class="text-left">
          <p class="mb-2">ไม่สามารถแก้ไขใบนำส่งได้ เนื่องจาก:</p>
          <ul class="list-disc pl-5 space-y-1">
            ${row.isLocked ? '<li>วันที่สร้างใบนำส่งนี้ปิดยอดแล้ว</li>' : ''}
            ${dailyClose.isTodayClosed ? '<li>วันนี้ปิดยอดรายวันแล้ว</li>' : ''}
          </ul>
        </div>
      `,
      confirmButtonText: 'รับทราบ',
      confirmButtonColor: '#EF4444'
    })
    return
  }

  const waybillNumber = row._raw.waybillNumber
  if (!waybillNumber) {
    Swal.fire('ข้อผิดพลาด', 'ไม่พบเลขที่นำส่ง', 'error')
    return
  }

  console.log('✅ Opening edit for:', waybillNumber, 'isLocked:', row.isLocked)
  router.push(`/waybill/edit/${waybillNumber}`)
}

const gotowaybil = () => {
  if (!canCreateWaybill.value) {
    if (dailyClose.isTodayClosed) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่สามารถสร้างใบนำส่งได้',
        text: 'วันนี้ปิดยอดแล้ว ไม่สามารถสร้างใบนำส่งใหม่ได้',
        confirmButtonText: 'รับทราบ',
      })
    } else {
      Swal.fire('ไม่มีสิทธิ์', 'เฉพาะผู้ใช้ (user) เท่านั้นที่สามารถเพิ่มใบนำส่งเงินได้', 'warning')
    }
    return
  }
  router.push('/waybill')
}

/**
 * ✅ อนุมัติใบนำส่ง (ใช้ ApproveService)
 */
const approveItem = async (row: TableRow) => {
  if (!canApprove.value) {
    Swal.fire('ไม่มีสิทธิ์', 'เฉพาะกองคลัง (treasury) เท่านั้นที่อนุมัติได้', 'warning')
    return
  }

  if (row.isLocked) {
    Swal.fire({
      icon: 'warning',
      title: 'ไม่สามารถอนุมัติได้',
      text: 'วันนี้ปิดยอดแล้ว ไม่สามารถอนุมัติใบนำส่งได้',
      confirmButtonText: 'รับทราบ',
    })
    return
  }

  if (row.status !== 'pending') {
    Swal.fire('ไม่สามารถอนุมัติได้', 'รายการนี้ได้รับการอนุมัติแล้ว', 'info')
    return
  }

  const result = await Swal.fire({
    title: 'ยืนยันการอนุมัติ?',
    html: `
      <div class="text-left">
        <p class="mb-2"><strong>โครงการ:</strong> ${row.project}</p>
        <p class="mb-2"><strong>หน่วยงาน:</strong> ${row.department}</p>
        <p class="mb-2"><strong>จำนวนเงิน:</strong> ${formatCurrency(row.amount)} บาท</p>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '✓ อนุมัติ',
    confirmButtonColor: '#10b981',
    cancelButtonText: 'ยกเลิก',
  })

  if (!result.isConfirmed) return

  try {
    const approverName = auth.user?.fullName || 'เจ้าหน้าที่การเงิน'
    await approveService.approve(row.id, approverName)

    await loadData()
currentPage.value = 1
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'อนุมัติสำเร็จ',
      text: 'สถานะเปลี่ยนเป็น "อนุมัติแล้ว"',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })

  } catch (error: any) {
    console.error('❌ Approve error:', error)
    Swal.fire('ข้อผิดพลาด', error.message || 'ไม่สามารถอนุมัติได้', 'error')
    await loadData()
  }
}

/**
 * 🔄 ยกเลิกการอนุมัติใบนำส่ง (เปลี่ยนกลับเป็น pending)
 */
const rejectItem = async (row: TableRow) => {
  if (!canApprove.value) {
    Swal.fire('ไม่มีสิทธิ์', 'เฉพาะกองคลัง (treasury) เท่านั้นที่สามารถยกเลิกการอนุมัติได้', 'warning')
    return
  }

  if (row.isLocked) {
    Swal.fire({
      icon: 'warning',
      title: 'ไม่สามารถดำเนินการได้',
      text: 'วันนี้ปิดยอดแล้ว ไม่สามารถเปลี่ยนแปลงสถานะได้',
      confirmButtonText: 'รับทราบ',
    })
    return
  }

  // ✅ ยกเลิกการอนุมัติ = เปลี่ยนจาก approved กลับเป็น pending
  if (row.status !== 'approved') {
    Swal.fire('ไม่สามารถดำเนินการได้', 'สามารถยกเลิกการอนุมัติได้เฉพาะใบนำส่งที่มีสถานะ "อนุมัติแล้ว" เท่านั้น', 'info')
    return
  }

  const result = await Swal.fire({
    title: 'ยกเลิกการอนุมัติ?',
    html: `
      <div class="text-left">
        <p class="mb-2"><strong>โครงการ:</strong> ${row.project}</p>
        <p class="mb-2"><strong>หน่วยงาน:</strong> ${row.department}</p>
        <p class="mb-2"><strong>จำนวนเงิน:</strong> ${formatCurrency(row.amount)} บาท</p>
        <p class="mt-3 text-sm text-amber-600">⚠️ การดำเนินการนี้จะเปลี่ยนสถานะจาก "อนุมัติแล้ว" กลับเป็น "กำลังดำเนินการ"</p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '🔄 ยกเลิกการอนุมัติ',
    confirmButtonColor: '#F59E0B',
    cancelButtonText: 'ยกเลิก',
  })

  if (!result.isConfirmed) return

  try {
    const approverName = auth.user?.fullName || 'เจ้าหน้าที่การเงิน'
    await approveService.reject(row.id, approverName)

    await loadData()
currentPage.value = 1
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'ยกเลิกการอนุมัติสำเร็จ',
      text: 'สถานะเปลี่ยนกลับเป็น "กำลังดำเนินการ"',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })

  } catch (error: any) {
    console.error('❌ Reject error:', error)
    Swal.fire('ข้อผิดพลาด', error.message || 'ไม่สามารถดำเนินการได้', 'error')
    await loadData()
  }
}

/**
 * 🗑️ ลบใบนำส่ง (ใช้ ReciptService)
 */
const removeItem = async (row: TableRow) => {
  if (row.isLocked || dailyClose.isTodayClosed) {
    Swal.fire({
      icon: 'warning',
      title: 'ไม่สามารถลบได้',
      html: `
        <div class="text-left">
          <p class="mb-2">ไม่สามารถลบใบนำส่งได้ เนื่องจาก:</p>
          <ul class="list-disc pl-5 space-y-1">
            ${row.isLocked ? '<li>วันที่สร้างใบนำส่งนี้ปิดยอดแล้ว</li>' : ''}
            ${dailyClose.isTodayClosed ? '<li>วันนี้ปิดยอดรายวันแล้ว</li>' : ''}
          </ul>
        </div>
      `,
      confirmButtonText: 'รับทราบ',
      confirmButtonColor: '#EF4444'
    })
    return
  }

  const result = await Swal.fire({
    title: 'ต้องการลบ?',
    html: `
      <div class="text-left">
        <p class="mb-2"><strong>โครงการ:</strong> ${row.project}</p>
        <p class="mb-2"><strong>หน่วยงาน:</strong> ${row.department}</p>
        <p class="mb-2"><strong>จำนวนเงิน:</strong> ${formatCurrency(row.amount)} บาท</p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ยืนยันการลบ',
    confirmButtonColor: '#EF4444',
    cancelButtonText: 'ยกเลิก',
  })

  if (!result.isConfirmed) return

  try {
    await reciptService.delete(row.id)
    await loadData()

    Swal.fire({
      icon: 'success',
      title: 'ลบสำเร็จ',
      text: 'ลบใบนำส่งเรียบร้อยแล้ว',
      timer: 2000,
      showConfirmButton: false
    })
  } catch (error: any) {
    console.error('❌ Delete error:', error)
    Swal.fire('ข้อผิดพลาด', error.message || 'ไม่สามารถลบได้', 'error')
  }
}
</script>

<style>
body {
  font-family: 'Prompt', 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}

.swal2-container {
  z-index: 99999 !important;
}

.swal2-popup {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
}

/* ✅ Optional: ปรับแต่ง SweetAlert ให้สวยขึ้น */
.swal2-popup {
  border-radius: 20px !important;
  padding: 2rem !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
}

.swal2-title {
  font-family: 'Prompt', 'Inter', sans-serif !important;
  font-size: 1.5rem !important;
  font-weight: 600 !important;
}

.swal2-html-container {
  font-family: 'Prompt', 'Inter', sans-serif !important;
  font-size: 0.95rem !important;
}

.swal2-confirm {
  border-radius: 10px !important;
  padding: 0.75rem 2rem !important;
  font-weight: 500 !important;
}

.swal2-cancel {
  border-radius: 10px !important;
  padding: 0.75rem 2rem !important;
  font-weight: 500 !important;
}

/* ✅ header divider */
.header-divider {
  border-bottom: 1px solid rgba(255, 255, 255, 0.35);
}

/* Animated Background Mesh */
.mesh-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
  background-image:
    radial-gradient(at 0% 0%, hsla(253, 16%, 7%, 1) 0, transparent 50%),
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

/* Glassmorphism Utilities */
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
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
}

.glass-button-primary:hover {
  box-shadow: 0 6px 20px rgba(126, 34, 206, 0.4);
  transform: translateY(-1px);
}

/* Custom Scrollbar */
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