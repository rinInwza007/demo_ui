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
            :placeholder="placeholder"
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
            isFromPredefinedOption
              ? 'bg-white font-medium cursor-default'
              : !localAccountNumber
              ? 'bg-gray-100 cursor-not-allowed opacity-50'
              : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
          ]"
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
          :class="[
            'w-full px-3 py-2.5 text-sm rounded-xl border transition-all',
            isFromPredefinedOption
              ? 'bg-whitee font-medium cursor-default'
              : !localAccountNumber
              ? 'bg-gray-100 cursor-not-allowed opacity-50'
              : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
          ]"
          :placeholder="isFromPredefinedOption ? 'ชื่อบัญชีจะแสดงอัตโนมัติ' : 'กรอกชื่อบัญชี'"
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
    placeholder: {
    type: String,
    default: 'กรอกเลขบัญชี'
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

// ✅ ตรวจสอบว่าเลขบัญชีมาจาก predefined options หรือไม่
const isFromPredefinedOption = computed(() => {
  return props.bankAccountOptions.some(
    (opt) => opt.accountNumber === localAccountNumber.value
  )
})

// Watch เมื่อเปลี่ยนเลขบัญชี
watch(localAccountNumber, (newAccountNumber) => {
  if (!newAccountNumber) {
    localBankName.value = ''
    localAccountName.value = ''
  }
})

// ✅ Watch เมื่อเปลี่ยน bankName หรือ accountName (เฉพาะกรณีสร้างใหม่)
watch([localBankName, localAccountName], () => {
  if (!isFromPredefinedOption.value && localAccountNumber.value) {
    emitChange()
  }
})
const syncingFromParent = ref(false)
// Watch modelValue จากภายนอก
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal || syncingFromParent.value) return

    syncingFromParent.value = true

    const newAccountNumber = newVal.accountNumber || ''
    const newBankName = newVal.bankName || ''
    const newAccountName = newVal.accountName || ''

    // อัพเดต local values
    localAccountNumber.value = newAccountNumber
    localBankName.value = newBankName
    localAccountName.value = newAccountName

    // อัพเดต TomSelect
    if (tomSelectInstance) {
      const currentValue = tomSelectInstance.getValue()
      if (currentValue !== newAccountNumber) {
        tomSelectInstance.setValue(newAccountNumber || '', true)
      }
    }

    setTimeout(() => {
      syncingFromParent.value = false
    }, 100)
  },
  { deep: true, immediate: true }
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
      create: true,
      placeholder: 'เลือกหรือกรอกเลขบัญชี',
      allowEmptyOption: true,
      createOnBlur: true,
      createFilter: (input) => {
        return input.length > 0
      },
      onChange(value) {
        if (syncingFromParent.value) return

        localAccountNumber.value = value

        const found = props.bankAccountOptions.find(
          (opt) => opt.accountNumber === value
        )

        if (found) {
          localBankName.value = found.bankName
          localAccountName.value = found.accountName
        } else {
          localBankName.value = ''
          localAccountName.value = ''
        }

        emitChange()
      },
    })

    // Custom styling (เหมือนเดิม)
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