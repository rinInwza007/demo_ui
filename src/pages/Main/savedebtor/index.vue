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
              ล้างลูกหนี้
            </h1>
            <p class="text-xs text-slate-800 mt-0.5">จัดการล้างลูกหนี้ทั้งหมด {{ items.length }} รายการ</p>
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

        <!-- Filters -->
        <div class="px-8 py-4 flex-shrink-0">
          <div class="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <CascadingSelect
                v-model:modelValueMain="selectedMain"
                v-model:modelValueSub1="selectedSub1"
                v-model:modelValueSub2="selectedSub2"
                :options="options"
              />
            </div>

            <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div class="relative flex-1 md:w-64">
                <i class="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                <input v-model="searchText" type="text" placeholder="ค้นหา รายการลูกหนี้..." class="glass-input pl-10 pr-4 py-2.5 rounded-xl w-full text-sm">
              </div>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="flex-1 px-8 pb-8 flex flex-col min-h-0">
          <div class="glass-panel rounded-2xl flex-1 flex flex-col shadow-lg min-h-0">
            <div class="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/40 bg-white/20 text-xs font-semibold uppercase tracking-wider flex-shrink-0">
              <div class="col-span-2 text-center">สถานะ</div>
              <div class="col-span-2 text-center">รายการลูกหนี้</div>
              <div class="col-span-2 text-center">หน่วยงาน</div>
              <div class="col-span-2 text-center">ยอดลูกหนี้</div>
              <div class="col-span-2 text-center">ยอดชำระแล้ว</div>
              <div class="col-span-2 text-center">จัดการ</div>
            </div>

            <div class="overflow-y-auto overflow-x-hidden flex-1 p-2 min-h-0">
              <div v-if="items.length === 0" class="text-center py-12 text-slate-500">
                <i class="ph ph-folder-open text-6xl mb-4 opacity-30"></i>
                <p>ไม่พบรายการลูกหนี้</p>
              </div>

              <div v-for="(item, index) in items" :key="index"
                   class="group grid grid-cols-12 gap-4 px-4 py-4 mb-2 items-center rounded-xl hover:bg-white/50 transition-all duration-200 cursor-default border border-transparent hover:border-white/50 hover:shadow-sm">

                <!-- Status -->
                <div class="col-span-2 flex justify-center">
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

                <!-- Item Name -->
                <div class="col-span-2">
                  <div class="font-medium text-slate-800 text-sm">{{ item.itemName }}</div>
                  <div class="text-[11px] text-slate-700 mt-0.5 flex items-center gap-1">
                    <i class="ph ph-note text-xs"></i>
                    <span class="truncate">{{ item.note || '-' }}</span>
                  </div>
                </div>

                <!-- Department -->
                <div class="col-span-2">
                  <div class="font-medium text-slate-800 text-sm">{{ item.department }}</div>
                  <div class="text-[11px] text-slate-700 mt-0.5 flex items-center gap-1">
                    <i class="ph ph-buildings text-xs"></i>
                    <span class="truncate">{{ item.subDepartment }}</span>
                  </div>
                </div>

                <!-- Debtor Amount -->
                <div class="col-span-2 text-center">
                  <div class="font-bold text-red-600 font-mono text-sm">{{ formatCurrency(item.debtorAmount) }}</div>
                  <div class="text-[10px] text-slate-400">บาท</div>
                </div>

                <!-- Paid Amount -->
                <div class="col-span-2 text-center">
                  <div class="font-bold text-green-600 font-mono text-sm">{{ formatCurrency(item.depositNetAmount) }}</div>
                  <div class="text-[10px] text-slate-400">บาท</div>
                </div>

                <!-- Actions -->
                <div class="col-span-2 flex justify-center">
                  <ActionButtons
                    :item="item"
                    :show-cleardedtor="true"
                    @cleardebtor="cleardebtor"
                  />
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-3 border-t border-white/40 bg-white/10 flex items-center justify-between flex-shrink-0">
              <div class="text-xs text-slate-500">
                แสดงทั้งหมด {{ items.length }} รายการ
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
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import { setupAxiosMock } from '@/fake/mockAxios'
import { options } from "@/components/data/departments"
import sidebar from '@/components/bar/sidebar.vue'
import ActionButtons from "@/components/Actionbutton/ActionButtons.vue"
import CascadingSelect from '@/components/input/select/CascadingSelect.vue'

