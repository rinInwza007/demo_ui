// src/fake/mockAxios.ts
import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { loadReceipts, saveReceipts, sanitizeReceipt } from './mockDb'
import type { Receipt } from '@/types/recipt'
import { useSummaryStore } from '@/stores/summary'
import { bankAccountOptions } from '@/components/data/BankOptions'
import type { BankAccount } from '@/types/BankTypes'
import { getAllOptions, getItemById, getItemByName } from '@/components/data/ItemNameOption'
import type { Item } from '@/types/recipt'
import { defaultAffiliation } from '@/components/data/Affiliation'
import type { Affiliation } from '@/types/affiliation'
/**
 * ==========================================================
 * Fake API via Axios Mock Adapter
 * - ใช้ waybillNumber เป็น primary identifier
 * - บันทึกไปทั้ง storage หลัก + summary storage
 * - Summary storage สำหรับล้างลูกหนี้โดยไม่กระทบหลัก
 * - รองรับ ItemName CRUD operations
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
  waybillNumber?: string
}

// ============================================
// 🏦 Bank Accounts Storage
// ============================================
const BANK_STORAGE_KEY = 'fakeApi.bankAccounts'

const loadBankAccounts = (): BankAccount[] => {
  try {
    const raw = localStorage.getItem(BANK_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
    const initial = [...bankAccountOptions]
    localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(initial))
    console.log('🏦 Initialized bank accounts from BankOptions.ts:', initial.length)
    return initial
  } catch {
    return [...bankAccountOptions]
  }
}

const saveBankAccounts = (accounts: BankAccount[]) => {
  localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(accounts))
}

const generateBankAccountId = (): string => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `ACC_CUSTOM_${timestamp}_${random}`
}

// ============================================
// Receipt Utils (เดิม)
// ============================================
const toNum = (v: any) => {
  try {
    const n = parseFloat(
      String(v ?? '0')
        .replace(/,/g, '')
        .trim()
    )
    return isNaN(n) ? 0 : n
  } catch {
    return 0
  }
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

const findReceiptByWaybillNumber = (db: any[], searchId: string) => {
  const decoded = decodeURIComponent(searchId).trim()

  return db.find(
    (r: any) =>
      String(r.waybillNumber || '').trim() === decoded ||
      String(r.id || '').trim() === decoded
  )
}

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

const saveToBothStorages = (receipt: any) => {
  console.log('🔄 Starting dual storage save...')

  const mainDb = loadReceipts()
  const existingIndex = mainDb.findIndex(r => r.waybillNumber === receipt.waybillNumber)

  if (existingIndex >= 0) {
    mainDb[existingIndex] = receipt
  } else {
    mainDb.unshift(receipt)
  }

  saveReceipts(mainDb)
  console.log('✅ [1/2] Main Storage saved:', receipt.waybillNumber)
  console.log('   📦 Main Storage count:', mainDb.length)

  const summaryDb = loadSummaryStorage()
  const summaryIndex = summaryDb.findIndex((r: any) => r.waybillNumber === receipt.waybillNumber)

  if (summaryIndex >= 0) {
    summaryDb[summaryIndex] = receipt
  } else {
    summaryDb.unshift(receipt)
  }

  saveSummaryStorage(summaryDb)
  console.log('✅ [2/2] Summary Storage saved:', receipt.waybillNumber)
  console.log('   📦 Summary Storage count:', summaryDb.length)

  if (mainDb.length === summaryDb.length) {
    console.log('✅ ✨ BOTH STORAGES SYNCED! ✨')
  } else {
    console.error('❌ WARNING: Storages NOT synced!')
    console.error('   Main:', mainDb.length, '| Summary:', summaryDb.length)
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

const deleteFromBothStorages = (waybillNumber: string) => {
  console.log('🗑️ Starting dual storage delete...')
  console.log('   Deleting:', waybillNumber)

  const mainDb = loadReceipts()
  const beforeMain = mainDb.length
  const filteredMain = mainDb.filter(r => r.waybillNumber !== waybillNumber)
  saveReceipts(filteredMain)
  console.log('✅ [1/2] Main Storage deleted')
  console.log('   📦 Before:', beforeMain, '→ After:', filteredMain.length)

  const summaryDb = loadSummaryStorage()
  const beforeSummary = summaryDb.length
  const filteredSummary = summaryDb.filter((r: any) => r.waybillNumber !== waybillNumber)
  saveSummaryStorage(filteredSummary)
  console.log('✅ [2/2] Summary Storage deleted')
  console.log('   📦 Before:', beforeSummary, '→ After:', filteredSummary.length)

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
    approvalStatus: r?.approvalStatus ?? 'pending',
    isLocked: r?.isLocked ?? false,
    moneyType: r?.moneyType || r?.sendmoney || 'transfer',
    waybillNumber: r?.waybillNumber || r?.id || '',
    id: r?.waybillNumber || r?.id || '',
    createdAt,
    updatedAt,
  }
}

const serializeReceipt = (r: any) => ({
  ...r,
  createdAt: r?.createdAt instanceof Date ? r.createdAt.toISOString() : r?.createdAt,
  updatedAt: r?.updatedAt instanceof Date ? r.updatedAt.toISOString() : r?.updatedAt,
})

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
    waybillNumber: r.waybillNumber || r.id || '',
  }
}

const dispatchUpdateEvents = (payload: {
  action: 'create' | 'update' | 'delete' | 'bulk-update'
  data?: any
  id?: string
  waybillNumber?: string
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

const Number = (v: unknown) => Number(v ?? 0)

function isDebtorNew(r: any) {
  return r.moneyTypeNote === 'DEBTOR_NEW'
}

function isClearDebtor(r: any) {
  return r.moneyTypeNote === 'CLEAR_DEBTOR'
}

/** -------------------------
 * Main Setup
 * ------------------------- */
