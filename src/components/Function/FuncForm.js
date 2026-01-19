import { ref, computed } from 'vue'

export function useRowManager() {
const morelist = ref([
  {
    id: 1,
    itemId: null,
    type: 'income', // ✅
    itemName: null,
    referenceNo: '',
    note: '',
    amount: '',
  },
])

  const allowOnlyDigits = (e) => {
    if (!/[0-9 ,-,.,/]/.test(e.key)) {
      e.preventDefault()
    }
  }

const addRow = () => {
  morelist.value.push({
    id: morelist.value.length + 1,
    itemId: null,
    type: 'income', // ✅
    isExpense: false,
    itemName: null,
    referenceNo: '',
    note: '',
    amount: '',
  })
}

  const removeRow = (index) => {
    if (morelist.value.length > 1) {
      morelist.value.splice(index, 1)
    }
  }

  const formatAmount = (index) => {
    const value = morelist.value[index].amount
    if (value) {
      const numValue = parseFloat(value.toString().replace(/,/g, ''))
      if (!isNaN(numValue)) {
        morelist.value[index].amount = numValue.toLocaleString('th-TH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      }
    }
  }


const handleTypeChange = (index) => {
  // Optional: แสดง confirmation หรือ feedback
  const type = morelist.value[index].type
  console.log(`รายการที่ ${index + 1} เปลี่ยนเป็น: ${type === 'income' ? 'รายรับ' : 'รายจ่าย'}`)
}
  const rowItems = ref([])

const totalAmount = computed(() => {
  return morelist.value.reduce((sum, row) => {
    const cleanAmount = String(row.amount || '0').replace(/,/g, '')
    const amount = Number(cleanAmount) || 0
    return row.type === 'expense' ? sum - amount : sum + amount // ✅
  }, 0)
})

  const formattedTotalAmount = computed(() => {
    return totalAmount.value.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  })
  const updateItemId = (index, itemId) => {
    if (morelist.value[index]) {
      morelist.value[index].itemId = itemId
      console.log(`✅ Updated itemId at index ${index}:`, itemId)
    }
  }
  return {
    updateItemId,
    formatAmount,
    allowOnlyDigits,
    formattedTotalAmount,
    totalAmount,
    morelist,
    rowItems,
    addRow,
    removeRow,
    handleTypeChange
  }
}