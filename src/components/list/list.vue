<template>
  <div class="trezo-card-content mx-0">
    <div class="table-responsive overflow-x-auto">
      <table class="w-full table-fixed">
        <thead>
          <tr>
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
          <!-- แถวที่ 1 -->
          <tr class="border-b ">
            <td class="px-1 py-2 flex justify-center items-center">
              <span class="mt-3 w-3 h-3 rounded-full bg-green-400"></span>
            </td>
            <td class="px-1 py-2 text-center">กองคลัง</td>
            <td class="px-1 py-2 text-center">ค่าบริการผู้ป่วยนอก</td>
            <td class="px-1 py-2 text-center">2568</td>
            <td class="px-1 py-2 text-center">นางสาวพิมพ์ลดา</td>
            <td class="px-1 py-2 text-center">10:35 น.</td>
            <td class="px-1 py-2 text-center">เอกสาร</td>
            <td class="px-1 py-2 text-center">12,500 บาท</td>
            <td
                class="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md :ltr:first:pl-[25px] md :rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]"
              >
                <div class="flex items-center gap-[9px]">
                  <button
                    type="button"
                    class="text-primary-500 leading-none custom-tooltip"
                    v-tooltip="'View'"
                  >
                    <i class="material-symbols-outlined !text-md  text-blue-500">
                      visibility
                    </i>
                  </button>
                  <button
                    type="button"
                    class="text-gray-500 dark:text-gray-400 leading-none custom-tooltip"
                    v-tooltip="'Edit'"
                  >
                    <i class="material-symbols-outlined !text-md  "> edit </i>
                  </button>
                  <button
                    type="button"
                    class="text-danger-500 leading-none custom-tooltip"
                    v-tooltip="'Delete'"
                  >
                    <i class="material-symbols-outlined !text-md text-red-500"> delete </i>
                  </button>
                </div>
              </td>
          </tr>

          <!-- แถวที่ 2 -->
          <tr class="border-b">
            <td class="px-1 py-2 flex justify-center items-center">
              <span class="mt-3 w-3 h-3 rounded-full bg-yellow-400"></span>
            </td>
            <td class="px-1 py-2 text-center">โรงพยาบาล</td>
            <td class="px-1 py-2 text-center">เงินสนับสนุนโครงการแพทย์</td>
            <td class="px-1 py-2 text-center">2567</td>
            <td class="px-1 py-2 text-center">นายภัทรพล</td>
            <td class="px-1 py-2 text-center">14:20 น.</td>
            <td class="px-1 py-2 text-center">ไฟล์ PDF</td>
            <td class="px-1 py-2 text-center">35,000 บาท</td>
            <td
                class="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md :ltr:first:pl-[25px] md :rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]"
              >
                <div class="flex items-center gap-[9px]">
                  <button
                    type="button"
                    class="text-primary-500 leading-none custom-tooltip"
                    v-tooltip="'View'"
                  >
                    <i class="material-symbols-outlined !text-md text-blue-500">
                      visibility
                    </i>
                  </button>
                  <button
                    type="button"
                    class="text-gray-500 dark:text-gray-400 leading-none custom-tooltip"
                    v-tooltip="'Edit'"
                  >
                    <i class="material-symbols-outlined !text-md "> edit </i>
                  </button>
                  <button
                    type="button"
                    class="text-danger-500 leading-none custom-tooltip"
                    v-tooltip="'Delete'"
                  >
                    <i class="material-symbols-outlined !text-md text-red-500"> delete </i>
                  </button>
                </div>
              </td>
          </tr>

          <!-- แถวที่ 3 -->
          <tr class="border-b">
            <td class="px-1 py-2 flex justify-center items-center">
              <span class=" mt-3 w-3 h-3 rounded-full bg-red-500"></span>
            </td>
            <td class="px-1 py-2 text-center">กองแผนงาน</td>
            <td class="px-1 py-2 text-center">ค่าบริหารจัดการ</td>
            <td class="px-1 py-2 text-center">2566</td>
            <td class="px-1 py-2 text-center">นางสุชาดา</td>
            <td class="px-1 py-2 text-center">09:10 น.</td>
            <td class="px-1 py-2 text-center">เอกสาร (กระดาษ)</td>
            <td class="px-1 py-2 text-center">8,900 บาท</td>
            <td
                class="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md :ltr:first:pl-[25px] md :rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]"
              >
                <div class="flex items-center gap-[9px]">
                  <button
                    type="button"
                    class="text-primary-500 leading-none custom-tooltip"
                    v-tooltip="'View'"
                  >
                    <i class="material-symbols-outlined !text-md text-blue-500">
                      visibility
                    </i>
                  </button>
                  <button
                    type="button"
                    class="text-gray-500 dark:text-gray-400 leading-none custom-tooltip"
                    v-tooltip="'Edit'"
                  >
                    <i class="material-symbols-outlined !text-md "> edit </i>
                  </button>
                  <button
                    type="button"
                    class="text-danger-500 leading-none custom-tooltip"
                    v-tooltip="'Delete'"
                  >
                    <i class="material-symbols-outlined !text-md text-red-500"> delete </i>
                  </button>
                </div>
              </td>
          </tr>
          <tr class="border-b">
            <td class="px-1 py-2 flex justify-center items-center">
              <span class="mt-3 w-3 h-3 rounded-full bg-red-500"></span>
            </td>
            <td class="px-1 py-2 text-center">กองแผนงาน</td>
            <td class="px-1 py-2 text-center">ค่าบริหารจัดการ</td>
            <td class="px-1 py-2 text-center">2566</td>
            <td class="px-1 py-2 text-center">นางสุชาดา</td>
            <td class="px-1 py-2 text-center">09:10 น.</td>
            <td class="px-1 py-2 text-center">เอกสาร (กระดาษ)</td>
            <td class="px-1 py-2 text-center">8,900 บาท</td>
            <td
                class="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md :ltr:first:pl-[25px] md :rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]"
              >
                <div class="flex items-center gap-[9px]">
                  <button
                    type="button"
                    class="text-primary-500 leading-none custom-tooltip"
                    v-tooltip="'View'"
                  >
                    <i class="material-symbols-outlined !text-md text-blue-500">
                      visibility
                    </i>
                  </button>
                  <button
                    type="button"
                    class="text-gray-500 dark:text-gray-400 leading-none custom-tooltip"
                    v-tooltip="'Edit'"
                  >
                    <i class="material-symbols-outlined !text-md "> edit </i>
                  </button>
                  <button
                    type="button"
                    class="text-danger-500 leading-none custom-tooltip"
                    v-tooltip="'Delete'"
                  >
                    <i class="material-symbols-outlined !text-md text-red-500"> delete </i>
                  </button>
                </div>
              </td>
          </tr>

        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()

const items = ref([
  { id: 1, status: 'สำเร็จ' },
  { id: 2, status: 'รอตรวจสอบ' },
])



</script>
