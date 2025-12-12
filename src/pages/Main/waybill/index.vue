<template>
  <body class="text-slate-700 antialiased selection:bg-blue-200 selection:text-blue-900">

    <div id="app" class="relative w-full h-screen flex overflow-hidden">

        <!-- Background Elements -->
        <div class="mesh-bg"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>

        <!-- Sidebar (Mac Style) -->
        <sidebar />

        <!-- Main Content -->
        <main class="flex-1 flex flex-col relative z-10 overflow-hidden">

            <!-- Header Bar -->
            <header class="h-16 flex items-center justify-between px-8 pt-4 pb-2">
                <div>
                    <h1 class="text-2xl font-bold text-slate-900 flex items-center 2 ">
                        <i class="ph ph-files "></i>
                        ใบนำส่งเงิน
                    </h1>
                    <p class="text-xs text-slate-800 mt-0.5  ">จัดการใบนำส่งเงินและใบนำส่งลูกหนี้</p>
                </div>
                <div class="flex items-center gap-3">
                    <button class="w-10 h-10 rounded-full glass-input flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm">
                        <i class="ph ph-bell text-xl"></i>
                        <span class="material-symbols-outlined">notifications</span>
                    </button>
                    <button class="w-10 h-10 rounded-full glass-input flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm">
                        <i class="ph ph-gear text-xl"></i>
                        <span class="material-symbols-outlined">settings</span>
                    </button>
                </div>
            </header>

            <!-- Filters Area -->
            <div class="px-8 py-4">
                <div class="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                    <!-- Left Filters -->
                    <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <div class="relative group">
                            <i class="ph ph-calendar-blank absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors"></i>
                            <input type="text" placeholder="เลือกช่วงวันเวลา..." class="glass-input pl-10 pr-4 py-2.5 rounded-xl w-full md:w-48 text-sm placeholder-slate-400 focus:placeholder-blue-300/50">
                        </div>

                        <div class="relative group">
                            <i class="ph ph-buildings absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors"></i>
                            <select class="glass-input pl-10 pr-8 py-2.5 rounded-xl w-full md:w-56 text-sm text-slate-600 appearance-none cursor-pointer">
                                <option>ทุกคณะ/หน่วยงาน</option>
                                <option>คณะสหเวชศาสตร์</option>
                                <option>กองทรัพย์สิน</option>
                            </select>
                            <i class="ph ph-caret-down absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                        </div>
                    </div>

                    <!-- Right Search & Action -->
                    <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <div class="relative flex-1 md:w-64">
                            <i class="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                            <input v-model="searchText" type="text" placeholder="ค้นหา สังกัด / หน่วยงาน..." class="glass-input pl-10 pr-4 py-2.5 rounded-xl w-full text-sm">
                        </div>

                        <button @click="gotowaybil" class="glass-button-primary  px-5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center  transition-all active:scale-95">
                            <i class="ph ph-plus-circle text-lg"></i>
                            <span class="material-symbols-outlined">add_circle</span>
                            <span>เพิ่มใบนำส่งเงิน</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Data Table Area -->
            <div class="flex-1 px-8 pb-8 overflow-hidden flex flex-col">
                <div class="glass-panel rounded-2xl flex-1 flex flex-col shadow-lg overflow-hidden">

                    <!-- Table Header -->
                    <div class="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/40 bg-white/20 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <div class="col-span-1 text-center">สถานะ</div>
                        <div class="col-span-2">สังกัด</div>
                        <div class="col-span-1">รายได้/โครงการ</div>
                        <div class="col-span-1 text-center">ปีงบฯ</div>
                        <div class="col-span-2">ผู้รับผิดชอบ</div>
                        <div class="col-span-1">รูปแบบ</div>
                        <div class="col-span-2 text-right">ยอดเงิน</div>
                        <div class="col-span-2 text-center">จัดการ</div>
                    </div>

                    <!-- Table Body (Scrollable) -->
                    <div class="overflow-y-auto flex-1 p-2">
                        <div v-for="(item, index) in items" :key="index"
                             class="group grid grid-cols-12 gap-4 px-4 py-4 mb-2 items-center rounded-xl hover:bg-white/50 transition-all duration-200 cursor-default border border-transparent hover:border-white/50 hover:shadow-sm">

                            <!-- Status -->
                            <div class="col-span-1 flex justify-center">
                                <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-white/50"
                                     :class="{
                                        'bg-red-100 text-red-500': item.status === 'cancel',
                                        'bg-yellow-100 text-yellow-600': item.status === 'pending',
                                        'bg-green-100 text-green-500': item.status === 'success'
                                     }">
                                    <i v-if="item.status === 'cancel'" class="ph-fill ph-x-circle text-lg"></i>
                                    <i v-if="item.status === 'pending'" class="ph-fill ph-clock text-lg"></i>
                                    <i v-if="item.status === 'success'" class="ph-fill ph-check-circle text-lg"></i>
                                </div>
                            </div>

                            <!-- Department -->
                            <div class="col-span-2">
                                <div class="font-medium text-slate-800 text-sm">{{ item.department }}</div>
                                <div class="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                    <i class="ph ph-calendar text-xs"></i> {{ item.date }}
                                </div>
                            </div>

                            <!-- Project -->
                            <div class="col-span-1">
                                <span class="bg-blue-50/50 text-blue-700 text-xs px-2.5 py-1 rounded-lg border border-blue-100 font-medium">
                                    {{ item.project }}
                                </span>
                            </div>

                            <!-- Year -->
                            <div class="col-span-1 text-center text-sm font-medium text-slate-600 font-mono">
                                {{ item.year }}
                            </div>

                            <!-- Responsible -->
                            <div class="col-span-2 flex items-center gap-2">
                                <div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 text-white flex items-center justify-center text-[10px] shadow-sm">
                                    {{ item.responsible.charAt(0) }}
                                </div>
                                <span class="text-sm text-slate-700 truncate">{{ item.responsible }}</span>
                            </div>

                            <!-- Payment Type -->
                            <div class="col-span-1">
                                <div class="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                    <i class="ph-fill text-slate-400"
                                       :class="item.paymentType === 'เงินสด' ? 'ph-money' : (item.paymentType === 'เช็คธนาคาร' ? 'ph-scroll' : 'ph-bank')"></i>
                                    {{ item.paymentType }}
                                </div>
                            </div>

                            <!-- Amount -->
                            <div class="col-span-2 text-right">
                                <div class="font-bold text-slate-800 font-mono text-sm">{{ formatCurrency(item.amount) }}</div>
                                <div class="text-[10px] text-slate-400">บาท</div>
                            </div>

                            <!-- Actions -->
                             <div class="col-span-1 text-right ml-16">
                            <ActionButtons
    :item="item"
    :showEdit="true"
    :show-view="true"
    :showLock="true"
    :showDelete="true"

    @edit="edit"
    @lock="toggleLock"
    @delete="removeItem"
    @view="view"
  /></div>

                        </div>
                    </div>

                    <!-- Footer Pagination -->
                    <div class="px-6 py-3 border-t border-white/40 bg-white/10 flex items-center justify-between">
                        <div class="text-xs text-slate-500">
                            แสดง 1-4 จากทั้งหมด 12 รายการ
                        </div>
                        <div class="flex items-center gap-1">
                            <button class="px-2 py-1 rounded-md text-slate-500 hover:bg-white/40 disabled:opacity-50 text-xs">Prev</button>
                            <button class="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs shadow-md shadow-blue-500/30 font-medium">1</button>
                            <button class="w-7 h-7 rounded-lg hover:bg-white/40 text-slate-600 text-xs transition-colors">2</button>
                            <button class="w-7 h-7 rounded-lg hover:bg-white/40 text-slate-600 text-xs transition-colors">3</button>
                            <button class="px-2 py-1 rounded-md text-slate-500 hover:bg-white/40 text-xs">Next</button>
                        </div>
                    </div>

                </div>
            </div>

        </main>
    </div>
