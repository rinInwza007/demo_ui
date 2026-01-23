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
              สรุปยอดรายวัน
            </h1>
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

        <div class="px-8 py-4 flex-shrink-0">
          <div class="glass-panel p-4 rounded-2xl flex items-center justify-between shadow-sm">
            <!-- ✅ ปุ่มปิดยอด -->
            <div class="flex items-center gap-3">
              <button
                type="button"
                :disabled="dailyClose.isTodayClosed"
                class="px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm border border-white/40 transition text-slate-700"
                :class="dailyClose.isTodayClosed ? 'bg-white/10 opacity-60 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'"
                @click="closeDaily"
              >
                <i class="ph ph-lock-key mr-2"></i>
                ปิดยอดประจำวัน
              </button>

              <!-- ✅ ปุ่มยกเลิกการปิดยอด (เฉพาะ superadmin) -->
              <button
                v-if="auth.isRole('superadmin') && dailyClose.isTodayClosed"
                type="button"
                class="px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 transition"
                @click="reopenDaily"
              >
                <i class="ph ph-lock-key-open mr-2"></i>
                ยกเลิกการปิดยอด
              </button>

              <!-- ✅ แสดงข้อมูลการปิดยอด -->
              <div
                v-if="dailyClose.todayRecord"
                class="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-xs"
              >
                <i class="ph ph-check-circle text-green-600"></i>
                <span class="text-green-700">
                  ปิดยอดโดย: <strong>{{ dailyClose.todayRecord.closedByName }}</strong>
                </span>
                <span class="text-green-600">•</span>
                <span class="text-green-700">
                  เวลา: <strong>{{ formatCloseTime(dailyClose.todayRecord.closedAt) }}</strong>
                </span>
              </div>
            </div>

            <div class="flex flex-col items-end gap-1">
              <button
                class="glass-button-primary px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
                @click="manualRefresh"
              >
                <i class="ph ph-arrows-clockwise mr-2"></i> รีเฟรช
              </button>

              <div class="text-xs text-slate-500 flex items-center gap-2 px-1">
                <i class="ph ph-clock"></i>
                <template v-if="dailyClose.isTodayClosed">
                   หยุดอัปเดตอัตโนมัติ • ล่าสุด:
                  <span class="font-semibold text-slate-600">{{ lastUpdatedText }}</span>
                </template>
                <template v-else>
                  อัปเดตทุก 1 นาที • อัปเดตล่าสุด:
                  <span class="font-semibold text-slate-600">{{ lastUpdatedText }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 px-8 pb-8 flex flex-col min-h-0">
          <div class="glass-panel rounded-2xl flex-1 flex flex-col shadow-lg min-h-0">
            <div class="px-6 py-4 border-b border-white/40 bg-white/20 flex items-center justify-between flex-shrink-0">
              <div class="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <i class="ph ph-chart-bar"></i>
                Daily Overview
              </div>
              <div class="text-xs text-slate-500">
                แสดงทั้งหมด {{ dailyItems.length }} วัน
              </div>
            </div>

            <div class="overflow-y-auto overflow-x-hidden flex-1 p-3 min-h-0 space-y-3">
              <div
                v-if="isLoading"
                class="p-10 text-center text-slate-500"
              >
                <i class="ph ph-spinner text-2xl animate-spin"></i>
                <div class="mt-2">กำลังโหลดข้อมูล...</div>
              </div>

              <div
                v-else-if="dailyItems.length === 0"
                class="p-10 text-center text-slate-500"
              >
                <i class="ph ph-info text-2xl"></i>
                <div class="mt-2">ไม่พบข้อมูล</div>
              </div>

              <div
                v-else
                v-for="day in dailyItems"
                :key="day.dateKey"
                class="rounded-2xl border border-white/40 bg-white/10 p-5"
              >
                <div class="grid grid-cols-12 items-center gap-4">
                  <div class="col-span-12 lg:col-span-4 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center flex-shrink-0">
                      <i class="ph ph-calendar text-lg text-slate-600"></i>
                    </div>

                    <div class="min-w-0">
                      <div class="font-semibold text-slate-800 flex items-center gap-2">
                        {{ formatThaiDate(day.dateKey) }}
                        <span
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border"
                          :class="day.isClosed
                            ? 'bg-green-100/70 text-green-700 border-green-200'
                            : 'bg-amber-100/70 text-amber-700 border-amber-200'"
                        >
                          <i class="ph" :class="day.isClosed ? 'ph-check-circle' : 'ph-clock'"></i>
                          {{ day.isClosed ? 'ปิดยอดแล้ว' : 'ยังไม่ปิดยอด' }}
                        </span>
                      </div>

                      <div class="text-xs text-slate-500">
                        รวม {{ day.total.countWaybill + day.total.countDebtor + day.total.countClear }} รายการ
                        • สุทธิ
                        <span class="font-semibold" :class="day.total.net >= 0 ? 'text-green-600' : 'text-red-600'">
                          {{ formatCurrency(day.total.net) }}
                        </span>
                      </div>

                      <!-- ✅ แสดงข้อมูลการปิดยอด -->
                      <div v-if="day.isClosed && day.closedAt" class="text-[10px] text-slate-400 mt-1">
                        <i class="ph ph-clock"></i>
                        ปิดยอด: {{ formatCloseTime(day.closedAt) }}
                        <span v-if="day.closedByName"> โดย {{ day.closedByName }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="col-span-12 lg:col-span-6">
                    <div class="grid grid-cols-4 gap-3">
                      <div class="rounded-xl border border-white/40 bg-white/10 px-3 py-2">
                        <div class="text-[11px] text-slate-500">ใบนำส่ง</div>
                        <div class="text-sm font-semibold font-mono text-slate-800">
                          {{ day.total.countWaybill }} • {{ formatCurrency(day.total.sumWaybill) }}
                        </div>
                      </div>

                      <div class="rounded-xl border border-white/40 bg-white/10 px-3 py-2">
                        <div class="text-[11px] text-slate-500">ลูกหนี้ใหม่</div>
                        <div class="text-sm font-semibold font-mono text-slate-800">
                          {{ day.total.countDebtor }} • {{ formatCurrency(day.total.sumDebtor) }}
                        </div>
                      </div>

                      <div class="rounded-xl border border-white/40 bg-white/10 px-3 py-2">
                        <div class="text-[11px] text-slate-500">ล้างลูกหนี้</div>
                        <div class="text-sm font-semibold font-mono text-slate-800">
                          {{ day.total.countClear }} • {{ formatCurrency(day.total.sumClear) }}
                        </div>
                      </div>

                      <div class="rounded-xl border border-white/40 bg-white/10 px-3 py-2">
                        <div class="text-[11px] text-slate-500">ยอดสุทธิ</div>
                        <div class="text-sm font-bold font-mono" :class="day.total.net >= 0 ? 'text-green-600' : 'text-red-600'">
                          {{ formatCurrency(day.total.net) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-span-12 lg:col-span-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      class="px-4 py-2 rounded-lg text-sm font-semibold shadow-sm border border-white/40 bg-blue-500 hover:bg-blue-600 text-white transition flex items-center gap-2"
                      @click="gotoReportpage(day.dateKey)"
                    >
                      <i class="ph ph-file-text"></i>
                      View Report
                    </button>

                    <button
                      class="px-3 py-2 rounded-lg text-sm shadow-sm border border-white/40 bg-white/20 hover:bg-white/30 transition"
                      @click="toggleDay(day.dateKey)"
                      type="button"
                    >
                      <i
                        class="ph ph-caret-down transition"
                        :class="day.expanded ? 'rotate-180' : ''"
                      ></i>
                    </button>
                  </div>
                </div>

                <div v-if="day.expanded" class="mt-4 pt-4 border-t border-white/20">
                  <div class="grid grid-cols-12 text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 py-2">
                    <div class="col-span-5">คณะ/หน่วยงาน</div>
                    <div class="col-span-2 text-right">ใบนำส่ง</div>
                    <div class="col-span-2 text-right">ลูกหนี้</div>
                    <div class="col-span-2 text-right">ล้างลูกหนี้</div>
                    <div class="col-span-1 text-right">สุทธิ</div>
                  </div>

                  <div class="space-y-2">
                    <div
                      v-for="f in day.faculties"
                      :key="day.dateKey + '_' + f.faculty"
                      class="grid grid-cols-12 items-center px-3 py-3 rounded-xl border border-white/40 bg-white/10"
                    >
                      <div class="col-span-5">
                        <div class="font-medium text-slate-800">{{ f.faculty }}</div>
                        <div class="text-xs text-slate-500">
                          รวม {{ f.countWaybill + f.countDebtor + f.countClear }} รายการ
                        </div>
                      </div>

                      <div class="col-span-2 text-right text-sm font-mono">
                        {{ f.countWaybill }} • {{ formatCurrency(f.sumWaybill) }}
                      </div>

                      <div class="col-span-2 text-right text-sm font-mono">
                        {{ f.countDebtor }} • {{ formatCurrency(f.sumDebtor) }}
                      </div>

                      <div class="col-span-2 text-right text-sm font-mono">
                        {{ f.countClear }} • {{ formatCurrency(f.sumClear) }}
                      </div>

                      <div
                        class="col-span-1 text-right font-bold font-mono"
                        :class="(f.sumWaybill + f.sumClear - f.sumDebtor) >= 0 ? 'text-green-600' : 'text-red-600'"
                      >
                        {{ formatCurrency(f.sumWaybill + f.sumClear - f.sumDebtor) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import sidebar from '@/components/bar/sidebar.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDailyCloseStore } from '@/stores/DailyClose'
import Swal from 'sweetalert2'
import axios from 'axios'
import { fetchSummaryEvents } from '@/services/dashboard'
const router = useRouter()
const auth = useAuthStore()
const dailyClose = useDailyCloseStore()

const gotoReportpage = (dateKey: string) => {
  console.log('🚀 Navigating to:', `/daily_report/${dateKey}`)
  router.push(`/daily_report/${dateKey}`)
}

type EventType = 'WAYBILL' | 'DEBTOR_NEW' | 'CLEAR_DEBTOR'
type SummaryEvent = {
  createdAt: string
  type: EventType
  faculty: string
  amount: number
}

type FacultySummary = {
  faculty: string
  countWaybill: number
  sumWaybill: number
  countDebtor: number
  sumDebtor: number
  countClear: number
  sumClear: number
}

type DailySummary = {
  dateKey: string
  expanded: boolean
  isClosed: boolean
  closedAt?: string
  closedByName?: string
  total: {
    countWaybill: number; sumWaybill: number
    countDebtor: number;  sumDebtor: number
    countClear: number;   sumClear: number
    net: number
  }
  faculties: FacultySummary[]
}

const eventsFromApi = ref([] as SummaryEvent[])
const expandedMap = ref<Record<string, boolean>>({})
const isLoading = ref(true)
const isFetching = ref(false)
let refreshInterval: number | null = null

const dateKeyOf = (iso: string) => {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const lastUpdatedAt = ref<Date | null>(null)
const lastUpdatedText = computed(() => {
  if (!lastUpdatedAt.value) return '-'
  return lastUpdatedAt.value.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
})

const fetchEvents = async () => {
  if (isFetching.value) {
    console.log('⏳ Already fetching, skipping...')
    return
  }
  
  isFetching.value = true
  
  try {
    console.log('🔄 Fetching events...')
    const res = await axios.get('/summary/events')
    console.log('✅ Response:', res.data)
    
    // ✅ เพิ่มการตรวจสอบ
    if (!res.data) {
      console.warn('⚠️ Response data is undefined')
      eventsFromApi.value = []
      return
    }
    
    const items = res.data?.items || []
    
    // ✅ ตรวจสอบก่อน assign
    if (!Array.isArray(items)) {
      console.warn('⚠️ Items is not array:', items)
      eventsFromApi.value = []
      return
    }
    
    eventsFromApi.value = items
    console.log('📦 Events loaded:', eventsFromApi.value.length)
    
    lastUpdatedAt.value = new Date()
    
  } catch (error) {
    console.error('❌ Failed to fetch events:', error)
    
    // ✅ ต้องตั้งค่า fallback
    eventsFromApi.value = []
    
    // Optional: แสดง error ให้ user รู้
    await Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
      confirmButtonText: 'รับทราบ',
    })
  } finally {
    isFetching.value = false
  }
}
const startAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  
  if (!dailyClose.isTodayClosed) {
    refreshInterval = window.setInterval(async () => {
      await fetchEvents()
    }, 60000)
  }
}

const manualRefresh = async () => {
  await fetchEvents()
}

const closeDaily = async () => {
  if (dailyClose.isTodayClosed) {
    await Swal.fire({
      icon: 'info',
      title: 'ปิดยอดแล้ว',
      text: 'วันนี้ปิดยอดแล้ว',
      confirmButtonText: 'รับทราบ',
    })
    return
  }

  const result = await Swal.fire({
    icon: 'warning',
    title: 'ยืนยันปิดยอดประจำวัน',
    html: `
      <div class="text-left">
        <p class="mb-2">เมื่อปิดยอดแล้ว จะไม่สามารถ:</p>
        <ul class="list-disc list-inside text-sm text-gray-600">
          <li>สร้างใบนำส่งใหม่</li>
          <li>แก้ไขใบนำส่ง</li>
          <li>ลบใบนำส่ง</li>
        </ul>
        <p class="mt-3 text-sm text-gray-500">
          (สามารถดูใบนำส่งได้ตามปกติ)
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '✓ ยืนยันปิดยอด',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#10b981',
  })

  if (!result.isConfirmed) return

  try {
    if (!auth.user) throw new Error('ไม่พบข้อมูลผู้ใช้')
    
    dailyClose.closeDaily(auth.user.id, auth.user.fullName)

    await Swal.fire({
      icon: 'success',
      title: 'ปิดยอดสำเร็จ',
      text: 'ระบบได้ทำการปิดยอดประจำวันแล้ว',
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (error: any) {
    console.error('❌ Close daily error:', error)
    Swal.fire('ข้อผิดพลาด', error.message || 'ไม่สามารถปิดยอดได้', 'error')
  }
}

const reopenDaily = async () => {
  if (!auth.isRole('superadmin')) {
    await Swal.fire({
      icon: 'error',
      title: 'ไม่มีสิทธิ์',
      text: 'เฉพาะ Super Admin เท่านั้นที่สามารถยกเลิกการปิดยอดได้',
      confirmButtonText: 'รับทราบ',
    })
    return
  }

  const result = await Swal.fire({
    icon: 'warning',
    title: 'ยืนยันยกเลิกการปิดยอด?',
    html: `
      <div class="text-left">
        <p class="mb-2 text-red-600 font-semibold">⚠️ คำเตือน</p>
        <p class="mb-2">การยกเลิกการปิดยอดจะทำให้:</p>
        <ul class="list-disc list-inside text-sm text-gray-600">
          <li>สามารถสร้างใบนำส่งใหม่ได้อีกครั้ง</li>
          <li>สามารถแก้ไขและลบใบนำส่งได้</li>
          <li>ข้อมูลการปิดยอดจะถูกลบออก</li>
        </ul>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '✓ ยืนยันยกเลิก',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#ef4444',
  })

  if (!result.isConfirmed) return

  try {
    const today = dateKeyOf(new Date().toISOString())
    dailyClose.reopenDaily(today)

    await Swal.fire({
      icon: 'success',
      title: 'ยกเลิกการปิดยอดสำเร็จ',
      text: 'สามารถสร้าง/แก้ไข/ลบใบนำส่งได้ตามปกติแล้ว',
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (error: any) {
    console.error('❌ Reopen daily error:', error)
    Swal.fire('ข้อผิดพลาด', error.message || 'ไม่สามารถยกเลิกการปิดยอดได้', 'error')
  }
}

const toggleDay = (dateKey: string) => {
  expandedMap.value[dateKey] = !expandedMap.value[dateKey]
}

const buildDaily = (events: SummaryEvent[]): DailySummary[] => {
    if (!events || !Array.isArray(events)) {
    console.warn('⚠️ buildDaily received invalid events:', events)
    return []
  }

  const dayMap = new Map<string, any>()

  for (const e of events) {
    const dk = dateKeyOf(e.createdAt)

    if (!dayMap.has(dk)) {
      dayMap.set(dk, {
        dateKey: dk,
        total: {
          countWaybill: 0, sumWaybill: 0,
          countDebtor: 0,  sumDebtor: 0,
          countClear: 0,   sumClear: 0,
          net: 0,
        },
        facMap: new Map<string, any>(),
      })
    }

    const day = dayMap.get(dk)

    if (!day.facMap.has(e.faculty)) {
      day.facMap.set(e.faculty, {
        faculty: e.faculty,
        countWaybill: 0, sumWaybill: 0,
        countDebtor: 0,  sumDebtor: 0,
        countClear: 0,   sumClear: 0,
      })
    }

    const f = day.facMap.get(e.faculty)

    if (e.type === 'WAYBILL') { day.total.countWaybill++; day.total.sumWaybill += e.amount; f.countWaybill++; f.sumWaybill += e.amount }
    if (e.type === 'DEBTOR_NEW') { day.total.countDebtor++; day.total.sumDebtor += e.amount; f.countDebtor++; f.sumDebtor += e.amount }
    if (e.type === 'CLEAR_DEBTOR') { day.total.countClear++; day.total.sumClear += e.amount; f.countClear++; f.sumClear += e.amount }
  }

  const result: DailySummary[] = Array.from(dayMap.values()).map(day => {
    day.total.net = day.total.sumWaybill + day.total.sumClear - day.total.sumDebtor
    day.faculties = Array.from(day.facMap.values())
    delete day.facMap
    day.expanded = !!expandedMap.value[day.dateKey]
    
    // ✅ ดึงข้อมูลการปิดยอดจาก store
    const closeRecord = dailyClose.getRecord(day.dateKey)
    day.isClosed = closeRecord?.isClosed ?? false
    day.closedAt = closeRecord?.closedAt
    day.closedByName = closeRecord?.closedByName
    
    return day as DailySummary
  })

  result.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1))
  return result
}

const dailyItems = computed(() => {
  try {
    // ✅ เช็คก่อนเรียก buildDaily
    if (!eventsFromApi.value || !Array.isArray(eventsFromApi.value)) {
      console.warn('⚠️ eventsFromApi is not ready:', eventsFromApi.value)
      return []
    }
    
    return buildDaily(eventsFromApi.value)
  } catch (error) {
    console.error('❌ Error in dailyItems computed:', error)
    return []
  }
})

const formatCurrency = (n: number) =>
  (Number(n || 0)).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatThaiDate = (dateKey: string) => {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatCloseTime = (isoTime?: string) => {
  if (!isoTime) return '-'
  const d = new Date(isoTime)
  return d.toLocaleString('th-TH', { 
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

watch(() => dailyClose.isTodayClosed, (newVal) => {
  if (newVal) {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  } else {
    startAutoRefresh()
  }
})

onMounted(async () => {
  isLoading.value = true
  console.log('🚀 Component mounted') // 👈 เพิ่ม
  
  try {
    await fetchEvents()
    
    // ✅ เช็คว่าโหลดสำเร็จหรือไม่
    if (eventsFromApi.value.length === 0) {
      console.warn('⚠️ No events loaded')
    }
    
    startAutoRefresh()
  } catch (error) {
    console.error('❌ Initial load failed:', error)
    
    // แสดง error ให้ชัดเจน
    await Swal.fire({
      icon: 'error',
      title: 'ไม่สามารถโหลดข้อมูล',
      text: error.message || 'กรุณาลองใหม่อีกครั้ง',
      confirmButtonText: 'รับทราบ',
    })
  } finally {
    isLoading.value = false
    console.log('✅ Loading complete') // 👈 เพิ่ม
  }
})

onBeforeUnmount(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>