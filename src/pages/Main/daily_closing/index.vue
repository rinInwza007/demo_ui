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
            <button
              type="button"
              :disabled="isTodayClosed"
              class="px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm border border-white/40 transition text-slate-700"
              :class="isTodayClosed ? 'bg-white/10 opacity-60 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'"
              @click="closeDaily"
            >
              <i class="ph ph-lock-key mr-2"></i>
              ปิดยอดประจำวัน
            </button>

            <div class="flex flex-col items-end gap-1">
              <button
                class="glass-button-primary px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
                @click="manualRefresh"
                :disabled="isTodayClosed"
                :class="isTodayClosed ? 'opacity-60 cursor-not-allowed' : ''"
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

              <div v-if="dailyItems.length === 0" class="p-10 text-center text-slate-500">
                <i class="ph ph-info text-2xl"></i>
                <div class="mt-2">ไม่พบข้อมูล</div>
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
import Swal from 'sweetalert2'
import axios from 'axios'

const router = useRouter()

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
  total: {
    countWaybill: number; sumWaybill: number
    countDebtor: number;  sumDebtor: number
    countClear: number;   sumClear: number
    net: number
  }
  faculties: FacultySummary[]
}

const eventsFromApi = ref<SummaryEvent[]>([])

type CloseState = { isClosed: boolean; closedAt?: string }
const closedMap = ref<Record<string, CloseState>>({})

const expandedMap = ref<Record<string, boolean>>({})

const dateKeyOf = (iso: string) => {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const getTodayDateKey = () => dateKeyOf(new Date().toISOString())
const isDateClosed = (dateKey: string) => !!closedMap.value[dateKey]?.isClosed
const isTodayClosed = computed(() => isDateClosed(getTodayDateKey()))

const lastUpdatedAt = ref<Date | null>(null)
const lastUpdatedText = computed(() => {
  if (!lastUpdatedAt.value) return '-'
  return lastUpdatedAt.value.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
})

const fetchClosedMap = async () => {
  const res = await axios.get('/daily/closed-map')
  closedMap.value = res.data?.map || {}
}

const fetchEvents = async () => {
  const res = await axios.get('/summary/events')
  eventsFromApi.value = res.data?.items || []
  lastUpdatedAt.value = new Date()
}

const manualRefresh = async () => {
  await fetchEvents()
}

const closeDaily = async () => {
  const todayKey = getTodayDateKey()

  if (isDateClosed(todayKey)) {
    await Swal.fire({
      icon: 'info',
      title: 'ปิดยอดแล้ว',
      text: `วันนี้ปิดยอดแล้ว`,
      confirmButtonText: 'รับทราบ',
    })
    return
  }

  const result = await Swal.fire({
    icon: 'warning',
    title: 'ยืนยันปิดยอดประจำวัน',
    showCancelButton: true,
    confirmButtonText: 'ใช่, ปิดยอด',
    cancelButtonText: 'ยกเลิก',
  })

  if (!result.isConfirmed) return

  await axios.post('/daily/close', { dateKey: todayKey })
  await fetchClosedMap()

  await Swal.fire({
    icon: 'success',
    title: 'ปิดยอดสำเร็จ',
  })
}

const toggleDay = (dateKey: string) => {
  expandedMap.value[dateKey] = !expandedMap.value[dateKey]
}

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

    if (e.type === 'WAYBILL') { day.total.countWaybill++; day.total.sumWaybill += e.amount; f.countWaybill++; f.sumWaybill += e.amount }
    if (e.type === 'DEBTOR_NEW') { day.total.countDebtor++; day.total.sumDebtor += e.amount; f.countDebtor++; f.sumDebtor += e.amount }
    if (e.type === 'CLEAR_DEBTOR') { day.total.countClear++; day.total.sumClear += e.amount; f.countClear++; f.sumClear += e.amount }
  }

  const result: DailySummary[] = Array.from(dayMap.values()).map(day => {
    day.total.net = day.total.sumWaybill + day.total.sumClear - day.total.sumDebtor
    day.faculties = Array.from(day.facMap.values())
    delete day.facMap
    day.expanded = !!expandedMap.value[day.dateKey]
    const closeState = closedMap.value[day.dateKey]
    day.isClosed = closeState?.isClosed ?? false
    day.closedAt = closeState?.closedAt
    return day as DailySummary
  })

  result.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1))
  return result
}

const dailyItems = computed(() => buildDaily(eventsFromApi.value))

const formatCurrency = (n: number) =>
  (Number(n || 0)).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatThaiDate = (dateKey: string) => {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(async () => {
  await fetchClosedMap()
  await fetchEvents()
})
</script>