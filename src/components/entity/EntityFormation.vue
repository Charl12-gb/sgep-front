<template>
  <div class="entity-formation">
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else>
      <!-- En-tête avec actions -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 class="mb-1">Formation des administrateurs</h5>
          <p class="text-muted mb-0">
            Gérez la formation et le développement des compétences des administrateurs
          </p>
        </div>
        <div class="d-flex gap-2">
          <button 
            @click="exportToExcel" 
            class="btn btn-outline-success btn-sm"
            :disabled="!tools || tools.length === 0">
            <i class="fas fa-file-excel me-1"></i>
            Exporter
          </button>
          <button 
            @click="refreshTools" 
            class="btn btn-outline-primary btn-sm"
            :disabled="loading">
            <i class="fas fa-sync-alt me-1"></i>
            Actualiser
          </button>
        </div>
      </div>

      <!-- Statistiques -->
      <div v-if="stats" class="row mb-4">
        <div class="col-md-3">
          <div class="card bg-primary text-white">
            <div class="card-body text-center">
              <h3 class="mb-1">{{ stats.total }}</h3>
              <small>Total outils</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success text-white">
            <div class="card-body text-center">
              <h3 class="mb-1">{{ stats.completed }}</h3>
              <small>Complétés</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning text-white">
            <div class="card-body text-center">
              <h3 class="mb-1">{{ stats.pending }}</h3>
              <small>En attente</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-info text-white">
            <div class="card-body text-center">
              <h3 class="mb-1">{{ Math.round(stats.completionRate) }}%</h3>
              <small>Taux de completion</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input 
              v-model="searchTerm" 
              type="text" 
              class="form-control" 
              placeholder="Rechercher un outil de formation...">
          </div>
        </div>
        <div class="col-md-3">
          <select v-model="statusFilter" class="form-select">
            <option value="">Tous les statuts</option>
            <option value="completed">Complétés</option>
            <option value="pending">En attente</option>
          </select>
        </div>
        <div class="col-md-3">
          <select v-model="selectedType" class="form-select">
            <option value="">Tous les types</option>
            <option value="boolean">Oui/Non</option>
            <option value="text">Texte</option>
            <option value="number">Numérique</option>
            <option value="date">Date</option>
            <option value="list">Liste</option>
          </select>
        </div>
      </div>

      <!-- Liste des outils -->
      <div v-if="filteredTools && filteredTools.length > 0">
        <div class="card">
          <div class="card-header bg-light">
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0">
                <i class="fas fa-graduation-cap me-2"></i>
                Formation des administrateurs
                <span class="badge bg-secondary ms-2">{{ filteredTools.length }}</span>
              </h6>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th style="width: 40%">Outil</th>
                    <th style="width: 15%">Type</th>
                    <th style="width: 15%">Statut</th>
                    <th style="width: 20%">Réponse</th>
                    <th style="width: 10%" class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tool in filteredTools" :key="tool.id">
                    <td>
                      <div>
                        <div class="fw-semibold">{{ tool.label }}</div>
                        <small class="text-muted" v-if="tool.description">{{ tool.description }}</small>
                      </div>
                    </td>
                    <td>
                      <span class="badge" :class="{
                        'bg-primary': tool.type === 'boolean',
                        'bg-success': tool.type === 'text',
                        'bg-warning': tool.type === 'number',
                        'bg-info': tool.type === 'date',
                        'bg-secondary': tool.type === 'list'
                      }">
                        {{ getTypeLabel(tool.type) }}
                      </span>
                    </td>
                    <td>
                      <span class="badge" :class="{
                        'bg-success': hasResponse(tool),
                        'bg-warning': !hasResponse(tool)
                      }">
                        {{ hasResponse(tool) ? 'Complété' : 'En attente' }}
                      </span>
                    </td>
                    <td>
                      <div v-if="tool.type === 'boolean'">
                        <div class="form-check">
                          <input 
                            :id="`checkbox-${tool.id}`"
                            class="form-check-input" 
                            type="checkbox" 
                            :checked="!!tool.response?.reponse_boolean"
                            @click="updateBooleanResponse(tool, !tool.response?.reponse_boolean)"
                            :disabled="loading">
                          <label :for="`checkbox-${tool.id}`" class="form-check-label">
                            {{ tool.response?.reponse_boolean ? 'Oui' : 'Non' }}
                            <span v-if="loading" class="spinner-border spinner-border-sm ms-1" role="status"></span>
                          </label>
                        </div>
                      </div>
                      <div v-else>
                        <span v-if="hasResponse(tool)" class="text-success">
                          {{ formatResponse(tool) }}
                        </span>
                        <span v-else class="text-muted">Pas de réponse</span>
                      </div>
                    </td>
                    <td class="text-center">
                      <div class="btn-group" role="group">
                        <button 
                          v-if="tool.type !== 'boolean'"
                          @click="openResponseModal(tool)" 
                          class="btn btn-sm btn-outline-primary"
                          :title="hasResponse(tool) ? 'Modifier la réponse' : 'Ajouter une réponse'">
                          <i :class="hasResponse(tool) ? 'fas fa-edit' : 'fas fa-plus'"></i>
                        </button>
                        <button 
                          @click="viewDetails(tool)" 
                          class="btn btn-sm btn-outline-info"
                          title="Voir les détails">
                          <i class="fas fa-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-else class="text-center py-5">
        <div class="mb-3">
          <i class="fas fa-graduation-cap fa-3x text-muted"></i>
        </div>
        <h6 class="text-muted">Aucun outil de formation</h6>
        <p class="text-muted mb-4">
          {{ searchTerm || statusFilter ? 'Aucun outil ne correspond à vos critères de recherche.' : 'Cette entité n\'a pas encore d\'outils de formation assignés.' }}
        </p>
        <button v-if="!searchTerm && !statusFilter" @click="initializeTools" class="btn btn-success">
          <i class="fas fa-plus me-2"></i>
          Initialiser les outils de formation
        </button>
      </div>
    </div>

    <!-- Modal pour les réponses -->
    <ResponseModal 
      v-if="showResponseModal && selectedTool"
      :tool="selectedTool"
      :entity-id="entityId"
      @close="closeResponseModal"
      @saved="handleResponseSaved"
    />

    <!-- Modal pour les détails -->
    <ToolDetailsModal
      v-if="showDetailsModal && selectedTool"
      :tool="selectedTool"
      @close="closeDetailsModal"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'
