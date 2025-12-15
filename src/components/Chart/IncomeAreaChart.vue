<template>
  <apexchart
    type="area"
    height="300"
    :options="chartOptions"
    :series="series"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  categories: string[]
  values: number[]
}
const props = defineProps<Props>()

const series = computed(() => [
  { name: 'Revenue (THB)', data: props.values }
])

const chartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "Inter, Prompt, sans-serif",
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0,
      stops: [0, 100],
    }
  },
  xaxis: {
    categories: props.categories,
    labels: { style: { colors: '#64748b' } }
  },
  yaxis: {
    labels: {
      style: { colors: '#64748b' },
      formatter: (val: number) => `฿ ${Math.round(val).toLocaleString()}`
    }
  },
  grid: {
    borderColor: 'rgba(0,0,0,0.06)',
    strokeDashArray: 3
  },
  tooltip: {
    y: { formatter: (val: number) => `฿ ${val.toLocaleString()}` }
  },
  legend: { show: false }
}))
</script>
