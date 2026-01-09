<template>
  <div class="bank-account-select-container">
    <!-- แถวเดียว: เลขบัญชี | ชื่อธนาคาร | ชื่อบัญชี -->
    <div class="flex gap-3">
      <!-- Select เลขบัญชี (TomSelect) -->
      <div class="flex flex-col gap-1 w-48">
        <label class="text-xs font-medium text-gray-600">เลขบัญชี</label>
        <div class="tomselect-wrapper relative">
          <select
            :id="inputId"
            v-model="localAccountNumber"
            class="w-full px-2 text-sm"
          >
            <option value=""></option>
            <option
              v-for="option in bankAccountOptions"
              :key="option.accountNumber"
              :value="option.accountNumber"
            >
              {{ option.accountNumber }}
            </option>
          </select>
        </div>
        <span v-if="errorMessage" class="text-red-600 text-xs">
          {{ errorMessage }}
        </span>
      </div>

      <!-- ชื่อธนาคาร -->
      <div class="flex flex-col gap-1 w-52">
        <label class="text-xs font-medium text-gray-600">ชื่อธนาคาร</label>
        <input
          v-model="localBankName"
          type="text"
          :readonly="isFromPredefinedOption"
          :disabled="!localAccountNumber"
          :class="[
            'w-full px-3 py-2.5 text-sm rounded-xl border transition-all',
            isFromPredefinedOption || !localAccountNumber
              ? 'bg-gray-100 cursor-not-allowed opacity-50'
              : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
          ]"
          placeholder="ชื่อธนาคารจะแสดงอัตโนมัติ"
        />
      </div>

      <!-- ชื่อบัญชี -->
      <div class="flex flex-col gap-1 w-52">
        <label class="text-xs font-medium text-gray-600">ชื่อบัญชี</label>
        <input
          v-model="localAccountName"
          type="text"
          :readonly="isFromPredefinedOption"
          :disabled="!localAccountNumber"
          :class="[
            'w-full px-3 py-2.5 text-sm rounded-xl border transition-all',
            isFromPredefinedOption || !localAccountNumber
              ? 'bg-gray-100 cursor-not-allowed opacity-50'
              : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
          ]"
          placeholder="ชื่อบัญชีจะแสดงอัตโนมัติ"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import TomSelect from 'tom-select'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      accountNumber: '',
      bankName: '',
      accountName: '',
    }),
  },
  inputId: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  bankAccountOptions: {
    type: Array,
    default: () => [
      {
        accountNumber: '671-2-90667-9',
        bankName: 'ธนาคารกรุงไทย',
        accountName: 'โรงพยาบาลมหาวิทยาลัยพะเยา',
      },
      {
        accountNumber: '671-2-90668-9',
        bankName: 'ธนาคารกรุงไทย',
        accountName: 'มหาวิทยาลัยพะเยา (กองทุนทั่วไป)',
      },
      {
        accountNumber: '662-0-96023-5',
        bankName: 'ธนาคารกรุงไทย',
        accountName: 'กองทุนเพื่อการจัดตั้งธนาคารเลือด',
      },
      {
        accountNumber: '123-4-56789-0',
        bankName: 'ธนาคารไทยพาณิชย์',
        accountName: 'มหาวิทยาลัยพะเยา',
      },
    ],
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const localAccountNumber = ref(props.modelValue?.accountNumber || '')
const localBankName = ref(props.modelValue?.bankName || '')
const localAccountName = ref(props.modelValue?.accountName || '')

let tomSelectInstance = null

// ตรวจสอบว่าเลขบัญชีมาจาก predefined options หรือไม่
const isFromPredefinedOption = computed(() => {
  return props.bankAccountOptions.some(
    (opt) => opt.accountNumber === localAccountNumber.value
  )
})

// Watch เมื่อเปลี่ยนเลขบัญชี
watch(localAccountNumber, (newAccountNumber) => {
  if (!newAccountNumber) {
    // ถ้าล้างเลขบัญชี ให้ล้างทั้งหมด
    localBankName.value = ''
    localAccountName.value = ''
  } else {
    // ตรวจสอบว่ามีใน options หรือไม่
    const found = props.bankAccountOptions.find(
      (opt) => opt.accountNumber === newAccountNumber
    )

    if (found) {
      // ถ้าเจอ → auto-fill
      localBankName.value = found.bankName
      localAccountName.value = found.accountName
    } else {
      // ถ้าไม่เจอ (สร้างใหม่) → เคลียร์และให้กรอกเอง
      localBankName.value = ''
      localAccountName.value = ''
    }
  }

  emitChange()
})

// Watch เมื่อเปลี่ยน bankName หรือ accountName (กรณีสร้างใหม่)
watch([localBankName, localAccountName], () => {
  if (!isFromPredefinedOption.value && localAccountNumber.value) {
    emitChange()
  }
})

// Watch modelValue จากภายนอก
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      localAccountNumber.value = newVal.accountNumber || ''
      localBankName.value = newVal.bankName || ''
      localAccountName.value = newVal.accountName || ''

      // อัพเดต TomSelect value
      if (tomSelectInstance && tomSelectInstance.getValue() !== newVal.accountNumber) {
        tomSelectInstance.setValue(newVal.accountNumber || '', true)
      }
    }
  },
  { deep: true }
)

const emitChange = () => {
  const data = {
    accountNumber: localAccountNumber.value,
    bankName: localBankName.value,
    accountName: localAccountName.value,
  }
  emit('update:modelValue', data)
  emit('change', data)
}

onMounted(() => {
  const el = document.getElementById(props.inputId)

  if (el && !el.tomselect) {
    tomSelectInstance = new TomSelect(el, {
      create: true, // อนุญาตให้สร้างเลขบัญชีใหม่
      placeholder: 'เลือกหรือกรอกเลขบัญชี',
      allowEmptyOption: true,
      createOnBlur: true,
      createFilter: (input) => {
        // อนุญาตให้สร้างได้ถ้ากรอกอะไรก็ได้
        return input.length > 0
      },
      onChange(value) {
        localAccountNumber.value = value
      },
    })

    // Custom styling
    const control = tomSelectInstance.control
    control.style.width = '100%'
    control.style.height = '2.70rem'
    control.style.padding = '0.625rem 0.75rem'
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

    const input = control.querySelector('input')
    if (input) {
      input.style.fontSize = '0.875rem'
      input.style.height = 'auto'
      input.style.padding = '0.25rem'
      input.style.color = '#334155'
    }

    // ถ้ามีค่าเริ่มต้น ให้ set ลงไป
    if (props.modelValue?.accountNumber) {
      tomSelectInstance.setValue(props.modelValue.accountNumber, true)
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

<style scoped>
.tomselect-wrapper {
  position: relative;
}

/* Override TomSelect dropdown styles */
:deep(.ts-dropdown) {
  z-index: 9999 !important;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border: 1px solid #e5e7eb;
  max-height: 300px;
  overflow-y: auto;
}

:deep(.ts-dropdown .option) {
  font-size: 0.875rem;
  color: #475569;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

:deep(.ts-dropdown .option:hover),
:deep(.ts-dropdown .option.active) {
  background-color: #eff6ff;
  color: #1e40af;
}

:deep(.ts-dropdown .create) {
  font-size: 0.875rem;
  color: #059669;
  padding: 0.5rem 0.75rem;
  font-weight: 500;
  border-top: 1px solid #e5e7eb;
}

:deep(.ts-dropdown .create:hover) {
  background-color: #d1fae5;
}
</style>