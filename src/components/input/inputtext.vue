<template>
  <div :class="['mb-[6px] md:mb-[8px]', classes]">
    <label class="mb-2 font-medium block text-gray-700 dark:text-gray-200">
      {{ label }}
    </label>

    <!-- input ปกติ -->
    <input
      v-if="type !== 'textarea'"
      :placeholder="placeholder"
      :class="baseInputClass"
      v-model="modelValueLocal"
      @input="$emit('update:modelValue', modelValueLocal)"
      type="text"
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
const baseInputClass =
  'h-14 rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 w-full outline-none transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500'

const baseTextareaClass =
  'h-36 rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] p-4 w-full outline-none transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500 resize-vertical'
</script>

<style scoped></style>
