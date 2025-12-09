<template>
  <div class="relative w-[330px]">
    <!-- Google-style Search Box -->
    <div class="relative">
      <span
        class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2
               text-gray-400 text-[22px]"
      >
        search
      </span>

      <input
        type="text"
        v-model="searchText"
        placeholder="ค้นหา สังกัด / หน่วยงาน"
        class="google-input"
        @input="filterOptions"
        @keydown.down.prevent="moveDown"
        @keydown.up.prevent="moveUp"
        @keydown.enter.prevent="selectActive"
      />
    </div>

    <!-- Dropdown -->
    <transition name="fade-slide">
      <div
        v-if="filteredList.length && searchText"
        class="google-dropdown"
      >
        <div
          v-for="(item, index) in filteredList"
          :key="item.full"
          @click="select(item)"
          :class="[
            'google-item',
            index === activeIndex ? 'google-item-active' : ''
          ]"
        >
          <span class="material-symbols-outlined text-gray-400 text-[18px]">
            search
          </span>
          <span>{{ item.full }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { options } from "@/components/data/departments";
const emit = defineEmits(["update:modelValue"]);
const props = defineProps({ modelValue: String });

const searchText = ref("");
const filteredList = ref<{ full: string }[]>([]);
const activeIndex = ref(0);

/* --- Convert options to flat list --- */
const allAffiliations = Object.entries(options).flatMap(
  ([facultyName, data]) => {
    const list: Array<{ full: string }> = [];

    if (Array.isArray(data.main)) {
      data.main.forEach((m) => list.push({ full: `${facultyName} - ${m}` }));
    } else if (typeof data.main === "string") {
      list.push({ full: `${facultyName} - ${data.main}` });
    }

    if (Array.isArray(data.subs)) {
      data.subs.forEach((s) =>
        list.push({ full: `${facultyName} - ${s}` })
      );
    }

    return list;
  }
);

/* --- Filter --- */
const filterOptions = () => {
  const q = searchText.value.trim().toLowerCase();
  filteredList.value = allAffiliations.filter((it) =>
    it.full.toLowerCase().includes(q)
  );
  activeIndex.value = 0;
};

/* --- Select --- */
const select = (item: { full: string }) => {
  searchText.value = item.full;
  emit("update:modelValue", item.full);
  filteredList.value = [];
};

/* --- Keyboard Navigation --- */
const moveDown = () => {
  if (activeIndex.value < filteredList.value.length - 1)
    activeIndex.value++;
};

const moveUp = () => {
  if (activeIndex.value > 0) activeIndex.value--;
};

const selectActive = () => {
  if (filteredList.value[activeIndex.value])
    select(filteredList.value[activeIndex.value]);
};

/* --- Sync external value --- */
watch(
  () => props.modelValue,
  (v) => {
    if (v !== searchText.value) searchText.value = v || "";
  }
);
</script>

<style scoped>
/* ---------------- Google Search Input ---------------- */
.google-input {
  @apply w-full h-[46px] pl-12 pr-4 rounded-full bg-white
         border border-gray-300 text-gray-800
         shadow-sm transition-all duration-150 text-[15px]
         focus:ring-2 focus:ring-blue-300 focus:border-blue-500;
}

.google-input:hover {
  @apply shadow-md border-gray-400;
}

/* ---------------- Dropdown (Google Style) ---------------- */
.google-dropdown {
  @apply absolute w-full bg-white rounded-xl shadow-lg border border-gray-200
         mt-2 py-2 z-30 max-h-72 overflow-y-auto;
}

/* ---------------- Dropdown Item ---------------- */
.google-item {
  @apply flex items-center gap-3 px-4 py-2 cursor-pointer text-gray-700
         hover:bg-[#E8F0FE] hover:text-blue-700 transition-colors text-[14.5px];
}

.google-item-active {
  @apply bg-[#E8F0FE] text-blue-700;
}

/* ---------------- Animation (Google-like) ---------------- */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.14s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-from {
  opacity: 1;
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
