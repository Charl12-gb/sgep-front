import api from '@/services/api'

const state = {
  boardDirectors: [],
  boardDirector: null,
  boardDirectorsByEntity: [],
  expiringBoardDirectors: [],
  loading: false,
  error: null,
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    has_next: false,
    has_previous: false,
  }
}

const mutations = {
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  CLEAR_ERROR(state) {
    state.error = null
  },
  
  SET_BOARD_DIRECTORS(state, boardDirectors) {
    state.boardDirectors = boardDirectors
  },
  
  SET_BOARD_DIRECTOR(state, boardDirector) {
    state.boardDirector = boardDirector
  },
  
  SET_BOARD_DIRECTORS_BY_ENTITY(state, boardDirectors) {
    state.boardDirectorsByEntity = boardDirectors
  },
  
  SET_EXPIRING_BOARD_DIRECTORS(state, boardDirectors) {
    state.expiringBoardDirectors = boardDirectors
  },
  
  SET_PAGINATION(state, pagination) {
    state.pagination = pagination
  },
  
  ADD_BOARD_DIRECTOR(state, boardDirector) {
    state.boardDirectors.push(boardDirector)
  },
  
  UPDATE_BOARD_DIRECTOR(state, updatedBoardDirector) {
    const index = state.boardDirectors.findIndex(bd => bd.id === updatedBoardDirector.id)
    if (index !== -1) {
      state.boardDirectors.splice(index, 1, updatedBoardDirector)
    }
  },
  
  REMOVE_BOARD_DIRECTOR(state, boardDirectorId) {
    state.boardDirectors = state.boardDirectors.filter(bd => bd.id !== boardDirectorId)
  }
}

