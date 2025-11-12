<template>
  <form class="relative w-[250px] lg:w-[260px]">
    <input
      type="text"
      placeholder="ค้นหา"
      class="bg-gray-50 border border-gray-300 h-[44px] rounded-md w-full block text-black
             pt-[11px] pb-[12px] px-[13px] md:px-[16px] placeholder:text-gray-500 outline-0
             focus:ring-2 focus:ring-blue-400 focus:border-blue-400
             dark:bg-[#15203c] dark:text-white dark:border-[#15203c] dark:placeholder:text-gray-400"
    />



  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SearchFrom",
});
</script>
