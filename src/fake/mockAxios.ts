// src/fake/mockaxios.ts
import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { loadReceipts, saveReceipts, sanitizeReceipt } from './mockDb'
import type { Receipt } from '@/types/recipt'

/**
 * ==========================================================
 *  Fake API via Axios Mock Adapter
 *  - Backward compatible: receiptList <-> debtorList+depositList
 *  - Daily summary endpoints
 *  - Broadcast update events to refresh UI
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

type CloseState = { isClosed: boolean; closedAt?: string }
type ClosedMap = Record<string, CloseState>

const CLOSED_KEY = 'mock_daily_closed_map'
const LAST_UPDATE_KEY = 'receipts_last_update'

/** =========================
 *  LocalStorage: closed-map
 *  ========================= */
const loadClosedMap = (): ClosedMap => {
  try {
    return JSON.parse(localStorage.getItem(CLOSED_KEY) || '{}') as ClosedMap
  } catch {
    return {}
  }
}

const saveClosedMap = (map: ClosedMap) => {
  localStorage.setItem(CLOSED_KEY, JSON.stringify(map))
}

/** =========================
 *  Helpers: id mapping
 *  ========================= */
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

/** =========================
 *  Helpers: number parsing
 *  ========================= */
const toNum = (v: any) => {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const s = String(v).replaceAll(',', '').trim()
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

/** =========================
 *  Helpers: Dates
 *  ========================= */
const toDate = (v: any, fallback: Date) => {
  if (v instanceof Date) return v
  if (v) {
    const d = new Date(v)
    return Number.isFinite(d.getTime()) ? d : fallback
  }
  return fallback
}

const isoOrKeep = (v: any) => (v instanceof Date ? v.toISOString() : v)

/** =========================
 *  Ensure receipt fields exist (compat)
 *  ========================= */
const ensureReceiptFields = (r: any): any => {
  const mainName = (r.mainAffiliationName || r.affiliationName || '').trim()

  const affId =
    r.affiliationId ||
    r.mainAffiliationId ||
    r.affId ||
    guessAffIdFromName(mainName || r.affiliationName || '')

  const createdAt = toDate(r.createdAt, new Date())
  const updatedAt = toDate(r.updatedAt, createdAt)

  return {
    ...r,
    affiliationId: String(affId),

    // ชื่อสังกัดหลัก/สังกัด
    mainAffiliationName: r.mainAffiliationName || r.affiliationName || 'มหาวิทยาลัยพะเยา',
    affiliationName: r.affiliationName || r.mainAffiliationName || 'มหาวิทยาลัยพะเยา',

    // type ใหม่
    subAffiliationName1: r.subAffiliationName1 ?? r.subAffiliationName ?? '',
    subAffiliationName2: r.subAffiliationName2 ?? '',

    // default fields
    moneyTypeNote: r.moneyTypeNote ?? 'Waybill',
    isLocked: r.isLocked ?? false,

    // moneyType fallback
    moneyType: r.moneyType || r.sendmoney || 'transfer',

    createdAt,
    updatedAt,
  }
}

/** =========================
 *  Backward/Forward normalize
 *  ========================= */

/** แปลงแบบเก่า (receiptList) -> แบบใหม่ (debtorList + depositList) */
const normalizeToNewFormat = (receipt: any): any => {
  const r = ensureReceiptFields(receipt)

  if (r.debtorList && r.depositList) return r

  if (Array.isArray(r.receiptList)) {
    const debtorList = r.receiptList.map((item: any) => ({
      itemName: item.itemName || '',
      debtornote: item.note || item.debtornote || '',
      amount: toNum(item.debtorAmount ?? item.amount ?? 0),
    }))

    const depositList = r.receiptList.map((item: any) => {
      const paymentDetails = Array.isArray(item.paymentDetails) ? item.paymentDetails : []
      const subtotal = paymentDetails.reduce((sum: number, p: any) => sum + toNum(p.amount), 0)
      const fee = toNum(item.fee)

      return {
        itemName: item.itemName || '',
        depositnote: item.note || item.depositnote || '',
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

  if (r.debtorList && r.depositList) {
    const maxLength = Math.max(r.debtorList.length, r.depositList.length)
    const receiptList: any[] = []

    for (let i = 0; i < maxLength; i++) {
      const debtor = r.debtorList[i] || {}
      const deposit = r.depositList[i] || {}

      receiptList.push({
        itemName: debtor.itemName || deposit.itemName || '',
        note: debtor.debtornote || deposit.depositnote || '',
        debtorAmount: toNum(debtor.amount),
        depositSubtotal: toNum(deposit.subtotal),
        fee: toNum(deposit.fee),
        depositNetAmount: toNum(deposit.netAmount) || (toNum(deposit.subtotal) - toNum(deposit.fee)),
        amount: toNum(deposit.netAmount) || (toNum(deposit.subtotal) - toNum(deposit.fee)),
        paymentDetails: deposit.paymentDetails || [],
      })
    }

    return { ...r, receiptList, debtorList: r.debtorList, depositList: r.depositList }
  }

  return { ...r, receiptList: [], debtorList: [], depositList: [] }
}

/** ให้มีครบทั้งเก่า+ใหม่ */
const normalizeBoth = (receipt: any) => normalizeToOldFormat(normalizeToNewFormat(receipt))

/** =========================
 *  Robust amount calculators
 *  ========================= */
const sumDepositNet = (r: any) => {
  const list = Array.isArray(r.depositList) ? r.depositList : []
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
  const list = Array.isArray(r.debtorList) ? r.debtorList : []
  if (!list.length) return 0
  return list.reduce((sum: number, d: any) => sum + toNum(d?.amount), 0)
}

const sumOldReceiptList = (r: any) => {
  const list = Array.isArray(r.receiptList) ? r.receiptList : []
  if (!list.length) return 0

  return list.reduce((sum: number, it: any) => {
    const net = toNum(it?.depositNetAmount)
    if (net) return sum + net

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
    return v || sumOldReceiptList(r) || toNum(r.amount)
  }
  const v = sumDepositNet(r)
  return v || sumOldReceiptList(r) || toNum(r.amount)
}

/** =========================
 *  Summary mapping
 *  ========================= */
const receiptToSummaryEvent = (r: any): SummaryEvent | null => {
  const createdAt =
    r.createdAt instanceof Date ? r.createdAt.toISOString() : (r.createdAt || new Date().toISOString())

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

/** =========================
 *  Broadcasting updates
 *  ========================= */
const broadcastReceiptsUpdate = (payload: { action: string; data?: any; id?: string }) => {
  const ts = Date.now().toString()
  localStorage.setItem(LAST_UPDATE_KEY, ts)

  window.dispatchEvent(
    new CustomEvent('receipts-updated', {
      detail: { ...payload, timestamp: ts },
    })
  )
}

/** =========================
 *  Response serializer
 *  ========================= */
const serializeReceipt = (r: any) => {
  const x = normalizeBoth(r)
  return {
    ...x,
    createdAt: isoOrKeep(x.createdAt),
    updatedAt: isoOrKeep(x.updatedAt),
  }
}

/** =========================
 *  Setup Mock
 *  ========================= */
export function setupAxiosMock() {
  const mock = new AxiosMockAdapter(axios, { delayResponse: 300 })

  /** -------------------------
   *  GET /findOneReceipt/:id
   *  ------------------------- */
  mock.onGet(/\/findOneReceipt\/([^/]+)$/).reply((config) => {
    const id = config.url?.match(/\/findOneReceipt\/([^/]+)$/)?.[1]
    if (!id) return [400, { message: 'id required' }]

    const db = loadReceipts().map(ensureReceiptFields)
    const found = db.find((r: any) => r.projectCode === id || r.id === id)
    if (!found) return [404, { message: 'Not found' }]

    return [200, serializeReceipt(found)]
  })

  /** -------------------------
   *  GET /getReceipt/:projectCode
   *  ------------------------- */
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

    return [200, serializeReceipt(found)]
  })

  /** -------------------------
   *  GET /getReceipt?...
   *  ------------------------- */
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

    return [200, list.map(serializeReceipt)]
  })

  /** -------------------------
   *  POST /saveReceipt
   *  ------------------------- */
  mock.onPost('/saveReceipt').reply((config) => {
    const incoming = ensureReceiptFields(JSON.parse(config.data || '{}'))

    if (!incoming.projectCode) return [400, { message: 'projectCode is required' }]

    const db = loadReceipts().map(ensureReceiptFields)
    if (db.some((r: any) => r.projectCode === incoming.projectCode)) {
      return [409, { message: 'Duplicate projectCode' }]
    }

    const normalized = normalizeBoth(incoming)
    const now = new Date()
    normalized.createdAt = normalized.createdAt ?? now
    normalized.updatedAt = now

    const sanitized = sanitizeReceipt(normalized)
    const next = [sanitized, ...db]
    saveReceipts(next)

    console.log('💾 Receipt saved:', sanitized.projectCode)
    broadcastReceiptsUpdate({ action: 'create', data: sanitized })

    return [201, sanitized]
  })

  /** -------------------------
   *  PUT /updateReceipt/:projectCode
   *  ------------------------- */
  mock.onPut(/\/updateReceipt\/(.+)$/).reply((config) => {
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

    console.log('💾 Receipt updated:', updated.projectCode)
    broadcastReceiptsUpdate({ action: 'update', data: updated })

    return [200, updated]
  })

  /** -------------------------
   *  POST /updateReceipt  (bulk update)
   *  ------------------------- */
  mock.onPost('/updateReceipt').reply((config) => {
    const { receipt } = JSON.parse(config.data || '{}')
    if (!receipt || !receipt.projectCode) return [400, { message: 'receipt with projectCode is required' }]

    const db = loadReceipts().map(ensureReceiptFields)
    const idx = db.findIndex((r: any) => r.projectCode === receipt.projectCode)
    if (idx === -1) return [404, { message: 'Receipt not found' }]

    const normalized = normalizeBoth(ensureReceiptFields(receipt))
    const updated = sanitizeReceipt({
      ...db[idx],
      ...normalized,
      updatedAt: new Date(),
    })

    db[idx] = updated
    saveReceipts(db)

    console.log('💾 Receipt bulk updated:', updated.projectCode)
    broadcastReceiptsUpdate({ action: 'bulk-update', data: updated })

    return [200, { success: true, data: updated }]
  })

  /** -------------------------
   *  DELETE /deleteReceipt/:id
   *  ------------------------- */
  mock.onDelete(/\/deleteReceipt\/([^/]+)$/).reply((config) => {
    const id = config.url?.match(/\/deleteReceipt\/([^/]+)$/)?.[1]
    if (!id) return [400, { success: false, message: 'id required' }]

    const db = loadReceipts().map(ensureReceiptFields)
    const before = db.length
    const next = db.filter((r: any) => r.projectCode !== id && r.id !== id)
    saveReceipts(next)

    console.log('🗑️ Receipt deleted:', id)
    broadcastReceiptsUpdate({ action: 'delete', id })

    return [200, { success: next.length !== before }]
  })

  /** -------------------------
   *  GET /summary/events?...
   *  ------------------------- */
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

    // date range
    if (start && end) {
      const s = new Date(start + 'T00:00:00').getTime()
      const e = new Date(end + 'T23:59:59').getTime()
      items = items.filter((it) => {
        const t = new Date(it.createdAt).getTime()
        return t >= s && t <= e
      })
    }

    // exact filters
    if (faculty) items = items.filter((it) => it.faculty === faculty)
    if (sub1) items = items.filter((it) => (it.sub1 || '') === sub1)
    if (sub2) items = items.filter((it) => (it.sub2 || '') === sub2)

    // text search
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

    // newest first
    items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

    return [200, { items }]
  })

  /** -------------------------
   *  GET /daily/closed-map
   *  ------------------------- */
  mock.onGet('/daily/closed-map').reply(() => {
    return [200, { map: loadClosedMap() }]
  })

  console.log('✅ Axios Mock Setup Complete (clean + backward compatible + summary endpoints)')
  return mock
}
