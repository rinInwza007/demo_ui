<template>
  <form class="relative w-[250px] lg:w-[260px]">
    <input
      type="text"
      placeholder="ค้นหา"
      class="bg-gray-50 rounded-md border border-gray-500 h-[44px] rounded-full w-full block
             text-black px-[13px] md:px-[16px]
             placeholder:text-gray-500
             "
    />
    <button
  type="button"
  class="absolute top-1/2 right-3 -translate-y-1/2
         w-[32px] h-[32px] grid place-items-center
         text-gray-500 hover:text-gray-700"
>
  <span class="material-symbols-outlined text-[20px]">search</span>
</button>
  </form>
</template>


<script lang="ts">
export default {
  name: "SearchFrom",
};
</script>


