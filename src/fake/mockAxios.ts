// src/fake/mockaxios.ts
import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { loadReceipts, saveReceipts, sanitizeReceipt } from './mockDb'

// ❗ปรับ path type ให้ตรงโปรเจกต์คุณ
import type { Receipt } from '@/types/recipt'

export function setupAxiosMock() {
  const mock = new AxiosMockAdapter(axios, { delayResponse: 300 })

  // =========================
  // Helper: Ensure fields exist
  // =========================

  // ✅ map จากชื่อคณะ/หน่วยงาน -> affiliationId สำหรับทดสอบ
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

 const ensureReceiptFields = (r: any): any => {
  const mainName = (r.mainAffiliationName || r.affiliationName || '').trim()

  const affId =
    r.affiliationId ||
    r.mainAffiliationId ||
    r.affId ||
    guessAffIdFromName(mainName || r.affiliationName || '')

  const createdAt =
    r.createdAt instanceof Date
      ? r.createdAt
      : r.createdAt
        ? new Date(r.createdAt)
        : new Date()

  const updatedAt =
    r.updatedAt instanceof Date
      ? r.updatedAt
      : r.updatedAt
        ? new Date(r.updatedAt)
        : createdAt

  return {
    ...r,
    // ✅ เพิ่มบรรทัดนี้
    delNumber: r.delNumber || r.id || '',
    id: r.id || r.delNumber || '', // ✅ รองรับทั้ง 2 แบบ
    affiliationId: String(affId),

    mainAffiliationName: r.mainAffiliationName || r.affiliationName || 'มหาวิทยาลัยพะเยา',
    affiliationName: r.affiliationName || r.mainAffiliationName || 'มหาวิทยาลัยพะเยา',

    subAffiliationName1: r.subAffiliationName1 ?? r.subAffiliationName ?? '',
    subAffiliationName2: r.subAffiliationName2 ?? r.subAffiliationName2 ?? '',

    moneyTypeNote: r.moneyTypeNote ?? 'Waybill',
    isLocked: r.isLocked ?? false,

    moneyType: r.moneyType || r.sendmoney || 'transfer',

    createdAt,
    updatedAt,
  }
}

  // =========================
  // Backward/Forward normalize
  // =========================

  /**
   * ✅ แปลงข้อมูลจากแบบเก่า (receiptList) เป็นแบบใหม่ (debtorList + depositList)
   */
  const normalizeToNewFormat = (receipt: any): any => {
    const r = ensureReceiptFields(receipt)

    // ถ้ามี debtorList และ depositList อยู่แล้ว = แบบใหม่
    if (r.debtorList && r.depositList) {
      return r
    }

    // ถ้ามี receiptList = แบบเก่า -> แปลง
    if (r.receiptList && Array.isArray(r.receiptList)) {
      const debtorList = r.receiptList.map((item: any) => ({
        itemName: item.itemName || '',
        debtornote: item.note || item.debtornote || '',
        amount: Number(item.debtorAmount ?? item.amount ?? 0),
      }))

      const depositList = r.receiptList.map((item: any) => {
        const paymentDetails = Array.isArray(item.paymentDetails) ? item.paymentDetails : []
        const subtotal = paymentDetails.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0)
        const fee = Number(item.fee) || 0

        return {
          itemName: item.itemName || '',
          depositnote: item.note || item.depositnote || '',
          subtotal,
          fee,
          netAmount: subtotal - fee,
          paymentDetails,
        }
      })

      return {
        ...r,
        debtorList,
        depositList,
        // เก็บ receiptList ไว้ด้วยเผื่อหน้าอื่นยังใช้
        receiptList: r.receiptList,
      }
    }

    // ถ้าไม่มีทั้ง 2 แบบ
    return {
      ...r,
      debtorList: [],
      depositList: [],
      receiptList: [],
    }
  }

  /**
   * ✅ แปลงข้อมูลจากแบบใหม่ (debtorList + depositList) เป็นแบบเก่า (receiptList)
   */
  const normalizeToOldFormat = (receipt: any): any => {
    const r = ensureReceiptFields(receipt)

    // ถ้ามี receiptList อยู่แล้ว = แบบเก่า
    if (r.receiptList && Array.isArray(r.receiptList)) {
      return r
    }

    // ถ้ามี debtorList และ depositList = แบบใหม่ -> แปลงเป็นแบบเก่า
    if (r.debtorList && r.depositList) {
      const maxLength = Math.max(r.debtorList.length, r.depositList.length)

      const receiptList: any[] = []
      for (let i = 0; i < maxLength; i++) {
        const debtor = r.debtorList[i] || {}
        const deposit = r.depositList[i] || {}

        receiptList.push({
          itemName: debtor.itemName || deposit.itemName || '',
          note: debtor.debtornote || deposit.depositnote || '',
          debtorAmount: Number(debtor.amount) || 0,
          depositSubtotal: Number(deposit.subtotal) || 0,
          fee: Number(deposit.fee) || 0,
          depositNetAmount: Number(deposit.netAmount) || 0,
          amount: Number(deposit.netAmount) || 0,
          paymentDetails: deposit.paymentDetails || [],
        })
      }

      return {
        ...r,
        receiptList,
        debtorList: r.debtorList,
        depositList: r.depositList,
      }
    }

    return {
      ...r,
      receiptList: [],
      debtorList: [],
      depositList: [],
    }
  }

  const normalizeBoth = (receipt: any) => normalizeToOldFormat(normalizeToNewFormat(receipt))

  // =========================
  // Daily Summary (NEW) - robust amount
  // =========================

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

  // ✅ parse number safely (รองรับ "12,500")
  const toNum = (v: any) => {
    if (v === null || v === undefined) return 0
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0
    const s = String(v).replaceAll(',', '').trim()
    const n = Number(s)
    return Number.isFinite(n) ? n : 0
  }

  // ✅ sum deposit net (prefer netAmount, fallback paymentDetails-fee)
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

  // ✅ sum debtor (for DEBTOR_NEW)
  const sumDebtor = (r: any) => {
    const list = Array.isArray(r.debtorList) ? r.debtorList : []
    if (!list.length) return 0
    return list.reduce((sum: number, d: any) => sum + toNum(d?.amount), 0)
  }

  // ✅ old receiptList fallback
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

  // ✅ decide amount by event type
  const calcAmountByType = (type: EventType, r: any) => {
    if (type === 'DEBTOR_NEW') {
      const v = sumDebtor(r)
      return v || sumOldReceiptList(r) || toNum(r.amount)
    }
    const v = sumDepositNet(r)
    return v || sumOldReceiptList(r) || toNum(r.amount)
  }

  const receiptToSummaryEvent = (r: any): SummaryEvent | null => {
    const createdAt =
      r.createdAt instanceof Date ? r.createdAt.toISOString() : (r.createdAt || new Date().toISOString())

    // ✅ Mapping ประเภทเอกสาร:
    // ปรับได้ในอนาคตเป็น field จริง เช่น docType/documentType
    const note = String(r.moneyTypeNote || '').toLowerCase()

    let type: EventType = 'WAYBILL'
    if (note.includes('clear')) type = 'CLEAR_DEBTOR'
    else if (note.includes('debtor')) type = 'DEBTOR_NEW'
    else type = 'WAYBILL'

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

  // =========================
  // API Endpoints (Existing)
  // =========================

  // GET /findOneReceipt/:id
  mock.onGet(/\/findOneReceipt\/([^/]+)$/).reply((config) => {
    const id = config.url?.match(/\/findOneReceipt\/([^/]+)$/)?.[1]
    if (!id) return [400, { message: 'id required' }]

    const db = loadReceipts().map(ensureReceiptFields)
    const found = db.find((r: any) => r.projectCode === id || r.id === id)
    if (!found) return [404, { message: 'Not found' }]

    return [200, normalizeBoth(found)]
  })

// ✅ GET /getReceipt/:id (รองรับทั้ง delNumber และ projectCode)
mock.onGet(/\/getReceipt\/([^?]+)$/).reply((config) => {
  const url = config.url || ''
  const match = url.match(/\/getReceipt\/([^?]+)$/)
  const id = match?.[1]

  if (!id) return [400, { message: 'id is required' }]

  const decodedId = decodeURIComponent(id)

  const db = loadReceipts().map(ensureReceiptFields)
  
  // ✅ ค้นหาด้วย delNumber หรือ id หรือ projectCode
  const found = db.find((r: any) => 
    r.delNumber === decodedId || r.id === decodedId || r.projectCode === decodedId
  )
  
  if (!found) {
    return [404, { message: 'Receipt not found', requestedId: decodedId }]
  }

  const normalized = normalizeBoth(found)

  return [200, {
    ...normalized,
    createdAt: normalized.createdAt instanceof Date ? normalized.createdAt.toISOString() : normalized.createdAt,
    updatedAt: normalized.updatedAt instanceof Date ? normalized.updatedAt.toISOString() : normalized.updatedAt,
  }]
})

  // GET /getReceipt (with query params)
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

    const normalized = list.map((r) => {
      const x = normalizeBoth(r)
      return {
        ...x,
        createdAt: x.createdAt instanceof Date ? x.createdAt.toISOString() : x.createdAt,
        updatedAt: x.updatedAt instanceof Date ? x.updatedAt.toISOString() : x.updatedAt,
      }
    })

    return [200, normalized]
  })

