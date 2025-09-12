<template>
  <div class="entity-tools">
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else>
      <!-- En-tête avec actions -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 class="mb-1">Outils de l'entité</h5>
          <p class="text-muted mb-0">
            Gérez les outils et leurs réponses pour cette entité
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

      <!-- Filtres et recherche -->
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input 
              v-model="searchTerm" 
              type="text" 
              class="form-control" 
              placeholder="Rechercher un outil...">
          </div>
        </div>
        <div class="col-md-3">
          <select v-model="selectedCategory" class="form-select">
            <option value="">Toutes les catégories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        <div class="col-md-3">
          <select v-model="selectedType" class="form-select">
            <option value="">Tous les types</option>
            <option value="boolean">Oui/Non</option>
            <option value="text">Texte</option>
            <option value="number">Nombre</option>
            <option value="date">Date</option>
            <option value="list">Liste</option>
          </select>
        </div>
        <div class="col-md-2">
          <select v-model="statusFilter" class="form-select">
            <option value="">Tous les statuts</option>
            <option value="completed">Complétés</option>
            <option value="pending">En attente</option>
          </select>
        </div>
      </div>

      <!-- Statistiques rapides -->
      <div class="row mb-4" v-if="stats">
        <div class="col-md-3">
          <div class="card bg-primary text-white">
            <div class="card-body text-center py-3">
              <h4 class="mb-1">{{ stats.total }}</h4>
              <small>Total Outils</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success text-white">
            <div class="card-body text-center py-3">
              <h4 class="mb-1">{{ stats.completed }}</h4>
              <small>Complétés</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning text-white">
            <div class="card-body text-center py-3">
              <h4 class="mb-1">{{ stats.pending }}</h4>
              <small>En attente</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-info text-white">
            <div class="card-body text-center py-3">
              <h4 class="mb-1">{{ Math.round(stats.completionRate) }}%</h4>
              <small>Taux de complétion</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Outils par catégorie -->
      <div v-if="groupedTools && Object.keys(groupedTools).length > 0">
        <div v-for="(categoryTools, category) in groupedTools" :key="category" class="mb-4">
          <div class="card">
            <div class="card-header bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="mb-0">
                  <i class="fas fa-folder me-2"></i>
                  {{ category }}
                  <span class="badge bg-secondary ms-2">{{ categoryTools.length }}</span>
                </h6>
                <button 
                  @click="toggleCategory(category)"
                  class="btn btn-sm btn-outline-secondary">
                  <i :class="['fas', expandedCategories.includes(category) ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
                </button>
              </div>
            </div>
            
            <div v-show="expandedCategories.includes(category)" class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 300px">Outil</th>
                      <th style="width: 100px">Type</th>
                      <th style="width: 100px">Statut</th>
                      <th>Réponse</th>
                      <th style="width: 150px">Dernière MAJ</th>
                      <th style="width: 100px">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="tool in categoryTools" :key="tool.id">
                      <td>
                        <div>
                          <strong>{{ tool.label }}</strong>
                          <div class="text-muted small" v-if="tool.description">
                            {{ tool.description }}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span :class="getTypeClass(tool.type)" class="badge">
                          {{ getTypeLabel(tool.type) }}
                        </span>
                      </td>
                      <td>
                        <span :class="getStatusClass(tool.response)" class="badge">
                          {{ getStatusLabel(tool.response) }}
                        </span>
                      </td>
                      <td>
                        <div v-if="tool.response">
                          <div v-if="tool.type === 'boolean'">
                            <span :class="tool.response.reponse_boolean ? 'text-success' : 'text-danger'">
                              <i :class="tool.response.reponse_boolean ? 'fas fa-check' : 'fas fa-times'"></i>
                              {{ tool.response.reponse_boolean ? 'Oui' : 'Non' }}
                            </span>
                          </div>
                          <div v-else-if="tool.type === 'text' && tool.response.reponse_text">
                            <span class="text-truncate d-inline-block" style="max-width: 200px" 
                                  :title="tool.response.reponse_text">
                              {{ tool.response.reponse_text }}
                            </span>
                          </div>
                          <div v-else-if="tool.type === 'number' && tool.response.reponse_number !== null">
                            <span class="fw-semibold">{{ tool.response.reponse_number }}</span>
                          </div>
                          <div v-else-if="tool.type === 'date' && tool.response.reponse_date">
                            <span>{{ formatDate(tool.response.reponse_date) }}</span>
                          </div>
                          <div v-else-if="tool.type === 'list' && tool.response.reponse_list">
                            <span class="badge bg-info">{{ tool.response.reponse_list.length }} éléments</span>
                          </div>
                          <div v-if="tool.response.details" class="text-muted small mt-1">
                            <i class="fas fa-sticky-note me-1"></i>
                            {{ formatDetails(tool.response.details) }}
                          </div>
                        </div>
                        <span v-else class="text-muted fst-italic">Aucune réponse</span>
                      </td>
                      <td>
                        <span v-if="tool.response && tool.response.updated_at" class="text-muted small">
                          {{ formatDate(tool.response.updated_at) }}
                        </span>
                        <span v-else class="text-muted small">-</span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button 
                            @click="editResponse(tool)" 
                            class="btn btn-outline-primary btn-sm"
                            :title="tool.response ? 'Modifier la réponse' : 'Ajouter une réponse'">
                            <i :class="tool.response ? 'fas fa-edit' : 'fas fa-plus'"></i>
                          </button>
                          <button 
                            @click="viewDetails(tool)" 
                            class="btn btn-outline-info btn-sm"
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
      </div>

      <!-- Message si aucun outil -->
      <div v-else-if="!loading" class="text-center py-5">
        <div class="mb-3">
          <i class="fas fa-tools fa-3x text-muted"></i>
        </div>
        <h5 class="text-muted">Aucun outil trouvé</h5>
        <p class="text-muted">
          {{ searchTerm || selectedCategory ? 'Aucun outil ne correspond à vos critères de recherche.' : 'Cette entité n\'a pas encore d\'outils assignés.' }}
        </p>
        <button v-if="!searchTerm && !selectedCategory" @click="initializeTools" class="btn btn-success">
          <i class="fas fa-plus me-2"></i>
          Initialiser les outils
        </button>
      </div>
    </div>

    <!-- Modal d'édition de réponse -->
    <ResponseModal 
      v-if="showResponseModal"
      :tool="selectedTool"
      :entity-id="entityId"
      @close="closeResponseModal"
      @saved="handleResponseSaved" />

    <!-- Modal de détails -->
    <ToolDetailsModal 
      v-if="showDetailsModal"
      :tool="selectedTool"
      @close="closeDetailsModal" />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'
