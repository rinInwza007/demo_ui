<template>
  <div class="tomselect-container">
    <select
      :id="inputId"
      v-model="localValue"
      class="w-full px-2 text-sm "
    >
      <option value=""></option>
      <option value="ค่าบริการทางการแพทย์ (สปสช)">ค่าบริการทางการแพทย์ (สปสช)</option>
      <option value="ค่าบริการทางการแพทย์ (กรมบัญชีกลาง)">ค่าบริการทางการแพทย์ (กรมบัญชีกลาง)</option>
      <option value="ค่าบริการทางการแพทย์ (ประกันสังคม)">ค่าบริการทางการแพทย์ (ประกันสังคม)</option>
      <option value="ค่าบริการทางการแพทย์ (อื่นๆ)">ค่าบริการทางการแพทย์ (อื่นๆ)</option>
      <option value="ค่าบริการทางการแพทย์ (อื่นๆสิทธิ - ค้างชำระ)">ค่าบริการทางการแพทย์ (อื่นๆสิทธิ - ค้างชำระ)</option>
      <option value="ค่าบริการทางการแพทย์ (สปสช) เหมาจ่าย">ค่าบริการทางการแพทย์ (สปสช) เหมาจ่าย</option>
      <option value="ค่าบริการทางการแพทย์ (ประกันสังคม) เหมาจ่าย">ค่าบริการทางการแพทย์ (ประกันสังคม) เหมาจ่าย</option>
    </select>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import TomSelect from 'tom-select'

const props = defineProps({
  modelValue: String,
  inputId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'input'])

const localValue = ref(props.modelValue)
let tomSelectInstance = null

watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
  if (tomSelectInstance && tomSelectInstance.getValue() !== newVal) {
    tomSelectInstance.setValue(newVal || '', true)
  }
})

watch(localValue, (newVal) => {
  emit('update:modelValue', newVal)
  emit('input', newVal)
})

onMounted(() => {
  const el = document.getElementById(props.inputId)

  if (el && !el.tomselect) {
    tomSelectInstance = new TomSelect(el, {
      create: true,
      placeholder: 'ระบุรายการ',
      allowEmptyOption: true,
      onChange(value) {
        localValue.value = value
      }
    })

    // Apply CSS
    const control = tomSelectInstance.control
    control.style.height = '2.5rem'
    control.style.width = '100%'
    control.style.padding = '0 0.5rem'
    control.style.display = 'flex'
    control.style.alignItems = 'center'
    control.style.borderRadius = '0.375rem'
    control.style.border = '1px solid #6b7280'
    control.style.fontSize = '1rem'

    const input = control.querySelector('input')
    if (input) {
      input.style.fontSize = '1.01rem'
      input.style.height = '1rem'
      input.style.padding = '0.5rem'
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
