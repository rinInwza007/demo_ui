import { defineStore } from "pinia";

// import ฟังก์ชันจาก service ให้ถูกต้อง
import {
  FindOneRecipt,
  GetRecipt,
} from '@/services/ReciptService';

export const getReciptStore = defineStore("Recipt", {
  state: () => ({
    logs: [],       // เอาไว้เก็บข้อมูลใบเสร็จ
    error: null,
  }),
  actions: {
    async getReciptList() {
      try {
        const data = await GetRecipt();
        this.logs = data || [];
      } catch (err) {
        this.error = err;
      }
    },
  },
});

export const useReciptStore = defineStore("Recipt", {
  state: () => ({
    // dashboard
    affiliations: null,
    pedding: null,
    send: null,
    overrule: null,
    commit: null,

    reciptUser: {},
    reciptItems: [],
    reciptList: [],

    loading: false,
    error: null,

    logs: [],

    // timer
    targetDate: new Date('2025-10-01T16:30:00').getTime(),
    currentTime: new Date().getTime(),
  }),

  actions: {

    // ฟังก์ชันดึงรายการใบเสร็จ
    async getReciptList(param: any) {

      try {
        
        const parsedData = await GetRecipt(param);

        console.log("Parsed data:", parsedData);

        if (!parsedData) {
          return "fail";
        }

        // เก็บข้อมูลลง store
        this.logs = parsedData;

        return "pass";

      } catch (error: any) {
        this.error = error;
        return "fail";
      }
    },

    // ดึงใบเสร็จตาม id
    async getOneRecipt(id: any) {
      try {
        const result = await FindOneRecipt(id);
        this.reciptUser = result;
        return 'pass';
      } catch (error: any) {
        this.error = error;
        return 'fail';
      }
    },

  },

  getters: {
    timeRemaining(state) {
      const distance = state.targetDate - state.currentTime;

      if (distance < 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          eventEnd: true
        };
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const eventEnd = (days == 0 && hours == 0 && minutes == 0 && seconds == 0);

      return {
        days,
        hours,
        minutes,
        seconds,
        eventEnd
      };
    },
  },
});

