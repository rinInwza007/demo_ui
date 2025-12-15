<template>
  <div class="glass-card p-5">
    <div v-if="title" class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-slate-800">{{ title }}</h3>
      <slot name="actions" />
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>()
</script>
