import api from '@/services/api'

const state = {
  permissions: [],
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
  
  SET_PERMISSIONS(state, permissions) {
    state.permissions = permissions
  },
  
  SET_PAGINATION(state, pagination) {
    state.pagination = pagination
  },
  
  ADD_PERMISSION(state, permission) {
    state.permissions.push(permission)
  },
  
  UPDATE_PERMISSION(state, updatedPermission) {
    const index = state.permissions.findIndex(permission => permission.id === updatedPermission.id)
    if (index !== -1) {
      state.permissions.splice(index, 1, updatedPermission)
    }
  },
  
  REMOVE_PERMISSION(state, permissionId) {
    state.permissions = state.permissions.filter(permission => permission.id !== permissionId)
  }
}

const actions = {
  fetchPermissions({ commit }, { page = 1, limit = 10, search = '' } = {}) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get(`/permissions?page=${page}&limit=${limit}&search=${search}`)
        .then((response) => {
          const { permissions, total_items, total_pages, current_page, has_next, has_previous } = response.data
          commit('SET_PERMISSIONS', permissions)
          commit('SET_PAGINATION', { total_items, total_pages, current_page, has_next, has_previous })
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération des permissions'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  createPermission({ commit }, permissionData) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/permissions', permissionData)
        .then((response) => {
          commit('ADD_PERMISSION', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la création de la permission'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  updatePermission({ commit }, permissionData) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.put(`/permissions/${permissionData.id}`, permissionData)
        .then((response) => {
          commit('UPDATE_PERMISSION', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la mise à jour de la permission'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  deletePermission({ commit }, permissionId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.delete(`/permissions/${permissionId}`)
        .then((response) => {
          commit('REMOVE_PERMISSION', permissionId)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la suppression de la permission'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  deletePermissions({ commit }, ids) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/permissions/delete', { ids })
        .then((response) => {
          // Supprimer les permissions supprimées du state
          ids.forEach(id => commit('REMOVE_PERMISSION', id))
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la suppression des permissions'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  }
}

const getters = {
  permissions: state => state.permissions,
  loading: state => state.loading,
  error: state => state.error,
  pagination: state => state.pagination,
  
  getPermissionById: (state) => (id) => {
    return state.permissions.find(permission => permission.id === id)
  },
  
  getPermissionByName: (state) => (name) => {
    return state.permissions.find(permission => permission.name === name)
  },
  
  permissionsCount: state => state.permissions.length,
  
  hasPermissions: state => state.permissions.length > 0
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
