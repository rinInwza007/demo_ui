
import type { Receipt, ReceiptItem } from '@/types/recipt';

const LS_KEY = 'fakeApi.receipts';

function defaultSeed(): Receipt[] {
  return [
{
  "createdAt": "2025-11-20T09:15:42.000Z",
  "updatedAt": "2025-11-20T09:15:42.000Z",
  "fullName": "ปวีณา ประเสริฐ",
  "phone": "0812345678",
  "fundName": "กองทุนทั่วไป",
  "mainAffiliationName": "คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ",
  "subAffiliationName": "ศูนย์ฝึกอบรมวิชาชีพและบริการนานาชาติด้านเกษตรและอาหาร",
  "projectCode": "SCI-2025-002",
  "moneyTypeNote": "Debtor",
  "sendmoney": "รายได้",
  "netTotalAmount": 8200,
  "receiptList": [
    {
      "itemName": "ค่าบริการทางการแพทย์ (สปสช)",
      "note": "ใช้ในงานทดลอง Quantum Lab",
      "fee": 50,
      "subtotal": 8250,
      "amount": 8200,
      "keyword": [],
      "paymentDetails": [
        {
          "moneyType": "debtor",
          "amount": 8250,
          "referenceNo": "INV-8891",
          "checkNumber": null,
          "accountName": null,
          "accountNumber": null,
          "bankName": null
        }
      ]
    }
  ]
},
{
  "createdAt": "2025-10-05T14:22:10.000Z",
  "updatedAt": "2025-10-05T14:22:10.000Z",
  "fullName": "จตุพล สิงห์คำ",
  "phone": "0869988776",
  "fundName": "กองทุนพิเศษ",
  "mainAffiliationName": "คณะทันตแพทยศาสตร์",
  "subAffiliationName": "โรงพยาบาลทันตกรรมมหาวิทยาลัยพะเยา",
  "projectCode": "ENG-ME-778",
  "moneyTypeNote": "Waybill",
  "sendmoney": "รายได้",
  "netTotalAmount": 4500,
  "receiptList": [
    {
      "itemName": "ค่าบริการทางการแพทย์ (ประกันสังคม)",
      "note": "รอบไตรมาสสุดท้าย",
      "fee": 0,
      "subtotal": 4500,
      "amount": 4500,
      "keyword": [],
      "paymentDetails": [
        {
          "moneyType": "transfer",
          "amount": 4500,
          "referenceNo": "TR-992233",
          "checkNumber": null,
          "accountName": "คณะวิศวกรรมศาสตร์",
          "accountNumber": "222-9-99001-1",
          "bankName": "ธนาคารกรุงเทพ"
        }
      ]
    }
  ]
}
,
{
  "createdAt": "2025-09-18T07:55:30.000Z",
  "updatedAt": "2025-09-18T07:55:30.000Z",
  "fullName": "ทิพย์สุดา ธรรมโชติ",
  "phone": "0924455661",
  "fundName": "กองทุนทั่วไป",
  "mainAffiliationName": "คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ",
  "subAffiliationName": "ศูนย์ศึกษาเศรษฐกิจพอเพียงและความอยู่รอดของมนุษยชาติ",
  "projectCode": "STD-AC-112",
  "moneyTypeNote": "Debtor",
  "sendmoney": "เงินโครงการ",
  "netTotalAmount": 980,
  "receiptList": [
    {
      "itemName": "ค่าบริการทางการแพทย์ (ประกันสังคม)",
      "note": "ค่ายพัฒนาทักษะภาคฤดูร้อน",
      "fee": 20,
      "subtotal": 1000,
      "amount": 980,
      "keyword": [],
      "paymentDetails": [
        {
          "moneyType": "debtor",
          "amount": 1000,
          "referenceNo": "BK-881122",
          "checkNumber": null,
          "accountName": "กองกิจการนิสิต",
          "accountNumber": "100-2-55882-0",
          "bankName": "ธนาคารไทยพาณิชย์"
        }
      ]
    }
  ]
}

  ];
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
    // ✅ แปลง string กลับเป็น Date
    const receipts = Array.isArray(data) 
      ? data.map(r => ({
          ...r,
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
        }))
      : defaultSeed();
    return receipts;
  } catch {
    return defaultSeed();
  }
}

export function saveReceipts(list: Receipt[]) {
  // ✅ แปลง Date เป็น string ก่อน save
  const serialized = list.map(r => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
  }));
  localStorage.setItem(LS_KEY, JSON.stringify(serialized));
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
    moneyType: (r.moneyType ?? r.sendmoney ?? '').trim(),
    isLocked: r.isLocked ?? false,
    sendmoney: (r.sendmoney ?? '').trim(),
    projectCode: (r.projectCode ?? '').trim(),
    moneyTypeNote: (r.moneyTypeNote ?? '').trim(), // ✅ เพิ่ม
    netTotalAmount: Number.isFinite(r.netTotalAmount) ? r.netTotalAmount : 0,
// ✅ ตรวจสอบและแปลงเป็น Date object
    createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt || Date.now()),
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt : new Date(r.updatedAt || Date.now()),
    receiptList: Array.isArray(r.receiptList) ? r.receiptList.map(sanitizeItem) : [],
  };
}

