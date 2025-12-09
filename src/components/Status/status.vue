<template>
  <span
    class="px-4 py-1.5 rounded-full text-sm font-semibold border"
    :class="badgeClass"
  >
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
  }
})

const statusLabelMap: Record<string, string> = {
  pending: "ยังไม่ส่ง",
  review: "รอตรวจสอบ",
  completed: "เสร็จสิ้น",
}

const badgeClass = computed(() => {
  switch (props.status) {
    case "pending":
      return "bg-red-700/50 text-red-700 border-red-700/30"
    case "review":
      return "bg-yellow-700/50 text-yellow-700 border-yellow-700/30"
    case "completed":
      return "bg-green-700/50 text-green-700 border-green-700/30"
    default:
      return "bg-gray-400/30 text-gray-700 border-gray-400/40"
  }
})

const statusLabel = computed(() => statusLabelMap[props.status] || props.status)
</script>
