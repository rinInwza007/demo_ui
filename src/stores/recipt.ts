// stores/receipt.ts
import { defineStore } from 'pinia';

import {
  findOneReceipt,
  getReceipt,
  saveReceipt,
  updateReceipt,
  deleteReceipt,
} from '@/services/ReciptService';

import type { Receipt } from '@/types/recipt';

type ActionResult<T = unknown> = { ok: true; data?: T } | { ok: false; error: string };

export const useReceiptStore = defineStore('Receipt', {
  state: () => ({
    // dashboard (ปรับ type ให้ชัดเจนตามที่พี่ใช้จริง)
    affiliations: null as null | Array<{ id: string; name: string }>,
    pending: null as null | number,
    send: null as null | number,
    overrule: null as null | number,
    commit: null as null | number,

    // current user & lists
    receiptUser: {} as Record<string, unknown>, // หรือ type ที่พี่ใช้จริง
    receiptList: [] as Receipt[],
    receipt: {
      fullName: '',
      phone: '',
      affiliationId: '',
      affiliationName: '',
      fundId: '',
      fundName: '',
      projectCode: '',
      receiptList: [],
    } as Receipt,

    // ui state
    loading: false,
    error: null as string | null,

    // logs (ถ้าต้องการ)
    logs: [] as Array<{ time: number; message: string }>,

    // timer (ถ้าจะใช้จริง)
    targetDate: new Date('2025-10-01T16:30:00').getTime(),
    currentTime: new Date().getTime(),
  }),
  getters: {
    // Dynamic header getter เพื่อให้ token ล่าสุดเสมอ
    header(): Record<string, string> {
      const token = localStorage.getItem('user-token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
  },
  actions: {
    // Helper: set error message
    setError(err: unknown) {
      if (!err) {
        this.error = 'Unknown error';
        return;
      }
      if (typeof err === 'string') {
        this.error = err;
        return;
      }
      // รองรับ error จาก axios-like response
      // @ts-ignore
      const msg = err?.response?.data?.message || err?.message || 'Unexpected error';
      this.error = String(msg);
    },

    // Helper: log
    pushLog(message: string) {
      this.logs.push({ time: Date.now(), message });
    },

    async getReceipt(param: string): Promise<ActionResult<Receipt[]>> {
      this.loading = true;
      this.error = null;
      try {
        const data = await getReceipt(param, this.header);
        if (!data) {
          this.setError('Empty response');
          return { ok: false, error: this.error! };
        }
        this.receiptList = data;
        this.pushLog(`Fetched receipt list with param="${param}" (${data.length} items)`);
        return { ok: true, data };
      } catch (error) {
        this.setError(error);
        return { ok: false, error: this.error! };
      } finally {
        this.loading = false;
      }
    },

    async findOneReceipt(param: string): Promise<ActionResult<Receipt>> {
      this.loading = true;
      this.error = null;
      try {
        const data = await findOneReceipt(param, this.header);
        if (!data) {
          this.setError('Empty response');
          return { ok: false, error: this.error! };
        }
        this.receipt = data;
        this.pushLog(`Fetched receipt id="${param}"`);
        return { ok: true, data };
      } catch (error) {
        this.setError(error);
        return { ok: false, error: this.error! };
      } finally {
        this.loading = false;
      }
    },

    async updateReceipt(payload: Receipt): Promise<ActionResult<Receipt>> {
      this.loading = true;
      this.error = null;
      try {
        const data = await updateReceipt(payload, this.header);
        if (!data) {
          this.setError('Empty response');
          return { ok: false, error: this.error! };
        }
        this.receipt = data;
        this.pushLog(`Updated receipt for "${payload.fullName}"`);
        return { ok: true, data };
      } catch (error) {
        this.setError(error);
        return { ok: false, error: this.error! };
      } finally {
        this.loading = false;
      }
    },

    async deleteReceipt(id: string): Promise<ActionResult> {
      this.loading = true;
      this.error = null;
      try {
        const ok = await deleteReceipt(id, this.header);
        if (!ok) {
          this.setError('Delete failed');
          return { ok: false, error: this.error! };
        }
        // ลบออกจาก list ถ้ามีใน cache
        this.receiptList = this.receiptList.filter((r) => r.projectCode !== id && r.fullName !== id);
        this.pushLog(`Deleted receipt id="${id}"`);
        return { ok: true };
      } catch (error) {
        this.setError(error);
        return { ok: false, error: this.error! };
      } finally {
        this.loading = false;
      }
    },

    async saveReceipt(payload: Receipt): Promise<ActionResult<Receipt>> {
      this.loading = true;
      this.error = null;
      try {
        const data = await saveReceipt(payload, this.header);
        if (!data) {
          this.setError('Empty response');
          return { ok: false, error: this.error! };
        }
        this.receipt = data;
        // อัปเดต list ถ้าต้องการ cache
        this.receiptList = [data, ...this.receiptList];
        this.pushLog(`Saved receipt for "${payload.fullName}"`);
        return { ok: true, data };
      } catch (error) {
        this.setError(error);
        return { ok: false, error: this.error! };
      } finally {
        this.loading = false;
      }
    },

    /**
     * ตั้งค่า receipt ทั้งก้อน (ใช้ตอนโหลดหรือรีเซ็ต)
     */
    setReceipt(payload: Receipt) {
      this.receipt = { ...payload };
    },

    /**
     * รีเซ็ตค่า receipt ให้เป็นค่าว่างตาม schema
     */
    resetReceipt() {
      this.receipt = {
        fullName: '',
        phone: '',
        affiliationId: '',
        affiliationName: '',
        fundId: '',
        fundName: '',
        projectCode: '',
        receiptList: [],
      };
    },
  }
});
