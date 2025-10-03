<template>
  <div class="entities-filters">
    <!-- Filtres de base -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <!-- Recherche -->
          <div class="col-md-4">
            <label class="form-label text-muted small fw-semibold mb-2">
              <i class="fas fa-search me-1"></i>
              RECHERCHE
            </label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input
                v-model="localFilters.search"
                type="text"
                placeholder="Nom, email, adresse..."
                class="form-control border-start-0 ps-0"
                @input="debouncedSearch"
              />
              <button 
                v-if="localFilters.search"
                @click="clearSearch"
                class="btn btn-outline-secondary border-start-0"
                type="button"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <!-- Type -->
          <div class="col-md-2">
            <label class="form-label text-muted small fw-semibold mb-2">
              <i class="fas fa-building me-1"></i>
              TYPE
            </label>
            <select 
              v-model="localFilters.type" 
              @change="applyFilters" 
              class="form-select"
            >
              <option value="">Tous</option>
              <option 
                v-for="type in filterOptions.types" 
                :key="type" 
                :value="type"
              >
                {{ type }}
              </option>
            </select>
          </div>

          <!-- Secteur -->
          <div class="col-md-3">
            <label class="form-label text-muted small fw-semibold mb-2">
              <i class="fas fa-industry me-1"></i>
              SECTEUR D'ACTIVITÉ
            </label>
            <select 
              v-model="localFilters.secteur_activite" 
              @change="applyFilters" 
              class="form-select"
            >
              <option value="">Tous</option>
              <option 
                v-for="secteur in filterOptions.secteurs_activite" 
                :key="secteur" 
                :value="secteur"
              >
                {{ secteur }}
              </option>
            </select>
          </div>

          <!-- Tutelle -->
          <div class="col-md-3">
            <label class="form-label text-muted small fw-semibold mb-2">
              <i class="fas fa-university me-1"></i>
              TUTELLE
            </label>
            <select 
              v-model="localFilters.tutelle" 
              @change="applyFilters" 
              class="form-select"
            >
              <option value="">Toutes</option>
              <option 
                v-for="tutelle in filterOptions.tutelles" 
                :key="tutelle" 
                :value="tutelle"
              >
                {{ tutelle }}
              </option>
            </select>
          </div>
        </div>

        <!-- Boutons d'actions -->
        <div class="row mt-3">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex gap-2">
                <button 
                  @click="toggleAdvanced"
                  class="btn btn-outline-primary btn-sm"
                  :class="{ active: showAdvanced }"
                >
                  <i class="fas fa-sliders-h me-1"></i>
                  Filtres avancés
                  <span v-if="advancedFiltersCount > 0" class="badge bg-primary ms-1">
                    {{ advancedFiltersCount }}
                  </span>
                </button>
                
                <button 
                  v-if="isFiltered"
                  @click="resetAllFilters"
                  class="btn btn-outline-secondary btn-sm"
                >
                  <i class="fas fa-times me-1"></i>
                  Effacer
                  <span class="badge bg-secondary ms-1">{{ activeFiltersCount }}</span>
                </button>
              </div>

              <div class="d-flex gap-2">
                <!-- Tri -->
                <div class="dropdown">
                  <button 
                    class="btn btn-outline-secondary btn-sm dropdown-toggle" 
                    type="button" 
                    data-bs-toggle="dropdown"
                  >
                    <i class="fas fa-sort me-1"></i>
                    Trier
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <button 
                        @click="updateSort('name', 'asc')"
                        class="dropdown-item"
                        :class="{ active: currentSort.sort_by === 'name' && currentSort.sort_order === 'asc' }"
                      >
                        <i class="fas fa-sort-alpha-down me-2"></i>
                        Nom (A-Z)
                      </button>
                    </li>
                    <li>
                      <button 
                        @click="updateSort('name', 'desc')"
                        class="dropdown-item"
                        :class="{ active: currentSort.sort_by === 'name' && currentSort.sort_order === 'desc' }"
                      >
                        <i class="fas fa-sort-alpha-up me-2"></i>
                        Nom (Z-A)
                      </button>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <button 
                        @click="updateSort('created_at', 'desc')"
                        class="dropdown-item"
                        :class="{ active: currentSort.sort_by === 'created_at' && currentSort.sort_order === 'desc' }"
                      >
                        <i class="fas fa-clock me-2"></i>
                        Plus récentes
                      </button>
                    </li>
                    <li>
                      <button 
                        @click="updateSort('created_at', 'asc')"
                        class="dropdown-item"
                        :class="{ active: currentSort.sort_by === 'created_at' && currentSort.sort_order === 'asc' }"
                      >
                        <i class="fas fa-history me-2"></i>
                        Plus anciennes
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres avancés -->
    <div v-if="showAdvanced" class="card border-primary shadow-sm mb-4">
      <div class="card-header bg-primary text-white">
        <h6 class="mb-0">
          <i class="fas fa-sliders-h me-2"></i>
          Filtres avancés
        </h6>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <!-- Dates de création -->
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Date de création (Du)</label>
            <input
              v-model="localFilters.created_from"
              type="date"
              class="form-control"
              @change="applyFilters"
            />
          </div>
          
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Date de création (Au)</label>
            <input
              v-model="localFilters.created_to"
              type="date"
              class="form-control"
              @change="applyFilters"
            />
          </div>

          <!-- Effectifs -->
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Effectifs minimum</label>
            <input
              v-model.number="localFilters.min_effectifs"
              type="number"
              min="0"
              class="form-control"
              placeholder="Ex: 50"
              @input="applyFilters"
            />
          </div>

          <div class="col-md-3">
            <label class="form-label small fw-semibold">Effectifs maximum</label>
            <input
              v-model.number="localFilters.max_effectifs"
              type="number"
              min="0"
              class="form-control"
              placeholder="Ex: 500"
              @input="applyFilters"
            />
          </div>

          <!-- Présence de données -->
          <div class="col-md-6">
            <label class="form-label small fw-semibold">Présence d'effectifs</label>
            <div class="form-check-container">
              <div class="form-check form-check-inline">
                <input 
                  v-model="localFilters.has_effectifs"
                  :value="true"
                  type="radio"
                  class="form-check-input"
                  id="has_effectifs_yes"
                  @change="applyFilters"
                />
                <label class="form-check-label" for="has_effectifs_yes">
                  Avec effectifs
                </label>
              </div>
              <div class="form-check form-check-inline">
                <input 
                  v-model="localFilters.has_effectifs"
                  :value="false"
                  type="radio"
                  class="form-check-input"
                  id="has_effectifs_no"
                  @change="applyFilters"
                />
                <label class="form-check-label" for="has_effectifs_no">
                  Sans effectifs
                </label>
              </div>
              <div class="form-check form-check-inline">
                <input 
                  v-model="localFilters.has_effectifs"
                  :value="null"
                  type="radio"
                  class="form-check-input"
                  id="has_effectifs_all"
                  @change="applyFilters"
                />
                <label class="form-check-label" for="has_effectifs_all">
                  Tous
                </label>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label small fw-semibold">Présence de direction</label>
            <div class="form-check-container">
              <div class="form-check form-check-inline">
                <input 
                  v-model="localFilters.has_direction"
                  :value="true"
                  type="radio"
                  class="form-check-input"
                  id="has_direction_yes"
                  @change="applyFilters"
                />
                <label class="form-check-label" for="has_direction_yes">
                  Avec direction
                </label>
              </div>
              <div class="form-check form-check-inline">
                <input 
                  v-model="localFilters.has_direction"
                  :value="false"
                  type="radio"
                  class="form-check-input"
                  id="has_direction_no"
                  @change="applyFilters"
                />
                <label class="form-check-label" for="has_direction_no">
                  Sans direction
                </label>
              </div>
              <div class="form-check form-check-inline">
                <input 
                  v-model="localFilters.has_direction"
                  :value="null"
                  type="radio"
                  class="form-check-input"
                  id="has_direction_all"
                  @change="applyFilters"
                />
                <label class="form-check-label" for="has_direction_all">
                  Tous
                </label>
              </div>
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
import { debounce } from 'lodash'

