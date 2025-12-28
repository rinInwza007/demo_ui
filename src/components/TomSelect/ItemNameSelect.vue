<template>
  <div class="tomselect-container relative">
    <select
      :id="inputId"
      v-model="localValue"
      class="w-full px-2 text-sm"
    >
      <option value=""></option>
      <option 
        v-for="option in itemOptions" 
        :key="option.value" 
        :value="option.value"
      >
        {{ option.value }}
      </option>
    </select>

    <!-- 🔥 slot สำหรับไอคอนในช่อง -->
    <div
      class="absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-auto"
    >
      <slot name="suffix" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import TomSelect from 'tom-select'
import { itemOptions } from '@/components/data/ItemNameOption'

const props = defineProps({
  modelValue: String,
  inputId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'input'])

const localValue = ref(props.modelValue)
let tomSelectInstance = null

watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
  if (tomSelectInstance && tomSelectInstance.getValue() !== newVal) {
    tomSelectInstance.setValue(newVal || '', true)
  }
})

watch(localValue, (newVal) => {
  emit('update:modelValue', newVal)
  emit('input', newVal)
})

onMounted(() => {
  const el = document.getElementById(props.inputId)

  if (el && !el.tomselect) {
    tomSelectInstance = new TomSelect(el, {
      create: true,
      placeholder: 'ระบุรายการ',
      allowEmptyOption: true,
      onChange(value) {
        localValue.value = value
      }
    })

    const control = tomSelectInstance.control

    /* 🔑 สำคัญมาก */
    control.style.position = 'relative'

    control.style.width = '100%'
    control.style.height = '2.7rem'
    control.style.padding = '0.625rem 0.5rem'
    control.style.paddingRight = '2.5rem' // เผื่อที่ให้ไอคอน
    control.style.display = 'flex'
    control.style.alignItems = 'center'
    control.style.fontSize = '0.875rem'
    control.style.color = '#334155'
    control.style.borderRadius = '0.75rem'
    control.style.border = '1px solid rgba(203, 213, 225, 0.5)'
    control.style.background = 'rgba(255, 255, 255, 0.9)'
    control.style.backdropFilter = 'blur(10px)'
    control.style.cursor = 'pointer'
    control.style.transition = 'all 0.2s'
    control.style.appearance = 'none'

    const input = control.querySelector('input')
    if (input) {
      input.style.fontSize = '0.875rem'
      input.style.height = 'auto'
      input.style.padding = '0.25rem'
      input.style.color = '#334155'
    }
  }
})

onBeforeUnmount(() => {
  if (tomSelectInstance) {
    tomSelectInstance.destroy()
    tomSelectInstance = null
  }
})
</script>

<style>
.ts-dropdown {
  @apply rounded-xl shadow-lg border border-gray-200;
}

.ts-dropdown .option {
  @apply text-sm text-slate-700 py-2 px-3 cursor-pointer transition-colors;
}

.ts-dropdown .option:hover,
.ts-dropdown .option.active {
  @apply bg-blue-50;
}
</style>