export function setupAxiosMock() {
  const mock = new AxiosMockAdapter(axios, { delayResponse: 300 })

// ============================================
// 🏢 Affiliation Endpoints
// ============================================

mock.onGet(/\/affiliations\/check-duplicate(?:\?.*)?$/).reply((config) => {
  console.log('🏢 [Mock] GET /affiliations/check-duplicate')

  const url = new URL(config.url!, window.location.origin)
  const id = url.searchParams.get('id')
  const excludeId = url.searchParams.get('excludeId')

  if (!id) {
    return [400, {
      success: false,
      message: 'Missing required parameter: id'
    }]
  }

  const affiliation = defaultAffiliation.find(a => a.id === id)
  let exists = !!affiliation

  if (exists && excludeId && affiliation?.id === excludeId) {
    exists = false
  }

  console.log(`✅ [Mock] Duplicate check: id="${id}", exists=${exists}`)

  return [200, { exists }]
})

// GET /affiliations/children/:parentId - ดึงหน่วยงานลูก
mock.onGet(/\/affiliations\/children\/[^/]+$/).reply((config) => {
  const parentId = config.url?.split('/').pop()
  console.log(`🏢 [Mock] GET /affiliations/children/${parentId}`)

  const children = defaultAffiliation.filter(a => a.parentId === parentId)

  console.log(`✅ [Mock] Found ${children.length} children`)

  return [200, {
    success: true,
    data: children,
    total: children.length
  }]
})

// GET /affiliations/:id - ดึงรายการตาม ID
mock.onGet(/\/affiliations\/[^/]+$/).reply((config) => {
  const id = config.url?.split('/').pop()
  console.log(`🏢 [Mock] GET /affiliations/${id}`)

  const affiliation = defaultAffiliation.find(a => a.id === id)

  if (!affiliation) {
    console.log(`❌ [Mock] Affiliation not found: ${id}`)
    return [404, {
      success: false,
      message: 'Affiliation not found'
    }]
  }

  console.log(`✅ [Mock] Found affiliation: ${affiliation.name}`)
  return [200, {
    success: true,
    data: affiliation
  }]
})

// GET /affiliations - ดึงรายการทั้งหมด พร้อม filters
mock.onGet(/\/affiliations(?:\?.*)?$/).reply((config) => {
  console.log('🏢 [Mock] GET /affiliations')

  const url = new URL(config.url!, window.location.origin)
  const type = url.searchParams.get('type')
  const parentId = url.searchParams.get('parentId')
  const search = url.searchParams.get('search')

  let affiliations = [...defaultAffiliation]

  // Filter by type
  if (type) {
    affiliations = affiliations.filter(a => a.type === type)
    console.log(`   🔍 Filtered by type="${type}": ${affiliations.length} items`)
  }

  // Filter by parentId
  if (parentId !== null) {
    if (parentId === '' || parentId === 'null') {
      // ดึงเฉพาะคณะ (root level)
      affiliations = affiliations.filter(a => !a.parentId)
      console.log(`   🔍 Filtered root affiliations: ${affiliations.length} items`)
    } else {
      affiliations = affiliations.filter(a => a.parentId === parentId)
      console.log(`   🔍 Filtered by parentId="${parentId}": ${affiliations.length} items`)
    }
  }

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase()
    affiliations = affiliations.filter(a =>
      a.name.toLowerCase().includes(searchLower) ||
      a.id.toLowerCase().includes(searchLower)
    )
    console.log(`   🔍 Filtered by search="${search}": ${affiliations.length} items`)
  }

  console.log(`✅ [Mock] Returning ${affiliations.length} affiliations`)

  return [200, {
    success: true,
    data: affiliations,
    total: affiliations.length
  }]
})