import ResponseModal from './modals/ResponseModal.vue'
import ToolDetailsModal from './modals/ToolDetailsModal.vue'

export default {
  name: 'EntityTools',
  components: {
    ResponseModal,
    ToolDetailsModal
  },
  props: {
    entityId: {
      type: [String, Number],
      required: true
    },
    reloadData: {
      type: Function,
      default: () => {}
    }
  },
  setup(props) {
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()

    // État local
    const loading = ref(false)
    const searchTerm = ref('')
    const selectedCategory = ref('')
    const selectedType = ref('')
    const statusFilter = ref('')
    const expandedCategories = ref([])
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
      const outils = store.getters['outils/outils']
      const reponses = store.getters['outils/currentEntityReponses']
      
      if (!outils.length) return null
      
      const total = outils.length
      let completed = 0
      
      if (reponses.reponses) {
        completed = Object.values(reponses.reponses).filter(reponse => {
          return (
            (reponse.reponse_boolean !== null) ||
            (reponse.reponse_text && reponse.reponse_text.trim()) ||
            (reponse.reponse_number !== null) ||
            reponse.reponse_date ||
            (reponse.reponse_list && reponse.reponse_list.length > 0)
          )
        }).length
      }
      
      const pending = total - completed
      const completionRate = total > 0 ? (completed / total) * 100 : 0
      
      return {
        total,
        completed,
        pending,
        completionRate
      }
    })

    const categories = computed(() => {
      if (!tools.value) return []
      const cats = [...new Set(tools.value.map(tool => tool.category))]
      return cats.filter(cat => cat).sort()
    })

    const filteredTools = computed(() => {
      if (!tools.value) return []
      
      return tools.value.filter(tool => {
        // Filtre par terme de recherche
        if (searchTerm.value) {
          const term = searchTerm.value.toLowerCase()
          if (!tool.label.toLowerCase().includes(term) && 
              !(tool.description && tool.description.toLowerCase().includes(term))) {
            return false
          }
        }

        // Filtre par catégorie
        if (selectedCategory.value && tool.category !== selectedCategory.value) {
          return false
        }

        // Filtre par type
        if (selectedType.value && tool.type !== selectedType.value) {
          return false
        }

        // Filtre par statut
        if (statusFilter.value) {
          const hasResponse = tool.response && (
            (tool.type === 'boolean' && tool.response.reponse_boolean !== null) ||
            (tool.type === 'text' && tool.response.reponse_text) ||
            (tool.type === 'number' && tool.response.reponse_number !== null) ||
            (tool.type === 'date' && tool.response.reponse_date) ||
            (tool.type === 'list' && tool.response.reponse_list && tool.response.reponse_list.length > 0)
          )
          
          if (statusFilter.value === 'completed' && !hasResponse) return false
          if (statusFilter.value === 'pending' && hasResponse) return false
        }

        return true
      })
    })

    const groupedTools = computed(() => {
      if (!filteredTools.value) return {}
      
      const grouped = {}
      filteredTools.value.forEach(tool => {
        const category = tool.category || 'Sans catégorie'
        if (!grouped[category]) {
          grouped[category] = []
        }
        grouped[category].push(tool)
      })

      // Trier les outils dans chaque catégorie
      Object.keys(grouped).forEach(category => {
        grouped[category].sort((a, b) => a.label.localeCompare(b.label))
      })

      return grouped
    })

    // Méthodes
    const loadTools = async () => {
      loading.value = true
      try {
        // Charger les outils disponibles
        await store.dispatch('outils/fetchOutils')
        
        // Charger les réponses de l'entité pour l'année courante
        await store.dispatch('outils/fetchEntityOutilsReponses', {
          entityId: props.entityId,
          annee: new Date().getFullYear()
        })
        
        // Développer toutes les catégories par défaut si peu de catégories
        if (categories.value.length <= 3) {
          expandedCategories.value = [...categories.value]
        } else {
          // Sinon, développer seulement la première
          expandedCategories.value = categories.value.length > 0 ? [categories.value[0]] : []
        }
      } catch (error) {
        console.error('Erreur lors du chargement des outils:', error)
        notifyError('Erreur lors du chargement des outils')
      } finally {
        loading.value = false
      }
    }

    const refreshTools = () => {
      loadTools()
    }

    const toggleCategory = (category) => {
      const index = expandedCategories.value.indexOf(category)
      if (index > -1) {
        expandedCategories.value.splice(index, 1)
      } else {
        expandedCategories.value.push(category)
      }
    }

    const editResponse = (tool) => {
      selectedTool.value = tool
      showResponseModal.value = true
    }

    const viewDetails = (tool) => {
      selectedTool.value = tool
      showDetailsModal.value = true
    }

    const closeResponseModal = () => {
      showResponseModal.value = false
      selectedTool.value = null
    }

    const closeDetailsModal = () => {
      showDetailsModal.value = false
      selectedTool.value = null
    }

    const handleResponseSaved = () => {
      notifySuccess('Réponse enregistrée avec succès')
      loadTools()
      closeResponseModal()
    }

    const initializeTools = async () => {
      try {
        loading.value = true
        await store.dispatch('outils/initEntityOutils', {
          entityId: props.entityId,
          annee: new Date().getFullYear()
        })
        notifySuccess('Outils initialisés avec succès')
        await loadTools()
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
        notifyError('Erreur lors de l\'initialisation des outils')
      } finally {
        loading.value = false
      }
    }

    const exportToExcel = async () => {
      try {
        // Cette fonctionnalité sera implémentée plus tard
        notifyError('Fonctionnalité d\'export non encore disponible')
      } catch (error) {
        console.error('Erreur lors de l\'export:', error)
        notifyError('Erreur lors de l\'export')
      }
    }

    // Méthodes utilitaires
    const getTypeClass = (type) => {
      const classes = {
        boolean: 'bg-primary',
        text: 'bg-info',
        number: 'bg-warning',
        date: 'bg-success',
        list: 'bg-secondary'
      }
      return classes[type] || 'bg-dark'
    }

    const getTypeLabel = (type) => {
      const labels = {
        boolean: 'Oui/Non',
        text: 'Texte',
        number: 'Nombre',
        date: 'Date',
        list: 'Liste'
      }
      return labels[type] || type
    }

    const getStatusClass = (response) => {
      if (!response) return 'bg-secondary'
      
      const hasContent = (
        (response.reponse_boolean !== null) ||
        response.reponse_text ||
        (response.reponse_number !== null) ||
        response.reponse_date ||
        (response.reponse_list && response.reponse_list.length > 0)
      )
      
      return hasContent ? 'bg-success' : 'bg-warning'
    }

    const getStatusLabel = (response) => {
      if (!response) return 'En attente'
      
      const hasContent = (
        (response.reponse_boolean !== null) ||
        response.reponse_text ||
        (response.reponse_number !== null) ||
        response.reponse_date ||
        (response.reponse_list && response.reponse_list.length > 0)
      )
      
      return hasContent ? 'Complété' : 'En attente'
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('fr-FR')
    }

    const formatDetails = (details, maxLength = 50) => {
      if (!details) return ''
      
      // Si c'est une chaîne, traiter comme avant
      if (typeof details === 'string') {
        return details.length > maxLength ? details.substring(0, maxLength) + '...' : details
      }
      
      // Si c'est un objet/array JSON, créer un résumé
      if (typeof details === 'object') {
        try {
          if (Array.isArray(details)) {
            const count = details.length
            if (count === 0) return 'Liste vide'
            if (count === 1) return `1 élément: ${JSON.stringify(details[0]).substring(0, 30)}...`
            return `${count} éléments`
          } else {
            const keys = Object.keys(details)
            if (keys.length === 0) return 'Objet vide'
            if (keys.length === 1) return `${keys[0]}: ${JSON.stringify(details[keys[0]]).substring(0, 30)}...`
            return `${keys.length} propriétés: ${keys.slice(0, 2).join(', ')}...`
          }
        } catch (error) {
          return 'Données structurées'
        }
      }
      
      // Fallback pour tout autre type
      return String(details).substring(0, maxLength) + '...'
    }

    // Watchers
    watch(() => props.entityId, () => {
      if (props.entityId) {
        loadTools()
      }
    })

    // Lifecycle
    onMounted(() => {
      if (props.entityId) {
        loadTools()
      }
    })

    return {
      loading,
      searchTerm,
      selectedCategory,
      selectedType,
      statusFilter,
      expandedCategories,
      showResponseModal,
      showDetailsModal,
      selectedTool,
      tools,
      stats,
      categories,
      filteredTools,
      groupedTools,
      loadTools,
      refreshTools,
      toggleCategory,
      editResponse,
      viewDetails,
      closeResponseModal,
      closeDetailsModal,
      handleResponseSaved,
      initializeTools,
      exportToExcel,
      getTypeClass,
      getTypeLabel,
      getStatusClass,
      getStatusLabel,
      formatDate,
      formatDetails
    }
  }
}
</script>

<style scoped>
.entity-tools {
  min-height: 400px;
}

.table th {
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-header h6 {
  color: #495057;
  font-weight: 600;
}

.btn-group-sm > .btn {
  border-radius: 0.2rem;
}

.badge {
  font-size: 0.75rem;
}
</style>
