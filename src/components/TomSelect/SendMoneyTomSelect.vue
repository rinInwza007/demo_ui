<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" class="text-sm font-medium text-gray-700">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <select
      ref="selectElement"
      :id="inputId"
      class="transition-all duration-200"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.text }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import TomSelect from 'tom-select'
import 'tom-select/dist/css/tom-select.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  inputId: {
    type: String,
    default: 'sendmoney-select'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'เลือกประเภท'
  },
  required: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => [
      { value: 'รายได้', text: 'รายได้' },
      { value: 'เงินโครงการ', text: 'เงินโครงการ' }
    ]
  },
  createNewOption: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectElement = ref(null)
let tomSelectInstance = null

const applyCSSToTomSelect = (element) => {
  if (!element || !element.tomselect) return
  
  const control = element.tomselect.control
  
  // Apply inline styles to match glass-input class
  control.style.width = '100%'
  control.style.height = '2.70rem'
  control.style.padding = '0.625rem 0.5rem' // py-2.5 px-2
  control.style.paddingRight = '2.5rem' // pr-10
  control.style.display = 'flex'
  control.style.alignItems = 'center'
  control.style.fontSize = '0.875rem' // text-sm
  control.style.color = '#334155' // text-slate-700
  control.style.borderRadius = '0.75rem' // rounded-xl
  control.style.border = '1px solid rgba(203, 213, 225, 0.5)'
  control.style.background = '#F3F3F5'
  control.style.backdropFilter = 'blur(10px)'
  control.style.cursor = 'pointer'
  control.style.transition = 'all 0.2s'
  control.style.appearance = 'none'

  // Style the input inside
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

const initTomSelect = async () => {
  await nextTick()
  
  if (!selectElement.value) {
    console.error('Select element not found')
    return
  }

  if (selectElement.value.tomselect) {
    console.log('TomSelect already initialized')
    return
  }

  try {
    tomSelectInstance = new TomSelect(selectElement.value, {
      create: false,
      sortField: { field: 'text', direction: 'asc' },
      allowEmptyOption: false,
      placeholder: 'เลือกประเภท',
      maxItems: 1,
      onChange(value) {
        emit('update:modelValue', value)
        emit('change', value)
      }
    })

    // ตั้งค่าเริ่มต้นเป็นค่าว่าง (เพื่อให้ placeholder โชว์)
    tomSelectInstance.clear(true)

    applyCSSToTomSelect(selectElement.value)

    // Set initial value ถ้ามี
    if (props.modelValue) {
      await nextTick()
      setTomSelectValue(props.modelValue)
    }

    console.log('TomSelect initialized successfully')
  } catch (error) {
    console.error('Error initializing TomSelect:', error)
  }
}

const setTomSelectValue = (value) => {
  if (!tomSelectInstance) {
    console.error('TomSelect instance not found')
    return
  }

  if (!value) {
    tomSelectInstance.clear(true)
    return
  }

  // Clear และ set ค่าใหม่
  tomSelectInstance.clear(true)
  tomSelectInstance.setValue(value, false)
  tomSelectInstance.refreshOptions(false)

  console.log('TomSelect value set to:', tomSelectInstance.getValue())
}

// Watch for prop changes
watch(() => props.modelValue, async (newValue) => {
  console.log('modelValue changed to:', newValue)
  
  await nextTick()
  
  if (tomSelectInstance) {
    const currentValue = tomSelectInstance.getValue()
    if (currentValue !== newValue) {
      console.log('Syncing TomSelect value from', currentValue, 'to', newValue)
      setTomSelectValue(newValue)
    }
  }
})

onMounted(() => {
  initTomSelect()
})

onBeforeUnmount(() => {
  if (tomSelectInstance) {
    tomSelectInstance.destroy()
    tomSelectInstance = null
  }
})

// Expose methods ถ้าต้องการเรียกจากภายนอก
defineExpose({
  setValue: setTomSelectValue,
  getInstance: () => tomSelectInstance,
  reinit: initTomSelect
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