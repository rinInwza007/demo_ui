<template>
  <div class="flex flex-col gap-1">
    <!-- label -->
    <label
      v-if="label"
      class="text-sm font-medium text-gray-700 dark:text-gray-200"
    >
      {{ label }}
    </label>

    <div >
      <VueDatePicker
        v-model="internalValue"
        :range="{ partialRange: false }"
        :enable-time-picker="true"
        time-picker-inline
        :is-24="true"
        format="dd/MM/yyyy HH:mm"
        :clearable="true"
        :auto-apply="true"
        placeholder="เลือกช่วงวันและเวลา"
        :input-class="`
          h-[44px] w-full rounded-md border border-gray-1000 px-2 text-sm
          bg-white
          focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
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

// เก็บค่าภายในเป็น Date range ของ VueDatePicker
// รูปแบบ: [Date, Date] หรือ null
const internalValue = ref<[Date | null, Date | null] | null>(null)

// ---------- helper แปลง string <-> Date ----------

// format ที่จะส่งออกไปให้ parent: 'YYYY-MM-DD HH:mm'
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

// parse กลับจาก string 'YYYY-MM-DD HH:mm' -> Date
const parseDateTime = (s: string | null | undefined): Date | null => {
  if (!s) return null
  // รองรับทั้ง 'YYYY-MM-DD HH:mm' และ 'YYYY-MM-DDTHH:mm'
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

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return null
  }

  return new Date(year, month, day, hour, minute)
}

// ---------- sync จาก parent -> internal ----------

watch(
  () => props.modelValue,
  (val) => {
    if (val && Array.isArray(val)) {
      const [startStr, endStr] = val
      const start = parseDateTime(startStr)
      const end = parseDateTime(endStr)
      if (start || end) {
        internalValue.value = [start, end]
      } else {
        internalValue.value = null
      }
    } else {
      internalValue.value = null
    }
  },
  { immediate: true }
)

// ---------- sync จาก internal -> parent ----------

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
:deep(.dp__input) {
  width: 360px !important;
  height: 44px !important;
  border-color: gray ;
}
</style>
