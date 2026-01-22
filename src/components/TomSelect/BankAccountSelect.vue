// src/components/TomSelect/BankAccountSelect.vue
<template>
  <div class="bank-account-select-container">
    <div class="flex gap-3">
      <!-- Select เลขบัญชี (TomSelect) -->
      <div class="flex flex-col gap-1 w-48">
        <label class="text-xs font-medium text-gray-600">เลขบัญชี</label>
        <div class="tomselect-wrapper relative">
          <select
            :id="inputId"
            v-model="localAccountNumber"
            class="w-full px-2 text-sm"
            :placeholder="placeholder"
          >
            <option value=""></option>
            <option
              v-for="option in activeAccounts"
              :key="option.id"
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
          :class="inputClasses"
          :placeholder="isFromPredefinedOption ? 'ชื่อธนาคารจะแสดงอัตโนมัติ' : 'กรอกชื่อธนาคาร'"
        />
      </div>

      <!-- ชื่อบัญชี -->
      <div class="flex flex-col gap-1 w-72">
        <label class="text-xs font-medium text-gray-600">ชื่อบัญชี</label>
        <input
          v-model="localAccountName"
          type="text"
          :readonly="isFromPredefinedOption"
          :disabled="!localAccountNumber"
          :class="inputClasses"
          :placeholder="isFromPredefinedOption ? 'ชื่อบัญชีจะแสดงอัตโนมัติ' : 'กรอกชื่อบัญชี'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import TomSelect from 'tom-select'
import type { BankAccount, BankAccountData } from '@/types/BankTypes'
import { 
  getBankAccountByNumber, 
  getActiveAccounts,
  isValidAccountNumber
} from '@/components/utils/bankHelpers'

// ==================== Props Interface ====================
interface Props {
  modelValue?: BankAccountData
  inputId: string
  disabled?: boolean
  placeholder?: string
  errorMessage?: string
  bankAccountOptions?: BankAccount[] // เก็บไว้เพื่อ backward compatibility
}

// ==================== Props & Emits ====================
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    accountNumber: '',
    bankName: '',
    accountName: '',
  }),
  disabled: false,
  placeholder: 'กรอกเลขบัญชี',
  errorMessage: '',
  bankAccountOptions: () => []
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: BankAccountData): void
  (e: 'change', value: BankAccountData): void
}>()

// ==================== State ====================
const localAccountNumber = ref<string>(props.modelValue?.accountNumber || '')
const localBankName = ref<string>(props.modelValue?.bankName || '')
const localAccountName = ref<string>(props.modelValue?.accountName || '')
const syncingFromParent = ref<boolean>(false)

let tomSelectInstance: TomSelect | null = null

// ==================== Computed ====================
/**
 * ดึงรายการบัญชีที่ active (ใช้จาก TypeScript utilities)
 */
const activeAccounts = computed<BankAccount[]>(() => {
  // ✅ ถ้ามี prop bankAccountOptions ให้ใช้ตัวนั้น (backward compatibility)
  if (props.bankAccountOptions && props.bankAccountOptions.length > 0) {
    return props.bankAccountOptions
  }
  // ✅ ไม่งั้นใช้จาก utils (ดึง ID มาให้อัตโนมัติ)
  return getActiveAccounts()
})

/**
 * ตรวจสอบว่าเลขบัญชีมาจาก predefined options หรือไม่
 */
const isFromPredefinedOption = computed<boolean>(() => {
  if (!localAccountNumber.value) return false
  return isValidAccountNumber(localAccountNumber.value)
})

/**
 * สร้าง CSS classes สำหรับ input fields
 */
const inputClasses = computed<string[]>(() => {
  const baseClasses = [
    'w-full', 'px-3', 'py-2.5', 'text-sm', 'rounded-xl', 'border', 'transition-all'
  ]

  if (isFromPredefinedOption.value) {
    return [...baseClasses, 'bg-white', 'font-medium', 'cursor-default']
  }

  if (!localAccountNumber.value) {
    return [...baseClasses, 'bg-gray-100', 'cursor-not-allowed', 'opacity-50']
  }

  return [
    ...baseClasses, 
    'bg-white', 
    'border-gray-300', 
    'focus:border-blue-500', 
    'focus:ring-2', 
    'focus:ring-blue-200'
  ]
})