const actions = {
  fetchBoardDirectors({ commit }, { page = 1, limit = 10, search = '', entity_id = null } = {}) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const params = new URLSearchParams({ page, limit })
      if (search) params.append('search', search)
      if (entity_id) params.append('entity_id', entity_id)
      
      api.get(`/board-directors?${params}`)
        .then((response) => {
          const { board_directors, total_items, total_pages, current_page, has_next, has_previous } = response.data
          commit('SET_BOARD_DIRECTORS', board_directors)
          commit('SET_PAGINATION', { total_items, total_pages, current_page, has_next, has_previous })
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération des administrateurs'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  fetchBoardDirectorById({ commit }, boardDirectorId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get(`/board-directors/${boardDirectorId}`)
        .then((response) => {
          commit('SET_BOARD_DIRECTOR', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération de l\'administrateur'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  fetchBoardDirectorsByEntity({ commit }, { entityId, page = 1, limit = 10 }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get(`/board-directors/entity/${entityId}?page=${page}&limit=${limit}`)
        .then((response) => {
          commit('SET_BOARD_DIRECTORS_BY_ENTITY', response.data.board_directors)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération des administrateurs par entité'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  fetchExpiringBoardDirectors({ commit }, { days = 30 } = {}) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get(`/board-directors/expiring?days=${days}`)
        .then((response) => {
          commit('SET_EXPIRING_BOARD_DIRECTORS', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération des mandats expirants'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  fetchBoardDirectorsByCouncil({ commit }, { boardCouncilId }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get(`/board-directors/board-council/${boardCouncilId}`)
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération des membres du conseil'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  createBoardDirector({ commit }, boardDirectorData) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/board-directors', boardDirectorData)
        .then((response) => {
          commit('ADD_BOARD_DIRECTOR', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la création de l\'administrateur'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  updateBoardDirector({ commit }, { id, payload }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      api.put(`/board-directors/${id}`, payload)
        .then((response) => {
          commit('UPDATE_BOARD_DIRECTOR', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la mise à jour de l\'administrateur'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  deleteBoardDirector({ commit }, boardDirectorId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.delete(`/board-directors/${boardDirectorId}`)
        .then((response) => {
          commit('REMOVE_BOARD_DIRECTOR', boardDirectorId)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la suppression de l\'administrateur'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  deleteBoardDirectors({ commit }, ids) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/board-directors/delete', { ids })
        .then((response) => {
          ids.forEach(id => commit('REMOVE_BOARD_DIRECTOR', id))
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la suppression des administrateurs'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  renewBoardDirectorMandate({ commit }, { boardDirectorId, newEndDate }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.put(`/board-directors/${boardDirectorId}/renew`, { end_date: newEndDate })
        .then((response) => {
          commit('UPDATE_BOARD_DIRECTOR', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors du renouvellement du mandat'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  terminateBoardDirectorMandate({ commit }, boardDirectorId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.put(`/board-directors/${boardDirectorId}/terminate`)
        .then((response) => {
          commit('UPDATE_BOARD_DIRECTOR', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la fin du mandat'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  replaceBoardDirector({ commit }, { directorId, replacementData }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post(`/board-directors/${directorId}/replace`, replacementData)
        .then((response) => {
          // Le nouveau membre remplace l'ancien
          commit('ADD_BOARD_DIRECTOR', response.data)
          // Mettre à jour l'ancien membre (il sera marqué comme "replaced")
          // On peut optionnellement recharger la liste ou mettre à jour manuellement
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors du remplacement du membre'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  fetchBoardDirectorReplacements({ commit }, directorId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get(`/board-directors/${directorId}/replacements`)
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération de l\'historique des remplacements'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  }
}

const getters = {
  boardDirectors: state => state.boardDirectors,
  boardDirector: state => state.boardDirector,
  boardDirectorsByEntity: state => state.boardDirectorsByEntity,
  expiringBoardDirectors: state => state.expiringBoardDirectors,
  loading: state => state.loading,
  error: state => state.error,
  pagination: state => state.pagination,
  
  getBoardDirectorById: (state) => (id) => {
    return state.boardDirectors.find(bd => bd.id === id)
  },
  
  getBoardDirectorsByEntity: (state) => (entityId) => {
    return state.boardDirectors.filter(bd => bd.entity_id === entityId)
  },
  
  getCommitteeMembers: (state) => (entityId) => {
    return state.boardDirectors.filter(bd => bd.entity_id === entityId && bd.is_committee)
  },
  
  activeBoardDirectors: state => state.boardDirectors.filter(bd => {
    const now = new Date()
    const endDate = new Date(bd.end_date)
    return endDate > now
  }),
  
  expiredBoardDirectors: state => state.boardDirectors.filter(bd => {
    const now = new Date()
    const endDate = new Date(bd.end_date)
    return endDate <= now
  }),
  
  boardDirectorsCount: state => state.boardDirectors.length,
  
  hasBoardDirectors: state => state.boardDirectors.length > 0,

  // Getters pour les remplacements
  activeBoardDirectorsByStatus: state => state.boardDirectors.filter(bd => bd.status === 'active'),
  
  replacedBoardDirectors: state => state.boardDirectors.filter(bd => bd.status === 'replaced'),
  
  inactiveBoardDirectors: state => state.boardDirectors.filter(bd => bd.status === 'inactive'),
  
  getBoardDirectorsByStatus: (state) => (status) => {
    return state.boardDirectors.filter(bd => bd.status === status)
  },
  
  getReplacementChain: (state) => (directorId) => {
    // Récupère la chaîne de remplacements pour un membre donné
    const chain = []
    let current = state.boardDirectors.find(bd => bd.id === directorId)
    
    // Remonter la chaîne des remplacements (qui a remplacé qui)
    while (current && current.replaces_id) {
      const replaced = state.boardDirectors.find(bd => bd.id === current.replaces_id)
      if (replaced) {
        chain.unshift(replaced) // Ajouter au début pour avoir l'ordre chronologique
        current = replaced
      } else {
        break
      }
    }
    
    // Redescendre la chaîne (qui remplace qui)
    current = state.boardDirectors.find(bd => bd.id === directorId)
    if (current) {
      chain.push(current)
      
      while (current && current.replaced_by_id) {
        const replacement = state.boardDirectors.find(bd => bd.id === current.replaced_by_id)
        if (replacement) {
          chain.push(replacement)
          current = replacement
        } else {
          break
        }
      }
    }
    
    return chain
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
