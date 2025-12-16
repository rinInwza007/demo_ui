<template>
  <div class="glass-panel rounded-2xl shadow-lg flex flex-col min-h-0">
    <!-- Header -->
    <div
      class="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/40 bg-white/20
             text-xs font-semibold text-slate-500 uppercase tracking-wider flex-shrink-0"
    >
      <div class="col-span-1 text-center">สถานะ</div>
      <div class="col-span-3">สังกัด</div>
      <div class="col-span-2">รายได้/โครงการ</div>
      <div class="col-span-1 text-center">ปีงบฯ</div>
      <div class="col-span-2">ผู้รับผิดชอบ</div>
      <div class="col-span-1 text-center">เวลาที่ส่ง</div>
      <div class="col-span-1">รูปแบบ</div>
      <div class="col-span-1 text-right">ยอดเงิน</div>
    </div>

    <!-- Body -->
    <div class="overflow-y-auto overflow-x-hidden flex-1 p-2 min-h-0">
      <div
        v-for="item in items"
        :key="item.id"
        class="group grid grid-cols-12 gap-4 px-4 py-4 mb-2 items-center rounded-xl
               hover:bg-white/50 transition-all duration-200 border border-transparent
               hover:border-white/50 hover:shadow-sm"
      >
        <!-- สถานะ -->
        <div class="col-span-1 flex justify-center">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-white/50"
            :class="item.isLocked ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'"
            :title="item.isLocked ? 'ล็อกแล้ว' : 'ยังไม่ล็อก'"
          >
            <i v-if="item.isLocked" class="ph-fill ph-check-circle text-lg"></i>
            <i v-else class="ph-fill ph-clock text-lg"></i>
          </div>
        </div>

        <!-- สังกัด + สังกัดย่อย -->
        <div class="col-span-3 min-w-0">
          <div class="font-medium text-slate-800 text-sm truncate">
            {{ item.org || '-' }}
          </div>

          <!-- ✅ สังกัดย่อย -->
          <div class="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 min-w-0">
            <i class="ph ph-buildings text-xs flex-shrink-0"></i>
            <span class="truncate">{{ item.subOrg1 || '-' }}</span>
          </div>
        </div>

        <!-- โครงการ -->
        <div class="col-span-2 min-w-0">
          <span
            class="inline-flex max-w-full truncate bg-blue-50/50 text-blue-700 text-xs px-2.5 py-1 rounded-lg
                   border border-blue-100 font-medium"
            :title="item.project"
          >
            {{ item.project || '-' }}
          </span>
        </div>

        <!-- ปีงบ -->
        <div class="col-span-1 text-center text-sm font-medium text-slate-600 font-mono">
          {{ item.year || '-' }}
        </div>

        <!-- ผู้รับผิดชอบ -->
        <div class="col-span-2 flex items-center gap-2 min-w-0">
          <div
            class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 text-white
                   flex items-center justify-center text-[10px] shadow-sm flex-shrink-0"
          >
            {{ (item.owner || '-').charAt(0) }}
          </div>
          <span class="text-sm text-slate-700 truncate">{{ item.owner || '-' }}</span>
        </div>

        <!-- เวลาที่ส่ง -->
        <div class="col-span-1 text-center text-xs text-slate-600">
          {{ item.time || '-' }}
        </div>

        <!-- รูปแบบ -->
        <div class="col-span-1">
          <div class="text-xs font-medium text-slate-600 truncate">
            {{ item.fileTypeLabel || item.fileType || '-' }}
          </div>
        </div>

        <!-- ยอดเงิน -->
        <div class="col-span-1 text-right text-sm font-semibold text-slate-700 tabular-nums">
          {{ formatAmount(item.amount) }}
        </div>

        <!-- Action row (optional) -->
        <div v-if="$slots.actions" class="col-span-12 pt-2 flex justify-end">
          <slot name="actions" :item="item" />
        </div>
      </div>

      <div v-if="items.length === 0" class="text-center py-8 text-slate-400">
        ไม่มีข้อมูล
      </div>
    </div>

    <!-- Footer (optional) -->
    <div class="px-6 py-3 border-t border-white/40 bg-white/10 flex items-center justify-between flex-shrink-0">
      <div class="text-xs text-slate-500">แสดง {{ items.length }} รายการ</div>
      <slot name="footerRight" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: any[]
}>()

const formatAmount = (v: any) => {
  const n = Number(v)
  if (Number.isNaN(n)) return v ?? '-'
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
.glass-panel {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}
</style>
