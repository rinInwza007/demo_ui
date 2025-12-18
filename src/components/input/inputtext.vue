<template>
  <div :class="['mb-[6px] md:mb-[8px]', classes]">
    <label class="font-medium block mb-1 text-slate-600 dark:text-slate-200">
      {{ label }}
    </label>

    <!-- input ปกติ -->
    <input
      v-if="type !== 'textarea'"
      type="text"
      :placeholder="placeholder"
      v-model="modelValueLocal"
      @input="$emit('update:modelValue', modelValueLocal)"
      class="glass-input w-full text-sm text-slate-700 appearance-none cursor-pointer
             py-2.5 rounded-xl pr-10 focus:outline-none
             focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
             hover:shadow-md transition-all px-2 "
    />

    <!-- textarea -->
    <textarea
      v-else
      :placeholder="placeholder"
      v-model="modelValueLocal"
      @input="$emit('update:modelValue', modelValueLocal)"
      :class="[glassInputClass, 'h-36 resize-vertical py-3']"
    ></textarea>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  classes: { type: [String, Array, Object], default: '' },
})

const emit = defineEmits(['update:modelValue'])

const modelValueLocal = ref(props.modelValue)

// กันเคส parent เปลี่ยนค่าแล้ว input ไม่อัปเดต
watch(
  () => props.modelValue,
  (v) => (modelValueLocal.value = v ?? '')
)

const glassInputClass =
  `
  w-full rounded-xl px-3 py-2.5 text-sm
  text-slate-800 dark:text-slate-100
  placeholder:text-slate-400 dark:placeholder:text-slate-400/70

  bg-white/35 dark:bg-slate-900/30
  backdrop-blur-xl

  border border-white/50 dark:border-white/10
  shadow-[0_8px_30px_rgba(15,23,42,0.10)]

  outline-none transition
  hover:bg-white/45 dark:hover:bg-slate-900/40

  focus:border-blue-400/60 dark:focus:border-blue-300/40
  focus:ring-2 focus:ring-blue-400/25 dark:focus:ring-blue-300/20
  `
</script>
