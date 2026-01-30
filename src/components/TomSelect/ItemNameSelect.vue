<template>
  <div class="tomselect-container relative">
    <!-- Loading State -->
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-30">
      <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
    </div>

    <select
      :id="inputId"
      v-model="localValue"
      class="w-full px-2 text-sm"
      :disabled="isLoading"
    >
      <option value=""></option>
      <!-- ✅ แบ่งหมวดตาม type: income และ receivable -->
      <optgroup 
        v-for="group in groupedOptions" 
        :key="group.value"
        :label="group.label"
        :data-value="group.value"
      >
        <option
          v-for="option in group.options"
          :key="option.id"
          :value="option.name"
          :data-item-id="option.id"
          :data-optgroup="group.value"
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
import { ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import TomSelect from 'tom-select'
import { useAuthStore } from '@/stores/auth'
import ItemNameService from '@/services/ItemName/ItemNameService'

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
    default: 'all'
  },
  disabled: {
    type: Boolean,
    default: false
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
const itemOptions = ref([])
const isLoading = ref(false)
let tomSelectInstance = null

/**
 * ✅ โหลดข้อมูลจาก ItemNameService
 */
const loadItems = async () => {
  isLoading.value = true
  try {
    console.log('📦 Loading items from ItemNameService...')
    const items = await ItemNameService.getItemNamesForUser(auth, props.waybillType)
    itemOptions.value = items
    console.log('✅ Loaded', items.length, 'items')
    
    if (tomSelectInstance) {
      await nextTick()
      updateTomSelectOptions()
    }
  } catch (error) {
    console.error('❌ Error loading items:', error)
    itemOptions.value = []
  } finally {
    isLoading.value = false
  }
}

/**
 * ✅ แบ่งกลุ่ม options
 */
const groupedOptions = computed(() => {
  const groups = {
    income: { 
      value: 'income',
      label: '💰 รายการนำส่งเงิน', 
      options: [],
      order: 1 
    },
    receivable: { 
      value: 'receivable',
      label: '📄 รายการลูกหนี้', 
      options: [],
      order: 2 
    }
  }

  itemOptions.value.forEach(opt => {
    const mapped = {
      id: opt.id,
      name: opt.name,
      type: opt.type,
      affiliationId: opt.affiliationId
    }

    if (opt.type === 'income') {
      groups.income.options.push(mapped)
    } else if (opt.type === 'receivable') {
      groups.receivable.options.push(mapped)
    }
  })

  return Object.values(groups)
    .filter(g => g.options.length > 0)
    .sort((a, b) => a.order - b.order)
})

/**
 * ✅ อัปเดต TomSelect options
 */
const updateTomSelectOptions = () => {
  if (!tomSelectInstance) return

  console.log('🔄 Updating TomSelect options...')
  
  tomSelectInstance.clearOptions()
  tomSelectInstance.clearOptionGroups()
  
  // เพิ่ม optgroups
  groupedOptions.value.forEach(group => {
    tomSelectInstance.addOptionGroup(group.value, {
      label: group.label
    })
  })
  
  // เพิ่ม options
  groupedOptions.value.forEach(group => {
    group.options.forEach(option => {
      tomSelectInstance.addOption({
        value: option.name,
        text: option.name,
        optgroup: group.value,
        itemId: option.id,
        itemType: option.type,
        affiliationId: option.affiliationId
      })
    })
  })
  
  tomSelectInstance.refreshOptions(false)
  console.log('✅ TomSelect options updated')
}

/**
 * ✅ Watch disabled prop - แค่ enable/disable ไม่เปลี่ยน style
 */
watch(() => props.disabled, (newVal) => {
  if (!tomSelectInstance) return
  
  if (newVal) {
    tomSelectInstance.disable()
  } else {
    tomSelectInstance.enable()
  }
}, { immediate: true })
 
watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
  if (tomSelectInstance && tomSelectInstance.getValue() !== newVal) {
    tomSelectInstance.setValue(newVal || '', true)
  }
})

watch(() => props.waybillType, () => {
  loadItems()
})

watch(localValue, (newVal) => {
  emit('update:modelValue', newVal)
  emit('input', newVal)
  
  const allOptions = groupedOptions.value.flatMap(g => g.options)
  const selectedItem = allOptions.find(opt => opt.name === newVal)
  
  if (selectedItem) {
    emit('item-selected', selectedItem)
  }
})

