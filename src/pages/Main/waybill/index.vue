<template>
  <div class="text-slate-700 antialiased selection:bg-blue-200 selection:text-blue-900">
    <div id="app" class="relative w-full h-screen flex overflow-hidden">
      <!-- Background Elements -->
      <div class="mesh-bg"></div>
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>

      <!-- Sidebar (Mac Style) -->
      <sidebar />

      <!-- Main Content -->
      <main class="flex-1 flex flex-col relative z-10 min-h-0">
        <!-- ✅ Header Bar (summary + active filters) -->
        <header class="px-8 pt-4 pb-3 flex-shrink-0 header-divider">
          <div class="flex items-start justify-between gap-6">
            <!-- Left -->
            <div class="min-w-0">
              <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <i class="ph ph-files"></i>
                ใบนำส่งเงิน
              </h1>

              <div class="flex flex-wrap items-center gap-2 mt-1">
                <p class="text-xs text-slate-800">จัดการใบนำส่งเงิน</p>

                <!-- ✅ Active Filter indicator -->
                <div
                  v-if="activeFiltersText"
                  class="text-[11px] text-slate-600 px-2 py-1 rounded-full bg-white/45 border border-white/60 backdrop-blur"
                >
                  <i class="ph ph-funnel-simple text-xs mr-1"></i>
                  {{ activeFiltersText }}
                </div>
              </div>

              <!-- ✅ Summary pills -->
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <div
                  class="flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-white/45 border border-white/60 backdrop-blur"
                >
                  <i class="ph ph-files text-xs text-slate-500"></i>
                  <span class="text-slate-700">ทั้งหมด</span>
                  <span class="font-semibold text-slate-900">{{ headerStats.total }}</span>
                </div>

                <div
                  class="flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-white/45 border border-white/60 backdrop-blur"
                >
                  <i class="ph ph-clock text-xs text-amber-600"></i>
                  <span class="text-slate-700">รอดำเนินการ</span>
                  <span class="font-semibold text-slate-900">{{ headerStats.pending }}</span>
                </div>

                <div
                  class="flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-white/45 border border-white/60 backdrop-blur"
                >
                  <i class="ph ph-check-circle text-xs text-green-600"></i>
                  <span class="text-slate-700">สำเร็จ</span>
                  <span class="font-semibold text-slate-900">{{ headerStats.success }}</span>
                </div>

                <div
                  class="flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-white/45 border border-white/60 backdrop-blur"
                >
                  <i class="ph ph-currency-circle-dollar text-xs text-blue-600"></i>
                  <span class="text-slate-700">ยอดรวม</span>
                  <span class="font-semibold text-slate-900 font-mono">
                    {{ formatCurrency(headerStats.totalAmount) }}
                  </span>
                  <span class="text-slate-500">บาท</span>
                </div>
              </div>
            </div>

            <!-- Right -->
            <div class="flex items-center gap-3 flex-shrink-0">
              <!-- ✅ แสดงสถานะผู้ใช้ (ช่วยตอนเทส) -->
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
          </div>
        </header>

        <!-- Filters Area -->
        <div class="px-8 py-4 flex-shrink-0">
          <!-- ✅ USER: เห็นแค่ปุ่มเพิ่ม -->
          <div
            v-if="auth.isRole('user')"
            class="glass-panel p-4 rounded-2xl flex items-center justify-end shadow-sm"
          >
            <button
              @click="gotowaybil"
              class="glass-button-primary px-5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <i class="ph ph-file-plus text-lg"></i>
              <span>เพิ่มใบนำส่งเงิน</span>
            </button>
          </div>

          <!-- ✅ TREASURY: เห็น filter เท่านั้น (ไม่มีปุ่มเพิ่ม) -->
          <div
            v-else-if="auth.isRole('treasury')"
            class="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm"
          >
            <!-- Left Filters -->
            <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div class="relative group">
                <i
                  class="ph ph-calendar-blank absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors"
                ></i>
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
                :options="options"
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

          <!-- ✅ role อื่นๆ: ซ่อนไปเลย -->
          <div v-else class="hidden"></div>
        </div>

        <!-- Data Table Area -->
        <div class="flex-1 px-8 pb-8 flex flex-col min-h-0">
          <div class="glass-panel rounded-2xl flex-1 flex flex-col shadow-lg min-h-0">
            <div
              class="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/40 bg-white/20 text-xs font-semibold uppercase tracking-wider flex-shrink-0"
            >
              <div class="col-span-1 text-center">สถานะ</div>
              <div class="col-span-2 text-center">สังกัด</div>
              <div class="col-span-1 text-center">รายได้/โครงการ</div>
              <div class="col-span-1 text-center">ปีงบฯ</div>
              <div class="col-span-2 text-center">ผู้รับผิดชอบ</div>
              <div class="col-span-1 text-center">รูปแบบ</div>
              <div class="col-span-1 text-center">เวลา</div>
              <div class="col-span-1 text-center">ยอดเงิน</div>
              <div class="col-span-2 text-center">จัดการ</div>
            </div>

            <!-- Table Body (Scrollable) -->
            <div class="overflow-y-auto overflow-x-hidden flex-1 p-2 min-h-0">
              <div
                v-for="(item, index) in items"
                :key="item.id ?? index"
                class="group grid grid-cols-12 gap-4 px-4 py-4 mb-2 items-center rounded-xl hover:bg-white/50 transition-all duration-200 cursor-default border border-transparent hover:border-white/50 hover:shadow-sm"
              >
                <!-- Status -->
                <div class="col-span-1 flex justify-center">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-white/50"
                    :class="{
                      'bg-yellow-100 text-yellow-600': item.status === 'pending',
                      'bg-green-100 text-green-500': item.status === 'success'
                    }"
                  >
                    <i v-if="item.status === 'pending'" class="ph-fill ph-clock text-lg"></i>
                    <i v-else class="ph-fill ph-check-circle text-lg"></i>
                  </div>
                </div>

                <!-- Department -->
                <div class="col-span-2">
                  <div class="font-medium text-slate-800">{{ item.department }}</div>
                  <div class="text-[11px] text-slate-700 mt-0.5 flex items-center gap-1">
                    <i class="ph ph-buildings text-xs"></i>
                    <span class="truncate">{{ item.subDepartment }}</span>
                  </div>
                </div>

                <!-- Project -->
                <div class="col-span-1">
                  <span
                    class="bg-blue-50/50 text-blue-700 text-xs px-2.5 py-1 rounded-lg border border-blue-100 font-medium"
                  >
                    {{ item.project }}
                  </span>
                </div>

                <!-- Year -->
                <div class="col-span-1 text-center text-sm font-medium text-slate-600 font-mono">
                  {{ item.year }}
                </div>

                <!-- Responsible -->
                <div class="col-span-2 flex items-center gap-2">
                  <div
                    class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 text-white flex items-center justify-center text-[10px] shadow-sm"
                  >
                    {{ item.responsible?.charAt(0) }}
                  </div>
                  <span class="text-sm text-slate-700 truncate">{{ item.responsible }}</span>
                </div>

                <!-- Payment Type -->
                <div class="col-span-1">
                  <div class="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <i
                      class="ph-fill text-slate-400"
                      :class="item.paymentType === 'เงินสด'
                        ? 'ph-money'
                        : (item.paymentType === 'เช็คธนาคาร'
                          ? 'ph-scroll'
                          : 'ph-bank')"
                    ></i>
                    {{ item.paymentType }}
                  </div>
                </div>

                <!-- Time -->
                <div class="col-span-1 text-center">
                  <div class="text-xs font-medium text-slate-700 font-mono">
                    {{ item.time }}
                  </div>
                </div>

                <!-- Amount -->
                <div class="col-span-1 text-right">
                  <div class="font-bold text-slate-800 font-mono text-sm">
                    {{ formatCurrency(item.amount) }}
                  </div>
                  <div class="text-[10px] text-slate-400">บาท</div>
                </div>

                <!-- Actions -->
                <div class="col-span-2 flex justify-center">
                  <ActionButtons
                    :item="item"
                    :permissions="rowPermissions(item)"
                    @view="view"
                    @edit="edit"
                    @delete="removeItem"
                    @approve="approveItem"
                  />
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="items.length === 0" class="p-8 text-center text-sm text-slate-500">
                ไม่พบรายการตามเงื่อนไขที่เลือก
              </div>
            </div>

            <!-- Footer Pagination (mock) -->
            <div
              class="px-6 py-3 border-t border-white/40 bg-white/10 flex items-center justify-between flex-shrink-0"
            >
              <div class="text-xs text-slate-500">
                แสดง {{ items.length }} รายการ
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

