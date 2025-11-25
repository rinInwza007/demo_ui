import { ref, nextTick } from 'vue'
import TomSelect from 'tom-select'

export function useRowManager() {

const morelist = ref([
  {
     id: 1,   // 👈 เพิ่ม id
    itemName: '',
    referenceNo: '',
    keyword: null,
    MoneySouce: '',
    selectedItems: [],
  },
])
const keywordInputs = []
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

const addRow = () => {
  morelist.value.push({
    id: morelist.value.length + 1, 
    itemName: '',
    referenceNo: '',
    MoneySouce: '',
    keyword: null,
    selectedItems: [],
  })

  nextTick(() => {
    initTomSelect(morelist.value.length - 1)
  })
}

const removeRow = (index) => {
  if (morelist.value.length > 1) {
    morelist.value.splice(index, 1)
  }
}

const showModal = ref(null)
const rowItems = ref([])

const openModalForRow = (index) => {
  if (!rowItems.value[index]) {
    rowItems.value[index] = JSON.parse(
      JSON.stringify([
        { name: 'cash', checked: false, amount: '' },
        { name: 'bank', checked: false, amount: '', NumCheck: '' },
        { name: 'transfer', checked: false, amount: '', AccountNum: '', AccountName: '' },
      ]),
    )
  }
  showModal.value = index
}
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