// ✅ GET /checkDelNumber/:delNumber - ตรวจสอบเลขที่นำส่งซ้ำ
mock.onGet(/\/checkDelNumber\/(.+)$/).reply((config) => {
  const matches = config.url?.match(/\/checkDelNumber\/(.+)$/)
  const delNumber = matches ? decodeURIComponent(matches[1]) : ''
  
  if (!delNumber) {
    return [400, { message: 'delNumber is required' }]
  }

  const db = loadReceipts().map(ensureReceiptFields)
  const exists = db.some((r: any) => r.delNumber === delNumber)

  return [200, { exists }]
})

// ✅ POST /saveReceipt
mock.onPost('/saveReceipt').reply((config) => {
  const incoming = ensureReceiptFields(JSON.parse(config.data || '{}'))

  // ✅ ตรวจสอบ delNumber แทน projectCode
  if (!incoming.delNumber) {
    return [400, { message: 'delNumber is required' }]
  }

  const db = loadReceipts().map(ensureReceiptFields)

  // ✅ เช็คซ้ำด้วย delNumber
  if (db.some((r: any) => r.delNumber === incoming.delNumber)) {
    return [409, { message: 'Duplicate delNumber' }]
  }

  const normalized = normalizeBoth(incoming)

  const now = new Date()
  normalized.createdAt = normalized.createdAt ?? now
  normalized.updatedAt = now
  
  // ✅ ใช้ delNumber เป็น id
  normalized.id = incoming.delNumber

  const sanitized = sanitizeReceipt(normalized)

  const next = [sanitized, ...db]
  saveReceipts(next)

  console.log('💾 Receipt saved:', sanitized.delNumber)
  const updateTime = Date.now().toString()
  localStorage.setItem('receipts_last_update', updateTime)

  window.dispatchEvent(new StorageEvent('storage', {
    key: 'fakeApi.receipts',
    newValue: JSON.stringify(next),
    url: window.location.href
  }))

  window.dispatchEvent(new CustomEvent('receipts-updated', {
    detail: {
      action: 'create',
      data: sanitized,
      timestamp: updateTime
    }
  }))

  console.log('✅ Create event dispatched!')

  return [201, sanitized]
})


