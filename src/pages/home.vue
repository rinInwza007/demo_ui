<template>
  <div class="min-h-screen flex flex-col items-center pt-20">
    <!-- ✅ Navbar -->
    <Navbar />

    <h1 class="text-4xl font-extrabold text-gray-800 dark:text-white mb-10">Bedged.up.ac.th</h1>

    <div class="grid grid-cols-5 gap-6">
      <!-- ✅ กล่องแรก -->
      <div
        class="bg-[#f5f7f8] dark:bg-[#15203c] text-[20px] h-[110px] w-[110px] flex items-center justify-center text-primary-500 rounded-md text-center font-bold cursor-pointer hover:bg-blue-100 duration-150"
      >
        โครงการ
      </div>

      <!-- ✅ ใบนำส่งเงิน (คลิกเพื่อไปหน้า createblade) -->
      <router-link
        to="/createblade"
        class="bg-[#f5f7f8] dark:bg-[#15203c] text-[20px] h-[110px] w-[110px] flex items-center justify-center text-primary-500 rounded-md text-center font-bold cursor-pointer hover:bg-blue-100 duration-150"
      >
        ใบนำส่งเงิน
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Navbar from '@/components/bar/navbar.vue'

const router = useRouter()
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

body, * {
  font-family: 'Kanit', sans-serif;
}
</style>
