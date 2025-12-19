import { ref, nextTick, computed } from 'vue'
import TomSelect from 'tom-select'

export function useRowManagerDebtor() {
  // ========== รายการลูกหนี้ (เหมือนเดิม) ==========
  const debtorList = ref([
    {
      id: 1,
      itemName: null,
      note: '',
      money: '',
    },
  ])

  // ========== รายการเงินฝาก (แบบใหม่ - คล้าย morelist) ==========
  const depositList = ref([
    {
      id: 1,
      itemName: null,
      note: '',
      fee: '',
      selectedItems: [],
      expanded: true,
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
          depositList.value[index].keyword = value
        },
      })
    })
  }

  const allowOnlyDigits = (e) => {
    if (!/[0-9 ,-,.]/.test(e.key)) {
      e.preventDefault()
    }
  }

  // ========== Default Items (เฉพาะฝากเข้าบัญชี) ==========
  const defaultItems = [
    {
      name: 'transfer',
      checked: false,
      amount: '',
      referenceNo: '',
      AccountNum: '',
      AccountName: '',
      BankName: '',
      type: 'ฝากเข้าบัญชี',
      paymentType: 'ฝากเข้าบัญชี',
      moneyType: 'transfer',
    },
  ]

  // ========== ฟังก์ชันจัดการรายการลูกหนี้ ==========
  const addDebtorRow = () => {
    debtorList.value.push({
      id: debtorList.value.length + 1,
      itemName: null,
      note: '',
      money: '',
    })

    nextTick(() => {
      initTomSelect(debtorList.value.length - 1)
    })
  }

  const removeDebtorRow = (index) => {
    if (debtorList.value.length > 1) {
      debtorList.value.splice(index, 1)
    }
  }

  // ========== ฟังก์ชันจัดการรายการเงินฝาก (แบบใหม่) ==========
  const addDepositRow = () => {
    depositList.value.push({
      id: depositList.value.length + 1,
      itemName: null,
      note: '',
      fee: '',
      selectedItems: JSON.parse(JSON.stringify(defaultItems)),
      expanded: true,
    })

    nextTick(() => {
      initTomSelect(depositList.value.length - 1)
    })
  }

  const removeDepositRow = (index) => {
    if (depositList.value.length > 1) {
      depositList.value.splice(index, 1)
    }
  }

  // ========== Modal Management ==========
  const showModal = ref(null)
  const rowItems = ref([])

  const getUsedAccounts = (currentIndex) => {
    const usedAccounts = []

    depositList.value.forEach((row, idx) => {
      if (idx !== currentIndex && row.selectedItems) {
        row.selectedItems.forEach((item) => {
          if (item.checked && item.AccountName) {
            usedAccounts.push(item.AccountName)
          }
        })
      }
    })

    return usedAccounts
  }

  const openModalForRow = (index) => {
    console.log('🔵 เปิด modal สำหรับรายการเงินฝากที่:', index)

    // ถ้ายังไม่มี selectedItems ให้ใช้ defaultItems
    if (
      !depositList.value[index].selectedItems ||
      depositList.value[index].selectedItems.length === 0
    ) {
      depositList.value[index].selectedItems = JSON.parse(JSON.stringify(defaultItems))
    }

    // Merge กับ defaultItems
    const merged = defaultItems.map((defaultItem) => {
      const existingItem = depositList.value[index].selectedItems.find((item) => {
        if (item.name === defaultItem.name) return true

        const typeMap = {
          transfer: 'transfer',
          'ฝากเข้าบัญชี': 'transfer',
        }

        const itemType = typeMap[item.moneyType] || typeMap[item.type] || typeMap[item.name]
        const defaultType = defaultItem.name

        return itemType === defaultType
      })

      if (existingItem) {
        return {
          ...existingItem,
          name: defaultItem.name,
          paymentType: defaultItem.paymentType,
          type: defaultItem.type,
        }
      }

      return { ...defaultItem }
    })

    rowItems.value[index] = merged
    showModal.value = index

    console.log('📋 ข้อมูลที่ส่งไป modal:', rowItems.value[index])
  }

