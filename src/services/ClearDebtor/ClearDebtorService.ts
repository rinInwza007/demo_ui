// src/services/clearSummaryService.ts

import axios from 'axios'
import type { ClearSummary } from '@/types/summary'

export const clearSummaryService = {
  create(data: ClearSummary) {
    return axios.post('/clear-summaries', data)
  },

  getAll() {
    return axios.get('/clear-summaries')
  },

  getById(id: string) {
    return axios.get(`/clear-summaries/${id}`)
  },

  update(id: string, payload: Partial<ClearSummary>) {
    return axios.put(`/clear-summaries/${id}`, payload)
  },

  delete(id: string) {
    return axios.delete(`/clear-summaries/${id}`)
  }
}
