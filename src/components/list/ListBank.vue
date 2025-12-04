<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2">
        <span class="w-1 h-6 bg-green-500 rounded-full"></span>
        รายการธนาคาร
      </h2>

    </div>
    <div class="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-4">
      <div class="space-y-4">
        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-blue-300 transition-all duration-200">
                  <input
                    type="checkbox"
                    @change="handleInput"
                    class="w-5 h-5 rounded border-2 border-gray-300   cursor-pointer transition-all"
                  />
          <div class="flex justify-between items-center">
          นำฝากเข้าบัญชีกรุงไทย เลขที่บัญชี  671-2-90667-9
        <InputText/>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import InputText from '@/components/input/inputtext.vue'
</script>

