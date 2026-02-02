<template>
  <div class="relative group w-full" :class="{ 'opacity-70': isDisabled }">
    <!-- Left Icon -->
    <i
      v-if="icon"
      :class="[
        icon,
        'absolute left-3 top-1/2 -translate-y-1/2',
        isDisabled ? 'text-gray-400' : 'text-slate-400 group-hover:text-blue-500',
        'transition-colors'
      ]"
    ></i>

    <select
      class="glass-input w-full text-sm appearance-none
             py-2.5 rounded-xl pr-10 focus:outline-none
             transition-all px-2"
      :class="[
        icon ? 'pl-10' : 'pl-3',
        selectClasses
      ]"
      :value="modelValue"
      :disabled="isDisabled"
      @change="handleChange"
    >
      <!-- Placeholder: แสดงเฉพาะตอนยังไม่เลือก -->
      <option v-if="placeholder" value="" disabled hidden>
        {{ placeholder }}
      </option>

      <!-- Options -->
      <option
        v-for="(op, i) in normalizedOptions"
        :key="i"
        :value="op.value"
      >
        {{ op.label }}
      </option>
    </select>

    <!-- Caret -->
    <i
      class="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2
             pointer-events-none transition-colors"
      :class="isDisabled ? 'text-gray-400' : 'text-slate-400 group-hover:text-blue-500'"
    ></i>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

type Option = string | { label: string; value: string }

const props = defineProps<{
  modelValue: string
  options: Option[]
  placeholder?: string
  icon?: string
  disabled?: boolean  // ✅ เพิ่ม
  readonly?: boolean  // ✅ เพิ่ม
}>()

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void
}>()

// ✅ รวมเช็ค disabled หรือ readonly
const isDisabled = computed(() => props.disabled || props.readonly)

// ✅ Handle change
const handleChange = (event: Event) => {
  if (isDisabled.value) return
  
  const target = event.target as HTMLSelectElement
  emit("update:modelValue", target.value)
}

// ✅ Dynamic classes สำหรับ select
const selectClasses = computed(() => {
  if (isDisabled.value) {
    return 'bg-gray-100 text-gray-600 cursor-not-allowed pointer-events-none'
  }
  return 'text-slate-700 cursor-pointer hover:shadow-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30'
})

const normalizedOptions = computed(() => {
  const ops = props.options ?? []
  return ops.map((o) => {
    if (typeof o === "string") return { label: o, value: o }
    return { label: o.label, value: o.value }
  })
})
</script>

<style scoped>
/* ✅ เพิ่ม style สำหรับ disabled state */
select:disabled {
  background-color: #f3f4f6 !important;
  color: #6b7280 !important;
  cursor: not-allowed !important;
  opacity: 0.7;
}

select:disabled:hover {
  box-shadow: none !important;
}
</style>