<!-- src/components/Actionbutton/ActionButtons.vue -->
<template>
  <div class="flex gap-2">
    <!-- ดูข้อมูล -->
    <button
      v-if="canShow('view')"
      @click="emitSafe('view')"
      v-tippy="'ดูข้อมูล'"
      class="hvr-bob"
    >
      <i class="material-symbols-outlined text-blue-500">visibility</i>
    </button>

    <!-- แก้ไข -->
    <button
      v-if="canShow('edit')"
      :disabled="isDisabled('edit')"
      @click="emitSafe('edit')"
      v-tippy="isDisabled('edit') ? 'รายการถูกล็อก' : 'แก้ไข'"
      class="hvr-bob disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <i class="material-symbols-outlined text-indigo-500">edit</i>
    </button>

    <!-- ล็อก -->
    <button
      v-if="canShow('lock')"
      :disabled="isDisabled('lock')"
      @click="emitSafe('lock')"
      v-tippy="'ล็อก/ปลดล็อก'"
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
      v-tippy="isDisabled('delete') ? 'รายการถูกล็อก' : 'ลบ'"
      class="hvr-bob disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <i class="material-symbols-outlined text-red-500">delete</i>
    </button>

    <!-- ล้างหนี้ -->
    <button
      v-if="canShow('cleardebtor')"
      :disabled="isDisabled('cleardebtor')"
      @click="emitSafe('cleardebtor')"
      v-tippy="'ล้างลูกหนี้'"
      class="hvr-bob disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <i class="material-symbols-outlined text-red-500">credit_card</i>
    </button>

    <!-- อนุมัติ -->
    <button
      v-if="canShow('approve')"
      :disabled="isDisabled('approve')"
      @click="emitSafe('approve')"
      v-tippy="'อนุมัติ'"
      class="hvr-bob"
    >
      <i class="material-symbols-outlined text-emerald-600">check_circle</i>
    </button>

    <!-- ไม่อนุมัติ -->
    <button
      v-if="canShow('notapprove')"
      :disabled="isDisabled('notapprove')"
      @click="emitSafe('notapprove')"
      v-tippy="'ไม่อนุมัติ'"
      class="hvr-bob"
    >
      <i class="material-symbols-outlined text-rose-600">cancel</i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * ✅ ปุ่มที่รองรับใน component นี้
 * - ใช้เป็นทั้งชื่อ permission และชื่อ event ที่ emit
 */
export type ActionKey =
  | 'view'
  | 'edit'
  | 'lock'
  | 'delete'
  | 'cleardebtor'
  | 'approve'
  | 'notapprove'

/**
 * ✅ โครง item ขั้นต่ำที่ component ต้องใช้
 * (ของจริงคุณส่ง TableRow/Receipt มาได้เลย)
 */
type ItemBase = {
  isLocked?: boolean
}

const props = withDefaults(
  defineProps<{
    item: ItemBase

    /**
     * ✅ Declarative permissions
     * - ถ้าไม่ส่งมา: fallback ไปใช้ show* แบบเดิมให้ (เพื่อไม่พัง)
     */
    permissions?: ActionKey[]

    /**
     * ✅ backward compatible props (ของเดิม)
     * - ใช้เมื่อไม่ได้ส่ง permissions
     */
    showView?: boolean
    showEdit?: boolean
    showLock?: boolean
    showDelete?: boolean
    showCleardedtor?: boolean
  }>(),
  {
    permissions: undefined,
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

/**
 * ✅ map จาก ActionKey -> permission key ใน auth.can()
 * - ถ้าคุณใช้ชื่อ permission ใน store ตรงกันอยู่แล้ว ก็ใช้ชื่อเดียวกันได้เลย
 */
const actionToPermission: Record<ActionKey, string> = {
  view: 'view',
  edit: 'edit',
  lock: 'lock',
  delete: 'delete',
  cleardebtor: 'cleardebtor',
  approve: 'approve',
  notapprove: 'notapprove',
}

/**
 * ✅ โหมด declarative?
 * - ถ้า parent ส่ง permissions มา จะใช้โหมดนี้
 */
const isDeclarative = computed(() => Array.isArray(props.permissions) && props.permissions.length > 0)

/**
 * ✅ โหมดเดิม: show* (เพื่อ compatibility)
 */
function legacyShow(action: ActionKey) {
  if (action === 'view') return props.showView
  if (action === 'edit') return props.showEdit
  if (action === 'lock') return props.showLock
  if (action === 'delete') return props.showDelete
  if (action === 'cleardebtor') return props.showCleardedtor
  // approve / notapprove ไม่มี show* เดิม → ซ่อน
  return false
}

/**
 * ✅ ตัดสินใจ “แสดงปุ่ม”:
 * - ถ้าเป็น declarative: ต้องอยู่ใน props.permissions และ auth.can(permission) ต้องผ่าน
 * - ถ้าเป็น legacy: ใช้ show* และยังเช็ค auth.can() เพื่อกันการหลุดสิทธิ
 */
function canShow(action: ActionKey) {
  const perm = actionToPermission[action]
  const allowedByAuth = typeof (auth as any).can === 'function' ? (auth as any).can(perm) : true

  if (isDeclarative.value) {
    return props.permissions!.includes(action) && allowedByAuth
  }

  return legacyShow(action) && allowedByAuth
}

/**
 * ✅ Disabled rules (ปรับได้ตาม policy)
 * - edit/delete: ถ้าถูกล็อก → ปิด
 * - อื่นๆ: ไม่ปิด (ยกเว้นอยากเพิ่ม)
 */
function isDisabled(action: ActionKey) {
  const locked = props.item?.isLocked === true
  if ((action === 'edit' || action === 'delete') && locked) return true
  return false
}

/**
 * ✅ Safe emit:
 * - กัน emit หากไม่แสดง/ไม่มีสิทธิ
 * - กัน emit หาก disabled
 */
function emitSafe(action: ActionKey) {
  if (!canShow(action)) return
  if (isDisabled(action)) return
  emit(action, props.item)
}
</script>