// POST /affiliations - สร้างรายการใหม่ (Mock only - ไม่บันทึกจริง)
mock.onPost('/affiliations').reply((config) => {
  console.log('🏢 [Mock] POST /affiliations')

  try {
    const payload = JSON.parse(config.data)

    // Validation
    if (!payload.id || !payload.name || !payload.type) {
      return [400, {
        success: false,
        message: 'Missing required fields: id, name, type'
      }]
    }

    // Check duplicate ID
    const duplicate = defaultAffiliation.find(a => a.id === payload.id)
    if (duplicate) {
      return [409, {
        success: false,
        message: 'Affiliation ID already exists'
      }]
    }

    // Mock: Cannot actually create in static data
    console.log('⚠️ [Mock] Create operation simulated (data not persisted)')

    const newAffiliation: Affiliation = {
      id: payload.id,
      name: payload.name,
      type: payload.type,
      parentId: payload.parentId || null
    }

    return [201, {
      success: true,
      data: newAffiliation,
      message: 'Affiliation created successfully (mock - not persisted)'
    }]
  } catch (error) {
    console.error('❌ [Mock] Error creating affiliation:', error)
    return [500, {
      success: false,
      message: 'Internal server error'
    }]
  }
})

// PUT /affiliations/:id - อัปเดตรายการ (Mock only - ไม่บันทึกจริง)
mock.onPut(/\/affiliations\/[^/]+$/).reply((config) => {
  const id = config.url?.split('/').pop()
  console.log(`🏢 [Mock] PUT /affiliations/${id}`)

  try {
    const affiliation = defaultAffiliation.find(a => a.id === id)

    if (!affiliation) {
      return [404, {
        success: false,
        message: 'Affiliation not found'
      }]
    }

    const updateData = JSON.parse(config.data)

    // Mock: Cannot actually update static data
    console.log('⚠️ [Mock] Update operation simulated (data not persisted)')

    const updatedAffiliation: Affiliation = {
      ...affiliation,
      ...updateData,
      id // Keep original ID
    }

    return [200, {
      success: true,
      data: updatedAffiliation,
      message: 'Affiliation updated successfully (mock - not persisted)'
    }]
  } catch (error) {
    console.error('❌ [Mock] Error updating affiliation:', error)
    return [500, {
      success: false,
      message: 'Internal server error'
    }]
  }
})

