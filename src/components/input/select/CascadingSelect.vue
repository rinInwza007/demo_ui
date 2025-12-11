<template>
  <div class="flex flex-col gap-2">
    <!-- Label -->
    <label v-if="label" class="font-medium text-gray-700">
      {{ label }}
    </label>

    <div class="flex gap-4 items-start">
      <!-- MAIN: เลือกคณะ -->
      <div class="flex-1">
        <Select
          v-model="mainValue"
          :options="Object.keys(options)"
          :placeholder="placeholderMain"
        />
      </div>

      <!-- SUB1: เลือกหัวข้อรอง -->
      <div v-if="sub1Options.length > 0" class="flex-1">
        <Select
          v-model="sub1Value"
          :options="sub1Options"
          :placeholder="placeholderSub1"
        />
      </div>

      <!-- SUB2: เลือกหัวข้อย่อย -->
      <div v-if="sub2Options.length > 0" class="flex-1">
        <Select
          v-model="sub2Value"
          :options="sub2Options"
          :placeholder="placeholderSub2"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Select from "@/components/input/select/select.vue";

/* ===========================
      PROPS (รองรับ v-model:main)
=========================== */
const props = defineProps({
  // 👇 ต้องชื่อแบบนี้ถึงจะใช้ v-model:main ได้
  main: { type: String, default: "" },
  sub1: { type: String, default: "" },
  sub2: { type: String, default: "" },

  options: { type: Object, required: true },

  label: { type: String, default: "" },

  placeholderMain: { type: String, default: "เลือกคณะ" },
  placeholderSub1: { type: String, default: "เลือกระดับรอง" },
  placeholderSub2: { type: String, default: "เลือกระดับย่อย" },
});

const emit = defineEmits([
  // 👇 ให้ตรงกับ v-model:main / :sub1 / :sub2
  "update:main",
  "update:sub1",
  "update:sub2",
]);

/* ===========================
      STATE ภายใน
=========================== */
const mainValue = ref(props.main);
const sub1Value = ref(props.sub1);
const sub2Value = ref(props.sub2);

/* ถ้า parent เปลี่ยนค่าจากข้างนอก → sync กลับเข้ามาใน component */
watch(
  () => props.main,
  (v) => {
    if (v !== mainValue.value) mainValue.value = v || "";
  }
);

watch(
  () => props.sub1,
  (v) => {
    if (v !== sub1Value.value) sub1Value.value = v || "";
  }
);

watch(
  () => props.sub2,
  (v) => {
    if (v !== sub2Value.value) sub2Value.value = v || "";
  }
);

/* ===========================
   COMPUTED OPTIONS LOGIC
=========================== */

// Level 2 options (SUB1)
const sub1Options = computed(() => {
  if (!mainValue.value) return [];

  const data = props.options[mainValue.value];
  if (!data) return [];

  const main = data.main;

  if (typeof main === "string") {
    return [main];
  }

  if (Array.isArray(main)) {
    return main;
  }

  return [];
});

// Level 3 options (SUB2)
const sub2Options = computed(() => {
  if (!mainValue.value) return [];

  const data = props.options[mainValue.value];
  if (!data) return [];

  const main = data.main;
  const subs = data.subs;

  if (Array.isArray(main)) {
    return [];
  }

  if (Array.isArray(subs)) {
    return subs;
  }

  return [];
});

/* ===========================
      WATCHERS (emit ออกไป)
=========================== */

// main เปลี่ยน → แจ้ง parent + reset sub1/sub2
watch(mainValue, (val) => {
  emit("update:main", val);

  sub1Value.value = "";
  sub2Value.value = "";
  emit("update:sub1", "");
  emit("update:sub2", "");
});

// sub1 เปลี่ยน → แจ้ง parent + reset sub2
watch(sub1Value, (val) => {
  emit("update:sub1", val);

  sub2Value.value = "";
  emit("update:sub2", "");
});

// sub2 เปลี่ยน → แจ้ง parent
watch(sub2Value, (val) => {
  emit("update:sub2", val);
});
</script>