import type { Receipt } from '@/types/receipt'
import { useAuthStore } from '@/stores/auth'

import { setupAxiosMock } from '@/fake/mockAxios'
import { options } from '@/components/data/departments'

import ActionButtons from '@/components/Actionbutton/ActionButtons.vue'
import sidebar from '@/components/bar/sidebar.vue'
import CascadingSelect from '@/components/input/select/CascadingSelect.vue'

setupAxiosMock()

const router = useRouter()
const auth = useAuthStore()

const searchText = ref('')
const rawData = ref<Receipt[]>([])

const selectedMain = ref('')
const selectedSub1 = ref('')
const selectedSub2 = ref('')

/** ✅ user เท่านั้นที่สร้างใบนำส่ง */
const canCreateWaybill = computed(() => auth.isRole('user'))

/** ✅ treasury เท่านั้นที่อนุมัติ */
const canApprove = computed(() => auth.isRole('treasury'))

type ActionKey = 'view' | 'edit' | 'delete' | 'approve' | 'lock' | 'cleardebtor'

const moneyTypeLabel: Record<string, string> = {
  cash: 'เงินสด',
  bank: 'เช็คธนาคาร',
  transfer: 'ฝากเข้าบัญชี',
  debtor: 'ลูกหนี้',
  other: 'อื่นๆ',
}

