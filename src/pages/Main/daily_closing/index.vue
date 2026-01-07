<template>
  <div class="text-slate-700 antialiased selection:bg-blue-200 selection:text-blue-900">
    <div id="app" class="relative w-full h-screen flex overflow-hidden">
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

        <!-- Filters Area -->
        <div class="px-8 py-4 flex-shrink-0">
          <div class="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            <!-- Left Filters -->
            <div class="flex items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                :disabled="isTodayClosed"
                class="px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm border border-white/40 transition text-slate-700"
                :class="isTodayClosed ? 'bg-white/10 opacity-60 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'"
                v-tippy="isTodayClosed ? 'วันนี้ปิดยอดแล้ว (Frozen)' : 'ปิดยอดประจำวัน (วันนี้)'"
                @click="closeDaily"
              >
                <i class="ph ph-lock-key mr-2"></i>
                ปิดยอดประจำวัน
              </button>

              <button
                type="button"
                class="px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm border border-white/40 bg-white/10 hover:bg-white/20 transition text-slate-700"
                v-tippy="'ดูรายละเอียดประจำวัน'"
              >
                <i class="ph ph-eye mr-2"></i>
                View
              </button>
            </div>

            <!-- Right Actions -->
            <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
              <div class="flex flex-col items-end gap-1">
                <button
                  class="glass-button-primary px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
                  @click="manualRefresh"
                  :disabled="isTodayClosed"
                  :class="isTodayClosed ? 'opacity-60 cursor-not-allowed' : ''"
                  v-tippy="isTodayClosed ? 'วันนี้ปิดยอดแล้ว (Frozen)' : 'รีเฟรชข้อมูลทันที'"
                >
                  <i class="ph ph-arrows-clockwise mr-2"></i> รีเฟรช
                </button>

                <div class="text-xs text-slate-500 flex items-center gap-2 px-1">
                  <i class="ph ph-clock"></i>

                  <template v-if="isTodayClosed">
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
        </div>

        <!-- Data Area -->
        <div class="flex-1 px-8 pb-8 flex flex-col min-h-0">
          <div class="glass-panel rounded-2xl flex-1 flex flex-col shadow-lg min-h-0">
            <!-- Header (small) -->
            <div class="px-6 py-4 border-b border-white/40 bg-white/20 flex items-center justify-between flex-shrink-0">
              <div class="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <i class="ph ph-chart-bar"></i>
                Daily Overview
              </div>
              <div class="text-xs text-slate-500">
                แสดงทั้งหมด {{ dailyItems.length }} วัน
              </div>
            </div>

            <!-- BODY: Accordion List -->
            <div class="overflow-y-auto overflow-x-hidden flex-1 p-3 min-h-0 space-y-3">
              <div
                v-for="day in dailyItems"
                :key="day.dateKey"
                class="rounded-2xl border border-white/40 bg-white/10"
              >
                <!-- LEVEL 1 -->
                <button
                  class="w-full px-5 py-4 rounded-2xl transition"
                  :class="(!day.isClosed && LOCK_EXPAND_WHEN_NOT_CLOSED)
                    ? 'opacity-80 cursor-not-allowed'
                    : 'hover:bg-white/20'"
                  @click="onClickDay(day)"
                  type="button"
                >
                  <div class="grid grid-cols-12 items-center gap-4">
                    <!-- LEFT -->
                    <div class="col-span-12 lg:col-span-4 flex items-center gap-3 min-w-0">
                      <div class="w-10 h-10 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center flex-shrink-0">
                        <i class="ph ph-calendar text-lg text-slate-600"></i>
                      </div>

                      <div class="min-w-0">
                        <div class="font-semibold text-slate-800 truncate flex items-center gap-2">
                          {{ formatThaiDate(day.dateKey) }}

                          <!-- ✅ STATUS BADGE -->
                          <span
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border"
                            :class="day.isClosed
                              ? 'bg-green-100/70 text-green-700 border-green-200'
                              : 'bg-amber-100/70 text-amber-700 border-amber-200'"
                          >
                            <i class="ph" :class="day.isClosed ? 'ph-check-circle' : 'ph-clock'"></i>
                            {{ day.isClosed ? 'ปิดยอดแล้ว' : 'ยังไม่ปิดยอด' }}
                          </span>

                          <span
                            v-if="day.isClosed && day.closedAt"
                            class="text-[11px] text-slate-400 hidden sm:inline"
                          >
                            ({{ day.closedAt }})
                          </span>
                        </div>

                        <div class="text-xs text-slate-500">
                          รวม {{ day.total.countWaybill + day.total.countDebtor + day.total.countClear }} รายการ
                          • สุทธิ
                          <span class="font-semibold" :class="day.total.net >= 0 ? 'text-green-600' : 'text-red-600'">
                            {{ formatCurrency(day.total.net) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- MID -->
                    <div class="col-span-12 lg:col-span-7">
                      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

                    <!-- RIGHT -->
                    <div class="col-span-12 lg:col-span-1 flex items-center justify-between lg:justify-end gap-3">
                      <span class="inline-flex text-xs px-3 py-1 rounded-full border border-white/40 bg-white/20 text-slate-600 whitespace-nowrap">
                        {{ day.faculties.length }} หน่วยงาน
                      </span>

                      <i
                        class="ph ph-caret-down text-lg text-slate-500 transition"
                        :class="day.expanded ? 'rotate-180' : ''"
                      ></i>
                    </div>
                  </div>

                  <div v-if="!day.isClosed" class="mt-2 text-[11px] text-amber-700/90 flex items-center gap-2">
                    <i class="ph ph-warning-circle"></i>
                    ยังไม่ปิดยอด
                    <span v-if="LOCK_EXPAND_WHEN_NOT_CLOSED">• (ล็อกไม่ให้ขยายจนกว่าจะปิดยอด)</span>
                  </div>
                </button>

                <!-- LEVEL 2 -->
                <div v-if="day.expanded" class="px-5 pb-4">
                  <div class="mt-2 grid grid-cols-12 text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 py-2">
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
                      class="grid grid-cols-12 items-center px-3 py-3 rounded-xl border border-white/40 bg-white/10 hover:bg-white/20 transition"
                    >
                      <div class="col-span-5 min-w-0">
                        <div class="font-medium text-slate-800 truncate">
                          {{ f.faculty }}
                        </div>
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

              <div v-if="dailyItems.length === 0" class="p-10 text-center text-slate-500">
                <i class="ph ph-info text-2xl"></i>
                <div class="mt-2">ไม่พบข้อมูลตามเงื่อนไขที่เลือก</div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-3 border-t border-white/40 bg-white/10 flex items-center justify-between flex-shrink-0">
              <div class="text-xs text-slate-500">
                โหมดทดสอบ: Mock data • Poll: 60s
              </div>
              <div class="text-xs text-slate-500">
                Tips: พิมพ์ช่วงวัน เช่น <span class="font-mono">2025-12-01 ถึง 2025-12-18</span>
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
import Swal from 'sweetalert2'
import axios from 'axios'

/**
 * ✅ ถ้า true = วันไหนยังไม่ปิดยอด "ห้ามกดขยาย"
 * ถ้า false = ยังไม่ปิดยอด "กดขยายได้"
 */
const LOCK_EXPAND_WHEN_NOT_CLOSED = false

type EventType = 'WAYBILL' | 'DEBTOR_NEW' | 'CLEAR_DEBTOR'
type SummaryEvent = {
  createdAt: string
  type: EventType
  faculty: string
  amount: number
  sub1?: string
  sub2?: string
  fundName?: string
  fullName?: string
  projectCode?: string
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
  total: {
    countWaybill: number; sumWaybill: number
    countDebtor: number;  sumDebtor: number
    countClear: number;   sumClear: number
    net: number
  }
  faculties: FacultySummary[]
}

/**
 * Filters (ยังคงไว้เหมือนเดิม)
 */
const searchText = ref('')
const selectedMain = ref('')
const selectedSub1 = ref('')
const selectedSub2 = ref('')
const dateRangeText = ref('')

/**
 * ✅ เปลี่ยนจาก mockEventsBase -> eventsFromApi
 */
const eventsFromApi = ref<SummaryEvent[]>([])

/**
 * Helpers: dateKey + parse range
 */
const dateKeyOf = (iso: string) => {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const parseDateRange = (text: string): { start?: Date; end?: Date } => {
  const cleaned = (text || '').trim()
  if (!cleaned) return {}

  const parts = cleaned
    .replace('ถึง', '-')
    .split('-')
    .map(s => s.trim())
    .filter(Boolean)

  if (parts.length < 2) return {}

  const start = new Date(parts[0] + 'T00:00:00')
  const end = new Date(parts[1] + 'T23:59:59')
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return {}

  return { start, end }
}

/**
 * ✅ Close State Store (ต่อวัน) -> ดึงจาก API
 */
type CloseState = { isClosed: boolean; closedAt?: string }
const closedMap = ref<Record<string, CloseState>>({})

const getTodayDateKey = () => dateKeyOf(new Date().toISOString())
const isDateClosed = (dateKey: string) => !!closedMap.value[dateKey]?.isClosed
const isTodayClosed = computed(() => isDateClosed(getTodayDateKey()))

/**
 * ✅ Freeze Mode (เข้ม)
 */
const freezeMode = ref(false)

/**
 * Polling
 */
const POLL_MS = 60_000
const pollTimer = ref<number | null>(null)

const dayWatcherTimer = ref<number | null>(null)
const DAY_WATCH_MS = 15_000

const lastUpdatedAt = ref<Date | null>(null)
const lastUpdatedText = computed(() => {
  if (!lastUpdatedAt.value) return '-'
  return lastUpdatedAt.value.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
})

/**
 * ✅ Start/Stop Poll
 */
const stopPoll = () => {
  if (pollTimer.value) {
    window.clearInterval(pollTimer.value)
    pollTimer.value = null
  }
}

const startPoll = () => {
  stopPoll()
  if (isTodayClosed.value) return
  pollTimer.value = window.setInterval(loadLatest, POLL_MS)
}

/**
 * ✅ NEW: Fetch APIs
 * - /summary/events
 * - /daily/closed-map
 */
const fetchClosedMap = async () => {
  const res = await axios.get('/daily/closed-map')
  closedMap.value = res.data?.map || {}
}

const buildSummaryParams = () => {
  // ส่ง filter ไป server ได้เลย (ถ้าคุณอยากให้ server filter)
  const params: Record<string, string> = {}

  if (searchText.value.trim()) params.search = searchText.value.trim()
  if (selectedMain.value) params.faculty = selectedMain.value
  if (selectedSub1.value) params.sub1 = selectedSub1.value
  if (selectedSub2.value) params.sub2 = selectedSub2.value

  const { start, end } = parseDateRange(dateRangeText.value)
  if (start && end) {
    params.start = dateKeyOf(start.toISOString())
    params.end = dateKeyOf(end.toISOString())
  }

  return params
}

const fetchEvents = async () => {
  const res = await axios.get('/summary/events', { params: buildSummaryParams() })
  eventsFromApi.value = res.data?.items || []
  lastUpdatedAt.value = new Date()
}

/**
 * ✅ loadLatest = re-fetch data (แทนการสุ่มเพิ่ม mock)
 */
const loadLatest = async () => {
  if (freezeMode.value) return
  if (isTodayClosed.value) return
  await fetchEvents()
}

const manualRefresh = async () => {
  if (freezeMode.value || isTodayClosed.value) return
  await fetchEvents()
}

/**
 * ✅ Close Daily -> เรียก API /daily/close
 */
const closeDaily = async () => {
  const todayKey = getTodayDateKey()

  if (isDateClosed(todayKey)) {
    await Swal.fire({
      icon: 'info',
      title: 'ปิดยอดแล้ว',
      text: `วันนี้ (${formatThaiDate(todayKey)}) ถูกปิดยอดไปแล้ว`,
      confirmButtonText: 'รับทราบ',
      confirmButtonColor: '#6366f1',
    })
    return
  }

  const result = await Swal.fire({
    icon: 'warning',
    title: 'ยืนยันปิดยอดประจำวัน',
    html: `
      <div style="text-align:left">
        <div><b>วันที่:</b> ${formatThaiDate(todayKey)}</div>
        <div><b>คำเตือน:</b> เมื่อปิดยอดแล้วจะ “Frozen” ไม่ให้เพิ่ม/แก้ไขข้อมูลของวันนั้น</div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'ใช่, ปิดยอดเลย',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#ef4444',
    reverseButtons: true,
  })

  if (!result.isConfirmed) return

  // ✅ ปิดยอดจริง (ให้ server เป็นคนบันทึก)
  await axios.post('/daily/close', { dateKey: todayKey })

  // ✅ refresh close map
  await fetchClosedMap()

  // ✅ เข้ม: เปิด freeze + หยุด poll
  freezeMode.value = true
  stopPoll()
  lastUpdatedAt.value = new Date()

  await Swal.fire({
    icon: 'success',
    title: 'ปิดยอดสำเร็จ',
    text: `ปิดยอดวันที่ ${formatThaiDate(todayKey)} แล้ว (Frozen)`,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#6366f1',
  })
}

/**
 * ✅ Watch freeze condition จาก isTodayClosed
 */
watch(
  isTodayClosed,
  (closed) => {
    if (closed) {
      freezeMode.value = true
      stopPoll()
    } else {
      freezeMode.value = false
      startPoll()
    }
  },
  { immediate: true }
)

/**
 * ✅ Day watcher: เมื่อวันเปลี่ยน
 */
const currentDayKey = ref(getTodayDateKey())

const startDayWatcher = () => {
  if (dayWatcherTimer.value) window.clearInterval(dayWatcherTimer.value)

  dayWatcherTimer.value = window.setInterval(async () => {
    const nowKey = getTodayDateKey()
    if (nowKey !== currentDayKey.value) {
      currentDayKey.value = nowKey

      // วันเปลี่ยนแล้ว -> refresh closedMap ก่อนเพื่อความชัวร์
      await fetchClosedMap()

      if (!isDateClosed(nowKey)) {
        freezeMode.value = false
        startPoll()
        await fetchEvents()
      } else {
        freezeMode.value = true
        stopPoll()
      }
    }
  }, DAY_WATCH_MS)
}

const stopDayWatcher = () => {
  if (dayWatcherTimer.value) {
    window.clearInterval(dayWatcherTimer.value)
    dayWatcherTimer.value = null
  }
}

/**
 * Filters
 * ✅ ตอนนี้ eventsFromApi ถูก filter มาแล้วจาก server
 * แต่ยังคงกรองซ้ำฝั่งหน้าไว้ได้ (เผื่อคุณไม่ส่ง params ก็ยังทำงาน)
 */
const filteredEvents = computed(() => {
  let arr = [...eventsFromApi.value]

  const { start, end } = parseDateRange(dateRangeText.value)
  if (start && end) {
    arr = arr.filter(e => {
      const d = new Date(e.createdAt)
      return d >= start && d <= end
    })
  }

  if (searchText.value.trim()) {
    const s = searchText.value.toLowerCase()
    arr = arr.filter(e =>
      e.faculty?.toLowerCase().includes(s) ||
      e.sub1?.toLowerCase().includes(s) ||
      e.sub2?.toLowerCase().includes(s) ||
      e.fundName?.toLowerCase().includes(s) ||
      e.fullName?.toLowerCase().includes(s) ||
      e.projectCode?.toLowerCase().includes(s)
    )
  }

  if (selectedMain.value) arr = arr.filter(e => e.faculty === selectedMain.value)
  if (selectedSub1.value) arr = arr.filter(e => (e.sub1 || '') === selectedSub1.value)
  if (selectedSub2.value) arr = arr.filter(e => (e.sub2 || '') === selectedSub2.value)

  return arr
})

/**
 * Preserve expanded state
 */
const expandedMap = ref<Record<string, boolean>>({})

const toggleDay = (dateKey: string) => {
  expandedMap.value[dateKey] = !expandedMap.value[dateKey]
}

const onClickDay = (day: DailySummary) => {
  if (LOCK_EXPAND_WHEN_NOT_CLOSED && !day.isClosed) return
  toggleDay(day.dateKey)
}

/**
 * Build DailySummary + inject close state
 */
const buildDaily = (events: SummaryEvent[]): DailySummary[] => {
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

    const apply = (t: any) => {
      if (e.type === 'WAYBILL') { t.countWaybill++; t.sumWaybill += e.amount }
      if (e.type === 'DEBTOR_NEW') { t.countDebtor++; t.sumDebtor += e.amount }
      if (e.type === 'CLEAR_DEBTOR') { t.countClear++; t.sumClear += e.amount }
    }

    apply(day.total)
    apply(f)
  }

  const result: DailySummary[] = Array.from(dayMap.values()).map(day => {
    day.total.net = day.total.sumWaybill + day.total.sumClear - day.total.sumDebtor

    day.faculties = Array.from(day.facMap.values()).sort((a: FacultySummary, b: FacultySummary) => {
      const netB = b.sumWaybill + b.sumClear - b.sumDebtor
      const netA = a.sumWaybill + a.sumClear - a.sumDebtor
      return netB - netA
    })

    delete day.facMap

    // restore expanded
    day.expanded = !!expandedMap.value[day.dateKey]

    // inject close
    const closeState = closedMap.value[day.dateKey]
    day.isClosed = closeState?.isClosed ?? false
    day.closedAt = closeState?.closedAt

    return day as DailySummary
  })

  result.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1))
  return result
}

const dailyItems = computed(() => buildDaily(filteredEvents.value))

/**
 * Display helpers
 */
const formatCurrency = (n: number) =>
  (Number(n || 0)).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatThaiDate = (dateKey: string) => {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Mount lifecycle
 */
onMounted(async () => {
  // ✅ โหลด closeMap ก่อน เพื่อคุม freeze/poll ให้ถูก
  await fetchClosedMap()

  // ✅ โหลด events ครั้งแรก
  await fetchEvents()

  // ✅ เริ่ม poll ตามสถานะวันนี้
  startPoll()

  // ✅ ตัวเช็คเปลี่ยนวัน
  startDayWatcher()
})

onBeforeUnmount(() => {
  stopPoll()
  stopDayWatcher()
})
</script>

