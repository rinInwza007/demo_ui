import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { loadReceipts, saveReceipts, sanitizeReceipt } from './mockDb'

// ❗ปรับ path type ให้ตรงโปรเจกต์คุณ
// ถ้าไฟล์จริงคือ '@/types/recipt' ก็ใช้ตามเดิม
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
      affiliationId: String(affId),

      // ชื่อสังกัดหลัก/สังกัด
      mainAffiliationName: r.mainAffiliationName || r.affiliationName || 'มหาวิทยาลัยพะเยา',
      affiliationName: r.affiliationName || r.mainAffiliationName || 'มหาวิทยาลัยพะเยา',

      // ✅ ตาม type ใหม่ของคุณ
      subAffiliationName1: r.subAffiliationName1 ?? r.subAffiliationName ?? '',
      subAffiliationName2: r.subAffiliationName2 ?? r.subAffiliationName2 ?? '',

      // default
      moneyTypeNote: r.moneyTypeNote ?? 'Waybill',
      isLocked: r.isLocked ?? false,

      // moneyType fallback
      moneyType: r.moneyType || r.sendmoney || 'transfer',

      // date
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
          paymentDetails: paymentDetails,
                 type: item.type || 'income', // ✅ เพิ่มบรรทัดนี้
        referenceNo: item.referenceNo || '', // ✅ เพิ่มถ้ามี
        };
      });
=======
          paymentDetails,
        }
      })
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
=======
          paymentDetails,
        }
      })
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
=======
          paymentDetails,
        }
      })
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677

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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
                  type: debtor.type || deposit.type || 'income', // ✅ เพิ่มบรรทัดนี้
        referenceNo: debtor.referenceNo || deposit.referenceNo || '', // ✅ เพิ่มถ้ามี
        });
=======
        })
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
=======
        })
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
=======
        })
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
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
  // API Endpoints
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

  // GET /getReceipt/:projectCode
  mock.onGet(/\/getReceipt\/([^?]+)$/).reply((config) => {
    const url = config.url || ''
    const match = url.match(/\/getReceipt\/([^?]+)$/)
    const projectCode = match?.[1]

    if (!projectCode) return [400, { message: 'projectCode is required' }]

    const decodedCode = decodeURIComponent(projectCode)

    const db = loadReceipts().map(ensureReceiptFields)
    const found = db.find((r: any) => r.projectCode === decodedCode)
    if (!found) {
      return [
        404,
        {
          message: 'Receipt not found',
          requestedCode: decodedCode,
          availableCodes: db.map((r: any) => r.projectCode),
        },
      ]
    }

    const normalized = normalizeBoth(found)

    // ส่ง date เป็น ISO string เพื่อให้ฝั่งหน้า new Date(...) ได้
    return [
      200,
      {
        ...normalized,
        createdAt:
          normalized.createdAt instanceof Date ? normalized.createdAt.toISOString() : normalized.createdAt,
        updatedAt:
          normalized.updatedAt instanceof Date ? normalized.updatedAt.toISOString() : normalized.updatedAt,
      },
    ]
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
      list = list.filter((r) =>
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

  // POST /saveReceipt
  mock.onPost('/saveReceipt').reply((config) => {
    const incoming = ensureReceiptFields(JSON.parse(config.data || '{}'))

    if (!incoming.projectCode) {
      return [400, { message: 'projectCode is required' }]
    }

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    console.log('📥 Save Receipt - Incoming:', incoming);
  if (incoming.receiptList) {
    console.log('📋 receiptList types:', 
      incoming.receiptList.map((item: any) => ({
        itemName: item.itemName,
        type: item.type
      }))
    );
  }
=======
    const db = loadReceipts().map(ensureReceiptFields)
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
=======
    const db = loadReceipts().map(ensureReceiptFields)
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
=======
    const db = loadReceipts().map(ensureReceiptFields)
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677

    // duplicate
    }

    // ✅ Normalize ข้อมูลให้มีทั้ง 2 แบบ
    const normalized = normalizeToNewFormat(incoming);
    const withOldFormat = normalizeToOldFormat(normalized);
    const sanitized = sanitizeReceipt(withOldFormat);

    const next = [sanitized, ...db]
    saveReceipts(next)

    return [201, sanitized]
  })

  // PUT /updateReceipt/:projectCode
  mock.onPut(/\/updateReceipt\/(.+)$/).reply((config) => {
    const matches = config.url?.match(/\/updateReceipt\/(.+)$/)
    const projectCode = matches ? decodeURIComponent(matches[1]) : ''
    if (!projectCode) return [400, { message: 'projectCode is required' }]

    const incoming = ensureReceiptFields(JSON.parse(config.data || '{}'))

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    if (!projectCode) return [400, { message: 'projectCode is required' }];
  if (incoming.receiptList) {
    console.log('📋 Updating with types:', 
      incoming.receiptList.map((item: any) => ({
        itemName: item.itemName,
        type: item.type
      }))
    );
  }
    const db = loadReceipts();
    const idx = db.findIndex(r => r.projectCode === projectCode);
=======
    const db = loadReceipts().map(ensureReceiptFields)
    const idx = db.findIndex((r: any) => r.projectCode === projectCode)
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
=======
    const db = loadReceipts().map(ensureReceiptFields)
    const idx = db.findIndex((r: any) => r.projectCode === projectCode)
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677
=======
    const db = loadReceipts().map(ensureReceiptFields)
    const idx = db.findIndex((r: any) => r.projectCode === projectCode)
>>>>>>> 67698c03cfb220dfa751d31e5600b5e8a9194677

    if (idx === -1) {
      return [404, { message: 'Receipt not found' }]
    }

    const normalized = normalizeBoth(incoming)

    const updated = sanitizeReceipt({
      ...db[idx],
      ...normalized,
      projectCode, // keep
      createdAt: db[idx].createdAt, // keep
      updatedAt: new Date(),
    })

    db[idx] = updated
    saveReceipts(db)

    return [200, updated]
  })

  // DELETE /deleteReceipt/:id
  mock.onDelete(/\/deleteReceipt\/([^/]+)$/).reply((config) => {
    const id = config.url?.match(/\/deleteReceipt\/([^/]+)$/)?.[1]
    if (!id) return [400, { success: false, message: 'id required' }]

    const db = loadReceipts().map(ensureReceiptFields)
    const before = db.length
    const next = db.filter((r: any) => r.projectCode !== id && r.id !== id)
    saveReceipts(next)

    return [200, { success: next.length !== before }]
  })

  console.log('✅ Axios Mock Setup Complete (affiliationId-ready + backward compatible)')
  return mock
}
