<template>
  <div class="flex flex-col gap-1">
    <!-- ถ้าอยากมี label ส่ง prop label เข้ามา -->
    <label v-if="label" class="text-sm font-medium text-gray-700 dark:text-gray-200">
      {{ label }}
    </label>

    <div class="flex items-center gap-2">
      <!-- วันที่เริ่มต้น -->
      <input
        type="date"
        v-model="start"
        @change="onChange"
        class="h-10 w-40 rounded-md border border-gray-400 px-2 text-sm
               bg-white dark:bg-slate-900 dark:border-slate-600
               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-[44px] w-full md:w-[260px]"
      />

      <span class="text-gray-500">-</span>

      <!-- วันที่สิ้นสุด -->
      <input
        type="date"
        v-model="end"
        @change="onChange"
        class="h-10 w-40 rounded-md border border-gray-400 px-2 text-sm
               bg-white dark:bg-slate-900 dark:border-slate-600
               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-[44px] w-full md:w-[260px]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: [string, string] | null
  label?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: [string, string] | null): void
}>()

// เก็บค่าใน input เป็น string 'YYYY-MM-DD'
const start = ref('')
const end = ref('')

// sync จากค่าที่ส่งมาจาก parent
watch(
  () => props.modelValue,
  (val) => {
    if (val && Array.isArray(val)) {
      start.value = val[0] || ''
      end.value = val[1] || ''
    } else {
      start.value = ''
      end.value = ''
    }
  },
  { immediate: true }
)

const onChange = () => {
  if (!start.value && !end.value) {
    emit('update:modelValue', null)
  } else {
    emit('update:modelValue', [start.value || '', end.value || ''])
  }
}
</script>



