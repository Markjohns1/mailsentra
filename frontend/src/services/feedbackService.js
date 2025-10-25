import api from './api'

export const feedbackService = {
  async submitFeedback(spamLogId, correctedResult, comment = null) {
    const response = await api.post('/feedback', {
      spam_log_id: spamLogId,
      corrected_result: correctedResult,
      comment: comment,
    })
    return response.data
  },

  async getUserFeedback() {
    const response = await api.get('/feedback/user')
    return response.data
  },
}

