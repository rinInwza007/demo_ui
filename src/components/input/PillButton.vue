<template>
  <button
    type="button"
    @click="$emit('click')"
    class="inline-flex items-center gap-2 rounded-full px-5 py-2.5
           bg-purple-550 text-purple-500 shadow-md hover:bg-purple-300
           transition shadow-purple-100"
  >
    <!-- icon -->
    <span v-if="$slots.icon" class="flex items-center justify-center text-xl">
      <slot name="icon" />
    </span>

    <!-- label -->
    <span class="text-base font-medium">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">

</script>
