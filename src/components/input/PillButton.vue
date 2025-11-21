<template>
  <button
    type="button"
    @click="$emit('click')"
    class="relative overflow-hidden group
           inline-flex items-center justify-center gap-3
           h-[44px] px-3  rounded-xl
           bg-purple-550 text-gray-800 shadow-md
           hover:text-white hover:border-purple-600
           transition-all duration-300"
  >
    <!-- sweep background -->
    <span
      class="absolute inset-0 bg-purple-400 translate-x-[-100%]
             group-hover:translate-x-0
             transition-all duration-500 ease-out"
    ></span>

    <!-- icon -->
    <span v-if="$slots.icon" class="flex items-center relative z-10">
      <slot name="icon" />
    </span>

    <!-- label -->
    <span class="text-base font-medium flex items-center relative z-10">
      <slot />
    </span>
  </button>
</template>
