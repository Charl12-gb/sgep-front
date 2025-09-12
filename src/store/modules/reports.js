import api from '@/services/api'

const state = {
  // Types de rapports disponibles
  reportTypes: [],
  
  // État de prévisualisation
  previewData: null,
  previewLoading: false,
  previewError: null,
  
  // État de génération
  generationTasks: {},
  generationHistory: [],
  
  // Filtres et configuration
  currentFilters: {
    entity_ids: [],
    entity_names: [],
    entity_status: [],
    years: [],
    start_date: null,
    end_date: null,
    columns: [],
    tutelle: [],
    secteur: []
  },
  
  currentReportConfig: {
    report_type: null,
    format: 'pdf',
    include_charts: false,
    include_summary: true,
    title: '',
    description: ''
  },
  
  // État général
  loading: false,
  error: null,
  
  // Statistiques
  statistics: null
}

const getters = {
  // Types de rapports
  getReportTypes: state => state.reportTypes,
  getReportTypeById: state => id => state.reportTypes.find(type => type.id === id),
  
  // Prévisualisation
  getPreviewData: state => state.previewData,
  isPreviewLoading: state => state.previewLoading,
  getPreviewError: state => state.previewError,
  hasPreviewData: state => state.previewData && state.previewData.preview_data && state.previewData.preview_data.length > 0,
  
  // Génération
  getGenerationTasks: state => state.generationTasks,
  getGenerationTask: state => id => state.generationTasks[id],
  getGenerationHistory: state => state.generationHistory,
  getActiveGenerations: state => Object.values(state.generationTasks).filter(task => 
    task.status === 'generating' || task.status === 'processing'
  ),
  getCompletedGenerations: state => Object.values(state.generationTasks).filter(task => 
    task.status === 'completed'
  ),
  
  // Configuration
  getCurrentFilters: state => state.currentFilters,
  getCurrentReportConfig: state => state.currentReportConfig,
  
  // État général
  isLoading: state => state.loading,
  getError: state => state.error,
  
  // Statistiques
  getStatistics: state => state.statistics,
  
  // Utilitaires
  canGenerateReport: state => state.currentReportConfig.report_type !== null,
  hasActiveFilters: state => {
    const filters = state.currentFilters
    return filters.entity_ids.length > 0 || 
           filters.years.length > 0 || 
           filters.tutelle.length > 0 || 
           filters.secteur.length > 0 ||
           filters.start_date !== null ||
           filters.end_date !== null
  }
}

const mutations = {
  // Types de rapports
  SET_REPORT_TYPES(state, types) {
    state.reportTypes = types
  },
  
  // Prévisualisation
  SET_PREVIEW_LOADING(state, loading) {
    state.previewLoading = loading
  },
  
  SET_PREVIEW_DATA(state, data) {
    state.previewData = data
  },
  
  SET_PREVIEW_ERROR(state, error) {
    state.previewError = error
  },
  
  CLEAR_PREVIEW(state) {
    state.previewData = null
    state.previewError = null
    state.previewLoading = false
  },
  
  // Génération
  ADD_GENERATION_TASK(state, { id, task }) {
    state.generationTasks = { ...state.generationTasks, [id]: task }
  },
  
  UPDATE_GENERATION_TASK(state, { id, updates }) {
    if (state.generationTasks[id]) {
      state.generationTasks[id] = { ...state.generationTasks[id], ...updates }
    }
  },
  
  REMOVE_GENERATION_TASK(state, id) {
    const tasks = { ...state.generationTasks }
    delete tasks[id]
    state.generationTasks = tasks
  },
  
  ADD_TO_HISTORY(state, task) {
    state.generationHistory.unshift(task)
    // Garder seulement les 50 derniers
    if (state.generationHistory.length > 50) {
      state.generationHistory = state.generationHistory.slice(0, 50)
    }
  },
  
  CLEAR_GENERATION_HISTORY(state) {
    state.generationHistory = []
  },
  
  // Filtres et configuration
  SET_FILTERS(state, filters) {
    state.currentFilters = { ...state.currentFilters, ...filters }
  },
  
  RESET_FILTERS(state) {
    state.currentFilters = {
      entity_ids: [],
      entity_names: [],
      entity_status: [],
      years: [],
      start_date: null,
      end_date: null,
      columns: [],
      tutelle: [],
      secteur: []
    }
  },
  
  SET_REPORT_CONFIG(state, config) {
    state.currentReportConfig = { ...state.currentReportConfig, ...config }
  },
  
  RESET_REPORT_CONFIG(state) {
    state.currentReportConfig = {
      report_type: null,
      format: 'pdf',
      include_charts: false,
      include_summary: true,
      title: '',
      description: ''
    }
  },
  
  // État général
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  CLEAR_ERROR(state) {
    state.error = null
  },
  
  // Statistiques
  SET_STATISTICS(state, statistics) {
    state.statistics = statistics
  }
}