// ✅ PUT /updateReceipt/:id (รองรับทั้ง delNumber และ projectCode)
mock.onPut(/\/updateReceipt\/(.+)$/).reply((config) => {
  const matches = config.url?.match(/\/updateReceipt\/(.+)$/)
  const id = matches ? decodeURIComponent(matches[1]) : ''
  if (!id) return [400, { message: 'id is required' }]

  const incoming = ensureReceiptFields(JSON.parse(config.data || '{}'))

  const db = loadReceipts().map(ensureReceiptFields)
  
  // ✅ ค้นหาด้วย delNumber หรือ id หรือ projectCode
  const idx = db.findIndex((r: any) => 
    r.delNumber === id || r.id === id || r.projectCode === id
  )

  if (idx === -1) {
    return [404, { message: 'Receipt not found' }]
  }

  const normalized = normalizeBoth(incoming)

  const updated = sanitizeReceipt({
    ...db[idx],
    ...normalized,
    delNumber: incoming.delNumber || db[idx].delNumber, // ✅ อัปเดต delNumber
    id: db[idx].id, // ✅ เก็บ id เดิมไว้
    createdAt: db[idx].createdAt,
    updatedAt: new Date(),
  })

  db[idx] = updated
  saveReceipts(db)

  console.log('💾 Receipt updated:', updated.delNumber)
  const updateTime = Date.now().toString()
  localStorage.setItem('receipts_last_update', updateTime)

  window.dispatchEvent(new CustomEvent('receipts-updated', {
    detail: {
      action: 'update',
      data: updated,
      timestamp: updateTime
    }
  }))

  return [200, updated]
})

