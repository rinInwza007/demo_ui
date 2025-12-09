import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import { loadReceipts, saveReceipts, sanitizeReceipt } from './mockDb';
import type { Receipt } from '@/types/recipt';

export function setupAxiosMock() {
  const mock = new AxiosMockAdapter(axios, { delayResponse: 300 });

  // ✅ GET /getReceipt (ดึงข้อมูลทั้งหมด + filter)
  mock.onGet(/\/getReceipt$/).reply(config => {
    const db = loadReceipts();
    const url = new URL(config.url!, window.location.origin);
    const fullName = url.searchParams.get('fullName');
    const projectCode = url.searchParams.get('projectCode');
    const affiliationId = url.searchParams.get('affiliationId');
    const q = url.searchParams.get('q');

    let list = db;
    if (fullName) list = list.filter(r => r.fullName.toLowerCase().includes(fullName.toLowerCase()));
    if (projectCode) list = list.filter(r => r.projectCode === projectCode);
    if (affiliationId) list = list.filter(r => r.affiliationId === affiliationId);
    if (q) {
      const s = q.toLowerCase();
      list = list.filter(r =>
        r.fullName.toLowerCase().includes(s) ||
        r.projectCode.toLowerCase().includes(s) ||
        r.affiliationName.toLowerCase().includes(s)
      );
    }
    return [200, list];
  });

  // ✅ GET /getReceipt/:id (ดึงข้อมูลเดี่ยว)
  mock.onGet(/\/getReceipt\/([^/?]+)$/).reply(config => {
    const id = config.url?.match(/\/getReceipt\/([^/?]+)$/)?.[1];
    if (!id) return [400, { message: 'id required' }];
    
    const db = loadReceipts();
    const found = db.find(r => r.projectCode === id || (r as any).id === id);
    
    if (!found) {
      console.error('❌ Receipt not found:', id);
      console.log('Available projectCodes:', db.map(r => r.projectCode));
      return [404, { message: 'Receipt not found' }];
    }
    
    console.log('✅ Found receipt:', found);
    return [200, found];
  });

  // ✅ GET /findOneReceipt/:id (เก็บไว้เผื่อใช้ที่อื่น)
  mock.onGet(/\/findOneReceipt\/([^/]+)$/).reply(config => {
    const id = config.url?.match(/\/findOneReceipt\/([^/]+)$/)?.[1];
    if (!id) return [400, { message: 'id required' }];
    const db = loadReceipts();
    const found = db.find(r => r.projectCode === id || (r as any).id === id);
    if (!found) return [404, { message: 'Not found' }];
    console.log('✅ Found receipt:', found);
    return [200, found];
  });

  // ✅ POST /saveReceipt
  mock.onPost('/saveReceipt').reply(config => {
    const incoming = sanitizeReceipt(JSON.parse(config.data));
    if (!incoming.projectCode) return [400, { message: 'projectCode is required' }];

    const db = loadReceipts();
    if (db.some(r => r.projectCode === incoming.projectCode)) {
      return [409, { message: 'Duplicate projectCode' }];
    }
    const next = [incoming, ...db];
    saveReceipts(next);
    return [201, incoming];
  });

  // ✅ PUT /updateReceipt/:id
  mock.onPut(/\/updateReceipt\/([^/]+)$/).reply(config => {
    const matches = config.url?.match(/\/updateReceipt\/([^/]+)$/);
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

    const updated = sanitizeReceipt({
      ...db[idx],
      ...incoming,
      projectCode
    });
    
    db[idx] = updated;
    saveReceipts(db);
    
    console.log('✅ Updated successfully:', updated);
    return [200, updated];
  });

  // ✅ DELETE /deleteReceipt/:id
  mock.onDelete(/\/deleteReceipt\/([^/]+)$/).reply(config => {
    const id = config.url?.match(/\/deleteReceipt\/([^/]+)$/)?.[1];
    if (!id) return [400, { success: false, message: 'id required' }];
    const db = loadReceipts();
    const before = db.length;
    const next = db.filter(r => r.projectCode !== id && (r as any).id !== id);
    saveReceipts(next);
    return [200, { success: next.length !== before }];
  });

  return mock;
}