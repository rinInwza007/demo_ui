<template>
  <span
    class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold border"
    :class="badgeClass"
  >
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ReceiptStatus = 'pending' | 'success'

const props = defineProps<{
  status: ReceiptStatus
}>()

const statusLabelMap: Record<ReceiptStatus, string> = {
  pending: 'ยังไม่ยืนยัน',
  success: 'ยืนยันแล้ว',
}

const badgeClass = computed(() => {
  switch (props.status) {
    case 'pending':
      return 'bg-red-500/10 text-red-700 border-red-500/30'
    case 'success':
      return 'bg-green-500/15 text-green-700 border-green-500/30'
  }
})

const statusLabel = computed(() => statusLabelMap[props.status])
</script>