// POST /updateReceipt - สำหรับ bulk update
mock.onPost('/updateReceipt').reply((config) => {
  const { receipt } = JSON.parse(config.data || '{}')
  const db = loadReceipts().map(ensureReceiptFields)
  const idx = db.findIndex((r: any) => r.projectCode === receipt.projectCode)

  if (idx === -1) {
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

  console.log('💾 Receipt bulk updated:', updated.projectCode)
  const updateTime = Date.now().toString()
  localStorage.setItem('receipts_last_update', updateTime)

  window.dispatchEvent(new CustomEvent('receipts-updated', {
    detail: {
      action: 'bulk-update',
      data: updated,
      timestamp: updateTime
    }
  }))

  return [200, { success: true, data: updated }]
})
// DELETE /deleteReceipt/:id
mock.onDelete(/\/deleteReceipt\/([^/]+)$/).reply((config) => {
  const id = config.url?.match(/\/deleteReceipt\/([^/]+)$/)?.[1]
  if (!id) return [400, { success: false, message: 'id required' }]

  const db = loadReceipts().map(ensureReceiptFields)
  const before = db.length
  const next = db.filter((r: any) => 
    r.delNumber !== id && r.id !== id && r.projectCode !== id
  )
  saveReceipts(next)

  // ✅ เพิ่มการส่ง event
  console.log('🗑️ Receipt deleted:', id)
  console.log('📤 Dispatching delete event...')

  const updateTime = Date.now().toString()
  localStorage.setItem('receipts_last_update', updateTime)

  window.dispatchEvent(new StorageEvent('storage', {
    key: 'fakeApi.receipts',
    newValue: JSON.stringify(next),
    url: window.location.href
  }))

  window.dispatchEvent(new StorageEvent('storage', {
    key: 'receipts_last_update',
    newValue: updateTime,
    url: window.location.href
  }))

  window.dispatchEvent(new CustomEvent('receipts-updated', {
    detail: {
      action: 'delete',
      id,
      timestamp: updateTime
    }
  }))

  console.log('✅ Delete event dispatched!')

  return [200, { success: next.length !== before }]
})
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

    // date range filter
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

  // GET /daily/closed-map
  mock.onGet('/daily/closed-map').reply(() => {
    return [200, { map: loadClosedMap() }]
  })

// POST /saveReceipt
mock.onPost('/saveReceipt').reply((config) => {
  const incoming = ensureReceiptFields(JSON.parse(config.data || '{}'))
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

  // ✅ เพิ่มการส่ง event
  console.log('💾 Receipt saved:', sanitized.projectCode)
  console.log('📤 Dispatching create event...')

  const updateTime = Date.now().toString()
  localStorage.setItem('receipts_last_update', updateTime)

  window.dispatchEvent(new StorageEvent('storage', {
    key: 'fakeApi.receipts',
    newValue: JSON.stringify(next),
    url: window.location.href
  }))

  window.dispatchEvent(new StorageEvent('storage', {
    key: 'receipts_last_update',
    newValue: updateTime,
    url: window.location.href
  }))

  window.dispatchEvent(new CustomEvent('receipts-updated', {
    detail: {
      action: 'create',
      data: sanitized,
      timestamp: updateTime
    }
  }))

  console.log('✅ Create event dispatched!')

  return [201, sanitized]
})

  console.log('✅ Axios Mock Setup Complete (affiliationId-ready + backward compatible + daily summary endpoints + robust amount)')
  return mock
}
