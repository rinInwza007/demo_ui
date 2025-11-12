<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#061022]">
    <!-- Navbar / second navbar -->
    <Navbar />
    <SecondNavbar class="mt-8" />

    <!-- container หลัก -->
    <div class="max-w-4xl mx-auto p-6 pt-8 mt-20">
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
        <button class="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-red-400">กลับ</button>
      </div>
    </div>

    <div>
    <inputAdd />
    </div>
  <div class="p-6">
    <button @click="show = true" class="px-4 py-2 bg-blue-600 text-white rounded">เลือกหลายกองทุน</button>

    <div class="mt-4">
      ค่าเลือก: <span v-if="selectedList.length">{{ selectedList.join(', ') }}</span><span v-else>-</span>
    </div>

    <PopupList
      v-model:visible="show"
      v-model:selected="selectedList"
      :items="funds"
      option-label="name"
      option-value="id"
      title="เลือกกองทุน (หลายค่า)"
      :multiple="true"
    />
  </div>
  </div>

</template>

<script setup>
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import inputtext from '@/components/input/inputtext.vue'
import Selects from '@/components/input/select.vue'
import inputAdd from '@/components/input/input+add.vue'
import PopupList from '@/components/bar/listpopup.vue'
import { ref } from 'vue'

const show = ref(false)
const selectedList = ref([]) // array for multi-select

const funds = [
  { id: 'F001', name: 'กองทุน A' },
  { id: 'F002', name: 'กองทุน B' },
  { id: 'F003', name: 'กองทุน C' },
  'Other' // also supports primitives
]

</script>

<style scoped></style>
