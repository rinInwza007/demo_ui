<template>
  <div>
    <label v-if="label" >
      {{ label }}
    </label>

    <select
      :value="modelValueString"
      @change="onChange"
      class="h-[44px] rounded-md border border-gray-500 px-[18px] block w-full
             outline-none cursor-pointer transition-all focus:border-gray-700 focus:ring-1 focus:ring-gray-700 "
    >
      <!-- ถ้ามี placeholder -->
      <option v-if="placeholder" value="">{{ placeholder }}</option>

      <!-- options -->
      <option
        v-for="(opt, idx) in options"
        :key="idx"
        :value="getOptionValueString(opt)"
      >
        {{ getOptionLabel(opt) }}
      </option>
    </select>
  </div>
</template>


<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { required: false }, // support v-model
  options: { type: Array, default: () => [] }, // array of strings/numbers or objects
  optionLabel: { type: String, default: 'label' }, // key for label if object
  optionValue: { type: String, default: 'value' }, // key for value if object
  placeholder: { type: String, default: '-' },
  label: { type: String, default: '' },
  valueType: { type: String, default: 'string' }, // 'string' or 'number'
})

const emit = defineEmits(['update:modelValue'])

// helper: return display label for an option
function getOptionLabel(opt) {
  if (opt === null || opt === undefined) return ''
  if (typeof opt === 'string' || typeof opt === 'number') return String(opt)
  // object
  return String(opt[props.optionLabel] ?? '')
}

// helper: return value (typed) for an option
function getOptionValue(opt) {
  if (opt === null || opt === undefined) return ''
  if (typeof opt === 'string' || typeof opt === 'number') {
    return props.valueType === 'number' ? Number(opt) : String(opt)
  }
  // object
  const raw = opt[props.optionValue] ?? ''
  return props.valueType === 'number' ? Number(raw) : String(raw)
}

// since native <select> deals with strings, we convert modelValue to string for binding
const modelValueString = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) return ''
  // if valueType is number, convert to string for matching option's value attr
  return String(props.modelValue)
})

// converts option to string for :value attr
function getOptionValueString(opt) {
  const v = getOptionValue(opt)
  return v === null || v === undefined ? '' : String(v)
}

function onChange(e) {
  let v = e.target.value
  if (props.valueType === 'number') {
    const n = Number(v)
    v = Number.isNaN(n) ? v : n
  }
  emit('update:modelValue', v)
}
</script>
