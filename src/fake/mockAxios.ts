// src/fake/mockaxios.ts
import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { loadReceipts, saveReceipts, sanitizeReceipt } from './mockDb'
import type { Receipt } from '@/types/recipt'

/**
 * ==========================================================
 * Fake API via Axios Mock Adapter
 * - ใช้ delNumber เป็น primary identifier
 * - บันทึกไปทั้ง storage หลัก + summary storage
 * - Summary storage สำหรับล้างลูกหนี้โดยไม่กระทบหลัก
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
  delNumber?: string
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

/** ✅ ค้นหา receipt จาก delNumber หรือ id */
const findReceiptByDelNumber = (db: any[], searchId: string) => {
  const decoded = decodeURIComponent(searchId).trim()
  
  return db.find(
    (r: any) =>
      String(r.delNumber || '').trim() === decoded ||
      String(r.id || '').trim() === decoded
  )
}

/** ✅ Summary Storage Functions */
const SUMMARY_KEY = 'fakeApi.summary'

const loadSummaryStorage = () => {
  try {
    const raw = localStorage.getItem(SUMMARY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveSummaryStorage = (data: any[]) => {
  localStorage.setItem(SUMMARY_KEY, JSON.stringify(data))
}

/** ✅ บันทึกไปทั้ง 2 storage พร้อมกัน */
const saveToBothStorages = (receipt: any) => {
  console.log('🔄 Starting dual storage save...')
  
  // 1. บันทึก storage หลัก
  const mainDb = loadReceipts()
  const existingIndex = mainDb.findIndex(r => r.delNumber === receipt.delNumber)
  
  if (existingIndex >= 0) {
    mainDb[existingIndex] = receipt
  } else {
    mainDb.unshift(receipt)
  }
  
  saveReceipts(mainDb)
  console.log('✅ [1/2] Main Storage saved:', receipt.delNumber)
  console.log('   📦 Main Storage count:', mainDb.length)
  
  // 2. บันทึก summary storage
  const summaryDb = loadSummaryStorage()
  const summaryIndex = summaryDb.findIndex((r: any) => r.delNumber === receipt.delNumber)
  
  if (summaryIndex >= 0) {
    summaryDb[summaryIndex] = receipt
  } else {
    summaryDb.unshift(receipt)
  }
  
  saveSummaryStorage(summaryDb)
  console.log('✅ [2/2] Summary Storage saved:', receipt.delNumber)
  console.log('   📦 Summary Storage count:', summaryDb.length)
  
  // Verify sync
  if (mainDb.length === summaryDb.length) {
    console.log('✅ ✨ BOTH STORAGES SYNCED! ✨')
  } else {
    console.error('❌ WARNING: Storages NOT synced!')
    console.error('   Main:', mainDb.length, '| Summary:', summaryDb.length)
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

/** ✅ ลบจากทั้ง 2 storage พร้อมกัน */
const deleteFromBothStorages = (delNumber: string) => {
  console.log('🗑️ Starting dual storage delete...')
  console.log('   Deleting:', delNumber)
  
  // 1. ลบจาก storage หลัก
  const mainDb = loadReceipts()
  const beforeMain = mainDb.length
  const filteredMain = mainDb.filter(r => r.delNumber !== delNumber)
  saveReceipts(filteredMain)
  console.log('✅ [1/2] Main Storage deleted')
  console.log('   📦 Before:', beforeMain, '→ After:', filteredMain.length)
  
  // 2. ลบจาก summary storage
  const summaryDb = loadSummaryStorage()
  const beforeSummary = summaryDb.length
  const filteredSummary = summaryDb.filter((r: any) => r.delNumber !== delNumber)
  saveSummaryStorage(filteredSummary)
  console.log('✅ [2/2] Summary Storage deleted')
  console.log('   📦 Before:', beforeSummary, '→ After:', filteredSummary.length)
  
  // Verify sync
  if (filteredMain.length === filteredSummary.length) {
    console.log('✅ ✨ BOTH STORAGES SYNCED! ✨')
  } else {
    console.error('❌ WARNING: Storages NOT synced!')
    console.error('   Main:', filteredMain.length, '| Summary:', filteredSummary.length)
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

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
    delNumber: r?.delNumber || r?.id || '',
    id: r?.delNumber || r?.id || '', // ✅ id = delNumber
    createdAt,
    updatedAt,
  }
}

const serializeReceipt = (r: any) => ({
  ...r,
  createdAt: r?.createdAt instanceof Date ? r.createdAt.toISOString() : r?.createdAt,
  updatedAt: r?.updatedAt instanceof Date ? r.updatedAt.toISOString() : r?.updatedAt,
})

/** -------------------------
 * Normalize Functions
 * ------------------------- */
const normalizeToNewFormat = (receipt: any): any => {
  const r = ensureReceiptFields(receipt)
  if (Array.isArray(r.debtorList) && Array.isArray(r.depositList)) return r

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
        amount: net,
        paymentDetails: deposit?.paymentDetails || [],
        isClearedDebt: debtor?.isClearedDebt || false,
      })
    }

    return { ...r, receiptList, debtorList: r.debtorList, depositList: r.depositList }
  }

  return { ...r, receiptList: [], debtorList: [], depositList: [] }
}

const normalizeBoth = (receipt: any) => normalizeToOldFormat(normalizeToNewFormat(receipt))

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
    delNumber: r.delNumber || r.id || '',
  }
}

