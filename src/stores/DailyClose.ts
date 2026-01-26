// src/stores/dailyClose.ts
import { defineStore } from 'pinia'

export interface DailyCloseRecord {
  dateKey: string // 'YYYY-MM-DD'
  isClosed: boolean
  closedAt?: string // ISO timestamp
  closedBy?: string // user id
  closedByName?: string // ชื่อผู้ปิดยอด
}

const LS_KEY = 'daily_close_records'

function getToday(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function safeJsonParse<T>(val: string | null): T | null {
  if (!val) return null
  try {
    return JSON.parse(val) as T
  } catch {
    return null
  }
}

export const useDailyCloseStore = defineStore('dailyClose', {
  state: () => ({
    records: safeJsonParse<Record<string, DailyCloseRecord>>(
      localStorage.getItem(LS_KEY)
    ) || {} as Record<string, DailyCloseRecord>,
  }),

getters: {
    /**
     * ✅ เช็คว่าวันนี้ปิดยอดหรือยัง
     */
    isTodayClosed: (state) => {
      const today = getToday()
      return state.records[today]?.isClosed ?? false
    },

    /**
     * ✅ ดึงข้อมูลการปิดยอดของวันนี้
     */
    todayRecord: (state) => {
      const today = getToday()
      return state.records[today] || null
    },

    /**
     * ✅ เช็คว่าวันไหนปิดยอดหรือยัง
     */
    isDateClosed: (state) => (dateKey: string) => {
      return state.records[dateKey]?.isClosed ?? false
    },

    /**
     * ✅ ดึงข้อมูลการปิดยอดของวันที่ระบุ
     */
    getRecord: (state) => (dateKey: string) => {
      return state.records[dateKey] || null
    },

    /**
     * ✅ เช็คว่าสามารถแก้ไขข้อมูลวันที่นี้ได้หรือไม่
     * (ใช้สำหรับหน้าสร้าง/แก้ไข Waybill)
     */
    canModifyDate: (state) => (dateKey: string) => {
      return !state.records[dateKey]?.isClosed
    },

    /**
     * ✅ เช็คว่าสามารถแก้ไขข้อมูลวันนี้ได้หรือไม่
     */
    canModifyToday: (state) => {
      const today = getToday()
      return !state.records[today]?.isClosed
    },
  },

  actions: {
    /**
     * ✅ ปิดยอดประจำวัน
     */
    closeDaily(userId: string, userName: string) {
      const today = getToday()
      
      if (this.records[today]?.isClosed) {
        throw new Error('วันนี้ปิดยอดแล้ว')
      }

      this.records[today] = {
        dateKey: today,
        isClosed: true,
        closedAt: new Date().toISOString(),
        closedBy: userId,
        closedByName: userName,
      }

      this.saveToStorage()
    },

    /**
     * ✅ ยกเลิกการปิดยอด (เฉพาะ superadmin)
     */
    reopenDaily(dateKey: string) {
      if (!this.records[dateKey]) {
        throw new Error('ไม่พบข้อมูลการปิดยอดของวันนี้')
      }

      delete this.records[dateKey]
      this.saveToStorage()
    },

    /**
     * ✅ บันทึกลง localStorage
     */
    saveToStorage() {
      localStorage.setItem(LS_KEY, JSON.stringify(this.records))
      
      // ✅ ส่ง event เพื่อให้หน้าอื่นๆ อัปเดตตาม
      window.dispatchEvent(
        new CustomEvent('daily-close-updated', { 
          detail: { records: this.records } 
        })
      )
    },

    /**
     * ✅ โหลดข้อมูลจาก localStorage ใหม่
     */
    loadFromStorage() {
      const data = safeJsonParse<Record<string, DailyCloseRecord>>(
        localStorage.getItem(LS_KEY)
      )
      if (data) {
        this.records = data
      }
    },
  },
})