const actions = {
  // Charger les types de rapports
  async fetchReportTypes({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await api.get('/reports/types')
      commit('SET_REPORT_TYPES', response.data.report_types)
      
      return response.data.report_types
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Erreur lors du chargement des types de rapports'
      commit('SET_ERROR', errorMsg)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Prévisualiser un rapport
  async previewReport({ commit, state }, { reportType, filters = null, limit = 10 }) {
    try {
      commit('SET_PREVIEW_LOADING', true)
      commit('SET_PREVIEW_ERROR', null)
      
      const requestData = {
        report_type: reportType,
        filters: filters || state.currentFilters,
        limit
      }
      
      // Nettoyer les filtres vides
      if (requestData.filters) {
        Object.keys(requestData.filters).forEach(key => {
          if (Array.isArray(requestData.filters[key]) && requestData.filters[key].length === 0) {
            delete requestData.filters[key]
          } else if (requestData.filters[key] === null || requestData.filters[key] === '') {
            delete requestData.filters[key]
          }
        })
      }
      
      const response = await api.post('/reports/preview', requestData)
      commit('SET_PREVIEW_DATA', response.data)
      
      return response.data
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Erreur lors de la prévisualisation'
      commit('SET_PREVIEW_ERROR', errorMsg)
      throw error
    } finally {
      commit('SET_PREVIEW_LOADING', false)
    }
  },
  
  // Générer un rapport
  async generateReport({ commit, state, dispatch }, customConfig = {}) {
    try {
      commit('CLEAR_ERROR')
      
      const config = { ...state.currentReportConfig, ...customConfig }
      
      if (!config.report_type) {
        throw new Error('Type de rapport requis')
      }
      
      const requestData = {
        report_type: config.report_type,
        format: config.format,
        filters: state.currentFilters,
        include_charts: config.include_charts,
        include_summary: config.include_summary,
        title: config.title || `Rapport ${config.report_type}`,
        description: config.description || 'Rapport généré depuis l\'interface'
      }
      
      // Nettoyer les filtres vides
      if (requestData.filters) {
        Object.keys(requestData.filters).forEach(key => {
          if (Array.isArray(requestData.filters[key]) && requestData.filters[key].length === 0) {
            delete requestData.filters[key]
          } else if (requestData.filters[key] === null || requestData.filters[key] === '') {
            delete requestData.filters[key]
          }
        })
      }
      
      const response = await api.post('/reports/generate', requestData)
      const taskData = response.data
      
      // Ajouter la tâche de génération
      commit('ADD_GENERATION_TASK', {
        id: taskData.report_id,
        task: {
          ...taskData,
          progress: 0,
          message: 'Génération initiée...',
          created_at: new Date().toISOString(),
          config: requestData
        }
      })
      
      // Commencer le suivi
      dispatch('trackGenerationProgress', taskData.report_id)
      
      return taskData.report_id
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Erreur lors de la génération'
      commit('SET_ERROR', errorMsg)
      throw error
    }
  },
  
  // Suivre la progression d'une génération
  async trackGenerationProgress({ commit, dispatch }, reportId) {
    try {
      const response = await api.get(`/reports/status/${reportId}`)
      const status = response.data
      
      commit('UPDATE_GENERATION_TASK', {
        id: reportId,
        updates: {
          status: status.status,
          progress: status.progress || 0,
          message: status.message || 'En cours...',
          estimated_completion: status.estimated_completion,
          updated_at: new Date().toISOString()
        }
      })
      
      if (status.status === 'completed') {
        // Rapport terminé
        commit('UPDATE_GENERATION_TASK', {
          id: reportId,
          updates: {
            downloadable: true,
            completed_at: new Date().toISOString()
          }
        })
        
        // Ajouter à l'historique
        const task = { ...response.data, id: reportId }
        commit('ADD_TO_HISTORY', task)
        
      } else if (status.status === 'failed') {
        // Rapport échoué
        commit('UPDATE_GENERATION_TASK', {
          id: reportId,
          updates: {
            error: status.message || 'Génération échouée',
            failed_at: new Date().toISOString()
          }
        })
        
      } else if (status.status === 'generating' || status.status === 'processing') {
        // Continuer le suivi
        setTimeout(() => {
          dispatch('trackGenerationProgress', reportId)
        }, 2000)
      }
      
      return status
    } catch (error) {
      commit('UPDATE_GENERATION_TASK', {
        id: reportId,
        updates: {
          status: 'failed',
          error: 'Erreur de suivi de progression',
          failed_at: new Date().toISOString()
        }
      })
      throw error
    }
  },
  
  // Télécharger un rapport
  async downloadReport({ commit }, reportId) {
    try {
      const response = await api.get(`/reports/download/${reportId}`, {
        responseType: 'blob'
      })
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      // Extraire le nom du fichier depuis les headers
      const disposition = response.headers['content-disposition']
      let filename = 'rapport.pdf'
      if (disposition) {
        const filenameMatch = disposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Erreur lors du téléchargement'
      commit('SET_ERROR', errorMsg)
      throw error
    }
  },
  
  // Charger les statistiques
  async fetchStatistics({ commit }) {
    try {
      const response = await api.get('/reports-demo/stats')
      commit('SET_STATISTICS', response.data)
      return response.data
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      // Ne pas faire échouer l'app pour les stats
      return null
    }
  },
  
  // Actions de gestion
  clearPreview({ commit }) {
    commit('CLEAR_PREVIEW')
  },
  
  updateFilters({ commit }, filters) {
    commit('SET_FILTERS', filters)
  },
  
  resetFilters({ commit }) {
    commit('RESET_FILTERS')
  },
  
  updateReportConfig({ commit }, config) {
    commit('SET_REPORT_CONFIG', config)
  },
  
  resetReportConfig({ commit }) {
    commit('RESET_REPORT_CONFIG')
  },
  
  removeGenerationTask({ commit }, reportId) {
    commit('REMOVE_GENERATION_TASK', reportId)
  },
  
  clearGenerationHistory({ commit }) {
    commit('CLEAR_GENERATION_HISTORY')
  },
  
  clearError({ commit }) {
    commit('CLEAR_ERROR')
  },
  
  // Action combinée pour préparer un rapport
  async prepareReport({ dispatch, commit }, { reportType, filters = null }) {
    // Mettre à jour la configuration
    commit('SET_REPORT_CONFIG', { report_type: reportType })
    
    if (filters) {
      commit('SET_FILTERS', filters)
    }
    
    // Prévisualiser automatiquement
    await dispatch('previewReport', { reportType, filters })
    
    return true
  },
  
  // Action combinée pour générer et télécharger
  async generateAndDownload({ dispatch }, config) {
    const reportId = await dispatch('generateReport', config)
    
    // Attendre que la génération soit terminée
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const status = await dispatch('trackGenerationProgress', reportId)
          
          if (status.status === 'completed') {
            await dispatch('downloadReport', reportId)
            resolve(reportId)
          } else if (status.status === 'failed') {
            reject(new Error(status.message || 'Génération échouée'))
          } else {
            setTimeout(checkStatus, 2000)
          }
        } catch (error) {
          reject(error)
        }
      }
      
      checkStatus()
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
