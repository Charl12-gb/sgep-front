import api from '@/services/api'

const state = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('access_token') ?? null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
  error: null,
  users: [],
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
  
  SET_USER(state, user) {
    if (user && typeof user === 'object') {
      state.user = user
      state.isAuthenticated = true
      state.error = null
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      console.error("L'utilisateur n'est pas un objet valide.")
    }
  },
  
  SET_TOKEN(state, token) {
    state.token = token
    if (token) {
      localStorage.setItem('access_token', token)
      state.isAuthenticated = true
    } else {
      localStorage.removeItem('access_token')
      state.isAuthenticated = false
    }
  },
  
  SET_USERS(state, users) {
    state.users = users
  },
  
  SET_USER_PAGINATION(state, pagination) {
    state.pagination = pagination
  },
  
  CLEAR_AUTH(state) {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    state.loading = false
    state.error = null
    state.users = []
    state.pagination = {
      current_page: 1,
      total_pages: 1,
      total_items: 0,
      has_next: false,
      has_previous: false,
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }
}

const actions = {
  login({ commit }, credentials) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      // Créer les données pour OAuth2PasswordRequestForm
      const formData = new URLSearchParams()
      formData.append('username', credentials.username)
      formData.append('password', credentials.password)
      
      api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then((response) => {
        const { access_token, user } = response.data
        
        commit('SET_TOKEN', access_token)
        commit('SET_USER', user)
        commit('SET_LOADING', false)
        
        resolve({ success: true, user, data: response.data })
      })
      .catch((error) => {
        const message = error.response?.data?.detail || 'Erreur de connexion'
        commit('SET_ERROR', message)
        commit('SET_LOADING', false)
        reject(error?.response?.data)
      })
    })
  },

  loadUser({ commit, state }) {
    if (!state.token) return Promise.resolve(null)
    
    return new Promise((resolve, reject) => {
      api.get('/auth/me')
        .then((response) => {
          commit('SET_USER', response.data)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Failed to load user:', error.message)
          commit('CLEAR_AUTH')
          reject(error?.response?.data)
        })
    })
  },

  logout({ commit }) {
    return new Promise((resolve, reject) => {
      api.post('/auth/logout')
        .then((response) => {
          commit('CLEAR_AUTH')
          resolve(response.data)
        })
        .catch((error) => {
          commit('CLEAR_AUTH')
          reject(error?.response?.data)
        })
    })
  },

  register({ commit }, userData) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/auth/register', userData)
        .then((response) => {
          const { access_token, user } = response.data
          
          commit('SET_TOKEN', access_token)
          commit('SET_USER', user)
          commit('SET_LOADING', false)
          
          resolve({ success: true, user, data: response.data })
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de l\'inscription'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  forgotPassword({ commit }, email) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/auth/forgot-password', { email })
        .then((response) => {
          commit('SET_LOADING', false)
          resolve({ success: true, message: 'Email de réinitialisation envoyé', data: response.data })
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de l\'envoi de l\'email'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  resetPassword({ commit }, data) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/auth/reset-password', data)
        .then((response) => {
          commit('SET_LOADING', false)
          resolve({ success: true, message: 'Mot de passe réinitialisé avec succès', data: response.data })
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la réinitialisation'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  updateProfile({ commit }, profileData) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.put('/auth/profile', profileData)
        .then((response) => {
          commit('SET_USER', response.data)
          commit('SET_LOADING', false)
          resolve({ success: true, user: response.data, data: response.data })
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la mise à jour du profil'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  changePassword({ commit }, passwordData) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.put(`/users/${passwordData.id}/change-password`, passwordData)
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

  fetchUserByRole({ commit }, { role, page = 1, limit = 10, search = '' }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      
      api.get(`/users/role/${role}?page=${page}&limit=${limit}&search=${search}`)
        .then((response) => {
          const { users, total_items, total_pages, current_page, has_next, has_previous } = response.data
          commit('SET_USERS', users)
          commit('SET_USER_PAGINATION', { total_items, total_pages, current_page, has_next, has_previous })
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  updateUser({ commit }, userData) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      
      api.put(`/users/${userData.id}`, userData)
        .then((response) => {
          commit('SET_USER', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  currentUser({ commit }) {
    return new Promise((resolve, reject) => {
      api.get('/users/me')
        .then((response) => {
          commit('SET_USER', response.data)
          resolve(response.data)
        })
        .catch((error) => {
          reject(error?.response?.data)
        })
    })
  },

  deleteUser({ commit }, ids) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      
      api.post('/users/delete', ids)
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  registerWithBoardCouncil({ commit }, { userData, boardCouncilId }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      api.post(`/auth/register_new_member`, { ...userData, boardCouncilId })
        .then((response) => {
          commit('SET_USER', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.detail || 'Erreur lors de l\'inscription avec BoardCouncil')
          commit('SET_LOADING', false)
          reject(error)
        })
    })
  },

  registerWithBoardDirector({ commit }, { userData, boardDirectorId }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      api.post(`/auth/with-board-director`, { ...userData, board_director_id: boardDirectorId })
        .then((response) => {
          commit('SET_USER', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.detail || 'Erreur lors de l\'inscription avec BoardDirector')
          commit('SET_LOADING', false)
          reject(error)
        })
    })
  }
}

const getters = {
  // Getters principaux
  user: state => state.user,
  token: state => state.token,
  isAuthenticated: state => state.isAuthenticated,
  loading: state => state.loading,
  error: state => state.error,
  users: state => state.users,
  pagination: state => state.pagination,
  
  // Getters pour les rôles et permissions
  userRole: state => state.user?.role,
  userPermissions: state => state.user?.permissions || [],
  
  // Getters pour vérifier les rôles
  hasRole: (state) => (roleName) => {
    return state.user?.role?.name === roleName
  },
  
  // Getters pour vérifier les permissions
  hasPermission: (state) => (permissionName) => {
    if (!state.user || !state.user.permissions) return false
    return state.user.permissions.some(permission => permission.name === permissionName)
  },
  
  hasAnyPermission: (state) => (permissionNames) => {
    if (!state.user || !state.user.permissions) return false
    return permissionNames.some(permissionName => 
      state.user.permissions.some(permission => permission.name === permissionName)
    )
  },
  
  hasAllPermissions: (state) => (permissionNames) => {
    if (!state.user || !state.user.permissions) return false
    return permissionNames.every(permissionName => 
      state.user.permissions.some(permission => permission.name === permissionName)
    )
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
