import api from '@/services/api'

const state = {
  boardCouncils: [],
  boardCouncil: null,
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

  SET_BOARD_COUNCILS(state, boards) {
    state.boardCouncils = boards
  },

  SET_BOARD_COUNCIL(state, board) {
    state.boardCouncil = board
  },

  ADD_BOARD_COUNCIL(state, board) {
    state.boardCouncils.push(board)
  },

  UPDATE_BOARD_COUNCIL(state, updated) {
    const index = state.boardCouncils.findIndex(b => b.id === updated.id)
    if (index !== -1) state.boardCouncils.splice(index, 1, updated)
  },

  REMOVE_BOARD_COUNCIL(state, id) {
    state.boardCouncils = state.boardCouncils.filter(b => b.id !== id)
  },

  SET_PAGINATION(state, pagination) {
    state.pagination = pagination
  }
}

const actions = {
  fetchBoardCouncils({ commit }, { page = 1, limit = 10, params = {} } = {}) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    // build query string with optional params (entity_id, start_year, end_year ...)
    let qs = `?page=${page}&limit=${limit}`
    if (params) {
      if (params.entity_id) qs += `&entity_id=${params.entity_id}`
      if (params.start_year) qs += `&start_year=${params.start_year}`
      if (params.end_year) qs += `&end_year=${params.end_year}`
    }
    return api.get(`/entreprise/board-councils${qs}`)
      .then(res => {
        const { board_councils, total_items, total_pages, current_page, has_next, has_previous } = res.data
        commit('SET_BOARD_COUNCILS', board_councils)
        commit('SET_PAGINATION', { total_items, total_pages, current_page, has_next, has_previous })
        commit('SET_LOADING', false)
        return res.data
      })
      .catch(err => {
        commit('SET_ERROR', err.response?.data?.detail || 'Erreur récupération conseils')
        commit('SET_LOADING', false)
        throw err
      })
  },

  fetchBoardCouncil({ commit }, id) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    return api.get(`/entreprise/board-councils/${id}`)
      .then(res => {
        commit('SET_BOARD_COUNCIL', res.data)
        commit('SET_LOADING', false)
        return res.data
      })
      .catch(err => {
        commit('SET_ERROR', err.response?.data?.detail || 'Erreur récupération conseil')
        commit('SET_LOADING', false)
        throw err
      })
  },

  createBoardCouncil({ commit }, payloadWrapper) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    let isForm = false
    let body = payloadWrapper
    if (payloadWrapper && payloadWrapper.isForm) {
      isForm = true
      body = payloadWrapper.payload
    }
    if (body && typeof body.append === 'function') isForm = true
    const config = isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    return api.post('/entreprise/board-councils', body, config)
      .then(res => {
        commit('ADD_BOARD_COUNCIL', res.data)
        commit('SET_LOADING', false)
        return res.data
      })
      .catch(err => {
        commit('SET_ERROR', err.response?.data?.detail || 'Erreur création conseil')
        commit('SET_LOADING', false)
        throw err
      })
  },

  updateBoardCouncil({ commit }, payloadWrapper) {
    // payloadWrapper can be { id, payload, isForm } or { id, payload } or { id, payload: FormData }
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    const id = payloadWrapper.id
    let isForm = false
    let body = payloadWrapper.payload !== undefined ? payloadWrapper.payload : payloadWrapper
    if (payloadWrapper && payloadWrapper.isForm) {
      isForm = true
    }
    // also support passing FormData directly as payloadWrapper (legacy)
    if (body && typeof body.append === 'function') isForm = true
    const config = isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    return api.put(`/entreprise/board-councils/${id}`, body, config)
      .then(res => {
        commit('UPDATE_BOARD_COUNCIL', res.data)
        commit('SET_LOADING', false)
        return res.data
      })
      .catch(err => {
        commit('SET_ERROR', err.response?.data?.detail || 'Erreur mise à jour conseil')
        commit('SET_LOADING', false)
        throw err
      })
  },

  deleteBoardCouncil({ commit }, id) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    return api.delete(`/entreprise/board-councils/${id}`)
      .then(res => {
        commit('REMOVE_BOARD_COUNCIL', id)
        commit('SET_LOADING', false)
        return res.data
      })
      .catch(err => {
        commit('SET_ERROR', err.response?.data?.detail || 'Erreur suppression conseil')
        commit('SET_LOADING', false)
        throw err
      })
  },

  renewBoardCouncil({ commit }, { id, payload }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    return api.post(`/entreprise/board-councils/${id}/renew`, payload)
      .then(res => {
        commit('ADD_BOARD_COUNCIL', res.data)
        commit('SET_LOADING', false)
        return res.data
      })
      .catch(err => {
        commit('SET_ERROR', err.response?.data?.detail || 'Erreur reconduction conseil')
        commit('SET_LOADING', false)
        throw err
      })
  },

  toggleBoardCouncilStatus({ commit }, councilId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.patch(`/entreprise/board-councils/${councilId}/status`)
        .then((response) => {
          commit('UPDATE_BOARD_COUNCIL', response.data.council)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API toggle status:', error)
          const message = error.response?.data?.detail || 'Erreur lors du changement de statut'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  setBoardCouncilStatus({ commit }, { councilId, status }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.patch(`/entreprise/board-councils/${councilId}/status/${status}`)
        .then((response) => {
          commit('UPDATE_BOARD_COUNCIL', response.data.council)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API set status:', error)
          const message = error.response?.data?.detail || 'Erreur lors du changement de statut'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  }
}

const getters = {
  boardCouncils: state => state.boardCouncils,
  boardCouncil: state => state.boardCouncil,
  loading: state => state.loading,
  error: state => state.error,
  pagination: state => state.pagination,
  activeBoardCouncils: state => state.boardCouncils.filter(council => council.status === 'active'),
  inactiveBoardCouncils: state => state.boardCouncils.filter(council => council.status === 'inactive'),
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
