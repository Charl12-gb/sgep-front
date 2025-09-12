<template>
  <div class="entities-stats">
    <div class="row g-4 mb-4">
      <!-- Statistiques générales -->
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="card-title mb-0">
                <i class="fas fa-chart-bar text-primary me-2"></i>
                Vue d'ensemble
              </h6>
              <button @click="refreshStats" class="btn btn-outline-primary btn-sm" :disabled="loading">
                <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i>
                Actualiser
              </button>
            </div>

            <div class="row g-3">
              <div class="col-6 col-lg-3">
                <div class="text-center p-3 rounded bg-primary bg-opacity-10">
                  <div class="h4 mb-1 fw-bold">
                    {{ stats?.total || 0 }}
                  </div>
                  <small class="text-muted">Total entités</small>
                </div>
              </div>

              <div class="col-6 col-lg-3">
                <div class="text-center p-3 rounded bg-success bg-opacity-10">
                  <div class="h4 mb-1 text-success fw-bold">
                    {{ stats?.effectifs?.with_effectifs || 0 }}
                  </div>
                  <small class="text-muted">Avec effectifs</small>
                </div>
              </div>

              <div class="col-6 col-lg-3">
                <div class="text-center p-3 rounded bg-info bg-opacity-10">
                  <div class="h4 mb-1 text-info fw-bold">
                    {{ stats?.direction?.with_direction || 0 }}
                  </div>
                  <small class="text-muted">Avec direction</small>
                </div>
              </div>

              <div class="col-6 col-lg-3">
                <div class="text-center p-3 rounded bg-warning bg-opacity-10">
                  <div class="h4 mb-1 text-warning fw-bold">
                    {{ completionPercentage }}%
                  </div>
                  <small class="text-muted">Complétude</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres actifs -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <h6 class="card-title mb-3">
              <i class="fas fa-filter text-success me-2"></i>
              Filtres actifs
              <span class="badge bg-success ms-1">{{ activeFiltersCount }}</span>
            </h6>

            <div v-if="activeFiltersCount === 0" class="text-center text-muted py-3">
              <i class="fas fa-filter-circle-xmark fa-2x mb-2 opacity-50"></i>
              <p class="mb-0 small">Aucun filtre appliqué</p>
            </div>

            <div v-else class="active-filters">
              <div v-for="(filter, key) in activeFilters" :key="key"
                class="d-flex justify-content-between align-items-center mb-2 p-2 rounded bg-light">
                <div>
                  <small class="fw-semibold text-dark">{{ getFilterLabel(key) }}:</small>
                  <br>
                  <small class="text-muted">{{ formatFilterValue(key, filter) }}</small>
                </div>
                <button @click="removeFilter(key)" class="btn btn-outline-danger btn-sm" title="Supprimer ce filtre">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <button @click="clearAllFilters" class="btn btn-outline-secondary btn-sm w-100 mt-2">
                <i class="fas fa-times me-1"></i>
                Effacer tous les filtres
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Répartition par type et secteur -->
    <div class="row g-4">
      <!-- En-tête avec bouton toggle -->
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">
            <i class="fas fa-chart-pie text-primary me-2"></i>
            Répartition détaillée
          </h5>
          <button 
            @click="toggleDistributionSection" 
            class="btn btn-outline-secondary btn-sm"
            :title="showDistribution ? 'Masquer la répartition' : 'Afficher la répartition'"
          >
            <i class="fas" :class="showDistribution ? 'fa-eye-slash' : 'fa-eye'"></i>
            {{ showDistribution ? 'Masquer' : 'Afficher' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Section répartition (collapsible) -->
    <div class="row g-4" v-show="showDistribution" style="transition: all 0.3s ease-in-out;">

      <!-- Répartition par type -->
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-header bg-white border-0 pb-0">
            <h6 class="fw-bold text-dark mb-0">
              <i class="fas fa-building text-primary me-2"></i>
              Répartition par type
            </h6>
          </div>
          <div class="card-body">
            <div v-if="stats?.by_type && Object.keys(stats.by_type).length > 0" class="d-flex flex-column gap-4">
              <div v-for="(count, type) in stats.by_type" :key="type"
                class="d-flex align-items-center justify-content-between">
                <div class="d-flex flex-column">
                  <span class="fw-semibold">{{ type }}</span>
                  <small class="text-muted">{{ count }} entité(s)</small>
                </div>
                <div class="text-end" style="width: 60%;">
                  <div class="progress" style="height: 8px;">
                    <div class="progress-bar" :class="{
                      'bg-primary': type === 'Establishment',
                      'bg-success': type === 'Society'
                    }" :style="{ width: `${(count / stats.total) * 100}%` }"></div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center text-muted py-5">
              <i class="fas fa-chart-pie fa-2x mb-3 opacity-50"></i>
              <p class="mb-0">Aucune donnée disponible</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Répartition par secteur -->
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-header bg-white border-0 pb-0">
            <h6 class="fw-bold text-dark mb-0">
              <i class="fas fa-industry text-info me-2"></i>
              Répartition par secteur
            </h6>
          </div>
          <div class="card-body">
            <div v-if="stats?.by_secteur && Object.keys(stats.by_secteur).length > 0" class="d-flex flex-wrap gap-3">
              <div v-for="(count, secteur) in stats.by_secteur" :key="secteur"
                class="border rounded-3 p-3 flex-fill text-center shadow-sm" style="min-width: 45%;">
                <h6 class="fw-semibold mb-1">{{ secteur }}</h6>
                <span class="badge bg-info rounded-pill mb-2">{{ ((count / stats.total) * 100).toFixed(1) }}%</span>
                <div class="progress mb-2" style="height: 6px;">
                  <div class="progress-bar bg-info" :style="{ width: `${(count / stats.total) * 100}%` }"></div>
                </div>
                <small class="text-muted">{{ count }} entité(s)</small>
              </div>
            </div>

            <div v-else class="text-center text-muted py-5">
              <i class="fas fa-chart-pie fa-2x mb-3 opacity-50"></i>
              <p class="mb-0">Aucune donnée disponible</p>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'EntitiesStats',
  setup() {
    const store = useStore()
    const loading = ref(false)
    const showDistribution = ref(false)

    // Computed
    const stats = computed(() => store.getters['entities/entitiesStats'])
    const filters = computed(() => store.getters['entities/filters'])
    const activeFiltersCount = computed(() => store.getters['entities/activeFiltersCount'])

    const activeFilters = computed(() => {
      const result = {}
      Object.keys(filters.value).forEach(key => {
        const value = filters.value[key]
        if (value !== '' && value !== null && value !== undefined) {
          result[key] = value
        }
      })
      return result
    })

    const completionPercentage = computed(() => {
      if (!stats.value || stats.value.total === 0) return 0
      const withData = (stats.value.effectifs?.with_effectifs || 0) + (stats.value.direction?.with_direction || 0)
      const total = stats.value.total * 2 // 2 types de données
      return Math.round((withData / total) * 100)
    })

    // Methods
    const refreshStats = async () => {
      loading.value = true
      try {
        await store.dispatch('entities/fetchEntitiesStats')
      } finally {
        loading.value = false
      }
    }

    const removeFilter = async (filterKey) => {
      const newFilters = { ...filters.value }
      newFilters[filterKey] = filterKey.includes('has_') ? null : ''
      await store.dispatch('entities/updateFilters', newFilters)
      await refreshStats()
    }

    const clearAllFilters = async () => {
      await store.dispatch('entities/resetFilters')
      await refreshStats()
    }

    const getFilterLabel = (key) => {
      const labels = {
        search: 'Recherche',
        type: 'Type',
        tutelle: 'Tutelle',
        secteur_activite: 'Secteur d\'activité',
        created_from: 'Créé après le',
        created_to: 'Créé avant le',
        has_effectifs: 'Présence d\'effectifs',
        has_direction: 'Présence de direction',
        min_effectifs: 'Effectifs minimum',
        max_effectifs: 'Effectifs maximum'
      }
      return labels[key] || key
    }

    const formatFilterValue = (key, value) => {
      if (key === 'has_effectifs' || key === 'has_direction') {
        return value ? 'Oui' : 'Non'
      }
      if (key === 'created_from' || key === 'created_to') {
        return new Date(value).toLocaleDateString('fr-FR')
      }
      return value
    }

    const toggleDistributionSection = () => {
      showDistribution.value = !showDistribution.value
      // Optionnel: sauvegarder la préférence dans localStorage
      localStorage.setItem('entities-stats-show-distribution', showDistribution.value.toString())
    }

    // Watchers
    watch(filters, async () => {
      await refreshStats()
    }, { deep: true })

    // Lifecycle
    onMounted(async () => {
      // Restaurer la préférence depuis localStorage
      const savedPreference = localStorage.getItem('entities-stats-show-distribution')
      if (savedPreference !== null) {
        showDistribution.value = savedPreference === 'true'
      }
      
      await refreshStats()
    })

    return {
      loading,
      showDistribution,
      stats,
      filters,
      activeFiltersCount,
      activeFilters,
      completionPercentage,
      refreshStats,
      removeFilter,
      clearAllFilters,
      getFilterLabel,
      formatFilterValue,
      toggleDistributionSection
    }
  }
}
</script>

<style scoped>
.entities-stats .card {
  transition: box-shadow 0.15s ease-in-out;
}

.entities-stats .card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.entities-stats .progress {
  border-radius: 3px;
}

.entities-stats .progress-bar {
  border-radius: 3px;
}

.entities-stats .active-filters .btn {
  padding: 0.25rem 0.5rem;
}

.entities-stats .badge {
  font-size: 0.75rem;
}

/* Transition pour la section répartition */
.entities-stats .row[v-show] {
  animation: fadeInOut 0.3s ease-in-out;
}

@keyframes fadeInOut {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Style pour le bouton toggle */
.entities-stats .btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

@media (max-width: 768px) {
  .entities-stats .row.g-3>.col-6 {
    margin-bottom: 1rem;
  }
  
  /* Responsive pour le bouton toggle */
  .entities-stats .d-flex .btn {
    font-size: 0.875rem;
    padding: 0.375rem 0.75rem;
  }
}
</style>
