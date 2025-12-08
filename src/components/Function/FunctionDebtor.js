import { ref, nextTick , computed } from 'vue'
import TomSelect from 'tom-select'

export function useRowManagerDebtor() {

const morelist = ref([
  {
    id: 1,
    itemName: null,
    referenceNo: '',
    keyword: null,
    note: '',
    fee: '',
    selectedItems: [],
    money: '',
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

const allowOnlyDigits = (e) => {
  if (!/[0-9 ,-,.]/.test(e.key)) {
    e.preventDefault()
  }
}

const defaultItems = [
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
]

const addRow = () => {
  morelist.value.push({
    id: morelist.value.length + 1, 
    itemName: null,
    referenceNo: '',
    note: '',
    fee: '',
    keyword: null,
    selectedItems: [],
    money: '',
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
  if (!morelist.value[index].selectedItems || morelist.value[index].selectedItems.length === 0) {
    morelist.value[index].selectedItems = JSON.parse(JSON.stringify(defaultItems))
  }
  
  const merged = defaultItems.map(defaultItem => {
    const existingItem = morelist.value[index].selectedItems.find(
      item => item.name === defaultItem.name
    )
    
    if (existingItem) {
      return { ...existingItem }
    }
    
    return { ...defaultItem }
  })
  
  rowItems.value[index] = merged
  showModal.value = index
}

const updateSelectedItems = (index, selected) => {
  console.log('📥 Received from Modal:', selected)
  
  morelist.value[index].selectedItems = selected.map(item => {
    const mappedItem = {
      checked: item.checked,
      name: item.name,
      amount: item.amount || '',
      referenceNo: item.referenceNo || '',
      moneyType: item.moneyType,
      type: item.type || item.paymentType,
    }

    if (item.NumCheck !== undefined || item.checkNumber !== undefined) {
      mappedItem.NumCheck = item.NumCheck || item.checkNumber || ''
      mappedItem.checkNumber = item.checkNumber || item.NumCheck || ''
    }

    if (item.AccountNum !== undefined || item.accountNumber !== undefined) {
      mappedItem.AccountNum = item.AccountNum || item.accountNumber || ''
      mappedItem.AccountName = item.AccountName || item.accountName || ''
      mappedItem.BankName = item.BankName || item.bankName || ''
      
      mappedItem.accountNumber = item.accountNumber || item.AccountNum || ''
      mappedItem.accountName = item.accountName || item.AccountName || ''
      mappedItem.bankName = item.bankName || item.BankName || ''
    }

    return mappedItem
  })
  
  console.log('💾 Saved to morelist:', morelist.value[index].selectedItems)
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

// ✅ ใช้ money แทน selectedItems
const totalAmount = computed(() => {
  return morelist.value.reduce((sum, row) => {
    const money = Number(row.money) || 0
    return sum + money
  }, 0)
})

const totalFee = computed(() => {
  return morelist.value.reduce((sum, row) => {
    const fee = Number(row.fee) || 0
    return sum + fee
  }, 0)
})

const getRowDetail = (rowIndex) => {
  const detail = detailsByRow.value.find(d => d.rowIndex === rowIndex)
  return detail || null
}

const netTotalAmount = computed(() => {
  return totalAmount.value - totalFee.value
})

// ✅ ใช้ money เป็น subtotal
const detailsByRow = computed(() => {
  console.log('detailsByRow computing...', morelist.value)
  
  return morelist.value
    .map((row, index) => {
      const hasItemName = row.itemName && row.itemName.trim() !== ''
      const hasFee = row.fee && row.fee !== ''
      const hasNote = row.note && row.note.trim() !== ''
      const hasMoney = row.money && row.money !== ''

      if (!hasItemName && !hasFee && !hasNote && !hasMoney) {
        return null
      }

      const checkedItems = row.selectedItems
        ? row.selectedItems
            .filter((item) => item.checked)
            .map((item) => {
              let itemType = 'ไม่ระบุ'
              
              if (item.moneyType) {
                if (item.moneyType === 'cash') itemType = 'เงินสด'
                else if (item.moneyType === 'bank') itemType = 'เช็คธนาคาร'
                else if (item.moneyType === 'transfer') itemType = 'ฝากเข้าบัญชี'
              } else if (item.name) {
                if (item.name === 'cash') itemType = 'เงินสด'
                else if (item.name === 'bank') itemType = 'เช็คธนาคาร'
                else if (item.name === 'transfer') itemType = 'ฝากเข้าบัญชี'
              }

              return {
                type: itemType,
                amount: Number(item.amount) || 0,
                referenceNo: item.referenceNo || '–',
                checkNumber: item.checkNumber || item.NumCheck || null,
                accountNumber: item.accountNumber || item.AccountNum || null,
                accountName: item.accountName || item.AccountName || null,
                bankName: item.bankName || item.BankName || null,
              }
            })
        : []

      const subtotal = Number(row.money) || 0
      const fee = Number(row.fee) || 0
      const netAmount = subtotal - fee

      return {
        rowIndex: index,
        itemName: row.itemName || 'ยังไม่ระบุชื่อรายการ',
        items: checkedItems,
        fee: fee,
        note: row.note || '',
        subtotal: subtotal,
        netAmount: netAmount,
        keyword: row.keyword,
        hasItemName,
        hasFee,
        hasNote,
        hasPayment: checkedItems.length > 0
      }
    })
    .filter((item) => item !== null)
})

  return {
    allowOnlyDigits,
    getRowDetail,
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