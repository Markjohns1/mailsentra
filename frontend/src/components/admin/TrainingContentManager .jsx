import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, Edit2, Trash2, Save, X, Eye, AlertCircle, CheckCircle } from 'lucide-react'
import { trainingService } from '../../services/trainingService'

const TrainingContentManager = () => {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showSuccess, setShowSuccess] = useState(null)
  const [showError, setShowError] = useState(null)

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    setLoading(true)
    try {
      const data = await trainingService.getAdminTrainingContent()
      setSections(data.sections || [])
    } catch (error) {
      showErrorMessage('Failed to load training content')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const showSuccessMessage = (msg) => {
    setShowSuccess(msg)
    setTimeout(() => setShowSuccess(null), 3000)
  }

  const showErrorMessage = (msg) => {
    setShowError(msg)
    setTimeout(() => setShowError(null), 5000)
  }

  const openEditSection = (section) => {
    setEditingSection(section.id)
    setEditForm({
      title: section.title,
      icon: section.icon,
      order: section.order,
      content: section.content,
      examples: section.examples || [],
      quiz: section.quiz || [],
      tips: section.tips || []
    })
  }

  const openNewSection = () => {
    setEditingSection('new')
    setEditForm({
      title: '',
      icon: 'mail',
      order: sections.length + 1,
      content: '',
      examples: [],
      quiz: [],
      tips: []
    })
  }

  const saveSection = async () => {
    try {
      if (editingSection === 'new') {
        await trainingService.createTrainingSection(editForm)
        showSuccessMessage('Section created successfully')
      } else {
        await trainingService.updateTrainingSection(editingSection, editForm)
        showSuccessMessage('Section updated successfully')
      }
      setEditingSection(null)
      loadSections()
    } catch (error) {
      showErrorMessage('Failed to save section')
      console.error(error)
    }
  }

  const deleteSection = async (sectionId) => {
    if (!confirm('Delete this training section? This cannot be undone.')) return
    try {
      await trainingService.deleteTrainingSection(sectionId)
      showSuccessMessage('Section deleted')
      loadSections()
    } catch (error) {
      showErrorMessage('Failed to delete section')
      console.error(error)
    }
  }

  const addExample = () => {
    setEditForm({
      ...editForm,
      examples: [
        ...editForm.examples,
        { id: Date.now(), type: 'spam', subject: '', content: '', analysis: '' }
      ]
    })
  }

  const updateExample = (index, field, value) => {
    const updated = [...editForm.examples]
    updated[index][field] = value
    setEditForm({ ...editForm, examples: updated })
  }

  const removeExample = (index) => {
    const updated = editForm.examples.filter((_, i) => i !== index)
    setEditForm({ ...editForm, examples: updated })
  }

  const addQuizQuestion = () => {
    setEditForm({
      ...editForm,
      quiz: [
        ...editForm.quiz,
        { id: Date.now(), question: '', correctAnswer: 'spam', explanation: '' }
      ]
    })
  }

  const updateQuizQuestion = (index, field, value) => {
    const updated = [...editForm.quiz]
    updated[index][field] = value
    setEditForm({ ...editForm, quiz: updated })
  }

  const removeQuizQuestion = (index) => {
    const updated = editForm.quiz.filter((_, i) => i !== index)
    setEditForm({ ...editForm, quiz: updated })
  }

  const addTip = () => {
    setEditForm({
      ...editForm,
      tips: [
        ...editForm.tips,
        { title: '', description: '', icon: 'mail' }
      ]
    })
  }

  const updateTip = (index, field, value) => {
    const updated = [...editForm.tips]
    updated[index][field] = value
    setEditForm({ ...editForm, tips: updated })
  }

  const removeTip = (index) => {
    const updated = editForm.tips.filter((_, i) => i !== index)
    setEditForm({ ...editForm, tips: updated })
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-600 mx-auto mb-4"></div>
        <p className="text-slate-400">Loading training content...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {showSuccess && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <p className="text-green-400">{showSuccess}</p>
        </div>
      )}
      {showError && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-red-400">{showError}</p>
        </div>
      )}

      {editingSection ? (
        /* Edit Form */
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-cyan-400" />
              {editingSection === 'new' ? 'Create Training Section' : 'Edit Training Section'}
            </h3>
            <button
              onClick={() => setEditingSection(null)}
              className="text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-cyan-500"
                placeholder="Section Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Icon</label>
              <select
                value={editForm.icon}
                onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="mail">Mail</option>
                <option value="shield">Shield</option>
                <option value="award">Award</option>
                <option value="target">Target</option>
                <option value="lock">Lock</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Order</label>
              <input
                type="number"
                value={editForm.order}
                onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Content (HTML allowed)</label>
            <textarea
              value={editForm.content}
              onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
              rows={12}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-cyan-500 font-mono text-sm"
              placeholder="Enter HTML content..."
            />
          </div>

          {/* Examples */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-white">Examples</label>
              <button
                onClick={addExample}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition"
              >
                <Plus size={16} />
                Add Example
              </button>
            </div>
            <div className="space-y-4">
              {editForm.examples.map((example, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-300">Example {idx + 1}</span>
                    <button
                      onClick={() => removeExample(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <select
                      value={example.type}
                      onChange={(e) => updateExample(idx, 'type', e.target.value)}
                      className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="spam">Spam</option>
                      <option value="ham">Ham (Legitimate)</option>
                    </select>
                    <input
                      type="text"
                      value={example.subject}
                      onChange={(e) => updateExample(idx, 'subject', e.target.value)}
                      placeholder="Email Subject"
                      className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                    <textarea
                      value={example.content}
                      onChange={(e) => updateExample(idx, 'content', e.target.value)}
                      placeholder="Email Content"
                      rows={3}
                      className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                    <textarea
                      value={example.analysis}
                      onChange={(e) => updateExample(idx, 'analysis', e.target.value)}
                      placeholder="Analysis/Explanation"
                      rows={2}
                      className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz Questions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-white">Quiz Questions</label>
              <button
                onClick={addQuizQuestion}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition"
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>
            <div className="space-y-4">
              {editForm.quiz.map((question, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-300">Question {idx + 1}</span>
                    <button
                      onClick={() => removeQuizQuestion(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <textarea
                      value={question.question}
                      onChange={(e) => updateQuizQuestion(idx, 'question', e.target.value)}
                      placeholder="Quiz Question Text"
                      rows={2}
                      className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                    <select
                      value={question.correctAnswer}
                      onChange={(e) => updateQuizQuestion(idx, 'correctAnswer', e.target.value)}
                      className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="spam">Correct Answer: Spam</option>
                      <option value="ham">Correct Answer: Ham (Legitimate)</option>
                    </select>
                    <textarea
                      value={question.explanation}
                      onChange={(e) => updateQuizQuestion(idx, 'explanation', e.target.value)}
                      placeholder="Explanation for correct answer"
                      rows={2}
                      className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-white">Tips</label>
              <button
                onClick={addTip}
                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium transition"
              >
                <Plus size={16} />
                Add Tip
              </button>
            </div>
            <div className="space-y-4">
              {editForm.tips.map((tip, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-300">Tip {idx + 1}</span>
                    <button
                      onClick={() => removeTip(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={tip.title}
                      onChange={(e) => updateTip(idx, 'title', e.target.value)}
                      placeholder="Tip Title"
                      className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                    <textarea
                      value={tip.description}
                      onChange={(e) => updateTip(idx, 'description', e.target.value)}
                      placeholder="Tip Description"
                      rows={2}
                      className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                    <select
                      value={tip.icon}
                      onChange={(e) => updateTip(idx, 'icon', e.target.value)}
                      className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="mail">Mail</option>
                      <option value="shield">Shield</option>
                      <option value="link">Link</option>
                      <option value="paperclip">Paperclip</option>
                      <option value="lock">Lock</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={saveSection}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Save Section
            </button>
            <button
              onClick={() => setEditingSection(null)}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Sections List */
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-cyan-400" />
              Training Content Sections
            </h2>
            <button
              onClick={openNewSection}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all shadow-lg"
            >
              <Plus size={18} />
              New Section
            </button>
          </div>

          {sections.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 mb-4">No training sections yet</p>
              <button
                onClick={openNewSection}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition"
              >
                Create First Section
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {sections.sort((a, b) => a.order - b.order).map((section) => (
                <div key={section.id} className="p-6 hover:bg-slate-700/30 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 bg-slate-700 rounded text-xs font-mono text-slate-300">
                          Order: {section.order}
                        </span>
                        <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-400">
                        <span>{section.examples?.length || 0} examples</span>
                        <span>•</span>
                        <span>{section.quiz?.length || 0} quiz questions</span>
                        <span>•</span>
                        <span>{section.tips?.length || 0} tips</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditSection(section)}
                        className="p-2 hover:bg-slate-700 rounded text-blue-400 hover:text-blue-300 transition"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="p-2 hover:bg-slate-700 rounded text-red-400 hover:text-red-300 transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TrainingContentManager