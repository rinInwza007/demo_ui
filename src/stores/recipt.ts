// stores/receipt.ts
import { defineStore } from 'pinia'
import type { Receipt } from '@/types/recipt'

// ✅ แก้ไข: ใช้ reciptService singleton instance
import { reciptService } from '@/services/ReciptService'

import { useSummaryStore } from '@/stores/summary'

type ActionResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string }

const safeStr = (v: any) => String(v ?? '').trim()

/** ✅ สร้าง receipt ว่างแบบปลอดภัย */
const emptyReceipt = (): Receipt =>
  ({
    id: '',
    delNumber: '',
    waybillNumber: '', // ✅ เพิ่มถ้ายังไม่มี
    fullName: '',
    phone: '',
    affiliationId: '',
    affiliationName: '',
    mainAffiliationId: '',
    mainAffiliationName: '',
    subAffiliationId1: '',
    subAffiliationName1: '',
    subAffiliationId2: '',
    subAffiliationName2: '',
    fundId: '',
    fundName: '',
    projectCode: '',
    moneyType: '',
    sendmoney: '',
    moneyTypeNote: 'Waybill',
    receiptList: [],
    debtorList: [],
    depositList: [],
    paymentMethods: {},
    bankTransfers: [],
    isLocked: false,
    approvalStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    netTotalAmount: 0,
    totalPaymentAmount: 0,
  } as unknown as Receipt)

