import type { Receipt, ReceiptItem } from '@/types/recipt';

const LS_KEY = 'fakeApi.receipts';

function defaultSeed(): Receipt[] {
  return [
    {
      id: "WB-001",
      waybillNumber: "WB-001",

      createdAt: "2025-10-05T14:22:10.000Z",
      updatedAt: "2025-10-05T14:22:10.000Z",

      // ✅ ย้ายข้อมูลเข้า profile
      profile: {
        fullName: "จตุพล สิงห์คำ",
        phone: "0869988776",
        fundName: "กองทุนพิเศษ",
        projectCode: "DEN-001",
        sendmoney: "รายได้",
        affiliationId: "DEN",
        affiliationName: "คณะทันตแพทยศาสตร์",
        mainAffiliationId: "DEN",
        mainAffiliationName: "คณะทันตแพทยศาสตร์",
        subAffiliationId1: "",
        subAffiliationName1: "",
        subAffiliationId2: "",
        subAffiliationName2: "",
      },

      netTotalAmount: 4500,

      approvalStatus: "pending",

      receiptList: [
        {
          itemName: "ลูกหนี้ค่ารักษาทันตกรรม",
          note: "รอบไตรมาสสุดท้าย",
          referenceNo: "INV-001",
          amount: 4500,
          type: "income",
          isCancelled: false,
          paymentTypes: {
            cash: true,
            transfer: false,
            check: false
          },
          cashDetails: {
            amount: 4500
          },
          checkDetails: {
            amount: "",
            bankName: "",
            checkNumber: "",
            numInCheck: ""
          },
          transferDetails: {
            amount: "",
            accountData: {
              accountNumber: "",
              bankName: "",
              accountName: ""
            }
          }
        }
      ],

      isLocked: false
    }
  ]
}

export function sanitizeItem(it: any): ReceiptItem {
  return {
    itemName: (it.itemName ?? '').trim(),
    itemId: it.itemId ?? undefined,
    note: (it.note ?? '').trim(),
    referenceNo: (it.referenceNo ?? '').trim(),
    amount: Number.isFinite(it.amount) ? it.amount : 0,
    type: it.type || 'income',
    isCancelled: it.isCancelled || false,
    
    paymentTypes: it.paymentTypes ? {
      cash: it.paymentTypes.cash || false,
      check: it.paymentTypes.check || false,
      transfer: it.paymentTypes.transfer || false
    } : {
      cash: false,
      check: false,
      transfer: false
    },
    
    cashDetails: it.cashDetails ? {
      amount: it.cashDetails.amount || ''
    } : {
      amount: ''
    },
    
    checkDetails: it.checkDetails ? {
      amount: it.checkDetails.amount || '',
      bankName: String(it.checkDetails.bankName || '').trim(),
      checkNumber: String(it.checkDetails.checkNumber || '').trim(),
      numInCheck: String(it.checkDetails.numInCheck || '').trim()
    } : {
      amount: '',
      bankName: '',
      checkNumber: '',
      numInCheck: ''
    },
    
    transferDetails: it.transferDetails ? {
      amount: it.transferDetails.amount || '',
      accountData: {
        accountNumber: String(it.transferDetails.accountData?.accountNumber || '').trim(),
        bankName: String(it.transferDetails.accountData?.bankName || '').trim(),
        accountName: String(it.transferDetails.accountData?.accountName || '').trim()
      }
    } : {
      amount: '',
      accountData: {
        accountNumber: '',
        bankName: '',
        accountName: ''
      }
    }
  }
}

export function sanitizeReceipt(r: any): Receipt {
  return {
    id: r.waybillNumber || r.id,
    waybillNumber: r.waybillNumber || r.id,

    // ✅ สร้าง profile object
    profile: {
      fullName: String(r.profile?.fullName || r.fullName || '').trim(),
      phone: String(r.profile?.phone || r.phone || '').trim(),
      fundName: String(r.profile?.fundName || r.fundName || '').trim(),
      projectCode: r.profile?.projectCode || r.projectCode ? String(r.profile?.projectCode || r.projectCode).trim() : null,
      sendmoney: String(r.profile?.sendmoney || r.sendmoney || '').trim(),
      affiliationId: String(r.profile?.affiliationId || r.affiliationId || '').trim(),
      affiliationName: String(r.profile?.affiliationName || r.affiliationName || '').trim(),
      mainAffiliationId: String(r.profile?.mainAffiliationId || r.mainAffiliationId || '').trim(),
      mainAffiliationName: String(r.profile?.mainAffiliationName || r.mainAffiliationName || '').trim(),
      subAffiliationId1: String(r.profile?.subAffiliationId1 || r.subAffiliationId1 || '').trim(),
      subAffiliationName1: String(r.profile?.subAffiliationName1 || r.subAffiliationName1 || '').trim(),
      subAffiliationId2: String(r.profile?.subAffiliationId2 || r.subAffiliationId2 || '').trim(),
      subAffiliationName2: String(r.profile?.subAffiliationName2 || r.subAffiliationName2 || '').trim(),
    },

    netTotalAmount: Number(r.netTotalAmount) || 0,

    createdAt: r.createdAt ?? new Date().toISOString(),
    updatedAt: r.updatedAt ?? new Date().toISOString(),

    approvalStatus: r.approvalStatus ?? 'pending',

    receiptList: Array.isArray(r.receiptList)
      ? r.receiptList.map(sanitizeItem)
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