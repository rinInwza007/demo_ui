<template>
  <div class="mt-6 flex justify-end mb-4">
  <button class="px-6 py-2 rounded-md bg-gray-600 text-white mr-5 btn-grow-shadow">
    กลับ
  </button>
</div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.btn-grow-shadow {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.btn-grow-shadow:hover {
  transform: scale(1.06);
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
  background-color: #b91c1c; /* โทนแดง hover */
}
</style>