export const useReceiptStore = defineStore('Receipt', {
  state: () => ({
    // dashboard placeholders
    affiliations: null as null | Array<{ id: string; name: string }>,
    pending: null as null | number,
    send: null as null | number,
    overrule: null as null | number,
    commit: null as null | number,

    // data
    receiptUser: {} as Record<string, unknown>,
    receiptList: [] as Receipt[],
    receipt: emptyReceipt(),

    // ui
    loading: false,
    error: null as string | null,

    // logs
    logs: [] as Array<{ time: number; message: string }>,

    // timer
    targetDate: new Date('2025-10-01T16:30:00').getTime(),
    currentTime: Date.now(),

    // listener
    _listening: false,
  }),

  getters: {
    header(): Record<string, string> {
      const token = localStorage.getItem('user-token')
      return token ? { Authorization: `Bearer ${token}` } : {}
    },

    // ✅ เพิ่ม computed stats
    stats(): ReturnType<typeof reciptService.calculateStats> {
      return reciptService.calculateStats(this.receiptList)
    },

    pendingReceipts(): Receipt[] {
      return reciptService.filterByStatus(this.receiptList, 'pending')
    },

    approvedReceipts(): Receipt[] {
      return reciptService.filterByStatus(this.receiptList, 'approved')
    },

    rejectedReceipts(): Receipt[] {
      return reciptService.filterByStatus(this.receiptList, 'rejected')
    },
  },

  actions: {
    /** ---------------- utils ---------------- */
    setError(err: unknown) {
      const msg =
        typeof err === 'string'
          ? err
          : (err as any)?.response?.data?.message ||
            (err as any)?.message ||
            'Unexpected error'
      this.error = String(msg)
    },

    pushLog(message: string) {
      this.logs.unshift({ time: Date.now(), message })
      if (this.logs.length > 50) this.logs.length = 50
    },

    upsertList(item: Receipt) {
      const key = safeStr(item.waybillNumber || item.projectCode || item.id)
      if (!key) {
        this.receiptList = [item, ...this.receiptList]
        return
      }
      const idx = this.receiptList.findIndex((r) => {
        const rKey = safeStr(r.waybillNumber || r.projectCode || r.id)
        return rKey === key
      })
      if (idx === -1) {
        this.receiptList = [item, ...this.receiptList]
      } else {
        this.receiptList.splice(idx, 1, item)
      }
    },

    removeFromList(idOrProjectCode: string) {
      const key = safeStr(idOrProjectCode)
      this.receiptList = this.receiptList.filter((r) => {
        const rKey1 = safeStr(r.waybillNumber || '')
        const rKey2 = safeStr(r.projectCode || '')
        const rKey3 = safeStr(r.id || '')
        return rKey1 !== key && rKey2 !== key && rKey3 !== key
      })
    },

    /** ✅ ฟัง event จาก service */
    ensureListening() {
      if (this._listening) return
      this._listening = true

      // ✅ ใช้ reciptService.onUpdate() แทน addEventListener โดยตรง
      reciptService.onUpdate((action) => {
        this.pushLog(`event: receipts-updated (${action})`)

        // Auto refresh ถ้าต้องการ
        if (action === 'create' || action === 'update' || action === 'delete') {
          // this.getReceipt('all') // ถ้าต้องการ auto refresh
        }
      })
    },

    /** helper run: ลดโค้ดซ้ำ try/catch/finally */
    async run<T>(label: string, fn: () => Promise<T>): Promise<ActionResult<T>> {
      this.loading = true
      this.error = null
      try {
        const data = await fn()
        this.pushLog(label)
        return { ok: true, data }
      } catch (e) {
        this.setError(e)
        this.pushLog(`${label} (failed: ${this.error})`)
        return { ok: false, error: this.error! }
      } finally {
        this.loading = false
      }
    },

    /** ---------------- ✅ core actions (ใช้ reciptService) ---------------- */

    /** ✅ list - ดึงข้อมูลทั้งหมด */
    async getReceipt(param?: string): Promise<ActionResult<Receipt[]>> {
      this.ensureListening()
      return this.run(`Fetched receipt list`, async () => {
        // ✅ ใช้ reciptService.getAll()
        const data = await reciptService.getAll()
        if (!data) throw new Error('Empty response')

        this.receiptList = data

        // ส่งเข้า SummaryStore
        const summary = useSummaryStore()
        summary.ingestMany(data)

        return data
      })
    },
    ingestMany(receipts: Receipt[]) {
  receipts.forEach((receipt) => {
    this.ingestUpsert(receipt)
  })
},

    /** ✅ single - ดึงข้อมูลรายการเดียว */
    async findOneReceipt(waybillNumber: string): Promise<ActionResult<Receipt>> {
      this.ensureListening()
      return this.run(`Fetched receipt "${waybillNumber}"`, async () => {
        // ✅ ใช้ reciptService.getById()
        const data = await reciptService.getById(waybillNumber)
        if (!data) throw new Error('Empty response')

        this.receipt = data

        // sync summary
        const summary = useSummaryStore()
        summary.ingestUpsert(data, 'update')

        return data
      })
    },

    /** ✅ create - สร้างใหม่ */
    async saveReceipt(payload: Receipt): Promise<ActionResult<Receipt>> {
      this.ensureListening()
      return this.run(
        `Saved receipt "${payload.waybillNumber || payload.fullName}"`,
        async () => {
          // ✅ ใช้ reciptService.create()
          const data = await reciptService.create(payload as any)
          if (!data) throw new Error('Empty response')

          this.receipt = data
          this.upsertList(data)

          // ส่งเข้า SummaryStore
          const summary = useSummaryStore()
          summary.ingestUpsert(data, 'create')

          return data
        }
      )
    },

    /** ✅ update - แก้ไข */
    async updateReceipt(payload: Receipt): Promise<ActionResult<Receipt>> {
      this.ensureListening()
      const id = payload.waybillNumber || payload.id
      if (!id) {
        return {
          ok: false,
          error: 'Missing waybillNumber or id for update'
        }
      }

      return this.run(`Updated receipt "${id}"`, async () => {
        // ✅ ใช้ reciptService.update()
        const data = await reciptService.update(id, payload as any)
        if (!data) throw new Error('Empty response')

        this.receipt = data
        this.upsertList(data)

        // ส่งเข้า SummaryStore
        const summary = useSummaryStore()
        summary.ingestUpsert(data, 'update')

        return data
      })
    },

    /** ✅ delete - ลบ */
    async deleteReceipt(idOrProjectCode: string): Promise<ActionResult<true>> {
      this.ensureListening()
      return this.run(`Deleted receipt "${idOrProjectCode}"`, async () => {
        // ✅ ใช้ reciptService.delete()
        await reciptService.delete(idOrProjectCode)

        this.removeFromList(idOrProjectCode)

        // ส่งเข้า SummaryStore
        const summary = useSummaryStore()
        summary.ingestDelete(idOrProjectCode)

        return true
      })
    },

    /** ✅ approve - อนุมัติ */
    async approveReceipt(
      waybillNumber: string,
      approverName: string
    ): Promise<ActionResult<Receipt>> {
      this.ensureListening()
      return this.run(`Approved receipt "${waybillNumber}"`, async () => {
        // ✅ ใช้ reciptService.approve()
        const data = await reciptService.approve(waybillNumber, approverName)
        if (!data) throw new Error('Empty response')

        this.receipt = data
        this.upsertList(data)

        // ส่งเข้า SummaryStore
        const summary = useSummaryStore()
        summary.ingestUpsert(data, 'approve')

        return data
      })
    },

    /** ✅ reject - ปฏิเสธ */
    async rejectReceipt(
      waybillNumber: string,
      approverName: string,
      reason?: string
    ): Promise<ActionResult<Receipt>> {
      this.ensureListening()
      return this.run(`Rejected receipt "${waybillNumber}"`, async () => {
        // ✅ ใช้ reciptService.reject()
        const data = await reciptService.reject(waybillNumber, approverName, reason)
        if (!data) throw new Error('Empty response')

        this.receipt = data
        this.upsertList(data)

        // ส่งเข้า SummaryStore
        const summary = useSummaryStore()
        summary.ingestUpsert(data, 'reject')

        return data
      })
    },

    /** ✅ check duplicate waybill number */
    async checkWaybillNumber(waybillNumber: string): Promise<ActionResult<boolean>> {
      return this.run(`Check waybill number "${waybillNumber}"`, async () => {
        return await reciptService.checkWaybillNumber(waybillNumber)
      })
    },

    /** ✅ ใช้กับ flow "ล้างหนี้/เคลียร์หนี้" */
    ingestClearResult(receipt: Receipt) {
      this.receipt = receipt
      this.upsertList(receipt)

      const summary = useSummaryStore()
      summary.ingestUpsert(receipt, 'clear')

      this.pushLog(`ingestClearResult "${safeStr(receipt.waybillNumber || receipt.id)}"`)
    },

    /** ตั้งค่า receipt ทั้งก้อน */
    setReceipt(payload: Receipt) {
      this.receipt = { ...payload }
    },

    /** รีเซ็ต receipt */
    resetReceipt() {
      this.receipt = emptyReceipt()
    },

    /** ล้าง list + ล้าง summary */
    resetAll() {
      this.receiptList = []
      this.receipt = emptyReceipt()

      const summary = useSummaryStore()
      summary.reset()

      this.pushLog('resetAll (receipt + summary)')
    },
  },
})
