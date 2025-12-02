<template>
 <div class="flex gap-4 items-center whitespace-nowrap ">

  <!-- MAIN -->
  <div class="form-cell w-[260px]">
    <select ref="mainSelect" v-model="mainValue" class="tomselect-box">
      <option value="">{{ placeholderMain }}</option>
      <option v-for="m in Object.keys(options)" :key="m" :value="m">
        {{ m }}
      </option>
    </select>
  </div>

  <!-- SUB1 -->
  <div v-if="sub1Options.length > 0" class="form-cell w-[260px]">
    <select ref="sub1Select" v-model="sub1Value" class="tomselect-box">
      <option value="">{{ placeholderSub1 }}</option>
      <option v-for="s in sub1Options" :key="s" :value="s">
        {{ s }}
      </option>
    </select>
  </div>

  <!-- SUB2 -->
  <div v-if="sub2Options.length > 0" class="form-cell w-[260px]">
    <select ref="sub2Select" v-model="sub2Value" class="tomselect-box">
      <option value="">{{ placeholderSub2 }}</option>
      <option v-for="s in sub2Options" :key="s" :value="s">
        {{ s }}
      </option>
    </select>
  </div>

</div>

</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import TomSelect from "tom-select";
import "tom-select/dist/css/tom-select.css";

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

/* STATE */
const mainValue = ref(props.modelValueMain);
const sub1Value = ref(props.modelValueSub1);
const sub2Value = ref(props.modelValueSub2);

const mainSelect = ref(null);
const sub1Select = ref(null);
const sub2Select = ref(null);

let tsMain, tsSub1, tsSub2;

/* COMPUTED */
const sub1Options = computed(() => {
  if (!mainValue.value) return [];

  const data = props.options[mainValue.value];
  if (!data) return [];

  const main = data.main;
  if (typeof main === "string") return [main];
  if (Array.isArray(main)) return main;

  return [];
});

const sub2Options = computed(() => {
  if (!mainValue.value) return [];

  const data = props.options[mainValue.value];
  if (!data) return [];

  const main = data.main;
  const subs = data.subs;

  if (Array.isArray(main)) return [];
  if (Array.isArray(subs)) return subs;

  return [];
});

/* WATCH */
watch(mainValue, (val) => {
  emit("update:modelValueMain", val);

  sub1Value.value = "";
  sub2Value.value = "";

  emit("update:modelValueSub1", "");
  emit("update:modelValueSub2", "");

  refreshSub1();
  refreshSub2();
});

watch(sub1Value, (val) => {
  emit("update:modelValueSub1", val);

  sub2Value.value = "";
  emit("update:modelValueSub2", "");

  refreshSub2();
});

watch(sub2Value, (val) => {
  emit("update:modelValueSub2", val);
});

/* TOMSELECT INIT */
const createTomSelect = (el, placeholder) => {
  return new TomSelect(el, {
    create: (input) => ({
      value: input,
      text: input
    }),
    maxItems: 1,
    placeholder: placeholder,
    allowEmptyOption: true,
    closeAfterSelect: true,
  });
};

const refreshSub1 = () => {
  nextTick(() => {
    if (!sub1Select.value) return;

    tsSub1?.destroy();
    tsSub1 = createTomSelect(sub1Select.value, props.placeholderSub1);

    sub1Options.value.forEach(opt => {
      tsSub1.addOption({ value: opt, text: opt });
    });

    tsSub1.refreshOptions(false);
  });
};

const refreshSub2 = () => {
  nextTick(() => {
    if (!sub2Select.value) return;

    tsSub2?.destroy();
    tsSub2 = createTomSelect(sub2Select.value, props.placeholderSub2);

    sub2Options.value.forEach(opt => {
      tsSub2.addOption({ value: opt, text: opt });
    });

    tsSub2.refreshOptions(false);
  });
};

onMounted(() => {
  tsMain = createTomSelect(mainSelect.value, props.placeholderMain);
  refreshSub1();
  refreshSub2();
});

onBeforeUnmount(() => {
  tsMain?.destroy();
  tsSub1?.destroy();
  tsSub2?.destroy();
});
</script>

<style>
/* cell ครอบ tomselect ให้ยืดได้ */
.form-cell {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ให้กล่อง TomSelect ขยายเต็ม */
.ts-wrapper {
  width: 100% !important;
}

/* ให้ input TomSelect มีความสูงและขนาดที่ใหญ่ขึ้น */
.ts-control {
  min-height: 56px !important;
  padding: 14px 18px !important;
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  font-size: 18px !important;
  border-radius: 8px !important;
  border: 2px solid #e5e7eb !important;
  background: white !important;
}

/* เมื่อ focus */
.ts-control:focus,
.ts-wrapper.focus .ts-control {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

/* dropdown items */
.ts-dropdown {
  font-size: 16px !important;
}

.ts-dropdown .option {
  padding: 12px 18px !important;
}

.ts-control {
  min-height: 44px !important;
  padding: 8px 10px !important;
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
}

/* select ตัวตั้งต้นให้กิน width เต็ม */
.tomselect-box {
  width: 100%;
}
</style>
