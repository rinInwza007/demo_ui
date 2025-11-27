<template>
  <div class="dropdown relative inline-flex" ref="dropdownRef">
    <!-- ปุ่มเปิด dropdown -->
    <button
      id="dropdown-filter"
      type="button"
      class="dropdown-toggle btn btn-primary btn-square"
      @click="toggleDropdown"
    >
      <span class="material-symbols-outlined text-[22px] leading-none">
        filter_list
      </span>
    </button>

    <!-- เมนู -->
    <ul
      v-show="open"
      class="dropdown-menu min-w-56 bg-white shadow-lg rounded-md p-2 absolute mt-2 z-50"
    >
      <!-- ทั้งหมด -->
      <li>
        <button
          class="dropdown-item w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center gap-2"
          @click="selectFilter('all')"
        >
          <span class="material-symbols-outlined text-[20px]"> list </span>
          <span>ทั้งหมด</span>
        </button>
      </li>

      <!-- เสร็จแล้ว -->
      <li>
        <button
          class="dropdown-item w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center gap-2"
          @click="selectFilter('done')"
        >
          <span class="material-symbols-outlined text-[20px] text-green-600">
            check_circle
          </span>
          <span>เสร็จแล้ว</span>
        </button>
      </li>

      <!-- ยังไม่เสร็จ -->
      <li>
        <button
          class="dropdown-item w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center gap-2"
          @click="selectFilter('pending')"
        >
          <span class="material-symbols-outlined text-[20px] text-red-500">
            schedule
          </span>
          <span>ยังไม่เสร็จ</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const open = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

// เปิด/ปิด dropdown
const toggleDropdown = () => {
  open.value = !open.value;
};

// เลือก filter
const selectFilter = (value: "all" | "done" | "pending") => {
  console.log("เลือก:", value); // 👈 ทดสอบก่อน
  open.value = false;

  // ส่ง event ออกไปให้ parent ใช้ v-model หรือ @change ก็ได้
  emit("change", value);
};

// ปิด dropdown เมื่อคลิกข้างนอก
const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    open.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// emit event
const emit = defineEmits<{
  (e: "change", value: string): void;
}>();
</script>
