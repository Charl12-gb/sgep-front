import api from '@/services/api'

const state = {
  entities: [],
  entity: null,
  entityStats: null,
  entitiesStats: null,
  filterOptions: {
    types: [],
    tutelles: [],
    secteurs_activite: []
  },
  boardDirectors: [],
  accountingOfficers: [],

  pagination: {
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0
  },
  
  // Filtres et tri
  filters: {
    search: '',
    type: '',
    tutelle: '',
    secteur_activite: '',
    created_from: '',
    created_to: '',
    has_effectifs: null,
    has_direction: null,
    min_effectifs: null,
    max_effectifs: null
  },
  
  sort: {
    sort_by: 'name',
    sort_order: 'asc'
  },
  
  loading: false,
  error: null
}

const mutations = {
  SET_ENTITIES(state, entities) {
    state.entities = entities
  },
  SET_ENTITY(state, entity) {
    state.entity = entity
  },
  SET_ENTITY_STATS(state, stats) {
    state.entityStats = stats
  },
  SET_ENTITIES_STATS(state, stats) {
    state.entitiesStats = stats
  },
  SET_FILTER_OPTIONS(state, options) {
    state.filterOptions = options
  },
  SET_BOARD_DIRECTORS(state, directors) {
    state.boardDirectors = directors
  },
  SET_ACCOUNTING_OFFICERS(state, officers) {
    state.accountingOfficers = officers
  },

  SET_PAGINATION(state, pagination) {
    state.pagination = pagination
  },
  
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  },
  
  RESET_FILTERS(state) {
    state.filters = {
      search: '',
      type: '',
      tutelle: '',
      secteur_activite: '',
      created_from: '',
      created_to: '',
      has_effectifs: null,
      has_direction: null,
      min_effectifs: null,
      max_effectifs: null
    }
  },
  
  SET_SORT(state, sort) {
    state.sort = { ...state.sort, ...sort }
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  }
}

const actions = {
  async fetchEntities({ commit, state }, customParams = {}) {
    commit('SET_LOADING', true)
    try {
      // Combiner les filtres du state avec les paramètres personnalisés
      const params = {
        page: state.pagination.current_page,
        per_page: state.pagination.per_page,
        q: state.filters.search,
        sort_by: state.sort.sort_by,
        sort_order: state.sort.sort_order,
        ...state.filters,
        ...customParams
      }
      
      // Nettoyer les paramètres vides
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })
      
      const response = await api.get('/entities/', { params })
      commit('SET_ENTITIES', response.data.items)
      commit('SET_PAGINATION', {
        current_page: response.data.page,
        per_page: response.data.per_page,
        total: response.data.total,
        total_pages: response.data.pages
      })
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchFilterOptions({ commit }) {
    try {
      const response = await api.get('/entities/filter-options')
      commit('SET_FILTER_OPTIONS', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async fetchEntitiesStats({ commit, state }) {
    try {
      const params = { ...state.filters }
      // Nettoyer les paramètres vides
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })
      
      const response = await api.get('/entities/stats', { params })
      commit('SET_ENTITIES_STATS', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async updateFilters({ commit, dispatch }, filters) {
    commit('SET_FILTERS', filters)
    // Remettre à la page 1 lors du changement de filtres
    commit('SET_PAGINATION', { ...state.pagination, current_page: 1 })
    await dispatch('fetchEntities')
  },

  async updateSort({ commit, dispatch }, sort) {
    commit('SET_SORT', sort)
    await dispatch('fetchEntities')
  },

  async resetFilters({ commit, dispatch }) {
    commit('RESET_FILTERS')
    commit('SET_PAGINATION', { ...state.pagination, current_page: 1 })
    await dispatch('fetchEntities')
  },

  async goToPage({ commit, dispatch }, page) {
    commit('SET_PAGINATION', { ...state.pagination, current_page: page })
    await dispatch('fetchEntities')
  },

  async fetchEntityById({ commit }, id) {
    commit('SET_LOADING', true)
    try {
      const response = await api.get(`/entities/${id}`)
      commit('SET_ENTITY', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchEntityStats({ commit }, entityId) {
    try {
      const response = await api.get(`/entities/${entityId}/stats`)
      commit('SET_ENTITY_STATS', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async fetchEntityBoardDirectors({ commit }, { entityId, params = {} }) {
    try {
      const response = await api.get(`/entities/${entityId}/board-directors`, { params })
      commit('SET_BOARD_DIRECTORS', response.data.items)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async fetchEntityAccountingOfficers({ commit }, { entityId, params = {} }) {
    try {
      const response = await api.get(`/entities/${entityId}/accounting-officers`, { params })
      commit('SET_ACCOUNTING_OFFICERS', response.data.items)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },



  async createEntity({ commit }, entityData) {
    commit('SET_LOADING', true)
    try {
      const response = await api.post('/entities/', entityData)
      return { success: true, data: response.data }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateEntity({ commit }, { id, data }) {
    commit('SET_LOADING', true)
    try {
      const response = await api.put(`/entities/${id}`, data)
      commit('SET_ENTITY', response.data)
      return { success: true, data: response.data }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteEntity({ commit }, id) {
    commit('SET_LOADING', true)
    try {
      await api.delete(`/entities/${id}`)
      return { success: true }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  entities: state => state.entities,
  entity: state => state.entity,
  entityStats: state => state.entityStats,
  entitiesStats: state => state.entitiesStats,
  filterOptions: state => state.filterOptions,
  boardDirectors: state => state.boardDirectors,
  accountingOfficers: state => state.accountingOfficers,

  pagination: state => state.pagination,
  filters: state => state.filters,
  sort: state => state.sort,
  loading: state => state.loading,
  error: state => state.error,
  entitiesCount: state => state.entities.length,
  hasEntities: state => state.entities.length > 0,
  
  // Getters calculés
  isFiltered: state => {
    return Object.values(state.filters).some(value => 
      value !== '' && value !== null && value !== undefined
    )
  },
  
  activeFiltersCount: state => {
    return Object.values(state.filters).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}