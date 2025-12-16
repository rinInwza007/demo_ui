<template>
  <div class="relative group w-full">
    <!-- Left Icon -->
    <i
      v-if="icon"
      :class="[
        icon,
        'absolute left-3 top-1/2 -translate-y-1/2',
        'text-slate-400 group-hover:text-blue-500 transition-colors'
      ]"
    ></i>

    <select
      class="glass-input w-full text-sm text-slate-700 appearance-none cursor-pointer
             py-2.5 rounded-xl pr-10 focus:outline-none
             focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
             hover:shadow-md transition-all"
      :class="icon ? 'pl-10' : 'pl-3'"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
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
             text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors"
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
}>()

defineEmits<{
  (e: "update:modelValue", v: string): void
}>()

const normalizedOptions = computed(() => {
  const ops = props.options ?? []
  return ops.map((o) => {
    if (typeof o === "string") return { label: o, value: o }
    return { label: o.label, value: o.value }
  })
})
</script>
