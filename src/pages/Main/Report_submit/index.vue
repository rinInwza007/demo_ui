<template>
  <div class="relative w-full h-screen flex overflow-hidden text-[#1d1d1f]">
    <!-- Background -->
    <div class="macos-bg"></div>
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>

    <!-- Sidebar -->
    <aside class="w-64 h-full flex flex-col z-20 hidden md:flex shrink-0">
      <sidebar />
    </aside>

    <!-- Main -->
    <main class="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
      <!-- Header -->
      <header class="h-16 px-6 flex items-center justify-between shrink-0 glass-panel m-4 mb-2 rounded-xl z-20">
        <div class="flex items-center gap-4">
          <button class="md:hidden text-slate-500">
            <i class="ph ph-list text-2xl"></i>
          </button>
          <h1 class="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <i class="ph ph-chart-pie-slice text-[#007aff]"></i> Dashboard
          </h1>
        </div>

        <div class="flex items-center gap-3">
          <div class="px-3 py-1 bg-white/40 rounded-lg text-sm font-medium text-slate-600 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span v-if="!loading && !error">Live Data</span>
            <span v-else-if="loading">Loading...</span>
            <span v-else class="text-red-600">Error</span>
          </div>

          <div class="h-6 w-px bg-slate-300 mx-1"></div>

          <button
            class="btn-apple px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="loading || !!error || tableRows.length === 0"
            @click="exportToExcel"
          >
            Export to excel
          </button>
        </div>
      </header>

      <!-- Content scroll -->
      <div class="flex-1 overflow-y-auto px-4 pb-8">
        <!-- Loading / Error banner -->
        <div v-if="loading" class="glass-panel rounded-xl p-4 mb-4 text-sm text-slate-700">
          กำลังโหลดข้อมูล...
        </div>
        <div v-else-if="error" class="glass-panel rounded-xl p-4 mb-4 text-sm text-red-600">
          {{ error }}
        </div>

        <!-- Stat cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="glass-card p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div class="absolute right-[-10px] top-[-10px] w-24 h-24 bg-blue-400/20 rounded-full blur-2xl group-hover:bg-blue-400/30 transition-all"></div>
            <div class="flex justify-between items-start">
              <div>
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
                <h2 class="text-2xl font-bold text-slate-800 mt-1">฿{{ formatInt(totalRevenue) }}</h2>
              </div>
              <div class="p-2 bg-blue-100 rounded-lg text-blue-600">
                <i class="ph ph-currency-btc text-xl"></i>
              </div>
            </div>
            <div class="flex items-center gap-1 text-xs font-medium text-slate-500 mt-auto">
              <i class="ph ph-info"></i>
              รวมยอดในปี {{ selectedYear }}
            </div>
          </div>

          <div class="glass-card p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div class="absolute right-[-10px] top-[-10px] w-24 h-24 bg-purple-400/20 rounded-full blur-2xl group-hover:bg-purple-400/30 transition-all"></div>
            <div class="flex justify-between items-start">
              <div>
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transactions</p>
                <h2 class="text-2xl font-bold text-slate-800 mt-1">{{ formatInt(transactionsCount) }}</h2>
              </div>
              <div class="p-2 bg-purple-100 rounded-lg text-purple-600">
                <i class="ph ph-receipt text-xl"></i>
              </div>
            </div>
            <div class="flex items-center gap-1 text-xs font-medium text-slate-500 mt-auto">
              <i class="ph ph-info"></i>
              จำนวนใบนำส่งในปี {{ selectedYear }}
            </div>
          </div>

          <div class="glass-card p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div class="absolute right-[-10px] top-[-10px] w-24 h-24 bg-orange-400/20 rounded-full blur-2xl group-hover:bg-orange-400/30 transition-all"></div>
            <div class="flex justify-between items-start">
              <div>
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
                <h2 class="text-2xl font-bold text-slate-800 mt-1">฿{{ formatInt(pendingAmount) }}</h2>
              </div>
              <div class="p-2 bg-orange-100 rounded-lg text-orange-600">
                <i class="ph ph-clock text-xl"></i>
              </div>
            </div>
            <div class="flex items-center gap-1 text-xs font-medium text-orange-600 mt-auto">
              <i class="ph ph-warning-circle"></i>
              {{ pendingCount }} items <span class="text-slate-400 font-normal">need action</span>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <!-- Big chart -->
          <ChartCard class="lg:col-span-2" title="Income Statistics">
            <template #actions>
              <select
                v-model="selectedYear"
                class="text-xs bg-white/50 border border-white/60 rounded-md px-2 py-1 text-slate-600 focus:outline-none"
              >
                <option value="2025">Year 2025</option>
                <option value="2024">Year 2024</option>
              </select>
            </template>

            <IncomeAreaChart :categories="months" :values="incomeSeries" />
          </ChartCard>

          <!-- Donut -->
          <ChartCard title="Department Share" class="flex flex-col">
            <div class="flex-1 flex items-center justify-center">
              <DepartmentDonutChart
                :labels="deptLabels"
                :series="deptSeries"
                :center-label="'Total'"
                :center-value="'100%'"
              />
            </div>

            <div class="mt-4 space-y-2">
              <div
                v-for="(row, i) in deptLegend"
                :key="i"
                class="flex items-center justify-between text-xs"
              >
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :style="{ background: row.color }"></span>
                  <span class="text-slate-600">{{ row.label }}</span>
                </div>
                <span class="font-medium">{{ row.value }}%</span>
              </div>
            </div>
          </ChartCard>
        </div>

        <!-- Table -->
        <div class="glass-card overflow-hidden">
          <div class="px-6 py-4 border-b border-white/20 flex items-center justify-between">
            <h3 class="font-semibold text-slate-800">Recent Transactions</h3>
            <button
              class="text-xs text-blue-600 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="loading"
              @click="load"
            >
              Refresh
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="text-xs text-slate-500 uppercase bg-white/20">
                <tr>
                  <th class="px-6 py-3">Project Code</th>
                  <th class="px-6 py-3">Affiliation</th>
                  <th class="px-6 py-3">Date</th>
                  <th class="px-6 py-3 text-right">Amount</th>
                  <th class="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-white/20">
                <tr v-if="!loading && tableRows.length === 0">
                  <td class="px-6 py-6 text-slate-500" colspan="5">
                    ไม่พบข้อมูลในปี {{ selectedYear }}
                  </td>
                </tr>

                <tr
                  v-for="row in tableRows"
                  :key="row.projectCode"
                  class="hover:bg-white/30 transition-colors"
                >
                  <td class="px-6 py-4 font-medium text-slate-700">#{{ row.projectCode }}</td>
                  <td class="px-6 py-4 flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {{ row.affLabel?.[0] || '?' }}
                    </div>
                    <div class="flex flex-col leading-tight">
                      <span class="text-slate-700">{{ row.affLabel }}</span>
                      <span v-if="row.affSub" class="text-xs text-slate-500">{{ row.affSub }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-slate-500">{{ row.dateText }}</td>
                  <td class="px-6 py-4 text-right font-medium">฿{{ row.amountText }}</td>
                  <td class="px-6 py-4 text-center">
                    <span
                      class="px-2 py-1 rounded-full text-[10px] font-semibold border"
                      :class="{
                        'bg-green-100 text-green-700 border-green-200': row.status === 'Completed',
                        'bg-yellow-100 text-yellow-700 border-yellow-200': row.status === 'Pending'
                      }"
                    >
                      {{ row.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'

import ChartCard from '@/components/Chart/ChartCard.vue'
import IncomeAreaChart from '@/components/Chart/IncomeAreaChart.vue'
import DepartmentDonutChart from '@/components/Chart/DepartmentDonutChart.vue'
import sidebar from '@/components/bar/sidebar.vue'

import type { Receipt } from '@/types/recipt'

/**
 * ✅ ดึงข้อมูลจาก API เดียวกันกับ mock ของคุณ:
 * GET /getReceipt?...
 */
async function fetchReceipts(params?: {
  q?: string
  affiliationId?: string
  fullName?: string
  projectCode?: string
}) {
  const res = await axios.get<Receipt[]>('/getReceipt', { params })
  return res.data
}

const selectedYear = ref<'2025' | '2024'>('2025')
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const receipts = ref<Receipt[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// ---------- Helpers (อิง type Receipt ของคุณ) ----------
function parseDateAny(v: any): Date | null {
  if (!v) return null
  const d = v instanceof Date ? v : new Date(v)
  return isNaN(d.getTime()) ? null : d
}

// ✅ ยอดเงินรวมของใบ: sum(receiptList.netAmount ?? subtotal ?? amount) - fee (ถ้ามี)
function getReceiptTotal(r: Receipt): number {
  if (!Array.isArray(r.receiptList)) return 0
  return r.receiptList.reduce((sum, it) => {
    const base =
      (typeof it.netAmount === 'number' ? it.netAmount : null) ??
      (typeof it.subtotal === 'number' ? it.subtotal : null) ??
      (typeof it.amount === 'number' ? it.amount : 0)

    const fee = typeof it.fee === 'number' ? it.fee : 0
    return sum + (Number(base) || 0) - fee
  }, 0)
}

function getStatus(r: Receipt): 'Completed' | 'Pending' {
  // คุณมี isLocked?: boolean -> ถ้าล็อกถือว่าเสร็จ
  return r.isLocked ? 'Completed' : 'Pending'
}

function getAffLabel(r: Receipt): string {
  return r.affiliationName || r.mainAffiliationName || 'อื่นๆ'
}

function getAffSub(r: Receipt): string {
  return r.subAffiliationName || ''
}

function formatMoney2(n: number) {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatInt(n: number) {
  return (Number(n) || 0).toLocaleString('th-TH')
}
function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ---------- Load ----------
async function load() {
  loading.value = true
  error.value = null
  try {
    receipts.value = await fetchReceipts()
  } catch (e: any) {
    error.value = e?.message ?? 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}
onMounted(load)

// ---------- Filter by selectedYear ----------
const filtered = computed(() => {
  const year = Number(selectedYear.value)
  return receipts.value.filter(r => {
    const d = parseDateAny(r.createdAt || r.updatedAt)
    return d ? d.getFullYear() === year : false
  })
})

// ---------- Stats ----------
const totalRevenue = computed(() => filtered.value.reduce((sum, r) => sum + getReceiptTotal(r), 0))
const transactionsCount = computed(() => filtered.value.length)
const pendingAmount = computed(() => filtered.value.reduce((sum, r) => sum + (getStatus(r) === 'Pending' ? getReceiptTotal(r) : 0), 0))
const pendingCount = computed(() => filtered.value.reduce((cnt, r) => cnt + (getStatus(r) === 'Pending' ? 1 : 0), 0))

// ---------- Area chart: monthly sum ----------
const incomeSeries = computed(() => {
  const buckets = Array.from({ length: 12 }, () => 0)

  for (const r of filtered.value) {
    const d = parseDateAny(r.createdAt || r.updatedAt)
    if (!d) continue
    buckets[d.getMonth()] += getReceiptTotal(r)
  }
  return buckets.map(v => Math.round(v))
})

// ---------- Donut: share by affiliation (top 6) ----------
const deptMap = computed(() => {
  const map = new Map<string, number>()
  for (const r of filtered.value) {
    const key = getAffLabel(r)
    map.set(key, (map.get(key) ?? 0) + getReceiptTotal(r))
  }
  return map
})

const deptSorted = computed(() => [...deptMap.value.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6))

const deptLabels = computed(() => deptSorted.value.map(([k]) => k))
const deptSeries = computed(() => {
  const total = deptSorted.value.reduce((s, [, v]) => s + v, 0) || 1
  return deptSorted.value.map(([, v]) => Math.round((v / total) * 100))
})

const palette = ['#3b82f6', '#8b5cf6', '#f97316', '#22c55e', '#ef4444', '#0ea5e9']
const deptLegend = computed(() => {
  return deptLabels.value.map((label, i) => ({
    label,
    value: deptSeries.value[i] ?? 0,
    color: palette[i % palette.length],
  }))
})

// ---------- Table rows (top 10 recent) ----------
const tableRows = computed(() => {
  return filtered.value
    .map(r => {
      const d = parseDateAny(r.createdAt || r.updatedAt)
      const total = getReceiptTotal(r)
      const status = getStatus(r)
      return {
        projectCode: r.projectCode,
        affLabel: getAffLabel(r),
        affSub: getAffSub(r),
        dateText: d ? formatDate(d) : '-',
        amountText: formatMoney2(total),
        status,
        _sort: d ? d.getTime() : 0,
      }
    })
    .sort((a, b) => b._sort - a._sort)
    .slice(0, 10)
})

// ---------- Export (CSV เปิดใน Excel ได้) ----------
function exportToExcel() {
  const header = ['Project Code', 'Affiliation', 'Sub Affiliation', 'Date', 'Amount', 'Status']

  // escape ตามมาตรฐาน CSV
  const csvEscape = (v) => {
    const s = String(v ?? '')
    // ถ้ามี ", newline, หรือ comma ให้ครอบด้วย "
    if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const rows = filtered.value.map(r => {
    const d = parseDateAny(r.createdAt || r.updatedAt)
    const total = getReceiptTotal(r)

    return [
      r.projectCode ?? '',
      getAffLabel(r) ?? '',
      getAffSub(r) ?? '',
      d ? formatDate(d) : '',
      // Excel บางเครื่องอ่านเลขเป็นข้อความง่ายกว่า: ใส่เป็น string
      total != null ? Number(total).toFixed(2) : '0.00',
      getStatus(r) ?? '',
    ]
  })

  const BOM = '\uFEFF'
  const lines = [
    'sep=,',
    [header, ...rows].map(cols => cols.map(csvEscape).join(',')).join('\n'),
  ]
  const csv = BOM + lines.join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `dashboard_${selectedYear.value}.csv`
  document.body.appendChild(a)   // กันบาง browser ไม่ยอมคลิกถ้าไม่ได้อยู่ใน DOM
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

</script>

<style>
/* Base / Background (ย้ายไป global ก็ได้) */
.macos-bg {
  position: fixed; inset: 0;
  background:
    radial-gradient(at 10% 10%, hsla(260, 40%, 20%, 1) 0, transparent 50%),
    radial-gradient(at 90% 0%, hsla(200, 50%, 30%, 1) 0, transparent 50%),
    radial-gradient(at 50% 90%, hsla(320, 50%, 25%, 1) 0, transparent 50%);
  background-size: 200% 200%;
  animation: gradient-animation 25s ease infinite;
  z-index: -2;
}

.orb { position: absolute; border-radius: 50%; filter: blur(90px); z-index: -1; opacity: .5; }
.orb-1 { width: 500px; height: 500px; background: #4facfe; top: 10%; left: 20%; animation: float 15s infinite alternate; }
.orb-2 { width: 400px; height: 400px; background: #f093fb; bottom: 10%; right: 10%; animation: float 18s infinite alternate-reverse; }

@keyframes float { from { transform: translate(0,0); } to { transform: translate(40px,-40px); } }
@keyframes gradient-animation { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

/* Glass */
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
}
.glass-card {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.glass-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}
.glass-sidebar {
  background: rgba(245, 245, 247, 0.6);
  backdrop-filter: blur(30px) saturate(180%);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}
.btn-apple {
  background: #007aff;
  color: white;
  border: none;
  box-shadow: 0 2px 5px rgba(0, 122, 255, 0.25);
  transition: all 0.2s ease;
}
.btn-apple:hover { background: #006ce6; transform: translateY(-1px); }
</style>
