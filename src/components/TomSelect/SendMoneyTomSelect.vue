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
      <option value="" disabled hidden>
        {{ placeholder }}
      </option>

      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
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
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectElement = ref(null)
let tomSelectInstance = null

const applyCSSToTomSelect = (element) => {
  if (!element?.tomselect) return

  const control = element.tomselect.control

  control.style.width = '100%'
  control.style.height = '2.75rem'
  control.style.padding = '0.625rem 0.75rem'
  control.style.fontSize = '0.875rem'
  control.style.color = '#334155'
  control.style.borderRadius = '0.75rem'
  control.style.border = '1px solid rgba(203,213,225,.6)'
  control.style.background = '#F3F3F5'
  control.style.cursor = 'pointer'
  control.style.transition = 'all .2s'

  control.addEventListener('focus', () => {
    control.style.boxShadow = '0 0 0 2px rgba(59,130,246,.35)'
    control.style.borderColor = 'rgba(59,130,246,.5)'
  })

  control.addEventListener('blur', () => {
    control.style.boxShadow = ''
    control.style.borderColor = 'rgba(203,213,225,.6)'
  })
}

const initTomSelect = async () => {
  await nextTick()

  if (!selectElement.value || selectElement.value.tomselect) return

  tomSelectInstance = new TomSelect(selectElement.value, {
    maxItems: 1,
    create: false,
    allowEmptyOption: true,
    placeholder: props.placeholder,

    // ⭐ สำคัญมาก แก้ dropdown โดนบัง
    dropdownParent: 'body',

    onChange(value) {
      emit('update:modelValue', value)
      emit('change', value)
    }
  })

  tomSelectInstance.clear(true)
  applyCSSToTomSelect(selectElement.value)

  if (props.modelValue) {
    tomSelectInstance.setValue(props.modelValue, false)
  }
}
const handleScroll = () => {
  if (tomSelectInstance && tomSelectInstance.isOpen) {
    tomSelectInstance.positionDropdown()
  }
}

onMounted(() => {
  initTomSelect()
  window.addEventListener('scroll', handleScroll, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll, true)
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (!tomSelectInstance) return
    const current = tomSelectInstance.getValue()
    if (current !== newValue) {
      tomSelectInstance.setValue(newValue || '', false)
    }
  }
)

onMounted(initTomSelect)

onBeforeUnmount(() => {
  tomSelectInstance?.destroy()
  tomSelectInstance = null
})

defineExpose({
  setValue: (v) => tomSelectInstance?.setValue(v, false),
  getInstance: () => tomSelectInstance
})
</script>

<style scoped>


/* dropdown style */
:deep(.ts-dropdown) {
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

:deep(.ts-dropdown .option) {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #334155;
}

:deep(.ts-dropdown .option.active),
:deep(.ts-dropdown .option:hover) {
  background-color: #eff6ff;
}
</style>