// DELETE /affiliations/:id - ลบรายการ (Mock only - ไม่บันทึกจริง)
mock.onDelete(/\/affiliations\/[^/]+$/).reply((config) => {
  const id = config.url?.split('/').pop()
  console.log(`🏢 [Mock] DELETE /affiliations/${id}`)

  const affiliation = defaultAffiliation.find(a => a.id === id)

  if (!affiliation) {
    return [404, {
      success: false,
      message: 'Affiliation not found'
    }]
  }

  // Check if has children
  const hasChildren = defaultAffiliation.some(a => a.parentId === id)
  if (hasChildren) {
    return [400, {
      success: false,
      message: 'Cannot delete affiliation with children'
    }]
  }

  // Mock: Cannot actually delete from static data
  console.log('⚠️ [Mock] Delete operation simulated (data not persisted)')

  return [200, {
    success: true,
    data: affiliation,
    message: 'Affiliation deleted successfully (mock - not persisted)'
  }]
})







  // ============================================
  // 🏦 Bank Accounts Endpoints
  // ============================================

  mock.onGet('/bank-accounts').reply(() => {
    console.log('🏦 [Mock] GET /bank-accounts')
    const accounts = loadBankAccounts()
    console.log('📋 Total accounts:', accounts.length)

    return [200, {
      success: true,
      data: accounts,
      total: accounts.length
    }]
  })

  mock.onGet(/\/bank-accounts\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop()
    console.log(`🏦 [Mock] GET /bank-accounts/${id}`)

    const accounts = loadBankAccounts()
    const account = accounts.find(acc => acc.id === id)

    if (!account) {
      return [404, {
        success: false,
        message: 'Bank account not found'
      }]
    }

    return [200, {
      success: true,
      data: account
    }]
  })

  mock.onPost('/bank-accounts').reply((config) => {
    console.log('🏦 [Mock] POST /bank-accounts')

    try {
      const newAccount = JSON.parse(config.data) as BankAccount

      if (!newAccount.accountNumber || !newAccount.bankName || !newAccount.accountName) {
        return [400, {
          success: false,
          message: 'Missing required fields: accountNumber, bankName, accountName'
        }]
      }

      const accounts = loadBankAccounts()

      const isDuplicate = accounts.some(
        acc => acc.accountNumber === newAccount.accountNumber
      )

      if (isDuplicate) {
        return [409, {
          success: false,
          message: 'Account number already exists'
        }]
      }

      const accountWithId: BankAccount = {
        ...newAccount,
        id: newAccount.id || generateBankAccountId(),
        isActive: newAccount.isActive !== false
      }

      accounts.push(accountWithId)
      saveBankAccounts(accounts)

      console.log('✅ [Mock] Created bank account:', accountWithId)

      return [201, {
        success: true,
        data: accountWithId,
        message: 'Bank account created successfully'
      }]
    } catch (error) {
      console.error('❌ [Mock] Error creating bank account:', error)
      return [500, {
        success: false,
        message: 'Internal server error'
      }]
    }
  })

  mock.onPut(/\/bank-accounts\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop()
    console.log(`🏦 [Mock] PUT /bank-accounts/${id}`)

    try {
      const accounts = loadBankAccounts()
      const index = accounts.findIndex(acc => acc.id === id)

      if (index === -1) {
        return [404, {
          success: false,
          message: 'Bank account not found'
        }]
      }

      const updatedData = JSON.parse(config.data)

      if (updatedData.accountNumber && updatedData.accountNumber !== accounts[index].accountNumber) {
        const isDuplicate = accounts.some(
          acc => acc.accountNumber === updatedData.accountNumber && acc.id !== id
        )

        if (isDuplicate) {
          return [409, {
            success: false,
            message: 'Account number already exists'
          }]
        }
      }

      accounts[index] = {
        ...accounts[index],
        ...updatedData,
        id
      }

      saveBankAccounts(accounts)

      console.log('✏️ [Mock] Updated bank account:', accounts[index])

      return [200, {
        success: true,
        data: accounts[index],
        message: 'Bank account updated successfully'
      }]
    } catch (error) {
      console.error('❌ [Mock] Error updating bank account:', error)
      return [500, {
        success: false,
        message: 'Internal server error'
      }]
    }
  })

  mock.onDelete(/\/bank-accounts\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop()
    console.log(`🏦 [Mock] DELETE /bank-accounts/${id}`)

    const accounts = loadBankAccounts()
    const index = accounts.findIndex(acc => acc.id === id)

    if (index === -1) {
      return [404, {
        success: false,
        message: 'Bank account not found'
      }]
    }

    const deleted = accounts.splice(index, 1)[0]
    saveBankAccounts(accounts)

    console.log('🗑️ [Mock] Deleted bank account:', deleted)

    return [200, {
      success: true,
      data: deleted,
      message: 'Bank account deleted successfully'
    }]
  })

  // ============================================
  // 📋 ItemName Endpoints
  // ============================================

  // GET /item-names/check-duplicate - ต้องมาก่อน GET /item-names/:id
  mock.onGet(/\/item-names\/check-duplicate(?:\?.*)?$/).reply((config) => {
    console.log('📋 [Mock] GET /item-names/check-duplicate')

    const url = new URL(config.url!, window.location.origin)
    const name = url.searchParams.get('name')
    const excludeId = url.searchParams.get('excludeId')

    if (!name) {
      return [400, {
        success: false,
        message: 'Missing required parameter: name'
      }]
    }

    const item = getItemByName(name)
    let exists = !!item

    if (exists && excludeId && item?.id === parseInt(excludeId)) {
      exists = false
    }

    console.log(`✅ [Mock] Duplicate check: name="${name}", exists=${exists}`)

    return [200, { exists }]
  })

  // GET /item-names/:id - ดึงรายการตาม ID
  mock.onGet(/\/item-names\/\d+$/).reply((config) => {
    const id = parseInt(config.url?.split('/').pop() || '0')
    console.log(`📋 [Mock] GET /item-names/${id}`)

    const item = getItemById(id)

    if (!item) {
      console.log(`❌ [Mock] Item not found: ${id}`)
      return [404, {
        success: false,
        message: 'Item not found'
      }]
    }

    console.log(`✅ [Mock] Found item: ${item.name}`)
    return [200, {
      success: true,
      data: item
    }]
  })

  // GET /item-names - ดึงรายการทั้งหมด พร้อม filters
  mock.onGet(/\/item-names(?:\?.*)?$/).reply((config) => {
    console.log('📋 [Mock] GET /item-names')

    const url = new URL(config.url!, window.location.origin)
    const type = url.searchParams.get('type')
    const affiliationId = url.searchParams.get('affiliationId')
    const search = url.searchParams.get('search')

    let items = getAllOptions()

    if (type && type !== 'all') {
      items = items.filter(item => item.type === type)
      console.log(`   🔍 Filtered by type="${type}": ${items.length} items`)
    }

    if (affiliationId) {
      items = items.filter(item => item.affiliationId === affiliationId)
      console.log(`   🔍 Filtered by affiliationId="${affiliationId}": ${items.length} items`)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      items = items.filter(item => item.name.toLowerCase().includes(searchLower))
      console.log(`   🔍 Filtered by search="${search}": ${items.length} items`)
    }

    console.log(`✅ [Mock] Returning ${items.length} items`)

    return [200, {
      success: true,
      data: items,
      total: items.length
    }]
  })

  // POST /item-names - สร้างรายการใหม่
  mock.onPost('/item-names').reply((config) => {
    console.log('📋 [Mock] POST /item-names')

    try {
      const payload = JSON.parse(config.data)

      if (!payload.name || !payload.type) {
        return [400, {
          success: false,
          message: 'Missing required fields: name, type'
        }]
      }

      const duplicate = getItemByName(payload.name)
      if (duplicate) {
        return [409, {
          success: false,
          message: 'Item name already exists'
        }]
      }

      console.log('⚠️ [Mock] Create operation simulated (data not persisted)')

      const newItem: Item = {
        id: Math.max(...getAllOptions().map(i => i.id)) + 1,
        name: payload.name,
        type: payload.type,
        affiliationId: payload.affiliationId || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      return [201, {
        success: true,
        data: newItem,
        message: 'Item created successfully (mock - not persisted)'
      }]
    } catch (error) {
      console.error('❌ [Mock] Error creating item:', error)
      return [500, {
        success: false,
        message: 'Internal server error'
      }]
    }
  })

  // PUT /item-names/:id - อัปเดตรายการ
  mock.onPut(/\/item-names\/\d+$/).reply((config) => {
    const id = parseInt(config.url?.split('/').pop() || '0')
    console.log(`📋 [Mock] PUT /item-names/${id}`)

    try {
      const item = getItemById(id)

      if (!item) {
        return [404, {
          success: false,
          message: 'Item not found'
        }]
      }

      const updateData = JSON.parse(config.data)

      if (updateData.name && updateData.name !== item.name) {
        const duplicate = getItemByName(updateData.name)
        if (duplicate && duplicate.id !== id) {
          return [409, {
            success: false,
            message: 'Item name already exists'
          }]
        }
      }

      console.log('⚠️ [Mock] Update operation simulated (data not persisted)')

      const updatedItem: Item = {
        ...item,
        ...updateData,
        id,
        updatedAt: new Date()
      }

      return [200, {
        success: true,
        data: updatedItem,
        message: 'Item updated successfully (mock - not persisted)'
      }]
    } catch (error) {
      console.error('❌ [Mock] Error updating item:', error)
      return [500, {
        success: false,
        message: 'Internal server error'
      }]
    }
  })

  // DELETE /item-names/:id - ลบรายการ
  mock.onDelete(/\/item-names\/\d+$/).reply((config) => {
    const id = parseInt(config.url?.split('/').pop() || '0')
    console.log(`📋 [Mock] DELETE /item-names/${id}`)

    const item = getItemById(id)

    if (!item) {
      return [404, {
        success: false,
        message: 'Item not found'
      }]
    }

    console.log('⚠️ [Mock] Delete operation simulated (data not persisted)')

    return [200, {
      success: true,
      data: item,
      message: 'Item deleted successfully (mock - not persisted)'
    }]
  })

  // ============================================
  // 📝 Receipt Endpoints
  // ============================================

  mock.onGet(/\/checkwaybillNumber\/([^/]+)$/).reply((config) => {
    const waybillNumber = config.url?.match(/\/checkwaybillNumber\/([^/]+)$/)?.[1]
    if (!waybillNumber) return [400, { exists: false }]

    const decoded = decodeURIComponent(waybillNumber)
    const db = loadReceipts().map(ensureReceiptFields)
    const exists = db.some(r => r.waybillNumber === decoded)

    return [200, { exists, waybillNumber: decoded }]
  })

  mock.onGet(/\/getReceipt\/([^?]+)$/).reply((config) => {
    const url = config.url || ''
    const match = url.match(/\/getReceipt\/([^?]+)$/)
    const waybillNumber = match?.[1]

    if (!waybillNumber) {
      console.error('❌ getReceipt - No waybillNumber provided')
      return [400, { message: 'waybillNumber required' }]
    }

    const decoded = decodeURIComponent(waybillNumber)
    const db = loadReceipts().map(ensureReceiptFields)
    const found = findReceiptByWaybillNumber(db, decoded)

    if (!found) {
      console.warn('❌ getReceipt - Not found:', decoded)
      return [
        404,
        {
          message: 'Receipt not found',
          requestedWaybillNumber: decoded,
          availableWaybillNumbers: db.map(r => r.waybillNumber).filter(Boolean),
        },
      ]
    }

    console.log('✅ getReceipt - Found:', found.waybillNumber)
    return [200, serializeReceipt(normalizeBoth(found))]
  })

  mock.onGet(/\/getReceipt(?:\?.*)?$/).reply((config) => {
    const db = loadReceipts().map(ensureReceiptFields)

    const url = new URL(config.url!, window.location.origin)
    const fullName = url.searchParams.get('fullName')
    const waybillNumber = url.searchParams.get('waybillNumber')
    const affiliationId = url.searchParams.get('affiliationId')
    const q = url.searchParams.get('q')

    let list: any[] = db

    if (fullName) {
      list = list.filter((r) =>
        (r.fullName || '').toLowerCase().includes(fullName.toLowerCase())
      )
    }

    if (waybillNumber) {
      list = list.filter((r) => r.waybillNumber === waybillNumber)
    }

    if (affiliationId) {
      list = list.filter((r) => String(r.affiliationId) === String(affiliationId))
    }

    if (q) {
      const s = q.toLowerCase()
      list = list.filter(
        (r) =>
          (r.fullName || '').toLowerCase().includes(s) ||
          (r.waybillNumber || '').toLowerCase().includes(s) ||
          (r.affiliationName || '').toLowerCase().includes(s) ||
          (r.mainAffiliationName || '').toLowerCase().includes(s)
      )
    }

    console.log(`✅ getReceipt query - Found ${list.length} receipts`)
    return [200, list.map((r) => serializeReceipt(normalizeBoth(r)))]
  })

  mock.onPost('/saveReceipt').reply((config) => {
    console.log('💾 POST /saveReceipt called')

    const incoming = ensureReceiptFields(JSON.parse(config.data || '{}'))

    if (!incoming.waybillNumber) {
      console.error('❌ No waybillNumber')
      return [400, { message: 'waybillNumber is required' }]
    }

    const db = loadReceipts().map(ensureReceiptFields)

    const existing = findReceiptByWaybillNumber(db, incoming.waybillNumber)
    if (existing) {
      console.error('❌ Duplicate waybillNumber:', incoming.waybillNumber)
      return [409, { message: 'Duplicate waybillNumber', waybillNumber: incoming.waybillNumber }]
    }

    const normalized = normalizeBoth(incoming)
    const now = new Date()
    normalized.createdAt = normalized.createdAt ?? now
    normalized.updatedAt = now
    normalized.id = normalized.waybillNumber

    const sanitized = sanitizeReceipt(normalized)

    saveToBothStorages(sanitized)

    const next = [sanitized, ...db]

    dispatchUpdateEvents({
      action: 'create',
      data: sanitized,
      waybillNumber: sanitized.waybillNumber,
      list: next,
    })

    console.log('✅ Receipt saved to both storages:', sanitized.waybillNumber)
    return [201, serializeReceipt(sanitized)]
  })

  mock.onPost('/updateReceipt').reply((config) => {
    console.log('🔧 POST /updateReceipt called')

    const { receipt } = JSON.parse(config.data || '{}')
    if (!receipt) {
      console.error('❌ No receipt in request body')
      return [400, { message: 'receipt object is required' }]
    }

    const waybillNumber = receipt.waybillNumber || receipt.id
    if (!waybillNumber) {
      console.error('❌ No waybillNumber in receipt')
      return [400, { message: 'receipt.waybillNumber is required' }]
    }

    const db = loadReceipts().map(ensureReceiptFields)
    const found = findReceiptByWaybillNumber(db, waybillNumber)

    if (!found) {
      console.error('❌ Receipt not found:', waybillNumber)
      return [404, { message: 'Receipt not found', waybillNumber }]
    }

    const idx = db.indexOf(found)
    const normalized = normalizeBoth(ensureReceiptFields(receipt))

    console.log('🔍 Before merge:', {
      foundStatus: db[idx].approvalStatus,
      incomingStatus: receipt.approvalStatus,
      normalizedStatus: normalized.approvalStatus
    })

    const updated = sanitizeReceipt({
      ...db[idx],
      ...normalized,
      waybillNumber: db[idx].waybillNumber,
      id: db[idx].waybillNumber,
      createdAt: db[idx].createdAt,
      updatedAt: new Date(),
    })

    console.log('📝 Updating receipt:', {
      waybillNumber: updated.waybillNumber,
      oldStatus: db[idx].approvalStatus,
      newStatus: updated.approvalStatus,
    })

    db[idx] = updated

    saveToBothStorages(updated)

    dispatchUpdateEvents({
      action: 'update',
      data: updated,
      waybillNumber: updated.waybillNumber,
      list: db,
    })

    console.log('✅ Updated in both storages:', updated.waybillNumber, '| Status:', updated.approvalStatus)
    return [200, { success: true, data: serializeReceipt(updated) }]
  })

  mock.onPut(/\/updateReceipt\/(.+)$/).reply(async (config) => {
    console.log('🔧 PUT /updateReceipt/:waybillNumber called')

    const matches = config.url?.match(/\/updateReceipt\/(.+)$/)
    const oldwaybillNumber = matches ? decodeURIComponent(matches[1]) : ''

    if (!oldwaybillNumber) {
      console.error('❌ No waybillNumber in URL')
      return [400, { message: 'waybillNumber is required' }]
    }

    const incoming = ensureReceiptFields(JSON.parse(config.data || '{}'))

    const db = loadReceipts().map(ensureReceiptFields)
    const found = findReceiptByWaybillNumber(db, oldwaybillNumber)

    if (!found) {
      console.error('❌ Receipt not found:', oldwaybillNumber)
      return [404, { message: 'Receipt not found', waybillNumber: oldwaybillNumber }]
    }

    const newWaybillNumber = incoming.waybillNumber
    if (newWaybillNumber && newWaybillNumber !== oldwaybillNumber) {
      const duplicate = db.find(r => r.waybillNumber === newWaybillNumber && r.waybillNumber !== oldwaybillNumber)
      if (duplicate) {
        return [409, { message: 'เลขนำส่งใหม่มีอยู่ในระบบแล้ว', waybillNumber: newWaybillNumber }]
      }
    }

    const idx = db.indexOf(found)
    const normalized = normalizeBoth(incoming)

    const updated = sanitizeReceipt({
      ...db[idx],
      ...normalized,
      waybillNumber: newWaybillNumber || db[idx].waybillNumber,
      id: newWaybillNumber || db[idx].waybillNumber,
      createdAt: db[idx].createdAt,
      updatedAt: new Date(),
    })

    if (newWaybillNumber && newWaybillNumber !== oldwaybillNumber) {
      deleteFromBothStorages(oldwaybillNumber)
    }

    saveToBothStorages(updated)

    db[idx] = updated

    dispatchUpdateEvents({
      action: 'update',
      data: updated,
      waybillNumber: updated.waybillNumber,
      list: db,
    })

    console.log('✅ Updated in both storages:', updated.waybillNumber)
    return [200, serializeReceipt(updated)]
  })

  mock.onDelete(/\/deleteReceipt\/([^/]+)$/).reply((config) => {
    console.log('🗑️ DELETE /deleteReceipt/:id called')

    const id = config.url?.match(/\/deleteReceipt\/([^/]+)$/)?.[1]
    if (!id) {
      console.error('❌ No ID provided')
      return [400, { success: false, message: 'id required' }]
    }

    const decoded = decodeURIComponent(id)
    const db = loadReceipts().map(ensureReceiptFields)
    const found = findReceiptByWaybillNumber(db, decoded)

    if (found) {
      deleteFromBothStorages(found.waybillNumber)
    }

    const next = db.filter((r: any) => {
      const match = findReceiptByWaybillNumber([r], decoded)
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
          (r.waybillNumber || '').toLowerCase().includes(s)
      )
    }

    console.log(`✅ getSummary - Found ${list.length} receipts from summary storage`)
    return [200, list.map((r: any) => serializeReceipt(normalizeBoth(r)))]
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
          (it.waybillNumber || '').toLowerCase().includes(search)
      )
    }

    items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    console.log(`✅ summary/events - Found ${items.length} events`)
    return [200, { items }]
  })

  //cleardebtor
  mock.onGet('/debtors').reply(() => {
  const receipts = loadReceipts()

  const map = new Map<string, any>()

  for (const r of receipts) {
    if (!isDebtorNew(r) && !isClearDebtor(r)) continue

    // key ลูกหนี้ (ใช้ fullName ตาม type ที่คุณมี)
    const key = r.fullName
    if (!key) continue

    if (!map.has(key)) {
      map.set(key, {
        debtorKey: key,
        fullName: r.fullName,
        affiliationId: r.affiliationId,
        affiliationName: r.affiliationName,
        totalDebt: 0,
        totalCleared: 0,
      })
    }

    const row = map.get(key)

    if (isDebtorNew(r)) {
      row.totalDebt += toNum(r.netTotalAmount)
    }

    if (isClearDebtor(r)) {
      row.totalCleared += toNum(r.netTotalAmount)
    }
  }

  const items = Array.from(map.values())
    .map((r) => ({
      ...r,
      balance: r.totalDebt - r.totalCleared,
    }))
    .filter((r) => r.balance > 0)
    .sort((a, b) => b.balance - a.balance)

  return [
    200,
    {
      items,
      total: items.length,
    },
  ]
})

