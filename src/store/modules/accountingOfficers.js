import api from '@/services/api'

const state = {
  accountingOfficers: [],
  accountingOfficer: null,
  accountingOfficersByEntity: [],
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
  
  SET_ACCOUNTING_OFFICERS(state, accountingOfficers) {
    state.accountingOfficers = accountingOfficers
  },
  
  SET_ACCOUNTING_OFFICER(state, accountingOfficer) {
    state.accountingOfficer = accountingOfficer
  },
  
  SET_ACCOUNTING_OFFICERS_BY_ENTITY(state, accountingOfficers) {
    state.accountingOfficersByEntity = accountingOfficers
  },
  
  SET_PAGINATION(state, pagination) {
    state.pagination = pagination
  },
  
  ADD_ACCOUNTING_OFFICER(state, accountingOfficer) {
    state.accountingOfficers.push(accountingOfficer)
  },
  
  UPDATE_ACCOUNTING_OFFICER(state, updatedAccountingOfficer) {
    const index = state.accountingOfficers.findIndex(ao => ao.id === updatedAccountingOfficer.id)
    if (index !== -1) {
      state.accountingOfficers.splice(index, 1, updatedAccountingOfficer)
    }
  },
  
  REMOVE_ACCOUNTING_OFFICER(state, accountingOfficerId) {
    state.accountingOfficers = state.accountingOfficers.filter(ao => ao.id !== accountingOfficerId)
  }
}

const actions = {
  fetchAccountingOfficers({ commit }, { page = 1, limit = 10, search = '', entity_id = null } = {}) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const params = new URLSearchParams({ page, limit })
      if (search) params.append('search', search)
      if (entity_id) params.append('entity_id', entity_id)
      
      api.get(`/accounting-officers?${params}`)
        .then((response) => {
          const { items, total_items, total_pages, current_page, has_next, has_prev } = response.data
          commit('SET_ACCOUNTING_OFFICERS', items)
          commit('SET_PAGINATION', { total_items, total_pages, current_page, has_next, has_prev })
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération des responsables comptables'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  fetchAccountingOfficerById({ commit }, accountingOfficerId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get(`/accounting-officers/${accountingOfficerId}`)
        .then((response) => {
          commit('SET_ACCOUNTING_OFFICER', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération du responsable comptable'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  fetchAccountingOfficersByEntity({ commit }, { entityId, page = 1, limit = 10 }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get(`/accounting-officers/entity/${entityId}?page=${page}&limit=${limit}`)
        .then((response) => {
          commit('SET_ACCOUNTING_OFFICERS_BY_ENTITY', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération des responsables comptables par entité'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  createAccountingOfficer({ commit }, accountingOfficerData) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/accounting-officers', accountingOfficerData)
        .then((response) => {
          commit('ADD_ACCOUNTING_OFFICER', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la création du responsable comptable'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  updateAccountingOfficer({ commit }, accountingOfficerData) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.put(`/accounting-officers/${accountingOfficerData.id}`, accountingOfficerData)
        .then((response) => {
          commit('UPDATE_ACCOUNTING_OFFICER', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la mise à jour du responsable comptable'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  deleteAccountingOfficer({ commit }, accountingOfficerId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.delete(`/accounting-officers/${accountingOfficerId}`)
        .then((response) => {
          commit('REMOVE_ACCOUNTING_OFFICER', accountingOfficerId)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la suppression du responsable comptable'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  deleteAccountingOfficers({ commit }, ids) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/accounting-officers/delete', { ids })
        .then((response) => {
          ids.forEach(id => commit('REMOVE_ACCOUNTING_OFFICER', id))
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la suppression des responsables comptables'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  assignAccountingOfficerToEntity({ commit }, { userId, entityId, startDate, endDate }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/accounting-officers/assign', {
        user_id: userId,
        entity_id: entityId,
        start_date: startDate,
        end_date: endDate
      })
        .then((response) => {
          commit('ADD_ACCOUNTING_OFFICER', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de l\'assignation du responsable comptable'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  terminateAccountingOfficerMandate({ commit }, accountingOfficerId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.put(`/accounting-officers/${accountingOfficerId}/terminate`)
        .then((response) => {
          commit('UPDATE_ACCOUNTING_OFFICER', response.data)
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
  }
}

const getters = {
  accountingOfficers: state => state.accountingOfficers,
  accountingOfficer: state => state.accountingOfficer,
  accountingOfficersByEntity: state => state.accountingOfficersByEntity,
  loading: state => state.loading,
  error: state => state.error,
  pagination: state => state.pagination,
  
  getAccountingOfficerById: (state) => (id) => {
    return state.accountingOfficers.find(ao => ao.id === id)
  },
  
  getAccountingOfficersByEntity: (state) => (entityId) => {
    return state.accountingOfficers.filter(ao => ao.entity_id === entityId)
  },
  
  activeAccountingOfficers: state => state.accountingOfficers.filter(ao => {
    try {
      const now = new Date()
      const endDate = new Date(ao.mandat_date_fin)
      if (isNaN(endDate.getTime())) return true // no end date means active
      return endDate > now
    } catch (e) {
      return true
    }
  }),
  
  expiredAccountingOfficers: state => state.accountingOfficers.filter(ao => {
    try {
      const now = new Date()
      const endDate = new Date(ao.mandat_date_fin)
      if (isNaN(endDate.getTime())) return false
      return endDate <= now
    } catch (e) {
      return false
    }
  }),
  
  accountingOfficersCount: state => state.accountingOfficers.length,
  
  hasAccountingOfficers: state => state.accountingOfficers.length > 0
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
