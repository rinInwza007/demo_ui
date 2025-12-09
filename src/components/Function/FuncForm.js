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
    Fee:'',
    keyword: null,
    selectedItems: JSON.parse(JSON.stringify(defaultItems)),
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
  const defaultItems = [
    { 
      name: 'เงินสด',
      moneyType: 'cash',
      checked: false,
      amount: '',
      referenceNo: ''
    },
    { 
      name: 'เช็ค',
      moneyType: 'bank',
      checked: false,
      amount: '',
      referenceNo: '',
      NumCheck: '',
      checkNumber: ''
    },
    { 
      name: 'ฝากเข้าบัญชี',
      moneyType: 'transfer',
      checked: false,
      amount: '',
      referenceNo: '',
      AccountNum: '',
      accountNumber: '',
      AccountName: '',
      accountName: '',
      BankName: '',
      bankName: ''
    }
  ];

  const existing = morelist.value[index]?.selectedItems || [];

  const merged = defaultItems.map(def => {
    const exist = existing.find(i => i.moneyType === def.moneyType);

    if (exist) {
      return {
        ...def,
        ...exist,
        checked: exist.amount && Number(exist.amount) > 0 ? true : exist.checked,
        name: exist.name || def.name
      };
    }

    return { ...def };
  });

  rowItems.value[index] = merged;
  showModal.value = index;

  console.log('📌 Modal items for row', index, merged);
};
// ใน FuncForm.js หรือใน addwaybill.vue
// แก้ไข function updateSelectedItems ให้เป็นแบบนี้:

const updateSelectedItems = (index, selected) => {
  console.log('📥 Received from Modal:', selected)
  
  morelist.value[index].selectedItems = selected.map(item => {
    // ✅ สร้าง object ใหม่ที่มีข้อมูลครบถ้วน
    const mappedItem = {
      checked: item.checked,
      name: item.name,
      amount: item.amount || '',
      referenceNo: item.referenceNo || '',
      moneyType: item.moneyType,
      type: item.type || item.paymentType,
    }

    // สำหรับเช็คธนาคาร
    if (item.NumCheck !== undefined || item.checkNumber !== undefined) {
      mappedItem.NumCheck = item.NumCheck || item.checkNumber || ''
      mappedItem.checkNumber = item.checkNumber || item.NumCheck || ''
    }

    // ✅ สำหรับฝากเข้าบัญชี - เก็บทั้ง 2 รูปแบบ
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

const getRowDetail = (rowIndex) => {
  const detail = detailsByRow.value.find(d => d.rowIndex === rowIndex)
  return detail || null
}

// Computed: ยอดสุทธิหลังหักค่าธรรมเนียม
const netTotalAmount = computed(() => {
  return totalAmount.value - totalFee.value
})

// Computed: รายละเอียดแต่ละแถว (ปรับปรุงให้มีข้อมูลครบ)
const detailsByRow = computed(() => {
  console.log('detailsByRow computing...', morelist.value)
  
  return morelist.value
    .map((row, index) => {
      // ✅ เปลี่ยนเงื่อนไข: แสดงถ้ามีข้อมูลอย่างใดอย่างหนึ่ง
      const hasItemName = row.itemName && row.itemName.trim() !== ''
      const hasFee = row.fee && row.fee !== ''
      const hasNote = row.note && row.note.trim() !== ''
      const hasSelectedItems = row.selectedItems && row.selectedItems.some(item => item.checked)

      // ถ้าไม่มีข้อมูลเลย ก็ไม่แสดง
      if (!hasItemName && !hasFee && !hasNote && !hasSelectedItems) {
        return null
      }

      // ประมวลผล selectedItems (ถ้ามี)
      const checkedItems = row.selectedItems
        ? row.selectedItems
            .filter((item) => item.checked)
            .map((item) => {
              console.log('Item:', item)
              
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

      const subtotal = checkedItems.reduce((sum, item) => sum + item.amount, 0)
      const fee = Number(row.fee) || 0
      const netAmount = subtotal - fee

      return {
        rowIndex: index,
        itemName: row.itemName || 'ยังไม่ระบุชื่อรายการ', // ✅ แสดง fallback
        items: checkedItems,
        fee: fee,
        note: row.note || '', // ✅ แสดงว่าง ถ้ายังไม่กรอก
        subtotal: subtotal,
        netAmount: netAmount,
        keyword: row.keyword,
        // ✅ เพิ่ม flag เพื่อบอกว่ามีข้อมูลอะไรบ้าง
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
