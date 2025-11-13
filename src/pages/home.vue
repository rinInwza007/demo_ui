<template>
  <div>
    <Navbar class="fixed top-0 left-0 w-full z-50" />
    <SecondNavbar class="fixed top-16 left-0 w-full z-40" />


     <main class="pt-32 px-6 mt-10">
      <h1 class="text-4xl font-extrabold text-gray-900 mb-6 mx-auto text-left ">
        ใบนำส่งเงิน
      </h1>
    </main>
    <div>
    <div class="mb-4">
          <Select
            v-model="category"
            :options="['11/11/2025-12/12/2025','11/11/2025-12/12/2025','11/11/2025-12/12/2025','11/11/2025-12/12/2025']"
            label=""
            placeholder="11/11/2025-12/12/2025"
            value-type="time"
          />
        </div>
        <div class="mb-4">
          <Select
            v-model="category"
            :options="['กองแผน','กองคลัง','โรงพยาบาลมอพะเยา']"
            label=""
            placeholder="หน่วยงาน"
            value-type="string"
          />
        </div>
        <div>
          <search />
        </div>
        <div class="flex flex-wrap gap-4">
    <phillbutton
      v-for="btn in actions"
      :key="btn.key"
      @click="btn.handler"
    >
      <template #icon>{{ btn.icon }}</template>
      {{ btn.label }}
    </phillbutton>
  </div>
        </div>

  </div>
</template>

<script setup>
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import Select from '@/components/input/select.vue';
import search from '@/components/input/search.vue';
import phillbutton from '@/components/input/PillButton.vue'

const actions = [
  { key: 'export', label: 'export',  handler: () => {/*...*/} },
  { key: 'main', label: 'ใบนำส่ง',  handler: () => {/*...*/} },
  { key: 'research', label: 'ใบนำส่งวิจัย',  handler: () => {/*...*/} },
  { key: 'debtor', label: 'ใบนำส่งลูกหนี้',  handler: () => {/*...*/} },
]

</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

body, * {
  font-family: 'Kanit', sans-serif;
}
</style>



