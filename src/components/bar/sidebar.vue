<template>
  <div>
    <!-- ปุ่มเปิด -->
    <button @click="open = true" class="p-2">
      ☰
    </button>

    <!-- Overlay -->
    <Transition>
      <div
        v-if="open"
        class="fixed inset-0 bg-black/40"
        @click="open = false"
      ></div>
    </Transition>

    <!-- Sidebar -->
    <Transition>
      <div
        v-if="open"
        class="fixed top-0 left-0 w-64 h-full bg-white shadow-xl p-4"
      >
        <h2 class="text-xl font-bold mb-4">เมนู</h2>
        <ul class="space-y-2">
          <li><a href="#" class="block p-2 hover:bg-gray-100 rounded">หน้าแรก</a></li>
          <li><a href="#" class="block p-2 hover:bg-gray-100 rounded">เพิ่มข้อมูล</a></li>
          <li><a href="#" class="block p-2 hover:bg-gray-100 rounded">เกี่ยวกับ</a></li>
        </ul>

        <button @click="open = false" class="mt-4 text-red-500">ปิด</button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from "vue";

const open = ref(false);
</script>