const formatThaiDateTime = (date: Date | null) => {
  if (!date || isNaN(date.getTime())) return '-'

  const day = date.getDate().toString().padStart(2, '0')
  const month = date.getMonth() + 1
  const year = date.getFullYear() + 543
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  const monthNames = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ]

  return `${day} ${monthNames[month - 1]} ${year} ${hours}:${minutes}`
}

const formatCurrency = (amount: number | string) => {
  const n =
    typeof amount === 'string'
      ? Number(amount.toString().replace(/[^0-9.-]/g, ''))
      : amount || 0

  return n.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const hasBeenEdited = (createdAt: Date | null, updatedAt: Date | null) => {
  if (!createdAt || !updatedAt) return false
  return Math.abs(updatedAt.getTime() - createdAt.getTime()) > 1000
}

type TableStatus = 'pending' | 'success'

type TableRow = {
  id: string
  status: TableStatus
  department: string
  subDepartment: string
  time: string
  project: string
  year: string
  responsible: string
  paymentType: string
  amount: number
  createdAt: Date | null
  updatedAt: Date | null
  isLocked: boolean
  _raw: Receipt
}

const mapReceiptToRow = (r: Receipt): TableRow => {
  const fileTypesArray: string[] =
    r.receiptList?.flatMap((item: any) => {
      const fromPaymentDetails = (item.paymentDetails || [])
        .map((p: any) => String(p.moneyType || '').trim())
        .filter((t: string) => !!t)

      const fromReceiptItem = item.moneyType ? [String(item.moneyType).trim()] : []
      return [...fromPaymentDetails, ...fromReceiptItem]
    }) || []

  const uniqueFileTypes = Array.from(new Set(fileTypesArray))
  const fileType =
    uniqueFileTypes.length > 0
      ? uniqueFileTypes.map((t) => moneyTypeLabel[t] || t).join(', ')
      : '-'

  const createdDate = r.createdAt ? new Date(r.createdAt as any) : null
  const updatedDate = r.updatedAt ? new Date(r.updatedAt as any) : null
  const isEdited = hasBeenEdited(createdDate, updatedDate)
  const displayDate = isEdited ? updatedDate : createdDate

  const locked = r.isLocked ?? false

  return {
    id: r.delNumber,
    status: locked ? 'success' : 'pending',
    department: r.mainAffiliationName || r.affiliationName || '-',
    subDepartment: r.subAffiliationName1 || '-',
    time: formatThaiDateTime(displayDate),
    project: r.fundName || '-',
    year: '2568',
    responsible: r.fullName || '-',
    paymentType: fileType,
    amount: r.netTotalAmount ? Number(String(r.netTotalAmount).replace(/,/g, '')) : 0,
    createdAt: createdDate,
    updatedAt: updatedDate,
    isLocked: locked,
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
      }))
  } catch (error) {
    console.error('❌ Error loading data:', error)
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error')
  }
}

/**
 * ✅ ITEMS (สำคัญ)
 * - user: เห็นเฉพาะ affiliation ตัวเอง
 * - treasury: เห็นทั้งหมด + เรียง pending ขึ้นบน / success ลงล่าง
 */