const updateSelectedItems = (index, selected) => {
  console.log('📥 Received from Modal:', selected)
  
  // ✅ เพิ่มการตรวจสอบว่า selected เป็น Array หรือไม่
  if (!Array.isArray(selected)) {
    console.error('❌ selected ไม่ใช่ Array:', selected)
    return
  }

  depositList.value[index].selectedItems = selected.map((item) => {
    const mappedItem = {
      checked: item.checked,
      name: item.name,
      amount: item.amount || '',
      referenceNo: item.referenceNo || '',
      moneyType: item.moneyType || 'transfer',
      type: item.type || item.paymentType,
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

  console.log('💾 Saved to depositList:', depositList.value[index].selectedItems)
}

  // ========== Computed Properties ==========
  const summaryByType = computed(() => {
    const summary = {
      เงินสด: 0,
      เช็คธนาคาร: 0,
      ฝากเข้าบัญชี: 0,
    }

    depositList.value.forEach((row) => {
      if (!row.selectedItems) return

      row.selectedItems.forEach((item) => {
        if (!item.checked || !item.amount) return

        const amount = Number(item.amount) || 0

        if (item.name === 'transfer' || item.name === 'ฝากเข้าบัญชี') {
          summary.ฝากเข้าบัญชี += amount
        }
      })
    })

    return summary
  })

  // ยอดรวมจากรายการลูกหนี้
  const totalDebtorAmount = computed(() => {
    return debtorList.value.reduce((sum, row) => {
      const money = Number(row.money) || 0
      return sum + money
    }, 0)
  })

  // ยอดรวมจากรายการเงินฝาก
  const totalDepositAmount = computed(() => {
    return depositList.value.reduce((sum, row) => {
      if (!row.selectedItems) return sum

      const rowTotal = row.selectedItems.reduce((s, item) => {
        if (!item.checked) return s
        const amount = Number(item.amount) || 0
        return s + amount
      }, 0)

      return sum + rowTotal
    }, 0)
  })

  // ค่าธรรมเนียมรวม
  const totalFee = computed(() => {
    return depositList.value.reduce((sum, row) => {
      const fee = Number(row.fee) || 0
      return sum + fee
    }, 0)
  })

  // ยอดสุทธิ = ยอดรวมเงินฝาก - ค่าธรรมเนียม
  const netTotalAmount = computed(() => {
    return totalDepositAmount.value - totalFee.value
  })

  // รายละเอียดแต่ละแถวเงินฝาก
  const detailsByRow = computed(() => {
    console.log('detailsByRow computing...', depositList.value)

    return depositList.value
      .map((row, index) => {
        const hasItemName = row.itemName && row.itemName.trim() !== ''
        const hasFee = row.fee && row.fee !== ''
        const hasNote = row.note && row.note.trim() !== ''
        const hasSelectedItems = row.selectedItems && row.selectedItems.some((item) => item.checked)

        if (!hasItemName && !hasFee && !hasNote && !hasSelectedItems) {
          return null
        }

        const checkedItems = row.selectedItems
          ? row.selectedItems
              .filter((item) => item.checked)
              .map((item) => {
                let itemType = 'ไม่ระบุ'

                if (item.moneyType) {
                  if (item.moneyType === 'transfer') itemType = 'ฝากเข้าบัญชี'
                } else if (item.name) {
                  if (item.name === 'transfer') itemType = 'ฝากเข้าบัญชี'
                }

                return {
                  type: itemType,
                  amount: Number(item.amount) || 0,
                  referenceNo: item.referenceNo || '–',
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
          hasPayment: checkedItems.length > 0,
        }
      })
      .filter((item) => item !== null)
  })

  const getRowDetail = (rowIndex) => {
    const detail = detailsByRow.value.find((d) => d.rowIndex === rowIndex)
    return detail || null
  }

  return {
    // Utils
    allowOnlyDigits,
    initTomSelect,
    keywordInputs,

    // รายการลูกหนี้
    debtorList,
    addDebtorRow,
    removeDebtorRow,

    // รายการเงินฝาก (แบบใหม่)
    depositList,
    addDepositRow,
    removeDepositRow,

    // Modal
    showModal,
    rowItems,
    openModalForRow,
    updateSelectedItems,
    getUsedAccounts,

    // Computed
    totalDebtorAmount,
    totalDepositAmount,
    totalFee,
    netTotalAmount,
    summaryByType,
    detailsByRow,
    getRowDetail,
  }
}