<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
    >
      <div class="bg-white w-full max-w-md rounded-xl p-5 shadow-lg">
        <h3 class="text-lg font-semibold mb-3">เลือกประเภทของรายการ</h3>

        <div class="gap-3 max-h-80 overflow-y-auto">
          <div
            v-for="(item, index) in items"
            :key="index"
            class="flex flex-col mb-3 border-b pb-3"
          >
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="item.checked" class="w-4 h-4 " @change="handleCheckboxChange(item)" />
              <span>{{ item.name }}</span>
            </label>

            <!-- แสดงเฉพาะตอนติ๊ก -->
            <template v-if="item.checked">

              <!-- เช็คธนาคาร: เอาเลขที่เช็คไว้ด้านบน -->
              <template v-if="item.NumCheck !== undefined">
                <input
                  type="text"
                  v-model="item.NumCheck"
                  placeholder="เลขที่เช็ค *"
                  class="border px-2 py-1 rounded w-full mt-2"
                  :class="{ 'border-gray-500': item.checked && !item.NumCheck }"
                  @input="handleInput"
                />

                <input
                  type="number"
                  v-model="item.amount"
                  placeholder="จำนวนเงิน *"
                  class="border px-2 py-1 rounded w-full mt-2"
                  :class="{ 'border-gray-500': item.checked && !item.amount }"
                  @input="handleInput"
                />
              </template>

              <!-- ฝากเข้าบัญชี -->
              <template v-else-if="item.AccountNum !== undefined">
                <input
                  type="text"
                  v-model="item.AccountNum"
                  placeholder="เลขบัญชี *"
                  class="border px-2 py-1 rounded w-full mt-2"
                  :class="{ 'border-gray-500': item.checked && !item.AccountNum }"
                  @input="handleInput"
                />
                <input
                  type="text"
                  v-model="item.AccountName"
                  placeholder="ชื่อบัญชี *"
                  class="border px-2 py-1 rounded w-full mt-2"
                  :class="{ 'border-gray-500': item.checked && !item.AccountName }"
                  @input="handleInput"
                />
                <input
                  type="number"
                  v-model="item.amount"
                  placeholder="จำนวนเงิน *"
                  class="border px-2 py-1 rounded w-full mt-2"
                  :class="{ 'border-gray-500': item.checked && !item.amount }"
                  @input="handleInput"
                />
              </template>

              <!-- เงินสด -->
              <template v-else>
                <input
                  type="number"
                  v-model="item.amount"
                  placeholder="จำนวนเงิน *"
                  class="border px-2 py-1 rounded w-full mt-2"
                  :class="{ 'border-gray-500': item.checked && !item.amount }"
                  @input="handleInput"
                />
              </template>

            </template>
          </div>
        </div>

        <!-- แสดงข้อความ error ถ้ามี -->
        <div v-if="errorMessage" class="mt-3 text-red-500 text-sm">
          ⚠️ {{ errorMessage }}
        </div>

        <div class="mt-4 flex justify-end gap-2">
          <button class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" @click="closeModal">
            ปิด
          </button>
          <button 
            class="px-4 py-2 rounded text-white transition-colors"
            :class="isValid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'"
            @click="confirmSelection"
            :disabled="!isValid"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

// Props & Emits
const props = defineProps({ 
  show: Boolean,
  items: Array
})
const emit = defineEmits(['close', 'update:selected'])

const hasConfirmed = ref(false) 
const errorMessage = ref('')
const savedData = ref({}) // เก็บข้อมูลที่บันทึกไว้

// Restore ข้อมูลตอนเปิด modal
watch(() => props.show, (newVal) => {
  if (newVal && props.items) {
    // Restore ข้อมูลที่เคยบันทึกไว้
    props.items.forEach(item => {
      const saved = savedData.value[item.name]
      if (saved) {
        item.checked = saved.checked
        item.amount = saved.amount
        if (item.NumCheck !== undefined) {
          item.NumCheck = saved.NumCheck
        }
        if (item.AccountNum !== undefined) {
          item.AccountNum = saved.AccountNum
          item.AccountName = saved.AccountName
        }
      }
    })
    
    // ถ้ามีข้อมูลที่ restore แล้ว ให้ถือว่า confirmed
    const hasCheckedItems = props.items?.some(i => i.checked && i.amount)
    hasConfirmed.value = hasCheckedItems
  }
})

const handleInput = () => {
  hasConfirmed.value = false
}

// ตรวจสอบว่าข้อมูลครบหรือไม่
const isValid = computed(() => {
  const checkedItems = props.items?.filter(i => i.checked) || []
  
  if (checkedItems.length === 0) {
    return false
  }
  
  return checkedItems.every(item => {
    if (item.NumCheck === undefined && item.AccountNum === undefined) {
      return item.amount && parseFloat(item.amount) > 0
    }
    
    if (item.NumCheck !== undefined) {
      return item.NumCheck && item.amount && parseFloat(item.amount) > 0
    }
    
    if (item.AccountNum !== undefined) {
      return item.AccountNum && item.AccountName && item.amount && parseFloat(item.amount) > 0
    }
    
    return true
  })
})

// กดบันทึก
const confirmSelection = () => {
  if (!isValid.value) {
    errorMessage.value = 'กรุณากรอกข้อมูลให้ครบถ้วน'
    return
  }
  
  const selected = props.items.filter(i => i.checked).map(i => ({...i}))
  
  if (selected.length === 0) {
    errorMessage.value = 'กรุณาเลือกอย่างน้อย 1 รายการ'
    return
  }
  
  // บันทึกข้อมูลไว้
  props.items.forEach(item => {
    savedData.value[item.name] = {
      checked: item.checked,
      amount: item.amount,
      NumCheck: item.NumCheck,
      AccountNum: item.AccountNum,
      AccountName: item.AccountName
    }
  })
  
  errorMessage.value = ''
  hasConfirmed.value = true
  emit('update:selected', selected)
  emit('close')
}

// ฟังก์ชั่นปิด + ล้างข้อมูลเฉพาะตอนที่ยังไม่ได้บันทึก
const closeModal = () => {
  if (!hasConfirmed.value) {
    clearAllData()
  }
  
  errorMessage.value = ''
  emit('close')
}

const clearItemData = (item) => {
  item.amount = ''
  
  if (item.NumCheck !== undefined) {
    item.NumCheck = ''
  }
  
  if (item.AccountNum !== undefined) {
    item.AccountNum = ''
    item.AccountName = ''
  }
}

const clearAllData = () => {
  props.items?.forEach((item) => {
    item.checked = false
    clearItemData(item)
    // ลบข้อมูลที่เก็บไว้ด้วย
    delete savedData.value[item.name]
  })
}

const handleCheckboxChange = (item) => {
  if (!item.checked) {
    clearItemData(item)
  }
  hasConfirmed.value = false
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>