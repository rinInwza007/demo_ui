import { ref, nextTick } from 'vue'
import TomSelect from 'tom-select'

export function useRowManager() {
const morelist = ref([
  {
    id: Date.now(),   // 👈 เพิ่ม id
    item: '',
    ref: '',
    keyword: '',
    type: '',
    selectedItems: [],
  },
])

const showModal = ref(null)
const rowItems = ref([])
const keywordInputs = []

  // init TomSelect สำหรับแต่ละ row
const initTomSelect = (index) => {
  nextTick(() => {
    const input = keywordInputs[index]
    if (!input || input.tomselect) return

    new TomSelect(input, {
      persist: false,
      createOnBlur: true,
      create: true,
      controlClass: 'Style-Tom',
      dropdownClass: 'custom-dropdown',
      options: [],
      onChange(value) {
        morelist.value[index].keyword = value
      },
    })
  })
}

  // add row ใหม่
const addRow = () => {
  morelist.value.push({
    id: Date.now() + Math.random(), 
    item: '',
    ref: '',
    keyword: '',
    type: '',
    selectedItems: [],
  })

  nextTick(() => {
    initTomSelect(morelist.value.length - 1)
  })
}

  // remove row
const removeRow = (index) => {
  if (morelist.value.length > 1) {
    morelist.value.splice(index, 1)
  }
}

  // เปิด modal สำหรับ row
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

  // อัปเดต selected items หลังเลือกใน modal
const updateSelectedItems = (rowIndex, selected) => {
  morelist.value[rowIndex].selectedItems = selected.filter((i) => i.checked)
}

  return {
    morelist,
    showModal,
    rowItems,
    keywordInputs,
    initTomSelect,
    addRow,
    removeRow,
    openModalForRow,
    updateSelectedItems,
  }
}
