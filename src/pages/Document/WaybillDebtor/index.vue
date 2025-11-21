<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    <SecondNavbar />
    <div class="max-w-5xl mx-auto p-6 pt-5">
      <div class="bg-white border border-gray-300 rounded-xl shadow-sm p-10 space-y-1">
        <h1 class="text-center text-3xl">เพิ่มใบนำส่งลูกหนี้</h1>

        <div class="max-w-4xl mx-auto p-6 pt-8 mt-10">
          <section>
            <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-5">
              <span class="w-1 h-6 bg-blue-500 rounded-full"></span>
              ข้อมูลผู้บันทึก
            </h2>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-4">
              <div>
                <div class="flex flex-col gap-1.5">
                  <span>ข้าพเจ้า <span class="text-red-600">*</span></span>
                  <InputText v-model="formData.name" type="text"  />
                  <span v-if="errors.name" class="text-red-600 text-xs -mt-2 -mb-[14px]">{{
                    errors.name
                  }}</span>
                </div>
              </div>
              <div>
                <div class="flex flex-col gap-1.5">
                  <span>เบอร์โทรติดต่อ <span class="text-red-600">*</span></span>
                  <InputText v-model="formData.phone" type="text" />
                  <span v-if="errors.phone" class="text-red-600 text-xs -mt-2 -mb-[14px]">{{
                    errors.phone
                  }}</span>
                </div>
              </div>
              <div>
                <div class="flex flex-col gap-1.5">
                  <span>สังกัด <span class="text-red-600">*</span></span>
                  <Selects
                    type="text"
                    v-model="formData.department"
                    :options="['สังกัดที่ 1', 'สังกัดที่ 2', 'สังกัดที่ 3', 'สังกัดที่ 4']"
                    placeholder="เลือกสังกัด"
                    value-type="string"
                  /><span v-if="errors.department" class="text-red-600 text-xs -mt-2 -mb-[14px]">{{
                    errors.department
                  }}</span>
                </div>
              </div>
              <div>
                <div class="flex flex-col gap-1.5">
                  <span>กองทุน <span class="text-red-600">*</span></span>
                  <Selects
                    type="text"
                    v-model="formData.fund"
                    :options="['กองทุนที่ 1', 'กองทุนที่ 2', 'กองทุนที่ 3', 'กองทุนที่ 4']"
                    placeholder="เลือกกองทุน"
                    value-type="string"
                  /><span v-if="errors.fund" class="text-red-600 text-xs -mt-2 -mb-10 ">{{
                    errors.fund
                  }}</span>
                </div>
              </div>
              <div>
                <div class="flex flex-col gap-1.5">
                  <span>ขอนำส่งเงิน <span class="text-red-600">*</span></span>
                  <select id="moneyType" placeholder="รายได้/เงินโครงการ" autocomplete="off" v-model="formData.moneyType">
                    <option value=""></option>
                    <option value="รายได้">รายได้</option>
                    <option value="เงินโครงการ">เงินโครงการ</option>
                  </select>

                  <span v-if="errors.moneyType" class="text-red-600 text-xs mt-[3px] ">{{
                    errors.moneyType
                  }}</span>
                </div>
              </div>
              <div>
                <div class="flex flex-col gap-1.5">
                  <span>รหัสโครงงาน <span class="text-red-600">*</span></span>
                  <InputText
                    type="text"
                    placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ"
                    v-model="formData.projectCode"
                  />
                  <span v-if="errors.projectCode" class="text-red-600 text-xs -mt-1 ">{{
                    errors.projectCode
                  }}</span>
                </div>
              </div>
            </div>
            <div class="mt-5">
              <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 ">
              <span class="w-1 h-6 bg-blue-500 rounded-full"></span>
              ข้อมูลรายการ
            </h2>
            </div>
            <div class="bg-gray-50 rounded-xl p-6 mt-">
              <div class="gap-2 flex flex-col">
                <div>รายการลูกหนี้ <span class="text-red-600">*</span></div>
                <div class="flex flex-col gap-2 divide-y-4 divide-[#ffffff] rounded-xl ">
                  <div v-for="(row, index) in morelist" :key="index" class="pt-4">
                    <div class="grid grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr] gap-2">
                      <div>
                        <InputText v-model="row.item" type="text" placeholder="ชื่อรายการ" @input="() => clearRowError(index, 'item')" />
                        <span
                          v-if="errors.rows?.[index]?.item"
                          class="text-red-600 text-xs -mt-2 -mb-[14px]"
                          >{{ errors.rows[index].item }}</span
                        >
                      </div>
                      <div>
                        <InputText
                          v-model="row.ref"
                          type="text"
                          placeholder="เลขที่เอกสารอ้างอิง"
                          @input="() => clearRowError(index, 'ref')"
                        />
                        <span
                          v-if="errors.rows?.[index]?.ref"
                          class="text-red-600 text-xs -mt-2 -mb-[14px]"
                          >{{ errors.rows[index].ref }}</span
                        >
                      </div>
                      <div>
                        <button
                          class="w-full px-4 py-2 mb-2 bg-[#7E22CE] text-white rounded-md"
                          @click="openModalForRow(index)"
                        >
                          จำนวนเงินรวม
                        </button>
                        <Modal
                          v-if="showModal === index"
                          :show="true"
                          :items="rowItems[index]"
                          @close="showModal = null"
                          @input="() => clearRowError(index, 'selectedItems')"
                          @update:selected="(selected) => updateSelectedItems(index, selected)"
                        />
                        <span
                          v-if="errors.rows?.[index]?.selectedItems"
                          class="text-red-600 text-xs -mt-2 -mb-[14px]"
                          >{{ errors.rows[index].selectedItems }}</span
                        >
                      </div>

                      <div>
                        <InputText v-model="row.type" type="text" placeholder="ภายนอก/ภายใน" @input="() => clearRowError(index, 'type')" />
                        <span
                          v-if="errors.rows?.[index]?.type"
                          class="text-red-600 text-xs -mt-2 -mb-[14px]"
                          >{{ errors.rows[index].type }}</span
                        >
                      </div>
                    </div>
                    <div class="mt-2">
                      <input
                        :ref="(el) => (keywordInputs[index] = el)"
                        v-model="row.keyword"
                        type="text"
                        placeholder="keyword"
                        class="mb-2 "
                        @input="() => clearRowError(index, 'keyword')"
                      />
                      <span
                        v-if="errors.rows?.[index]?.keyword"
                        class="text-red-600 text-xs -mt-2 -mb-[14px]"
                        >{{ errors.rows[index].keyword }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
              <button
                @click="addRow"
                class="p-5 border border-dashed border-blue-600 bg-white text-blue-600 hover:text-[#7E22CE] py-3 rounded text-sm font-medium hover:bg-gray-200 hover:border-[#7E22CE] transition mt-5"
              >
                + เพิ่มรายการใหม่
              </button>
            </div>

            <div class="mt-5">
              <div class="bg-[#7E22CE] border border-blue-200 rounded p-6 mb-6">
                <div class="flex justify-between items-center">
                  <span class="text-2xl font-bold text-white">จำนวนเงินรวมทั้งหมด</span>
                  <span class="text-3xl font-bold text-white"
                    >{{ formatNumber(totalAmount) }} บาท</span
                  >
                </div>
              </div>
            </div>

            <div class="bg-yellow-50 border border-yellow-300 rounded p-3 mb-6 mt-6">
              <p class="text-sm text-yellow-900 m-0">
                <strong>หมายเหตุ:</strong>
                กรุณาตรวจสอบข้อมูลให้ถูกต้องและครบถ้วนก่อนกดปุ่มบันทึกข้อมูล (ช่องที่มีเครื่องหมาย *
                จำเป็นต้องกรอก)
              </p>
            </div>
          </section>

          <div class="mt-6 flex justify-end gap-3">
            <button
              class="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-red-700"
              @click="gotomainpage()"
            >
              กลับ
            </button>
            <button
              class="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-green-300"
              @click="saveData"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/bar/navbar.vue'
import SecondNavbar from '@/components/bar/secoudnavbar.vue'
import Selects from '@/components/input/select.vue'
import router from '@/router'
import InputText from '@/components/input/inputtext.vue'
import { ref, computed, onMounted } from 'vue'
import Modal from '@/components/modal/modal.vue'
import TomSelect from 'tom-select'
import 'tom-select/dist/css/tom-select.css'
import { nextTick, watch } from 'vue'
const formData = ref({
  name: '',
  phone: '',
  department: '',
  fund: '',
  moneyType: '',
  projectCode: '',
})

const morelist = ref([
  {
    item: '',
    ref: '',
    keyword: '',
    type: '',
    selectedItems: [],
  },
])
//====================================================================
const keywordInputs = [] // array ref เก็บ element ของแต่ละแถว

onMounted(() => {
  const selectEl = document.getElementById("moneyType");

  if (!selectEl.tomselect) { // เช็คว่า init ไปแล้วหรือยัง
    new TomSelect(selectEl, {
      create: true,
      sortField: { field: "text", direction: "asc" },
      allowEmptyOption: true,
      placeholder: "รายได้/เงินโครงการ",
      onChange(value) {
        formData.value.moneyType = value;
      }
    });
  }
  // กำหนด style ให้ control
  const control = selectEl.tomselect.control;
  control.style.height = "2.5rem"; // เปลี่ยนเป็น 3rem, 3.5rem, 4rem
  control.style.padding = "1 0.5rem";
  control.style.display = "flex";
  control.style.alignItems = "center";
  control.style.borderRadius = "0.375rem"; // rounded-md
  control.style.border = "1px solid #6b7280"; // gray-500
  control.style.fontSize = "1rem";
    const input = control.querySelector('input');
  if (input) {
    input.style.fontSize = "1.01rem"; // ขนาดฟอนต์
    input.style.height = "1rem"; // ความสูงของ input
    input.style.padding = "0.5rem"; // padding ข้างใน
  }

  
  
  morelist.value.forEach((_, i) => initTomSelect(i))
})

const initTomSelect = (index) => {
  nextTick(() => {
    const input = keywordInputs[index]
    if (!input) return

    new TomSelect(input, {
      persist: false,
      createOnBlur: true,
      create: true,
      controlClass:'Style-Tom',
            dropdownClass: 'custom-dropdown',
      options: [],
      onChange(value) {
        morelist.value[index].keyword = value
      },
    })
  })
}

// watch ตอนเพิ่มแถวใหม่
watch(morelist, (newVal, oldVal) => {
  if (newVal.length > oldVal.length) {
    initTomSelect(newVal.length - 1)
  }
})

const addRow = () => {
  morelist.value.push({
    item: '',
    ref: '',
    amount: '',
    keyword: '',
    type: '',
    selectedItems: [],
  })

  // ให้ Vue รัน DOM update ก่อน แล้ว init TomSelect
  nextTick(() => {
    initTomSelect(morelist.value.length - 1)
  })
}

//=======================================================

const errors = ref({})

const totalAmount = computed(() => {
  return morelist.value.reduce((sum, row) => {
    if (!row.selectedItems) return sum

    const rowTotal = row.selectedItems.reduce((s, item) => {
      const amount = Number(item.amount) || 0
      return s + amount
    }, 0)

    return sum + rowTotal
  }, 0)
})

const formatNumber = (num) => {
  return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const updateSelectedItems = (rowIndex, selected) => {
  morelist.value[rowIndex].selectedItems = selected.filter((i) => i.checked)
}

const showModal = ref(null)
const rowItems = ref([])
const openModalForRow = (index) => {
  if (!rowItems.value[index]) {
    rowItems.value[index] = JSON.parse(
      JSON.stringify([
        { name: 'เงินสด', checked: false, amount: '' },
        { name: 'เช็คธนาคาร', checked: false, amount: '', NumCheck: '' },
        { name: 'ฝากเข้าบัญชีธนาคาร', checked: false, amount: '', AccountNum: '', AccountName: '' },
      ]),
    )
  }
  showModal.value = index
}
const saveData = () => {
  errors.value = {}
  let hasError = false // flag ว่ามี error ไหม

  // ตรวจสอบฟอร์มหลัก
  if (!formData.value.name) {
    errors.value.name = 'กรุณากรอก ชื่อ'
    hasError = true
  }
  if (!formData.value.phone) {
    errors.value.phone = 'กรุณากรอก เบอร์โทรติดต่อ'
    hasError = true
  }
  if (!formData.value.department) {
    errors.value.department = 'กรุณากรอก สังกัด'
    hasError = true
  }
  if (!formData.value.fund) {
    errors.value.fund = 'กรุณาเลือก กองทุน'
    hasError = true
  }
  if (!formData.value.moneyType) {
    errors.value.moneyType = 'กรุณากรอก ขอนำส่งเงิน'
    hasError = true
  }
  if (!formData.value.projectCode) {
    errors.value.projectCode = 'กรุณากรอก รหัสโครงงาน'
    hasError = true
  }

  // ตรวจสอบแต่ละแถว
  errors.value.rows = {}
  for (let i = 0; i < morelist.value.length; i++) {
    const row = morelist.value[i]
    errors.value.rows[i] = {}

    if (!row.item) {
      errors.value.rows[i].item = 'กรุณากรอก ชื่อรายการ'
      hasError = true
    }

    if (!row.ref) {
      errors.value.rows[i].ref = 'กรุณากรอก เลขที่เอกสารอ้างอิง'
      hasError = true
    }

    if (!row.selectedItems || row.selectedItems.length === 0 || row.selectedItems.some(item => item.checked && !item.amount)) {
      errors.value.rows[i].selectedItems = 'กรุณากรอก จำนวนเงินให้ครบถ้วน'
      hasError = true
    }

    if (!row.keyword) {
      errors.value.rows[i].keyword = 'กรุณากรอก keyword'
      hasError = true
    }

    if (!row.type) {
      errors.value.rows[i].type = 'กรุณากรอก ภายนอกหรือภายใน'
      hasError = true
    }
  }

  // ถ้ามี error ไหนเลย ไม่บันทึก
  if (hasError) return

  // ถ้าผ่านการตรวจสอบทั้งหมด
  const dataToSave = {
    formData: formData.value,
    morelist: morelist.value,
    totalAmount: totalAmount.value,
  }

  console.log('=== ข้อมูลที่บันทึก ===')
  console.log(JSON.stringify(dataToSave, null, 2))

  alert('บันทึกข้อมูลสำเร็จ! ดูข้อมูลใน Console')
  errors.value = {}
}

const clearRowError = (rowIndex, field) => {
  if (errors.value.rows?.[rowIndex]?.[field]) {
    // ถ้ามี error ตัวนี้อยู่แล้วและกรอกข้อมูลแล้ว ให้ลบ
    if (morelist.value[rowIndex][field]) {
      delete errors.value.rows[rowIndex][field]

      // ถ้าไม่มี error ใน row นี้เหลืออยู่เลย ลบ row ทั้งหมดออก
      if (Object.keys(errors.value.rows[rowIndex]).length === 0) {
        delete errors.value.rows[rowIndex]
      }
    }
  }
}

watch(formData, (newVal) => {
  for (const key in newVal) {
    if (errors.value[key] && newVal[key]) {
      delete errors.value[key]
    }
  }
}, { deep: true })

const gotomainpage = () => {
  router.push('/')
}
</script>

<style scoped>

:deep(.Style-Tom) {
  border: 1px solid #6b7280 !important;
  width: 100%;
  border-radius: 0.375rem !important;
  padding: 0.19rem 0.5rem !important;
  display: flex !important;
  flex-wrap: wrap !important;
  align-items: flex-start !important; /* เปลี่ยนจาก center เป็น flex-start */
  gap: 0.15rem !important;
  background-color: #ffffff !important;
  font-size: medium;
}

:deep(.Style-Tom input) {
  flex: none !important; /* ไม่ให้ขยาย */
  min-width: 50px !important;
  width: 100px !important; /* กำหนดความกว้างแน่นอน */
  padding: 0.25rem !important;
  text-align: center;
}
:deep(.Style-Tom .item) {
  background-color: #f3f4f6; /* เทาอ่อน */
  border: 1px solid #d1d5db; /* เส้นกรอบ */
  border-radius: 0.375rem; /* โค้งนิดๆ */
  padding: 2px 8px;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}


:deep(#moneyType.tom-select) {
  width: 100%;
  height: 2.5rem; /* h-10 */
}

:deep(#moneyType.tom-select .ts-control) {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 0.5rem; /* px-2 */
}


</style>
