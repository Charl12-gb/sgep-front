<template>
  <div class="container">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else-if="entity" class="entity-details">
      <!-- En-tête avec statistiques -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-start mt-4">
            <div class="d-flex gap-2">
              <router-link :to="`/entities/${entity.id}/edit`" class="btn btn-success">
                <i class="fas fa-edit me-1"></i>
                Modifier
              </router-link>
              <button @click="goBack" class="btn btn-outline-secondary">
                <i class="fas fa-arrow-left me-1"></i>
                Retour
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Onglets -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <!-- Navigation des onglets -->
            <div class="card-header bg-white border-bottom-0">
              <ul class="nav nav-tabs card-header-tabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link" :class="{ active: activeTab === 'general' }" @click="setActiveTab('general')"
                    type="button">
                    <i class="fas fa-info-circle me-2"></i>
                    Inf générales
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" :class="{ active: activeTab === 'direction' }"
                    @click="setActiveTab('direction')" type="button">
                    <i class="fas fa-user-tie me-2"></i>
                    Direction Générale
                    <span class="badge bg-primary ms-1">{{ directionGenerale?.length || 0 }}</span>
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" :class="{ active: activeTab === 'board' }" @click="setActiveTab('board')"
                    type="button">
                    <i class="fas fa-users me-2"></i>
                    Mandats
                    <span class="badge bg-primary ms-1">{{ boardCouncils?.length || 0 }}</span>
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" :class="{ active: activeTab === 'officers' }"
                    @click="setActiveTab('officers')" type="button">
                    <i class="fas fa-user-tie me-2"></i>
                    Commissaires aux Comptes
                    <span class="badge bg-success ms-1">{{ accountingOfficers?.length || 0 }}</span>
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" :class="{ active: activeTab === 'tools' }"
                    @click="setActiveTab('tools')" type="button">
                    <i class="fas fa-tools me-2"></i>
                    Outils
                    <span class="badge bg-info ms-1">{{ outilsStats?.total || 0 }}</span>
                  </button>
                </li>
              </ul>
              <hr>
            </div>

            <!-- Contenu des onglets -->
            <div class="card-body">
              <!-- Onglet Informations générales -->
              <EntityGeneralInfo v-show="activeTab === 'general'" :entity="entity" :reload-data="loadEntity" />

              <!-- Onglet Direction Générale -->
              <EntityDirection v-show="activeTab === 'direction'" :directors="directionGenerale" :entity-id="entity.id"
                @save="handleDirectionSave" @delete="handleDirectionDelete" :reload-data="loadEntity" />

              <!-- Onglet Mandats -->
              <MandatesView v-show="activeTab === 'board'" :entityId="entity?.id" />

              <!-- Onglet Commissaires aux Comptes -->
              <EntityOfficers v-show="activeTab === 'officers'" :officers="accountingOfficers" :entity-id="entity.id"
                :reload-data="loadEntity" />

              <!-- Onglet Outils -->
              <EntityTools v-show="activeTab === 'tools'" :entity-id="entity.id"
                :reload-data="loadEntity" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">
      <div class="mb-3">
        <i class="fas fa-exclamation-triangle fa-3x text-warning"></i>
      </div>
      <h5 class="text-muted">Entité non trouvée</h5>
      <p class="text-muted mb-4">L'entité demandée n'existe pas ou a été supprimée.</p>
      <router-link to="/entities" class="btn btn-success">
        <i class="fas fa-arrow-left me-2"></i>
        Retour à la liste
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'

