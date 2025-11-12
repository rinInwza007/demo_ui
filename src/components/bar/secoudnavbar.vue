<template>
  <nav class="bg-pick shadow-md fixed top-0 left-0 w-full z-50 text-blue-600">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo / Brand -->

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center justify-between w-full mt-8">
          <a href="#" class="nav-link">เพิ่มใบนำส่งใหม่</a>
          <a href="#" class="nav-link">ใบนำส่งที่อยู่ในขั้นตอนดำเนินงาน</a>
          <a href="#" class="nav-link">รายการผลการนำส่ง</a>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden flex items-center">
          <button @click="toggleMenu">
            <svg
              class="w-7 h-7 text-gray-700"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isOpen" class="md:hidden bg-white border-t">
      <a href="#" class="mobile-nav-link">Home</a>
      <a href="#" class="mobile-nav-link">About</a>
      <a href="#" class="mobile-nav-link">Services</a>
      <div class="p-4">
        <button class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg">Sign In</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
const isOpen = ref(false)
const toggleMenu = () => (isOpen.value = !isOpen.value)
</script>

<style scoped>
.nav-link {
  @apply text-gray-700 hover:text-blue-600 font-medium transition duration-150;
}

.mobile-nav-link {
  @apply block px-4 py-2 text-gray-700 hover:bg-gray-100;
}
</style>
