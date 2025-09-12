<template>
  <div class="container mt-4">
    <!-- En-tête de page -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h3 mb-1 text-dark fw-bold">
              <i class="fas fa-building text-primary me-2"></i>
              Gestion des Entités
            </h1>
            <p class="text-muted mb-0">Gérez vos établissements et sociétés</p>
          </div>
          <router-link to="/entities/create" class="btn btn-success btn-lg shadow-sm">
            <i class="fas fa-plus me-2"></i>
            Nouvelle entité
          </router-link>
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <EntitiesStats />
    
    <!-- Filtres -->
    <EntitiesFilters />
    
    <!-- Tableau des entités -->
    <div class="row">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white py-3">
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0 text-dark fw-semibold">
                Liste des entités
                <span class="badge bg-light text-dark ms-2">{{ pagination.total }}</span>
              </h6>
              
              <div class="d-flex gap-2">
                <!-- Vue compacte/étendue -->
                <div class="btn-group" role="group">
                  <input 
                    type="radio" 
                    class="btn-check" 
                    name="viewMode" 
                    id="compact" 
                    v-model="viewMode" 
                    value="compact"
                  />
                  <label class="btn btn-outline-secondary btn-sm" for="compact">
                    <i class="fas fa-list"></i>
                  </label>

                  <input 
                    type="radio" 
                    class="btn-check" 
                    name="viewMode" 
                    id="detailed" 
                    v-model="viewMode" 
                    value="detailed"
                  />
                  <label class="btn btn-outline-secondary btn-sm" for="detailed">
                    <i class="fas fa-th-large"></i>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card-body p-0">
            <!-- Chargement -->
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
              <p class="text-muted mt-2">Chargement des entités...</p>
            </div>

            <!-- Vue tableau compacte -->
            <div v-else-if="viewMode === 'compact'" class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="border-0 fw-semibold text-dark">
                      <button 
                        @click="toggleSort('name')"
                        class="btn btn-link p-0 text-decoration-none text-dark fw-semibold"
                      >
                        Entité
                        <i 
                          :class="{
                            'fas fa-sort': currentSort.sort_by !== 'name',
                            'fas fa-sort-up': currentSort.sort_by === 'name' && currentSort.sort_order === 'asc',
                            'fas fa-sort-down': currentSort.sort_by === 'name' && currentSort.sort_order === 'desc'
                          }"
                          class="ms-1"
                        ></i>
                      </button>
                    </th>
                    <th class="border-0 fw-semibold text-dark">Type</th>
                    <th class="border-0 fw-semibold text-dark">Secteur</th>
                    <th class="border-0 fw-semibold text-dark">Contact</th>
                    <th class="border-0 fw-semibold text-dark">
                      <button 
                        @click="toggleSort('created_at')"
                        class="btn btn-link p-0 text-decoration-none text-dark fw-semibold"
                      >
                        Créé le
                        <i 
                          :class="{
                            'fas fa-sort': currentSort.sort_by !== 'created_at',
                            'fas fa-sort-up': currentSort.sort_by === 'created_at' && currentSort.sort_order === 'asc',
                            'fas fa-sort-down': currentSort.sort_by === 'created_at' && currentSort.sort_order === 'desc'
                          }"
                          class="ms-1"
                        ></i>
                      </button>
                    </th>
                    <th class="border-0 fw-semibold text-dark text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entity in entities" :key="entity.id" class="align-middle">
                    <td class="py-3">
                      <div>
                        <h6 class="mb-1 fw-semibold text-dark">
                          {{ entity.name }}
                          <span v-if="entity.sigle" class="badge bg-light text-dark ms-2">{{ entity.sigle }}</span>
                        </h6>
                        <small class="text-muted">
                          <i class="fas fa-map-marker-alt me-1"></i>
                          {{ entity.address }}
                        </small>
                        <div v-if="entity.tutelle" class="mt-1">
                          <small class="text-muted">
                            <i class="fas fa-building me-1"></i>
                            Tutelle: {{ entity.tutelle }}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span 
                        :class="{
                          'badge fs-6 px-3 py-2': true,
                          'bg-primary': entity.type === 'Establishment',
                          'bg-success': entity.type === 'Society'
                        }"
                      >
                        {{ entity.type }}
                      </span>
                    </td>
                    <td>
                      <span v-if="entity.secteur_activite" class="text-muted">
                        {{ entity.secteur_activite }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <div>
                        <div class="text-dark">
                          <i class="fas fa-envelope text-muted me-2"></i>
                          {{ entity.email }}
                        </div>
                        <small v-if="entity.phone" class="text-muted">
                          <i class="fas fa-phone text-muted me-2"></i>
                          {{ entity.phone }}
                        </small>
                      </div>
                    </td>
                    <td>
                      <small class="text-muted">
                        {{ formatDate(entity.created_at) }}
                      </small>
                    </td>
                    <td class="text-center">
                      <div class="btn-group" role="group">
                        <router-link
                          :to="`/entities/${entity.id}`"
                          class="btn btn-outline-primary btn-sm"
                          title="Voir les détails"
                        >
                          <i class="fas fa-eye"></i>
                        </router-link>
                        <router-link
                          :to="`/entities/${entity.id}/edit`"
                          class="btn btn-outline-secondary btn-sm"
                          title="Modifier"
                        >
                          <i class="fas fa-edit"></i>
                        </router-link>
                        <button
                          @click="deleteEntity(entity)"
                          class="btn btn-outline-danger btn-sm"
                          title="Supprimer"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Vue cartes détaillée -->
            <div v-else class="p-4">
              <div class="row g-4">
                <div v-for="entity in entities" :key="entity.id" class="col-lg-6 col-xl-4">
                  <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="flex-grow-1">
                          <h6 class="card-title mb-1">
                            {{ entity.name }}
                            <span v-if="entity.sigle" class="badge bg-light text-dark ms-1">{{ entity.sigle }}</span>
                          </h6>
                          <span 
                            :class="{
                              'badge': true,
                              'bg-primary': entity.type === 'Establishment',
                              'bg-success': entity.type === 'Society'
                            }"
                          >
                            {{ entity.type }}
                          </span>
                        </div>
                        <div class="dropdown">
                          <button class="btn btn-outline-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                            <i class="fas fa-ellipsis-v"></i>
                          </button>
                          <ul class="dropdown-menu">
                            <li>
                              <router-link :to="`/entities/${entity.id}`" class="dropdown-item">
                                <i class="fas fa-eye me-2"></i>Voir les détails
                              </router-link>
                            </li>
                            <li>
                              <router-link :to="`/entities/${entity.id}/edit`" class="dropdown-item">
                                <i class="fas fa-edit me-2"></i>Modifier
                              </router-link>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                              <button @click="deleteEntity(entity)" class="dropdown-item text-danger">
                                <i class="fas fa-trash me-2"></i>Supprimer
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div class="mb-3">
                        <small class="text-muted">
                          <i class="fas fa-map-marker-alt me-1"></i>
                          {{ entity.address }}
                        </small>
                      </div>

                      <div class="mb-3">
                        <div class="text-dark">
                          <i class="fas fa-envelope text-muted me-2"></i>
                          <small>{{ entity.email }}</small>
                        </div>
                        <div v-if="entity.phone" class="text-dark">
                          <i class="fas fa-phone text-muted me-2"></i>
                          <small>{{ entity.phone }}</small>
                        </div>
                      </div>

                      <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                          Créé le {{ formatDate(entity.created_at) }}
                        </small>
                        <div class="d-flex gap-1">
                          <span v-if="entity.effectifs?.length > 0" class="badge bg-success" title="Avec effectifs">
                            <i class="fas fa-users"></i>
                          </span>
                          <span v-if="entity.direction_generale?.length > 0" class="badge bg-info" title="Avec direction">
                            <i class="fas fa-user-tie"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- État vide -->
            <div v-if="!loading && entities.length === 0" class="text-center py-5">
              <div class="mb-3">
                <i class="fas fa-building fa-3x text-muted opacity-50"></i>
              </div>
              <h5 class="text-muted">Aucune entité trouvée</h5>
              <p class="text-muted mb-4">
                {{ isFiltered ? 'Aucun résultat ne correspond à vos critères de recherche' : 'Commencez par créer votre première entité' }}
              </p>
              <div class="d-flex gap-2 justify-content-center">
                <router-link v-if="!isFiltered" to="/entities/create" class="btn btn-success">
                  <i class="fas fa-plus me-2"></i>
                  Créer une entité
                </router-link>
                <button v-if="isFiltered" @click="clearFilters" class="btn btn-outline-primary">
                  <i class="fas fa-times me-2"></i>
                  Effacer les filtres
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pagination -->
    <div v-if="pagination.total > 0" class="mt-4">
      <EntitiesPagination />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'
