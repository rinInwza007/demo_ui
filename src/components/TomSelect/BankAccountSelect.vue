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
            :disabled="disabled || readonly"
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
          :readonly="isFromPredefinedOption || readonly"
          :disabled="!localAccountNumber || disabled"
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
          :readonly="isFromPredefinedOption || readonly"
          :disabled="!localAccountNumber || disabled"
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

interface Props {
  modelValue?: BankAccountData
  inputId: string
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  errorMessage?: string
  bankAccountOptions?: BankAccount[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    accountNumber: '',
    bankName: '',
    accountName: '',
  }),
  disabled: false,
  readonly: false,
  placeholder: 'กรอกเลขบัญชี',
  errorMessage: '',
  bankAccountOptions: () => []
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: BankAccountData): void
  (e: 'change', value: BankAccountData): void
}>()

const localAccountNumber = ref<string>('')
const localBankName = ref<string>(props.modelValue?.bankName || '')
const localAccountName = ref<string>(props.modelValue?.accountName || '')
const syncingFromParent = ref<boolean>(false)
const bankAccounts = ref<BankAccount[]>([])
const isLoading = ref<boolean>(false)

let tomSelectInstance: TomSelect | null = null

// ✅ Computed สำหรับสถานะ disabled
const isDisabled = computed<boolean>(() => props.disabled || props.readonly)

const activeAccounts = computed<BankAccount[]>(() => {
  if (props.bankAccountOptions && props.bankAccountOptions.length > 0) {
    return props.bankAccountOptions
  }
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

  // ✅ ถ้า disabled
  if (isDisabled.value) {
    return [...baseClasses, 'bg-gray-100', 'text-gray-600', 'cursor-not-allowed', 'opacity-70']
  }

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
  if (isDisabled.value) return // ✅ ถ้า disabled ไม่ emit

  const data: BankAccountData = {
    accountNumber: localAccountNumber.value,
    bankName: localBankName.value,
    accountName: localAccountName.value,
  }
  emit('update:modelValue', data)
  emit('change', data)
}

const handleAccountNumberChange = (accountNumber: string): void => {
  if (syncingFromParent.value || isDisabled.value) return // ✅ เพิ่มเช็ค

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
    onChange: (value: string) => {
      if (!isDisabled.value) {
        handleAccountNumberChange(value)
      }
    },
  })

  tomSelectInstance.clear(true)

  const input = tomSelectInstance.control_input
  if (input) {
    input.placeholder = props.placeholder || 'กรอกเลขบัญชี'
  }

  // Apply custom styles
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

  const inputEl = control.querySelector('input')
  if (inputEl) {
    Object.assign(inputEl.style, {
      fontSize: '0.875rem',
      height: 'auto',
      padding: '0.25rem',
      color: '#334155'
    })
  }

  // ✅ ถ้า disabled ตั้งแต่เริ่มต้น
  if (isDisabled.value) {
    tomSelectInstance.disable()
  }
}

// ✅ Watch disabled state - แค่ enable/disable ไม่เปลี่ยน style
watch(() => props.disabled || props.readonly, (newVal) => {
  if (tomSelectInstance) {
    if (newVal) {
      tomSelectInstance.disable()
    } else {
      tomSelectInstance.enable()
    }
  }
})

watch(localAccountNumber, (newValue) => {
  if (!newValue) {
    localBankName.value = ''
    localAccountName.value = ''
  }
})

watch([localBankName, localAccountName], () => {
  if (!isFromPredefinedOption.value && localAccountNumber.value && !isDisabled.value) {
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
  },
  { deep: true, immediate: true }
)

onMounted(async () => {
  await loadBankAccounts()
  initTomSelect()
  
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
/* ... existing styles ... */

input:read-only,
input:disabled {
  background-color: #f3f4f6 !important;
  color: #6b7280 !important;
  cursor: not-allowed !important;
}
</style>