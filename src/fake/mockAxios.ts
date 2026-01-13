// src/fake/mockaxios.ts
import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { loadReceipts, saveReceipts, sanitizeReceipt } from './mockDb'
import type { Receipt } from '@/types/recipt'

/**
 * ==========================================================
 * Fake API via Axios Mock Adapter
 * - Backward compatible: receiptList <-> debtorList + depositList
 * - Summary endpoints
 * - Broadcast update events to refresh UI
 * ==========================================================
 */

type EventType = 'WAYBILL' | 'DEBTOR_NEW' | 'CLEAR_DEBTOR'

type SummaryEvent = {
  createdAt: string
  type: EventType
  faculty: string
  amount: number
  sub1?: string
  sub2?: string
  fundName?: string
  fullName?: string
  projectCode?: string
}

/** -------------------------
 * Utils
 * ------------------------- */
const toNum = (v: any) => {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const s = String(v).replaceAll(',', '').trim()
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

const nowIso = () => new Date().toISOString()

/** ✅ map จากชื่อคณะ/หน่วยงาน -> affiliationId สำหรับทดสอบ */
const guessAffIdFromName = (name: string) => {
  const n = (name || '').trim()
  if (!n) return 'UP'
  if (n.includes('กองคลัง')) return 'FIN'
  if (n.includes('วิศวกรรม')) return 'ENG'
  if (n.includes('แพทย์')) return 'MED'
  if (n.includes('พยาบาล')) return 'NUR'
  if (n.includes('ทันต')) return 'DEN'
  return 'UP'
}

/** ให้แน่ใจว่า receipt มีฟิลด์พื้นฐานที่ใช้ทั้งระบบ */
const ensureReceiptFields = (r: any): any => {
  const mainName = (r?.mainAffiliationName || r?.affiliationName || '').trim()

  const affId =
    r?.affiliationId ||
    r?.mainAffiliationId ||
    r?.affId ||
    guessAffIdFromName(mainName || r?.affiliationName || '')

  const createdAt =
    r?.createdAt instanceof Date
      ? r.createdAt
      : r?.createdAt
        ? new Date(r.createdAt)
        : new Date()

  const updatedAt =
    r?.updatedAt instanceof Date
      ? r.updatedAt
      : r?.updatedAt
        ? new Date(r.updatedAt)
        : createdAt

  return {
    ...r,
    affiliationId: String(affId),
    mainAffiliationName: r?.mainAffiliationName || r?.affiliationName || 'มหาวิทยาลัยพะเยา',
    affiliationName: r?.affiliationName || r?.mainAffiliationName || 'มหาวิทยาลัยพะเยา',
    subAffiliationName1: r?.subAffiliationName1 ?? r?.subAffiliationName ?? '',
    subAffiliationName2: r?.subAffiliationName2 ?? '',
    moneyTypeNote: r?.moneyTypeNote ?? 'Waybill',
    isLocked: r?.isLocked ?? false,
    moneyType: r?.moneyType || r?.sendmoney || 'transfer',
    createdAt,
    updatedAt,
  }
}

/** บังคับให้ response ส่ง Date เป็น string (กัน Vue/Pinia/JSON เพี้ยน) */
const serializeReceipt = (r: any) => ({
  ...r,
  createdAt: r?.createdAt instanceof Date ? r.createdAt.toISOString() : r?.createdAt,
  updatedAt: r?.updatedAt instanceof Date ? r.updatedAt.toISOString() : r?.updatedAt,
})

/** -------------------------
 * Normalize Functions
 * ------------------------- */

/** แปลงแบบเก่า (receiptList) -> แบบใหม่ (debtorList + depositList) */
const normalizeToNewFormat = (receipt: any): any => {
  const r = ensureReceiptFields(receipt)

  // ถ้ามีครบแล้วก็จบ
  if (Array.isArray(r.debtorList) && Array.isArray(r.depositList)) return r

  // ถ้ามีแบบเก่า
  if (Array.isArray(r.receiptList)) {
    const debtorList = r.receiptList.map((item: any) => ({
      itemName: item?.itemName || '',
      debtornote: item?.note || item?.debtornote || '',
      amount: toNum(item?.debtorAmount ?? item?.amount ?? 0),
      isClearedDebt: item?.isClearedDebt || false,
    }))

    const depositList = r.receiptList.map((item: any) => {
      const paymentDetails = Array.isArray(item?.paymentDetails) ? item.paymentDetails : []
      const subtotal = paymentDetails.reduce((sum: number, p: any) => sum + toNum(p?.amount), 0)
      const fee = toNum(item?.fee)

      return {
        itemName: item?.itemName || '',
        depositnote: item?.note || item?.depositnote || '',
        subtotal,
        fee,
        netAmount: subtotal - fee,
        paymentDetails,
      }
    })

    return { ...r, debtorList, depositList, receiptList: r.receiptList }
  }

  return { ...r, debtorList: [], depositList: [], receiptList: [] }
}

/** แปลงแบบใหม่ (debtorList + depositList) -> แบบเก่า (receiptList) */
const normalizeToOldFormat = (receipt: any): any => {
  const r = ensureReceiptFields(receipt)

  if (Array.isArray(r.receiptList)) return r

  if (Array.isArray(r.debtorList) && Array.isArray(r.depositList)) {
    const maxLength = Math.max(r.debtorList.length, r.depositList.length)
    const receiptList: any[] = []

    for (let i = 0; i < maxLength; i++) {
      const debtor = r.debtorList[i] || {}
      const deposit = r.depositList[i] || {}

      const depositSubtotal =
        toNum(deposit?.subtotal) ||
        (Array.isArray(deposit?.paymentDetails)
          ? deposit.paymentDetails.reduce((ss: number, p: any) => ss + toNum(p?.amount), 0)
          : 0)

      const fee = toNum(deposit?.fee)
      const net = toNum(deposit?.netAmount) || (depositSubtotal - fee)

      receiptList.push({
        itemName: debtor?.itemName || deposit?.itemName || '',
        note: debtor?.debtornote || deposit?.depositnote || '',
        debtorAmount: toNum(debtor?.amount),
        depositSubtotal,
        fee,
        depositNetAmount: net,
        amount: net, // legacy amount
        paymentDetails: deposit?.paymentDetails || [],
        isClearedDebt: debtor?.isClearedDebt || false,
      })
    }

    return { ...r, receiptList, debtorList: r.debtorList, depositList: r.depositList }
  }

  return { ...r, receiptList: [], debtorList: [], depositList: [] }
}

/** ให้มีครบทั้งเก่า+ใหม่ */
const normalizeBoth = (receipt: any) => normalizeToOldFormat(normalizeToNewFormat(receipt))

/** -------------------------
 * Robust Amount Calculators
 * ------------------------- */
const sumDepositNet = (r: any) => {
  const list = Array.isArray(r?.depositList) ? r.depositList : []
  if (!list.length) return 0

  return list.reduce((sum: number, d: any) => {
    const net = toNum(d?.netAmount)
    if (net) return sum + net

    const payments = Array.isArray(d?.paymentDetails) ? d.paymentDetails : []
    const subtotal = payments.reduce((ss: number, p: any) => ss + toNum(p?.amount), 0)
    const fee = toNum(d?.fee)
    return sum + (subtotal - fee)
  }, 0)
}

const sumDebtor = (r: any) => {
  const list = Array.isArray(r?.debtorList) ? r.debtorList : []
  if (!list.length) return 0
  return list.reduce((sum: number, d: any) => sum + toNum(d?.amount), 0)
}

const sumOldReceiptList = (r: any) => {
  const list = Array.isArray(r?.receiptList) ? r.receiptList : []
  if (!list.length) return 0

  return list.reduce((sum: number, it: any) => {
    const payments = Array.isArray(it?.paymentDetails) ? it.paymentDetails : []
    const subtotal = payments.reduce((ss: number, p: any) => ss + toNum(p?.amount), 0)
    const fee = toNum(it?.fee)

    if (subtotal) return sum + (subtotal - fee)
    return sum + toNum(it?.amount)
  }, 0)
}

const calcAmountByType = (type: EventType, r: any) => {
  if (type === 'DEBTOR_NEW') {
    const v = sumDebtor(r)
    return v || sumOldReceiptList(r) || toNum(r?.amount)
  }
  const v = sumDepositNet(r)
  return v || sumOldReceiptList(r) || toNum(r?.amount)
}

/** receipt -> summary event */
const receiptToSummaryEvent = (r: any): SummaryEvent | null => {
  if (!r) return null

  const createdAt =
    r.createdAt instanceof Date ? r.createdAt.toISOString() : (r.createdAt || nowIso())

  const note = String(r.moneyTypeNote || '').toLowerCase()

  let type: EventType = 'WAYBILL'
  if (note.includes('clear')) type = 'CLEAR_DEBTOR'
  else if (note.includes('debtor')) type = 'DEBTOR_NEW'

  const faculty = (r.mainAffiliationName || r.affiliationName || 'มหาวิทยาลัยพะเยา').trim()
  const amount = calcAmountByType(type, r)

  return {
    createdAt,
    type,
    faculty,
    amount,
    sub1: r.subAffiliationName1 || '',
    sub2: r.subAffiliationName2 || '',
    fundName: r.fundName || r.moneyTypeNote || '',
    fullName: r.fullName || '',
    projectCode: r.projectCode || r.id || '',
  }
}

/** -------------------------
 * Broadcast update events
 * ------------------------- */
const dispatchUpdateEvents = (payload: {
  action: 'create' | 'update' | 'delete' | 'bulk-update'
  data?: any
  id?: string
  projectCode?: string
  list?: any[]
}) => {
  const ts = Date.now().toString()
  localStorage.setItem('receipts_last_update', ts)

  if (payload.list) {
    localStorage.setItem('fakeApi.receipts', JSON.stringify(payload.list))
  }

  // ให้ component ที่ listen storage ทำงาน
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: payload.list ? 'fakeApi.receipts' : 'receipts_last_update',
      newValue: payload.list ? JSON.stringify(payload.list) : ts,
      url: window.location.href,
    })
  )

  window.dispatchEvent(
    new StorageEvent('storage', {
      key: 'receipts_last_update',
      newValue: ts,
      url: window.location.href,
    })
  )

  // ให้ component ที่ listen custom event ทำงาน
  window.dispatchEvent(
    new CustomEvent('receipts-updated', {
      detail: {
        ...payload,
        timestamp: ts,
      },
    })
  )
}

