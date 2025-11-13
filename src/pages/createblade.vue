<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#061022]">
    <!-- Navbar / second navbar -->
    <Navbar class="fixed top-0 left-0 w-full z-50" />
    <SecondNavbar class="fixed top-16 left-0 w-full z-40" />

    <!-- container หลัก -->
    <div class="max-w-4xl mx-auto pt-32 px-6 mt-10">
      <!-- grid: mobile 1 col, md+ 2 cols -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- input fields (ใช้ component เดียวกันหลายครั้ง) -->
        <div>
          ข้าพเจ้า*
          <inputtext label="Example Input 1" placeholder="name@example.com" />
        </div>
        <div>
          เบอร์โทรติดต่อ *
          <inputtext label="Example Input 1" placeholder="name@example.com" />
        </div>
        <div>
          สังกัด *
          <inputtext label="Example Input 1" placeholder="name@example.com" />
        </div>
        <div class="mb-4">
          <Selects
            v-model="category"
            :options="['กอง1', 'กอง2', 'กอง3', 'กอง4']"
            label="กองทุน *"
            placeholder="เลือกหมวดหมู่"
            value-type="string"
          />
        </div>
        <div>
          ขอนำส่งเงิน*
          <div class="md:col-span-2">
            <inputtext label="Example Input 1" placeholder="name@example.com" />
          </div>
        </div>
        <div>
          รหัสโครงการ*
          <inputtext label="Example Input 1" placeholder="name@example.com" />
        </div>
      </div>

      <!-- action buttons -->
      <div class="mt-6 flex justify-end gap-3">
        <button class="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-green-300">
          บันทึก
        </button>
        <button class="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-red-300">กลับ</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import inputtext from '@/components/input/inputtext.vue'
import Selects from '@/components/input/select.vue'
</script>


<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

body, * {
  font-family: 'Kanit', sans-serif;
}
</style>
