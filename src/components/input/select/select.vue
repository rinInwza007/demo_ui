<template>
  <div class="flex flex-col gap-1">

    <!-- Label -->
    <label v-if="label" class="text-gray-700 font-medium text-[15px]">
      {{ label }}
    </label>

    <!-- GOOGLE STYLE SELECT -->
    <select
      :value="modelValueString"
      @change="onChange"
      class="google-select"
    >
      <!-- Placeholder -->
      <option v-if="placeholder" value="" disabled selected hidden>
        {{ placeholder }}
      </option>

      <!-- Options -->
      <option
        v-for="(opt, idx) in options"
        :key="idx"
        :value="getOptionValueString(opt)"
      >
        {{ getOptionLabel(opt) }}
      </option>
    </select>

  </div>
</template>


<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { required: false },
  options: { type: Array, default: () => [] },
  optionLabel: { type: String, default: "label" },
  optionValue: { type: String, default: "value" },
  placeholder: { type: String, default: "-" },
  label: { type: String, default: "" },
  valueType: { type: String, default: "string" },
});

const emit = defineEmits(["update:modelValue"]);

function getOptionLabel(opt) {
  if (opt == null) return "";
  if (typeof opt === "string" || typeof opt === "number") return String(opt);
  return String(opt[props.optionLabel] ?? "");
}

function getOptionValue(opt) {
  if (opt == null) return "";
  if (typeof opt === "string" || typeof opt === "number")
    return props.valueType === "number" ? Number(opt) : String(opt);

  const raw = opt[props.optionValue] ?? "";
  return props.valueType === "number" ? Number(raw) : String(raw);
}

const modelValueString = computed(() => {
  if (props.modelValue == null) return "";
  return String(props.modelValue);
});

function getOptionValueString(opt) {
  const v = getOptionValue(opt);
  return v == null ? "" : String(v);
}

function onChange(e) {
  let v = e.target.value;
  if (props.valueType === "number") {
    const n = Number(v);
    v = Number.isNaN(n) ? v : n;
  }
  emit("update:modelValue", v);
}
</script>


<style scoped>
/* -------------------------
   GOOGLE SELECT STYLE
-------------------------- */
.google-select {
  @apply w-full h-[46px] px-4 bg-white text-gray-800
         rounded-xl border border-gray-300 shadow-sm
         text-[15px] cursor-pointer transition-all outline-none;

  /* Animation */
  transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
}

.google-select:hover {
  @apply border-gray-400 shadow-md;
}

.google-select:focus {
  @apply border-blue-500 ring-2 ring-blue-300 shadow-lg;
}

/* Hide default arrow in some browsers */
.google-select::-ms-expand {
  display: none;
}

/* Placeholder styling */
.google-select option[disabled][hidden] {
  color: #9ca3af !important;
}
</style>
