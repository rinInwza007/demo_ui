<template>
  <div class="flex gap-2">
    <!-- ดูข้อมูล -->
    <button
      v-if="canShow('view')"
      @click="emitSafe('view')"
      v-tippy="getTooltip('view')"
      class="hvr-bob"
    >
      <i class="material-symbols-outlined text-blue-500">visibility</i>
    </button>

    <!-- แก้ไข -->
    <button
      v-if="canShow('edit')"
      :disabled="isDisabled('edit')"
      @click="emitSafe('edit')"
      v-tippy="getTooltip('edit')"
      class="hvr-bob disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <i class="material-symbols-outlined text-indigo-500">edit</i>
    </button>

    <!-- ล็อก -->
    <button
      v-if="canShow('lock')"
      :disabled="isDisabled('lock')"
      @click="emitSafe('lock')"
      v-tippy="getTooltip('lock')"
      class="hvr-bob disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <i
        class="material-symbols-outlined"
        :class="item?.isLocked ? 'text-amber-600' : 'text-green-600'"
      >
        {{ item?.isLocked ? 'lock' : 'lock_open_right' }}
      </i>
    </button>

    <!-- ลบ -->
    <button
      v-if="canShow('delete')"
      :disabled="isDisabled('delete')"
      @click="emitSafe('delete')"
      v-tippy="getTooltip('delete')"
      class="hvr-bob disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <i class="material-symbols-outlined text-red-500">delete</i>
    </button>

    <!-- ล้างหนี้ -->
    <button
      v-if="canShow('cleardebtor')"
      :disabled="isDisabled('cleardebtor')"
      @click="emitSafe('cleardebtor')"
      v-tippy="getTooltip('cleardebtor')"
      class="hvr-bob disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <i class="material-symbols-outlined text-red-500">credit_card</i>
    </button>

    <!-- อนุมัติ -->
    <button
      v-if="canShow('approve')"
      :disabled="isDisabled('approve')"
      @click="emitSafe('approve')"
      v-tippy="getTooltip('approve')"
      class="hvr-bob disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <i class="material-symbols-outlined text-emerald-600">check_circle</i>
    </button>

    <!-- ✅ ปฏิเสธ (ใหม่) -->
    <button
      v-if="canShow('reject')"
      :disabled="isDisabled('reject')"
      @click="emitSafe('reject')"
      v-tippy="getTooltip('reject')"
      class="hvr-bob disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <i class="material-symbols-outlined text-red-600">cancel</i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

// ✅ เพิ่ม 'reject' เข้าไป
export type ActionKey =
  | 'view'
  | 'edit'
  | 'lock'
  | 'delete'
  | 'cleardebtor'
  | 'approve'
  | 'reject'  // ← เพิ่มบรรทัดนี้

type ItemBase = {
  isLocked?: boolean
}

const props = withDefaults(
  defineProps<{
    item: ItemBase
    permissions?: ActionKey[]
    
    // ✅ เพิ่ม prop นี้เพื่อบังคับ disable จากภายนอก
    forceDisabled?: boolean
    
    // backward compatible
    showView?: boolean
    showEdit?: boolean
    showLock?: boolean
    showDelete?: boolean
    showCleardedtor?: boolean
  }>(),
  {
    permissions: undefined,
    forceDisabled: false,
    showView: false,
    showEdit: false,
    showLock: false,
    showDelete: false,
    showCleardedtor: false,
  }
)

const emit = defineEmits<{  
  (e: ActionKey, item: ItemBase): void
}>()

const auth = useAuthStore()

// ✅ เพิ่ม reject mapping
const actionToPermission: Record<ActionKey, string> = {
  view: 'view',
  edit: 'edit',
  lock: 'lock',
  delete: 'delete',
  cleardebtor: 'cleardebtor',
  approve: 'approve',
  reject: 'reject',  // ← เพิ่มบรรทัดนี้
}

const isDeclarative = computed(() => Array.isArray(props.permissions) && props.permissions.length > 0)

function legacyShow(action: ActionKey) {
  if (action === 'view') return props.showView
  if (action === 'edit') return props.showEdit
  if (action === 'lock') return props.showLock
  if (action === 'delete') return props.showDelete
  if (action === 'cleardebtor') return props.showCleardedtor
  return false
}

function canShow(action: ActionKey) {
  const perm = actionToPermission[action]
  const allowedByAuth = typeof (auth as any).can === 'function' ? (auth as any).can(perm) : true

  if (isDeclarative.value) {
    return props.permissions!.includes(action) && allowedByAuth
  }

  return legacyShow(action) && allowedByAuth
}

/**
 * ✅ ปรับปรุง isDisabled: รวมเช็คทั้ง item.isLocked และ forceDisabled
 */
function isDisabled(action: ActionKey) {
  // ✅ ถ้า forceDisabled = true → ปิดทุกอย่างยกเว้น view
  if (props.forceDisabled && action !== 'view') {
    return true
  }
  
  // ✅ กรณี item ถูกล็อก - เพิ่ม reject เข้าไปด้วย
  const locked = props.item?.isLocked === true
  if ((action === 'edit' || action === 'delete' || action === 'approve' || action === 'reject') && locked) {
    return true
  }
  
  return false
}

/**
 * ✅ ปรับปรุง tooltip message
 */
function getTooltip(action: ActionKey) {
  if (isDisabled(action)) {
    if (props.forceDisabled) {
      return 'ปิดยอดแล้ว - ไม่สามารถดำเนินการได้'
    }
    if (props.item?.isLocked) {
      return 'รายการถูกล็อก'
    }
  }
  
  // ✅ เพิ่ม tooltip สำหรับ reject
  const defaultTooltips: Record<ActionKey, string> = {
    view: 'ดูข้อมูล',
    edit: 'แก้ไข',
    lock: 'ล็อก/ปลดล็อก',
    delete: 'ลบ',
    cleardebtor: 'ล้างลูกหนี้',
    approve: 'อนุมัติ',
    reject: 'ปฏิเสธ',  // ← เพิ่มบรรทัดนี้
  }
  
  return defaultTooltips[action] || ''
}

function emitSafe(action: ActionKey) {
  if (!canShow(action)) return
  if (isDisabled(action)) return
  emit(action, props.item)
}
</script>