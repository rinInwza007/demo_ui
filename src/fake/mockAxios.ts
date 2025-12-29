import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { loadReceipts, saveReceipts, sanitizeReceipt } from './mockDb'
import type { Receipt } from '@/types/recipt'

export function setupAxiosMock() {
  const mock = new AxiosMockAdapter(axios, { delayResponse: 300 })

  // =========================
  // Helper
  // =========================

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
      guessAffIdFromName(mainName)

    const createdAt = r.createdAt ? new Date(r.createdAt) : new Date()
    const updatedAt = r.updatedAt ? new Date(r.updatedAt) : createdAt

    return {
      ...r,
      affiliationId: String(affId),
      mainAffiliationName: r.mainAffiliationName || r.affiliationName || 'มหาวิทยาลัยพะเยา',
      affiliationName: r.affiliationName || r.mainAffiliationName || 'มหาวิทยาลัยพะเยา',
      subAffiliationName1: r.subAffiliationName1 ?? '',
      subAffiliationName2: r.subAffiliationName2 ?? '',
      moneyTypeNote: r.moneyTypeNote ?? 'Waybill',
      isLocked: r.isLocked ?? false,
      moneyType: r.moneyType || r.sendmoney || 'transfer',
      createdAt,
      updatedAt,
    }
  }

  // =========================
  // Normalize
  // =========================

  const normalizeToNewFormat = (receipt: any): any => {
    const r = ensureReceiptFields(receipt)

    if (r.debtorList && r.depositList) return r

    if (Array.isArray(r.receiptList)) {
      const debtorList = r.receiptList.map((item: any) => ({
        itemName: item.itemName || '',
        debtornote: item.note || '',
        amount: Number(item.debtorAmount ?? item.amount ?? 0),
        type: item.type || 'income',
        referenceNo: item.referenceNo || '',
      }))

      const depositList = r.receiptList.map((item: any) => {
        const paymentDetails = Array.isArray(item.paymentDetails) ? item.paymentDetails : []
        const subtotal = paymentDetails.reduce(
          (sum: number, p: any) => sum + (Number(p.amount) || 0),
          0
        )
        const fee = Number(item.fee) || 0

        return {
          itemName: item.itemName || '',
          depositnote: item.note || '',
          subtotal,
          fee,
          netAmount: subtotal - fee,
          paymentDetails,
          type: item.type || 'income',
          referenceNo: item.referenceNo || '',
        }
      })

      return { ...r, debtorList, depositList, receiptList: r.receiptList }
    }

    return { ...r, debtorList: [], depositList: [], receiptList: [] }
  }

  const normalizeToOldFormat = (receipt: any): any => {
    const r = ensureReceiptFields(receipt)

    if (Array.isArray(r.receiptList)) return r

    if (r.debtorList && r.depositList) {
      const len = Math.max(r.debtorList.length, r.depositList.length)
      const receiptList = []

      for (let i = 0; i < len; i++) {
        const d = r.debtorList[i] || {}
        const p = r.depositList[i] || {}

        receiptList.push({
          itemName: d.itemName || p.itemName || '',
          note: d.debtornote || p.depositnote || '',
          amount: Number(p.netAmount) || 0,
          fee: Number(p.fee) || 0,
          paymentDetails: p.paymentDetails || [],
          type: d.type || p.type || 'income',
          referenceNo: d.referenceNo || p.referenceNo || '',
        })
      }

      return { ...r, receiptList }
    }

    return { ...r, receiptList: [] }
  }

  const normalizeBoth = (r: any) => normalizeToOldFormat(normalizeToNewFormat(r))

  // =========================
  // API
  // =========================

  mock.onPost('/saveReceipt').reply((config) => {
    const incoming = ensureReceiptFields(JSON.parse(config.data || '{}'))
    if (!incoming.projectCode) return [400, { message: 'projectCode is required' }]

    const db = loadReceipts().map(ensureReceiptFields)

    const normalized = normalizeBoth(incoming)
    const sanitized = sanitizeReceipt(normalized)

    const next = [sanitized, ...db]
    saveReceipts(next)

    return [201, sanitized]
  })

  console.log('✅ Axios Mock Setup Complete')
  return mock
}
