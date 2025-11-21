<template>
  <div >
    <Navbar/>
    <SecondNavbar />
<div class="max-w-5xl mx-auto p-6 pt-5 ">
  <div class="bg-white border border-gray-300 rounded-xl shadow-sm p-10 space-y-9">

    <h1 class="text-center text-3xl  ">
      เพิ่มใบนำส่งใหม่
    </h1>

<div class="max-w-4xl mx-auto p-6 pt-8 mt-10">
    <section >
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-4">
        <div>
          <div class="flex flex-col gap-1.5 ">
            <span>ข้าพเจ้า *</span>
            <InputText v-model="formData.name" type="text" />
            <span v-if="errors.name" class="text-red-600 text-xs -mt-2 -mb-[14px] ">{{ errors.name }}</span>

          </div>
        </div>
        <div>
          <div class="flex flex-col gap-1.5 ">
            <span>เบอร์โทรติดต่อ *</span>
            <InputText v-model="formData.phone" type="text" />  <span v-if="errors.phone" class="text-red-600 text-xs -mt-2 -mb-[14px] ">{{ errors.phone }}</span>
          </div>
        </div>
        <div>
          <div class="flex flex-col gap-1.5">
            <span>สังกัด *</span>
              <InputText v-model="formData.department" type="text" /><span v-if="errors.department" class="text-red-600 text-xs -mt-2 -mb-[14px] ">{{ errors.department }}</span>
          </div>
        </div>
        <div>
          <div class="flex flex-col gap-1.5">
            <span>กองทุน *</span>
            <Selects
              type="text"
               v-model="formData.fund"
              :options="['กองทุนที่ 1', 'กองทุนที่ 2', 'กองทุนที่ 3', 'กองทุนที่ 4']"
              placeholder="เลือกหมวดหมู่"
              value-type="string"
            /><span v-if="errors.fund" class="text-red-600 text-xs  -mb-[18px] ">{{ errors.fund }}</span>
          </div>
        </div>
        <div>
          <div class="flex flex-col gap-1.5">
            <span>ขอนำส่งเงิน *</span>
            <InputText v-model="formData.moneyType" type="text" placeholder="รายได้/เงินโครงการ " />
            <span v-if="errors.moneyType" class="text-red-600 text-xs -mt-2 -mb-[14px] ">{{ errors.moneyType }}</span>
          </div>
        </div>
        <div>
          <div class="flex flex-col gap-1.5 ">
            <span>รหัสโครงงาน *</span>
            <InputText type="text" placeholder="กรณีเงินโครงการจากแหล่งทุนภายนอก/ศูนย์ต่างๆ" v-model="formData.projectCode" />
            <span v-if="errors.projectCode" class="text-red-600 text-xs -mt-2 -mb-[14px] ">{{ errors.projectCode }}</span>
            </div>
        </div>


      </div>

      <div class="gap-2 flex flex-col mt-5">
        <div>นำส่งเงิน</div>

        <div class="flex flex-col gap-2">
          <div
            v-for="(row, index) in morelist"
            :key="index"
            class="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2"
          >

          <div>
            <InputText v-model="row.item" type="text" placeholder="ชื่อรายการ" />
            <span v-if="errors.rows?.[index]?.item" class="text-red-600 text-xs -mt-2 -mb-[14px] ">{{ errors.rows[index].item }}</span>
            </div>
            <div>
            <InputText v-model="row.ref" type="text" placeholder="เลขที่เอกสารอ้างอิง" />
            <span v-if="errors.rows?.[index]?.ref" class="text-red-600 text-xs -mt-2 -mb-[14px] ">{{ errors.rows[index].ref }}</span>
            </div>
  <div>
    <button class="w-full px-4 py-2 bg-blue-500 text-white rounded" @click="openModalForRow(index)">
      จำนวนเงินรวม
    </button>
              <Modal
                v-if="showModal === index"
                :show="true"
                :items="rowItems[index]"
                @close="showModal = null"
                  @update:selected="(selected) => updateSelectedItems(index, selected)"
              />
              <span v-if="errors.rows?.[index]?.selectedItems" class="text-red-600 text-xs -mt-2 -mb-[14px] ">{{ errors.rows[index].selectedItems }}</span>

  </div>

<div>
            <InputText v-model="row.note" type="text" placeholder="keyword" />
            <span v-if="errors.rows?.[index]?.note" class="text-red-600 text-xs -mt-2 -mb-[14px] ">{{ errors.rows[index].note }}</span>
            </div>
            <div>
            <InputText v-model="row.type" type="text" placeholder="ภายนอก/ภายใน" />
            <span v-if="errors.rows?.[index]?.type" class="text-red-600 text-xs -mt-2 -mb-[14px] ">{{ errors.rows[index].type }}</span>
