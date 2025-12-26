import { ref, computed } from 'vue'

export function useRowManager() {
  const morelist = ref([
    {
      id: 1,
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

  const showModal = ref(null)
  const rowItems = ref([])

  const totalAmount = computed(() => {
    return morelist.value.reduce((sum, row) => {
      const cleanAmount = String(row.amount || '0').replace(/,/g, '')
      const amount = Number(cleanAmount) || 0
      return sum + amount
    }, 0)
  })

  const formattedTotalAmount = computed(() => {
    return totalAmount.value.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  })

  return {
    formatAmount,
    allowOnlyDigits,
    formattedTotalAmount,
    totalAmount,
    morelist,
    showModal,
    rowItems,
    addRow,
    removeRow,
  }
}