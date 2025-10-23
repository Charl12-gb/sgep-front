import api from '@/services/api'
import { localStorageUtil, STORAGE_KEYS } from '@/utils/localStorage'

const state = {
  entities: [],
  headerEntities: [], // Nouvelle propriété pour les entités du header
  entity: null,
  selectedEntity: localStorageUtil.get(STORAGE_KEYS.SELECTED_ENTITY, null),
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
  SET_HEADER_ENTITIES(state, entities) {
    state.headerEntities = entities
  },
  SET_ENTITY(state, entity) {
    state.entity = entity
  },
  SET_SELECTED_ENTITY(state, entity) {
    state.selectedEntity = entity
    // Sauvegarder dans localStorage (entité complète et ID séparément pour compatibilité)
    if (entity) {
      localStorageUtil.set(STORAGE_KEYS.SELECTED_ENTITY, entity)
      localStorageUtil.set(STORAGE_KEYS.SELECTED_ENTITY_ID, entity.id)
    } else {
      localStorageUtil.remove(STORAGE_KEYS.SELECTED_ENTITY)
      localStorageUtil.remove(STORAGE_KEYS.SELECTED_ENTITY_ID)
    }
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
  // Action pour sélectionner une entité
  selectEntity({ commit }, entity) {
    commit('SET_SELECTED_ENTITY', entity)
  },
  
  // Action pour charger l'entité sélectionnée depuis localStorage
  async loadSelectedEntity({ commit, state, dispatch }) {    
    const savedEntity = localStorageUtil.get(STORAGE_KEYS.SELECTED_ENTITY)
    if (savedEntity) {
      commit('SET_SELECTED_ENTITY', savedEntity)
      return savedEntity
    }
    
    // Fallback : si on a juste l'ID, essayer de trouver l'entité dans la liste
    const savedEntityId = localStorageUtil.get(STORAGE_KEYS.SELECTED_ENTITY_ID)
    if (savedEntityId) {      
      // Si les entités sont déjà chargées, chercher dedans
      if (state.entities.length > 0) {
        const entity = state.entities.find(e => e.id === parseInt(savedEntityId))
        if (entity) {
          commit('SET_SELECTED_ENTITY', entity)
          return entity
        }
      }
      
      // Sinon, charger l'entité depuis l'API
      try {
        const entity = await dispatch('fetchEntityById', savedEntityId)
        if (entity) {
          commit('SET_SELECTED_ENTITY', entity)
          return entity
        }
      } catch (error) {
        // Nettoyer le localStorage si l'entité n'existe plus
        localStorageUtil.remove(STORAGE_KEYS.SELECTED_ENTITY)
        localStorageUtil.remove(STORAGE_KEYS.SELECTED_ENTITY_ID)
      }
    }    
    return null
  },
  
  // Action pour sélectionner une entité par ID
  async selectEntityById({ commit, state, dispatch }, entityId) {
    // Chercher d'abord dans les entités du header (toujours disponibles sans filtres)
    let entity = state.headerEntities.find(e => e.id === entityId || e.id === parseInt(entityId))
    
    // Si pas trouvée dans le header, chercher dans les entités filtrées
    if (!entity) {
      entity = state.entities.find(e => e.id === entityId || e.id === parseInt(entityId))
    }
    
    if (!entity) {
      // Si pas trouvée, la charger depuis l'API
      try {
        entity = await dispatch('fetchEntityById', entityId)
      } catch (error) {
        console.error('Erreur lors du chargement de l\'entité:', error)
        return null
      }
    }
    
    if (entity) {
      commit('SET_SELECTED_ENTITY', entity)
      return entity
    }
    
    return null
  },
  
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

  async fetchHeaderEntities({ commit }) {
    try {
      const response = await api.get('/entities/header-list')
      commit('SET_HEADER_ENTITIES', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
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



  async createEntity({ commit, dispatch }, entityData) {
    commit('SET_LOADING', true)
    try {
      const response = await api.post('/entities/', entityData)
      // Rafraîchir la liste des entités du header après création
      await dispatch('fetchHeaderEntities')
      return { success: true, data: response.data }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateEntity({ commit, dispatch }, { id, data }) {
    commit('SET_LOADING', true)
    try {
      const response = await api.put(`/entities/${id}`, data)
      commit('SET_ENTITY', response.data)
      // Rafraîchir la liste des entités du header après mise à jour
      await dispatch('fetchHeaderEntities')
      return { success: true, data: response.data }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteEntity({ commit, dispatch }, id) {
    commit('SET_LOADING', true)
    try {
      await api.delete(`/entities/${id}`)
      // Rafraîchir la liste des entités du header après suppression
      await dispatch('fetchHeaderEntities')
      return { success: true }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Action pour initialiser les entités au démarrage
  async initializeEntities({ dispatch, state }) {
    try {
      // D'abord essayer de charger l'entité sélectionnée depuis localStorage (au cas où on aurait juste l'ID)
      let selectedEntity = await dispatch('loadSelectedEntity')
      
      // Charger les entités pour le header (sans filtres)
      await dispatch('fetchHeaderEntities')
      
      // Charger les entités disponibles pour la liste (avec filtres potentiels)
      await dispatch('fetchEntities', { per_page: 100 })
      
      // Si on n'avait pas trouvé l'entité avant, chercher dans les entités du header
      if (!selectedEntity && state.headerEntities.length > 0) {
        const savedEntityId = localStorageUtil.get(STORAGE_KEYS.SELECTED_ENTITY_ID)
        if (savedEntityId) {
          selectedEntity = state.headerEntities.find(e => e.id === savedEntityId)
          if (selectedEntity) {
            await dispatch('selectEntity', selectedEntity)
          }
        }
      }
      
      // Si toujours aucune entité sélectionnée, prendre la première du header
      if (!selectedEntity && state.headerEntities.length > 0) {
        const firstEntity = state.headerEntities[0]
        await dispatch('selectEntity', firstEntity)
        selectedEntity = firstEntity
      }
      
      return selectedEntity
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des entités:', error)
      throw error
    }
  }
}

const getters = {
  entities: state => state.entities,
  headerEntities: state => state.headerEntities,
  entity: state => state.entity,
  selectedEntity: state => state.selectedEntity,
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