</div>
          </div>
        </div>
      </div>

      <div>
        <div>
          <button
            class="mt-3 text-gray-500"
            @click="
              morelist.push({
                item: '',
                ref: '',
                amount: '',
                note: '',
                type: '',
                selectedItems: []
              })
            "
          >
            [+] เพิ่มรายการ
          </button>
        </div>
      </div>

      <div class="mt-5">
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-2 items-start">
          <div></div>
          <div>
            <div>จำนวนเงินรวม</div>
            <input
              class="mt-2 bg-gray-300 border border-gray-500 px-5 rounded-md shadow-md shadow-gray-500"
              type="number"
              placeholder="xx,xxx"
                :value="totalAmount"
              readonly
            />
          </div>
        </div>
      </div>

      <div class="mt-5">
        <div>กรุณากรอกช่อง*ทุกช่อง</div>
      </div>
    </section>

    <div class="mt-6 flex justify-end gap-3 mb-4">
  <button
    @click="gotomainpage"
    class="px-6 py-2 rounded-md bg-gray-600 text-white btn-back"
  >
    กลับ
  </button>

  <button
    @click="saveData"
    class="px-6 py-2 rounded-md bg-gray-600 text-white btn-save"
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
import { ref,computed } from 'vue'
import Modal from '@/components/modal/modal.vue'

const formData = ref({
  name: '',
  phone: '',
  department: '',
  fund: '',
  moneyType: '',
  projectCode: ''
})

const morelist = ref([
  {
    item: '',
    ref: '',
    amount: '',
    note: '',
    type: '',
    selectedItems: []
  },
])

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

const updateSelectedItems = (rowIndex, selected) => {
  morelist.value[rowIndex].selectedItems = selected.filter(i => i.checked)

}

const showModal= ref(null)
const rowItems = ref([])
const openModalForRow = (index) => {
if (!rowItems.value[index]) {
  rowItems.value[index] = JSON.parse(JSON.stringify([
    { name: 'เงินสด', checked: false, amount: '' },
    { name: 'เช็คธนาคาร', checked: false, amount: '', NumCheck: '' },
    { name: 'ฝากเข้าบัญชีธนาคาร', checked: false, amount: '', AccountNum: '', AccountName: '' },
  ]))
}
  showModal.value = index
}
const saveData = () => {
  errors.value = {}

  // ตรวจสอบฟอร์มหลัก
  if (!formData.value.name) {
    errors.value.name = 'กรุณากรอก "ชื่อ"'
    return
  }
  if (!formData.value.phone) {
    errors.value.phone = 'กรุณากรอก "เบอร์โทรติดต่อ"'
    return
  }
  if (!formData.value.department) {
    errors.value.department = 'กรุณากรอก "สังกัด"'
    return
  }
  if (!formData.value.fund) {
    errors.value.fund = 'กรุณาเลือก "กองทุน"'
    return
  }
  if (!formData.value.moneyType) {
    errors.value.moneyType = 'กรุณากรอก "ขอนำส่งเงิน"'
    return
  }
  if (!formData.value.projectCode) {
    errors.value.projectCode = 'กรุณากรอก "รหัสโครงงาน"'
    return
  }
  errors.value.rows = {}
  for (let i = 0; i < morelist.value.length; i++) {
    const row = morelist.value[i]
    errors.value.rows[i] = {}

    if (!row.item) {
      errors.value.rows[i].item = 'กรุณากรอก "ชื่อรายการ"'
      return
    }

    if (!row.ref) {
      errors.value.rows[i].ref = 'กรุณากรอก "เลขที่เอกสารอ้างอิง"'
      return
    }

    if (!row.selectedItems || row.selectedItems.length === 0) {
      errors.value.rows[i].selectedItems = 'กรุณาเลือกและกรอก "จำนวนเงิน"'
      return
    }

    if (!row.note) {
      errors.value.rows[i].note = 'กรุณากรอก "keyword"'
      return
    }

    if (!row.type) {
      errors.value.rows[i].type = 'กรุณากรอก "ภายนอก/ภายใน"'
      return
    }
  }

// ถ้ามี error ไหนเลย ไม่บันทึก
  // ถ้าผ่านการตรวจสอบทั้งหมด
  const dataToSave = {
    formData: formData.value,
    morelist: morelist.value,
    totalAmount: totalAmount.value
  }

  console.log('=== ข้อมูลที่บันทึก ===')
  console.log(JSON.stringify(dataToSave, null, 2))

  alert('บันทึกข้อมูลสำเร็จ! ดูข้อมูลใน Console')
  errors.value = {}
}

const gotomainpage = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.btn-back,
.btn-save {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.btn-back:hover {
  transform: scale(1.06);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  background-color: #b91c1c; /* แดง */
}

.btn-save:hover {
  transform: scale(1.06);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  background-color: green; /* เขียว */
}
</style>
