<template>

  <div class="text-slate-700 antialiased selection:bg-blue-200 selection:text-blue-900">
    <div id="app" class="relative w-full flex h-screen overflow-hidden">
      <sidebar/>
      <!-- Background Effects -->
      <div class="mesh-bg"></div>
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>



      <main class="flex-1 flex flex-col relative z-10">
        <!-- Header -->
        <header class="h-16 flex items-center justify-between px-8 pt-4 pb-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
              ล้างลูกหนี้
            </h1>
            <p class="text-xs text-slate-800 mt-0.5">
              จัดการและติดตามรายการลูกหนี้
            </p>
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

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-8 pb-8">
          <div class="max-w-7xl mx-auto">
            <!-- Filters Section -->
            <div class="glass-panel rounded-2xl p-6 mb-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="w-1 h-6 bg-purple-500 rounded-full"></span>
                <h2 class="text-lg font-semibold text-gray-700">ตัวกรอง</h2>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">เลือกวันที่</label>
                  <selectdatetime />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">หน่วยงาน</label>
                  <CascadingSelect
                    v-model:main="selectedMain"
                    v-model:sub1="selectedSub1"
                    v-model:sub2="selectedSub2"
                    :options="options"
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-700">ค้นหา</label>
                  <search v-model="searchText" />
                </div>
              </div>
            </div>

            <!-- Table Section -->
            <div class="glass-panel rounded-2xl p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span class="w-1 h-6 bg-blue-500 rounded-full"></span>
                  <h2 class="text-lg font-semibold text-gray-700">รายการลูกหนี้</h2>
                </div>
                <span class="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {{ items.length }} รายการ
                </span>
              </div>

              <div class="overflow-x-auto">
                <TableBase :items="items">
                  <template #actions="{ item }">
                    <ActionButtons
                      :item="item"
                      :showEdit="true"
                      :show-view="true"
                      :showLock="true"
                      :showDelete="true"
                      :show-cleardedtor="true"
                      @edit="edit"
                      @lock="toggleLock"
                      @delete="removeItem"
                      @view="view"
                      @cleardebtor="cleardebtor"
                    />
                  </template>
                </TableBase>
              </div>

              <!-- Pagination -->
              <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <nextpage />
                <button
                  @click="goback"
                  class="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  กลับ
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
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import { setupAxiosMock } from '@/fake/mockAxios'
import { options } from "@/components/data/departments"
import sidebar from '@/components/bar/sidebar.vue'
import ActionButtons from "@/components/Actionbutton/ActionButtons.vue"
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import search from '@/components/input/search.vue'
import TableBase from '@/components/list/listbase.vue'
import nextpage from '@/components/list/nextpage.vue'
import selectdatetime from '@/components/DateTime/selectdatetime.vue'
import dropdrowwork from '@/components/dropdrow/dropdrowwork.vue'
import CascadingSelect from '@/components/input/select/CascadingSelect.vue'

setupAxiosMock()

const router = useRouter()

const searchText = ref('')
const rawData = ref<any[]>([])
const selectedMain = ref("")
const selectedSub1 = ref("")
const selectedSub2 = ref("")

// ฟังก์ชันจัดกลุ่มตามคณะ
const groupByFaculty = (receipts: any[]) => {
  const grouped = new Map<string, any[]>()

  receipts.forEach(receipt => {
    const faculty = receipt.mainAffiliationName || receipt.affiliationName || 'ไม่ระบุหน่วยงาน'

    if (!grouped.has(faculty)) {
      grouped.set(faculty, [])
    }
    grouped.get(faculty)!.push(receipt)
  })

  return grouped
}

// แปลงข้อมูลเป็น row สำหรับแสดงในตาราง
const mapFacultyToRow = (faculty: string, receipts: any[]) => {
  const totalDebt = receipts.reduce((sum, r) => {
    return sum + (Number(r.netTotalAmount) || 0)
  }, 0)

  const itemCount = receipts.length

  const subOrgs = Array.from(
    new Set(
      receipts
        .map(r => r.subAffiliationName)
        .filter(name => name && name.trim())
    )
  )

  const fundNames = Array.from(
    new Set(
      receipts
        .map(r => r.fundName)
        .filter(name => name && name.trim())
    )
  )

  return {
    id: encodeURIComponent(faculty),
    statusColorClass: 'text-red-600',
    org: faculty,
    subOrg1: subOrgs.length > 0 ? subOrgs.join(', ') : `${itemCount} รายการ`,
    project: fundNames.length > 0 ? fundNames.join(', ') : '',
    year: '2568',
    owner: receipts[0]?.fullName || '',
    time: '',
    fileType: 'ลูกหนี้',
    amount: totalDebt.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
    }) + ' บาท',
  }
}

// โหลดข้อมูลจาก API
const loadData = async () => {
  try {
    const stored = localStorage.getItem('fakeApi.receipts')

    if (!stored) {
      rawData.value = []
      console.log('⚠️ No data in localStorage')
      return
    }

    const allReceipts = JSON.parse(stored)

    if (!Array.isArray(allReceipts)) {
      rawData.value = []
      console.log('⚠️ Data is not array')
      return
    }

    const debtorReceipts = allReceipts.filter((r: any) => r.moneyTypeNote === 'Debtor')
    rawData.value = debtorReceipts

    console.log('✅ Loaded Debtor Receipts:', rawData.value.length)

  } catch (error) {
    console.error('❌ Error loading data:', error)
    rawData.value = []
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error')
  }
}

// Computed สำหรับกรองและจัดกลุ่มข้อมูล
const items = computed(() => {
  let filtered = [...rawData.value]

  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(r =>
      r.mainAffiliationName?.toLowerCase().includes(search) ||
      r.affiliationName?.toLowerCase().includes(search) ||
      r.fullName?.toLowerCase().includes(search) ||
      r.fundName?.toLowerCase().includes(search)
    )
  }

  if (selectedMain.value) {
    filtered = filtered.filter(r =>
      r.mainAffiliationName === selectedMain.value ||
      r.affiliationName === selectedMain.value
    )
  }

  if (selectedSub1.value) {
    filtered = filtered.filter(r =>
      r.subAffiliationName === selectedSub1.value
    )
  }

  if (selectedSub2.value) {
    filtered = filtered.filter(r =>
      r.subAffiliationName2 === selectedSub2.value
    )
  }

  const grouped = groupByFaculty(filtered)

  const result: any[] = []
  grouped.forEach((receipts, faculty) => {
    result.push(mapFacultyToRow(faculty, receipts))
  })

  return result
})

onMounted(() => {
  loadData()
  window.addEventListener('focus', loadData)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', loadData)
})

// Functions
const view = (item: any) => {
  router.push(`/pdfpage/${item.id}`)
}

const edit = (item: any) => {
  router.push(`/edit/${item.id}`)
}

const cleardebtor = (item: any) => {
  router.push(`cleardebtor`)
}

const toggleLock = (item: any) => {
  const target = rawData.value.find(r => r.projectCode === item.id)
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

const removeItem = (item: any) => {
  Swal.fire({
    title: 'ยืนยันการลบ?',
    text: "คุณต้องการลบรายการนี้ใช่หรือไม่",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#DC2626',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        icon: 'success',
        title: 'ลบสำเร็จ',
        showConfirmButton: false,
        timer: 1500
      })
    }
  })
}

const goback = () => {
  router.back()
}
</script>

<style scoped>
body {
  font-family: 'Prompt', 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}

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
