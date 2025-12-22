
<template>
  <!-- ⭐ ลบ <body> tag ออก - ใช้ div แทน -->
  <div class="text-slate-700 antialiased selection:bg-blue-200 selection:text-blue-900">

    <div id="app" class="relative w-full h-screen flex overflow-hidden">
      <!-- ⭐ ลบ overflow-hidden ออกจาก #app -->

        <!-- Background Elements -->
        <div class="mesh-bg"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>

        <!-- Sidebar (Mac Style) -->
        <sidebar />

        <!-- Main Content -->
        <main class="flex-1 flex flex-col relative z-10 min-h-0">

            <!-- Header Bar -->
            <header class="h-16 flex items-center justify-between px-8 pt-4 pb-2 flex-shrink-0">
                <div>
                    <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <i class="ph ph-files"></i>
                        ใบนำส่งลูกหนี้
                    </h1>
                    <p class="text-xs text-slate-800 mt-0.5">จัดการใบนำส่งลูกหนี้</p>
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
                    <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <div class="relative group">
                            <i class="ph ph-calendar-blank absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors"></i>
                            <input type="text" placeholder="เลือกช่วงวันเวลา..." class="glass-input pl-10 pr-4 py-2.5 rounded-xl w-full md:w-48 text-sm placeholder-slate-400 focus:placeholder-blue-300/50">
                        </div>

                        <CascadingSelect
  v-model:modelValueMain="selectedMain"
  v-model:modelValueSub1="selectedSub1"
  v-model:modelValueSub2="selectedSub2"
  :options="options"
/>

                    </div>

                    <!-- Right Search & Action -->
                    <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <div class="relative flex-1 md:w-64">
                            <i class="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                            <input v-model="searchText" type="text" placeholder="ค้นหา สังกัด / หน่วยงาน..." class="glass-input pl-10 pr-4 py-2.5 rounded-xl w-full text-sm">
                        </div>

                        <button @click="gotowaybilldebtor" class="glass-button-primary px-5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95">
                            <i class="ph ph-file-plus text-lg"></i>
                            <span>เพิ่มใบนำส่งลูกหนี้</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Data Table Area -->
            <div class="flex-1 px-8 pb-8 flex flex-col min-h-0">
                <div class="glass-panel rounded-2xl flex-1 flex flex-col shadow-lg min-h-0">


                    <div class="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/40 bg-white/20 text-xs font-semibold  uppercase tracking-wider flex-shrink-0">
                        <div class="col-span-1 text-center">สถานะ</div>
                        <div class="col-span-2 text-center ">สังกัด</div>
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
                                <div class="font-medium text-slate-800 text- ">{{ item.department }}</div>
                                <div class="text-[11px] text-slate-700 mt-0.5 flex items-center gap-1">
                                    <i class="ph ph-buildings text-xs"></i>
                                    <span class="truncate">{{ item.subDepartment }}</span>
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
                            <div class="col-span-1 text-center">
  <div class="text-xs font-medium text-slate-700 font-mono">
    {{ item.time }}
  </div>
</div>

                            <!-- Amount -->
                            <div class="col-span-1 text-right">
                                <div class="font-bold text-slate-800 font-mono text-sm">{{ formatCurrency(item.amount) }}</div>
                                <div class="text-[10px] text-slate-400">บาท</div>
                            </div>

                            <!-- Actions -->
                            <div class="col-span-2 flex justify-center">
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
                                />
                            </div>

                        </div>
                    </div>

                    <!-- Footer Pagination -->
                    <div class="px-6 py-3 border-t border-white/40 bg-white/10 flex items-center justify-between flex-shrink-0">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import { setupAxiosMock } from '@/fake/mockAxios'
import { options } from "@/components/data/departments"


import ActionButtons from '@/components/Actionbutton/ActionButtons.vue'
import sidebar from '@/components/bar/sidebar.vue'
import CascadingSelect from '@/components/input/select/CascadingSelect.vue'

setupAxiosMock()

const router = useRouter()

const searchText = ref('')
const rawData = ref<any[]>([])
const selectedMain = ref("")
const selectedSub1 = ref("")
const selectedSub2 = ref("")


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
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ]

  return `${day} ${monthNames[month - 1]} ${year} ${hours}:${minutes}`
}

const formatCurrency = (amount: number | string) => {
  const n = typeof amount === 'string'
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

const mapReceiptToRow = (r: any) => {
  const fileTypesArray: string[] = r.receiptList?.flatMap((item: any) => {
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

  return {
    id: r.projectCode,
    status: r.isLocked ? 'success' : 'pending',

    department: r.mainAffiliationName || r.affiliationName || '-',
    subDepartment: r.subAffiliationName || '-',
    time: formatThaiDateTime(displayDate),

    project: r.fundName,
    year: '2568',
    responsible: r.fullName,
    paymentType: "ลูกหนี้",

    amount: r.netTotalAmount ? Number(String(r.netTotalAmount).replace(/,/g, '')) : 0,
    createdAt: createdDate,
    updatedAt: updatedDate,
    isLocked: r.isLocked ?? false,
    _raw: r,
  }
}


const loadData = async () => {
  try {
    const res = await axios.get('/getReceipt')
    rawData.value = res.data
      .filter((r: any) => r.moneyTypeNote === 'Debtor')
      .map((r: any) => ({
        ...r,
        isLocked: r.isLocked ?? false,
      }))
  } catch (error) {
    console.error('❌ Error loading data:', error)
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error')
  }
}

const items = computed(() => {
  let filtered = [...rawData.value]

  // ✅ MAIN: ต้อง match คณะ
  if (selectedMain.value) {
    filtered = filtered.filter((r: any) => {
      const main = (r.mainAffiliationName || r.affiliationName || '').trim()
      return main === selectedMain.value.trim()
    })
  }

  // ✅ SUB1: ถ้าเลือกแล้ว ให้ match กับชื่อสังกัดย่อย (ระดับที่คุณเก็บไว้ใน r.subAffiliationName)
  if (selectedSub1.value) {
    filtered = filtered.filter((r: any) => {
      const sub1 = (r.subAffiliationName || '').trim()
      return sub1 === selectedSub1.value.trim()
    })
  }

  // ✅ SUB2: ถ้าคุณมี field สำหรับระดับย่อยจริง ให้เปลี่ยนชื่อ field ตรงนี้ให้ตรงกับ data
  if (selectedSub2.value) {
    filtered = filtered.filter((r: any) => {
      const sub2 = (r.subAffiliationName2 || r.sub2AffiliationName || '').trim()
      return sub2 === selectedSub2.value.trim()
    })
  }

  // ✅ Search (ยังใช้ร่วมกันได้)
  if (searchText.value.trim()) {
    const s = searchText.value.toLowerCase()
    filtered = filtered.filter((r: any) => {
      const main = (r.mainAffiliationName || r.affiliationName || '').toLowerCase()
      const sub1 = (r.subAffiliationName || '').toLowerCase()
      const sub2 = (r.subAffiliationName2 || r.sub2AffiliationName || '').toLowerCase()
      return main.includes(s) || sub1.includes(s) || sub2.includes(s)
    })
  }

  return filtered.map(mapReceiptToRow)
})


onMounted(loadData)

const view = (item: any) => router.push(`/pdfDebtor/${item.id}`)
const edit = (item: any) => router.push(`/waybilldebtor/edit/${item.id}`)
const gotowaybilldebtor = () => router.push("/waybilldebtor")

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
    /* ⭐ ลบ overflow: hidden; ออก */
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

</style>
