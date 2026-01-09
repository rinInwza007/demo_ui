// @/components/Function/useBankTransferManager.js
import { ref, computed } from 'vue'

export function useBankTransferManager() {
  // ✅ Initial state - มีรายการเริ่มต้น 1 รายการ
  const bankTransfers = ref([
    {
      id: 'bank-init-1',
      checked: false,
      accountData: {
        accountNumber: '',
        bankName: '',
        accountName: '',
      },
      amount: '',
    },
  ])

  // ✅ เพิ่มรายการธนาคาร
  const addBankTransfer = () => {
    const newId = `bank-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    bankTransfers.value.push({
      id: newId,
      checked: false,
      accountData: {
        accountNumber: '',
        bankName: '',
        accountName: '',
      },
      amount: '',
    })

    console.log('✅ เพิ่มรายการธนาคาร:', bankTransfers.value.length, 'รายการ')
    
    return newId // คืนค่า ID เพื่อใช้ scroll
  }

  // ✅ ลบรายการธนาคาร
  const removeBankTransfer = (index) => {
    if (bankTransfers.value.length > 1) {
      const removed = bankTransfers.value.splice(index, 1)[0]
      console.log('🗑️ ลบรายการธนาคาร:', removed.id)
      return true
    }
    console.warn('⚠️ ไม่สามารถลบได้ ต้องมีอย่างน้อย 1 รายการ')
    return false
  }

  // ✅ Format จำนวนเงิน
  const formatBankAmount = (index) => {
    if (!bankTransfers.value[index]) return
    
    const value = bankTransfers.value[index].amount
    if (!value) return

    const cleanValue = value.toString().replace(/,/g, '')
    const numValue = parseFloat(cleanValue)

    if (isNaN(numValue)) {
      bankTransfers.value[index].amount = ''
      return
    }

    bankTransfers.value[index].amount = numValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // ✅ Handle input (ยอมรับเฉพาะตัวเลขและจุดทศนิยม)
  const handleBankAmountInput = (index, event) => {
    if (!bankTransfers.value[index]) return
    
    const value = event.target.value.replace(/[^0-9.]/g, '')
    const parts = value.split('.')
    
    // ป้องกันจุดทศนิยมมากกว่า 1 จุด
    if (parts.length > 2) return

    bankTransfers.value[index].amount = value
  }

  // ✅ Reset รายการธนาคาร (เมื่อ uncheck)
  const resetBankTransfer = (index) => {
    if (!bankTransfers.value[index]) return
    
    bankTransfers.value[index].accountData = {
      accountNumber: '',
      bankName: '',
      accountName: '',
    }
    bankTransfers.value[index].amount = ''
  }

  // ✅ คำนวณยอดรวมจากธนาคาร
  const totalBankAmount = computed(() => {
    return bankTransfers.value.reduce((sum, bank) => {
      if (bank.checked && bank.amount) {
        const cleanAmount = String(bank.amount).replace(/,/g, '')
        const amount = Number(cleanAmount) || 0
        return sum + amount
      }
      return sum
    }, 0)
  })

  // ✅ Format ยอดรวม
  const formattedTotalBankAmount = computed(() => {
    return totalBankAmount.value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  })

  // ✅ ตรวจสอบว่ามีรายการที่ checked หรือไม่
  const hasCheckedBank = computed(() => {
    return bankTransfers.value.some(bank => bank.checked)
  })

  // ✅ นับจำนวนรายการที่ checked
  const checkedBankCount = computed(() => {
    return bankTransfers.value.filter(bank => bank.checked).length
  })

  // ✅ รีเซ็ตทั้งหมด
  const resetAllBankTransfers = () => {
    bankTransfers.value = [
      {
        id: 'bank-init-1',
        checked: false,
        accountData: {
          accountNumber: '',
          bankName: '',
          accountName: '',
        },
        amount: '',
      },
    ]
  }

  // ✅ โหลดข้อมูลจาก API
  const loadBankTransfers = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      resetAllBankTransfers()
      return
    }

    bankTransfers.value = data.map((bank, index) => ({
      id: bank.id || `bank-loaded-${index + 1}`,
      checked: bank.checked !== undefined ? bank.checked : true,
      accountData: {
        accountNumber: bank.accountNumber || '',
        bankName: bank.bankName || '',
        accountName: bank.accountName || '',
      },
      amount: bank.amount
        ? Number(bank.amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : '',
    }))

    console.log('✅ โหลดรายการธนาคาร:', bankTransfers.value.length)
  }

  // ✅ Export ข้อมูลสำหรับบันทึก
  const getBankTransfersData = () => {
    return bankTransfers.value
      .filter(bank => bank.checked)
      .map(bank => ({
        accountNumber: bank.accountData.accountNumber,
        bankName: bank.accountData.bankName,
        accountName: bank.accountData.accountName,
        amount: parseFloat(String(bank.amount || '0').replace(/,/g, '')),
      }))
  }

  return {
    // States
    bankTransfers,
    
    // Actions
    addBankTransfer,
    removeBankTransfer,
    formatBankAmount,
    handleBankAmountInput,
    resetBankTransfer,
    resetAllBankTransfers,
    loadBankTransfers,
    getBankTransfersData,
    
    // Computed
    totalBankAmount,
    formattedTotalBankAmount,
    hasCheckedBank,
    checkedBankCount,
  }
}