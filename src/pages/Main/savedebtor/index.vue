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
      </div>

      <!-- Table List -->
      <div class="pt-10 px-6 mt-1">
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

      <!-- Pagination + Back Button -->
      <div class="flex items-center justify-between mt-6 ml-5">
        <nextpage />
        <goback />
      </div>
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

import ActionButtons from "@/components/Actionbutton/ActionButtons.vue"
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import search from '@/components/input/search.vue'
import TableBase from '@/components/list/listbase.vue'
import nextpage from '@/components/list/nextpage.vue'
import selectdatetime from '@/components/DateTime/selectdatetime.vue'
import goback from '@/components/Button/goback.vue'
import dropdrowwork from '@/components/dropdrow/dropdrowwork.vue'
import CascadingSelect from '@/components/input/select/CascadingSelect.vue'
import Clearmodal from '@/components/modal/clearmodal.vue'

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
    // ใช้ชื่อจริงของคณะ ไม่ใช้ '-'
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
  // คำนวณยอดรวมจาก receiptList
  const totalDebt = receipts.reduce((sum, r) => {
    const receiptTotal = (r.receiptList || []).reduce((subSum: number, it: any) => {
      return subSum + (Number(it.amount) || 0)
    }, 0)
    return sum + receiptTotal
  }, 0)

  const itemCount = receipts.length

  // หา subAffiliationName ที่ไม่ซ้ำกัน
  const subOrgs = Array.from(
    new Set(
      receipts
        .map(r => r.subAffiliationName)
        .filter(name => name && name.trim())
    )
  )

  // หา fundName ที่ไม่ซ้ำกัน
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
    org: faculty, // ชื่อคณะ
    subOrg1: subOrgs.length > 0 ? subOrgs.join(', ') : `${itemCount} รายการ`, // แสดงหน่วยงานย่อยหรือจำนวนรายการ
    project: fundNames.length > 0 ? fundNames.join(', ') : '', // ใช้ fundName
    year: '2568',
    owner: receipts[0]?.fullName || '', // ชื่อผู้รับผิดชอบคนแรก
    time: '', // ไม่ใช้ '-'
    fileType: 'ลูกหนี้',
    amount: totalDebt.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
    }) + ' บาท',
  }
}

// โหลดข้อมูลจาก API
const loadData = async () => {
  try {
    const res = await axios.get('/getReceipt')

    // กรองเฉพาะประเภทลูกหนี้
    const debtorReceipts = res.data.filter((r: any) => r.moneyTypeNote === 'Debtor')

    rawData.value = debtorReceipts

    console.log('✅ Loaded Debtor Receipts:', rawData.value.length)

  } catch (error) {
    console.error('❌ Error loading data:', error)
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error')
  }
}

// Computed สำหรับกรองและจัดกลุ่มข้อมูล
const items = computed(() => {
  let filtered = [...rawData.value]

  // 1️⃣ Filter ตาม Search Text
  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(r =>
      r.mainAffiliationName?.toLowerCase().includes(search) ||
      r.affiliationName?.toLowerCase().includes(search) ||
      r.fullName?.toLowerCase().includes(search) ||
      r.fundName?.toLowerCase().includes(search)
    )
  }

  // 2️⃣ Filter ตาม หน่วยงานหลัก
  if (selectedMain.value) {
    filtered = filtered.filter(r =>
      r.mainAffiliationName === selectedMain.value ||
      r.affiliationName === selectedMain.value
    )
  }

  // 3️⃣ Filter ตาม หน่วยงานย่อย
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

  // จัดกลุ่มตามคณะ
  const grouped = groupByFaculty(filtered)

  // แปลงเป็น array สำหรับแสดงในตาราง
  const result: any[] = []
  grouped.forEach((receipts, faculty) => {
    result.push(mapFacultyToRow(faculty, receipts))
  })

  return result
})

onMounted(loadData)

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

const clearDebtor = (item: any) => {
  // ไปหน้าล้างลูกหนี้
  router.push(`/cleardebtor/${item.id}`)
}
</script>
