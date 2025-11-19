<template>
  <div
    class="trezo-card bg-white  p-[20px] md:p-[25px] rounded-md"
  >
    <div class="trezo-card-content">
      <ul
  class="navs mb-[20px] border-b border-gray-200  grid grid-cols-4 ml-16"
>
  <!-- เพิ่มใบนำส่งใหม่ -->
  <li>
    <RouterLink
      to="/waybill"
      class="tab-link"
    >
      เพิ่มใบนำส่งใหม่
    </RouterLink>
  </li>

  <!-- ใบนำส่งที่อยู่ในขั้นตอนดำเนินงาน -->
  <li>
    <RouterLink
      to="/"
      class="tab-link"
    >
      ใบนำส่งที่อยู่ในขั้นตอนดำเนินงาน
    </RouterLink>
  </li>

  <!-- รายการผลการนำส่ง -->
  <li>
    <RouterLink
      to="/"
      class="tab-link"
    >
      รายการผลการนำส่ง
    </RouterLink>
  </li>

  <!-- บันทึกลูกหนี้ -->
  <li>
    <RouterLink
      to="/savedebtor"
      class="tab-link"
    >
      บันทึกลูกหนี้
    </RouterLink>
  </li>
</ul>

    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
/* สไตล์พื้นฐานของแท็บ */
.tab-link {
  @apply block pb-2 font-medium transition-all border-b-2 border-transparent text-gray-500 hover:text-blue-600;
}

/* เวลา active → ให้เส้นอยู่เฉพาะข้อความ */
:deep(.router-link-exact-active.tab-link) {
  @apply text-blue-600 border-blue-600;
}
</style>
