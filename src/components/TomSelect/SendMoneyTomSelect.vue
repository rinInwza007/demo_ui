<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" class="text-sm font-medium text-gray-700">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <select
      ref="selectElement"
      :id="inputId"
      class=" transition-all duration-200"
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
  control.style.height = '2.50rem'
  control.style.width = '100%'
  control.style.padding = '0 0.5rem'
  control.style.display = 'flex'
  control.style.alignItems = 'center'
  control.style.borderRadius = '0.375rem'
  control.style.border = '1px solid #6b7280'
  control.style.fontSize = '0.875rem'

  const input = control.querySelector('input')
  if (input) {
    input.style.fontSize = '0.875rem'
    input.style.height = 'auto'
    input.style.padding = '0.25rem'
  }
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
    create: false,                 // ไม่สร้างตัวเลือกใหม่
    sortField: { field: 'text', direction: 'asc' },
    allowEmptyOption: false,       // ปิด option ว่าง
    placeholder: 'เลือกประเภท',    // ตัวนี้จะโชว์ก่อนเลือก
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
  tomSelectInstance.clear(true) // silent clear
  tomSelectInstance.setValue(value, false) // trigger onChange
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

<style scoped>
/* ถ้าต้องการ custom style เพิ่มเติม */
</style>