// ==================== Methods ====================
/**
 * Emit ข้อมูลไปยัง parent
 */
const emitChange = (): void => {
  const data: BankAccountData = {
    accountNumber: localAccountNumber.value,
    bankName: localBankName.value,
    accountName: localAccountName.value,
  }
  emit('update:modelValue', data)
  emit('change', data)
}

/**
 * จัดการเมื่อเปลี่ยนเลขบัญชี
 */
const handleAccountNumberChange = (accountNumber: string): void => {
  if (syncingFromParent.value) return

  localAccountNumber.value = accountNumber

  // ✅ ค้นหาข้อมูลจาก TypeScript utilities (ดึง ID มาให้อัตโนมัติ)
  const foundAccount = getBankAccountByNumber(accountNumber)

  if (foundAccount) {
    // พบในระบบ - ใช้ข้อมูลที่กำหนดไว้ (มี ID แล้ว)
    localBankName.value = foundAccount.bankName
    localAccountName.value = foundAccount.accountName
    console.log('✅ Selected Account ID:', foundAccount.id) // Debug
  } else {
    // ไม่พบ - ให้ user กรอกเอง (ไม่มี ID)
    localBankName.value = ''
    localAccountName.value = ''
    console.log('⚠️ Custom account (no ID)')
  }

  emitChange()
}

/**
 * Initialize TomSelect
 */
const initTomSelect = (): void => {
  const el = document.getElementById(props.inputId) as HTMLSelectElement | null

  if (!el || (el as any).tomselect) return

  tomSelectInstance = new TomSelect(el, {
    create: true,
    placeholder: props.placeholder,
    allowEmptyOption: true,
    createOnBlur: true,
    createFilter: (input: string) => input.length > 0,
    onChange: (value: string) => handleAccountNumberChange(value),
  })

  // Apply custom styles
  applyTomSelectStyles()

  // ✅ โหลดค่าเริ่มต้น
  if (props.modelValue?.accountNumber) {
    syncingFromParent.value = true
    tomSelectInstance.setValue(props.modelValue.accountNumber, true)
    localAccountNumber.value = props.modelValue.accountNumber
    localBankName.value = props.modelValue.bankName || ''
    localAccountName.value = props.modelValue.accountName || ''
    setTimeout(() => {
      syncingFromParent.value = false
    }, 100)
  }
}

/**
 * Apply custom styles to TomSelect
 */
const applyTomSelectStyles = (): void => {
  if (!tomSelectInstance) return

  const control = tomSelectInstance.control
  Object.assign(control.style, {
    width: '100%',
    height: '2.70rem',
    padding: '0.625rem 0.75rem',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    color: '#334155',
    borderRadius: '0.75rem',
    border: '1px solid rgba(203, 213, 225, 0.5)',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
    transition: 'all 0.2s'
  })

  const input = control.querySelector('input')
  if (input) {
    Object.assign(input.style, {
      fontSize: '0.875rem',
      height: 'auto',
      padding: '0.25rem',
      color: '#334155'
    })
  }
}

// ==================== Watchers ====================
/**
 * Watch เมื่อเลขบัญชีเปลี่ยน
 */
watch(localAccountNumber, (newValue) => {
  if (!newValue) {
    localBankName.value = ''
    localAccountName.value = ''
  }
})

/**
 * Watch เมื่อ bankName หรือ accountName เปลี่ยน (กรณีสร้างใหม่)
 */
watch([localBankName, localAccountName], () => {
  if (!isFromPredefinedOption.value && localAccountNumber.value) {
    emitChange()
  }
})

/**
 * Watch modelValue จากภายนอก
 */
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal || syncingFromParent.value) return

    syncingFromParent.value = true

    localAccountNumber.value = newVal.accountNumber || ''
    localBankName.value = newVal.bankName || ''
    localAccountName.value = newVal.accountName || ''

    if (tomSelectInstance) {
      const currentValue = tomSelectInstance.getValue()
      if (currentValue !== newVal.accountNumber) {
        tomSelectInstance.setValue(newVal.accountNumber || '', true)
      }
    }

    setTimeout(() => {
      syncingFromParent.value = false
    }, 100)
  },
  { deep: true, immediate: true }
)

// ==================== Lifecycle ====================
onMounted(() => {
  initTomSelect()
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