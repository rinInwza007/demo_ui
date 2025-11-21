<template>
  <div class="trezo-card-content mx-0">
    <div class="table-responsive overflow-x-auto">
      <table class="w-full table-fixed">
        <thead>
          <tr >
            <th class="w-[90px] px-1 py-2 bg-primary-50 dark:bg-[#15203c]">สถานะ</th>
            <th class="w-[90px] px-1 py-2 bg-primary-50 dark:bg-[#15203c]">สังกัด</th>
            <th class="w-[90px] px-1 py-2 bg-primary-50 dark:bg-[#15203c]">รายได้/เงินโครงการ</th>
            <th class="w-[90px] px-1 py-2 bg-primary-50 dark:bg-[#15203c]">ปีงบประมาณ</th>
            <th class="w-[90px] px-1 py-2 bg-primary-50 dark:bg-[#15203c]">ผู้รับผิดชอบ</th>
            <th class="w-[90px] px-1 py-2 bg-primary-50 dark:bg-[#15203c]">เวลาที่ส่ง</th>
            <th class="w-[100px] px-1 py-2 bg-primary-50 dark:bg-[#15203c]">รูปแบบ</th>
            <th class="w-[110px] px-1 py-2 bg-primary-50 dark:bg-[#15203c]">ยอดเงิน</th>
            <th class="w-[110px] px-1 py-2 bg-primary-50 dark:bg-[#15203c]"></th>
          </tr>
        </thead>
        <tbody>
          <!-- ✅ วนแถวจาก items -->
          <tr
            v-for="item in items"
            :key="item.id"
            class="border border-gray-300"
          >
            <!-- จุดสถานะ -->
            <td class="px-1 py-2 text-center">
  <span
    class="material-symbols-outlined text-[24px]"
    :class="item.statusColorClass"
  >
radio_button_unchecked
  </span>
</td>
            <td class="px-1 py-2 text-center ">{{ item.org }}</td>
            <td class="px-1 py-2 text-center">{{ item.project }}</td>
            <td class="px-1 py-2 text-center">{{ item.year }}</td>
            <td class="px-1 py-2 text-center">{{ item.owner }}</td>
            <td class="px-1 py-2 text-center">{{ item.time }}</td>
            <td class="px-1 py-2 text-center">{{ item.fileType }}</td>
            <td class="px-1 py-2 text-center">{{ item.amount }}</td>

            <!-- ปุ่ม Action -->
            <td
              class="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] "
            >
              <div class="flex items-center gap-[12px]">

  <!-- ดูข้อมูล -->
  <button
    type="button"
    class="text-primary-500 group"
    v-tippy="'ดูข้อมูล'"
    @click="gotopdfpage"
  >
    <i
      class="material-symbols-outlined !text-md text-blue-500
             transition-all duration-300 ease-out
             group-hover:-translate-y-1 group-hover:scale-110
             group-hover:drop-shadow-md"
    >
      visibility
    </i>
  </button>

  <!-- แก้ไข -->
  <button
    type="button"
    class="text-gray-500 group"
    v-tippy="'แก้ไข'"
    @click="gottoedit()"
  >
    <i
      class="material-symbols-outlined !text-md text-indigo-500
             transition-all duration-300 ease-out
             group-hover:-translate-y-1 group-hover:scale-110
             group-hover:drop-shadow-md"
    >
      edit
    </i>
  </button>

  <!-- ล็อก -->
  <button
    type="button"
    class="leading-none group"
    v-tippy="item.isLocked ? 'ปลดล็อกรายการ' : 'ล็อกรายการ'"
    @click="toggleLock(item)"
  >
    <i
      class="material-symbols-outlined !text-md
             transition-all duration-300 ease-out
             group-hover:-translate-y-1 group-hover:scale-110
             group-hover:drop-shadow-md"
      :class="item.isLocked ? 'text-amber-600' : 'text-green-600'"
    >
      {{ item.isLocked ? 'lock' : 'lock_open_right' }}
    </i>
  </button>

  <!-- ลบ -->
  <button
    type="button"
    class="text-danger-500 leading-none group"
    v-tippy="'ลบรายการ'"
    @click="handleDelete(item)"
  >
    <i
      class="material-symbols-outlined !text-md text-red-500
             transition-all duration-300 ease-out
             group-hover:-translate-y-1 group-hover:scale-110
             group-hover:drop-shadow-md"
    >
      delete
    </i>
  </button>

</div>

            </td>
          </tr>

          <!-- ถ้าไม่มีข้อมูล -->
          <tr v-if="items.length === 0">
            <td colspan="9" class="text-center py-4 text-gray-400">
              ไม่มีข้อมูลใบนำส่ง
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const router = useRouter()


const items = ref([
  {
    id: 1,
    statusColorClass: "text-green-600",
    org: 'กองคลัง',
    project: 'ค่าบริการผู้ป่วยนอก',
    year: '2568',
    owner: 'นางสาวพิมพ์ลดา',
    time: '10:35 น.',
    fileType: 'เอกสาร',
    amount: '12,500 บาท',
    isLocked: true,
  },
  {
    id: 2,statusColorClass: "text-yellow-600",
    org: 'โรงพยาบาล',
    project: 'เงินสนับสนุนโครงการแพทย์',
    year: '2567',
    owner: 'นายภัทรพล',
    time: '14:20 น.',
    fileType: 'ไฟล์ PDF',
    amount: '35,000 บาท',
    isLocked: true,
  },
  {
    id: 3,
    statusColorClass: "text-red-600",
    org: 'กองแผนงาน',
    project: 'ค่าบริหารจัดการ',
    year: '2566',
    owner: 'นางสุชาดา',
    time: '09:10 น.',
    fileType: 'เอกสาร (กระดาษ)',
    amount: '8,900 บาท',
    isLocked: false,
  }
])

// ✅ ฟังก์ชันลบ พร้อม SweetAlert2
const handleDelete = async (item) => {
  const result = await Swal.fire({
    title: 'คุณแน่ใจหรือไม่?',
    text: `ต้องการลบรายการ "${item.project}" หรือไม่?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'ลบเลย',
    cancelButtonText: 'ยกเลิก'
  })

  if (!result.isConfirmed) return

  // ลบออกจาก list ในหน้า (ถ้ามี backend ก็ call API ตรงนี้เพิ่ม)
  items.value = items.value.filter((row) => row.id !== item.id)

  await Swal.fire({
    title: 'ลบแล้ว',
    text: 'ลบรายการเรียบร้อยแล้ว',
    icon: 'success'
  })
}
const gotopdfpage = ()=>{
  router.push('/pdfpage')
}

const gottoedit=()=> {
 router.push("/edit")
}

const toggleLock = (item) => {
  item.isLocked = !item.isLocked

  Swal.fire({
    position: 'top-end',
    icon: 'success',
    title: item.isLocked ? 'ล็อกรายการสำเร็จ' : 'ปลดล็อกรายการสำเร็จ',
    showConfirmButton: false,
    timer: 1500,
  })
}
</script>