export default {
  name: 'EntitiesFilters',
  setup() {
    const store = useStore()
    
    const showAdvanced = ref(false)
    const localFilters = ref({
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
    })

    // Computed
    const filterOptions = computed(() => store.getters['entities/filterOptions'])
    const currentSort = computed(() => store.getters['entities/sort'])
    const isFiltered = computed(() => store.getters['entities/isFiltered'])
    const activeFiltersCount = computed(() => store.getters['entities/activeFiltersCount'])
    const hasEntities = computed(() => store.getters['entities/hasEntities'])
    
    const advancedFiltersCount = computed(() => {
      const advanced = ['created_from', 'created_to', 'has_effectifs', 'has_direction', 'min_effectifs', 'max_effectifs']
      return advanced.filter(key => {
        const value = localFilters.value[key]
        return value !== '' && value !== null && value !== undefined
      }).length
    })

    // Methods
    const debouncedSearch = debounce(() => {
      applyFilters()
    }, 500)

    const applyFilters = async () => {
      await store.dispatch('entities/updateFilters', localFilters.value)
    }

    const clearSearch = () => {
      localFilters.value.search = ''
      applyFilters()
    }

    const resetAllFilters = async () => {
      localFilters.value = {
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
      await store.dispatch('entities/resetFilters')
    }

    const toggleAdvanced = () => {
      showAdvanced.value = !showAdvanced.value
    }

    const updateSort = async (sort_by, sort_order) => {
      await store.dispatch('entities/updateSort', { sort_by, sort_order })
    }

    // Watchers
    watch(() => store.getters['entities/filters'], (newFilters) => {
      localFilters.value = { ...newFilters }
    }, { immediate: true })

    // Lifecycle
    onMounted(async () => {
      await store.dispatch('entities/fetchFilterOptions')
    })

    return {
      showAdvanced,
      localFilters,
      filterOptions,
      currentSort,
      isFiltered,
      activeFiltersCount,
      hasEntities,
      advancedFiltersCount,
      debouncedSearch,
      applyFilters,
      clearSearch,
      resetAllFilters,
      toggleAdvanced,
      updateSort
    }
  }
}
</script>

<style scoped>
.entities-filters .form-check-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.entities-filters .form-check-inline {
  margin-right: 0;
}

.entities-filters .dropdown-item.active {
  background-color: var(--bs-primary);
  color: white;
}

.entities-filters .btn.active {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: white;
}

.card-header h6 {
  font-weight: 600;
}

.badge {
  font-size: 0.75rem;
}
</style>
