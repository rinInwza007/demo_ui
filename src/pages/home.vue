<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#061322]">

    <!-- Navbar -->
    <Navbar />

    <!-- second navbar -->
    <SecondNavbar class="mt-6" />

<div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-white">
          ใบนำส่ง
        </h1>

        <!-- ปุ่มเพิ่ม -->
        <button
          @click="onCreate"
          class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          เพิ่มใบนำส่ง
        </button>

    <!-- ✅ แถบ Filter + Search (ชิดซ้าย เริ่มจากขอบจอ) -->
    <div class="w-full px-4 py-4 bg-white dark:bg-[#0c1427] shadow-sm mt-20">
      <div class="flex flex-wrap gap-4 items-end">

        <Selects
          v-model="selectedDay"
          :options="days"
          label="วัน/เดือน/ปี"
          placeholder="- 1/1/68 -"
          value-type="string"
          class="w-[180px]"
        />

        <Selects
          v-model="selectedOrg"
          :options="orgs"
          label="หน่วยงาน"
          placeholder="หน่วยงาน -"
          value-type="string"
          class="w-[180px]"
        />

        <!-- search -->
        <Search class="w-[250px]" />

      </div>
    </div>
    </div>

    <!-- content container (ส่วนอื่นยังอยู่กึ่งกลางเหมือนเดิม) -->
    <div class="max-w-6xl mx-auto px-4 py-8">

      <!-- header -->


      <!-- list table -->
      <div class="p-4 bg-white dark:bg-[#071029] rounded-lg shadow-sm">
        <List
          :items="items"
          @view="onView"
          @edit="onEdit"
          @delete="onDelete"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import Selects from '@/components/input/select.vue'
import Search from '@/components/input/search.vue'
import List from '@/components/list/List.vue'
import { ref } from 'vue'

const selectedDay = ref('')
const selectedOrg = ref('')

const days = ['1/1/68', '2/1/68', '3/1/68']
const orgs = ['คณะ ICT', 'โรงพยาบาล', 'หน่วยงานกลาง']

function onCreate() {}
function onView() {}
function onEdit() {}
function onDelete() {}
</script>
