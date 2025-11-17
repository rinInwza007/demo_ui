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
      class="border w-full border-gray-500 rounded-md h-10 shadow-md shadow-gray-500 px-2 text-xs placeholder:text-xs"
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
  'h-36 rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] p-4 w-full outline-none transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500 resize-vertical'
</script >
