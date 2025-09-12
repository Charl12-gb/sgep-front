import api from '@/services/api'

const state = {
  items: [],
  item: null,
  loading: false,
  error: null
}

const getters = {
  effectifsList: state => state.items,
  effectifItem: state => state.item,
  effectifsLoading: state => state.loading,
  effectifsError: state => state.error
}

const actions = {
  async fetchEffectifs({ commit }, params) {
    commit('setLoading', true)
    try {
      const { data } = await api.get('/entreprise/effectifs/', { params })
      commit('setItems', data.items || data)
      commit('setLoading', false)
    } catch (error) {
      commit('setError', error)
      commit('setLoading', false)
    }
  },
  async fetchEffectifsByEntity({ commit }, entityId) {
    commit('setLoading', true)
    try {
      const { data } = await api.get(`/entreprise/effectifs/entity/${entityId}`)
      commit('setItems', data)
      commit('setLoading', false)
    } catch (error) {
      commit('setError', error)
      commit('setLoading', false)
    }
  },
  async getEffectif({ commit }, id) {
    commit('setLoading', true)
    try {
      const { data } = await api.get(`/entreprise/effectifs/${id}`)
      commit('setItem', data)
      commit('setLoading', false)
    } catch (error) {
      commit('setError', error)
      commit('setLoading', false)
    }
  },
  async createEffectif({ commit }, payload) {
    commit('setLoading', true)
    try {
      const { data } = await api.post('/entreprise/effectifs/', payload)
      commit('addItem', data)
      commit('setLoading', false)
    } catch (error) {
      commit('setError', error)
      commit('setLoading', false)
    }
  },
  async updateEffectif({ commit }, { id, payload }) {
    commit('setLoading', true)
    try {
      const { data } = await api.put(`/entreprise/effectifs/${id}`, payload)
      commit('updateItem', data)
      commit('setLoading', false)
    } catch (error) {
      commit('setError', error)
      commit('setLoading', false)
    }
  },
  async deleteEffectif({ commit }, id) {
    commit('setLoading', true)
    try {
      await api.delete(`/entreprise/effectifs/${id}`)
      commit('removeItem', id)
      commit('setLoading', false)
    } catch (error) {
      commit('setError', error)
      commit('setLoading', false)
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
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
