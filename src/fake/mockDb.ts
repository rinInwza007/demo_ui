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
      "subAffiliationName1": "ศูนย์ฝึกอบรมวิชาชีพและบริการนานาชาติด้านเกษตรและอาหาร",
      "subAffiliationName2": "", // ✅ เพิ่ม field นี้
      "projectCode": "SCI-2025-002",
      "moneyTypeNote": "Debtor",
      "sendmoney": "รายได้",
      "moneyType": "รายได้",
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
      "subAffiliationName1": "โรงพยาบาลทันตกรรมมหาวิทยาลัยพะเยา",
      "subAffiliationName2": "", // ✅ เพิ่ม field นี้
      "projectCode": "ENG-ME-778",
      "moneyTypeNote": "Waybill",
      "sendmoney": "รายได้",
      "moneyType": "รายได้",
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
    },
    {
      "createdAt": "2025-09-18T07:55:30.000Z",
      "updatedAt": "2025-09-18T07:55:30.000Z",
      "fullName": "ทิพย์สุดา ธรรมโชติ",
      "phone": "0924455661",
      "fundName": "กองทุนทั่วไป",
      "mainAffiliationName": "คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ",
      "subAffiliationName1": "ศูนย์ศึกษาเศรษฐกิจพอเพียงและความอยู่รอดของมนุษยชาติ",
      "subAffiliationName2": "", // ✅ เพิ่ม field นี้
      "projectCode": "STD-AC-112",
      "moneyTypeNote": "Debtor",
      "sendmoney": "เงินโครงการ",
      "moneyType": "เงินโครงการ",
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
    const receipts = Array.isArray(data) 
      ? data.map(r => ({
          ...r,
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
          subAffiliationName2: r.subAffiliationName2 || '',
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
    // ✅ รับประกันว่า subAffiliationName2 ถูก save
    subAffiliationName2: r.subAffiliationName2 || '',
  }));
  localStorage.setItem(LS_KEY, JSON.stringify(serialized));
}

export function sanitizeItem(it: ReceiptItem): ReceiptItem {
  return {
    itemName: (it.itemName ?? '').trim(),
    note: (it.note ?? '').trim(),

    // ✅ เพิ่มตรงนี้
    debtorAmount: Number.isFinite(it.debtorAmount) ? it.debtorAmount : 0,
    depositSubtotal: Number.isFinite(it.depositSubtotal) ? it.depositSubtotal : 0,
    depositNetAmount: Number.isFinite(it.depositNetAmount) ? it.depositNetAmount : 0,

    fee: Number.isFinite(it.fee) ? it.fee : 0,
    subtotal: Number.isFinite(it.subtotal) ? it.subtotal : 0,
    amount: Number.isFinite(it.amount) ? it.amount : 0,

    paymentDetails: Array.isArray(it.paymentDetails)
      ? it.paymentDetails.map(p => ({
          moneyType: (p.moneyType ?? '').trim(),
          amount: Number.isFinite(p.amount) ? p.amount : 0,
          referenceNo: p.referenceNo ? String(p.referenceNo).trim() : '',
          checkNumber: p.checkNumber ?? null,
          accountNumber: p.accountNumber ?? null,
          accountName: p.accountName ?? null,
          bankName: p.bankName ?? null,
        }))
      : [],
  }
}

export function sanitizeReceipt(r: Receipt): Receipt {
  return {
    fullName: (r.fullName ?? '').trim(),
    phone: (r.phone ?? '').trim(),
    mainAffiliationName: (r.mainAffiliationName ?? '').trim(),
    subAffiliationName1: (r.subAffiliationName1 ?? '').trim(),
    subAffiliationName2: (r.subAffiliationName2 ?? '').trim(), // ✅ เพิ่ม sanitize
    fundName: (r.fundName ?? '').trim(),
    moneyType: (r.moneyType ?? r.sendmoney ?? '').trim(),
    isLocked: r.isLocked ?? false,
    sendmoney: (r.sendmoney ?? '').trim(),
    projectCode: (r.projectCode ?? '').trim(),
    moneyTypeNote: (r.moneyTypeNote ?? '').trim(),
    netTotalAmount: Number.isFinite(r.netTotalAmount) ? r.netTotalAmount : 0,
    createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt || Date.now()),
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt : new Date(r.updatedAt || Date.now()),
    receiptList: Array.isArray(r.receiptList) ? r.receiptList.map(sanitizeItem) : [],
  };
}      