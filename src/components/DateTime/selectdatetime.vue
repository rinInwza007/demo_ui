<template>
  <div class="flex flex-col gap-1">
    <!-- label -->
    <label v-if="label" class="text-sm font-medium text-gray-700 flex">
      {{ label }}
    </label>

    <!-- wrapper แบบเดียวกับ input ที่คุณส่ง -->
    <div class="relative group w-full md:w-48">
      <!-- icon ซ้าย -->
      <i
        class="ph ph-calendar-blank absolute left-3 top-1/2 -translate-y-1/2
               text-slate-400 group-hover:text-blue-500 transition-colors z-10"
      ></i>

      <VueDatePicker
        v-model="internalValue"
        :range="{ partialRange: false }"
        :enable-time-picker="true"
        time-picker-inline
        :is-24="true"
        format="dd/MM/yyyy HH:mm"
        :clearable="true"
        :auto-apply="true"
        placeholder="เลือกช่วงวันเวลา..."
        :input-class="`
          glass-input w-full text-sm text-slate-700
          pl-10 pr-4 py-2.5 rounded-xl
          placeholder-slate-400 focus:placeholder-blue-300/50
          appearance-none cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
          hover:shadow-md transition-all
        `"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'

const props = defineProps<{
  modelValue: [string, string] | null
  label?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: [string, string] | null): void
}>()

const internalValue = ref<[Date | null, Date | null] | null>(null)

const formatDateTime = (d: Date | null): string => {
  if (!d) return ''
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n)
  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hour = pad(d.getHours())
  const minute = pad(d.getMinutes())
  return `${year}-${month}-${day} ${hour}:${minute}`
}

const parseDateTime = (s: string | null | undefined): Date | null => {
  if (!s) return null
  const cleaned = s.replace('T', ' ')
  const [datePart, timePart] = cleaned.split(' ')
  if (!datePart) return null

  const [yearStr, monthStr, dayStr] = datePart.split('-')
  const [hourStr = '0', minuteStr = '0'] = (timePart || '').split(':')

  const year = Number(yearStr)
  const month = Number(monthStr) - 1
  const day = Number(dayStr)
  const hour = Number(hourStr)
  const minute = Number(minuteStr)

  if ([year, month, day, hour, minute].some(Number.isNaN)) return null
  return new Date(year, month, day, hour, minute)
}

watch(
  () => props.modelValue,
  (val) => {
    if (val && Array.isArray(val)) {
      const [startStr, endStr] = val
      const start = parseDateTime(startStr)
      const end = parseDateTime(endStr)
      internalValue.value = start || end ? [start, end] : null
    } else {
      internalValue.value = null
    }
  },
  { immediate: true }
)

watch(
  () => internalValue.value,
  (val) => {
    if (!val || (!val[0] && !val[1])) {
      emit('update:modelValue', null)
    } else {
      const [start, end] = val
      emit('update:modelValue', [formatDateTime(start), formatDateTime(end)])
    }
  }
)
</script>

<style scoped>
/* ให้ input ของ datepicker กว้างตาม wrapper และไม่ชนไอคอน */
:deep(.dp__input) {
  width: 100% !important;
  height: 44px !important;
}

/* กันปุ่ม/ไอคอนภายในของ datepicker ซ้อนกับ caret/พื้นที่ขวา */
:deep(.dp__input_wrap) {
  width: 100%;
}
</style>
