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
          v-model:sub="selectedSub"
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
      <div class="pt-10 px-6 mt-1">
        <TableBase :items="items">
          <template #actions="{ item }">
            <!-- ดูข้อมูล -->
            <button @click="view(item)" v-tippy="'ดูข้อมูล'">
              <i class="material-symbols-outlined text-blue-500">visibility</i>
            </button>

            <!-- แก้ไข -->
            <button @click="edit(item)" v-tippy="'แก้ไข'">
              <i class="material-symbols-outlined text-indigo-500">edit</i>
            </button>

            <!-- ล็อก -->
            <button @click="toggleLock(item)" v-tippy="'ล็อก/ปลดล็อก'">
              <i
                class="material-symbols-outlined"
                :class="item.isLocked ? 'text-amber-600' : 'text-green-600'"
              >
                {{ item.isLocked ? 'lock' : 'lock_open_right' }}
              </i>
            </button>

            <!-- ลบ -->
            <button @click="removeItem(item)" v-tippy="'ลบ'">
              <i class="material-symbols-outlined text-red-500">delete</i>
            </button>
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

const items = ref<any[]>([])
const searchText = ref('')
const category = ref('')

const selectedMain = ref('')
const selectedSub = ref('')

const options = {
  คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ: [
    'ศูนย์ศึกษาเศรษฐกิจพอเพียงและความอยู่รอดของมนุษยชาติ',
    'ศูนย์ฝึกอบรมวิชาชีพและบริการนานาชาติด้านเกษตรและอาหาร',
  ],
  คณะทันตแพทยศาสตร์: ['โรงพยาบาลทันตกรรมมหาวิทยาลัยพะเยา'],
  คณะพยาบาลศาสตร์: ['ศูนย์พัฒนาเด็กเล็ก'],
  คณะพลังงานและสิ่งแวดล้อม: [
    '1.ศูนย์วิจัยพลังงานทดแทนและสิ่งแวดล้อม',
    '1.1หน่วยปฏิบัติการทดสอบทางสิ่งแวดล้อม',
    '1.2 หน่วยรับรองการจัดการก๊าซเรือนกระจก',
  ],
  คณะแพทยศาสตร์: ['โรงพยาบาลมหาวิทยาลัยพะเยา'],
  คณะเภสัชศาสตร์: ['สถานปฏิบัติการเภสัชกรรมชุมชน'],
  คณะวิทยาศาสตร์: ['ศูนย์การเรียนรู้ความเป็นเลิศทางวิทยาศาสตร์และบริการวิชาการ'],
  คณะวิศวกรรมศาสตร์: ['ศูนย์วิจัยและบริการวิชาการวิศวกรรม', 'ศูนย์เทคโนโลยียานยนต์และขนส่ง'],
  คณะสถาปัตยกรรมศาสตร์และศิลปกรรมศาสตร์: ['ศูนย์บริการวิชาการงานสร้างสรรค์'],
  คณะศิลปศาสตร์: ['ศูนย์ภาษา'],
  คณะสหเวชศาสตร์: ['ศูนย์บริการสุขภาพสหเวชศาสตร์'],
  วิทยาลัยการจัดการ: [],
  กองทรัพย์สิน: ['งานบริหารพื้นที่', 'งานโรงแรมฟ้ามุ่ยและเอื้องคำ', 'งานร้านค้าสวัสดิการ'],
  โรงเรียนสาธิตมหาวิทยาลัยพะเยา: [],
  วิทยาเขตเชียงราย: [],
  สถาบันนวัตกรรมและถ่ายทอดเทคโนโลยี: [],
  สถาบันนวัตกรรมการเรียนรู้: [],
}

const mapReceiptToRow = (r: any) => {
  const fileTypesArray: string[] =
    r.receiptList?.flatMap(
      (item: any) =>
        (item.paymentDetails || []).map((p: any) => p.moneyType?.trim()).filter((t: string) => !!t), // กรองค่าที่ว่าง
    ) || []

  // เอา Set เพื่อเอาเฉพาะค่าที่ไม่ซ้ำ
  const uniqueFileTypes = Array.from(new Set(fileTypesArray))

  const fileType = uniqueFileTypes.length > 0 ? uniqueFileTypes.join(', ') : '-'
  return {
    id: r.projectCode,
    statusColorClass: 'text-red-600',
    org: r.affiliationName,
    project: r.fundName,
    year: '2568',
    owner: r.fullName,
    time: '-',
    fileType: fileType,
    amount: r.netTotalAmount
      ? Number(String(r.netTotalAmount).replace(/,/g, '')).toLocaleString('th-TH', {
          minimumFractionDigits: 2,
        }) + ' บาท'
      : '0.00 บาท',

    isLocked: false,
  }
}

/* =================================
    2) โหลดข้อมูลจาก Fake API
================================== */
const loadData = async () => {
  const res = await axios.get('/getReceipt')
  items.value = res.data.map(mapReceiptToRow)
}

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

const toggleLock = (item: any) => {
  item.isLocked = !item.isLocked
  Swal.fire({
    position: 'top-end',
    icon: 'success',
    title: item.isLocked ? 'ล็อกรายการสำเร็จ' : 'ปลดล็อกรายการสำเร็จ',
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
<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Sarabun:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap');

body,
* {
  font-family: 'Sarabun', 'sans-serif';
}
</style>
