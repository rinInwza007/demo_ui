<template>
  <div class="relative w-full h-screen flex overflow-hidden text-[#1d1d1f]">
    <!-- Background -->
    <div class="macos-bg"></div>
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>

    <!-- Sidebar (ถ้าคุณมี Sidebar component อยู่แล้ว เปลี่ยนเป็น <Sidebar /> ได้เลย) -->
    <aside class="w-64 h-full flex flex-col glass-sidebar z-20 hidden md:flex shrink-0">
      <sidebar />
    </aside>

    <!-- Main -->
    <main class="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
      <!-- Header -->
      <header class="h-16 px-6 flex items-center justify-between shrink-0 glass-panel m-4 mb-2 rounded-xl z-20">
        <div class="flex items-center gap-4">
          <button class="md:hidden text-slate-500"><i class="ph ph-list text-2xl"></i></button>
          <h1 class="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <i class="ph ph-chart-pie-slice text-[#007aff]"></i> Dashboard
          </h1>
        </div>
        <div class="flex items-center gap-3">
          <div class="px-3 py-1 bg-white/40 rounded-lg text-sm font-medium text-slate-600 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live Data
          </div>
          <div class="h-6 w-px bg-slate-300 mx-1"></div>
          <button class="btn-apple px-4 py-1.5 rounded-lg text-sm font-medium">
            Export to excel
          </button>
        </div>
      </header>

      <!-- Content scroll -->
      <div class="flex-1 overflow-y-auto px-4 pb-8">

        <!-- Stat cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="glass-card p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div class="absolute right-[-10px] top-[-10px] w-24 h-24 bg-blue-400/20 rounded-full blur-2xl group-hover:bg-blue-400/30 transition-all"></div>
            <div class="flex justify-between items-start">
              <div>
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
                <h2 class="text-2xl font-bold text-slate-800 mt-1">฿4,250,900</h2>
              </div>
              <div class="p-2 bg-blue-100 rounded-lg text-blue-600"><i class="ph ph-currency-btc text-xl"></i></div>
            </div>
            <div class="flex items-center gap-1 text-xs font-medium text-green-600 mt-auto">
              <i class="ph ph-trend-up"></i> +12.5% <span class="text-slate-400 font-normal">from last month</span>
            </div>
          </div>

          <div class="glass-card p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div class="absolute right-[-10px] top-[-10px] w-24 h-24 bg-purple-400/20 rounded-full blur-2xl group-hover:bg-purple-400/30 transition-all"></div>
            <div class="flex justify-between items-start">
              <div>
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transactions</p>
                <h2 class="text-2xl font-bold text-slate-800 mt-1">1,482</h2>
              </div>
              <div class="p-2 bg-purple-100 rounded-lg text-purple-600"><i class="ph ph-receipt text-xl"></i></div>
            </div>
            <div class="flex items-center gap-1 text-xs font-medium text-green-600 mt-auto">
              <i class="ph ph-trend-up"></i> +5.2% <span class="text-slate-400 font-normal">new orders</span>
            </div>
          </div>

          <div class="glass-card p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div class="absolute right-[-10px] top-[-10px] w-24 h-24 bg-orange-400/20 rounded-full blur-2xl group-hover:bg-orange-400/30 transition-all"></div>
            <div class="flex justify-between items-start">
              <div>
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
                <h2 class="text-2xl font-bold text-slate-800 mt-1">฿125,000</h2>
              </div>
              <div class="p-2 bg-orange-100 rounded-lg text-orange-600"><i class="ph ph-clock text-xl"></i></div>
            </div>
            <div class="flex items-center gap-1 text-xs font-medium text-orange-600 mt-auto">
              <i class="ph ph-warning-circle"></i> 12 items <span class="text-slate-400 font-normal">need action</span>
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
            <a href="#" class="text-xs text-blue-600 hover:underline">View All</a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="text-xs text-slate-500 uppercase bg-white/20">
                <tr>
                  <th class="px-6 py-3">Transaction ID</th>
                  <th class="px-6 py-3">Department</th>
                  <th class="px-6 py-3">Date</th>
                  <th class="px-6 py-3 text-right">Amount</th>
                  <th class="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-white/20">
                <tr
                  v-for="item in recentItems"
                  :key="item.id"
                  class="hover:bg-white/30 transition-colors"
                >
                  <td class="px-6 py-4 font-medium text-slate-700">#{{ item.id }}</td>
                  <td class="px-6 py-4 flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {{ item.dept[0] }}
                    </div>
                    {{ item.dept }}
                  </td>
                  <td class="px-6 py-4 text-slate-500">{{ item.date }}</td>
                  <td class="px-6 py-4 text-right font-medium">฿{{ item.amount }}</td>
                  <td class="px-6 py-4 text-center">
                    <span
                      class="px-2 py-1 rounded-full text-[10px] font-semibold border"
                      :class="{
                        'bg-green-100 text-green-700 border-green-200': item.status === 'Completed',
                        'bg-yellow-100 text-yellow-700 border-yellow-200': item.status === 'Pending'
                      }"
                    >
                      {{ item.status }}
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
import { computed, ref } from 'vue'
import ChartCard from '@/components/Chart/ChartCard.vue'
import IncomeAreaChart from '@/components/Chart/IncomeAreaChart.vue'
import DepartmentDonutChart from '@/components/Chart/DepartmentDonutChart.vue'
import sidebar from '@/components/bar/sidebar.vue'

const selectedYear = ref<'2025' | '2024'>('2025')

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const incomeByYear: Record<string, number[]> = {
  '2025': [120000, 190000, 150000, 250000, 220000, 300000, 280000, 350000, 420000, 450000, 500000, 550000],
  '2024': [90000, 140000, 110000, 200000, 180000, 240000, 230000, 260000, 310000, 380000, 410000, 470000],
}

const incomeSeries = computed(() => incomeByYear[selectedYear.value])

const deptLabels = ['สหเวชศาสตร์', 'กองทรัพย์สิน', 'อื่นๆ']
const deptSeries = [45, 35, 20]

// legend สีให้ตรงกับธีมเดิม (ทำไว้ใน page เพื่อคุมได้ง่าย)
const deptLegend = [
  { label: 'สหเวชศาสตร์', value: 45, color: '#3b82f6' },
  { label: 'กองทรัพย์สิน', value: 35, color: '#8b5cf6' },
  { label: 'อื่นๆ', value: 20, color: '#f97316' },
]

const recentItems = ref([
  { id: 'TRX-9882', dept: 'คณะสหเวชศาสตร์', date: '15 Dec 2025', amount: '45,000.00', status: 'Completed' },
  { id: 'TRX-9881', dept: 'กองทรัพย์สิน', date: '14 Dec 2025', amount: '12,500.00', status: 'Pending' },
  { id: 'TRX-9880', dept: 'บัณฑิตวิทยาลัย', date: '14 Dec 2025', amount: '8,200.00', status: 'Completed' },
])
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
