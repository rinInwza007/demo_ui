// stores/receipt.ts
import { defineStore } from 'pinia'
import type { Receipt } from '@/types/recipt'

import {
  findOneReceipt as apiFindOneReceipt,
  getReceipt as apiGetReceipt,
  saveReceipt as apiSaveReceipt,
  updateReceipt as apiUpdateReceipt,
  deleteReceipt as apiDeleteReceipt,
} from '@/services/ReciptService'

import { useSummaryStore } from '@/stores/summary'

type ActionResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string }

const safeStr = (v: any) => String(v ?? '').trim()

/** ✅ สร้าง receipt ว่างแบบปลอดภัย (แก้/เติม field ตาม type จริงของคุณได้) */
const emptyReceipt = (): Receipt =>
  ({
    id: '',
    delNumber: '',
    fullName: '',
    phone: '',
    affiliationId: '',
    affiliationName: '',
    mainAffiliationName: '',
    subAffiliationName1: '',
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
    isLocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    netTotalAmount: 0,
    totalPaymentAmount: 0,
  } as unknown as Receipt)

export const useReceiptStore = defineStore('Receipt', {
  state: () => ({
    // dashboard placeholders (ใช้จริงค่อยทำ actions เพิ่ม)
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

    // timer (ถ้าใช้จริงค่อยทำ interval)
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
  },

  actions: {
    /** ---------------- utils ---------------- */
    setError(err: unknown) {
      const msg =
        typeof err === 'string'
          ? err
          : // @ts-ignore
            err?.response?.data?.message || (err as any)?.message || 'Unexpected error'
      this.error = String(msg)
    },

    pushLog(message: string) {
      this.logs.unshift({ time: Date.now(), message })
      if (this.logs.length > 50) this.logs.length = 50
    },

    upsertList(item: Receipt) {
      const key = safeStr((item as any).projectCode || (item as any).id)
      if (!key) {
        this.receiptList = [item, ...this.receiptList]
        return
      }
      const idx = this.receiptList.findIndex((r) => safeStr((r as any).projectCode || (r as any).id) === key)
      if (idx === -1) this.receiptList = [item, ...this.receiptList]
      else this.receiptList.splice(idx, 1, item)
    },

    removeFromList(idOrProjectCode: string) {
      const key = safeStr(idOrProjectCode)
      this.receiptList = this.receiptList.filter(
        (r) => safeStr((r as any).projectCode) !== key && safeStr((r as any).id) !== key
      )
    },

    /** ✅ ฟัง event จาก fake api (เผื่อ refresh list อัตโนมัติ) */
    ensureListening() {
      if (this._listening) return
      this._listening = true

      window.addEventListener('receipts-updated', (ev: any) => {
        const detail = ev?.detail || {}
        const action = detail.action as string
        const data = detail.data as Receipt | undefined
        const id = detail.id as string | undefined

        // ถ้าหน้านี้ต้องการให้ list sync realtime โดยไม่ fetch ใหม่
        if (action === 'create' && data) this.upsertList(data)
        if ((action === 'update' || action === 'bulk-update') && data) this.upsertList(data)
        if (action === 'delete' && id) this.removeFromList(id)

        this.pushLog(`event: receipts-updated (${action})`)
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

    /** ---------------- core actions ---------------- */

    /** ✅ list */
    async getReceipt(param: string): Promise<ActionResult<Receipt[]>> {
      this.ensureListening()
      return this.run(`Fetched receipt list param="${param}"`, async () => {
        const data = await apiGetReceipt(param, this.header)
        if (!data) throw new Error('Empty response')
        this.receiptList = data

        // ✅ ส่งเข้ SummaryStore ทีเดียว (ถ้าอยากให้ summary พร้อมทันที)
        const summary = useSummaryStore()
        summary.ingestMany(data)

        return data
      })
    },

    /** ✅ single */
    async findOneReceipt(param: string): Promise<ActionResult<Receipt>> {
      this.ensureListening()
      return this.run(`Fetched receipt "${param}"`, async () => {
        const data = await apiFindOneReceipt(param, this.header)
        if (!data) throw new Error('Empty response')
        this.receipt = data

        // ✅ sync summary ด้วย (ให้ ledger อัปเดต)
        const summary = useSummaryStore()
        summary.ingestUpsert(data, 'update')

        return data
      })
    },

    /** ✅ create */
    async saveReceipt(payload: Receipt): Promise<ActionResult<Receipt>> {
      this.ensureListening()
      return this.run(`Saved receipt "${payload.projectCode || payload.fullName}"`, async () => {
        const data = await apiSaveReceipt(payload, this.header)
        if (!data) throw new Error('Empty response')

        this.receipt = data
        this.upsertList(data)

        // ✅ ส่งเข้า SummaryStore
        const summary = useSummaryStore()
        summary.ingestUpsert(data, 'create')

        return data
      })
    },

    /** ✅ update */
    async updateReceipt(payload: Receipt): Promise<ActionResult<Receipt>> {
      this.ensureListening()
      return this.run(`Updated receipt "${payload.projectCode || payload.id}"`, async () => {
        const data = await apiUpdateReceipt(payload, this.header)
        if (!data) throw new Error('Empty response')

        this.receipt = data
        this.upsertList(data)

        // ✅ ส่งเข้า SummaryStore
        const summary = useSummaryStore()
        summary.ingestUpsert(data, 'update')

        return data
      })
    },

    /** ✅ delete */
    async deleteReceipt(idOrProjectCode: string): Promise<ActionResult<true>> {
      this.ensureListening()
      return this.run(`Deleted receipt "${idOrProjectCode}"`, async () => {
        const ok = await apiDeleteReceipt(idOrProjectCode, this.header)
        if (!ok) throw new Error('Delete failed')

        this.removeFromList(idOrProjectCode)

        // ✅ ส่งเข้า SummaryStore
        const summary = useSummaryStore()
        summary.ingestDelete(idOrProjectCode)

        return true
      })
    },

    /** ✅ ใช้กับ flow “ล้างหนี้/เคลียร์หนี้” (ถ้าปลายทางได้ Receipt กลับมา) */
    ingestClearResult(receipt: Receipt) {
      // update local receipt + list
      this.receipt = receipt
      this.upsertList(receipt)

      // ส่ง summary เป็น clear
      const summary = useSummaryStore()
      summary.ingestUpsert(receipt, 'clear')

      this.pushLog(`ingestClearResult "${safeStr((receipt as any).projectCode || (receipt as any).id)}"`)
    },

    /** ตั้งค่า receipt ทั้งก้อน */
    setReceipt(payload: Receipt) {
      this.receipt = { ...payload }
    },

    /** รีเซ็ต receipt */
    resetReceipt() {
      this.receipt = emptyReceipt()
    },

    /** ล้าง list + ล้าง summary พร้อมกัน (ตามที่คุณต้องการ) */
    resetAll() {
      this.receiptList = []
      this.receipt = emptyReceipt()

      const summary = useSummaryStore()
      summary.reset()

      this.pushLog('resetAll (receipt + summary)')
    },
  },
})