import EntitiesFilters from '@/components/entities/EntitiesFilters.vue'
import EntitiesPagination from '@/components/entities/EntitiesPagination.vue'
import EntitiesStats from '@/components/entities/EntitiesStats.vue'

export default {
  name: 'EntitiesListView',
  components: {
    EntitiesFilters,
    EntitiesPagination,
    EntitiesStats
  },
  setup() {
    const store = useStore()
    const { notifySuccess, notifyError, notifyConfirm } = useNotyf()
    
    const viewMode = ref('compact') // 'compact' ou 'detailed'
    
    // Computed properties
    const entities = computed(() => store.getters['entities/entities'])
    const loading = computed(() => store.getters['entities/loading'])
    const pagination = computed(() => store.getters['entities/pagination'])
    const currentSort = computed(() => store.getters['entities/sort'])
    const isFiltered = computed(() => store.getters['entities/isFiltered'])
    
    // Methods
    const loadEntities = async () => {
      try {
        await store.dispatch('entities/fetchEntities')
      } catch (error) {
        notifyError('Erreur lors du chargement des entités')
      }
    }
    
    const deleteEntity = async (entity) => {
      const confirmed = await notifyConfirm(
        `Êtes-vous sûr de vouloir supprimer l'entité "${entity.name}" ?`,
        'Cette action est irréversible.'
      )
      
      if (confirmed) {
        try {
          await store.dispatch('entities/deleteEntity', entity.id)
          notifySuccess('Entité supprimée avec succès')
          await loadEntities()
        } catch (error) {
          notifyError('Erreur lors de la suppression de l\'entité')
        }
      }
    }
    
    const toggleSort = async (field) => {
      const currentField = currentSort.value.sort_by
      const currentOrder = currentSort.value.sort_order
      
      let newOrder = 'asc'
      if (currentField === field && currentOrder === 'asc') {
        newOrder = 'desc'
      }
      
      await store.dispatch('entities/updateSort', {
        sort_by: field,
        sort_order: newOrder
      })
    }
    
    const clearFilters = async () => {
      await store.dispatch('entities/resetFilters')
    }
    
    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('fr-FR')
    }
    
    // Lifecycle
    onMounted(async () => {
      await loadEntities()
    })
    
    return {
      viewMode,
      entities,
      loading,
      pagination,
      currentSort,
      isFiltered,
      deleteEntity,
      toggleSort,
      clearFilters,
      formatDate
    }
  }
}
</script>