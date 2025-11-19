<template>
  <form class="relative w-[250px] lg:w-[260px]">
    <input
      type="text"
      placeholder="ค้นหา"
      class="bg-gray-50 border border-gray-300 h-[44px] w-full block
             text-black px-[13px] md:px-[16px]
             placeholder:text-gray-500 outline-0
             rounded-full"
    />
    <button
      type="button"
      class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 grid"
    >
     <span class="material-symbols-outlined hover:text-blue-700 grid">search</span>
    </button>
  </form>
</template>

<script lang="ts">
export default {
  name: "SearchForm",
};
</script>
