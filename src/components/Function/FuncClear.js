// funcClear.js
import { ref, computed } from 'vue'

export function useBankTransferManager() {
  // รายการธนาคาร (ไม่มีรายการเริ่มต้น - ให้กดเพิ่มเอง)
  const bankTransfers = ref([
    {
      id: Date.now(),
      accountData: {
        accountNumber: '',
        bankName: '',
        accountName: '',
      },
      amount: '',
    }
  ])

  // เพิ่มรายการธนาคาร
  const addBankTransfer = () => {
    bankTransfers.value.push({
      id: Date.now(),
      accountData: {
        accountNumber: '',
        bankName: '',
        accountName: '',
      },
      amount: '',
    })
  }

  // ลบรายการธนาคาร
  const removeBankTransfer = (index) => {
    bankTransfers.value.splice(index, 1)
  }

  // Format จำนวนเงินเมื่อเสร็จสิ้นการกรอก
  const formatBankAmount = (index) => {
    const bank = bankTransfers.value[index]
    if (!bank.amount) return

    const cleanValue = bank.amount.toString().replace(/,/g, '')
    const numValue = parseFloat(cleanValue)

    if (isNaN(numValue)) {
      bank.amount = ''
      return
    }

    bank.amount = numValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Handle input จำนวนเงิน
  const handleBankAmountInput = (index, event) => {
    const value = event.target.value.replace(/[^0-9.]/g, '')
    const parts = value.split('.')

    if (parts.length > 2) return

    bankTransfers.value[index].amount = value
  }

  // Format display สำหรับจำนวนเงิน
  const formatDisplayBankAmount = (value) => {
    if (!value) return ''

    const cleanValue = value.toString().replace(/,/g, '')
    const parts = cleanValue.split('.')
    const integerPart = parts[0]
    const decimalPart = parts[1]

    if (!integerPart) return ''

    const formattedInteger = Number(integerPart).toLocaleString('en-US')

    if (decimalPart !== undefined) {
      return `${formattedInteger}.${decimalPart}`
    }

    return formattedInteger
  }

  // Clear error สำหรับ bank transfer
  const clearBankError = (index, field, errors) => {
    if (errors.value.bankTransfers?.[index]?.[field]) {
      delete errors.value.bankTransfers[index][field]

      if (Object.keys(errors.value.bankTransfers[index]).length === 0) {
        delete errors.value.bankTransfers[index]
      }
    }
  }

  // ตรวจสอบว่าเลขบัญชีมาจาก predefined options
  const isFromPredefinedOption = (accountNumber, bankAccountOptions = []) => {
    if (!accountNumber) return false
    return bankAccountOptions.some(opt => opt.accountNumber === accountNumber)
  }

  // รีเซ็ทค่ารายการ
  const resetBankTransfer = (index) => {
    const bank = bankTransfers.value[index]
    bank.accountData = {
      accountNumber: '',
      bankName: '',
      accountName: '',
    }
    bank.amount = ''
  }

  // รีเซ็ททั้งหมด
  const resetAllBankTransfers = () => {
    bankTransfers.value = []
  }

  // ✅ แก้ไข: โหลดข้อมูลจาก API
  const loadBankTransfers = (data) => {
    console.log('🔄 Loading bank transfers from data:', data)

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('⚠️ No bank data to load')
      resetAllBankTransfers()
      return
    }

    bankTransfers.value = data.map((item) => {
      console.log('Processing item:', item)

      return {
        id: item.id || Date.now() + Math.random(),
        accountData: {
          // ✅ แก้ไขตรงนี้ - ดึงจาก item.accountData
          accountNumber: item.accountData?.accountNumber || '',
          bankName: item.accountData?.bankName || '',
          accountName: item.accountData?.accountName || '',
        },
        amount: item.amount ?
          (typeof item.amount === 'number' ?
            item.amount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) : item.amount
          ) : '',
      }
    })

    console.log('✅ Bank transfers loaded:', bankTransfers.value)
  }

  const formatBankAmountOnBlur = (index) => {
    const bank = bankTransfers.value[index]
    if (!bank.amount) return

    const cleanValue = bank.amount.toString().replace(/,/g, '')
    const numValue = parseFloat(cleanValue)

    if (isNaN(numValue)) {
      bank.amount = ''
      return
    }

    bank.amount = numValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // ✅ แก้ไข: เตรียมข้อมูลสำหรับบันทึก
  const getBankTransfersData = () => {
    console.log('📤 Preparing bank transfers data from:', bankTransfers.value)

    const result = bankTransfers.value
      .filter(bank => {
        // กรองเฉพาะที่มีข้อมูลครบถ้วน
        const hasAccountData = bank.accountData?.accountNumber &&
                               bank.accountData?.bankName &&
                               bank.accountData?.accountName
        const hasAmount = bank.amount && parseFloat(String(bank.amount).replace(/,/g, '')) > 0

        return hasAccountData && hasAmount
      })
      .map(bank => ({
        id: bank.id,
        accountData: {
          accountNumber: bank.accountData.accountNumber,
          bankName: bank.accountData.bankName,
          accountName: bank.accountData.accountName,
        },
        amount: parseFloat(String(bank.amount || '0').replace(/,/g, '')),
      }))

    console.log('📦 Bank transfers data prepared:', result)
    return result
  }

  // คำนวณยอดรวมธนาคาร
  const totalBankAmount = computed(() => {
    return bankTransfers.value.reduce((sum, bank) => {
      const cleanAmount = String(bank.amount || '0').replace(/,/g, '')
      const amount = Number(cleanAmount) || 0
      return sum + amount
    }, 0)
  })

  // ยอดรวมที่ format แล้ว
  const formattedTotalBankAmount = computed(() => {
    return totalBankAmount.value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  })

  // ตรวจสอบว่ามีรายการธนาคารหรือไม่
  const hasBankTransfers = computed(() => {
    return bankTransfers.value.length > 0
  })

  // จำนวนรายการธนาคารทั้งหมด
  const bankTransferCount = computed(() => {
    return bankTransfers.value.length
  })

  return {
    // States
    bankTransfers,
    formatBankAmountOnBlur,
    // Actions
    addBankTransfer,
    removeBankTransfer,
    formatBankAmount,
    handleBankAmountInput,
    formatDisplayBankAmount,
    resetBankTransfer,
    resetAllBankTransfers,
    loadBankTransfers,
    getBankTransfersData,
    clearBankError,
    isFromPredefinedOption,

    // Computed
    totalBankAmount,
    formattedTotalBankAmount,
    hasBankTransfers,
    bankTransferCount,
  }
}
