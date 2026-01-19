<template>
  <div class="tomselect-container relative">
    <select
      :id="inputId"
      v-model="localValue"
      class="w-full px-2 text-sm"
    >
      <option value=""></option>
      <!-- ✅ แบ่งหมวดตาม type: income และ receivable -->
      <optgroup 
        v-for="group in groupedOptions" 
        :key="group.label"
        :label="group.label"
      >
        <option
          v-for="option in group.options"
          :key="option.id"
          :value="option.name"
          :data-item-id="option.id"
        >
          {{ option.name }}
        </option>
      </optgroup>
    </select>

    <!-- ไอคอนในช่อง -->
    <div class="absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-auto">
      <slot name="suffix" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import TomSelect from 'tom-select'
import { getOptionsForUser } from '@/components/data/ItemNameOption'
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

const emit = defineEmits(['update:modelValue', 'input', 'item-selected'])

const localValue = ref(props.modelValue)
let tomSelectInstance = null

// ✅ แบ่งกลุ่ม options ตาม type: income และ receivable
const groupedOptions = computed(() => {
  const rawOptions = getOptionsForUser(auth, props.waybillType)
  
  console.log('📦 Raw Options from getOptionsForUser:', rawOptions)
  
  // สร้างโครงสร้างกลุ่ม
  const groups = {
    income: { 
      label: '💰 รายการนำส่งเงิน', 
      options: [],
      order: 1 
    },
    receivable: { 
      label: '📄 รายการลูกหนี้', 
      options: [],
      order: 2 
    }
  }

  // ✅ จัดกลุ่มตาม type และเก็บ id, name
  rawOptions.forEach(opt => {
    const mapped = {
      id: opt.id,           // ✅ เพิ่ม id
      name: opt.name,       // ✅ ใช้ name แทน value
      type: opt.type,
      affiliationId: opt.affiliationId
    }

    if (opt.type === 'income') {
      groups.income.options.push(mapped)
    } else if (opt.type === 'receivable') {
      groups.receivable.options.push(mapped)
    }
  })

  console.log('📋 Grouped Options:', groups)

  // ส่งคืนเฉพาะกลุ่มที่มี options และเรียงตาม order
  return Object.values(groups)
    .filter(g => g.options.length > 0)
    .sort((a, b) => a.order - b.order)
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
  
  // ✅ ค้นหา item ที่เลือกและส่ง id กลับไป
  const allOptions = groupedOptions.value.flatMap(g => g.options)
  const selectedItem = allOptions.find(opt => opt.name === newVal)
  
  if (selectedItem) {
    console.log('✅ Item Selected:', selectedItem)
    emit('item-selected', {
      id: selectedItem.id,
      name: selectedItem.name,
      type: selectedItem.type,
      affiliationId: selectedItem.affiliationId
    })
  }
})

onMounted(() => {
  const el = document.getElementById(props.inputId)

  if (el && !el.tomselect) {
    tomSelectInstance = new TomSelect(el, {
      create: props.allowCreate,
      placeholder: props.placeholder,
      allowEmptyOption: true,
      lockOptgroupOrder: true,
      onChange(value) {
        localValue.value = value
        console.log('📝 TomSelect onChange:', value)
      }
    })

    const control = tomSelectInstance.control

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
  z-index: 9999 !important;
  @apply rounded-xl shadow-lg border border-gray-200;
  max-height: 400px;
  overflow-y: auto;
}

.ts-dropdown .option {
  @apply text-sm text-slate-700 py-2 px-3 cursor-pointer transition-colors;
}

.ts-dropdown .option:hover,
.ts-dropdown .option.active {
  @apply bg-blue-50;
}

/* ✅ สไตล์สำหรับ optgroup header */
.ts-dropdown .optgroup-header {
  @apply font-semibold text-sm text-slate-700 py-2.5 px-3 bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-300;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
}

/* ✅ แยกสีตามกลุ่ม */
.ts-dropdown .optgroup:first-child .optgroup-header {
  @apply bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800;
}

.ts-dropdown .optgroup:last-child .optgroup-header {
  @apply bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-orange-800;
}

.ts-dropdown .optgroup {
  @apply border-b border-slate-200 last:border-b-0;
}

/* ✅ เพิ่ม indent ให้ options ภายใน group */
.ts-dropdown .optgroup .option {
  @apply pl-6;
}

/* ✅ เพิ่มเส้นแบ่งระหว่างกลุ่ม */
.ts-dropdown .optgroup + .optgroup {
  border-top: 3px solid #e2e8f0;
}
</style>