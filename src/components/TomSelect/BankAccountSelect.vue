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
import { bankService } from '@/services/BankService/BankService'

// ==================== Props Interface ====================
interface Props {
  modelValue?: BankAccountData
  inputId: string
  disabled?: boolean
  placeholder?: string
  errorMessage?: string
  bankAccountOptions?: BankAccount[]
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
const localAccountNumber = ref<string>('')
const localBankName = ref<string>(props.modelValue?.bankName || '')
const localAccountName = ref<string>(props.modelValue?.accountName || '')
const syncingFromParent = ref<boolean>(false)
const bankAccounts = ref<BankAccount[]>([])
const isLoading = ref<boolean>(false)

let tomSelectInstance: TomSelect | null = null

// ==================== Computed ====================
const activeAccounts = computed<BankAccount[]>(() => {
  // ✅ ถ้ามี props.bankAccountOptions ให้ใช้อันนั้น
  if (props.bankAccountOptions && props.bankAccountOptions.length > 0) {
    return props.bankAccountOptions
  }
  // ✅ ไม่เช่นนั้นใช้ข้อมูลจาก API
  return bankAccounts.value.filter(acc => acc.isActive === true)
})

const isFromPredefinedOption = computed<boolean>(() => {
  if (!localAccountNumber.value) return false
  return activeAccounts.value.some(acc => acc.accountNumber === localAccountNumber.value)
})

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
const loadBankAccounts = async () => {
  try {
    isLoading.value = true
    const accounts = await bankService.getAll()
    bankAccounts.value = accounts
    console.log('✅ Loaded bank accounts from API:', accounts.length)
  } catch (error) {
    console.error('❌ Failed to load bank accounts:', error)
    bankAccounts.value = []
  } finally {
    isLoading.value = false
  }
}

const getBankAccountByNumber = (accountNumber: string): BankAccount | undefined => {
  return activeAccounts.value.find(acc => acc.accountNumber === accountNumber)
}

const emitChange = (): void => {
  const data: BankAccountData = {
    accountNumber: localAccountNumber.value,
    bankName: localBankName.value,
    accountName: localAccountName.value,
  }
  emit('update:modelValue', data)
  emit('change', data)
}

const handleAccountNumberChange = (accountNumber: string): void => {
  if (syncingFromParent.value) return

  localAccountNumber.value = accountNumber

  const foundAccount = getBankAccountByNumber(accountNumber)

  if (foundAccount) {
    localBankName.value = foundAccount.bankName
    localAccountName.value = foundAccount.accountName
    console.log('✅ Selected Account ID:', foundAccount.id)
  } else {
    localBankName.value = ''
    localAccountName.value = ''
    console.log('⚠️ Custom account (no ID)')
  }

  emitChange()
}

const initTomSelect = (): void => {
  const el = document.getElementById(props.inputId) as HTMLSelectElement | null
  if (!el || (el as any).tomselect) return

  tomSelectInstance = new TomSelect(el, {
    create: true,
    allowEmptyOption: true,
    createOnBlur: true,
    onChange: (value: string) => handleAccountNumberChange(value),
  })

  tomSelectInstance.clear(true)

  const input = tomSelectInstance.control_input
  if (input) {
    input.placeholder = props.placeholder || 'กรอกเลขบัญชี'
  }

  applyTomSelectStyles()
}

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
watch(localAccountNumber, (newValue) => {
  if (!newValue) {
    localBankName.value = ''
    localAccountName.value = ''
  }
})

watch([localBankName, localAccountName], () => {
  if (!isFromPredefinedOption.value && localAccountNumber.value) {
    emitChange()
  }
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal || syncingFromParent.value) return

    syncingFromParent.value = true

    localAccountNumber.value = newVal.accountNumber || ''
    localBankName.value = newVal.bankName || ''
    localAccountName.value = newVal.accountName || ''

    if (tomSelectInstance) {
      if (newVal.accountNumber) {
        tomSelectInstance.setValue(newVal.accountNumber, true)
      } else {
        tomSelectInstance.clear(true)
      }
    }

    setTimeout(() => {
      syncingFromParent.value = false
    }, 50)

    console.log('🔄 BankAccountSelect updated:', {
      accountNumber: localAccountNumber.value,
      bankName: localBankName.value,
      accountName: localAccountName.value
    })
  },
  { deep: true, immediate: true }
)

// ==================== Lifecycle ====================
onMounted(async () => {
  // ✅ โหลดข้อมูลธนาคารจาก API
  await loadBankAccounts()
  
  // ✅ รอให้ข้อมูลโหลดเสร็จก่อน init TomSelect
  initTomSelect()
  
  // ✅ ถ้ามีค่าตั้งต้น ให้ set ทันที
  if (props.modelValue?.accountNumber) {
    setTimeout(() => {
      if (tomSelectInstance) {
        tomSelectInstance.setValue(props.modelValue.accountNumber, true)
      }
    }, 100)
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