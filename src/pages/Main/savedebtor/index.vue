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

        <h1 class="text-4xl font-extrabold text-gray-900 mb-6 text-center">ล้างลูกหนี้</h1>

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
    :show-cleardedtor="true"

    @edit="edit"
    @lock="toggleLock"
    @delete="removeItem"
    @view="view"
    @cleardebtor="clear"
  />
</template>
    </TableBase>
      </div>

      <!-- Pagination + Back Button -->
      <div class="flex items-center justify-between mt-6 ml-5">
        <nextpage />
        <goback />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import { setupAxiosMock } from '@/fake/mockAxios'
import {options} from "@/components/data/departments"


import ActionButtons from "@/components/Actionbutton/ActionButtons.vue"
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import Select from '@/components/input/select/select.vue'
import search from '@/components/input/search.vue'
import TableBase from '@/components/list/listbase.vue'
import nextpage from '@/components/list/nextpage.vue'
import selectdatetime from '@/components/DateTime/selectdatetime.vue'
import goback from '@/components/Button/goback.vue'
import dropdrow from '@/components/dropdrow/dropdrow.vue'
import dropdrowwork from '@/components/dropdrow/dropdrowwork.vue'
import CascadingSelect from '@/components/input/select/CascadingSelect.vue'

setupAxiosMock()

const router = useRouter()

const searchText = ref('')
const category = ref('')
const rawData = ref<any[]>([])
const selectedMain = ref("");
const selectedSub1 = ref("");
const selectedSub2 = ref("");





const moneyTypeLabel: Record<string, string> = {
  cash: 'เงินสด',
  bank: 'เช็คธนาคาร',
  transfer: 'ฝากเข้าบัญชี',
  debtor: 'ลูกหนี้',
  other: 'อื่นๆ',
};
const formatThaiDateTime = (date: Date | null) => {
  if (!date || isNaN(date.getTime())) return '-'
  
  const day = date.getDate().toString().padStart(2, '0')
  const month = date.getMonth() + 1
  const year = date.getFullYear() + 543 // แปลงเป็น พ.ศ.
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  const monthNames = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ]
  
  return `${day} ${monthNames[month - 1]} ${year} ${hours}:${minutes} `
}

// ✅ ฟังก์ชันตรวจสอบว่ามีการแก้ไขหรือไม่
const hasBeenEdited = (createdAt: Date | null, updatedAt: Date | null) => {
  if (!createdAt || !updatedAt) return false
  
  // เปรียบเทียบเวลา (ถ้าต่างกันมากกว่า 1 วินาที = มีการแก้ไข)
  return Math.abs(updatedAt.getTime() - createdAt.getTime()) > 1000
}
const mapReceiptToRow = (r: any) => {
  const createdDate = r.createdAt ? new Date(r.createdAt) : null
  const updatedDate = r.updatedAt ? new Date(r.updatedAt) : null

  // ✅ ตรวจสอบว่ามีการแก้ไขหรือไม่
  const isEdited = hasBeenEdited(createdDate, updatedDate)

  // ✅ เลือกแสดงวันที่ตามเงื่อนไข
  const displayDate = isEdited ? updatedDate : createdDate

  return {
    id: r.mainAffiliationName || r.affiliationName || 'อื่นๆ', // ใช้ main เป็น id ก็ได้
    statusColorClass: 'text-red-600',
    org: r.mainAffiliationName || r.affiliationName || '-',
    subOrg1: r.subAffiliationName || '-',
    project: r.fundName || '-', // อันนี้ถ้า merge แล้วไม่มี project ก็ใส่ '-' ก็ได้
    year: '2568',
    owner: r.fullName || '-', // ถ้า merge หลายคน จะเอาใครก็ต้องเลือกหรือ concat
    time: `${formatThaiDateTime(displayDate)} `,  // ✅ แสดงวันที่ + ป้ายกำกับ
    createdAt: formatThaiDateTime(createdDate),  // ✅ เก็บไว้ใช้ตอนดูรายละเอียด
    updatedAt: formatThaiDateTime(updatedDate),  // ✅ เก็บไว้ใช้ตอนดูรายละเอียด
    fileType: 'ลูกหนี้',
    amount: Number(r.netTotalAmount || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
    }) + ' บาท',
    isLocked: r.isLocked ?? false,
  }
}


/* =================================
    2) โหลดข้อมูลจาก Fake API
================================== */
const loadData = async () => {
  try {
    const res = await axios.get('/getReceipt')

    console.log('📦 Raw API Response:', res.data)

    // 1) กรองเฉพาะ type = 'Debtor'
    rawData.value = res.data
      .filter((r: any) => r.moneyTypeNote === 'Debtor')
      .map((r: any) => ({
        ...r,

        // 🔥 เพิ่มสถานะล็อกให้ทุกรายการ
        isLocked: r.isLocked ?? false,
      }))

    console.log('✅ Filtered + Added isLocked:', rawData.value)

  } catch (error) {
    console.error('❌ Error loading data:', error)
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error')
  }
}
/* =================================
    🔥 COMPUTED: กรองข้อมูลตาม Filters
================================== */
const items = computed(() => {
  let filtered = [...rawData.value]

  // (Search Filter)
  if (searchText.value.trim()) {
    const s = searchText.value.toLowerCase()
    filtered = filtered.filter((r) => {
      const main = (r.mainAffiliationName || r.affiliationName || '').toLowerCase()
      const sub = (r.subAffiliationName || '').toLowerCase()
      const joinAff = `${main} - ${sub}`.toLowerCase()
      return main.includes(s) || sub.includes(s) || joinAff.includes(s)
    })
  }

  // (Filter หน่วยงานจาก CascadingSelect)
  if (selectedMain.value) {
    filtered = filtered.filter((r) =>
      r.mainAffiliationName === selectedMain.value || r.affiliationName === selectedMain.value
    )
  }
  if (selectedSub1.value) {
    filtered = filtered.filter((r) =>
      r.subAffiliationName === selectedSub1.value
    )
  }

  // 🔥 Group by mainAffiliationName และ sum netTotalAmount
  const groupedMap: Record<string, any> = {}
  filtered.forEach(r => {
    const key = r.mainAffiliationName || r.affiliationName || 'อื่นๆ'
    if (!groupedMap[key]) {
      groupedMap[key] = {
        ...r,
        netTotalAmount: Number(r.netTotalAmount || 0)
      }
    } else {
      groupedMap[key].netTotalAmount += Number(r.netTotalAmount || 0)
    }
  })

  return Object.values(groupedMap).map(mapReceiptToRow)
})


onMounted(loadData)

/* =================================
    3) ACTION FUNCTIONS
================================== */
const view = (item: any) => {
  router.push(`/pdfpage/${item.id}`)
}

const edit = (item: any) => {
  router.push(`/edit/${item.id}`)
}

const clear = (item: any) => {
  router.push(`/cleardebtor`)
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

