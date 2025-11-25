<template>
  <div class="keyword-select-wrapper">
    <input
      :ref="setInputRef"
      :id="inputId"
      v-model="localValue"
      type="text"
      :placeholder="placeholder"
      class="keyword-input"
      @input="handleInput"
    />
    <span v-if="error" class="text-red-600 text-xs">
      {{ error }}
    </span>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import TomSelect from 'tom-select'
import 'tom-select/dist/css/tom-select.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  inputId: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'keyword',
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'input'])

const localValue = ref(props.modelValue)
const inputRef = ref(null)
let tomSelectInstance = null

const setInputRef = (el) => {
  inputRef.value = el
}

const handleInput = () => {
  emit('update:modelValue', localValue.value)
  emit('input', localValue.value)
}

const initTomSelect = async () => {
  await nextTick()

  if (!inputRef.value || inputRef.value.tomselect) return

  try {
    tomSelectInstance = new TomSelect(inputRef.value, {
      create: true,
      sortField: { field: 'text', direction: 'asc' },
      allowEmptyOption: true,
      placeholder: props.placeholder,
      maxItems: null,
      plugins: ['remove_button'],
            createOnBlur: true, // สร้าง item เมื่อ blur จาก input
      hideSelected: true, // ซ่อน item ที่เลือกแล้วใน dropdown
      onInitialize: function () {
        // ถ้าค่าเริ่มต้นเป็น empty string ให้ clear
        if (this.getValue() === '') {
          this.clear()
        }
      },
      onChange(value) {
        localValue.value = value
        emit('update:modelValue', value)
        emit('input', value)
      },
    })

    // จัด style ให้ Tom Select
    if (tomSelectInstance.control) {
      const control = tomSelectInstance.control
      control.style.padding = '0.25rem 0.5rem'
      control.style.display = 'flex'
      control.style.flexWrap = 'wrap'
      control.style.alignItems = 'flex-start'
      control.style.gap = '0.15rem'
      control.style.borderRadius = '0.375rem'
      control.style.border = '1px solid #6b7280'
      control.style.fontSize = '1rem'
      control.style.backgroundColor = '#ffffff'

      const input = control.querySelector('input')
      if (input) {
        input.style.fontSize = '1rem'
        input.style.minWidth = '50px'
        input.style.flex = 'none'
        input.style.padding = '0.25rem'
      }
    }

    // ตั้งค่าเริ่มต้นถ้ามีค่า
    if (props.modelValue) {
      tomSelectInstance.setValue(props.modelValue)
    }
  } catch (error) {
    console.error('Error initializing TomSelect:', error)
  }
}

const destroyTomSelect = () => {
  if (tomSelectInstance) {
    tomSelectInstance.destroy()
    tomSelectInstance = null
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (tomSelectInstance && newVal !== tomSelectInstance.getValue()) {
      tomSelectInstance.setValue(newVal || '')
    }
    localValue.value = newVal
  },
)

onMounted(() => {
  initTomSelect()
})

onBeforeUnmount(() => {
  destroyTomSelect()
})

defineExpose({
  initTomSelect,
  destroyTomSelect,
  tomSelectInstance: () => tomSelectInstance,
})
</script>

<style scoped>
.keyword-select-wrapper {

  width: 100%;
}

.keyword-input {
  margin-bottom: 0.5rem;
  margin-right: 0.75rem;
}

/* Override Tom Select styles */
:deep(.ts-wrapper) {
    
  width: 100% !important;
}

:deep(.ts-control) {
  border: 1px solid #6b7280 !important;
  width: 100%;
  
  border-radius: 0.375rem !important;
  padding: 0.19rem 0.5rem !important;
  display: flex !important;
  flex-wrap: wrap !important;
  align-items: flex-start !important;
  gap: 0.15rem !important;
  background-color: #ffffff !important;
  font-size: medium;
  min-height: 2.5rem !important;
}

:deep(.ts-control input) {
  flex: none !important;
  min-width: 50px !important;
  width: 100px !important;
  padding: 0.25rem !important;
  text-align: center;
}

:deep(.ts-control .item) {
    
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 2px 8px;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

:deep(.ts-control .remove) {
  border-left: 1px solid #d1d5db;
  padding-left: 4px;
  margin-left: 4px;
  text-decoration: none;
  color: #6b7280;
margin-top: 0.5rem;
}

:deep(.ts-control .remove:hover) {
  color: #ef4444;
}
</style>