const dispatchUpdateEvents = (payload: {
  action: 'create' | 'update' | 'delete' | 'bulk-update'
  data?: any
  id?: string
  delNumber?: string
  list?: any[]
}) => {
  const ts = Date.now().toString()
  localStorage.setItem('receipts_last_update', ts)

  if (payload.list) {
    localStorage.setItem('fakeApi.receipts', JSON.stringify(payload.list))
  }

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

  /** ✅ GET /checkDelNumber/:delNumber - ตรวจสอบเลขซ้ำ */
  mock.onGet(/\/checkDelNumber\/([^/]+)$/).reply((config) => {
    const delNumber = config.url?.match(/\/checkDelNumber\/([^/]+)$/)?.[1]
    if (!delNumber) return [400, { exists: false }]

    const decoded = decodeURIComponent(delNumber)
    const db = loadReceipts().map(ensureReceiptFields)
    const exists = db.some(r => r.delNumber === decoded)

    return [200, { exists, delNumber: decoded }]
  })

  /** GET /findOneReceipt/:id */
  mock.onGet(/\/findOneReceipt\/([^/]+)$/).reply((config) => {
    const id = config.url?.match(/\/findOneReceipt\/([^/]+)$/)?.[1]
    if (!id) {
      console.error('❌ findOneReceipt - No ID provided')
      return [400, { message: 'id required' }]
    }

    const decoded = decodeURIComponent(id)
    const db = loadReceipts().map(ensureReceiptFields)
    const found = findReceiptByDelNumber(db, decoded)
    
    if (!found) {
      console.warn('❌ findOneReceipt - Not found:', decoded)
      return [404, { 
        message: 'Receipt not found', 
        searchedId: decoded,
        availableDelNumbers: db.map(r => r.delNumber).filter(Boolean)
      }]
    }

    console.log('✅ findOneReceipt - Found:', found.delNumber)
    return [200, serializeReceipt(normalizeBoth(found))]
  })

  /** GET /getReceipt/:delNumber */
  mock.onGet(/\/getReceipt\/([^?]+)$/).reply((config) => {
    const url = config.url || ''
    const match = url.match(/\/getReceipt\/([^?]+)$/)
    const delNumber = match?.[1]

    if (!delNumber) {
      console.error('❌ getReceipt - No delNumber provided')
      return [400, { message: 'delNumber required' }]
    }

    const decoded = decodeURIComponent(delNumber)
    const db = loadReceipts().map(ensureReceiptFields)
    const found = findReceiptByDelNumber(db, decoded)

    if (!found) {
      console.warn('❌ getReceipt - Not found:', decoded)
      return [
        404,
        {
          message: 'Receipt not found',
          requestedDelNumber: decoded,
          availableDelNumbers: db.map(r => r.delNumber).filter(Boolean),
        },
      ]
    }

    console.log('✅ getReceipt - Found:', found.delNumber)
    return [200, serializeReceipt(normalizeBoth(found))]
  })

  /** GET /getReceipt?... */
  mock.onGet(/\/getReceipt(?:\?.*)?$/).reply((config) => {
    const db = loadReceipts().map(ensureReceiptFields)

    const url = new URL(config.url!, window.location.origin)
    const fullName = url.searchParams.get('fullName')
    const delNumber = url.searchParams.get('delNumber')
    const affiliationId = url.searchParams.get('affiliationId')
    const q = url.searchParams.get('q')

    let list: any[] = db

    if (fullName) {
      list = list.filter((r) => 
        (r.fullName || '').toLowerCase().includes(fullName.toLowerCase())
      )
    }
    
    if (delNumber) {
      list = list.filter((r) => r.delNumber === delNumber)
    }
    
    if (affiliationId) {
      list = list.filter((r) => String(r.affiliationId) === String(affiliationId))
    }

    if (q) {
      const s = q.toLowerCase()
      list = list.filter(
        (r) =>
          (r.fullName || '').toLowerCase().includes(s) ||
          (r.delNumber || '').toLowerCase().includes(s) ||
          (r.affiliationName || '').toLowerCase().includes(s) ||
          (r.mainAffiliationName || '').toLowerCase().includes(s)
      )
    }

    console.log(`✅ getReceipt query - Found ${list.length} receipts`)
    return [200, list.map((r) => serializeReceipt(normalizeBoth(r)))]
  })

  /** ✅ POST /saveReceipt - บันทึกทั้ง 2 storage */
  mock.onPost('/saveReceipt').reply((config) => {
    console.log('💾 POST /saveReceipt called')

    const incoming = ensureReceiptFields(JSON.parse(config.data || '{}'))

    if (!incoming.delNumber) {
      console.error('❌ No delNumber')
      return [400, { message: 'delNumber is required' }]
    }

    const db = loadReceipts().map(ensureReceiptFields)
    
    const existing = findReceiptByDelNumber(db, incoming.delNumber)
    if (existing) {
      console.error('❌ Duplicate delNumber:', incoming.delNumber)
      return [409, { message: 'Duplicate delNumber', delNumber: incoming.delNumber }]
    }

    const normalized = normalizeBoth(incoming)
    const now = new Date()
    normalized.createdAt = normalized.createdAt ?? now
    normalized.updatedAt = now
    normalized.id = normalized.delNumber // ✅ ให้ id = delNumber

    const sanitized = sanitizeReceipt(normalized)
    
    // ✅ บันทึกไปทั้ง 2 storage
    saveToBothStorages(sanitized)
    
    const next = [sanitized, ...db]

    dispatchUpdateEvents({
      action: 'create',
      data: sanitized,
      delNumber: sanitized.delNumber,
      list: next,
    })

    console.log('✅ Receipt saved to both storages:', sanitized.delNumber)
    return [201, serializeReceipt(sanitized)]
  })

  /** ✅ POST /updateReceipt - อัพเดททั้ง 2 storage */
  mock.onPost('/updateReceipt').reply((config) => {
    console.log('🔧 POST /updateReceipt called')

    const { receipt } = JSON.parse(config.data || '{}')
    if (!receipt) {
      console.error('❌ No receipt in request body')
      return [400, { message: 'receipt object is required' }]
    }

    if (!receipt.delNumber) {
      console.error('❌ No delNumber in receipt')
      return [400, { message: 'receipt.delNumber is required' }]
    }

    const db = loadReceipts().map(ensureReceiptFields)
    const found = findReceiptByDelNumber(db, receipt.delNumber)
    
    if (!found) {
      console.error('❌ Receipt not found:', receipt.delNumber)
      return [404, { message: 'Receipt not found', delNumber: receipt.delNumber }]
    }

    const idx = db.indexOf(found)
    const normalized = normalizeBoth(ensureReceiptFields(receipt))
    const updated = sanitizeReceipt({
      ...db[idx],
      ...normalized,
      delNumber: db[idx].delNumber,
      id: db[idx].delNumber, // ✅ ให้ id = delNumber
      updatedAt: new Date(),
    })

    // ✅ บันทึกไปทั้ง 2 storage
    saveToBothStorages(updated)

    db[idx] = updated

    dispatchUpdateEvents({
      action: 'bulk-update',
      data: updated,
      delNumber: updated.delNumber,
      list: db,
    })

    console.log('✅ Bulk updated in both storages:', updated.delNumber)
    return [200, { success: true, data: serializeReceipt(updated) }]
  })

  /** ✅ PUT /updateReceipt/:delNumber - อัพเดททั้ง 2 storage */
  mock.onPut(/\/updateReceipt\/(.+)$/).reply((config) => {
    console.log('🔧 PUT /updateReceipt/:delNumber called')

    const matches = config.url?.match(/\/updateReceipt\/(.+)$/)
    const delNumber = matches ? decodeURIComponent(matches[1]) : ''
    
    if (!delNumber) {
      console.error('❌ No delNumber in URL')
      return [400, { message: 'delNumber is required' }]
    }

    const incoming = ensureReceiptFields(JSON.parse(config.data || '{}'))

    const db = loadReceipts().map(ensureReceiptFields)
    const found = findReceiptByDelNumber(db, delNumber)
    
    if (!found) {
      console.error('❌ Receipt not found:', delNumber)
      return [404, { message: 'Receipt not found', delNumber }]
    }

    const idx = db.indexOf(found)
    const normalized = normalizeBoth(incoming)
    const updated = sanitizeReceipt({
      ...db[idx],
      ...normalized,
      delNumber: db[idx].delNumber,
      id: db[idx].delNumber, // ✅ ให้ id = delNumber
      createdAt: db[idx].createdAt,
      updatedAt: new Date(),
    })

    // ✅ บันทึกไปทั้ง 2 storage
    saveToBothStorages(updated)

    db[idx] = updated

    dispatchUpdateEvents({
      action: 'update',
      data: updated,
      delNumber: updated.delNumber,
      list: db,
    })

    console.log('✅ Updated in both storages:', updated.delNumber)
    return [200, serializeReceipt(updated)]
  })

  /** ✅ DELETE /deleteReceipt/:id - ลบจากทั้ง 2 storage */
  mock.onDelete(/\/deleteReceipt\/([^/]+)$/).reply((config) => {
    console.log('🗑️ DELETE /deleteReceipt/:id called')

    const id = config.url?.match(/\/deleteReceipt\/([^/]+)$/)?.[1]
    if (!id) {
      console.error('❌ No ID provided')
      return [400, { success: false, message: 'id required' }]
    }

    const decoded = decodeURIComponent(id)
    const db = loadReceipts().map(ensureReceiptFields)
    const found = findReceiptByDelNumber(db, decoded)
    
    if (found) {
      // ✅ ลบจากทั้ง 2 storage
      deleteFromBothStorages(found.delNumber)
    }
    
    const next = db.filter((r: any) => {
      const match = findReceiptByDelNumber([r], decoded)
      return !match
    })

    dispatchUpdateEvents({
      action: 'delete',
      id: decoded,
      list: next,
    })

    const deleted = found ? 1 : 0
    console.log(`✅ Deleted from both storages: ${decoded}`)
    return [200, { success: deleted > 0, deletedCount: deleted }]
  })

  /** ✅ GET /getSummary - ดึงข้อมูลจาก summary storage */
  mock.onGet(/\/getSummary(?:\?.*)?$/).reply((config) => {
    const summaryDb = loadSummaryStorage().map(ensureReceiptFields)
    
    const url = new URL(config.url!, window.location.origin)
    const affiliationId = url.searchParams.get('affiliationId')
    const q = url.searchParams.get('q')

    let list: any[] = summaryDb

    if (affiliationId) {
      list = list.filter((r: any) => String(r.affiliationId) === String(affiliationId))
    }

    if (q) {
      const s = q.toLowerCase()
      list = list.filter(
        (r: any) =>
          (r.fullName || '').toLowerCase().includes(s) ||
          (r.delNumber || '').toLowerCase().includes(s)
      )
    }

    console.log(`✅ getSummary - Found ${list.length} receipts from summary storage`)
    return [200, list.map((r: any) => serializeReceipt(normalizeBoth(r)))]
  })

  /** GET /summary/events */
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
          (it.delNumber || '').toLowerCase().includes(search)
      )
    }

    items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    console.log(`✅ summary/events - Found ${items.length} events`)
    return [200, { items }]
  })

  console.log('✅ Axios Mock Setup Complete - Using delNumber as primary + Dual Storage')
  return mock
}