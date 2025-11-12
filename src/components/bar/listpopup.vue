<template>
  <teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- backdrop -->
      <div
        class="absolute inset-0 bg-black/40"
        @click.self="close"
        aria-hidden="true"
      />

      <!-- popup -->
      <div
        class="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-lg shadow-lg"
        role="dialog"
        aria-modal="true"
        :aria-label="title || 'Popup list'"
      >
        <!-- header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
          <h3 class="text-lg font-medium text-gray-800 dark:text-gray-100">
            {{ title }}
            <span v-if="multiple" class="text-sm font-normal text-gray-500 ml-2">({{ selectedLocal.length }} เลือก)</span>
          </h3>

          <div class="flex items-center gap-2">
            <button v-if="multiple" @click="clearSelection" class="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white">ล้าง</button>
            <button @click="close" class="text-gray-500 hover:text-gray-800 dark:hover:text-white">✕</button>
          </div>
        </div>

        <!-- list -->
        <div class="max-h-64 overflow-auto p-2">
          <ul>
            <li
              v-if="items.length === 0"
              class="px-3 py-2 text-sm text-gray-500"
            >
              ไม่มีรายการ
            </li>

            <li
              v-for="(it, idx) in items"
              :key="idx"
              @click="onItemClick(it)"
              :class="[
                'cursor-pointer px-3 py-2 rounded-md mb-1 transition flex items-center justify-between',
                isSelected(it) ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200'
              ]"
            >
              <span>{{ getLabel(it) }}</span>
              <span v-if="isSelected(it)" class="text-white">
                <!-- check icon simple -->
                ✓
              </span>
            </li>
          </ul>
        </div>

        <!-- footer -->
        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 dark:border-slate-800">
          <button @click="close" class="px-3 py-2 rounded-md bg-gray-100 dark:bg-slate-800">ยกเลิก</button>
          <button v-if="multiple" @click="confirm" class="px-3 py-2 rounded-md bg-blue-600 text-white">ตกลง</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  // when multiple=true, selected should be array; when multiple=false, it's a single value (nullable)
  selected: { required: false },
  items: { type: Array, default: () => [] },
  optionLabel: { type: String, default: 'label' },
  optionValue: { type: String, default: 'value' },
  title: { type: String, default: 'เลือก' },
  multiple: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'update:selected'])

// Local copy of selected for multi-mode to allow toggling without immediately committing (optional)
const selectedLocal = ref([])

// keep local in sync with prop.selected
watch(
  () => props.selected,
  (v) => {
    if (props.multiple) {
      // ensure array
      selectedLocal.value = Array.isArray(v) ? [...v] : v != null ? [v] : []
    } else {
      // single select mode: selectedLocal holds single value as array for convenience
      selectedLocal.value = v == null ? [] : [v]
    }
  },
  { immediate: true }
)

// helpers
function getLabel(item) {
  if (item === null || item === undefined) return ''
  if (typeof item === 'string' || typeof item === 'number') return String(item)
  return String(item[props.optionLabel] ?? '')
}

function getValue(item) {
  if (item === null || item === undefined) return item
  if (typeof item === 'string' || typeof item === 'number') return item
  return item[props.optionValue] ?? item
}

function isSelected(item) {
  const v = getValue(item)
  if (props.multiple) {
    return selectedLocal.value.some((s) => s === v)
  } else {
    return selectedLocal.value.length > 0 && selectedLocal.value[0] === v
  }
}

function onItemClick(item) {
  const v = getValue(item)
  if (props.multiple) {
    const idx = selectedLocal.value.findIndex((s) => s === v)
    if (idx === -1) selectedLocal.value.push(v)
    else selectedLocal.value.splice(idx, 1)
    // do not auto-close in multi mode
    // emit update so parent can react immediately if desired:
    emit('update:selected', [...selectedLocal.value])
  } else {
    // single select: set and emit immediately, optionally close
    selectedLocal.value = [v]
    emit('update:selected', v)
    // auto-close for single select
    emit('update:visible', false)
  }
}

function clearSelection() {
  selectedLocal.value = []
  emit('update:selected', props.multiple ? [] : null)
}

function close() {
  emit('update:visible', false)
}

function confirm() {
  // commit local selection to parent (array)
  if (props.multiple) {
    emit('update:selected', [...selectedLocal.value])
  } else {
    const val = selectedLocal.value.length ? selectedLocal.value[0] : null
    emit('update:selected', val)
  }
  emit('update:visible', false)
}

// keyboard: Escape to close
function onKey(e) {
  if (e.key === 'Escape' && props.visible) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
/* เพิ่ม style ตามต้องการ */
</style>