</body>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import { setupAxiosMock } from '@/fake/mockAxios'

import ActionButtons from '@/components/Actionbutton/ActionButtons.vue'
import CascadingSelect from '@/components/input/select/CascadingSelect.vue'
import selectdatetime from '@/components/DateTime/selectdatetime.vue'
import sidebar from '@/components/bar/sidebar.vue'

setupAxiosMock()

const router = useRouter()




/* ===============================
   1) state หลัก (เหมือนหน้าเก่า)
================================= */
const searchText = ref('')           // ใช้กับช่องค้นหา (v-model)
const rawData = ref<any[]>([])
const selectedMain = ref('')
const selectedSub1 = ref('')
const selectedSub2 = ref('')

const dateRange = ref<[string, string] | null>(null)

const moneyTypeLabel: Record<string, string> = {
  cash: 'เงินสด',
  bank: 'เช็คธนาคาร',
  transfer: 'ฝากเข้าบัญชี',
  debtor: 'ลูกหนี้',
  other: 'อื่นๆ',
}

/* ===============================
   2) util functions
================================= */
// format วันที่แบบไทย
const formatThaiDateTime = (date: Date | null) => {
  if (!date || isNaN(date.getTime())) return '-'

  const day = date.getDate().toString().padStart(2, '0')
  const month = date.getMonth() + 1
  const year = date.getFullYear() + 543 // พ.ศ.
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  const monthNames = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ]

  return `${day} ${monthNames[month - 1]} ${year} ${hours}:${minutes} `
}

