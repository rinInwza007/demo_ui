<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#ffffff]">
    <!-- Navbar / second navbar -->
    <Navbar class="fixed top-0 left-0 w-full z-50" />
    <SecondNavbar class="fixed top-16 left-0 w-full z-40" />

    <!-- container หลัก -->

        <div class="mt-32">
          กองทุน *
          <Selects
            v-model="category"
            :options="['กอง1', 'กอง2', 'กอง3', 'กอง4']"
            placeholder="เลือกหมวดหมู่"
            value-type="string"
          />
        </div>
      <!-- action buttons -->
      <section class="mt-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mx-20 ">
          <div>
            <div class="flex flex-col gap-1.5">
              <span>ข้าพเจ้า *</span>
              <input class="border border-gray-500 rounded-md h-10 shadow-md  shadow-gray-500" type="text" />
            </div>
          </div>
          <div>
            <div class="flex flex-col gap-1.5">
              <span>เบอร์โทรติดต่อ *</span>
              <input class="border border-gray-500 rounded-md h-10 shadow-md  shadow-gray-500" type="text" />
            </div>
          </div>
          <div>
            <div class="flex flex-col gap-1.5">
              <span>สังกัด *</span>
              <div class="flex flex-col gap-0.5">
                <input class="border border-gray-500 rounded-md h-10 shadow-md  shadow-gray-500" type="text" />
              </div>
            </div>
          </div>
          <div>
            <div class="flex flex-col gap-1.5">
              <span>กองทุน *</span>
              <input class="border border-gray-500 rounded-md h-10 shadow-md  shadow-gray-500" type="text" />
            </div>
          </div>
          <div>
            <div class="flex flex-col gap-1.5">
              <span>ขอนำส่งเงิน *</span>
              <input class="border border-gray-500 rounded-md h-10 shadow-md  shadow-gray-500" type="text" />
            </div>
          </div>
          <div>
            <div class="flex flex-col gap-1.5">
              <span>รหัสโครงงาน *</span>
              <input class="border border-gray-500 rounded-md h-10 shadow-md  shadow-gray-500" type="text" />
            </div>
          </div>
          <div>
            <div class="flex flex-col gap-1.5">
              <span>รหัสโครงงาน *</span>
              <input class="border border-gray-500 rounded-md h-10 shadow-md  shadow-gray-500" type="text" />
            </div>
          </div>

        </div>
      </section>
      <div class="mt-6 flex justify-end gap-3">
        <button class="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-green-300">
          บันทึก
        </button>
        <button class="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-red-300">กลับ</button>
      </div>
    </div>
  </template>

<script setup>
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import Selects from '@/components/input/select.vue'
</script>


<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

body, * {
  font-family: 'Kanit', sans-serif;
}
</style>
