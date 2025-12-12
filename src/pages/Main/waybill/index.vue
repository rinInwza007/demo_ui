<template>
  <div>
    <Navbar />
    <SecondNavbar />

    <div class="border border-gray-300 rounded-xl shadow m-6 bg-white">
      <!-- Header 3 Columns -->
      <div class="ml-12 mt-8 grid grid-cols-3 items-center">
        <div class="flex">
          <dropdrowwork />
        </div>
 
        
        <h1 class="text-4xl font-extrabold text-gray-900 mb-6 text-center">ใบนำส่งเงิน</h1>

        <div></div>
      </div>

      <!-- Filters Row -->
      <div class="flex flex-col gap-4 px-12 w-full md:flex-row md:items-end mt-12">
        <selectdatetime />

        <CascadingSelect
    v-model:main="selectedMain"
    v-model:sub1="selectedSub1"
    v-model:sub2="selectedSub2"
    :options="options"
    label="หน่วยงาน"
  />

        <search v-model="searchText" />

        <!-- Action Dropdown -->
        <div class="ml-auto">
          <dropdrow>
            <template #icon>
              <i class="material-symbols-outlined text-[22px]"></i>
            </template>

            <template #menu>
              <div
                v-for="btn in actions"
                :key="btn.key"
                class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
                @click="btn.handler"
              >
                <i class="material-symbols-outlined text-[20px]">
                  {{ btn.icon }}
                </i>
                <span class="text-sm">{{ btn.label }}</span>
              </div>
            </template>
          </dropdrow>
        </div>
      </div>

      <!-- Table List -->
      <div class="pt-10 px-6 mt-1 ">
        <TableBase :items="items">
      <template #actions="{ item }">
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
import {options} from "@/components/data/departments"


import ActionButtons from "@/components/Actionbutton/ActionButtons.vue"
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import search from '@/components/input/search.vue'
import TableBase from '@/components/list/listbase.vue'
import nextpage from '@/components/list/nextpage.vue'
import selectdatetime from '@/components/DateTime/selectdatetime.vue'
import goback from '@/components/Button/goback.vue'
import dropdrow from '@/components/dropdrow/dropdrow.vue'
import dropdrowwork from '@/components/dropdrow/dropdrowwork.vue'
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





const moneyTypeLabel: Record<string, string> = {
  cash: 'เงินสด',
  bank: 'เช็คธนาคาร',
  transfer: 'ฝากเข้าบัญชี',
  debtor: 'ลูกหนี้',
  other: 'อื่นๆ',
}

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

  return {
    // ไว้ใช้เวลา view / edit / delete
    id: r.projectCode,
    statusColorClass: 'text-red-600',
    org: r.mainAffiliationName || r.affiliationName || '-',  // ✅ ปรับให้ตรงกับ field จริง
    subOrg1: r.subAffiliationName || '-',  // ✅ เพิ่ม field
    project: r.fundName,

    // ปีงบ ฯ (ตอนนี้ fix 2568 เหมือนของเดิม)
    year: '2568',
    owner: r.fullName,
    time: '-',
    fileType: fileType,
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

        isLocked: r.isLocked ?? false,
      }))

    console.log('✅ Filtered + Added isLocked:', rawData.value)

  } catch (error) {
    console.error('❌ Error loading data:', error)
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error')
  }
}

const items = computed(() => {
  let filtered = [...rawData.value]

  // 🔍 filter จาก searchText (ค้นหาตามสังกัด / หน่วยงาน)

/* =================================
    🔥 COMPUTED: กรองข้อมูลตาม Filters
const items = computed(() => {
  let filtered = [...rawData.value]

  // (Search Filter)
  if (searchText.value.trim()) {
    const s = searchText.value.toLowerCase()
    filtered = filtered.filter(r =>
      r.projectCode?.toLowerCase().includes(s) ||
      r.fullName?.toLowerCase().includes(s) ||
      r.fundName?.toLowerCase().includes(s)
    )
  }

  // (Filter หน่วยงาน)
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

  return filtered.map(mapReceiptToRow)
})


/* =================================
    🛠️ ACTION FUNCTIONS


onMounted(loadData)

/* ===============================
   6) action ต่าง ๆ (ไว้เผื่อผูกกับปุ่มในอนาคต)
================================= */
const view = (item: any) => {
  router.push(`/pdfpage/${item.id}`)
}

const edit = (item: any) => {
  router.push(`/edit/${item.id}`)
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


const removeItem = async (item: any) => {
  const result = await Swal.fire({
    title: 'ต้องการลบ?',
    text: `${item.project}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ลบเลย',
    cancelButtonText: 'ยกเลิก',
  })

  if (!result.isConfirmed) return

  await axios.delete(`/deleteReceipt/${item.id}`)
  await loadData()

  Swal.fire('ลบแล้ว', '', 'success')
}
</script>