// ใช้กับคอลัมน์ "ยอดเงิน"
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

// เช็คว่ามีการแก้ไขไหม
const hasBeenEdited = (createdAt: Date | null, updatedAt: Date | null) => {
  if (!createdAt || !updatedAt) return false
  return Math.abs(updatedAt.getTime() - createdAt.getTime()) > 1000
}

/* ===============================
   3) map จาก rawData -> item ที่ UI ใช้
      ให้ field ตรงกับ template ใหม่
================================= */
const mapReceiptToRow = (r: any) => {
  const fileTypesArray: string[] =
    r.receiptList?.flatMap((item: any) => {
      const fromPaymentDetails = (item.paymentDetails || [])
        .map((p: any) => p.moneyType?.trim())
        .filter((t: string) => !!t)

      const fromReceiptItem = item.moneyType ? [item.moneyType.trim()] : []

      return [...fromPaymentDetails, ...fromReceiptItem]
    }) || []

  const uniqueFileTypes = Array.from(new Set(fileTypesArray))
  const fileType = uniqueFileTypes.length > 0
    ? uniqueFileTypes.map(t => moneyTypeLabel[t] || t).join(', ')
    : '-'

  const createdDate = r.createdAt ? new Date(r.createdAt) : null
  const updatedDate = r.updatedAt ? new Date(r.updatedAt) : null

  const isEdited = hasBeenEdited(createdDate, updatedDate)
  const displayDate = isEdited ? updatedDate : createdDate

  // 🟢 สำคัญ: map ให้ตรงกับ field ที่ template ใช้
  return {
    // ไว้ใช้เวลา view / edit / delete
    id: r.projectCode,

    // status เอาแบบง่าย ๆ จาก isLocked ก่อน (จะไปปรับ logic ทีหลังก็ได้)
    status: r.isLocked ? 'success' : 'pending', // 'cancel' ได้ในอนาคตถ้ามี field อื่น

    // Department
    department: r.mainAffiliationName || r.affiliationName || '-',

    // วันที่ (บรรทัดเล็กใต้สังกัด)
    date: formatThaiDateTime(displayDate),

    // รายได้/โครงการ
    project: r.fundName,

    // ปีงบ ฯ (ตอนนี้ fix 2568 เหมือนของเดิม)
    year: '2568',

    // ผู้รับผิดชอบ
    responsible: r.fullName,

    // รูปแบบการจ่ายเงิน (เงินสด / เช็ค / โอน ...)
    paymentType: fileType,

    // จำนวนเงิน (เก็บเป็น number แล้วค่อย format ตอนแสดง)
    amount: r.netTotalAmount
      ? Number(String(r.netTotalAmount).replace(/,/g, ''))
      : 0,

    // เก็บค่าบางอย่างเผื่อกดเข้าไปหน้ารายละเอียด
    createdAt: createdDate,
    updatedAt: updatedDate,
    isLocked: r.isLocked ?? false,
    _raw: r,
  }
}

