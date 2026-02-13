// src/components/Function/FuncForm.js
import { ref, computed } from 'vue'

export function useRowManager() {
const morelist = ref([
  {
    id: 1,
    itemId: null,
    type: 'income',
    itemName: null,
    referenceNo: '',
    note: '',
    amount: '',
    receiptType: [],
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
    type: 'income',
    isExpense: false,
    itemName: null,
    referenceNo: '',
    note: '',
    amount: '',
    receiptType: [],
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
  const type = morelist.value[index].type
  console.log(`รายการที่ ${index + 1} เปลี่ยนเป็น: ${type === 'income' ? 'รายรับ' : 'รายจ่าย'}`)
}

  const rowItems = ref([])

const totalAmount = computed(() => {
  return morelist.value.reduce((sum, row) => {
    const cleanAmount = String(row.amount || '0').replace(/,/g, '')
    const amount = Number(cleanAmount) || 0
    return row.type === 'expense' ? sum - amount : sum + amount
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

  // ✅ ฟังก์ชันคำนวณยอดรวมตามประเภทการชำระ
  const calculatePaymentTypeTotals = () => {
    const totals = {
      cash: 0,
      check: 0,
      transfer: 0
    }

    morelist.value.forEach(row => {
      const cleanAmount = String(row.amount || '0').replace(/,/g, '')
      const amount = Number(cleanAmount) || 0

      if (amount > 0 && row.paymentTypes) {
        if (row.paymentTypes.cash) totals.cash += amount
        if (row.paymentTypes.check) totals.check += amount
        if (row.paymentTypes.transfer) totals.transfer += amount
      }
    })

    return totals
  }


  const expenseTotalAmount = computed(() => {
  return morelist.value.reduce((sum, row) => {
    if (row.isCancelled) return sum // ข้ามรายการที่ยกเลิก
    if ((row.isExpense || row.type === 'expense') && row.amount) {
      const amount = parseFloat(String(row.amount).replace(/,/g, ''))
      return sum + (isNaN(amount) ? 0 : amount)
    }
    return sum
  }, 0)
})

// ✅ นับจำนวนรายการรายจ่าย
const expenseCount = computed(() => {
  return morelist.value.filter((row) => 
    !row.isCancelled && (row.isExpense || row.type === 'expense') && row.amount
  ).length
})

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
    handleTypeChange,
    calculatePaymentTypeTotals,
    expenseCount,
    expenseTotalAmount
  }
}