const items = computed<TableRow[]>(() => {
  let filtered: Receipt[] = [...rawData.value]

  if (!auth.user) return []

  if (auth.user.role === 'user') {
    filtered = filtered.filter((r) => {
      console.log('🔍 Filtering:', {
        receiptAffId: r.affiliationId,
        userAffId: auth.user!.affiliationId,
        match: r.affiliationId === auth.user!.affiliationId
      })
      return r.affiliationId === auth.user!.affiliationId
    })
  }

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

  // ✅ SORT เฉพาะ treasury: pending ก่อน, success ทีหลัง
  if (auth.isRole('treasury')) {
    const statusRank = (s: TableStatus) => (s === 'pending' ? 0 : 1)

    rows.sort((a, b) => {
      const byStatus = statusRank(a.status) - statusRank(b.status)
      if (byStatus !== 0) return byStatus

      // ภายในกลุ่มเดียวกัน: เอารายการล่าสุดขึ้นก่อน
      const aTime = (a.updatedAt?.getTime() ?? a.createdAt?.getTime() ?? 0)
      const bTime = (b.updatedAt?.getTime() ?? b.createdAt?.getTime() ?? 0)
      return bTime - aTime
    })
  }

  return rows
})

/** ✅ Header stats: คำนวณจาก items ที่ถูกกรอง+sort แล้ว */
const headerStats = computed(() => {
  const rows = items.value
  const total = rows.length
  const pending = rows.filter((r) => r.status === 'pending').length
  const success = rows.filter((r) => r.status === 'success').length
  const totalAmount = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  return { total, pending, success, totalAmount }
})

/** ✅ Active filter text */
const activeFiltersText = computed(() => {
  const parts: string[] = []
  if (selectedMain.value) parts.push(selectedMain.value)
  if (selectedSub1.value) parts.push(selectedSub1.value)
  if (selectedSub2.value) parts.push(selectedSub2.value)
  if (searchText.value.trim()) parts.push(`ค้นหา: "${searchText.value.trim()}"`)
  return parts.length ? `กำลังกรอง: ${parts.join(' · ')}` : ''
})

/** ✅ สิทธิ action ต่อแถว */
const rowPermissions = (row: TableRow): ActionKey[] => {
  const perms: ActionKey[] = ['view']

  if (auth.isRole('user') && row.status === 'pending') {
    perms.push('edit', 'delete')
  }

  if (canApprove.value && row.status === 'pending') {
    perms.push('approve')
  }

  return perms
}

onMounted(async () => {
  if (!auth.isLoggedIn) {
    router.push({ name: 'login' })
    return
  }
  await loadData()
})

const view = (item: TableRow) => router.push(`/pdfpage/${item.id}`)
const edit = (item: TableRow) => router.push(`/waybill/edit/${item.id}`)

const gotowaybil = () => {
  if (!canCreateWaybill.value) {
    Swal.fire('ไม่มีสิทธิ์', 'เฉพาะผู้ใช้ (user) เท่านั้นที่สามารถเพิ่มใบนำส่งเงินได้', 'warning')
    return
  }
  router.push('/waybill')
}

/** ✅ Approve: กดแล้วแถวนั้นจะไหลลงล่าง (เพราะ sort) */
const approveItem = async (row: TableRow) => {
  if (!canApprove.value) {
    Swal.fire('ไม่มีสิทธิ์', 'เฉพาะกองคลัง (treasury) เท่านั้นที่อนุมัติได้', 'warning')
    return
  }
  if (row.status !== 'pending') return

  const result = await Swal.fire({
    title: 'อนุมัติรายการนี้?',
    text: `โครงการ: ${row.project}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'อนุมัติ',
    cancelButtonText: 'ยกเลิก',
  })

  if (!result.isConfirmed) return

  const target = rawData.value.find((r) => r.delNumber === row.id)

  if (!target) return

  target.isLocked = true

  Swal.fire({
    position: 'top-end',
    icon: 'success',
    title: 'อนุมัติแล้ว (Success)',
    showConfirmButton: false,
    timer: 1200,
  })
}

const removeItem = async (item: TableRow) => {
  const result = await Swal.fire({
    title: 'ต้องการลบ?',
    text: `${item.project}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
  })

  if (!result.isConfirmed) return

  await axios.delete(`/deleteReceipt/${item.id}`)
  await loadData()
  Swal.fire('ลบแล้ว', '', 'success')
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
