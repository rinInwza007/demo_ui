// services/ClearDebtorService.ts
import { reciptService } from '@/services/ReciptService'
import type { Receipt } from '@/types/recipt'
import { getItemType } from '@/components/data/ItemNameOption'
import { toRaw } from 'vue'

export interface PendingDebtItem {
  id: string
  itemId: number
  itemName: string
  receiptId: string
  affiliationId: string
  department: string
  subDepartment: string
  responsible: string
  depositNetAmount: number
  debtorAmount: number
  balanceAmount: number
  note: string
  _originalReceipt: Receipt
  _receipts: Receipt[]
}

export interface ClearDebtPayload {
  receiptId: string
  waybillNumber: string
  items: Array<{
    itemId: string
    itemName: string
    paymentAmount: number
    receiptNumber?: string
    note?: string
  }>
  paymentMethods: Array<{
    type: string
    bankName?: string
    accountName?: string
    accountNumber?: string
    amount: number
  }>
}

export interface ClearDebtResult {
  success: boolean
  markedCount: number
  clearedCount: number
  updatedCount: number
  updatedReceipts: number
  totalAmount: number
  referenceId: string
}

class ClearDebtorService {
  private cachedData: PendingDebtItem[] | null = null
  private lastFetch = 0
  private readonly CACHE_TTL = 3000

  /* =========================
     📋 Pending Debts
  ========================== */
  async getPendingDebts(forceRefresh = false): Promise<PendingDebtItem[]> {
    try {
      const now = Date.now()
      const shouldRefresh =
        forceRefresh ||
        !this.cachedData ||
        now - this.lastFetch > this.CACHE_TTL

      if (!shouldRefresh && this.cachedData) {
        console.log('📦 Using cached pending debts:', this.cachedData.length)
        return this.cachedData
      }

      console.log('🔄 Fetching fresh pending debts...')

      const receipts = await reciptService.getAll()

      if (!Array.isArray(receipts)) {
        console.error('❌ receipts is not an array:', receipts)
        this.cachedData = []
        this.lastFetch = now
        return []
      }

      const pendingItems: PendingDebtItem[] = []
      
      receipts.forEach((rawReceipt) => {
        const receipt = toRaw(rawReceipt)

        if (!Array.isArray(receipt.receiptList)) return

        // ✅ กรองเฉพาะรายการที่ยังไม่ได้ล้าง
        const unClearedItems = receipt.receiptList.filter((item) => {
          // ตรวจสอบว่าล้างแล้วหรือยัง
          if (item.isClearedDebt === true) {
            console.log(`🚫 Skipping cleared item: ${item.itemName}`)
            return false
          }

          // ตรวจสอบ type
          const itemType = getItemType(item.itemId || item.itemName)
          if (itemType !== 'receivable') {
            console.log(`🚫 Skipping non-receivable: ${item.itemName}`)
            return false
          }

          return true
        })

        unClearedItems.forEach((item) => {
          const depositNet = Number(item.depositNetAmount || item.amount || 0)
          const debtorAmt = Number(item.debtorAmount || 0)
          const balance = Number(item.balanceAmount || (depositNet - debtorAmt))

          // ข้ามรายการที่ยอดคงเหลือ = 0
          if (balance <= 0) {
            console.log(`🚫 Skipping zero balance: ${item.itemName}`)
            return
          }

          pendingItems.push({
            id: item.id || `${receipt.id}-${item.itemId}`,
            itemId: item.itemId,
            itemName: item.itemName,
            receiptId: receipt.id,
            affiliationId: receipt.affiliationId,
            department: receipt.mainAffiliationName || '-',
            subDepartment: receipt.subAffiliationName || '-',
            responsible: receipt.fullName || '-',
            depositNetAmount: depositNet,
            debtorAmount: debtorAmt,
            balanceAmount: balance,
            note: item.note || '',
            _originalReceipt: receipt,
            _receipts: [receipt]
          })
        })
      })

      this.cachedData = pendingItems
      this.lastFetch = now

      console.log('⏳ Pending items found:', pendingItems.length)
      return pendingItems
    } catch (error) {
      console.error('❌ Error fetching pending debts:', error)
      return []
    }
  }

