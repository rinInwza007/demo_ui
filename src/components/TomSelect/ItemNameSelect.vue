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
        {{ option.label }}
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

import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'


import TomSelect from 'tom-select'
import {
  getReceivableOptionsByDepartment,
  getAllOptions,
  incomeOptions
} from '@/components/data/ItemNameOption'

const props = defineProps({
  modelValue: String,
  inputId: {
    type: String,
    required: true
  },
  department: {
    type: String,
    default: 'general'
  },
  waybillType: {
    type: String,
    default: 'all' // 'income', 'receivable', 'all'
=======
=======
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
=======
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'ระบุรายการ'
  },
  allowCreate: {
    type: Boolean,
    default: true
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
=======
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
=======
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
  }
})

const emit = defineEmits(['update:modelValue', 'input'])

const localValue = ref(props.modelValue)
let tomSelectInstance = null

// ✅ เพิ่ม computed สำหรับดึง options ตามประเภท
const itemOptions = computed(() => {
  if (props.waybillType === 'income') {
    return incomeOptions
  } else if (props.waybillType === 'receivable') {
    return getReceivableOptionsByDepartment(props.department)
  } else {
    return getAllOptions(props.department)
  }
=======
=======
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
=======
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
// ใช้ options ที่ส่งมา ถ้าไม่มีจะใช้ array ว่าง
const itemOptions = computed(() => {
  if (!props.options || props.options.length === 0) return []

  // รองรับหลายรูปแบบ: string, {value, label}, {id, name}
  return props.options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt }
    }
    return {
      value: opt.value || opt.name || opt.label,
      label: opt.label || opt.name || opt.value
    }
  })
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
=======
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
=======
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
})

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
      create: props.allowCreate,
      placeholder: props.placeholder,
      allowEmptyOption: true,
      onChange(value) {
        localValue.value = value
      }
    })

    const control = tomSelectInstance.control

    /* 🔑 สำคัญมาก */
    control.style.position = 'relative'

    control.style.width = '100%'
    control.style.height = '2.70rem'
    control.style.padding = '0.625rem 0.5rem'
    control.style.paddingRight = '2.5rem'
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
