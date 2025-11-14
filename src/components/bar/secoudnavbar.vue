<template>
  <nav class="fixed top-0 left-0 w-full z-50 bg-pink-100 shadow-md">

  <div class="grid max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- ความสูงของ bar -->
    <div class="flex items-center justify-between h-16">

      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center justify-between w-full gap-8">

        <a href="#"
           class="text-blue-600 font-medium hover:text-pink-700 transition">
          เพิ่มใบนำส่งใหม่
        </a>

        <a href="#"
           class="text-blue-600 font-medium hover:text-pink-700 transition">
          ใบนำส่งที่อยู่ในขั้นตอนดำเนินงาน
        </a>

        <a href="#"
           class="text-blue-600 font-medium hover:text-pink-700 transition">
          รายการผลการนำส่ง
        </a>

      </div>

    </div>

  </div>

</nav>

</template>

<script setup>



</script>

<style scoped>
.nav-link {
  @apply text-gray-700 hover:text-blue-600 font-medium transition duration-150;
}


</style>
