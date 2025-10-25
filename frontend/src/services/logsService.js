import api from './api'

export const logsService = {
  async getLogs(limit = 10, offset = 0, resultFilter = null) {
    const params = { limit, offset }
    if (resultFilter) {
      params.result_filter = resultFilter
    }
    
    const response = await api.get('/logs', { params })
    return response.data
  },

  async getStats() {
    const response = await api.get('/logs/stats')
    return response.data
  },
}

