<template>
  <div class="trezo-card-content mx-0">
    <div class="table-responsive overflow-x-auto">
      <table class="w-full table-fixed">
        <thead>
          <tr class="border-b">
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
            class="border"
          >
            <!-- จุดสถานะ -->
            <td class="px-1 py-2 flex justify-center items-center">
              <span
                class="mt-3 w-3 h-3 rounded-full"
                :class="item.statusDotClass"
              ></span>
            </td>

            <td class="px-1 py-2 text-center">{{ item.org }}</td>
            <td class="px-1 py-2 text-center">{{ item.project }}</td>
            <td class="px-1 py-2 text-center">{{ item.year }}</td>
            <td class="px-1 py-2 text-center">{{ item.owner }}</td>
            <td class="px-1 py-2 text-center">{{ item.time }}</td>
            <td class="px-1 py-2 text-center">{{ item.fileType }}</td>
            <td class="px-1 py-2 text-center">{{ item.amount }}</td>

            <!-- ปุ่ม Action -->
            <td
              class="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]"
            >
              <div class="flex items-center gap-[9px]">
                <button
  type="button"
  class="text-primary-500"
  v-tippy="'ดูข้อมูล'"
>
  <i class="material-symbols-outlined !text-md text-blue-500">
    visibility
  </i>
</button>

                <button
  type="button"
  class="text-gray-500"
  v-tippy="'แก้ไข'"
>
  <i class="material-symbols-outlined !text-md">
    edit
  </i>
</button>
 <button
      type="button"
      class="text-gray-500 leading-none"
      v-tippy="item.isLocked ? 'ปลดล็อกรายการ' : 'ล็อกรายการ'"
      @click="toggleLock(item)"
    >
      <i class="material-symbols-outlined !text-md">
        {{ item.isLocked ? 'lock' : 'lock_open_right' }}
      </i>
    </button>

                <!-- ✅ ปุ่มลบ: ผูก SweetAlert2 -->
                <button
  type="button"
  class="text-danger-500 leading-none"
  v-tippy="'ลบรายการ'"
  @click="handleDelete(item)"
>
  <i class="material-symbols-outlined !text-md text-red-500">
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

// ✅ ข้อมูลตัวอย่าง (เอาไปแทนที่ด้วยข้อมูลจาก API ภายหลังได้)
const items = ref([
  {
    id: 1,
    statusDotClass: 'bg-green-400',
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
    id: 2,
    statusDotClass: 'bg-yellow-400',
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
    statusDotClass: 'bg-red-500',
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