  /* =========================
     ✅ Clear Debts (FIXED)
  ========================== */
  async clearDebts(payload: ClearDebtPayload): Promise<ClearDebtResult> {
    try {
      console.log('🧹 Clearing debts...', payload)

      // 1. โหลด receipt
      const rawReceipt = await reciptService.getById(payload.waybillNumber)
      
      if (!rawReceipt || !Array.isArray(rawReceipt.receiptList)) {
        throw new Error(`Receipt not found: ${payload.waybillNumber}`)
      }

      const receipt: Receipt = toRaw(rawReceipt)

      // 2. สร้าง Map ของ items ที่จะล้าง
      const itemsToUpdate = new Map<string, any>()
      
      payload.items.forEach((item) => {
        itemsToUpdate.set(String(item.itemId), item)
      })

      let markedCount = 0
      let clearedCount = 0
      let updatedCount = 0

      // 3. อัปเดต receiptList
      const updatedReceiptList = receipt.receiptList.map((item) => {
        const updateInfo = itemsToUpdate.get(String(item.itemId))
        
        // ถ้าไม่ได้เลือกรายการนี้ ให้คืนค่าเดิม
        if (!updateInfo) return item

        markedCount++

        // คำนวณยอดคงเหลือใหม่
        const currentBalance = Number(item.balanceAmount || item.depositNetAmount || item.amount || 0)
        const newBalance = Math.max(0, currentBalance - updateInfo.paymentAmount)
        const isFullyCleared = newBalance <= 0.01

        if (isFullyCleared) clearedCount++
        else updatedCount++

        // เพิ่มประวัติการชำระ
        const paymentHistory = [...(item.paymentHistory || [])]
        paymentHistory.push({
          date: new Date().toISOString(),
          amount: updateInfo.paymentAmount,
          note: updateInfo.note || '',
          receiptNumber: updateInfo.receiptNumber || '',
          paymentMethods: payload.paymentMethods
        })

        console.log(`📝 Updating item ${item.itemId}:`, {
          currentBalance,
          paymentAmount: updateInfo.paymentAmount,
          newBalance,
          isFullyCleared
        })

        // ✅ Return ข้อมูลที่อัปเดตแล้ว
        return {
          ...item,
          // อัปเดตยอดเงิน
          depositNetAmount: item.depositNetAmount || currentBalance,
          debtorAmount: (item.debtorAmount || 0) + updateInfo.paymentAmount,
          balanceAmount: newBalance,
          
          // อัปเดตสถานะ
          isClearedDebt: isFullyCleared,
          lastClearedDate: new Date().toISOString(),
          lastClearedAmount: updateInfo.paymentAmount,
          
          // บันทึกประวัติ
          paymentHistory,
          receiptNumber: updateInfo.receiptNumber || item.receiptNumber,
          note: updateInfo.note || item.note
        }
      })

      // 4. บันทึกกลับเข้า localStorage
      const updatedReceipt = {
        ...receipt,
        receiptList: updatedReceiptList,
        updatedAt: new Date().toISOString()
      }

      console.log('💾 Saving updated receipt:', updatedReceipt)
      await reciptService.update(payload.waybillNumber, updatedReceipt)

      // 5. ✅ Force clear cache ทันที
      this.clearCache()
      
      // 6. ✅ Trigger custom event (ไม่ใช้ storage event)
      window.dispatchEvent(new CustomEvent('debts-updated', {
        detail: {
          waybillNumber: payload.waybillNumber,
          timestamp: Date.now()
        }
      }))

      const totalAmount = payload.items.reduce((sum, item) => sum + item.paymentAmount, 0)
      const referenceId = `CLEAR-${Date.now()}`

      console.log(`✅ Updated receipt: ${payload.waybillNumber}`)
      console.log(`   - Marked: ${markedCount}, Cleared: ${clearedCount}, Updated: ${updatedCount}`)

      return {
        success: true,
        markedCount,
        clearedCount,
        updatedCount,
        updatedReceipts: 1,
        totalAmount,
        referenceId
      }
    } catch (error) {
      console.error('❌ Error clearing debts:', error)
      throw error
    }
  }

  /* =========================
     🔒 Permission Filter
  ========================== */
  filterByAffiliation(
    items: PendingDebtItem[],
    affiliationId: string
  ): PendingDebtItem[] {
    return items.filter((item) => item.affiliationId === affiliationId)
  }

  /* =========================
     📜 History
  ========================== */
  saveHistory(entry: any): void {
    try {
      const stored = localStorage.getItem('debtorClearHistory')
      const history = stored ? JSON.parse(stored) : []

      history.unshift(entry)

      localStorage.setItem(
        'debtorClearHistory',
        JSON.stringify(history)
      )

      // ✅ Trigger custom event
      window.dispatchEvent(new CustomEvent('history-updated', {
        detail: { timestamp: Date.now() }
      }))

      console.log('✅ History saved:', entry.referenceId)
    } catch (error) {
      console.error('❌ Error saving history:', error)
    }
  }

  getHistory(): any[] {
    try {
      const stored = localStorage.getItem('debtorClearHistory')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('❌ Error loading history:', error)
      return []
    }
  }

  deleteHistory(id: string): void {
    try {
      const history = this.getHistory()
      const filtered = history.filter((h) => h.id !== id)

      localStorage.setItem(
        'debtorClearHistory',
        JSON.stringify(filtered)
      )

      // ✅ Trigger custom event
      window.dispatchEvent(new CustomEvent('history-updated', {
        detail: { timestamp: Date.now() }
      }))

      console.log('✅ History deleted:', id)
    } catch (error) {
      console.error('❌ Error deleting history:', error)
    }
  }

  /* =========================
     🗑️ Cache
  ========================== */
  clearCache(): void {
    this.cachedData = null
    this.lastFetch = 0
    console.log('🗑️ Cache cleared')
  }

  async refresh(): Promise<PendingDebtItem[]> {
    console.log('🔄 Force refreshing pending debts...')
    return this.getPendingDebts(true)
  }
}

export const clearDebtorService = new ClearDebtorService()
export default ClearDebtorService