
import type { Receipt, ReceiptItem } from '@/types/recipt';

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
      receiptList: [
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

  ];
}

export function loadReceipts(): Receipt[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      const seed = defaultSeed();
      saveReceipts(seed); // ✅ บันทึก seed data ลง localStorage
      return seed;
    }
    const data = JSON.parse(raw) as Receipt[];
    return Array.isArray(data) ? data : defaultSeed();
  } catch {
    return defaultSeed();
  }
}

export function saveReceipts(list: Receipt[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

// ✅ sanitize helpers
export function sanitizeItem(it: ReceiptItem): ReceiptItem {
  return {
    itemName: (it.itemName ?? '').trim(),
    note: (it.note ?? '').trim(),
    fee: Number.isFinite(it.fee) ? it.fee : 0,
    subtotal: Number.isFinite(it.subtotal) ? it.subtotal : 0,
    amount: Number.isFinite(it.amount) ? it.amount : 0, // ✅ เพิ่ม amount
    paymentDetails: Array.isArray(it.paymentDetails)
      ? it.paymentDetails.map(p => ({
          moneyType: (p.moneyType ?? '').trim(),
          amount: Number.isFinite(p.amount) ? p.amount : 0,
          referenceNo: (p.referenceNo != null ? String(p.referenceNo) : '').trim(),
          checkNumber: p.checkNumber != null ? String(p.checkNumber).trim() : null,
          accountNumber: p.accountNumber != null ? String(p.accountNumber).trim() : null,
          accountName: p.accountName?.trim() || null,
          bankName: p.bankName != null ? String(p.bankName).trim() : null,
        }))
      : [],
  };
}

export function sanitizeReceipt(r: Receipt): Receipt {
  return {
    fullName: (r.fullName ?? '').trim(),
    phone: (r.phone ?? '').trim(),
    mainAffiliationName: (r.mainAffiliationName ?? '').trim(), // ✅ แก้ไข
    subAffiliationName: (r.subAffiliationName ?? '').trim(),
    fundName: (r.fundName ?? '').trim(),
    projectCode: (r.projectCode ?? '').trim(),
    moneyTypeNote: (r.moneyTypeNote ?? '').trim(), // ✅ เพิ่ม
    netTotalAmount: Number.isFinite(r.netTotalAmount) ? r.netTotalAmount : 0,
    receiptList: Array.isArray(r.receiptList) ? r.receiptList.map(sanitizeItem) : [],
  };
}
