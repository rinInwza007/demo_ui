import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import { loadReceipts, saveReceipts, sanitizeReceipt } from './mockDb';
import type { Receipt } from '@/types/recipt';

export function setupAxiosMock() {
  const mock = new AxiosMockAdapter(axios, { delayResponse: 300 });

  // ========== Helper Functions ==========
  
  /**
   * ✅ แปลงข้อมูลจากแบบเก่า (receiptList) เป็นแบบใหม่ (debtorList + depositList)
   */
  const normalizeToNewFormat = (receipt: any): any => {
    // ถ้ามี debtorList และ depositList อยู่แล้ว = แบบใหม่
    if (receipt.debtorList && receipt.depositList) {
      console.log('✅ Already new format');
      return receipt;
    }

    // ถ้ามี receiptList = แบบเก่า -> แปลง
    if (receipt.receiptList && Array.isArray(receipt.receiptList)) {
      console.log('🔄 Converting old format to new format');
      
      const debtorList = receipt.receiptList.map((item: any) => ({
        itemName: item.itemName || '',
        note: item.note || '',
        amount: item.debtorAmount || item.amount || 0,
      }));

      const depositList = receipt.receiptList.map((item: any) => {
        const paymentDetails = Array.isArray(item.paymentDetails) 
          ? item.paymentDetails 
          : [];
        
        const subtotal = paymentDetails.reduce(
          (sum: number, p: any) => sum + (Number(p.amount) || 0), 
          0
        );
        const fee = Number(item.fee) || 0;

        return {
          itemName: item.itemName || '',
          note: item.note || '',
          subtotal: subtotal,
          fee: fee,
          netAmount: subtotal - fee,
          paymentDetails: paymentDetails,
        };
      });

      // Return แบบใหม่
      return {
        ...receipt,
        debtorList,
        depositList,
        // เก็บ receiptList ไว้ด้วยเผื่อหน้าอื่นยังใช้
        receiptList: receipt.receiptList,
      };
    }

    // ถ้าไม่มีทั้ง 2 แบบ = ข้อมูลเปล่า
    console.log('⚠️ No list found - creating empty lists');
    return {
      ...receipt,
      debtorList: [],
      depositList: [],
      receiptList: [],
    };
  };

  /**
   * ✅ แปลงข้อมูลจากแบบใหม่ (debtorList + depositList) เป็นแบบเก่า (receiptList)
   * สำหรับหน้าที่ยังใช้โครงสร้างเก่าอยู่
   */
  const normalizeToOldFormat = (receipt: any): any => {
    // ถ้ามี receiptList อยู่แล้ว = แบบเก่า
    if (receipt.receiptList && Array.isArray(receipt.receiptList)) {
      console.log('✅ Already old format');
      return receipt;
    }

    // ถ้ามี debtorList และ depositList = แบบใหม่ -> แปลงเป็นแบบเก่า
    if (receipt.debtorList && receipt.depositList) {
      console.log('🔄 Converting new format to old format');
      
      const maxLength = Math.max(
        receipt.debtorList.length, 
        receipt.depositList.length
      );

      const receiptList = [];
      for (let i = 0; i < maxLength; i++) {
        const debtor = receipt.debtorList[i] || {};
        const deposit = receipt.depositList[i] || {};

        receiptList.push({
          itemName: debtor.itemName || deposit.itemName || '',
          note: debtor.note || deposit.note || '',
          debtorAmount: Number(debtor.amount) || 0,
          depositSubtotal: Number(deposit.subtotal) || 0,
          fee: Number(deposit.fee) || 0,
          depositNetAmount: Number(deposit.netAmount) || 0,
          amount: Number(deposit.netAmount) || 0,
          paymentDetails: deposit.paymentDetails || [],
        });
      }

      return {
        ...receipt,
        receiptList,
        // เก็บ debtorList และ depositList ไว้ด้วย
        debtorList: receipt.debtorList,
        depositList: receipt.depositList,
      };
    }

    // ถ้าไม่มีทั้ง 2 แบบ
    return {
      ...receipt,
      receiptList: [],
      debtorList: [],
      depositList: [],
    };
  };

  // ========== API Endpoints ==========

  // GET /findOneReceipt/:id
  mock.onGet(/\/findOneReceipt\/([^/]+)$/).reply(config => {
    const id = config.url?.match(/\/findOneReceipt\/([^/]+)$/)?.[1];
    if (!id) return [400, { message: 'id required' }];
    
    const db = loadReceipts();
    const found = db.find(r => r.projectCode === id || (r as any).id === id);
    
    if (!found) return [404, { message: 'Not found' }];
    
    console.log('✅ Found receipt:', found);
    
    // ✅ Return ทั้งแบบเก่าและแบบใหม่
    return [200, normalizeToOldFormat(normalizeToNewFormat(found))];
  });

  // GET /getReceipt/:projectCode
  mock.onGet(/\/getReceipt\/([^?]+)$/).reply(config => {
    const url = config.url || '';
    console.log('📥 GET single receipt - URL:', url);

    const match = url.match(/\/getReceipt\/([^?]+)$/);
    const projectCode = match?.[1];

    if (!projectCode) {
      console.error('❌ No projectCode in URL');
      return [400, { message: 'projectCode is required' }];
    }

    const decodedCode = decodeURIComponent(projectCode);
    console.log('🔍 Looking for projectCode:', decodedCode);

    const db = loadReceipts();
    const found = db.find(r => r.projectCode === decodedCode);

    if (!found) {
      console.error('❌ Receipt not found:', decodedCode);
      return [404, {
        message: 'Receipt not found',
        requestedCode: decodedCode,
        availableCodes: db.map(r => r.projectCode)
      }];
    }

    console.log('✅ Found receipt:', {
      projectCode: found.projectCode,
      fullName: found.fullName
    });

    // ✅ Normalize ทั้ง 2 แบบ
    const normalized = normalizeToNewFormat(found);
    const withOldFormat = normalizeToOldFormat(normalized);

    const response = {
      ...found,
      moneyType: found.moneyType || found.sendmoney || '',
      isLocked: found.isLocked ?? false,
      createdAt: found.createdAt instanceof Date
        ? found.createdAt.toISOString()
        : found.createdAt,
      updatedAt: found.updatedAt instanceof Date
        ? found.updatedAt.toISOString()
        : found.updatedAt,
    };

    return [200, response];
  });

  // GET /getReceipt (with query params)
  mock.onGet(/\/getReceipt(?:\?.*)?$/).reply(config => {
    const db = loadReceipts();
    const url = new URL(config.url!, window.location.origin);
    const fullName = url.searchParams.get('fullName');
    const projectCode = url.searchParams.get('projectCode');
    const affiliationId = url.searchParams.get('affiliationId');
    const q = url.searchParams.get('q');

    let list = db;
    if (fullName) list = list.filter(r => r.fullName.toLowerCase().includes(fullName.toLowerCase()));
    if (projectCode) list = list.filter(r => r.projectCode === projectCode);
    if (affiliationId) list = list.filter(r => (r as any).affiliationId === affiliationId);
    if (q) {
      const s = q.toLowerCase();
      list = list.filter(r =>
        r.fullName.toLowerCase().includes(s) ||
        r.projectCode.toLowerCase().includes(s) ||
        (r as any).affiliationName?.toLowerCase().includes(s)
      );
    }

    // ✅ Return ทั้ง 2 แบบ
    const normalized = list.map(receipt => {
      const newFormat = normalizeToNewFormat(receipt);
      return normalizeToOldFormat(newFormat);
    });

    return [200, normalized];
  });

  // POST /saveReceipt
  mock.onPost('/saveReceipt').reply(config => {
    const incoming = JSON.parse(config.data);
    
    if (!incoming.projectCode) {
      return [400, { message: 'projectCode is required' }];
    }

    console.log('📥 Save Receipt - Incoming:', incoming);

    const db = loadReceipts();
    
    // ตรวจสอบ duplicate
    if (db.some(r => r.projectCode === incoming.projectCode)) {
      return [409, { message: 'Duplicate projectCode' }];
    }

    // ✅ Normalize ข้อมูลให้มีทั้ง 2 แบบ
    const normalized = normalizeToNewFormat(incoming);
    const withOldFormat = normalizeToOldFormat(normalized);
    const sanitized = sanitizeReceipt(withOldFormat);

    const next = [sanitized, ...db];
    saveReceipts(next);
    
    console.log('✅ Saved successfully:', sanitized);
    return [201, sanitized];
  });

  // PUT /updateReceipt/:projectCode
  mock.onPut(/\/updateReceipt\/(.+)$/).reply(config => {
    const matches = config.url?.match(/\/updateReceipt\/(.+)$/);
    const projectCode = matches ? decodeURIComponent(matches[1]) : '';
    const incoming = JSON.parse(config.data);

    console.log('🔄 Update Request:', { projectCode, incoming });

    if (!projectCode) return [400, { message: 'projectCode is required' }];

    const db = loadReceipts();
    const idx = db.findIndex(r => r.projectCode === projectCode);

    if (idx === -1) {
      console.error('❌ Not found:', projectCode);
      console.log('Available projectCodes:', db.map(r => r.projectCode));
      return [404, { message: 'Receipt not found' }];
    }

    // ✅ Normalize ข้อมูลให้มีทั้ง 2 แบบ
    const normalized = normalizeToNewFormat(incoming);
    const withOldFormat = normalizeToOldFormat(normalized);

    // Merge ข้อมูลเดิมกับข้อมูลใหม่
    const updated = sanitizeReceipt({
      ...db[idx],
      ...withOldFormat,
      projectCode, // ใช้ projectCode เดิม
      createdAt: db[idx].createdAt, // เก็บ createdAt เดิม
    });

    db[idx] = updated;
    saveReceipts(db);

    console.log('✅ Updated successfully:', updated);
    return [200, updated];
  });

  // DELETE /deleteReceipt/:id
  mock.onDelete(/\/deleteReceipt\/([^/]+)$/).reply(config => {
    const id = config.url?.match(/\/deleteReceipt\/([^/]+)$/)?.[1];
    if (!id) return [400, { success: false, message: 'id required' }];
    
    const db = loadReceipts();
    const before = db.length;
    const next = db.filter(r => r.projectCode !== id && (r as any).id !== id);
    saveReceipts(next);
    
    return [200, { success: next.length !== before }];
  });

  console.log('✅ Axios Mock Setup Complete - Backward Compatible Mode');
  return mock;

  
}

// ========== ตัวอย่างการใช้งาน ==========
/*
// หน้าที่ใช้แบบเก่า (receiptList) - ยังใช้งานได้
const response = await axios.get('/getReceipt/PRJ-001');
console.log(response.data.receiptList); // ✅ มีข้อมูล

// หน้าที่ใช้แบบใหม่ (debtorList + depositList) - ใช้งานได้เหมือนกัน
const response = await axios.get('/getReceipt/PRJ-001');
console.log(response.data.debtorList); // ✅ มีข้อมูล
console.log(response.data.depositList); // ✅ มีข้อมูล

// บันทึกแบบใหม่
await axios.post('/saveReceipt', {
  projectCode: 'NEW-001',
  debtorList: [...],
  depositList: [...]
});

// บันทึกแบบเก่า - ยังทำงานได้
await axios.post('/saveReceipt', {
  projectCode: 'OLD-001',
  receiptList: [...]
});
*/