import type { Receipt, ReceiptItem } from '@/types/recipt';

const LS_KEY = 'fakeApi.receipts';

function defaultSeed(): Receipt[] {
  return [
    // ========== Debtor Example (โครงสร้างใหม่) ==========
    {
      "createdAt": "2025-11-20T09:15:42.000Z",
      "updatedAt": "2025-11-20T09:15:42.000Z",
      "fullName": "ปวีณา ประเสริฐ",
      "phone": "0812345678",
      "fundName": "กองทุนทั่วไป",
      "mainAffiliationName": "คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ",
      "subAffiliationName1": "ศูนย์ฝึกอบรมวิชาชีพและบริการนานาชาติด้านเกษตรและอาหาร",
      "subAffiliationName2": "",
      "projectCode": "SCI-2025-002",
      "moneyTypeNote": "Debtor",
      "sendmoney": "รายได้",
      "moneyType": "รายได้",
      "netTotalAmount": 8200,
      "totalDebtorAmount": 8250,
      "totalDepositAmount": 8250,
      "totalFee": 50,

      // ========== รายการลูกหนี้ (แยกออกมา) ==========
      "debtorList": [
        {
          "itemName": "ค่าบริการทางการแพทย์ (สปสช)",
          "note": "ใช้ในงานทดลอง Quantum Lab",
          "amount": 8250
        }
      ],

      // ========== รายการเงินฝาก (แยกออกมา) ==========
      "depositList": [
        {
          "itemName": "ค่าบริการทางการแพทย์ (สปสช)",
          "note": "ใช้ในงานทดลอง Quantum Lab",
          "subtotal": 8250,
          "fee": 50,
          "netAmount": 8200,
          "paymentDetails": [
            {
              "moneyType": "transfer",
              "amount": 8250,
              "referenceNo": "INV-8891",
              "accountName": "คณะเกษตรศาสตร์",
              "accountNumber": "123-4-56789-0",
              "bankName": "ธนาคารกรุงไทย"
            }
          ]
        }
      ]
    },

    // ========== Waybill Example (โครงสร้างเดิม - ยังคงรองรับ) ==========
    {
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

      // ========== ใช้ receiptList แบบเดิม (Waybill) ==========
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

    // ========== Debtor Example 2 (โครงสร้างใหม่) ==========
    {
      "createdAt": "2025-09-18T07:55:30.000Z",
      "updatedAt": "2025-09-18T07:55:30.000Z",
      "fullName": "ทิพย์สุดา ธรรมโชติ",
      "phone": "0924455661",
      "fundName": "กองทุนทั่วไป",
      "mainAffiliationName": "คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ",
      "subAffiliationName1": "ศูนย์ศึกษาเศรษฐกิจพอเพียงและความอยู่รอดของมนุษยชาติ",
      "subAffiliationName2": "",
      "projectCode": "STD-AC-112",
      "moneyTypeNote": "Debtor",
      "sendmoney": "เงินโครงการ",
      "moneyType": "เงินโครงการ",
      "netTotalAmount": 980,
      "totalDebtorAmount": 1000,
      "totalDepositAmount": 1000,
      "totalFee": 20,

      "debtorList": [
        {
          "itemName": "ค่าบริการทางการแพทย์ (ประกันสังคม)",
          "note": "ค่ายพัฒนาทักษะภาคฤดูร้อน",
          "amount": 1000
        }
      ],

      "depositList": [
        {
          "itemName": "ค่าบริการทางการแพทย์ (ประกันสังคม)",
          "note": "ค่ายพัฒนาทักษะภาคฤดูร้อน",
          "subtotal": 1000,
          "fee": 20,
          "netAmount": 980,
          "paymentDetails": [
            {
              "moneyType": "transfer",
              "amount": 1000,
              "referenceNo": "BK-881122",
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
          
          // ========== รองรับทั้งสองโครงสร้าง ==========
          debtorList: r.debtorList || [],
          depositList: r.depositList || [],
          receiptList: r.receiptList || [],
          
          totalDebtorAmount: r.totalDebtorAmount || 0,
          totalDepositAmount: r.totalDepositAmount || 0,
          totalFee: r.totalFee || 0,
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
    subAffiliationName2: r.subAffiliationName2 || '',
    
    // ========== บันทึกทั้งสองโครงสร้าง ==========
    debtorList: r.debtorList || [],
    depositList: r.depositList || [],
    receiptList: r.receiptList || [],
    
    totalDebtorAmount: r.totalDebtorAmount || 0,
    totalDepositAmount: r.totalDepositAmount || 0,
    totalFee: r.totalFee || 0,
  }));
  localStorage.setItem(LS_KEY, JSON.stringify(serialized));
}

export function sanitizeItem(it: ReceiptItem): ReceiptItem {
  return {
    itemName: (it.itemName ?? '').trim(),
    note: (it.note ?? '').trim(),
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
    subAffiliationName2: (r.subAffiliationName2 ?? '').trim(),
    fundName: (r.fundName ?? '').trim(),
    moneyType: (r.moneyType ?? r.sendmoney ?? '').trim(),
    isLocked: r.isLocked ?? false,
    sendmoney: (r.sendmoney ?? '').trim(),
    projectCode: (r.projectCode ?? '').trim(),
    moneyTypeNote: (r.moneyTypeNote ?? '').trim(),
    netTotalAmount: Number.isFinite(r.netTotalAmount) ? r.netTotalAmount : 0,
    
    // ========== รองรับทั้งสองโครงสร้าง ==========
    totalDebtorAmount: Number.isFinite(r.totalDebtorAmount) ? r.totalDebtorAmount : 0,
    totalDepositAmount: Number.isFinite(r.totalDepositAmount) ? r.totalDepositAmount : 0,
    totalFee: Number.isFinite(r.totalFee) ? r.totalFee : 0,
    
    createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt || Date.now()),
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt : new Date(r.updatedAt || Date.now()),
    
    // ========== รองรับทั้งสองโครงสร้าง ==========
    debtorList: Array.isArray(r.debtorList) ? r.debtorList : [],
    depositList: Array.isArray(r.depositList) ? r.depositList : [],
    receiptList: Array.isArray(r.receiptList) ? r.receiptList.map(sanitizeItem) : [],
  };
}