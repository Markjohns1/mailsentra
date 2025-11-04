import api from './api'

export const trainingService = {
  // Get all training content (public - all users)
  getTrainingContent: async () => {
    const response = await api.get('/training/content')
    return response.data
  },

  // Admin: Get all training content for editing
  getAdminTrainingContent: async () => {
    const response = await api.get('/admin/training/content')
    return response.data
  },

  // Admin: Update training section
  updateTrainingSection: async (sectionId, data) => {
    const response = await api.put(`/admin/training/sections/${sectionId}`, data)
    return response.data
  },

  // Admin: Create new training section
  createTrainingSection: async (data) => {
    const response = await api.post('/admin/training/sections', data)
    return response.data
  },

  // Admin: Delete training section
  deleteTrainingSection: async (sectionId) => {
    const response = await api.delete(`/admin/training/sections/${sectionId}`)
    return response.data
  },

  // Admin: Add example to section
  addExample: async (sectionId, exampleData) => {
    const response = await api.post(`/admin/training/sections/${sectionId}/examples`, exampleData)
    return response.data
  },

  // Admin: Update example
  updateExample: async (exampleId, exampleData) => {
    const response = await api.put(`/admin/training/examples/${exampleId}`, exampleData)
    return response.data
  },

  // Admin: Delete example
  deleteExample: async (exampleId) => {
    const response = await api.delete(`/admin/training/examples/${exampleId}`)
    return response.data
  },

  // Admin: Add quiz question
  addQuizQuestion: async (sectionId, questionData) => {
    const response = await api.post(`/admin/training/sections/${sectionId}/quiz`, questionData)
    return response.data
  },

  // Admin: Update quiz question
  updateQuizQuestion: async (questionId, questionData) => {
    const response = await api.put(`/admin/training/quiz/${questionId}`, questionData)
    return response.data
  },

  // Admin: Delete quiz question
  deleteQuizQuestion: async (questionId) => {
    const response = await api.delete(`/admin/training/quiz/${questionId}`)
    return response.data
  }
}
