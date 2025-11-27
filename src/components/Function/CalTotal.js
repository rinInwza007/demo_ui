import { ref, nextTick , computed } from 'vue'

export function useRowManager() {

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

      const checkedItems = row.selectedItems.filter((item) => item.checked)
      
      if (checkedItems.length === 0) {
        return null
      }

      // คำนวณยอดรวมก่อนหักค่าธรรมเนียม
      const subtotal = checkedItems.reduce((sum, item) => {
        return sum + (Number(item.amount) || 0)
      }, 0)

      // ค่าธรรมเนียม
      const fee = Number(row.fee) || 0

      // ยอดสุทธิ
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

}
