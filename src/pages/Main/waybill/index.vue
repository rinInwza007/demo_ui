<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-gray-700">
      {{ label }}
    </label>

    <div class="relative group">
      <!-- icon -->
      <i
        class="ph ph-calendar-blank absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors pointer-events-none z-10"
      ></i>

      <VueDatePicker
        v-model="internalValue"
        range
        :enable-time-picker="false"
        :partial-range="false"
        :auto-apply="true"
        :clearable="true"
        format="dd/MM/yyyy"
        placeholder="เลือกช่วงวัน..."
        :text-input="true"
        :text-input-options="{ format: 'dd/MM/yyyy' }"
        :input-class="inputClass"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

type RangeValue = [Date, Date] | null

const props = defineProps<{
  modelValue: RangeValue
  label?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: RangeValue): void
}>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const inputClass =
  'glass-input pl-10 pr-4 py-2.5 rounded-xl w-full md:w-48 text-sm ' +
  'placeholder-slate-400 focus:placeholder-blue-300/50 ' +
  'focus:outline-none'
</script>

<style scoped>
/* ถ้ายังไม่มี glass-input ในโปรเจกต์ ให้ใส่ตัวอย่างนี้ได้ */
.glass-input {
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}
</style>
