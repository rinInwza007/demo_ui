<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4"
    >
      <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-modal">
        <!-- Header -->
        <div
          class="bg-gradient-to-r from-[#7E22CE] to-[#7E22CE] px-6 py-5 flex justify-between items-center"
        >
          <div class="flex items-center gap-3">
            <div class="bg-white bg-opacity-20 p-2 rounded-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-white">เลือกประเภทการชำระเงิน</h3>
              <p class="text-purple-100 text-sm">กรุณาเลือกและกรอกรายละเอียด</p>
            </div>
          </div>
          <button
            @click="closeModal"
            class="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div class="space-y-4">
            <div
              v-for="(item, index) in items"
              :key="index"
              class="border-2 rounded-xl p-5 transition-all duration-200"
              :class="
                item.checked
                  ? getColorClasses(item) + ' shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              "
            >
              <!-- Header ของแต่ละรายการ -->
              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="relative flex items-center">
                  <input
                    type="checkbox"
                    v-model="item.checked"
                    @change="handleCheckboxChange(item)"
                    class="w-5 h-5 rounded border-2 border-gray-300 cursor-pointer transition-all"
                  />
                </div>

                <div
                  class="p-2 rounded-lg transition-all"
                  :class="[
                    item.checked ? 'bg-white shadow-sm' : 'bg-gray-100',
                    getIconColor(item),
                  ]"
                >
                  <component :is="getIcon(item)" class="w-5 h-5" />
                </div>

                <span
                  class="text-lg font-semibold transition-colors"
                  :class="item.checked ? 'text-gray-800' : 'text-gray-600'"
                >
                  {{ getDisplayName(item) }}
                </span>
              </label>

              <!-- Form Fields - แสดงเมื่อ checked -->
              <transition name="slide-down">
                <div v-if="item.checked" class="mt-4 space-y-3">
                  
                  <!-- 💵 เงินสด -->
                  <template v-if="getItemType(item) === 'cash'">

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">
                        เลขที่อ้างอิง
                      </label>
                      <input
                        type="text"
                        v-model="item.referenceNo"
                        @input="handleInput"
                        placeholder="กรอกเลขที่อ้างอิง"
                        class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                      />
                    </div>

                      <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">
                        จำนวนเงิน <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          type="number"
                          v-model="item.amount"
                          @input="handleInput"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          class="w-full px-4 py-2.5 pr-12 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                          :class="{ 'border-red-300 bg-red-50': !item.amount }"
                        />
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">฿</span>
                      </div>
                    </div>
                  </template>

                  <!-- 🏦 เช็คธนาคาร -->
                  <template v-else-if="getItemType(item) === 'bank'">

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">
                        เลขที่เช็ค <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        :value="item.checkNumber || item.NumCheck"
                        @input="handleCheckNumberInput(item, $event)"
                        placeholder="กรอกเลขที่เช็ค"
                        class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        :class="{ 'border-red-300 bg-red-50': !item.checkNumber && !item.NumCheck }"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">
                        เลขที่อ้างอิง
                      </label>
                      <input
                        type="text"
                        v-model="item.referenceNo"
                        @input="handleInput"
                        placeholder="กรอกเลขที่อ้างอิง"
                        class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      />
                    </div>
                                        <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">
                        จำนวนเงิน <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          type="number"
                          v-model="item.amount"
                          @input="handleInput"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          class="w-full px-4 py-2.5 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                          :class="{ 'border-red-300 bg-red-50': !item.amount }"
                        />
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">฿</span>
                      </div>
                    </div>
                  </template>

                  <!-- 💳 ฝากเข้าบัญชี -->
                  <template v-else-if="getItemType(item) === 'transfer'">

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">
                        ชื่อบัญชี <span class="text-red-500">*</span>
                      </label>
                      <select
                        :value="item.accountName || item.AccountName"
                        @change="handleAccountChange(item, $event)"
                        class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
                        :class="{ 'border-red-300 bg-red-50': !item.accountName && !item.AccountName }"
                      >
                        <option value="">เลือกบัญชี</option>
                        <option v-for="acc in accounts" :key="acc.name" :value="acc.name">
                          {{ acc.name }}
                        </option>
                      </select>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">
                          เลขบัญชี <span class="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          readonly
                          :value="item.accountNumber || item.AccountNum"
                          placeholder="เลือกชื่อบัญชีก่อน"
                          class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">
                          ชื่อธนาคาร <span class="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          readonly
                          :value="item.bankName || item.BankName"
                          placeholder="เลือกชื่อบัญชีก่อน"
                          class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">
                        เลขที่อ้างอิง
                      </label>
                      <input
                        type="text"
                        v-model="item.referenceNo"
                        @input="handleInput"
                        placeholder="กรอกเลขที่อ้างอิง"
                        class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
                      />
                    </div>
                                        <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">
                        จำนวนเงิน <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          type="number"
                          v-model="item.amount"
                          @input="handleInput"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          class="w-full px-4 py-2.5 pr-12 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
                          :class="{ 'border-red-300 bg-red-50': !item.amount }"
                        />
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">฿</span>
                      </div>
                    </div>
                  </template>

                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="px-6 pb-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <svg
              class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="text-sm text-red-700">{{ errorMessage }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center"
        >
          <div class="text-sm text-gray-600">
            <span v-if="checkedCount > 0" class="flex items-center gap-2">
              <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              เลือกแล้ว {{ checkedCount }} รายการ
            </span>
            <span v-else class="text-gray-400">ยังไม่ได้เลือกรายการ</span>
          </div>

          <div class="flex gap-3">
            <button
              @click="closeModal"
              class="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              ยกเลิก
            </button>
            <button
              @click="confirmSelection"
              :disabled="!isValid"
              class="px-6 py-2.5 font-medium rounded-lg transition-all shadow-lg relative overflow-hidden group"
              :class="
                isValid
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-purple-500/30'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
              "
            >
              <span class="relative z-10">บันทึกข้อมูล</span>
              <span
                v-if="isValid"
                class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"
              ></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

// Icons
const WalletIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  `,
}

const CreditCardIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  `,
}

const BuildingIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  `,
}

const accounts = ref([
  { name: 'โรงพยาบาลมหาวิทยาลัยพะเยา', number: '671-2-90667-9', bank: 'ธนาคารกรุงไทย' },
  { name: 'มหาวิทยาลัยพะเยา(กองทุนทั่วไป)', number: '980-9-61729-1', bank: 'ธนาคารกรุงไทย' },
  { name: 'กองทุนเพื่อการจัดจั้งธนาคารเลือด', number: '662-0-96023-5', bank: 'ธนาคารกรุงไทย' },
])

const props = defineProps({
  show: Boolean,
  items: Array,
})

const emit = defineEmits(['close', 'update:selected'])

const hasConfirmed = ref(false)
const errorMessage = ref('')
const savedData = ref({})

// 🔥 Helper Functions
const getItemType = (item) => {
  // ลำดับความสำคัญ: moneyType > name > type > paymentType
  if (item.moneyType) return item.moneyType
  
  const typeMap = {
    'cash': 'cash',
    'เงินสด': 'cash',
    'bank': 'bank',
    'เช็ค': 'bank',
    'เช็คธนาคาร': 'bank',
    'transfer': 'transfer',
    'ฝากเข้าบัญชี': 'transfer'
  }
  
  return typeMap[item.name] || 
         typeMap[item.type] || 
         typeMap[item.paymentType] || 
         'cash'
}

const getDisplayName = (item) => {
  const type = getItemType(item)
  const nameMap = {
    'cash': 'เงินสด',
    'bank': 'เช็คธนาคาร',
    'transfer': 'ฝากเข้าบัญชี'
  }
  return nameMap[type] || 'เงินสด'
}

const getIcon = (item) => {
  const type = getItemType(item)
  if (type === 'cash') return WalletIcon
  if (type === 'bank') return CreditCardIcon
  if (type === 'transfer') return BuildingIcon
  return WalletIcon
}

const getColorClasses = (item) => {
  const type = getItemType(item)
  switch (type) {
    case 'cash':
      return 'border-green-200 bg-green-50 hover:border-green-300'
    case 'bank':
      return 'border-blue-200 bg-blue-50 hover:border-blue-300'
    case 'transfer':
      return 'border-orange-200 bg-orange-50 hover:border-orange-300'
    default:
      return 'border-gray-200 bg-gray-50'
  }
}

const getIconColor = (item) => {
  const type = getItemType(item)
  switch (type) {
    case 'cash':
      return 'text-green-600'
    case 'bank':
      return 'text-blue-600'
    case 'transfer':
      return 'text-orange-600'
    default:
      return 'text-gray-600'
  }
}

const handleCheckboxChange = (item) => {
  if (!item.checked) {
    // ล้างข้อมูลทุก field ของ item ตาม type
    item.amount = ''
    item.referenceNo = ''
    
    const type = getItemType(item)
    if (type === 'bank') {
      item.checkNumber = ''
      item.NumCheck = ''
    }
    if (type === 'transfer') {
      item.accountName = ''
      item.AccountName = ''
      item.accountNumber = ''
      item.AccountNum = ''
      item.bankName = ''
      item.BankName = ''
    }
  }

  handleInput() // รีเซ็ต error / confirm state
}


// Input Handlers
const handleCheckNumberInput = (item, event) => {
  const value = event.target.value
  item.checkNumber = value
  item.NumCheck = value
  handleInput()
}

const handleAccountChange = (item, event) => {
  const selectedName = event.target.value
  const selected = accounts.value.find((acc) => acc.name === selectedName)
  
  if (selected) {
    item.accountName = selected.name
    item.AccountName = selected.name
    item.accountNumber = selected.number
    item.AccountNum = selected.number
    item.bankName = selected.bank
    item.BankName = selected.bank
  } else {
    item.accountName = ''
    item.AccountName = ''
    item.accountNumber = ''
    item.AccountNum = ''
    item.bankName = ''
    item.BankName = ''
  }
  handleInput()
}

const handleInput = () => {
  hasConfirmed.value = false
  errorMessage.value = ''
}

// Computed
const checkedCount = computed(() => {
  return props.items?.filter((i) => i.checked).length || 0
})

const isValid = computed(() => {
  const checkedItems = props.items?.filter((i) => i.checked) || []

  if (checkedItems.length === 0) {
    return false
  }

  return checkedItems.every((item) => {
    const hasAmount = item.amount && parseFloat(item.amount) > 0
    const hasRef = item.referenceNo && String(item.referenceNo).trim() !== ''


    if (!item.referenceNo || item.referenceNo.trim() === '') {
      return false
    }

    if (!hasAmount) {
      return false
    }

    const type = getItemType(item)

    if (type === 'bank') {
      return hasRef && (item.checkNumber || item.NumCheck) && 
             String(item.checkNumber || item.NumCheck).trim() !== ''
    }

    if (type === 'transfer') {
      const hasAccountName = (item.accountName || item.AccountName) && 
                            String(item.accountName || item.AccountName).trim() !== ''
      const hasAccountNumber = (item.accountNumber || item.AccountNum) && 
                              String(item.accountNumber || item.AccountNum).trim() !== ''
      const hasBankName = (item.bankName || item.BankName) && 
                         String(item.bankName || item.BankName).trim() !== ''
      
      return hasRef && hasAccountName && hasAccountNumber && hasBankName
    }

    return true
  })
})

// Actions
const confirmSelection = () => {
  if (!isValid.value) {
    errorMessage.value = 'กรุณากรอกข้อมูลให้ครบถ้วน'
    return
  }

  const selected = props.items
    .filter((i) => i.checked)
    .map((i) => {
      const item = { ...i }
      const type = getItemType(i)

      // Set moneyType
      item.moneyType = type

      // Sync fields
      if (type === 'bank') {
        const checkNum = item.checkNumber || item.NumCheck
        item.checkNumber = checkNum
        item.NumCheck = checkNum
      } else if (type === 'transfer') {
        const accName = item.accountName || item.AccountName
        const accNum = item.accountNumber || item.AccountNum
        const bankName = item.bankName || item.BankName
        
        item.accountName = accName
        item.AccountName = accName
        item.accountNumber = accNum
        item.AccountNum = accNum
        item.bankName = bankName
        item.BankName = bankName
      }

      return item
    })

  // Save data for restore
  props.items.forEach((item) => {
    const type = getItemType(item)
    const key = item.name || item.moneyType || type
    
    const data = {
      checked: item.checked,
      amount: item.amount,
      referenceNo: item.referenceNo,
      moneyType: type
    }

    if (type === 'bank') {
      const checkNum = item.checkNumber || item.NumCheck
      data.checkNumber = checkNum
      data.NumCheck = checkNum
    }

    if (type === 'transfer') {
      const accName = item.accountName || item.AccountName
      const accNum = item.accountNumber || item.AccountNum
      const bankName = item.bankName || item.BankName
      
      data.accountName = accName
      data.AccountName = accName
      data.accountNumber = accNum
      data.AccountNum = accNum
      data.bankName = bankName
      data.BankName = bankName
    }

    savedData.value[key] = data
  })

  errorMessage.value = ''
  hasConfirmed.value = true
  emit('update:selected', selected)
  emit('close')
}

const closeModal = () => {
  errorMessage.value = ''
  emit('close')
}

const restoreSavedData = () => {
  props.items?.forEach((item) => {
    const type = getItemType(item)
    const key = item.name || item.moneyType || type
    const saved = savedData.value[key]

    if (saved) {
      item.checked = saved.checked
      item.amount = saved.amount ?? ''
      item.referenceNo = saved.referenceNo ?? ''

      if (type === 'bank') {
        item.checkNumber = saved.checkNumber ?? ''
        item.NumCheck = saved.NumCheck ?? ''
      }

      if (type === 'transfer') {
        item.accountName = saved.accountName ?? ''
        item.AccountName = saved.AccountName ?? ''
        item.accountNumber = saved.accountNumber ?? ''
        item.AccountNum = saved.AccountNum ?? ''
        item.bankName = saved.bankName ?? ''
        item.BankName = saved.BankName ?? ''
      }
    } else {
      item.checked = false
      item.amount = ''
      item.referenceNo = ''

      if (type === 'bank') {
        item.checkNumber = ''
        item.NumCheck = ''
      }

      if (type === 'transfer') {
        item.accountName = ''
        item.AccountName = ''
        item.accountNumber = ''
        item.AccountNum = ''
        item.bankName = ''
        item.BankName = ''
      }
    }
  })
}

watch(
  () => props.show,
  (newVal) => {
    if (newVal && props.items) {
      restoreSavedData()
      const hasCheckedItems = props.items?.some((i) => i.checked && i.amount)
      hasConfirmed.value = hasCheckedItems
    }
  },
)
</script>

<style scoped>
/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active {
  animation: slideDown 0.3s ease-out;
}

.slide-down-leave-active {
  animation: slideDown 0.2s ease-in reverse;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-modal {
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Remove number input arrows */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>