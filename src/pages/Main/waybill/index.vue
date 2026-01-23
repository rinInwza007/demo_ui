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
                v-for="(row, index) in items"
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
                  />
                </div>
              </div>

              <div v-if="items.length === 0" class="p-8 text-center text-sm text-slate-500">
                ไม่พบรายการตามเงื่อนไขที่เลือก
              </div>
            </div>

            <div class="px-6 py-3 border-t border-white/40 bg-white/10 flex items-center justify-between flex-shrink-0">
              <div class="text-xs text-slate-500">แสดง {{ items.length }} รายการ</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

import type { Receipt } from '@/types/receipt'
import { useAuthStore } from '@/stores/auth'
import { useDailyCloseStore } from '@/stores/DailyClose'
import { ApprovalStatus } from '@/types/recipt'
import { setupAxiosMock } from '@/fake/mockAxios'

import ActionButtons from '@/components/Actionbutton/ActionButtons.vue'
import sidebar from '@/components/bar/sidebar.vue'
import CascadingSelect from '@/components/input/select/CascadingSelect.vue'
import { departmentOptions } from '@/components/data/TSdepartments'

// setupAxiosMock()

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

type ActionKey = 'view' | 'edit' | 'delete' | 'approve'

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

const mapReceiptToRow = (r: Receipt): TableRow => {
  const createdDate = r.createdAt ? new Date(r.createdAt as any) : null
  const updatedDate = r.updatedAt ? new Date(r.updatedAt as any) : null
  const lastDate = getLastDate(createdDate, updatedDate)
  const lastTimeMs = lastDate?.getTime() ?? 0

  // ✅ ใช้การปิดยอดเป็นหลักในการ lock
  const isLocked = r.isLocked ?? isReceiptClosed(r)
  const approvalStatus = r.approvalStatus || 'pending'

  return {
    id: r.waybillNumber,
    status: approvalStatus,
    department: r.mainAffiliationName || r.affiliationName || '-',
    subDepartment: r.subAffiliationName1 || '-',
    time: formatThaiDateTime(lastDate),
    lastTimeMs,
    project: r.fundName || '-',
    responsible: r.fullName || '-',
    amount: r.netTotalAmount ? Number(String(r.netTotalAmount).replace(/,/g, '')) : 0,
    createdAt: createdDate,
    updatedAt: updatedDate,
    isLocked,
    _raw: r,
  }
}

const loadData = async () => {
  try {
    const res = await axios.get<Receipt[]>('/getReceipt')
    rawData.value = (res.data || [])
      .filter((r) => r.moneyTypeNote === 'Waybill')
      .map((r) => ({
        ...r,
        createdAt: r.createdAt ? new Date(r.createdAt as any) : new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt as any) : new Date(),
        isLocked: r.isLocked ?? false,
        approvalStatus: r.approvalStatus ?? 'pending',
      }))
  } catch (error) {
    console.error('❌ Error loading data:', error)
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error')
  }
}

const items = computed<TableRow[]>(() => {
  let filtered: Receipt[] = [...rawData.value]
  if (!auth.user) return []

  // ✅ Filter by role
  if (auth.user.role === 'user') {
    filtered = filtered.filter((r) => r.affiliationId === auth.user!.affiliationId)
  }

  // ✅ Filter by department selections
  if (selectedMain.value) {
    filtered = filtered.filter((r) => {
      const main = (r.mainAffiliationName || r.affiliationName || '').trim()
      return main === selectedMain.value.trim()
    })
  }
  if (selectedSub1.value) {
    filtered = filtered.filter((r) => (r.subAffiliationName1 || '').trim() === selectedSub1.value.trim())
  }
  if (selectedSub2.value) {
    filtered = filtered.filter((r) => (r.subAffiliationName2 || '').trim() === selectedSub2.value.trim())
  }

  // ✅ Filter by search text
  if (searchText.value.trim()) {
    const s = searchText.value.toLowerCase()
    filtered = filtered.filter((r) => {
      const main = (r.mainAffiliationName || r.affiliationName || '').toLowerCase()
      const sub1 = (r.subAffiliationName1 || '').toLowerCase()
      const sub2 = (r.subAffiliationName2 || '').toLowerCase()
      return main.includes(s) || sub1.includes(s) || sub2.includes(s)
    })
  }

  const rows = filtered.map(mapReceiptToRow)

  // ✅ Sort by status and time
  const rank = (s: TableStatus) => {
    if (s === 'pending') return 0
    if (s === 'approved') return 1
    return 2
  }

  rows.sort((a, b) => {
    const byStatus = rank(a.status) - rank(b.status)
    if (byStatus !== 0) return byStatus
    if (a.status === 'pending') {
      return (b.lastTimeMs ?? 0) - (a.lastTimeMs ?? 0)
    }
    return (a.lastTimeMs ?? 0) - (b.lastTimeMs ?? 0)
  })

  return rows
})

