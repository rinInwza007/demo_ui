import { defineStore } from "pinia";

import {
  FindOneRecipt,
  GetRecipt,
} from '@/services/ReciptService';

export const useReciptStore = defineStore("Recipt", {
  state: () => ({
    // dashboard
    affiliations: null,
    pedding: null,
    send: null,
    overrule: null,
    commit:null,
    reciptUser: {},
    reciptItems:[],
    reciptList:[],

    loading:false,

    error: null,
    // logs
    logs: [],
        // timer
    targetDate: new Date('2025-10-01T16:30:00').getTime(),
    currentTime: new Date().getTime(),

  }),
  actions: {

    async getReciptList(param:string) {

      try {
       const parsedData = await getReciptList(param);

        console.log("Parsed data:", parsedData);
        if (!parsedData) {
          return "fail"; // Return fail status if token is empty or not found
        }

         this.logs = parsedData

        return "pass"; // Return pass status if  successful
      } catch (error:any) {
        this.error = error;
        return "fail"; // Return fail status if an error occurs
      }
    },


  },
  getters: {
    timeRemaining  (state)  {
      const distance = state.targetDate - state.currentTime;
      if (distance < 0) {
            return {
            days:0,
            hours:0,
            minutes:0,
            seconds:0,
            eventEnd:true
          };
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const eventEnd = (days == 0 && hours == 0 && minutes == 0 && seconds == 0)
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
