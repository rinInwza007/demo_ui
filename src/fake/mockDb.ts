
import type { Receipt, ReceiptItem } from '../types/recipt';

const LS_KEY = 'fakeApi.receipts';

function defaultSeed(): Receipt[] {
  return [
    {
      fullName: 'สมชาย ใจดี',
      phone: '0812345678',
      affiliationId: 'AFF-001',
      affiliationName: 'กองแผนงาน',
      fundId: 'FUND-01',
      fundName: 'งบกลาง',
      projectCode: 'PRJ-0001',
      receiptList: [
        {
          itemName: 'ค่าเอกสาร',
          referenceNo: 'ref-001',
          amount: 1200,
          moneyType: 'cash',
          moneySource: 'internal',
          keyword: [],
        },
        {
          itemName: 'ค่าธรรมเนียมธนาคาร',
          referenceNo: 'ref-002',
          amount: 50,
          moneyType: 'bank',
          moneySource: 'external',
          keyword: [],
        },
      ],
    },
    {
      fullName: 'สุพชาย จันทร์เทอด',
      phone: '0899999999',
      affiliationId: 'AFF-002',
      affiliationName: 'ศูนย์ไซเบอร์',
      fundId: 'FUND-02',
      fundName: 'โครงการ A',
      projectCode: 'PRJ-0002',
      receiptList: [],
    },
  ];
}

export function loadReceipts(): Receipt[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultSeed();
    const data = JSON.parse(raw) as Receipt[];
    return Array.isArray(data) ? data : defaultSeed();
  } catch {
    return defaultSeed();
  }
}

export function saveReceipts(list: Receipt[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

// sanitize helpers
export function sanitizeItem(it: ReceiptItem): ReceiptItem {
  return {
    itemName: (it.itemName ?? '').trim(),
    note: (it.note ?? '').trim(),
    fee: Number.isFinite(it.fee) ? it.fee : 0,
    keyword: Array.isArray(it.keyword) ? it.keyword : [],
    subtotal: Number.isFinite(it.subtotal) ? it.subtotal : 0,
    netAmount: Number.isFinite(it.netAmount) ? it.netAmount : 0,
    paymentDetails: Array.isArray(it.paymentDetails) 
      ? it.paymentDetails.map(p => ({
          type: (p.type ?? '').trim(),
          amount: Number.isFinite(p.amount) ? p.amount : 0,
          referenceNo: (p.referenceNo ?? '').trim(), // 👈 ไม่สุ่ม ใช้ค่าที่ส่งมา
          checkNumber: p.checkNumber?.trim() || null,
          accountNumber: p.accountNumber?.trim() || null,
          accountName: p.accountName?.trim() || null,
        }))
      : [],
  };
}

export function sanitizeReceipt(r: Receipt): Receipt {
  return {
    fullName: (r.fullName ?? '').trim(),
    phone: (r.phone ?? '').trim(),
    affiliationId: (r.affiliationId ?? '').trim(),
    affiliationName: (r.affiliationName ?? '').trim(),
    fundId: (r.fundId ?? '').trim(),
    mainAffiliationName: (r.mainAffiliationName ?? '').trim(),
    subAffiliationName: (r.subAffiliationName ?? '').trim(),
    fundName: (r.fundName ?? '').trim(),
    moneyType: (r.moneyType ?? '').trim(),
    projectCode: (r.projectCode ?? '').trim(),
    netTotalAmount: Number.isFinite(r.netTotalAmount) ? r.netTotalAmount : 0,
    receiptList: Array.isArray(r.receiptList) ? r.receiptList.map(sanitizeItem) : [],
  };
}