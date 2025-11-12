<!-- components/ListTable.vue -->
<template>
  <div class="trezo-card-content -mx-[20px] md:-mx-[25px]">
    <div class="table-responsive overflow-x-auto">
      <table class="w-full">
        <thead class="text-black dark:text-white">
          <tr>
            <!-- ลบคอลัมน์ checkbox ออก -->
            <th class="font-medium px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">สถานะ</th>
            <th class="font-medium px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">สังกัด</th>
            <th class="font-medium px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">รายได้/เงินโครงการ</th>
            <th class="font-medium px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">ปีงบประมาณ</th>
            <th class="font-medium px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">ผู้รับผิดชอบ</th>
            <th class="font-medium px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">เวลาที่ส่ง</th>
            <th class="font-medium px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">รูปแบบ</th>
            <th class="font-medium px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">ยอดเงิน</th>
          </tr>
        </thead>

        <tbody class="text-black dark:text-white">
          <!-- v-for แถวข้อมูล -->
          <tr
            v-for="item in items"
            :key="item.id"
            class="hover:bg-gray-50 dark:hover:bg-[#0b1320]"
          >
            <td class="whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
              <span class="text-gray-500 dark:text-gray-400">#{{ item.id }}</span>
            </td>

            <td class="whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
              <span class="block font-medium text-gray-500 dark:text-gray-400">{{ item.title }}</span>
            </td>

            <td class="whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
              {{ item.assignee }}
            </td>

            <td class="whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
              <span class="text-gray-500 dark:text-gray-400">{{ item.dueDate }}</span>
            </td>

            <td class="whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
              <span class="text-gray-500 dark:text-gray-400">{{ item.priority }}</span>
            </td>

            <td class="whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
              <span
                :class="['px-[8px] py-[3px] inline-block rounded-sm font-medium text-xs', statusClass(item.status)]"
              >
                {{ item.status }}
              </span>
            </td>

            <td class="whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
              <div class="flex items-center gap-[9px]">
                <button type="button" class="text-primary-500" @click="$emit('view', item)">
                  <i class="material-symbols-outlined !text-md">visibility</i>
                </button>
                <button type="button" class="text-gray-500 dark:text-gray-400" @click="$emit('edit', item)">
                  <i class="material-symbols-outlined !text-md">edit</i>
                </button>
                <button type="button" class="text-danger-500" @click="$emit('delete', item)">
                  <i class="material-symbols-outlined !text-md">delete</i>
                </button>
              </div>
            </td>
          </tr>

          <!-- ถ้าไม่มีข้อมูล -->
          <tr v-if="!items || items.length === 0">
            <td colspan="7" class="px-[20px] py-[20px] text-center text-gray-500 dark:text-gray-400">
              ไม่มีข้อมูล
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  items: { type: Array, default: () => [] }
})
const emit = defineEmits(['view', 'edit', 'delete'])

// helper: แปลงสถานะเป็น class (ปรับสีตามธีมของคุณ)
function statusClass(status) {
  if (!status) return 'bg-gray-100 text-gray-700 dark:bg-[#15203c] dark:text-gray-200'
  const s = String(status).toLowerCase()
  if (s.includes('finished') || s.includes('success')) return 'bg-success-50 text-success-500 dark:bg-[#15203c] dark:text-success-400'
  if (s.includes('pending')) return 'bg-warning-50 text-warning-500 dark:bg-[#15203c] dark:text-warning-400'
  if (s.includes('cancel')) return 'bg-danger-50 text-danger-500 dark:bg-[#15203c] dark:text-danger-400'
  return 'bg-primary-50 text-primary-500 dark:bg-[#15203c] dark:text-primary-400'
}
</script>

<style scoped>
/* ปรับแต่งเพิ่มเติมได้ที่นี่ */
</style>
