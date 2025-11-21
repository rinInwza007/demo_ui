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
    amount: '',
    keyword: '',
    type: '',
    selectedItems: [],
  },
])
//====================================================================
const keywordInputs = [] // array ref เก็บ element ของแต่ละแถว

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

// init แถวเริ่มต้น
onMounted(() => {
  morelist.value.forEach((_, i) => initTomSelect(i))
})

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
    errors.value.name = 'กรุณากรอก "ชื่อ"'
    hasError = true
  }
  if (!formData.value.phone) {
    errors.value.phone = 'กรุณากรอก "เบอร์โทรติดต่อ"'
    hasError = true
  }
  if (!formData.value.department) {
    errors.value.department = 'กรุณากรอก "สังกัด"'
    hasError = true
  }
  if (!formData.value.fund) {
    errors.value.fund = 'กรุณาเลือก "กองทุน"'
    hasError = true
  }
  if (!formData.value.moneyType) {
    errors.value.moneyType = 'กรุณากรอก "ขอนำส่งเงิน"'
    hasError = true
  }
  if (!formData.value.projectCode) {
    errors.value.projectCode = 'กรุณากรอก "รหัสโครงงาน"'
    hasError = true
  }

  // ตรวจสอบแต่ละแถว
  errors.value.rows = {}
  for (let i = 0; i < morelist.value.length; i++) {
    const row = morelist.value[i]
    errors.value.rows[i] = {}

    if (!row.item) {
      errors.value.rows[i].item = 'กรุณากรอก "ชื่อรายการ"'
      hasError = true
    }

    if (!row.ref) {
      errors.value.rows[i].ref = 'กรุณากรอก "เลขที่เอกสารอ้างอิง"'
      hasError = true
    }

    if (!row.selectedItems || row.selectedItems.length === 0) {
      errors.value.rows[i].selectedItems = 'กรุณาเลือกและกรอก "จำนวนเงิน"'
      hasError = true
    }

    if (!row.keyword) {
      errors.value.rows[i].keyword = 'กรุณากรอก "keyword"'
      hasError = true
    }

    if (!row.type) {
      errors.value.rows[i].type = 'กรุณากรอก "ภายนอก/ภายใน"'
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