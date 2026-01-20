import type { Receipt, ReceiptItem } from '@/types/recipt';

const LS_KEY = 'fakeApi.receipts';

function defaultSeed(): Receipt[] {
  return [
    {
      id: "WB-001",
      waybillNumber: "WB-001",
      createdAt: "2025-10-05T14:22:10.000Z",
      updatedAt: "2025-10-05T14:22:10.000Z",
      fullName: "จตุพล สิงห์คำ",
      phone: "0869988776",
      fundName: "กองทุนพิเศษ",
      projectCode: "DEN-001",
      moneyTypeNote: "Waybill",
      sendmoney: "รายได้",
      moneyType: "รายได้",
      netTotalAmount: 4500,
      totalPaymentAmount: 4500,
      affiliationId: "DEN",
      affiliationName: "คณะทันตแพทยศาสตร์",
      
      // ✅ เพิ่มส่วนนี้
      mainAffiliationId: "DEN",
      mainAffiliationName: "คณะทันตแพทยศาสตร์",
      subAffiliationId1: "",
      subAffiliationName1: "",
      subAffiliationId2: "",
      subAffiliationName2: "",

      paymentMethods: {
        cash: {
          checked: true,
          amount: 1500
        }
      },

      bankTransfers: [
        {
          id: 1,
          accountData: {
            accountNumber: "671-2-90667-9",
            bankName: "ธนาคารกรุงไทย",
            accountName: "โรงพยาบาลมหาวิทยาลัยพะเยา"
          },
          amount: 3000
        }
      ],

      receiptList: [
        {
          itemName: "ลูกหนี้ค่ารักษาทันตกรรม",
          note: "รอบไตรมาสสุดท้าย",
          referenceNo: "INV-001",
          amount: 4500,
          subtotal: 4500,
          type: "income"
        }
      ],
      isLocked: false
    }
  ];
}

export function sanitizeItem(it: any): ReceiptItem {
  return {
    itemName: (it.itemName ?? '').trim(),
    itemId: it.itemId ?? undefined,
    note: (it.note ?? '').trim(),
    referenceNo: (it.referenceNo ?? '').trim(),
    subtotal: Number.isFinite(it.subtotal) ? it.subtotal : 0,
    amount: Number.isFinite(it.amount) ? it.amount : 0,
    type: it.type || 'income',
  }
}

export function sanitizeReceipt(r: any): Receipt {
  return {
    id: r.waybillNumber || r.id,
    waybillNumber: r.waybillNumber || r.id,
    fullName: String(r.fullName || '').trim(),
    phone: String(r.phone || '').trim(),
    fundName: String(r.fundName || '').trim(),
    projectCode: r.projectCode ? String(r.projectCode).trim() : null,
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
    
    affiliationId: String(r.affiliationId || '').trim(),
    affiliationName: String(r.affiliationName || '').trim(),
    
    // ✅ เพิ่มส่วนนี้
    mainAffiliationId: String(r.mainAffiliationId || '').trim(),
    mainAffiliationName: String(r.mainAffiliationName || '').trim(),
    subAffiliationId1: String(r.subAffiliationId1 || '').trim(),
    subAffiliationName1: String(r.subAffiliationName1 || '').trim(),
    subAffiliationId2: String(r.subAffiliationId2 || '').trim(),
    subAffiliationName2: String(r.subAffiliationName2 || '').trim(),
    
    paymentMethods: r.paymentMethods ? {
      cash: r.paymentMethods.cash ? {
        checked: r.paymentMethods.cash.checked || false,
        amount: r.paymentMethods.cash.amount || 0,
      } : undefined,
      check: r.paymentMethods.check ? {
        checked: r.paymentMethods.check.checked || false,
        amount: r.paymentMethods.check.amount || '',
        bankName: r.paymentMethods.check.bankName || '',
        checkNumber: r.paymentMethods.check.checkNumber || '',
        NumIncheck: r.paymentMethods.check.NumIncheck || ''
      } : undefined,
    } : {},

    bankTransfers: Array.isArray(r.bankTransfers)
      ? r.bankTransfers.map((bank: any) => ({
          id: bank.id || Date.now(),
          accountData: {
            accountNumber: String(bank.accountData?.accountNumber || '').trim(),
            bankName: String(bank.accountData?.bankName || '').trim(),
            accountName: String(bank.accountData?.accountName || '').trim(),
          },
          amount: Number(bank.amount) || 0,
        }))
      : [],

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
    const data = JSON.parse(raw);
    const receipts = Array.isArray(data)
      ? data.map(sanitizeReceipt)
      : defaultSeed();
    return receipts;
  } catch {
    return defaultSeed();
  }
}

export function saveReceipts(list: Receipt[]) {
  const serialized = list.map(r => ({
    ...r,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date(r.createdAt).toISOString(),
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : new Date(r.updatedAt).toISOString(),
  }));
  localStorage.setItem(LS_KEY, JSON.stringify(serialized));
}