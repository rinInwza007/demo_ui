<template>
  <div class="tomselect-container">
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import TomSelect from 'tom-select'

const props = defineProps({
  modelValue: String,
  inputId: {
    type: String,
    required: true
  },
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
  }
})

const emit = defineEmits(['update:modelValue', 'input'])

const localValue = ref(props.modelValue)
let tomSelectInstance = null

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

    // Apply glass-input CSS styles
    const control = tomSelectInstance.control
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

    // Add focus styles
    control.addEventListener('focus', () => {
      control.style.outline = 'none'
      control.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.3)'
      control.style.borderColor = 'rgba(59, 130, 246, 0.3)'
    })

    control.addEventListener('blur', () => {
      control.style.boxShadow = ''
      control.style.borderColor = 'rgba(203, 213, 225, 0.5)'
    })

    // Add hover effect
    control.addEventListener('mouseenter', () => {
      control.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    })

    control.addEventListener('mouseleave', () => {
      if (document.activeElement !== control) {
        control.style.boxShadow = ''
      }
    })
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
/* Global styles for TomSelect dropdown */
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