/**
 * ✅ Initialize TomSelect
 */
onMounted(async () => {
  console.log('🚀 Component mounted, loading items...')
  
  await loadItems()
  await nextTick()
  
  const el = document.getElementById(props.inputId)

  if (el && !el.tomselect) {
    console.log('🎨 Initializing TomSelect with config:', {
      optgroups: groupedOptions.value.map(g => ({ value: g.value, label: g.label }))
    })

    tomSelectInstance = new TomSelect(el, {
      create: props.allowCreate,
      placeholder: props.placeholder,
      allowEmptyOption: true,
      
      // ✅ สำคัญ: ต้องมีทั้ง 3 อย่างนี้
      lockOptgroupOrder: true,
      optgroupField: 'optgroup',
      optgroups: groupedOptions.value.map(g => ({
        value: g.value,
        label: g.label
      })),
      
      onChange(value) {
        localValue.value = value
      },
      
      // ✅ Custom render - สำคัญมาก!
      render: {
        // Render optgroup header
        optgroup_header: function(data, escape) {
          return `<div class="optgroup-header" data-group="${escape(data.value)}">
            ${escape(data.label)}
          </div>`
        },
        
        // Render option
        option: function(data, escape) {
          return `<div class="option">
            ${escape(data.text)}
          </div>`
        },
        
        // Render item (selected)
        item: function(data, escape) {
          return `<div class="item">${escape(data.text)}</div>`
        }
      }
    })

    // Apply custom styles
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

    // ✅ เช็คว่าควร disable ตั้งแต่เริ่มหรือไม่
    if (props.disabled) {
      tomSelectInstance.disable()
    }

    console.log('✅ TomSelect initialized')
    console.log('   Optgroups:', tomSelectInstance.optgroups)
    console.log('   Options count:', Object.keys(tomSelectInstance.options).length)
  }
})

/**
 * ✅ Cleanup
 */
onBeforeUnmount(() => {
  if (tomSelectInstance) {
    tomSelectInstance.destroy()
    tomSelectInstance = null
  }
})
</script>

<style>
/* ✅ TomSelect Dropdown */
.ts-dropdown {
  z-index: 9999 !important;
  @apply rounded-xl shadow-lg border border-gray-200;
  max-height: 400px;
  overflow-y: auto;
  background: white;
}

/* ✅ Option styles */
.ts-dropdown .option {
  @apply text-sm text-slate-700 py-2 px-3 cursor-pointer transition-colors;
  background: white;
}

.ts-dropdown .option:hover,
.ts-dropdown .option.active {
  @apply bg-blue-50;
}

/* ✅ Optgroup Header - สำคัญมาก! */
.ts-dropdown .optgroup-header {
  @apply font-semibold text-sm py-2.5 px-3;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  color: #475569;
  letter-spacing: 0.025em;
  background: linear-gradient(to right, #f1f5f9, #f8fafc);
  border-bottom: 2px solid #cbd5e1;
  cursor: default !important;
  pointer-events: none;
}

/* ✅ แยกสีตามกลุ่ม - ใช้ data-group */
.ts-dropdown .optgroup-header[data-group="income"] {
  background: linear-gradient(to right, #d1fae5, #a7f3d0);
  border-bottom-color: #86efac;
  color: #047857;
}

.ts-dropdown .optgroup-header[data-group="receivable"] {
  background: linear-gradient(to right, #fed7aa, #fde68a);
  border-bottom-color: #fbbf24;
  color: #c2410c;
}

/* ✅ Optgroup container */
.ts-dropdown .optgroup {
  position: relative;
}

/* ✅ เพิ่ม indent ให้ options ภายใน group */
.ts-dropdown .optgroup .option {
  @apply pl-6;
}

/* ✅ เส้นแบ่งระหว่างกลุ่ม */
.ts-dropdown .optgroup + .optgroup {
  border-top: 3px solid #e2e8f0;
  margin-top: 0;
}

/* ✅ Hover effect (ยกเว้น header) */
.ts-dropdown .optgroup-header:hover {
  opacity: 1;
}

/* ✅ Control (input box) */
.ts-control {
  min-height: 2.70rem !important;
}

.ts-control input {
  @apply text-sm;
}

/* ✅ Selected item */
.ts-control .item {
  @apply text-sm text-slate-700;
}
</style>