mock.onGet('/debtors/history').reply(() => {
  const receipts = loadReceipts()

  const items = receipts
    .filter(isClearDebtor)
    .map((r: any) => ({
      createdAt: r.createdAt,
      waybillNumber: r.waybillNumber,
      fullName: r.fullName,
      affiliationId: r.affiliationId,
      affiliationName: r.affiliationName,
      amount: toNum(r.netTotalAmount),
      fundName: r.fundName,
    }))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )

  return [
    200,
    {
      items,
      total: items.length,
    },
  ]
})



mock.onGet('/debtors/outstanding').reply(() => {
  const receipts = loadReceipts()

  const debtorMap = new Map<string, number>()
  const affiliationMap = new Map<string, number>()

  for (const r of receipts) {
    if (!isDebtorNew(r) && !isClearDebtor(r)) continue

    const key = r.fullName
    if (!key) continue

    const signedAmount = isDebtorNew(r)
      ? toNum(r.netTotalAmount)
      : -toNum(r.netTotalAmount)

    debtorMap.set(
      key,
      (debtorMap.get(key) ?? 0) + signedAmount
    )

    if (r.affiliationId) {
      affiliationMap.set(
        r.affiliationId,
        (affiliationMap.get(r.affiliationId) ?? 0) + signedAmount
      )
    }
  }

  const balances = Array.from(debtorMap.values()).filter(
    (v) => v > 0
  )

  return [
    200,
    {
      totalDebtors: balances.length,
      totalOutstandingAmount: balances.reduce((a, b) => a + b, 0),
      byAffiliation: Array.from(affiliationMap.entries())
        .filter(([, amount]) => amount > 0)
        .map(([affiliationId, amount]) => ({
          affiliationId,
          amount,
        })),
    },
  ]
})


