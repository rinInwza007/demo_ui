<template>
  <!-- ⭐ Mobile: แสดง Prev / Next เท่านั้น -->
  <nav class="flex md:hidden items-center justify-center gap-4 mt-4 ">
    <button
      class="px-4 py-2 border rounded disabled:opacity-50"
      :disabled="page === 1"
      @click="page--"
    >
      Prev
    </button>

    <button
      class="px-4 py-2 border rounded disabled:opacity-50"
      :disabled="page === totalPages"
      @click="page++"
    >
      Next
    </button>
  </nav>

  <!-- ⭐ Desktop: Prev + หมายเลขหน้า + Next -->
  <nav class="hidden md:flex items-center justify-center gap-2 mt-4">
    <!-- Prev -->
    <button
      class="px-3 py-1 border rounded disabled:opacity-50"
      :disabled="page === 1"
      @click="page--"
    >
      Prev
    </button>

    <!-- Page Numbers -->
    <button
      v-for="n in totalPages"
      :key="n"
      @click="page = n"
      class="px-3 py-1 border rounded"
      :class="page === n ? 'bg-purple-600 text-white' : ''"
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

<style scoped>
@keyframes bob {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bob {
  animation: bob 0.5s ease-in-out infinite;
}
</style>
