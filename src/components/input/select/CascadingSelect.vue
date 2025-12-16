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
  icon="ph ph-buildings"
/>
      </div>

      <!-- SUB1: เลือกหัวข้อรอง -->
      <div v-if="sub1Options.length > 0" class="flex-1">
        <Select
  v-model="sub1Value"
  :options="sub1Options"
  :placeholder="placeholderSub1"
  icon="ph ph-squares-four"
/>
      </div>

      <!-- SUB2: เลือกหัวข้อย่อย -->
      <div v-if="sub2Options.length > 0" class="flex-1">
        <Select
  v-model="sub2Value"
  :options="sub2Options"
  :placeholder="placeholderSub2"
  icon="ph ph-list-bullets"
/>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Select from "@/components/input/select/select.vue";

/* ===========================
      PROPS
=========================== */
const props = defineProps({
  modelValueMain: { type: String, default: "" },   // คณะที่เลือก
  modelValueSub1: { type: String, default: "" },   // รองที่เลือก
  modelValueSub2: { type: String, default: "" },   // ย่อยที่เลือก

  options: { type: Object, required: true },

  label: { type: String, default: "" },

  placeholderMain: { type: String, default: "เลือกคณะ" },
  placeholderSub1: { type: String, default: "เลือกระดับรอง" },
  placeholderSub2: { type: String, default: "เลือกระดับย่อย" },
});

const emit = defineEmits([
  "update:modelValueMain",
  "update:modelValueSub1",
  "update:modelValueSub2",
]);

/* ===========================
      STATE
=========================== */
const mainValue = ref(props.modelValueMain);
const sub1Value = ref(props.modelValueSub1);
const sub2Value = ref(props.modelValueSub2);

/* ===========================
   COMPUTED OPTIONS LOGIC
=========================== */

// Level 2 options (SUB1)
const sub1Options = computed(() => {
  if (!mainValue.value) return [];

  const data = props.options[mainValue.value];
  if (!data) return [];

  const main = data.main;

  // main = "string"
  if (typeof main === "string") {
    return [main];
  }

  // main = array
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

  // กรณี main = array → ไม่มี subs
  if (Array.isArray(main)) {
    return [];
  }

  // main = string → subs อาจมีหลายอัน
  if (Array.isArray(subs)) {
    return subs;
  }

  return [];
});

/* ===========================
      WATCHERS
=========================== */

watch(mainValue, (val) => {
  emit("update:modelValueMain", val);

  // reset sub1 & sub2 เมื่อเปลี่ยน main
  sub1Value.value = "";
  sub2Value.value = "";
  emit("update:modelValueSub1", "");
  emit("update:modelValueSub2", "");
});

watch(sub1Value, (val) => {
  emit("update:modelValueSub1", val);

  // reset sub2 เมื่อเลือกระดับรองใหม่
  sub2Value.value = "";
  emit("update:modelValueSub2", "");
});

watch(sub2Value, (val) => {
  emit("update:modelValueSub2", val);
});
</script>