mock.onPost('/debtors/clear').reply((config) => {
  try {
    const body = JSON.parse(config.data || '{}')
    const { targetWaybill, amount, note } = body

    if (!targetWaybill || !amount || amount <= 0) {
      return [400, { message: 'invalid payload' }]
    }

    const receipts = loadReceipts()

    // หา receipt ลูกหนี้ต้นทาง
    const debtorReceipt = receipts.find(
      (r: any) => r.waybillNumber === targetWaybill
    )

    if (!debtorReceipt) {
      return [404, { message: 'debtor receipt not found' }]
    }

    // ยอดหนี้คงเหลือ
    const balance =
      Number(debtorReceipt.netTotalAmount ?? 0) -
      Number(debtorReceipt.totalPaymentAmount ?? 0)

    if (amount > balance) {
      return [
        400,
        {
          message: 'amount exceeds balance',
          balance,
        },
      ]
    }

    // สร้าง receipt clear debtor ใหม่
    const clearReceipt = {
      id: `CLR-${Date.now()}`,
      waybillNumber: `CLR-${Date.now()}`,

      fullName: debtorReceipt.fullName,
      phone: debtorReceipt.phone,

      fundName: debtorReceipt.fundName,
      projectCode: debtorReceipt.projectCode,

      affiliationId: debtorReceipt.affiliationId,
      affiliationName: debtorReceipt.affiliationName,

      moneyType: 'cash',
      moneyTypeNote: 'CLEAR_DEBTOR',

      netTotalAmount: amount,
      totalPaymentAmount: amount,

      receiptList: [
        {
          itemName: note ?? 'ล้างลูกหนี้',
          amount,
          type: 'income',
        },
      ],

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    receipts.push(clearReceipt)

    // update ยอดที่จ่ายแล้ว
    debtorReceipt.totalPaymentAmount =
      Number(debtorReceipt.totalPaymentAmount ?? 0) + amount
    debtorReceipt.updatedAt = new Date().toISOString()

    saveReceipts(receipts)

    return [
      200,
      {
        success: true,
        clearedAmount: amount,
        remainingBalance: balance - amount,
        clearWaybill: clearReceipt.waybillNumber,
      },
    ]
  } catch (e) {
    console.error('[mock] clear debtor error', e)
    return [500, { message: 'internal error' }]
  }
})




  console.log('✅ Axios Mock Setup Complete')
  console.log('   🏦 Bank Accounts: Loaded from BankOptions.ts')
  console.log('   📋 ItemNames: Loaded from ItemNameOption.ts')
  console.log('   📝 Receipts: Using waybillNumber + Dual Storage')
  return mock
}