const headerStats = computed(() => {
  const rows = items.value
  const total = rows.length
  const pending = rows.filter((r) => r.status === 'pending').length
  const approved = rows.filter((r) => r.status === 'approved').length
  const totalAmount = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  return { total, pending, success: approved, totalAmount }
})

const activeFiltersText = computed(() => {
  const parts: string[] = []
  if (selectedMain.value) parts.push(selectedMain.value)
  if (selectedSub1.value) parts.push(selectedSub1.value)
  if (selectedSub2.value) parts.push(selectedSub2.value)
  if (searchText.value.trim()) parts.push(`ค้นหา: "${searchText.value.trim()}"`)
  return parts.length ? `กำลังกรอง: ${parts.join(' · ')}` : ''
})

/**
 * ✅ Row permissions: เช็คสิทธิ์ตาม role และสถานะการปิดยอด
 */
const rowPermissions = (row: TableRow): ActionKey[] => {
  const perms: ActionKey[] = ['view']

  // ✅ ถ้าวันนั้นปิดยอดแล้ว (isLocked = true) จะไม่สามารถแก้ไข/ลบได้
  if (auth.isRole('user') && row.status === 'pending' && !row.isLocked) {
    perms.push('edit', 'delete')
  }
  if (canApprove.value && row.status === 'pending' && !row.isLocked) {
    perms.push('approve')
  }

  return perms
}

/**
 * ✅ Event Handlers: ฟังการเปลี่ยนแปลงจาก localStorage
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
 * ✅ Lifecycle: Setup และ cleanup
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
  // ✅ เช็คการปิดยอดก่อนแก้ไข (Double Check)
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

const approveItem = async (row: TableRow) => {
  if (!canApprove.value) {
    Swal.fire('ไม่มีสิทธิ์', 'เฉพาะกองคลัง (treasury) เท่านั้นที่อนุมัติได้', 'warning')
    return
  }

  // ✅ เพิ่มส่วนนี้: เช็คการปิดยอดก่อนอนุมัติ
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
    const targetIndex = rawData.value.findIndex((r) => r.waybillNumber === row.id)
    if (targetIndex === -1) {
      throw new Error('ไม่พบรายการที่ต้องการอนุมัติ')
    }

    const target = rawData.value[targetIndex]

    console.log('📝 Approving receipt:', {
      waybillNumber: target.waybillNumber,
      oldStatus: target.approvalStatus,
      newStatus: 'approved'
    })

    const updatedReceipt = {
      ...target,
      approvalStatus: 'approved' as ApprovalStatus,
      updatedAt: new Date()
    }

    await axios.post('/updateReceipt', { receipt: updatedReceipt })
    rawData.value[targetIndex] = updatedReceipt

    console.log('✅ Approval complete, local data updated')

    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'อนุมัติสำเร็จ',
      text: 'สถานะเปลี่ยนเป็น "อนุมัติแล้ว"',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })

  } catch (error) {
    console.error('❌ Approve error:', error)
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถอนุมัติได้ กรุณาลองใหม่อีกครั้ง', 'error')
    await loadData()
  }
}

const removeItem = async (row: TableRow) => {
  // ✅ เช็คการปิดยอดก่อนลบ (Double Check)
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
    console.log('🗑️ Deleting receipt:', row.id)
    await axios.delete(`/deleteReceipt/${row.id}`)
    await loadData()

    Swal.fire({
      icon: 'success',
      title: 'ลบสำเร็จ',
      text: 'ลบใบนำส่งเรียบร้อยแล้ว',
      timer: 2000,
      showConfirmButton: false
    })
  } catch (error) {
    console.error('❌ Delete error:', error)
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถลบได้ กรุณาลองใหม่อีกครั้ง', 'error')
  }
}
</script>

<style>
body {
  font-family: 'Prompt', 'Inter', sans-serif;
  margin: 0;
  padding: 0;
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
