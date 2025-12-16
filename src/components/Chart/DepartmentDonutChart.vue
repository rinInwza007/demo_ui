<template>
  <div class="relative flex items-center justify-center">
    <apexchart
      type="donut"
      :width="size"
      :options="chartOptions"
      :series="series"
    />
    <!-- Center Text -->
    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span class="text-xs text-slate-500">{{ centerLabel }}</span>
      <span class="text-xl font-bold text-slate-800">{{ centerValue }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  labels: string[]
  series: number[]
  size?: number
  centerLabel?: string
  centerValue?: string
}
const props = withDefaults(defineProps<Props>(), {
  size: 220,
  centerLabel: 'Total',
  centerValue: '100%',
})

const chartOptions = computed(() => ({
  chart: {
    fontFamily: "Inter, Prompt, sans-serif",
  },
  labels: props.labels,
  legend: { show: false },
  stroke: { width: 0 },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: { size: '75%' }
    }
  },
  tooltip: {
    y: { formatter: (val: number) => `${val}%` }
  }
}))
</script>
