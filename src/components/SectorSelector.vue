<template>
  <div class="sector-selector">
    <!-- Sélection avec catégories -->
    <div v-if="mode === 'categories'" class="category-mode">
      <select
        :id="inputId"
        v-model="localValue"
        :class="selectClasses"
        :multiple="multiple"
        :size="selectSize"
        :style="selectStyle"
        :required="required"
        @change="handleChange"
      >
        <optgroup 
          v-for="(sectors, categoryName) in sectorsByCategory" 
          :key="categoryName" 
          :label="categoryName"
        >
          <option 
            v-for="sector in sectors" 
            :key="sector" 
            :value="sector"
            :disabled="isDisabled(sector)"
          >
            {{ sector }}
          </option>
        </optgroup>
      </select>
    </div>

    <!-- Sélection simple -->
    <div v-else-if="mode === 'simple'" class="simple-mode">
      <select
        :id="inputId"
        v-model="localValue"
        :class="selectClasses"
        :multiple="multiple"
        :required="required"
        @change="handleChange"
      >
        <option v-if="!multiple" value="">{{ placeholder }}</option>
        <option 
          v-for="sector in availableSectors" 
          :key="sector" 
          :value="sector"
          :disabled="isDisabled(sector)"
        >
          {{ sector }}
        </option>
      </select>
    </div>

    <!-- Mode avec recherche -->
    <div v-else-if="mode === 'search'" class="search-mode">
      <!-- Barre de recherche -->
      <div class="search-input-container mb-2">
        <div class="input-group">
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
          <input
            v-model="searchTerm"
            type="text"
            class="form-control"
            :placeholder="searchPlaceholder"
            @input="handleSearch"
          />
          <button 
            v-if="searchTerm"
            type="button"
            class="btn btn-outline-secondary"
            @click="clearSearch"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Résultats de recherche ou secteurs populaires -->
      <div class="search-results" style="max-height: 200px; overflow-y: auto;">
        <div v-if="searchTerm && filteredSectors.length === 0" class="text-muted text-center py-3">
          <i class="fas fa-search me-2"></i>
          {{ noResultsText }}
        </div>
        <div v-else class="d-flex flex-wrap gap-1">
          <button
            v-for="sector in displayedSectors"
            :key="sector"
            type="button"
            class="btn btn-outline-primary btn-sm"
            :class="{ 'active': isSelected(sector) }"
            :disabled="isDisabled(sector)"
            @click="toggleSector(sector)"
          >
            <i v-if="isSelected(sector)" class="fas fa-check me-1"></i>
            {{ sector }}
          </button>
        </div>
      </div>
    </div>

    <!-- Mode badges (sélection visuelle) -->
    <div v-else-if="mode === 'badges'" class="badges-mode">
      <!-- Secteurs populaires comme badges cliquables -->
      <div class="popular-sectors mb-3">
        <small class="text-muted d-block mb-2">Secteurs populaires :</small>
        <div class="d-flex flex-wrap gap-1">
          <button
            v-for="sector in popularSectors"
            :key="sector"
            type="button"
            class="btn btn-sm"
            :class="isSelected(sector) ? 'btn-primary' : 'btn-outline-primary'"
            :disabled="isDisabled(sector)"
            @click="toggleSector(sector)"
          >
            <i v-if="isSelected(sector)" class="fas fa-check me-1"></i>
            {{ sector }}
          </button>
        </div>
      </div>

      <!-- Autres secteurs dans un collapse -->
      <div class="other-sectors">
        <button
          type="button"
          class="btn btn-link btn-sm p-0 mb-2"
          @click="showAllSectors = !showAllSectors"
        >
          <i :class="showAllSectors ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="me-1"></i>
          {{ showAllSectors ? 'Masquer' : 'Voir tous les secteurs' }}
        </button>
        
        <div v-show="showAllSectors" class="all-sectors" style="max-height: 300px; overflow-y: auto;">
          <div v-for="(sectors, category) in sectorsByCategory" :key="category" class="mb-3">
            <h6 class="fw-semibold text-muted mb-2">{{ category }}</h6>
            <div class="d-flex flex-wrap gap-1 mb-2">
              <button
                v-for="sector in sectors"
                :key="sector"
                type="button"
                class="btn btn-sm"
                :class="isSelected(sector) ? 'btn-success' : 'btn-outline-secondary'"
                :disabled="isDisabled(sector)"
                @click="toggleSector(sector)"
              >
                <i v-if="isSelected(sector)" class="fas fa-check me-1"></i>
                {{ sector }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Texte d'aide -->
    <div v-if="helpText" class="form-text mt-2">
      <i class="fas fa-info-circle me-1"></i>
      {{ helpText }}
    </div>

    <!-- Secteurs sélectionnés (affichage) -->
    <div v-if="showSelectedSectors && selectedSectorsArray.length > 0" class="selected-sectors mt-3">
      <small class="text-muted d-block mb-2">Secteurs sélectionnés :</small>
      <div class="d-flex flex-wrap gap-1">
        <span 
          v-for="sector in selectedSectorsArray" 
          :key="sector"
          class="badge bg-primary"
        >
          {{ sector }}
          <button 
            v-if="!readonly"
            type="button"
            class="btn-close btn-close-white ms-1"
            style="font-size: 0.7em;"
            @click="removeSector(sector)"
          ></button>
        </span>
      </div>
    </div>

    <!-- Valeur formatée -->
    <div v-if="showFormattedValue && selectedSectorsArray.length > 0" class="formatted-value mt-2">
      <small class="text-muted d-block mb-1">Valeur formatée :</small>
      <div class="p-2 bg-light border rounded">
        <code class="text-primary">{{ formattedValue }}</code>
      </div>
    </div>

    <!-- Validation -->
    <div v-if="error" class="invalid-feedback d-block mt-1">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { 
  getSectorsByCategory, 
  getPopularSectors, 
  searchSectors,
  formatSectorsString,
  parseSectorsString,
  isValidSector
} from '@/utils/sectorsHelper'

export default {
  name: 'SectorSelector',
  props: {
    // Valeur
    modelValue: {
      type: [String, Array],
      default: () => []
    },
    
    // Mode d'affichage
    mode: {
      type: String,
      default: 'categories', // 'categories', 'simple', 'search', 'badges'
      validator: (value) => ['categories', 'simple', 'search', 'badges'].includes(value)
    },
    
    // Configuration de base
    multiple: {
      type: Boolean,
      default: true
    },
    required: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    
    // Secteurs disponibles (par défaut tous)
    availableSectors: {
      type: Array,
      default: null
    },
    
    // Limites
    maxSelections: {
      type: Number,
      default: null
    },
    
    // Textes
    placeholder: {
      type: String,
      default: 'Sélectionner un secteur'
    },
    searchPlaceholder: {
      type: String,
      default: 'Rechercher un secteur...'
    },
    noResultsText: {
      type: String,
      default: 'Aucun secteur trouvé'
    },
    helpText: {
      type: String,
      default: null
    },
    
    // Classes CSS
    selectClasses: {
      type: String,
      default: 'form-select'
    },
    
    // Style pour le select
    selectSize: {
      type: Number,
      default: 8
    },
    selectStyle: {
      type: String,
      default: 'height: 200px;'
    },
    
    // Options d'affichage
    showSelectedSectors: {
      type: Boolean,
      default: true
    },
    showFormattedValue: {
      type: Boolean,
      default: false
    },
    
    // Validation
    error: {
      type: String,
      default: null
    },
    
    // ID pour le label
    inputId: {
      type: String,
      default: () => `sector-select-${Math.random().toString(36).substr(2, 9)}`
    }
  },
  
  emits: ['update:modelValue', 'change', 'search'],
  
  setup(props, { emit }) {
    // État local
    const localValue = ref(props.multiple ? [] : '')
    const searchTerm = ref('')
    const showAllSectors = ref(false)
    
    // Données des secteurs
    const sectorsByCategory = getSectorsByCategory()
    const popularSectors = getPopularSectors()
    
    // Secteurs disponibles
    const sectorsToUse = computed(() => {
      if (props.availableSectors) return props.availableSectors
      
      const allSectors = []
      Object.values(sectorsByCategory).forEach(categoryArray => {
        allSectors.push(...categoryArray)
      })
      return allSectors.sort()
    })
    
    // Résultats de recherche
    const filteredSectors = computed(() => {
      if (!searchTerm.value) return popularSectors
      return searchSectors(searchTerm.value)
    })
    
    // Secteurs affichés selon le mode
    const displayedSectors = computed(() => {
      return searchTerm.value ? filteredSectors.value : popularSectors
    })
    
    // Secteurs sélectionnés en tant qu'array
    const selectedSectorsArray = computed(() => {
      if (props.multiple) {
        return Array.isArray(localValue.value) ? localValue.value : []
      } else {
        return localValue.value ? [localValue.value] : []
      }
    })
    
    // Valeur formatée
    const formattedValue = computed(() => {
      return formatSectorsString(selectedSectorsArray.value)
    })
    
    // Méthodes
    const isSelected = (sector) => {
      return selectedSectorsArray.value.includes(sector)
    }
    
    const isDisabled = (sector) => {
      if (props.readonly) return true
      if (!props.maxSelections) return false
      return !isSelected(sector) && selectedSectorsArray.value.length >= props.maxSelections
    }
    
    const toggleSector = (sector) => {
      if (props.readonly) return
      
      if (props.multiple) {
        const current = [...localValue.value]
        const index = current.indexOf(sector)
        
        if (index > -1) {
          current.splice(index, 1)
        } else {
          if (!props.maxSelections || current.length < props.maxSelections) {
            current.push(sector)
          }
        }
        
        localValue.value = current
      } else {
        localValue.value = isSelected(sector) ? '' : sector
      }
      
      emitChange()
    }
    
    const removeSector = (sector) => {
      if (props.readonly) return
      
      if (props.multiple) {
        const current = [...localValue.value]
        const index = current.indexOf(sector)
        if (index > -1) {
          current.splice(index, 1)
          localValue.value = current
        }
      } else {
        localValue.value = ''
      }
      
      emitChange()
    }
    
    const handleChange = () => {
      emitChange()
    }
    
    const handleSearch = () => {
      emit('search', searchTerm.value)
    }
    
    const clearSearch = () => {
      searchTerm.value = ''
      emit('search', '')
    }
    
    const emitChange = () => {
      emit('update:modelValue', localValue.value)
      emit('change', localValue.value)
    }
    
    // Synchronisation avec la prop modelValue
    watch(() => props.modelValue, (newValue) => {
      if (props.multiple) {
        if (typeof newValue === 'string') {
          localValue.value = parseSectorsString(newValue)
        } else {
          localValue.value = Array.isArray(newValue) ? [...newValue] : []
        }
      } else {
        localValue.value = newValue || ''
      }
    }, { immediate: true })
    
    return {
      localValue,
      searchTerm,
      showAllSectors,
      sectorsByCategory,
      popularSectors,
      sectorsToUse,
      filteredSectors,
      displayedSectors,
      selectedSectorsArray,
      formattedValue,
      isSelected,
      isDisabled,
      toggleSector,
      removeSector,
      handleChange,
      handleSearch,
      clearSearch
    }
  }
}
</script>

<style scoped>
/* Amélioration de l'apparence du select multiple */
select[multiple] {
  border: 2px solid #e9ecef;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

select[multiple]:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

select[multiple] option {
  padding: 0.375rem 0.5rem;
  margin: 0.125rem 0;
  border-radius: 0.25rem;
}

select[multiple] option:hover {
  background-color: #f8f9fa;
}

select[multiple] option:checked {
  background-color: #0d6efd;
  color: white;
}

/* Style pour les optgroups */
select[multiple] optgroup {
  font-weight: bold;
  color: #495057;
  background-color: #f8f9fa;
  font-size: 0.875rem;
}

select[multiple] optgroup option {
  font-weight: normal;
  padding-left: 1rem;
}

/* Style pour les badges */
.badge {
  display: inline-flex;
  align-items: center;
}

/* Animation pour les boutons */
.btn {
  transition: all 0.2s ease-in-out;
}

/* Mode search */
.search-results {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
}

/* Mode badges */
.popular-sectors {
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  padding: 1rem;
}

.other-sectors {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 0.75rem;
}

/* Secteurs sélectionnés */
.selected-sectors {
  background-color: #e7f3ff;
  border-radius: 0.375rem;
  padding: 0.75rem;
}

/* Valeur formatée */
.formatted-value {
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  padding: 0.5rem;
}
</style>