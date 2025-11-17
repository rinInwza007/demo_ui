<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
    >
      <div class="bg-white w-full max-w-md rounded-xl p-5 shadow-lg">
        <h3 class="text-lg font-semibold mb-3">เลือกประเภทของรายการ</h3>

        <div class="gap-3 max-h-80 overflow-y-auto">
<div
  v-for="(item, index) in items"
  :key="index"
  class="flex flex-col mb-3 border-b pb-3"
>
  <label class="flex items-center gap-2">
    <input type="checkbox" v-model="item.checked" class="w-4 h-4" />
    <span>{{ item.name }}</span>
  </label>

  <!-- แสดงเฉพาะตอนติ๊ก -->
  <template v-if="item.checked">

    <!-- เช็คธนาคาร: เอาเลขที่เช็คไว้ด้านบน -->
    <template v-if="item.NumCheck !== undefined">
      <input
        type="text"
        v-model="item.NumCheck"
        placeholder="เลขที่เช็ค"
        class="border px-2 py-1 rounded w-full mt-2"
      />

      <input
        type="number"
        v-model="item.amount"
        placeholder="จำนวนเงิน"
        class="border px-2 py-1 rounded w-full mt-2"
      />
    </template>

    <!-- ฝากเข้าบัญชี -->
    <template v-else-if="item.AccountNum !== undefined">
      <input
        type="text"
        v-model="item.AccountNum"
        placeholder="เลขบัญชี"
        class="border px-2 py-1 rounded w-full mt-2"
      />
      <input
        type="text"
        v-model="item.AccountName"
        placeholder="ชื่อบัญชี"
        class="border px-2 py-1 rounded w-full mt-2"
      />
      <input
        type="number"
        v-model="item.amount"
        placeholder="จำนวนเงิน"
        class="border px-2 py-1 rounded w-full mt-2"
      />
    </template>

    <!-- เงินสด -->
    <template v-else>
      <input
        type="number"
        v-model="item.amount"
        placeholder="จำนวนเงิน"
        class="border px-2 py-1 rounded w-full mt-2"
      />
    </template>

  </template>
</div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
          <button class="px-4 py-2 bg-gray-300 rounded" @click="closeModal">ปิด</button>
          <button class="px-4 py-2 bg-blue-500 text-white rounded" @click="confirmSelection">
            เลือก
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive } from 'vue'


// Props & Emits
// eslint-disable-next-line no-unused-vars
const props = defineProps({ 
  show: Boolean,
  items: Array
})
const emit = defineEmits(['close', 'update:selected'])

// fix state ของ checkbox และ amount ไว้ที่ modal เลย
const confirmSelection = () => {
  const selected = props.items.filter(i => i.checked).map(i => ({...i}))
  emit('update:selected', selected)
  emit('close')
}

// ฟังก์ชั่นปิด + รีเซ็ตข้อมูล
const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
