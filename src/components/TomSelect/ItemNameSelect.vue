<template>
  <div class="tomselect-container relative">
    <select
      :id="inputId"
      v-model="localValue"
      class="w-full px-2 text-sm"
    >
      <option value=""></option>
      <option
        v-for="option in computedOptions"
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
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

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

// ✅ แมป affiliationId กับ department
const getDepartmentFromAffiliationId = (affiliationId) => {
  const mapping = {
    'ENG': 'engineering',    // คณะวิศวกรรมศาสตร์
    'NUR': 'nursing',        // คณะพยาบาลศาสตร์
    'DEN': 'dentistry',      // คณะทันตแพทยศาสตร์
    'HOS': 'hospital',       // โรงพยาบาล
    'MED': 'medicine',       // คณะแพทยศาสตร์
    'PHA': 'pharmacy',       // คณะเภสัชศาสตร์
    // เพิ่มคณะอื่นๆ ตามต้องการ
  }
  
  return mapping[affiliationId] || 'general'
}

// ✅ ดึง options ตามสิทธิ์ของผู้ใช้
const computedOptions = computed(() => {
  let rawOptions = []

  let effectiveDepartment = 'general'

  if (auth.user) {
    if (auth.isRole('superadmin', 'admin', 'treasury')) {
      // พวกอำนาจนิยม เห็นหมด
      effectiveDepartment = props.department
    } else {
      // ไพร่ฟ้าประชาชน เห็นแค่คณะตัวเอง
      effectiveDepartment = getDepartmentFromAffiliationId(
        auth.user.affiliationId
      )
    }
  }

  if (props.waybillType === 'income') {
    rawOptions = incomeOptions
  } else if (props.waybillType === 'receivable') {
    rawOptions = getReceivableOptionsByDepartment(effectiveDepartment)
  } else {
    rawOptions = getAllOptions(effectiveDepartment)
  }

  return rawOptions.map(opt => ({
    value: opt.value,
    label: opt.value
  }))
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