/* ===============================
   4) โหลดข้อมูลจาก Fake API (เหมือนหน้าเก่า)
================================= */
const loadData = async () => {
  try {
    const res = await axios.get('/getReceipt')

    console.log('📦 Raw API Response:', res.data)

    rawData.value = res.data
      .filter((r: any) => r.moneyTypeNote === 'Waybill')
      .map((r: any) => ({
        ...r,
        createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
        isLocked: r.isLocked ?? false,
      }))

    console.log('✅ Filtered + Added isLocked + Dates:', rawData.value)
  } catch (error) {
    console.error('❌ Error loading data:', error)
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error')
  }
}

/* ===============================
   5) computed list: filter + map (core logic)
================================= */
const items = computed(() => {
  let filtered = [...rawData.value]

  // 🔍 filter จาก searchText (ค้นหาตามสังกัด / หน่วยงาน)
  if (searchText.value.trim()) {
    const s = searchText.value.toLowerCase()

    filtered = filtered.filter((r) => {
      const main = (r.mainAffiliationName || r.affiliationName || '').toLowerCase()
      const sub = (r.subAffiliationName || '').toLowerCase()
      const joinAff = `${main} - ${sub}`.toLowerCase()

      return (
        main.includes(s) ||
        sub.includes(s) ||
        joinAff.includes(s)
      )
    })
  }

  // ถ้าอนาคตจะมี select คณะ / หน่วยงานแบบ Cascading ก็ใช้ selectedMain / selectedSub1 ได้เหมือนหน้าเก่า

  // filter ช่วงวันที่ (ถ้าอยากผูกกับ input ก็แค่ v-model ให้ dateRange)
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const [startStr, endStr] = dateRange.value
    const start = new Date(startStr.replace(' ', 'T'))
    const end = new Date(endStr.replace(' ', 'T'))

    filtered = filtered.filter((r) => {
      const baseDate: Date | null = r.updatedAt || r.createdAt || null
      if (!baseDate || isNaN(baseDate.getTime())) return false
      return baseDate >= start && baseDate <= end
    })
  }

  // 🔁 สุดท้าย map ให้เป็น structure ที่ UI ใช้
  return filtered.map(mapReceiptToRow)
})

onMounted(loadData)

/* ===============================
   6) action ต่าง ๆ (ไว้เผื่อผูกกับปุ่มในอนาคต)
================================= */
const view = (item: any) => {
  router.push(`/pdfpage/${item.id}`)
}

const edit = (item: any) => {
  router.push(`/waybill/edit/${item.id}`)
}

const toggleLock = (row: any) => {
  const target = rawData.value.find(r => r.projectCode === row.id)
  if (!target) return

  target.isLocked = !target.isLocked

  Swal.fire({
    position: 'top-end',
    icon: 'success',
    title: target.isLocked ? 'ล็อกรายการสำเร็จ' : 'ปลดล็อกรายการสำเร็จ',
    showConfirmButton: false,
    timer: 1500,
  })
}

const gotowaybil = ()=> {
  router.push("/waybill")
}

const removeItem = async (item: any) => {
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
            overflow: hidden; /* Hide default scrollbar for the immersive feel */
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
                radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%),
                radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%),
                radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
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

        .orb-1 { width: 600px; height: 600px; background: #56CCF2; top: -100px; left: -100px; animation-delay: 0s; }
        .orb-2 { width: 500px; height: 500px; background: #AC32E4; bottom: -50px; right: -100px; animation-delay: 2s; }
        .orb-3 { width: 400px; height: 400px; background: #7918F2; top: 40%; left: 40%; animation-delay: 4s; }

        @keyframes float {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(20px, 40px) rotate(10deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
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
    background: linear-gradient(135deg, #A855F7 0%, #7E22CE 100%);
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
            background: rgba(0,0,0,0.1);
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(0,0,0,0.2);
        }

        /* Table Row Animation */
        .table-row-enter-active,
        .table-row-leave-active {
            transition: all 0.3s ease;
        }
        .table-row-enter-from,
        .table-row-leave-to {
            opacity: 0;
            transform: translateX(-20px);
        }
    </style>
