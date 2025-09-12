import api from '@/services/api'

const state = {
  notifications: [],
  unreadCount: 0,
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
  
  SET_NOTIFICATIONS(state, notifications) {
    state.notifications = notifications
  },
  
  SET_UNREAD_COUNT(state, count) {
    state.unreadCount = count
  },
  
  SET_PAGINATION(state, pagination) {
    state.pagination = pagination
  },
  
  ADD_NOTIFICATION(state, notification) {
    state.notifications.unshift(notification)
    if (!notification.read) {
      state.unreadCount++
    }
  },
  
  UPDATE_NOTIFICATION(state, updatedNotification) {
    const index = state.notifications.findIndex(n => n.id === updatedNotification.id)
    if (index !== -1) {
      state.notifications.splice(index, 1, updatedNotification)
    }
  },
  
  MARK_AS_READ(state, notificationId) {
    const notification = state.notifications.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      notification.read = true
      state.unreadCount = Math.max(0, state.unreadCount - 1)
    }
  },
  
  MARK_ALL_AS_READ(state) {
    state.notifications.forEach(notification => {
      notification.read = true
    })
    state.unreadCount = 0
  },
  
  REMOVE_NOTIFICATION(state, notificationId) {
    const index = state.notifications.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      const notification = state.notifications[index]
      if (!notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
      state.notifications.splice(index, 1)
    }
  }
}

const actions = {
  fetchNotifications({ commit }, { page = 1, limit = 10, unread_only = false } = {}) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const params = new URLSearchParams({ page, limit })
      if (unread_only) params.append('unread_only', 'true')
      
      api.get(`/notifications?${params}`)
        .then((response) => {
          const { notifications, total_items, total_pages, current_page, has_next, has_previous, unread_count } = response.data
          commit('SET_NOTIFICATIONS', notifications)
          commit('SET_PAGINATION', { total_items, total_pages, current_page, has_next, has_previous })
          commit('SET_UNREAD_COUNT', unread_count || 0)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération des notifications'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  fetchUnreadCount({ commit }) {
    return new Promise((resolve, reject) => {
      api.get('/notifications/unread-count')
        .then((response) => {
          commit('SET_UNREAD_COUNT', response.data.count)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la récupération du nombre de notifications non lues'
          commit('SET_ERROR', message)
          reject(error?.response?.data)
        })
    })
  },

  markAsRead({ commit }, notificationId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.put(`/notifications/${notificationId}/read`)
        .then((response) => {
          commit('MARK_AS_READ', notificationId)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors du marquage comme lu'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  markAllAsRead({ commit }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.put('/notifications/mark-all-read')
        .then((response) => {
          commit('MARK_ALL_AS_READ')
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors du marquage de toutes les notifications comme lues'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  deleteNotification({ commit }, notificationId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.delete(`/notifications/${notificationId}`)
        .then((response) => {
          commit('REMOVE_NOTIFICATION', notificationId)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la suppression de la notification'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  deleteNotifications({ commit }, ids) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/notifications/delete', { ids })
        .then((response) => {
          ids.forEach(id => commit('REMOVE_NOTIFICATION', id))
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la suppression des notifications'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  createNotification({ commit }, notificationData) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/notifications', notificationData)
        .then((response) => {
          commit('ADD_NOTIFICATION', response.data)
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de la création de la notification'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  sendNotificationToUsers({ commit }, { userIds, title, message, type = 'info' }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/notifications/send', {
        user_ids: userIds,
        title,
        message,
        type
      })
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de l\'envoi des notifications'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  },

  sendNotificationToRole({ commit }, { roleName, title, message, type = 'info' }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      api.post('/notifications/send-to-role', {
        role_name: roleName,
        title,
        message,
        type
      })
        .then((response) => {
          commit('SET_LOADING', false)
          resolve(response.data)
        })
        .catch((error) => {
          const message = error.response?.data?.detail || 'Erreur lors de l\'envoi des notifications au rôle'
          commit('SET_ERROR', message)
          commit('SET_LOADING', false)
          reject(error?.response?.data)
        })
    })
  }
}

const getters = {
  notifications: state => state.notifications,
  unreadCount: state => state.unreadCount,
  loading: state => state.loading,
  error: state => state.error,
  pagination: state => state.pagination,
  
  unreadNotifications: state => state.notifications.filter(n => !n.read),
  
  readNotifications: state => state.notifications.filter(n => n.read),
  
  getNotificationById: (state) => (id) => {
    return state.notifications.find(n => n.id === id)
  },
  
  getNotificationsByType: (state) => (type) => {
    return state.notifications.filter(n => n.type === type)
  },
  
  hasUnreadNotifications: state => state.unreadCount > 0,
  
  notificationsCount: state => state.notifications.length,
  
  hasNotifications: state => state.notifications.length > 0
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
