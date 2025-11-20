<template>
  <nav class="flex items-center justify-center gap-2 mt-4">
    <!-- Prev -->
    <button
      class="px-3 py-1 border rounded disabled:opacity-50"
      :disabled="page === 1"
      @click="page--"
    >
      Prev
    </button>

    <!-- Numbers -->
    <button
      v-for="n in totalPages"
      :key="n"
      @click="page = n"
      class="px-3 py-1 border rounded"
      :class="page === n ? 'bg-blue-600 text-white' : ''"
    >
      {{ n }}
    </button>

    <!-- Next -->
    <button
      class="px-3 py-1 border rounded disabled:opacity-50"
      :disabled="page === totalPages"
      @click="page++"
    >
      Next
    </button>
  </nav>
</template>

<script setup>
import { ref } from "vue"

const page = ref(1)
const totalPages = 5
</script>
