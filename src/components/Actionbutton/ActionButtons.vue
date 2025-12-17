<template>
  <div class="flex gap-2">

    <!-- ดูข้อมูล -->
    <button
      v-if="showView"
      @click="$emit('view', item)"
      v-tippy="'ดูข้อมูล'"
      class="hvr-bob"
    >
      <i class="material-symbols-outlined text-blue-500">visibility</i>
    </button>

    <!-- แก้ไข -->
    <button
      v-if="showEdit"
      @click="$emit('edit', item)"
      v-tippy="'แก้ไข'"
      class="hvr-bob"
    >
      <i class="material-symbols-outlined text-indigo-500">edit</i>
    </button>

    <!-- ล็อก -->
    <button
      v-if="showLock"
      @click="$emit('lock', item)"
      v-tippy="'ล็อก/ปลดล็อก'"
      class="hvr-bob"
    >
      <i
        class="material-symbols-outlined"
        :class="item.isLocked ? 'text-amber-600' : 'text-green-600'"
      >
        {{ item.isLocked ? "lock" : "lock_open_right" }}
      </i>
    </button>

    <!-- ลบ -->
    <button
      v-if="showDelete"
      @click="$emit('delete', item)"
      v-tippy="'ลบ'"
      class="hvr-bob"
    >
      <i class="material-symbols-outlined text-red-500">delete</i>
    </button>

    <!-- ล้างหนี้ -->
    <button
      v-if="showCleardedtor"
      @click="$emit('cleardebtor', item)"
      v-tippy="'ล้างลูกหนี้'"
      class="hvr-bob"
    >
      <i class="material-symbols-outlined text-red-500">credit_card</i>
    </button>

    <!--อนุมัติ -->
    <button
    v-if="showApprove"
    @click="$emit('approve',item)"
    v-tippy="'อนุมัติ'"
    class="hvr-bob"
    >
    <i class="material-symbols-outlined text-green-500">domain_verification</i>
    </button>

    <!--ไม่อนุมัติ -->
    <button
    v-if="shownotApprove"
    @click="$emit('notapprove',item)"
    v-tippy="'ไม่อนุมัติ'"
    class="hvr-bob"
    >
    <i class="material-symbols-outlined text-green-500">domain_verification_off</i>
    </button>



  </div>
</template>

<script setup lang="ts">
defineProps({
  item: { type: Object, required: true },

  showView: { type: Boolean, default: false },
  showEdit: { type: Boolean, default: false },
  showLock: { type: Boolean, default: false },
  showDelete: { type: Boolean, default: false },
  showCleardedtor: { type: Boolean, default: false },
  showApprove: { type: Boolean, default: false },
  shownotApprove: { type: Boolean, default: false },
})

defineEmits([
  'view',
  'edit',
  'lock',
  'delete',
  'cleardebtor',
  'approve',
  'notapprove',
])
</script>

