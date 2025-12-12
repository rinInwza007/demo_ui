import { ref, nextTick, computed } from 'vue'
import TomSelect from 'tom-select'

export function useRowManager2() {

const totalDebt = ref(50000)

const totalDepositAmount = computed(() => {
  let sum = 0

  morelist.value.forEach(row => {
    if (!row.selectedItems) return
    row.selectedItems.forEach(item => {
      if (!item.checked) return

      const type = item.type || item.paymentType
      const amount = Number(item.amount) || 0

      if (type === 'ฝากเข้าบัญชี') {
        sum += amount
      }
    })
  })

  return sum
})

const remainingDebt = computed(() => {
  return totalDebt.value - totalDepositAmount.value
})

const morelist = ref([
  {
    id: 1,
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
    fee: '',
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
          BankName: '',
          type: 'ฝากเข้าบัญชี',
          paymentType: 'ฝากเข้าบัญชี'
        },
      ]),
    )
  }
  showModal.value = index
}

const updateSelectedItems = (rowIndex, selectedItems) => {
  console.log('updateSelectedItems called:', { rowIndex, selectedItems })

  morelist.value[rowIndex].selectedItems = selectedItems.map(item => ({
    ...item,
    type: item.type || item.paymentType || 'ไม่ระบุ',
    checked: item.checked
  }))

  console.log('Updated morelist:', morelist.value[rowIndex])
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
      const type = item.type || item.paymentType

      if (type === 'เงินสด') summary.เงินสด += amount
      if (type === 'เช็คธนาคาร') summary.เช็คธนาคาร += amount
      if (type === 'ฝากเข้าบัญชี') summary.ฝากเข้าบัญชี += amount
    })
  })

  return summary
})

const totalAmount = computed(() => {
  return morelist.value.reduce((sum, row) => {
    if (!row.selectedItems) return sum

    const rowTotal = row.selectedItems.reduce((s, item) => {
      if (!item.checked) return s
      return s + (Number(item.amount) || 0)
    }, 0)

    return sum + rowTotal
  }, 0)
})

const totalFee = computed(() => {
  return morelist.value.reduce((sum, row) => {
    const fee = Number(row.fee) || 0
    return sum + fee
  }, 0)
})

const netTotalAmount = computed(() => {
  return totalAmount.value - totalFee.value
})

const detailsByRow = computed(() => {
  return morelist.value
    .map((row, index) => {
      if (!row.selectedItems || row.selectedItems.length === 0) {
        return null
      }

      const checkedItems = row.selectedItems
        .filter((item) => item.checked)
        .map((item) => {
          const itemType = item.type || item.paymentType || 'ไม่ระบุ'

          return {
            type: itemType,
            amount: Number(item.amount) || 0,
            referenceNo: item.referenceNo || '–',
            checkNumber: item.checkNumber || item.NumCheck || null,
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
    remainingDebt,
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
