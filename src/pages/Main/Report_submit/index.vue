<template>
  <div>
    <!-- Navbar -->
    <Navbar />

    <!-- Second Navbar -->
    <SecondNavbar />

    <Pieshade />

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";

import Navbar from "@/components/bar/navbar.vue";
import SecondNavbar from "@/components/bar/secoudnavbar.vue";
import Pieshade from "@/components/Chart/Pie/index.vue";


export default defineComponent({
  name: "BasicPieChart",

  components: {
    Navbar,
    SecondNavbar,
    Pieshade,
  },


});
</script>

