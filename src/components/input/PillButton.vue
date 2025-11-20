<template>
  <button
    type="button"
    @click="$emit('click')"
    class="inline-flex items-center justify-center gap-3
           h-[44px] px-3 border border-gray-500 rounded-xl
           bg-purple-550 text-gray-800 shadow-md
           hover:bg-purple-300 hover:text-purple-500 hover:border-gray-100
           transition"
  >
    <!-- icon -->
    <span v-if="$slots.icon" class="flex items-center">
      <slot name="icon" />
    </span>

    <!-- label -->
    <span class="text-base font-medium flex items-center">
      <slot />
    </span>
  </button>
</template>