import ResponseModal from './modals/ResponseModal.vue'
import ToolDetailsModal from './modals/ToolDetailsModal.vue'

export default {
  name: 'EntityFormation',
  components: {
    ResponseModal,
    ToolDetailsModal
  },
  props: {
    entityId: {
      type: [String, Number],
      required: false
    },
    boardCouncilId: {
      type: [String, Number],
      required: false
    },
    reloadData: {
      type: Function,
      default: () => {}
    }
  },
  setup(props) {
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()

    // Computed property pour déterminer l'ID à utiliser
    const currentId = computed(() => props.boardCouncilId || props.entityId)

    // État local
    const loading = ref(false)
    const searchTerm = ref('')
    const selectedType = ref('')
    const statusFilter = ref('')
    const showResponseModal = ref(false)
    const showDetailsModal = ref(false)
    const selectedTool = ref(null)

    // Computed properties
    const tools = computed(() => {
      // Combiner les outils avec leurs réponses
      const outils = store.getters['outils/outils']
      const reponses = store.getters['outils/currentEntityReponses']
      
      return outils.map(outil => ({
        ...outil,
        response: reponses.reponses?.[outil.id] || null
      }))
    })
    
    const stats = computed(() => {
      const filteredByCategory = tools.value.filter(tool => 
        tool.category === 'Formation des administrateurs'
      )
      
      if (!filteredByCategory.length) return null
      
      const total = filteredByCategory.length
      const completed = filteredByCategory.filter(tool => hasResponse(tool)).length
      const pending = total - completed
      const completionRate = total > 0 ? (completed / total) * 100 : 0
      
      return {
        total,
        completed,
        pending,
        completionRate
      }
    })

    const filteredTools = computed(() => {
      if (!tools.value) return []
      
      return tools.value.filter(tool => {
        // Ne garder que les outils de la catégorie "Formation des administrateurs"
        if (tool.category !== 'Formation des administrateurs') {
          return false
        }

        // Filtre par terme de recherche
        if (searchTerm.value) {
          const term = searchTerm.value.toLowerCase()
          if (!tool.label.toLowerCase().includes(term) && 
              !(tool.description && tool.description.toLowerCase().includes(term))) {
            return false
          }
        }

        // Filtre par type
        if (selectedType.value && tool.type !== selectedType.value) {
          return false
        }

        // Filtre par statut
        if (statusFilter.value) {
          const hasResp = hasResponse(tool)
          if (statusFilter.value === 'completed' && !hasResp) return false
          if (statusFilter.value === 'pending' && hasResp) return false
        }

        return true
      })
    })

    // Méthodes utilitaires
    const hasResponse = (tool) => {
      if (!tool.response) return false
      
      return (
        (tool.response.reponse_boolean !== null) ||
        (tool.response.reponse_text && tool.response.reponse_text.trim()) ||
        (tool.response.reponse_number !== null) ||
        tool.response.reponse_date ||
        (tool.response.reponse_list && tool.response.reponse_list.length > 0)
      )
    }

    const formatResponse = (tool) => {
      if (!tool.response) return 'Pas de réponse'
      
      const response = tool.response
      
      if (response.reponse_boolean !== null) {
        return response.reponse_boolean ? 'Oui' : 'Non'
      }
      
      if (response.reponse_text) {
        return response.reponse_text.length > 50 
          ? response.reponse_text.substring(0, 47) + '...'
          : response.reponse_text
      }
      
      if (response.reponse_number !== null) {
        return response.reponse_number.toString()
      }
      
      if (response.reponse_date) {
        return new Date(response.reponse_date).toLocaleDateString('fr-FR')
      }
      
      if (response.reponse_list && response.reponse_list.length > 0) {
        return response.reponse_list.join(', ')
      }
      
      return 'Pas de réponse'
    }

    const getTypeLabel = (type) => {
      const labels = {
        boolean: 'Oui/Non',
        text: 'Texte',
        number: 'Numérique',
        date: 'Date',
        list: 'Liste'
      }
      return labels[type] || type
    }

    // Actions
    const loadData = async () => {
      if (!currentId.value) return
      
      loading.value = true
      try {
        await store.dispatch('outils/fetchOutils')
        
        if (props.boardCouncilId) {
          await store.dispatch('outils/fetchBoardCouncilOutilsReponses', {
            boardCouncilId: props.boardCouncilId,
            annee: new Date().getFullYear()
          })
        } else {
          await store.dispatch('outils/fetchEntityOutilsReponses', {
            entityId: props.entityId,
            annee: new Date().getFullYear()
          })
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
        notifyError('Erreur lors du chargement des outils de formation')
      } finally {
        loading.value = false
      }
    }

    const refreshTools = () => {
      loadData()
    }

    const initializeTools = async () => {
      try {
        if (props.boardCouncilId) {
          await store.dispatch('outils/initializeBoardCouncilTools', props.boardCouncilId)
        } else {
          await store.dispatch('outils/initializeEntityTools', props.entityId)
        }
        await loadData()
        notifySuccess('Outils de formation initialisés avec succès')
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
        notifyError('Erreur lors de l\'initialisation des outils')
      }
    }

    const exportToExcel = async () => {
      try {
        await store.dispatch('outils/exportToExcel', {
          entityId: props.entityId,
          category: 'Formation des administrateurs'
        })
        notifySuccess('Export Excel généré avec succès')
      } catch (error) {
        console.error('Erreur lors de l\'export:', error)
        notifyError('Erreur lors de la génération de l\'export')
      }
    }

    const updateBooleanResponse = async (tool, value) => {
      if (loading.value) return
      
      loading.value = true
      try {
        if (props.boardCouncilId) {
          await store.dispatch('outils/saveBoardCouncilReponse', {
            boardCouncilId: props.boardCouncilId,
            reponseData: {
              board_council_id: props.boardCouncilId,
              outil_id: tool.id,
              annee: new Date().getFullYear(),
              reponse_boolean: value
            }
          })
        } else {
          await store.dispatch('outils/saveEntityReponse', {
            entityId: props.entityId,
            reponseData: {
              entity_id: props.entityId,
              outil_id: tool.id,
              annee: new Date().getFullYear(),
              reponse_boolean: value
            }
          })
        }
        
        notifySuccess('Réponse mise à jour avec succès')
        
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error)
        notifyError('Erreur lors de la mise à jour de la réponse')
      } finally {
        loading.value = false
      }
    }

    const getBooleanValue = (tool) => {
      return tool.response?.reponse_boolean === true
    }
    
    const isToolUpdating = (tool) => {
      return loading.value
    }

    // Gestion des modals
    const openResponseModal = (tool) => {
      selectedTool.value = tool
      showResponseModal.value = true
    }

    const closeResponseModal = () => {
      showResponseModal.value = false
      selectedTool.value = null
    }

    const viewDetails = (tool) => {
      selectedTool.value = tool
      showDetailsModal.value = true
    }

    const closeDetailsModal = () => {
      showDetailsModal.value = false
      selectedTool.value = null
    }

    const handleResponseSaved = () => {
      loadData()
      closeResponseModal()
      notifySuccess('Réponse sauvegardée avec succès')
    }

    // Watchers
    watch(currentId, (newId) => {
      if (newId) {
        loadData()
      }
    })

    onMounted(() => {
      if (currentId.value) {
        loadData()
      }
    })

    return {
      loading,
      searchTerm,
      selectedType,
      statusFilter,
      showResponseModal,
      showDetailsModal,
      selectedTool,
      tools,
      filteredTools,
      stats,
      hasResponse,
      formatResponse,
      getTypeLabel,
      loadData,
      refreshTools,
      initializeTools,
      exportToExcel,
      updateBooleanResponse,
      getBooleanValue,
      isToolUpdating,
      openResponseModal,
      closeResponseModal,
      viewDetails,
      closeDetailsModal,
      handleResponseSaved
    }
  }
}
</script>

<style scoped>
.table td {
  vertical-align: middle;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}
</style>