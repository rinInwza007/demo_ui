<template>
  <div class="flex flex-col gap-2">
    <!-- Label -->
    <label v-if="label" class="font-medium text-gray-700">
      {{ label }}
    </label>

    <!-- ✅ เปลี่ยนเป็น flex แนวนอน -->
    <div class="flex flex-row gap-3">
      <!-- MAIN: เลือกคณะ -->
      <div class="flex-1 min-w-[200px]">
        <Select
          v-model="mainValue"
          :options="[ALL_OPTION, ...Object.keys(options)]"
          :placeholder="placeholderMain"
          icon="ph ph-buildings"
        />
      </div>

      <!-- SUB1: เลือกหัวข้อรอง -->
      <div v-if="sub1Options.length > 0" class="flex-1 min-w-[200px]">
        <Select
          v-model="sub1Value"
          :options="sub1Options"
          :placeholder="placeholderSub1"
          icon="ph ph-squares-four"
        />
      </div>

      <!-- SUB2: เลือกหัวข้อย่อย -->
      <div v-if="sub2Options.length > 0" class="flex-1 min-w-[200px]">
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
  modelValueMain: { type: String, default: "" },
  modelValueSub1: { type: String, default: "" },
  modelValueSub2: { type: String, default: "" },

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

const ALL_OPTION = "เลือกทั้งหมด";

/* ===========================
   COMPUTED OPTIONS LOGIC
=========================== */

// Level 2 options (SUB1)
const sub1Options = computed(() => {
  if (!mainValue.value || mainValue.value === ALL_OPTION) return [];

  const data = props.options[mainValue.value];
  if (!data || !data.main) return [];

  const main = data.main;

  // ✅ ถ้าเป็น array of objects { id, name }
  if (Array.isArray(main)) {
    return [ALL_OPTION, ...main.map(item => item.name)];
  }

  // ✅ ถ้าเป็น string (backward compatibility)
  if (typeof main === "string") {
    return [ALL_OPTION, main];
  }

  return [];
});

// Level 3 options (SUB2)
const sub2Options = computed(() => {
  if (
    !mainValue.value ||
    mainValue.value === ALL_OPTION ||
    !sub1Value.value ||
    sub1Value.value === ALL_OPTION
  )
    return [];

  const data = props.options[mainValue.value];
  if (!data || !data.subs) return [];

  const subs = data.subs;

  // ✅ ถ้าเป็น array of objects { id, name }
  if (Array.isArray(subs) && subs.length > 0) {
    return [ALL_OPTION, ...subs.map(item => item.name)];
  }

  return [];
});

/* ===========================
      WATCHERS
=========================== */

watch(mainValue, (val) => {
  if (val === ALL_OPTION) {
    emit("update:modelValueMain", "");
    emit("update:modelValueSub1", "");
    emit("update:modelValueSub2", "");
    sub1Value.value = "";
    sub2Value.value = "";
    return;
  }

  emit("update:modelValueMain", val);
  sub1Value.value = "";
  sub2Value.value = "";
  emit("update:modelValueSub1", "");
  emit("update:modelValueSub2", "");
});

watch(sub1Value, (val) => {
  if (val === ALL_OPTION) {
    emit("update:modelValueSub1", "");
    emit("update:modelValueSub2", "");
    sub2Value.value = "";
    return;
  }

  emit("update:modelValueSub1", val);
  sub2Value.value = "";
  emit("update:modelValueSub2", "");
});

watch(sub2Value, (val) => {
  if (val === ALL_OPTION) {
    emit("update:modelValueSub2", "");
    return;
  }

  emit("update:modelValueSub2", val);
});
</script>