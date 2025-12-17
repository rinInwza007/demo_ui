<template>
  <div :class="['mb-[6px] md:mb-[8px]', classes]">
    <label class=" font-medium block text-gray-500 dark:text-gray-200">
      {{ label }}
    </label>

    <!-- input ปกติ -->
    <input
      v-if="type !== 'textarea'"
      type="text"
      :placeholder="placeholder"
      v-model="modelValueLocal"
      @input="$emit('update:modelValue', modelValueLocal)"
      class="glass-input w-full text-sm text-slate-700 appearance-none cursor-pointer
             py-2.5 rounded-xl pr-10 focus:outline-none
             focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
             hover:shadow-md transition-all px-2 "
    />

    <!-- textarea -->
    <textarea
      v-else
      :placeholder="placeholder"
      :class="baseTextareaClass"
      v-model="modelValueLocal"
      @input="$emit('update:modelValue', modelValueLocal)"
    ></textarea>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  type: String,
})
const modelValueLocal = ref(props.modelValue || '')

const baseTextareaClass =
  'h-36 rounded-md text-black dark:text-white border border-gray-200 p-4 w-full outline-none transition-all placeholder:text-gray-500 focus:border-primary-500 resize-vertical'
</script >