/** -------------------------
 * Main Setup
 * ------------------------- */
export function setupAxiosMock() {
  const mock = new AxiosMockAdapter(axios, { delayResponse: 300 })

  /** -------------------------
   * GET /findOneReceipt/:id
   * ------------------------- */
  mock.onGet(/\/findOneReceipt\/([^/]+)$/).reply((config) => {
    const id = config.url?.match(/\/findOneReceipt\/([^/]+)$/)?.[1]
    if (!id) return [400, { message: 'id required' }]

    const db = loadReceipts().map(ensureReceiptFields)
    const found = db.find((r: any) => r.projectCode === id || r.id === id)
    if (!found) return [404, { message: 'Not found' }]

    return [200, serializeReceipt(normalizeBoth(found))]
  })

  /** -------------------------
   * GET /getReceipt/:projectCode
   * ------------------------- */
  mock.onGet(/\/getReceipt\/([^?]+)$/).reply((config) => {
    const url = config.url || ''
    const match = url.match(/\/getReceipt\/([^?]+)$/)
    const projectCode = match?.[1]
    if (!projectCode) return [400, { message: 'projectCode is required' }]

    const decoded = decodeURIComponent(projectCode)
    const db = loadReceipts().map(ensureReceiptFields)
    const found = db.find((r: any) => r.projectCode === decoded)

    if (!found) {
      return [
        404,
        {
          message: 'Receipt not found',
          requestedCode: decoded,
          availableCodes: db.map((r: any) => r.projectCode),
        },
      ]
    }

    return [200, serializeReceipt(normalizeBoth(found))]
  })

  /** -------------------------
   * GET /getReceipt?...
   * ------------------------- */
  mock.onGet(/\/getReceipt(?:\?.*)?$/).reply((config) => {
    const db = loadReceipts().map(ensureReceiptFields)

    const url = new URL(config.url!, window.location.origin)
    const fullName = url.searchParams.get('fullName')
    const projectCode = url.searchParams.get('projectCode')
    const affiliationId = url.searchParams.get('affiliationId')
    const q = url.searchParams.get('q')

    let list: any[] = db

    if (fullName) list = list.filter((r) => (r.fullName || '').toLowerCase().includes(fullName.toLowerCase()))
    if (projectCode) list = list.filter((r) => r.projectCode === projectCode)
    if (affiliationId) list = list.filter((r) => String(r.affiliationId) === String(affiliationId))

    if (q) {
      const s = q.toLowerCase()
      list = list.filter(
        (r) =>
          (r.fullName || '').toLowerCase().includes(s) ||
          (r.projectCode || '').toLowerCase().includes(s) ||
          (r.affiliationName || '').toLowerCase().includes(s) ||
          (r.mainAffiliationName || '').toLowerCase().includes(s)
      )
    }

    // ให้หน้า list ได้ทั้งเก่า+ใหม่เสมอ
    return [200, list.map((r) => serializeReceipt(normalizeBoth(r)))]
  })

  /** -------------------------
   * POST /saveReceipt
   * ------------------------- */
  mock.onPost('/saveReceipt').reply((config) => {
    console.log('💾 POST /saveReceipt called')

    const incoming = ensureReceiptFields(JSON.parse(config.data || '{}'))

    if (!incoming.projectCode) {
      console.error('❌ No projectCode')
      return [400, { message: 'projectCode is required' }]
    }

    const db = loadReceipts().map(ensureReceiptFields)
    if (db.some((r: any) => r.projectCode === incoming.projectCode)) {
      console.error('❌ Duplicate projectCode:', incoming.projectCode)
      return [409, { message: 'Duplicate projectCode' }]
    }

    const normalized = normalizeBoth(incoming)
    const now = new Date()
    normalized.createdAt = normalized.createdAt ?? now
    normalized.updatedAt = now

    const sanitized = sanitizeReceipt(normalized)
    const next = [sanitized, ...db]
    saveReceipts(next)

    dispatchUpdateEvents({
      action: 'create',
      data: sanitized,
      projectCode: sanitized.projectCode,
      list: next,
    })

    console.log('✅ Receipt saved:', sanitized.projectCode)
    return [201, serializeReceipt(sanitized)]
  })

  /** -------------------------
   * POST /updateReceipt   (bulk style: { receipt })
   * ------------------------- */
  mock.onPost('/updateReceipt').reply((config) => {
    console.log('🔧 POST /updateReceipt called')

    const { receipt } = JSON.parse(config.data || '{}')
    if (!receipt || !receipt.projectCode) {
      console.error('❌ No receipt or projectCode')
      return [400, { message: 'receipt with projectCode is required' }]
    }

    const db = loadReceipts().map(ensureReceiptFields)
    const idx = db.findIndex((r: any) => r.projectCode === receipt.projectCode)
    if (idx === -1) {
      console.error('❌ Receipt not found:', receipt.projectCode)
      return [404, { message: 'Receipt not found' }]
    }

    const normalized = normalizeBoth(ensureReceiptFields(receipt))
    const updated = sanitizeReceipt({
      ...db[idx],
      ...normalized,
      updatedAt: new Date(),
    })

    db[idx] = updated
    saveReceipts(db)

    dispatchUpdateEvents({
      action: 'bulk-update',
      data: updated,
      projectCode: updated.projectCode,
      list: db,
    })

    console.log('✅ Bulk updated:', updated.projectCode)
    return [200, { success: true, data: serializeReceipt(updated) }]
  })

  /** -------------------------
   * PUT /updateReceipt/:projectCode
   * ------------------------- */
  mock.onPut(/\/updateReceipt\/(.+)$/).reply((config) => {
    console.log('🔧 PUT /updateReceipt/:projectCode called')

    const matches = config.url?.match(/\/updateReceipt\/(.+)$/)
    const projectCode = matches ? decodeURIComponent(matches[1]) : ''
    if (!projectCode) return [400, { message: 'projectCode is required' }]

    const incoming = ensureReceiptFields(JSON.parse(config.data || '{}'))

    const db = loadReceipts().map(ensureReceiptFields)
    const idx = db.findIndex((r: any) => r.projectCode === projectCode)
    if (idx === -1) return [404, { message: 'Receipt not found' }]

    const normalized = normalizeBoth(incoming)
    const updated = sanitizeReceipt({
      ...db[idx],
      ...normalized,
      projectCode,
      createdAt: db[idx].createdAt,
      updatedAt: new Date(),
    })

    db[idx] = updated
    saveReceipts(db)

    dispatchUpdateEvents({
      action: 'update',
      data: updated,
      projectCode: updated.projectCode,
      list: db,
    })

    console.log('✅ Updated:', updated.projectCode)
    return [200, serializeReceipt(updated)]
  })

  /** -------------------------
   * DELETE /deleteReceipt/:id
   * ------------------------- */
  mock.onDelete(/\/deleteReceipt\/([^/]+)$/).reply((config) => {
    console.log('🗑️ DELETE /deleteReceipt/:id called')

    const id = config.url?.match(/\/deleteReceipt\/([^/]+)$/)?.[1]
    if (!id) return [400, { success: false, message: 'id required' }]

    const db = loadReceipts().map(ensureReceiptFields)
    const before = db.length
    const next = db.filter((r: any) => r.projectCode !== id && r.id !== id)
    saveReceipts(next)

    dispatchUpdateEvents({
      action: 'delete',
      id,
      list: next,
    })

    console.log(`✅ Deleted ${before - next.length} receipt(s)`)
    return [200, { success: next.length !== before }]
  })

  /** -------------------------
   * GET /summary/events
   * ------------------------- */
  mock.onGet(/\/summary\/events(?:\?.*)?$/).reply((config) => {
    const db = loadReceipts().map(ensureReceiptFields).map(normalizeBoth)

    const url = new URL(config.url!, window.location.origin)
    const search = (url.searchParams.get('search') || '').trim().toLowerCase()
    const faculty = (url.searchParams.get('faculty') || '').trim()
    const sub1 = (url.searchParams.get('sub1') || '').trim()
    const sub2 = (url.searchParams.get('sub2') || '').trim()
    const start = (url.searchParams.get('start') || '').trim()
    const end = (url.searchParams.get('end') || '').trim()

    let items = db.map(receiptToSummaryEvent).filter(Boolean) as SummaryEvent[]

    if (start && end) {
      const s = new Date(start + 'T00:00:00').getTime()
      const e = new Date(end + 'T23:59:59').getTime()
      items = items.filter((it) => {
        const t = new Date(it.createdAt).getTime()
        return t >= s && t <= e
      })
    }

    if (faculty) items = items.filter((it) => it.faculty === faculty)
    if (sub1) items = items.filter((it) => (it.sub1 || '') === sub1)
    if (sub2) items = items.filter((it) => (it.sub2 || '') === sub2)

    if (search) {
      items = items.filter(
        (it) =>
          (it.faculty || '').toLowerCase().includes(search) ||
          (it.sub1 || '').toLowerCase().includes(search) ||
          (it.sub2 || '').toLowerCase().includes(search) ||
          (it.fundName || '').toLowerCase().includes(search) ||
          (it.fullName || '').toLowerCase().includes(search) ||
          (it.projectCode || '').toLowerCase().includes(search)
      )
    }

    items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    return [200, { items }]
  })

  console.log('✅ Axios Mock Setup Complete')
  return mock
}
