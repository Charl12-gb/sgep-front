import api from '@/services/api'

const state = () => ({
  roles: [],
  currentRole: null,
  loading: false,
  error: null,
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    has_next: false,
    has_previous: false,
  }
})

const getters = {
  allRoles: state => state.roles,
  currentRole: state => state.currentRole,
  loading: state => state.loading,
  error: state => state.error,
  pagination: state => state.pagination,
  
  getRoleById: (state) => (id) => {
    return state.roles.find(role => role.id === id)
  },
  
  getRoleByName: (state) => (name) => {
    return state.roles.find(role => role.name === name)
  },
  
  rolesCount: state => state.roles.length,
  
  hasRoles: state => state.roles.length > 0
}

const mutations = {
  SET_ROLES(state, roles) {
    state.roles = roles
  },
  
  SET_CURRENT_ROLE(state, role) {
    state.currentRole = role
  },
  
  ADD_ROLE(state, role) {
    state.roles.push(role)
  },
  
  UPDATE_ROLE(state, updatedRole) {
    const index = state.roles.findIndex(role => role.id === updatedRole.id)
    if (index !== -1) {
      state.roles.splice(index, 1, updatedRole)
    }
  },
  
  DELETE_ROLE(state, roleId) {
    state.roles = state.roles.filter(role => role.id !== roleId)
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  CLEAR_ERROR(state) {
    state.error = null
  },
  
  SET_PAGINATION(state, pagination) {
    state.pagination = pagination
  }
}

const actions = {
  fetchRoles({ commit }, { page = 1, limit = 10, search = '' } = {}) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get(`/roles?page=${page}&limit=${limit}&search=${search}`)
        .then((response) => {
          const { roles, total_items, total_pages, current_page, has_next, has_previous } = response.data
          commit('SET_ROLES', roles)
          commit('SET_PAGINATION', { total_items, total_pages, current_page, has_next, has_previous })
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération des rôles'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  createRole({ commit }, roleData) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/roles', roleData)
        .then((response) => {
          commit('ADD_ROLE', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la création du rôle'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  updateRole({ commit }, roleData) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.put(`/roles/${roleData.id}`, roleData)
        .then((response) => {
          commit('UPDATE_ROLE', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la mise à jour du rôle'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  deleteRole({ commit }, roleId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.delete(`/roles/${roleId}`)
        .then((response) => {
          commit('DELETE_ROLE', roleId)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la suppression du rôle'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  getRoleById({ commit }, roleId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get(`/roles/${roleId}`)
        .then((response) => {
          commit('SET_CURRENT_ROLE', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération du rôle'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  assignPermissionsToRole({ commit }, { roleId, permissionIds }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post(`/roles/${roleId}/permissions`, { permission_ids: permissionIds })
        .then((response) => {
          commit('UPDATE_ROLE', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de l\'assignation des permissions'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  removePermissionsFromRole({ commit }, { roleId, permissionIds }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.delete(`/roles/${roleId}/permissions`, { data: { permission_ids: permissionIds } })
        .then((response) => {
          commit('UPDATE_ROLE', response.data)
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

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}