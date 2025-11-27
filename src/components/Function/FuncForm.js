import { ref, nextTick , computed } from 'vue'
import TomSelect from 'tom-select'

export function useRowManager() {

const morelist = ref([
  {
     id: 1,   // 👈 เพิ่ม id
    itemName: null,
    referenceNo: '',
    keyword: null,
    note: '',
    fee: '',
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
    itemName: null,
    referenceNo: '',
    note: '',
    Fee:'',
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
        { 
          name: 'cash', 
          checked: false, 
          amount: '', 
          referenceNo: '',
          type: 'เงินสด',
          paymentType: 'เงินสด'
        },
        { 
          name: 'bank', 
          checked: false, 
          amount: '', 
          referenceNo: '',
          NumCheck: '',
          type: 'เช็คธนาคาร',
          paymentType: 'เช็คธนาคาร'
        },
        { 
          name: 'transfer', 
          checked: false, 
          amount: '', 
          referenceNo: '',
          AccountNum: '', 
          AccountName: '',
          type: 'ฝากเข้าบัญชี',
          paymentType: 'ฝากเข้าบัญชี'
        },
      ]),
    )
  }
  showModal.value = index
}
  const updateSelectedItems = (rowIndex, selectedItems) => {
    console.log('updateSelectedItems called:', { rowIndex, selectedItems }) // 👈 Debug
    
    morelist.value[rowIndex].selectedItems = selectedItems.map(item => ({
      ...item,
      type: item.type || item.paymentType || 'ไม่ระบุ', // ตรวจสอบว่ามี type
      checked: item.checked
    }))
    
    console.log('Updated morelist:', morelist.value[rowIndex]) // 👈 Debug
  }

const summaryByType = computed(() => {
  const summary = {
    เงินสด: 0,
    เช็คธนาคาร: 0,
    ฝากเข้าบัญชี: 0,
  }

  morelist.value.forEach((row) => {
    if (!row.selectedItems) return

    row.selectedItems.forEach((item) => {
      if (!item.checked || !item.amount) return

      const amount = Number(item.amount) || 0

      if (item.name === 'เงินสด') {
        summary.เงินสด += amount
      } else if (item.name === 'เช็คธนาคาร') {
        summary.เช็คธนาคาร += amount
      } else if (item.name === 'ฝากเข้าบัญชี') {
        summary.ฝากเข้าบัญชี += amount
      }
    })
  })

  return summary
})


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
// Computed: ค่าธรรมเนียมรวม
const totalFee = computed(() => {
  return morelist.value.reduce((sum, row) => {
    const fee = Number(row.fee) || 0
    return sum + fee
  }, 0)
})

// Computed: ยอดสุทธิหลังหักค่าธรรมเนียม
const netTotalAmount = computed(() => {
  return totalAmount.value - totalFee.value
})

// Computed: รายละเอียดแต่ละแถว (ปรับปรุงให้มีข้อมูลครบ)
const detailsByRow = computed(() => {
  return morelist.value
    .map((row, index) => {
      if (!row.selectedItems || row.selectedItems.length === 0) {
        return null
      }

      const checkedItems = row.selectedItems
        .filter((item) => item.checked)
        .map((item) => {
          // 👇 ใช้ type ที่ส่งมาจาก modal โดยตรง
          const itemType = item.type || item.paymentType || 'ไม่ระบุ'

          return {
            type: itemType,
            amount: Number(item.amount) || 0,
            referenceNo: item.referenceNo || '–',
            // เช็คธนาคาร
            checkNumber: item.checkNumber || item.NumCheck || null,
            // ฝากเข้าบัญชี
            accountNumber: item.accountNumber || item.AccountNum || null,
            accountName: item.accountName || item.AccountName || null,
          }
        })
      
      if (checkedItems.length === 0) {
        return null
      }

      const subtotal = checkedItems.reduce((sum, item) => {
        return sum + (Number(item.amount) || 0)
      }, 0)

      const fee = Number(row.fee) || 0
      const netAmount = subtotal - fee

      return {
        rowIndex: index,
        itemName: row.itemName,
        items: checkedItems,
        fee: fee,
        note: row.note,
        subtotal: subtotal,
        netAmount: netAmount,
        keyword: row.keyword
      }
    })
    .filter((item) => item !== null)
})

  return {
    totalAmount,
    totalFee,
    netTotalAmount,
    summaryByType,
    detailsByRow,
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
