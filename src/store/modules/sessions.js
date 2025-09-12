import api from '@/services/api'

const state = {
  sessions: [],
  session: null,
  sessionsByEntity: [],
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
  
  SET_SESSIONS(state, sessions) {
    state.sessions = sessions
  },
  
  SET_SESSION(state, session) {
    state.session = session
  },
  
  SET_SESSIONS_BY_ENTITY(state, sessions) {
    state.sessionsByEntity = sessions
  },
  
  SET_PAGINATION(state, pagination) {
    state.pagination = pagination
  },
  
  ADD_SESSION(state, session) {
    state.sessions.push(session)
  },
  
  REMOVE_SESSION(state, sessionId) {
    state.sessions = state.sessions.filter(session => session.id !== sessionId)
  }
}

const actions = {
  fetchSessions({ commit }, { page = 1, limit = 10, search = '', entity_id = null, board_council_id = null, type = null, session_mode = null, date = null } = {}) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const params = new URLSearchParams({ page, limit })
      if (search) params.append('search', search)
      if (entity_id) params.append('entity_id', entity_id)
      if (board_council_id) params.append('board_council_id', board_council_id)
      if (type) params.append('type', type)
      if (session_mode) params.append('session_mode', session_mode)
      if (date) params.append('date', date)
      
      api.get(`/entreprise/sessions/?${params}`)
        .then((response) => {
          const data = response.data
          // Support pour différents formats de réponse
          const sessions = data.sessions || data.items || []
          const pagination = {
            total_items: data.total_items || data.total || 0,
            total_pages: data.total_pages || Math.ceil((data.total || 0) / limit),
            current_page: data.current_page || data.page || page,
            has_next: data.has_next || data.current_page < data.total_pages,
            has_previous: data.has_previous || data.current_page > 1
          }
          
          commit('SET_SESSIONS', sessions)
          commit('SET_PAGINATION', pagination)
          commit('SET_LOADING', false)
          
          // Retourner le format attendu par les composants
          resolve({
            items: sessions,
            ...pagination
          })
        })
        .catch((error) => {
          console.error('Erreur API sessions:', error)
          const message = error.response?.data?.detail || 'Erreur lors de la récupération des sessions'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error)
        })
    })
  },

  fetchSessionById({ commit }, sessionId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get(`/entreprise/sessions/${sessionId}/`)
        .then((response) => {
          commit('SET_SESSION', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API session by ID:', error)
          const message = error.response?.data?.detail || 'Erreur lors de la récupération de la session'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  fetchSessionsByEntity({ commit }, { entityId, page = 1, limit = 10 }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get(`/entreprise/sessions/entity/${entityId}/?page=${page}&limit=${limit}`)
        .then((response) => {
          commit('SET_SESSIONS_BY_ENTITY', response.data.sessions)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API sessions by entity:', error)
          const message = error.response?.data?.detail || 'Erreur lors de la récupération des sessions par entité'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  createSession({ commit }, formData) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/entreprise/sessions/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then((response) => {
          commit('ADD_SESSION', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API create session:', error)
          const message = error.response?.data?.detail || 'Erreur lors de la création de la session'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  updateSession({ commit }, { id, data }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      // Déterminer le type de contenu en fonction du type de données
      const isFormData = data instanceof FormData
      const headers = isFormData 
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' }
      
      api.put(`/entreprise/sessions/${id}/`, data, { headers })
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API update session:', error)
          const message = error.response?.data?.detail || 'Erreur lors de la mise à jour de la session'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  updateSessionWithParticipants({ commit }, { id, formData }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.put(`/entreprise/sessions/${id}/with-participants`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API update session with participants:', error)
          const message = error.response?.data?.detail || 'Erreur lors de la mise à jour de la session'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  deleteSession({ commit }, sessionId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.delete(`/entreprise/sessions/${sessionId}/`)
        .then((response) => {
          commit('REMOVE_SESSION', sessionId)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API delete session:', error)
          const message = error.response?.data?.detail || 'Erreur lors de la suppression de la session'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  deleteSessions({ commit }, ids) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/entreprise/sessions/delete/', { ids })
        .then((response) => {
          ids.forEach(id => commit('REMOVE_SESSION', id))
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la suppression des sessions'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  // Actions pour modifier le statut des sessions
  updateSessionStatus({ commit }, { sessionId, status }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.patch(`/entreprise/sessions/${sessionId}/status/`, { status })
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API update session status:', error)
          const message = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'Erreur lors de la mise à jour du statut'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  togglePVRegistration({ commit }, sessionId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.patch(`/entreprise/sessions/${sessionId}/toggle-pv`)
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API toggle PV:', error)
          const message = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'Erreur lors de la modification du statut PV'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  uploadAttendanceList({ commit }, { sessionId, file }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const formData = new FormData()
      formData.append('file', file)
      
      api.post(`/entreprise/sessions/${sessionId}/upload-attendance`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API upload attendance:', error)
          const message = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'Erreur lors de l\'upload de la liste de présence'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  uploadPVFile({ commit }, { sessionId, file }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const formData = new FormData()
      formData.append('file', file)
      
      api.post(`/entreprise/sessions/${sessionId}/upload-pv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API upload PV:', error)
          const message = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'Erreur lors de l\'upload du PV'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  // Actions pour la gestion des participants
  fetchParticipants({ commit }, sessionId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      // Récupérer la session avec ses participants
      api.get(`/entreprise/sessions/${sessionId}`)
        .then((response) => {
          commit('SET_LOADING', false)
          // Retourner les participants de la session
          const participants = response.data.participants || []
          resolve(participants)
        })
        .catch((error) => {
          console.error('Erreur API get participants:', error)
          const message = error.response?.data?.detail || 'Erreur lors de la récupération des participants'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  addParticipant({ commit }, { sessionId, participant }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post(`/entreprise/sessions/${sessionId}/participants/`, participant)
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API add participant:', error)
          const message = error.response?.data?.detail || 'Erreur lors de l\'ajout du participant'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  removeParticipant({ commit }, { sessionId, participantId }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.delete(`/entreprise/sessions/${sessionId}/participants/${participantId}/`)
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API remove participant:', error)
          const message = error.response?.data?.detail || 'Erreur lors de la suppression du participant'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  inviteParticipant({ commit }, { sessionId, participantId }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post(`/entreprise/sessions/${sessionId}/participants/${participantId}/invite/`)
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API invite participant:', error)
          const message = error.response?.data?.detail || 'Erreur lors de l\'invitation du participant'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  // Télécharger tous les PV d'un conseil d'administration
  downloadAllPVFiles({ commit }, boardCouncilId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get(`/entreprise/sessions/board-council/${boardCouncilId}/download-all-pv`, {
        responseType: 'blob'
      })
        .then((response) => {
          commit('SET_LOADING', false)
          
          // Créer un lien de téléchargement
          const blob = new Blob([response.data], { type: 'application/zip' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          
          // Extraire le nom du fichier de l'en-tête ou utiliser un nom par défaut
          const contentDisposition = response.headers['content-disposition']
          let filename = 'PV_Archive.zip'
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
            if (filenameMatch) {
              filename = filenameMatch[1]
            }
          }
          
          link.download = filename
          document.body.appendChild(link)
          link.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(link)
          
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API download all PV:', error)
          const message = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'Erreur lors du téléchargement des PV'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  // Obtenir les statistiques des sessions
  fetchSessionStatistics({ commit }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.get('/entreprise/sessions/statistics/upcoming')
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API session statistics:', error)
          const message = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'Erreur lors de la récupération des statistiques'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  },

  // Déclencher l'envoi des rappels de sessions
  sendSessionReminders({ commit }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/entreprise/sessions/reminders/send')
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          console.error('Erreur API send reminders:', error)
          const message = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'Erreur lors de l\'envoi des rappels'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(new Error(message))
        })
    })
  }
}

const getters = {
  sessions: state => state.sessions,
  session: state => state.session,
  sessionsByEntity: state => state.sessionsByEntity,
  loading: state => state.loading,
  error: state => state.error,
  pagination: state => state.pagination,
  
  getSessionById: (state) => (id) => {
    return state.sessions.find(session => session.id === id)
  },
  
  getSessionsByType: (state) => (type) => {
    return state.sessions.filter(session => session.type === type)
  },
  
  getSessionsByMode: (state) => (mode) => {
    return state.sessions.filter(session => session.session_mode === mode)
  },
  
  onlineSessions: state => state.sessions.filter(session => session.session_mode === 'En ligne'),
  
  upcomingSessions: state => state.sessions.filter(session => {
    const now = new Date()
    const sessionDate = new Date(session.session_date)
    return sessionDate > now
  }),
  
  registeredPVSessions: state => state.sessions.filter(session => session.pv_registered),
  
  sessionsCount: state => state.sessions.length,
  
  hasSessions: state => state.sessions.length > 0
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
