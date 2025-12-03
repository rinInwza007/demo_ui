<template>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                รายการลูกหนี้
              </h2>
              <span class="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {{ morelist.length }} รายการ
              </span>
            </div>
            <div class="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-4">
              <!-- Header Labels (Hidden on mobile) -->
              <div
                class="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr] gap-3 px-2 pb-2 border-b border-gray-300 items-center js"
              >
                <div class="text-xs font-semibold text-gray-600 uppercase">รายการ</div>
                <div class="text-xs font-semibold text-gray-600 uppercase">จำนวนเงิน</div>
                <div class="text-xs font-semibold text-gray-600 uppercase">หมายเหตุ</div>
              </div>

              <!-- Dynamic Rows -->
              <div class="space-y-4">
                <div
                  v-for="(row, index) in morelist"
                  :key="row.id"
                  class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-blue-300 transition-all duration-200"
                >
                  <div>
                    <div
                      class="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-start"
                    >
                      <div class="flex flex-col gap-2">
                        <ItemNameSelect
                          v-model="row.itemName"
                          :input-id="`itemName-${index}`"
                          @input="() => clearRowError(index, 'itemName')"
                          class="-ml-2 -mr-2"
                        />

                        <span v-if="errors.rows?.[index]?.itemName" class="text-red-600 text-xs">
                          {{ errors.rows[index].itemName }}
                        </span>
                      </div>
                      <!-- จำนวนเงิน -->
                      <div class="flex flex-col gap-1.5">
                        <InputText
                          v-model="row.amount"
                          placeholder="จำนวนเงิน"
                          class="w-full"
                          @input="() => clearRowError(index, 'amount')"
                        />
                        <span v-if="errors.rows?.[index]?.amount" class="text-red-600 text-xs">
                          {{ errors.rows[index].amount }}
                        </span>
                      </div>
                      <!-- ประเภท -->
                      <div class="flex flex-col gap-1.5">
                        <InputText
                          v-model="row.note"
                          placeholder="หมายเหตุ"
                          class="w-full"
                          @input="() => clearRowError(index, 'note')"
                        />
                        <span v-if="errors.rows?.[index]?.note" class="text-red-600 text-xs">
                          {{ errors.rows[index].note }}
                        </span>
                      </div>
                      <!-- Delete Button -->
                      <button
                        v-if="morelist.length > 1"
                        @click="removeRow(index)"
                        class="mt-0 sm:mt-0 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 self-start sm:self-center"
                        title="ลบรายการ"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add Row Button -->
              <button
                @click="addRow"
                class="py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                เพิ่มรายการ
              </button>
            </div>
          </div>

</template>

<script>
import { defineProps } from 'vue'
import ItemNameSelect from '@/components/TomSelect/ItemNameSelect.vue'
import InputText from '@/components/input/inputtext.vue'


const props = defineProps({
  morelist: Array,
  errors: Object,
  addRow: Function,
  removeRow: Function,
  clearRowError: Function,
  initItemNameTomSelect: Function, // ถ้ายังใช้ TomSelect
})

const rowErrors = (index, field) => {
  return props.errors?.rows?.[index]?.[field]
}
</script>