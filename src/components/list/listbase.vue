<template>
  <div class="trezo-card-content mx-0">
    <div class="table-responsive overflow-x-auto">
      <table class="w-full table-fixed">
        <thead>
          <tr>
            <th class="w-[90px] px-1 py-2 bg-primary-50">สถานะ</th>
            <th class="w-[90px] px-1 py-2 bg-primary-50">สังกัด</th>
            <th class="w-[90px] px-1 py-2 bg-primary-50">รายได้/เงินโครงการ</th>
            <th class="w-[90px] px-1 py-2 bg-primary-50">ปีงบประมาณ</th>
            <th class="w-[90px] px-1 py-2 bg-primary-50">ผู้รับผิดชอบ</th>
            <th class="w-[90px] px-1 py-2 bg-primary-50">เวลาที่ส่ง</th>
            <th class="w-[100px] px-1 py-2 bg-primary-50">รูปแบบ</th>
            <th class="w-[110px] px-1 py-2 bg-primary-50">ยอดเงิน</th>
            <th class="w-[110px] px-1 py-2 bg-primary-50"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in items" :key="item.id" class="border border-gray-300">

            <!-- สถานะ -->
            <td class="text-center py-2">
              <span
                class="material-symbols-outlined text-[24px]"
                :class="item.statusColorClass"
              >
                radio_button_unchecked
              </span>
            </td>

            <td class="text-center py-2">{{ item.org }}</td>
            <td class="text-center py-2">{{ item.project }}</td>
            <td class="text-center py-2">{{ item.year }}</td>
            <td class="text-center py-2">{{ item.owner }}</td>
            <td class="text-center py-2">{{ item.time }}</td>
            <td class="text-center py-2">{{ item.fileType }}</td>
            <td class="text-center py-2">{{ item.amount }}</td>

            <!-- Action Slot -->
            <td class="text-center py-2">
              <slot name="actions" :item="item" />
            </td>
          </tr>

          <tr v-if="items.length === 0">
            <td colspan="9" class="text-center py-4 text-gray-400">
              ไม่มีข้อมูล
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true }
})
</script>
