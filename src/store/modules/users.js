import api from '@/services/api'

const state = {
  users: [],
  all_users: [],
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
  
  SET_USERS(state, users) {
    state.users = Array.isArray(users) ? users : []
  },

  SET_ALL_USERS(state, users) {
    state.all_users = Array.isArray(users) ? users : []
  },

  SET_PAGINATION(state, pagination) {
    state.pagination = pagination
  },
  
  ADD_USER(state, user) {
    state.users.push(user)
  },
  
  UPDATE_USER(state, updatedUser) {
    const index = state.users.findIndex(user => user.id === updatedUser.id)
    if (index !== -1) {
      state.users.splice(index, 1, updatedUser)
    }
  },
  
  REMOVE_USER(state, userId) {
    state.users = state.users.filter(user => user.id !== userId)
  }
}

const actions = {
  fetchUsers({ commit }, { page = 1, limit = 10, search = '' } = {}) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get(`/users?page=${page}&limit=${limit}&search=${search}`)
        .then((response) => {          
          // L'API peut retourner différentes structures selon le backend
          let users = []
          let pagination = {}
          
          if (response.data) {
            // Structure PaginatedResponse
            if (response.data.items) {
              users = response.data.items
              pagination = {
                total_items: response.data.total || 0,
                total_pages: response.data.pages || 1,
                current_page: response.data.page || 1,
                has_next: response.data.has_next || false,
                has_previous: response.data.has_prev || false
              }
            }
            // Structure simple avec users
            else if (response.data.users) {
              users = response.data.users
              pagination = {
                total_items: response.data.total_items || 0,
                total_pages: response.data.total_pages || 1,
                current_page: response.data.current_page || 1,
                has_next: response.data.has_next || false,
                has_previous: response.data.has_previous || false
              }
            }
            // Liste directe d'utilisateurs
            else if (Array.isArray(response.data)) {
              users = response.data
              pagination = {
                total_items: response.data.length,
                total_pages: 1,
                current_page: 1,
                has_next: false,
                has_previous: false
              }
            }
          }          
          commit('SET_USERS', users || [])
          commit('SET_PAGINATION', pagination)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération des utilisateurs'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  fetchAllUsers({ commit }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')      
      api.get('/users/all')
        .then((response) => {
          const users = Array.isArray(response.data) ? response.data : []
          commit('SET_ALL_USERS', users)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération des utilisateurs'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data || error)
        })
    })
  },

  // Action spécifique pour la recherche d'utilisateurs (retourne directement les utilisateurs)
  searchUsers({ commit }, { search = '' } = {}) {
    return new Promise((resolve, reject) => {
      // Ne pas commit les mutations pour ne pas affecter l'état global
      api.get(`/users?page=1&limit=20&search=${search}`)
        .then((response) => {
          const { users } = response.data
          resolve(users || [])
        })
        .catch((error) => {
          console.error('Erreur lors de la recherche d\'utilisateurs:', error)
          reject(error?.response?.data || error)
        })
    })
  },

  fetchUsersByRole({ commit }, { role, page = 1, limit = 10, search = '' }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get(`/users/role/${role}?page=${page}&limit=${limit}&search=${search}`)
        .then((response) => {
          const { users, total_items, total_pages, current_page, has_next, has_previous } = response.data
          commit('SET_USERS', users)
          commit('SET_PAGINATION', { total_items, total_pages, current_page, has_next, has_previous })
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération des utilisateurs par rôle'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  createUser({ commit }, userData) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/users', userData)
        .then((response) => {
          commit('ADD_USER', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la création de l\'utilisateur'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  updateUser({ commit }, userData) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.put(`/users/${userData.id}`, userData)
        .then((response) => {
          commit('UPDATE_USER', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la mise à jour de l\'utilisateur'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  deleteUser({ commit }, userId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.delete(`/users/${userId}`)
        .then((response) => {
          commit('REMOVE_USER', userId)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la suppression de l\'utilisateur'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  deleteUsers({ commit }, ids) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/users/delete', { ids })
        .then((response) => {
          // Supprimer les utilisateurs supprimés du state
          ids.forEach(id => commit('REMOVE_USER', id))
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la suppression des utilisateurs'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  changeUserPassword({ commit }, { userId, passwordData }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.put(`/users/${userId}/change-password`, passwordData)
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors du changement de mot de passe'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  activateUser({ commit }, userId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.put(`/users/${userId}/activate`)
        .then((response) => {
          commit('UPDATE_USER', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de l\'activation de l\'utilisateur'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  deactivateUser({ commit }, userId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.put(`/users/${userId}/deactivate`)
        .then((response) => {
          commit('UPDATE_USER', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la désactivation de l\'utilisateur'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  getUserById({ commit }, userId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get(`/users/${userId}`)
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération de l\'utilisateur'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  }
}

const getters = {
  users: state => state.users || [],
  all_users: state => state.all_users || [],
  loading: state => state.loading,
  error: state => state.error,
  pagination: state => state.pagination,
  
  getUserById: (state) => (id) => {
    return (state.users || []).find(user => user.id === id)
  },
  
  getUsersByRole: (state) => (roleName) => {
    return (state.users || []).filter(user => user.role?.name === roleName)
  },
  
  activeUsers: state => (state.users || []).filter(user => user.is_active),
  
  inactiveUsers: state => (state.users || []).filter(user => !user.is_active),
  
  usersCount: state => (state.users || []).length,
  
  hasUsers: state => (state.users || []).length > 0
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
