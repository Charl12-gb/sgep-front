import api from '@/services/api'

const state = {
  // Outils (questions/critères)
  outils: [],
  outilsByCategory: {},
  outil: null,
  
  // Réponses des entités aux outils
  entityOutils: [],
  entityOutilsReponses: [],
  currentEntityReponses: {},
  
  // Statistiques et rapports
  outilsStatistics: [],
  categoryStatistics: [],
  
  // Interface et navigation
  selectedCategory: null,
  selectedYear: new Date().getFullYear(),
  
  // États de chargement et erreurs
  loading: false,
  savingReponses: false,
  loadingStatistics: false,
  error: null,
  
  // Pagination
  pagination: {
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0
  }
}

const mutations = {
  // Mutations pour les outils
  SET_OUTILS(state, outils) {
    state.outils = outils
    // Grouper par catégorie
    state.outilsByCategory = outils.reduce((acc, outil) => {
      if (!acc[outil.category]) {
        acc[outil.category] = []
      }
      acc[outil.category].push(outil)
      return acc
    }, {})
  },
  
  SET_OUTIL(state, outil) {
    state.outil = outil
  },
  
  ADD_OUTIL(state, outil) {
    state.outils.push(outil)
    // Mettre à jour le groupement par catégorie
    if (!state.outilsByCategory[outil.category]) {
      state.outilsByCategory[outil.category] = []
    }
    state.outilsByCategory[outil.category].push(outil)
  },
  
  UPDATE_OUTIL(state, updatedOutil) {
    const index = state.outils.findIndex(o => o.id === updatedOutil.id)
    if (index !== -1) {
      state.outils.splice(index, 1, updatedOutil)
      // Reconstruire le groupement par catégorie
      mutations.SET_OUTILS(state, state.outils)
    }
  },
  
  REMOVE_OUTIL(state, outilId) {
    state.outils = state.outils.filter(o => o.id !== outilId)
    // Reconstruire le groupement par catégorie
    mutations.SET_OUTILS(state, state.outils)
  },
  
  // Mutations pour les réponses d'entités
  SET_ENTITY_OUTILS_REPONSES(state, { entityId, reponses }) {
    state.entityOutilsReponses = reponses
    state.currentEntityReponses = {
      entityId,
      reponses: reponses.reduce((acc, reponse) => {
        acc[reponse.outil_id] = reponse
        return acc
      }, {})
    }
  },
  
  UPDATE_ENTITY_REPONSE(state, { outilId, reponse }) {
    if (state.currentEntityReponses.reponses) {
      state.currentEntityReponses.reponses[outilId] = reponse
    }
  },
  
  ADD_ENTITY_REPONSE(state, reponse) {
    state.entityOutilsReponses.push(reponse)
    if (state.currentEntityReponses.reponses) {
      state.currentEntityReponses.reponses[reponse.outil_id] = reponse
    }
  },
  
  // Mutations pour les statistiques
  SET_OUTILS_STATISTICS(state, statistics) {
    state.outilsStatistics = statistics
  },
  
  SET_CATEGORY_STATISTICS(state, statistics) {
    state.categoryStatistics = statistics
  },
  
  // Mutations pour l'interface
  SET_SELECTED_CATEGORY(state, category) {
    state.selectedCategory = category
  },
  
  SET_SELECTED_YEAR(state, year) {
    state.selectedYear = year
  },
  
  // Mutations pour les états
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_SAVING_REPONSES(state, saving) {
    state.savingReponses = saving
  },
  
  SET_LOADING_STATISTICS(state, loading) {
    state.loadingStatistics = loading
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  SET_PAGINATION(state, pagination) {
    state.pagination = pagination
  },
  
  CLEAR_ERROR(state) {
    state.error = null
  }
}

const actions = {
  // Actions pour les outils
  async fetchOutils({ commit }, { category = null, isActive = true } = {}) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const params = {}
      if (category) params.category = category
      if (isActive !== null) params.is_active = isActive
      
      const response = await api.get('/entreprise/outils', { params })
      commit('SET_OUTILS', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.detail || error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async fetchOutil({ commit }, outilId) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await api.get(`/entreprise/outils/${outilId}`)
      commit('SET_OUTIL', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.detail || error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async createOutil({ commit }, outilData) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await api.post('/entreprise/outils', outilData)
      commit('ADD_OUTIL', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.detail || error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async updateOutil({ commit }, { outilId, outilData }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await api.put(`/entreprise/outils/${outilId}`, outilData)
      commit('UPDATE_OUTIL', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.detail || error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async deleteOutil({ commit }, outilId) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      await api.delete(`/entreprise/outils/${outilId}`)
      commit('REMOVE_OUTIL', outilId)
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.detail || error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Actions pour les réponses des conseils d'administration
  async fetchBoardCouncilOutilsReponses({ commit }, { boardCouncilId, annee, category = null }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const params = { annee }
      if (category) params.category = category
      
      const response = await api.get(`/entreprise/board-councils/${boardCouncilId}/outils-reponses`, { params })
      commit('SET_ENTITY_OUTILS_REPONSES', { 
        entityId: boardCouncilId, 
        reponses: response.data.reponses 
      })
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.detail || error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Legacy method for backward compatibility
  async fetchEntityOutilsReponses({ dispatch }, { entityId, annee, category = null }) {
    // For backward compatibility, redirect to the new method
    console.warn('fetchEntityOutilsReponses is deprecated, use fetchBoardCouncilOutilsReponses instead')
    return dispatch('fetchBoardCouncilOutilsReponses', { boardCouncilId: entityId, annee, category })
  },
  
  async saveBoardCouncilReponse({ commit }, { boardCouncilId, reponseData }) {
    commit('SET_SAVING_REPONSES', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await api.post(`/entreprise/board-councils/${boardCouncilId}/outils-reponses`, reponseData)
      commit('UPDATE_ENTITY_REPONSE', { 
        outilId: reponseData.outil_id, 
        reponse: response.data 
      })
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.detail || error.message)
      throw error
    } finally {
      commit('SET_SAVING_REPONSES', false)
    }
  },

  // Legacy method
  async saveEntityReponse({ dispatch }, { entityId, reponseData }) {
    console.warn('saveEntityReponse is deprecated, use saveBoardCouncilReponse instead')
    return dispatch('saveBoardCouncilReponse', { boardCouncilId: entityId, reponseData })
  },
  
  async saveBoardCouncilReponsesBulk({ commit }, { boardCouncilId, bulkData }) {
    commit('SET_SAVING_REPONSES', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await api.post(`/entreprise/board-councils/${boardCouncilId}/outils-reponses/bulk`, bulkData)
      
      // Recharger les réponses après la sauvegarde en lot
      await actions.fetchBoardCouncilOutilsReponses({ commit }, { 
        boardCouncilId, 
        annee: bulkData.annee 
      })
      
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.detail || error.message)
      throw error
    } finally {
      commit('SET_SAVING_REPONSES', false)
    }
  },

  // Legacy method
  async saveEntityReponsesBulk({ dispatch }, { entityId, bulkData }) {
    console.warn('saveEntityReponsesBulk is deprecated, use saveBoardCouncilReponsesBulk instead')
    return dispatch('saveBoardCouncilReponsesBulk', { boardCouncilId: entityId, bulkData })
  },
  
  async updateBoardCouncilReponse({ commit }, { boardCouncilId, reponseId, reponseData }) {
    commit('SET_SAVING_REPONSES', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await api.put(`/entreprise/board-councils/${boardCouncilId}/outils-reponses/${reponseId}`, reponseData)
      commit('UPDATE_ENTITY_REPONSE', { 
        outilId: response.data.outil_id, 
        reponse: response.data 
      })
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.detail || error.message)
      throw error
    } finally {
      commit('SET_SAVING_REPONSES', false)
    }
  },

  // Legacy method
  async updateEntityReponse({ dispatch }, { entityId, reponseId, reponseData }) {
    console.warn('updateEntityReponse is deprecated, use updateBoardCouncilReponse instead')
    return dispatch('updateBoardCouncilReponse', { boardCouncilId: entityId, reponseId, reponseData })
  },
  
  async deleteBoardCouncilReponse({ commit }, { boardCouncilId, reponseId, outilId }) {
    commit('SET_SAVING_REPONSES', true)
    commit('CLEAR_ERROR')
    
    try {
      await api.delete(`/entreprise/board-councils/${boardCouncilId}/outils-reponses/${reponseId}`)
      // Supprimer de l'état local
      if (state.currentEntityReponses.reponses) {
        delete state.currentEntityReponses.reponses[outilId]
      }
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.detail || error.message)
      throw error
    } finally {
      commit('SET_SAVING_REPONSES', false)
    }
  },

  // Legacy method
  async deleteEntityReponse({ dispatch }, { entityId, reponseId, outilId }) {
    console.warn('deleteEntityReponse is deprecated, use deleteBoardCouncilReponse instead')
    return dispatch('deleteBoardCouncilReponse', { boardCouncilId: entityId, reponseId, outilId })
  },
  
  // Actions pour l'initialisation
  async initBoardCouncilOutils({ commit }, { boardCouncilId, annee }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await api.post(`/entreprise/board-councils/${boardCouncilId}/init-outils`, null, {
        params: { annee }
      })
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.detail || error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Legacy method
  async initEntityOutils({ dispatch }, { entityId, annee }) {
    console.warn('initEntityOutils is deprecated, use initBoardCouncilOutils instead')
    return dispatch('initBoardCouncilOutils', { boardCouncilId: entityId, annee })
  },
  
  // Actions pour les statistiques
  async fetchOutilsStatistics({ commit }, { annee, category = null }) {
    commit('SET_LOADING_STATISTICS', true)
    commit('CLEAR_ERROR')
    
    try {
      const params = { annee }
      if (category) params.category = category
      
      const response = await api.get('/entreprise/outils/statistiques', { params })
      commit('SET_OUTILS_STATISTICS', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.detail || error.message)
      throw error
    } finally {
      commit('SET_LOADING_STATISTICS', false)
    }
  },
  
  // Actions pour l'interface
  selectCategory({ commit }, category) {
    commit('SET_SELECTED_CATEGORY', category)
  },
  
  selectYear({ commit }, year) {
    commit('SET_SELECTED_YEAR', year)
  },
  
  clearError({ commit }) {
    commit('CLEAR_ERROR')
  }
}

const getters = {
  // Getters pour les outils
  outils: state => state.outils,
  outilsByCategory: state => state.outilsByCategory,
  outil: state => state.outil,
  
  // Getters pour les catégories
  categories: state => Object.keys(state.outilsByCategory),
  outilsInCategory: state => category => state.outilsByCategory[category] || [],
  
  // Getters pour les réponses
  entityOutilsReponses: state => state.entityOutilsReponses,
  currentEntityReponses: state => state.currentEntityReponses,
  getReponseForOutil: state => outilId => {
    return state.currentEntityReponses.reponses?.[outilId] || null
  },
  
  // Getters pour les statistiques
  outilsStatistics: state => state.outilsStatistics,
  categoryStatistics: state => state.categoryStatistics,
  
  // Getters pour l'interface
  selectedCategory: state => state.selectedCategory,
  selectedYear: state => state.selectedYear,
  
  // Getters pour les états
  loading: state => state.loading,
  savingReponses: state => state.savingReponses,
  loadingStatistics: state => state.loadingStatistics,
  error: state => state.error,
  hasError: state => !!state.error,
  
  // Getters pour la pagination
  pagination: state => state.pagination,
  
  // Getters calculés
  outilsCount: state => state.outils.length,
  hasOutils: state => state.outils.length > 0,
  
  completionPercentage: state => {
    if (!state.currentEntityReponses.reponses || state.outils.length === 0) {
      return 0
    }
    
    const totalOutils = state.outils.length
    const completedOutils = Object.values(state.currentEntityReponses.reponses).filter(reponse => {
      // Considérer comme complété si :
      // - Boolean : valeur définie
      // - Details : texte non vide
      // - Liste : array non vide
      if (reponse.reponse_boolean !== null) return true
      if (reponse.reponse_text && reponse.reponse_text.trim() !== '') return true
      if (reponse.reponse_json && Array.isArray(reponse.reponse_json) && reponse.reponse_json.length > 0) return true
      return false
    }).length
    
    return Math.round((completedOutils / totalOutils) * 100)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
