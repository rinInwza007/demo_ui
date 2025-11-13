<template>
  <form class="relative w-[250px] lg:w-[260px]">
    <input
      type="text"
      placeholder="ค้นหา"
      class="bg-gray-50 border border-gray-300 h-[44px] rounded-full w-full block
             text-black px-[13px] md:px-[16px]
             placeholder:text-gray-500 outline-0
             dark:bg-[#15203c] dark:text-white dark:border-[#15203c]
             dark:placeholder:text-gray-400"
    />

    <!-- ปุ่มไอคอนขวาสุด -->
    <button
      type="button"
      class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none"
           viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
           class="size-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
  </form>
</template>


<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SearchFrom",
});
</script>