setupAxiosMock()

const router = useRouter()

const searchText = ref('')
const rawData = ref<any[]>([])
const selectedMain = ref("")
const selectedSub1 = ref("")
const selectedSub2 = ref("")

// ✅ ฟังก์ชันแปลงข้อมูลจาก Receipt → รายการลูกหนี้แต่ละตัว
const mapReceiptToDebtorItems = (receipt: any) => {
  const items: any[] = []

  if (!Array.isArray(receipt.receiptList)) return items

  receipt.receiptList.forEach((item: any, idx: number) => {
    items.push({
      // ✅ สร้าง unique ID
      id: `${receipt.projectCode}-item-${idx}`,
      receiptId: receipt.projectCode,

      // ✅ ข้อมูลรายการลูกหนี้
      itemName: item.itemName || '-',
      note: item.note || '',

      // ✅ ยอดเงิน
      debtorAmount: Number(item.debtorAmount || 0),
      depositNetAmount: Number(item.depositNetAmount || 0),
      fee: Number(item.fee || 0),

      // ✅ ข้อมูลหน่วยงาน
      department: receipt.mainAffiliationName || 'ไม่ระบุ',
      subDepartment: receipt.subAffiliationName1 || '-',
      fundName: receipt.fundName || '-',

      // ✅ ข้อมูลผู้บันทึก
      responsible: receipt.fullName || '-',
      phone: receipt.phone || '-',

      // ✅ สถานะ
      status: 'pending',

      // ✅ เก็บข้อมูลต้นทางไว้ใช้
      _originalReceipt: receipt,
      _originalItem: item,
    })
  })

  return items
}

// ✅ โหลดข้อมูลจาก localStorage
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

    // ✅ กรองเฉพาะ Debtor
    const debtorReceipts = allReceipts.filter((r: any) => r.moneyTypeNote === 'Debtor')

    // ✅ แปลงเป็นรายการลูกหนี้
    const allDebtorItems = debtorReceipts.flatMap(mapReceiptToDebtorItems)

    rawData.value = allDebtorItems

    console.log('✅ Loaded Debtor Items:', rawData.value.length)

  } catch (error) {
    console.error('❌ Error loading data:', error)
    rawData.value = []
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error')
  }
}

// ✅ Computed สำหรับกรองข้อมูล
const items = computed(() => {
  let filtered = [...rawData.value]

  // กรองตามคำค้นหา
  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.itemName?.toLowerCase().includes(search) ||
      item.note?.toLowerCase().includes(search) ||
      item.department?.toLowerCase().includes(search) ||
      item.subDepartment?.toLowerCase().includes(search)
    )
  }

  // กรองตามหน่วยงานหลัก
  if (selectedMain.value) {
    filtered = filtered.filter(item => item.department === selectedMain.value)
  }

  // กรองตามหน่วยงานรอง
  if (selectedSub1.value) {
    filtered = filtered.filter(item => item.subDepartment === selectedSub1.value)
  }

  // กรองตามหน่วยงานย่อย (ถ้ามี)
  if (selectedSub2.value) {
    filtered = filtered.filter(item =>
      item._originalReceipt?.subAffiliationName2 === selectedSub2.value
    )
  }

  return filtered
})

// ✅ Format เงิน
const formatCurrency = (amount: number | string) => {
  const n = typeof amount === 'string'
    ? Number(amount.toString().replace(/[^0-9.-]/g, ''))
    : amount || 0

  return n.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ✅ ไปหน้าล้างลูกหนี้
const cleardebtor = (item: any) => {
  router.push(`/cleardebtor/${item.receiptId}`)
}

onMounted(() => {
  loadData()
  window.addEventListener('focus', loadData)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', loadData)
})
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
