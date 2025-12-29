import type { Receipt, ReceiptItem } from '@/types/recipt';

const LS_KEY = 'fakeApi.receipts';

function defaultSeed(): Receipt[] {
  return [
    {
      "id": "1734567890123-abc45",
      "delNumber": "WB-001",
      "createdAt": "2025-10-05T14:22:10.000Z",
      "updatedAt": "2025-10-05T14:22:10.000Z",
      "fullName": "จตุพล สิงห์คำ",
      "phone": "0869988776",
      "fundName": "กองทุนพิเศษ",
      "mainAffiliationName": "คณะทันตแพทยศาสตร์",
      "subAffiliationName1": "โรงพยาบาลทันตกรรมมหาวิทยาลัยพะเยา",
      "subAffiliationName2": "",
      "projectCode": "ENG-ME-778",
      "moneyTypeNote": "Waybill",
      "sendmoney": "รายได้",
      "moneyType": "รายได้",
      "netTotalAmount": 4500,
      "totalPaymentAmount": 4500,

      "paymentMethods": {
        "krungthai": {
          "checked": true,
          "amount": 3000
        },
        "cash": {
          "checked": true,
          "amount": 1500
        }
      },

      "receiptList": [
        {
          "itemName": "ค่าบริการทางการแพทย์ (ประกันสังคม)",
          "note": "รอบไตรมาสสุดท้าย",
          "referenceNo": "INV-001",
          "amount": 4500,
          "subtotal": 4500
        }
      ]
    }
  ];
}

// ✅ เพิ่มฟังก์ชัน sanitizeItem
export function sanitizeItem(it: any): ReceiptItem {
  return {
    itemName: (it.itemName ?? '').trim(),
    note: (it.note ?? '').trim(),
    referenceNo: (it.referenceNo ?? '').trim(),
    subtotal: Number.isFinite(it.subtotal) ? it.subtotal : 0,
    amount: Number.isFinite(it.amount) ? it.amount : 0,
    type: it.type || 'income', // ✅ เพิ่มบรรทัดนี้
  }
}

// ✅ แก้ไข: เพิ่ม subAffiliationName1 และ subAffiliationName2
export function sanitizeReceipt(r: any) {
  return {
    id: r.id ?? null,
    delNumber: r.delNumber ?? null,

    fullName: String(r.fullName || '').trim(),
    phone: String(r.phone || '').trim(),

    // ✅ เพิ่มส่วนนี้
    mainAffiliationName: String(r.mainAffiliationName || '').trim(),
    subAffiliationName1: String(r.subAffiliationName1 || '').trim(),
    subAffiliationName2: String(r.subAffiliationName2 || '').trim(),

    fundName: String(r.fundName || '').trim(),
    projectCode: String(r.projectCode || '').trim(),

    moneyType: String(r.moneyType || '').trim(),
    sendmoney: String(r.sendmoney || '').trim(),
    moneyTypeNote: String(r.moneyTypeNote || '').trim(),

    netTotalAmount: Number(r.netTotalAmount) || 0,
    totalPaymentAmount: Number(r.totalPaymentAmount) || 0,

    createdAt: r.createdAt ?? new Date().toISOString(),
    updatedAt: r.updatedAt ?? new Date().toISOString(),

    receiptList: Array.isArray(r.receiptList)
      ? r.receiptList.map(sanitizeItem)
      : [],

    paymentMethods: r.paymentMethods ?? {},

    isLocked: r.isLocked ?? false,
  }
}

export function loadReceipts(): Receipt[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      const seed = defaultSeed();
      saveReceipts(seed);
      return seed;
    }
    const data = JSON.parse(raw) as Receipt[];
    const receipts = Array.isArray(data)
      ? data.map(r => ({
          ...r,
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
          // ✅ เพิ่มส่วนนี้
          mainAffiliationName: r.mainAffiliationName || '',
          subAffiliationName1: r.subAffiliationName1 || '',
          subAffiliationName2: r.subAffiliationName2 || '',
          receiptList: r.receiptList || [],
          paymentMethods: r.paymentMethods || {},
        }))
      : defaultSeed();
    return receipts;
  } catch {
    return defaultSeed();
  }
}

export function saveReceipts(list: Receipt[]) {
  const serialized = list.map(r => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
    // ✅ เพิ่มส่วนนี้
    mainAffiliationName: r.mainAffiliationName || '',
    subAffiliationName1: r.subAffiliationName1 || '',
    subAffiliationName2: r.subAffiliationName2 || '',
    receiptList: r.receiptList || [],
    paymentMethods: r.paymentMethods || {},
    totalPaymentAmount: r.totalPaymentAmount || 0,
  }));
  localStorage.setItem(LS_KEY, JSON.stringify(serialized));
}