// Import des composants
import EntityGeneralInfo from '@/components/entity/EntityGeneralInfo.vue'
import EntityDirection from '@/components/entity/EntityDirection.vue'
import MandatesView from '@/components/entity/MandatesView.vue'
import EntityOfficers from '@/components/entity/EntityOfficers.vue'
import EntityTools from '@/components/entity/EntityTools.vue'
export default {
  name: 'EntitiesShowView',
  components: {
    EntityGeneralInfo,
    EntityDirection,
    MandatesView,
    EntityOfficers,
    EntityTools
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const { notifyError, notifySuccess } = useNotyf()

    const loading = ref(false)
    const activeTab = ref('general')

    // Computed properties
    const entity = computed(() => store.getters['entities/entity'])
    const entityStats = computed(() => store.getters['entities/entityStats'])
    const boardCouncils = computed(() => store.getters['boardCouncils/boardCouncils'])
    const accountingOfficers = computed(() => {
      const byEntity = store.getters['accountingOfficers/accountingOfficersByEntity'] || []
      const all = store.getters['accountingOfficers/accountingOfficers'] || []
      return (byEntity && byEntity.length > 0) ? byEntity : all
    })
    
    // Calculer les statistiques des outils depuis les réponses
    const outilsStats = computed(() => {
      const reponses = store.getters['outils/entityOutilsReponses'] || []
      const outils = store.getters['outils/outils'] || []
      
      const total = outils.length
      const completed = reponses.filter(reponse => {
        // Considérer comme complété si au moins un champ de réponse est rempli
        return reponse.reponse_boolean !== null || 
               (reponse.reponse_text && reponse.reponse_text.trim() !== '') ||
               (reponse.reponse_json && Array.isArray(reponse.reponse_json) && reponse.reponse_json.length > 0)
      }).length
      
      return {
        total,
        completed,
        pending: total - completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      }
    })

    // Direction générale
    const directionGenerale = ref([])

    // S'assurer que directionGenerale a toujours une valeur
    const directionGeneraleComputed = computed(() => directionGenerale.value || [])

    // Méthodes principales
    const loadEntity = async () => {
      loading.value = true
      try {
        await store.dispatch('entities/fetchEntityById', route.params.id)
        await store.dispatch('entities/fetchEntityStats', route.params.id)

        // Chargement initial des données pour tous les onglets
        await Promise.all([
          loadDirectionGenerale(),
          loadBoardCouncils(),
          loadAccountingOfficers(),
          loadOutils()
        ])
      } catch (error) {
        console.error(error)
        notifyError('Erreur lors du chargement de l\'entité')
      } finally {
        loading.value = false
      }
    }

    const loadDirectionGenerale = async () => {
      try {
        if (entity.value && entity.value.direction_generale) {
          directionGenerale.value = [...entity.value.direction_generale]
        }
      } catch (error) {
        notifyError('Erreur lors du chargement de la direction générale')
      }
    }

    const loadBoardCouncils = async () => {
      try {
        await store.dispatch('boardCouncils/fetchBoardCouncils', {
          params: {
            entity_id: route.params.id
          }
        })
      } catch (error) {
        notifyError('Erreur lors du chargement des administrateurs')
      }
    }

    const loadAccountingOfficers = async (params = {}) => {
      try {
        await store.dispatch('accountingOfficers/fetchAccountingOfficersByEntity', {
          entityId: route.params.id,
          page: params.page || 1,
          limit: params.limit || 50
        })
      } catch (error) {
        notifyError('Erreur lors du chargement des commissaires')
      }
    }

    const loadOutils = async () => {
      try {
        // Charger les outils disponibles
        await store.dispatch('outils/fetchOutils')
        
        // Charger les réponses de l'entité pour l'année courante
        await store.dispatch('outils/fetchEntityOutilsReponses', {
          entityId: route.params.id,
          annee: new Date().getFullYear()
        })
      } catch (error) {
        notifyError('Erreur lors du chargement des outils')
      }
    }

    // Handler pour la Direction Générale (simplifié)
    const handleDirectionDataUpdated = () => {
      // Recharger les données de la direction générale
      loadDirectionGenerale()

      // Optionnellement, recharger les statistiques de l'entité
      store.dispatch('entities/fetchEntityStats', route.params.id)
    }

    const handleDirectionSave = async (directionData) => {
      try {
        // Cette fonction sera gérée par le composant EntityDirection
        // On recharge juste les données après la sauvegarde
        await loadDirectionGenerale()
        notifySuccess('Direction générale sauvegardée')
      } catch (error) {
        notifyError('Erreur lors de la sauvegarde de la direction générale')
      }
    }

    const handleDirectionDelete = async (directionId) => {
      try {
        // Cette fonction sera gérée par le composant EntityDirection
        // On recharge juste les données après la suppression
        await loadDirectionGenerale()
        notifySuccess('Direction générale supprimée')
      } catch (error) {
        notifyError('Erreur lors de la suppression de la direction générale')
      }
    }

    // tools managed in EntityTools component

    const setActiveTab = (tab) => {
      activeTab.value = tab
    }

    const goBack = () => {
      router.go(-1)
    }

    onMounted(() => {
      loadEntity()
    })

    return {
      entity,
      entityStats,
      boardCouncils,
      accountingOfficers,
      directionGenerale: directionGeneraleComputed,
      outilsStats,
      loading,
      activeTab,
      setActiveTab,
      goBack,
      handleDirectionDataUpdated,
      handleDirectionSave,
      handleDirectionDelete,
      loadEntity
    }
  }
}
</script>