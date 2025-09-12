import api from '@/services/api'

const state = {
  items: [],
  item: null,
  loading: false,
  error: null
}

const getters = {
  directionGeneraleList: state => state.items,
  directionGeneraleItem: state => state.item,
  directionGeneraleLoading: state => state.loading,
  directionGeneraleError: state => state.error,
  
  // Nouveaux getters pour les directeurs "current"
  currentDirectorsOnly: state => state.items.filter(item => item.is_current_director === true),
  
  currentDirectorsByPosition: state => position => 
    state.items.filter(item => item.is_current_director === true && item.position === position),
    
  currentDirectorGeneral: state => 
    state.items.find(item => item.is_current_director === true && item.position === "Directeur Général"),
    
  currentDirectorAdmin: state => 
    state.items.find(item => item.is_current_director === true && item.position === "Directeur de l'Administration et des Finances"),
    
  historicalDirectors: state => state.items.filter(item => item.is_current_director === false),
  
  directorsByEntity: state => entityId => 
    state.items.filter(item => item.entity_id === entityId),
    
  currentDirectorsByEntity: state => entityId => 
    state.items.filter(item => item.entity_id === entityId && item.is_current_director === true),
    
  hasCurrentDirectorForPosition: state => (entityId, position) => 
    state.items.some(item => 
      item.entity_id === entityId && 
      item.position === position && 
      item.is_current_director === true
    )
}

const actions = {
  async fetchDirectionGenerale({ commit }, params) {
    commit('setLoading', true)
    try {
      const { data } = await api.get('/direction-generale/', { params })
      commit('setItems', data.items || data)
      commit('setLoading', false)
    } catch (error) {
      commit('setError', error)
      commit('setLoading', false)
    }
  },
  async fetchDirectionGeneraleByEntity({ commit }, entityId) {
    commit('setLoading', true)
    try {
      const { data } = await api.get(`/direction-generale/entity/${entityId}`)
      commit('setItems', data)
      commit('setLoading', false)
    } catch (error) {
      commit('setError', error)
      commit('setLoading', false)
    }
  },
  async getDirectionGenerale({ commit }, id) {
    commit('setLoading', true)
    try {
      const { data } = await api.get(`/direction-generale/${id}`)
      commit('setItem', data)
      commit('setLoading', false)
    } catch (error) {
      commit('setError', error)
      commit('setLoading', false)
    }
  },
  async createDirectionGenerale({ commit }, payload) {
    commit('setLoading', true)
    try {
      const { data } = await api.post('/direction-generale/', payload)
      commit('addItem', data)
      commit('setLoading', false)
    } catch (error) {
      commit('setError', error)
      commit('setLoading', false)
    }
  },
  async updateDirectionGenerale({ commit }, { id, payload }) {
    commit('setLoading', true)
    try {
      const { data } = await api.put(`/direction-generale/${id}`, payload)
      commit('updateItem', data)
      commit('setLoading', false)
    } catch (error) {
      commit('setError', error)
      commit('setLoading', false)
    }
  },
  async deleteDirectionGenerale({ commit }, id) {
    commit('setLoading', true)
    try {
      await api.delete(`/direction-generale/${id}`)
      commit('removeItem', id)
      commit('setLoading', false)
    } catch (error) {
      commit('setError', error)
      commit('setLoading', false)
    }
  },
  
  // Nouvelles actions pour la gestion des directeurs "current"
  async fetchCurrentDirectionGeneraleByEntity({ commit }, entityId) {
    commit('setLoading', true)
    try {
      const { data } = await api.get(`/direction-generale/entity/${entityId}/current`)
      commit('setItems', data)
      commit('setLoading', false)
      return data
    } catch (error) {
      commit('setError', error)
      commit('setLoading', false)
      throw error
    }
  },
  
  async setDirectorAsCurrent({ commit }, directorId) {
    commit('setLoading', true)
    try {
      const { data } = await api.put(`/direction-generale/${directorId}/set-current`)
      commit('updateItem', data)
      commit('setLoading', false)
      return data
    } catch (error) {
      commit('setError', error)
      commit('setLoading', false)
      throw error
    }
  },
  
  async setDirectorAsCurrentByPosition({ commit }, { entityId, position, directorId }) {
    commit('setLoading', true)
    try {
      const { data } = await api.put(`/direction-generale/entity/${entityId}/position/${encodeURIComponent(position)}/set-current/${directorId}`)
      commit('updateItem', data)
      commit('setLoading', false)
      return data
    } catch (error) {
      commit('setError', error)
      commit('setLoading', false)
      throw error
    }
  },
  
  async fetchDirectionGeneraleWithCurrentFilter({ commit }, { entityId, isCurrentOnly = false, ...params }) {
    commit('setLoading', true)
    try {
      const queryParams = { ...params }
      if (entityId) queryParams.entity_id = entityId
      if (isCurrentOnly) queryParams.is_current_director = true
      
      const { data } = await api.get('/direction-generale/', { params: queryParams })
      commit('setItems', data.items || data)
      commit('setLoading', false)
      return data
    } catch (error) {
      commit('setError', error)
      commit('setLoading', false)
      throw error
    }
  }
}

const mutations = {
  setItems(state, items) {
    state.items = items
  },
  setItem(state, item) {
    state.item = item
  },
  addItem(state, item) {
    state.items.push(item)
  },
  updateItem(state, item) {
    const idx = state.items.findIndex(i => i.id === item.id)
    if (idx !== -1) state.items.splice(idx, 1, item)
  },
  removeItem(state, id) {
    state.items = state.items.filter(i => i.id !== id)
  },
  setLoading(state, loading) {
    state.loading = loading
  },
  setError(state, error) {
    state.error = error
  },
  
  // Nouvelles mutations pour la gestion des directeurs "current"
  updateCurrentStatus(state, { entityId, position, newCurrentId }) {
    // Désactiver tous les directeurs actuels de cette position pour cette entité
    state.items.forEach(item => {
      if (item.entity_id === entityId && item.position === position) {
        item.is_current_director = false
      }
    })
    
    // Activer le nouveau directeur current
    if (newCurrentId) {
      const newCurrentDirector = state.items.find(item => item.id === newCurrentId)
      if (newCurrentDirector) {
        newCurrentDirector.is_current_director = true
      }
    }
  },
  
  updateMultipleItems(state, items) {
    items.forEach(item => {
      const idx = state.items.findIndex(i => i.id === item.id)
      if (idx !== -1) {
        state.items.splice(idx, 1, item)
      }
    })
  },
  
  clearError(state) {
    state.error = null
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
