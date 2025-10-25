import api from './api'

export const analyzeService = {
  async analyzeEmail(emailText) {
    const response = await api.post('/analyze/analyze', {
      email_text: emailText,
    })
    return response.data
  },

  async getModelInfo() {
    const response = await api.get('/analyze/model/info')
    return response.data
  },
}

