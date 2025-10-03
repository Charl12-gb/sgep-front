<template>
  <div class="container">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else-if="entity" class="entity-details">

      <!-- Onglets -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <!-- Navigation des onglets -->
            <div class="card-header bg-white border-bottom-0">
              <div class="d-flex justify-content-between align-items-center">
                <!-- Bouton retour au tableau de bord (visible seulement sur les autres onglets) -->
                <div v-if="activeTab !== 'dashboard'" class="ms-3">
                  <button @click="goBackToDashboard" class="btn btn-outline-primary btn-sm">
                    <i class="fas fa-arrow-left me-2"></i>
                    Retour au tableau de bord
                  </button>
                </div>
              </div>
              <hr>
            </div>

            <div class="card-body">
              <div v-show="activeTab === 'dashboard'" class="dashboard-content">
                <!-- Informations de base de l'entité -->
                <div class="row mb-1">
                  <div class="col-12">
                    <div class="card border-0 shadow-sm bg-light">
                      <div class="card-body">
                        <div class="row g-4">
                          <div class="col-md-5">
                            <div class="border-start border-primary border-4 ps-3">
                              <h6 class="text-muted text-uppercase small mb-1">Sigle</h6>
                              <p class="mb-0 fw-semibold">{{ entity.sigle || 'Non renseigné' }}
                                <router-link :to="`/entities/${entity.id}/edit`" class="btn btn-light btn-sm" title="Modifier l'entité">
                                  <i class="fas fa-edit"></i>
                                </router-link>
                              </p>
                              {{ entity.name }}
                            </div>
                          </div>
                          <div class="col-md-4" v-if="entity.secteur_activite">
                            <div class="border-start border-success border-4 ps-3">
                              <h6 class="text-muted text-uppercase small mb-1">Secteur d'activité</h6>
                              <p class="mb-0 fw-semibold">{{ entity.secteur_activite }}</p>
                              <p class="mb-0 fw-bold text-success fs-5">{{ formatCurrency(entity.capital_social) }}</p>
                            </div>
                          </div>
                          <div class="col-md-3" v-if="entity.email || entity.phone">
                            <div class="border-start border-info border-4 ps-3">
                              <h6 class="text-muted text-uppercase small mb-1">Contact</h6>
                              <p class="mb-1" v-if="entity.email">
                                <i class="fas fa-envelope me-2"></i>
                                <a :href="`mailto:${entity.email}`" class="text-decoration-none">{{ entity.email }}</a>
                              </p>
                              <p class="mb-0" v-if="entity.phone">
                                <i class="fas fa-phone me-2"></i>
                                <a :href="`tel:${entity.phone}`" class="text-decoration-none">{{ entity.phone }}</a>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Boutons d'actions -->
                <div class="row mb-5">
                  <div class="col-12">
                    <div class="card border-0 shadow-sm">
                      <div class="card-body">
                        <!-- Première ligne -->
                        <div class="row g-3 mb-3">

                          <!-- Direction Générale -->
                          <div class="col-md-4">
                            <button @click="setActiveTab('direction')"
                              class="btn btn-success btn-lg w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                              style="min-height: 120px;">
                              <i class="fas fa-user-tie fa-2x mb-2"></i>
                              <span class="fw-semibold">Direction Générale</span>
                              <small class="text-muted">{{ directionGenerale?.length || 0 }} membre(s)</small>
                            </button>
                          </div>

                          <!-- Mandats -->
                          <div class="col-md-4">
                            <button @click="setActiveTab('board')"
                              class="btn btn-warning btn-lg w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                              style="min-height: 120px;">
                              <i class="fas fa-users fa-2x mb-2"></i>
                              <span class="fw-semibold">
                                Conseils d'administration
                              </span>
                              <small class="text-muted">{{ boardCouncils?.length || 0 }} mandat(s)</small>
                            </button>
                          </div>

                          <!-- Commissaires aux Comptes -->
                          <div class="col-md-4">
                            <button @click="setActiveTab('officers')"
                              class="btn btn-info btn-lg w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                              style="min-height: 120px;">
                              <i class="fas fa-calculator fa-2x mb-2"></i>
                              <span class="fw-semibold">Commissaires aux Comptes</span>
                              <small class="text-muted">{{ accountingOfficers?.length || 0 }} commissaire(s)</small>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tableau des effectifs -->
                <div class="row">
                  <div class="col-12">
                    <div class="card border-0 shadow-sm">
                      <div class="card-header bg-white">
                        <div class="d-flex justify-content-between align-items-center">
                          <h5 class="mb-0">
                            <i class="fas fa-users me-2"></i>
                            Effectifs par année
                          </h5>
                          <button class="btn btn-success btn-sm" @click="openEffectifModal()">
                            <i class="fas fa-plus me-1"></i>
                            Ajouter un effectif
                          </button>
                        </div>
                      </div>
                      <div class="card-body">
                        <div class="table-responsive" v-if="entity.effectifs && entity.effectifs.length > 0">
                          <table class="table table-hover">
                            <thead class="table-light">
                              <tr>
                                <th>Année</th>
                                <th>Hommes</th>
                                <th>Femmes</th>
                                <th>Total</th>
                                <th>Répartition</th>
                                <th class="text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="effectif in sortedEffectifs" :key="effectif.id">
                                <td class="fw-semibold">{{ effectif.annee }}</td>
                                <td>
                                  <span class="badge bg-primary">{{ effectif.nombre_homme }}</span>
                                </td>
                                <td>
                                  <span class="badge bg-success">{{ effectif.nombre_femme }}</span>
                                </td>
                                <td class="fw-bold">{{ effectif.nombre_total || (effectif.nombre_homme + effectif.nombre_femme) }}</td>
                                <td>
                                  <div class="d-flex align-items-center">
                                    <div class="progress flex-grow-1 me-2" style="height: 20px;">
                                      <div class="progress-bar bg-primary" role="progressbar" 
                                           :style="`width: ${getPercentage(effectif.nombre_homme, effectif.nombre_total || (effectif.nombre_homme + effectif.nombre_femme))}%`">
                                      </div>
                                      <div class="progress-bar bg-success" role="progressbar" 
                                           :style="`width: ${getPercentage(effectif.nombre_femme, effectif.nombre_total || (effectif.nombre_homme + effectif.nombre_femme))}%`">
                                      </div>
                                    </div>
                                    <small class="text-muted">
                                      {{ Math.round(getPercentage(effectif.nombre_homme, effectif.nombre_total || (effectif.nombre_homme + effectif.nombre_femme))) }}% / 
                                      {{ Math.round(getPercentage(effectif.nombre_femme, effectif.nombre_total || (effectif.nombre_homme + effectif.nombre_femme))) }}%
                                    </small>
                                  </div>
                                </td>
                                <td class="text-center">
                                  <div class="btn-group" role="group">
                                    <button class="btn btn-outline-primary btn-sm" title="Modifier" @click="editEffectif(effectif)">
                                      <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm" title="Supprimer" @click="confirmDeleteEffectif(effectif)">
                                      <i class="fas fa-trash"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div v-else class="text-center py-4">
                          <div class="mb-3">
                            <i class="fas fa-users fa-3x text-muted"></i>
                          </div>
                          <h6 class="text-muted">Aucun effectif enregistré</h6>
                          <p class="text-muted mb-3">Commencez par ajouter les effectifs de votre entité.</p>
                          <button class="btn btn-success" @click="openEffectifModal()">
                            <i class="fas fa-plus me-1"></i>
                            Ajouter le premier effectif
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Modal Ajout/Modification Effectif -->
                <div class="modal fade" id="effectifModal" tabindex="-1" aria-hidden="true">
                  <div class="modal-dialog">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title">{{ isEditingEffectif ? 'Modifier' : 'Ajouter' }} un effectif</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                        <form @submit.prevent="saveEffectif">
                          <div class="row g-3">
                            <div class="col-md-6">
                              <label class="form-label fw-semibold">Année <span class="text-danger">*</span></label>
                              <input type="number" v-model="effectifForm.annee" class="form-control" required min="1900" max="2100">
                            </div>
                            <div class="col-md-6">
                              <label class="form-label fw-semibold">Nombre total <span class="text-danger">*</span></label>
                              <input type="number" :value="effectifForm.nombre_homme + effectifForm.nombre_femme" class="form-control" readonly>
                            </div>
                            <div class="col-md-6">
                              <label class="form-label fw-semibold">Nombre d'hommes <span class="text-danger">*</span></label>
                              <input type="number" v-model="effectifForm.nombre_homme" class="form-control" required min="0">
                            </div>
                            <div class="col-md-6">
                              <label class="form-label fw-semibold">Nombre de femmes <span class="text-danger">*</span></label>
                              <input type="number" v-model="effectifForm.nombre_femme" class="form-control" required min="0">
                            </div>
                          </div>
                          <div class="d-flex justify-content-end gap-2 mt-4">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="submit" class="btn btn-success" :disabled="loadingEffectif">
                              <i v-if="loadingEffectif" class="fas fa-spinner fa-spin me-2"></i>
                              {{ isEditingEffectif ? 'Mettre à jour' : 'Ajouter' }}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Modal Confirmation Suppression Effectif -->
                <div class="modal fade" id="deleteEffectifModal" tabindex="-1" aria-hidden="true">
                  <div class="modal-dialog modal-sm">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title">Confirmer la suppression</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                        <p>Êtes-vous sûr de vouloir supprimer cet effectif ?</p>
                        <p class="text-danger fw-semibold mb-0" v-if="effectifToDelete">
                          Année : {{ effectifToDelete.annee }}<br>
                          Total : {{ effectifToDelete.nombre_total || (effectifToDelete.nombre_homme + effectifToDelete.nombre_femme) }}
                        </p>
                      </div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-danger" @click="deleteEffectif" :disabled="loadingEffectif">
                          <i v-if="loadingEffectif" class="fas fa-spinner fa-spin me-2"></i>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>



              <!-- Onglet Direction Générale -->
              <EntityDirection v-show="activeTab === 'direction'" :directors="directionGenerale" :entity-id="entity.id"
                @save="handleDirectionSave" @delete="handleDirectionDelete" :reload-data="loadEntity" />

              <!-- Onglet Mandats -->
              <MandatesView v-show="activeTab === 'board'" :entityId="entity?.id" />

              <!-- Onglet Commissaires aux Comptes -->
              <EntityOfficers v-show="activeTab === 'officers'" :officers="accountingOfficers" :entity-id="entity.id"
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
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'
import { localStorageUtil, STORAGE_KEYS } from '@/utils/localStorage'
import { Modal } from 'bootstrap'

// Import des composants
import EntityDirection from '@/components/entity/EntityDirection.vue'
import MandatesView from '@/components/entity/MandatesView.vue'
import EntityOfficers from '@/components/entity/EntityOfficers.vue'
export default {
  name: 'EntitiesShowView',
  components: {
    EntityDirection,
    MandatesView,
    EntityOfficers
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const { notifyError, notifySuccess } = useNotyf()

    const loading = ref(false)
    const activeTab = ref('dashboard')
    const currentEntityId = ref(null)

    // Variables pour la gestion des effectifs
    const loadingEffectif = ref(false)
    const isEditingEffectif = ref(false)
    const effectifForm = ref({
      id: null,
      annee: '',
      nombre_homme: 0,
      nombre_femme: 0,
      entity_id: null
    })
    const effectifToDelete = ref(null)

    // Computed properties
    const entity = computed(() => store.getters['entities/entity'])
    const selectedEntity = computed(() => store.getters['entities/selectedEntity'])
    const entityStats = computed(() => store.getters['entities/entityStats'])

    // Fonction pour récupérer l'ID d'entité depuis différentes sources
    const getEntityId = () => {
      // 1. Depuis les paramètres de la route (priorité la plus haute)
      if (route.params.id) {
        return route.params.id
      }

      // 2. Depuis l'entité sélectionnée dans le store
      if (selectedEntity.value?.id) {
        return selectedEntity.value.id.toString()
      }

      // 3. Depuis localStorage
      const storedEntityId = localStorageUtil.get(STORAGE_KEYS.SELECTED_ENTITY_ID)
      if (storedEntityId) {
        return storedEntityId.toString()
      }

      // 4. Depuis l'entité complète en localStorage
      const storedEntity = localStorageUtil.get(STORAGE_KEYS.SELECTED_ENTITY)
      if (storedEntity?.id) {
        return storedEntity.id.toString()
      }

      return null
    }
    const boardCouncils = computed(() => store.getters['boardCouncils/boardCouncils'])
    const accountingOfficers = computed(() => {
      const byEntity = store.getters['accountingOfficers/accountingOfficersByEntity'] || []
      const all = store.getters['accountingOfficers/accountingOfficers'] || []
      return (byEntity && byEntity.length > 0) ? byEntity : all
    })



    // Direction générale
    const directionGenerale = ref([])

    // S'assurer que directionGenerale a toujours une valeur
    const directionGeneraleComputed = computed(() => directionGenerale.value || [])
    
    // Computed pour les effectifs triés
    const sortedEffectifs = computed(() => {
      if (!entity.value || !entity.value.effectifs) return []
      return [...entity.value.effectifs].sort((a, b) => b.annee - a.annee)
    })

    // Fonctions utilitaires
    const formatCurrency = (amount) => {
      if (!amount) return 'Non renseigné'
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
      }).format(amount)
    }

    const getPercentage = (value, total) => {
      if (total === 0) return 0
      return (value / total) * 100
    }

    // Méthodes principales
    const loadEntity = async (entityId = null) => {
      loading.value = true
      try {
        const targetEntityId = entityId || getEntityId()
        if (!targetEntityId) {
          throw new Error('Aucune entité spécifiée')
        }

        // Mettre à jour l'ID actuel
        currentEntityId.value = targetEntityId

        await store.dispatch('entities/fetchEntityById', targetEntityId)
        await store.dispatch('entities/fetchEntityStats', targetEntityId)

        // Chargement initial des données pour tous les onglets
        await Promise.all([
          loadDirectionGenerale(),
          loadBoardCouncils(),
          loadAccountingOfficers()
        ])
      } catch (error) {
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
        const entityId = currentEntityId.value || getEntityId()
        if (!entityId) return

        await store.dispatch('boardCouncils/fetchBoardCouncils', {
          params: {
            entity_id: entityId
          }
        })
      } catch (error) {
        notifyError('Erreur lors du chargement des administrateurs')
      }
    }

    const loadAccountingOfficers = async (params = {}) => {
      try {
        const entityId = currentEntityId.value || getEntityId()
        if (!entityId) return

        await store.dispatch('accountingOfficers/fetchAccountingOfficersByEntity', {
          entityId: entityId,
          page: params.page || 1,
          limit: params.limit || 50
        })
      } catch (error) {
        notifyError('Erreur lors du chargement des commissaires')
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

        // Recharger aussi les stats de l'entité
        const entityId = currentEntityId.value || getEntityId()
        if (entityId) {
          await store.dispatch('entities/fetchEntityStats', entityId)
        }

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

        // Recharger aussi les stats de l'entité
        const entityId = currentEntityId.value || getEntityId()
        if (entityId) {
          await store.dispatch('entities/fetchEntityStats', entityId)
        }

        notifySuccess('Direction générale supprimée')
      } catch (error) {
        notifyError('Erreur lors de la suppression de la direction générale')
      }
    }

    // tools managed in EntityTools component

    const setActiveTab = (tab) => {
      if (tab === 'board') {
        // Rediriger vers la page des conseils d'administration
        redirectToBoardCouncil()
      } else {
        activeTab.value = tab
      }
    }

    const redirectToBoardCouncil = () => {
      const entityId = currentEntityId.value || getEntityId()
      if (!entityId) {
        notifyError('Aucune entité sélectionnée')
        return
      }

      // Trouver le premier conseil actif ou le plus récent
      const councils = boardCouncils.value || []
      if (councils.length === 0) {
        notifyError('Aucun conseil d\'administration trouvé pour cette entité')
        return
      }

      // Priorité : conseil avec is_current_director = true, sinon le plus récent
      const activeCouncil = councils.find(c => c.is_current_director) || councils[0]
      
      router.push({
        name: 'EntityMandateShow',
        params: {
          id: entityId,
          councilId: activeCouncil.id
        }
      })
    }

    const goBackToDashboard = () => {
      setActiveTab('dashboard')
    }

    // Watcher pour surveiller les changements d'entité sélectionnée dans le store
    watch(selectedEntity, (newEntity, oldEntity) => {
      if (newEntity && newEntity.id !== oldEntity?.id && !route.params.id) {
        currentEntityId.value = newEntity.id.toString()
        loadEntity(newEntity.id)
      }
    }, { immediate: false })

    // Watcher pour surveiller les changements dans localStorage
    watch(() => localStorageUtil.get(STORAGE_KEYS.SELECTED_ENTITY_ID), (newEntityId, oldEntityId) => {
      if (newEntityId && newEntityId !== oldEntityId && !route.params.id && newEntityId !== currentEntityId.value) {
        currentEntityId.value = newEntityId
        loadEntity(newEntityId)
      }
    }, { immediate: false })

    // Watcher pour surveiller les changements de route (si on navigue vers une entité spécifique)
    watch(() => route.params.id, (newId, oldId) => {
      if (newId && newId !== oldId) {
        currentEntityId.value = newId
        loadEntity(newId)
      }
    }, { immediate: false })

    onMounted(async () => {
      // Initialiser l'ID d'entité au montage
      const initialEntityId = getEntityId()
      if (initialEntityId) {
        currentEntityId.value = initialEntityId
        await loadEntity(initialEntityId)
      } else {
        // Si on est sur le dashboard sans ID, attendre que l'entité soit sélectionnée
        if (route.name === 'Dashboard' && !route.params.id) {
          // Attendre que l'entité soit disponible
          let attempts = 0
          const maxAttempts = 20 // 2 secondes max

          const checkSelectedEntity = async () => {
            attempts++
            const entityId = getEntityId()

            if (entityId) {
              currentEntityId.value = entityId
              await loadEntity(entityId)
            } else if (attempts < maxAttempts) {
              // Réessayer dans 100ms
              setTimeout(checkSelectedEntity, 100)
            } else {
              notifyError('Aucune entité sélectionnée')
            }
          }

          checkSelectedEntity()
        }
      }

      // Changer d'onglet si spécifié dans la query
      if (route.query.tab) {
        setActiveTab(route.query.tab)
      }
    })

    // Nettoyer les modals au démontage
    onBeforeUnmount(() => {
      cleanupModals()
    })

    // Méthodes pour gérer les effectifs
    const resetEffectifForm = () => {
      effectifForm.value = {
        id: null,
        annee: '',
        nombre_homme: 0,
        nombre_femme: 0,
        entity_id: currentEntityId.value || getEntityId()
      }
    }

    const openEffectifModal = (effectif = null) => {
      if (effectif) {
        // Mode édition
        effectifForm.value = {
          id: effectif.id,
          annee: effectif.annee,
          nombre_homme: effectif.nombre_homme,
          nombre_femme: effectif.nombre_femme,
          entity_id: currentEntityId.value || getEntityId()
        }
        isEditingEffectif.value = true
      } else {
        // Mode ajout
        resetEffectifForm()
        isEditingEffectif.value = false
      }
      
      // Attendre le prochain tick avant d'ouvrir le modal
      setTimeout(() => {
        const modalElement = document.getElementById('effectifModal')
        if (modalElement) {
          const modal = Modal.getOrCreateInstance(modalElement)
          modal.show()
        }
      }, 100)
    }

    const editEffectif = (effectif) => {
      openEffectifModal(effectif)
    }

    const saveEffectif = async () => {
      if (loadingEffectif.value) return // Éviter les doubles soumissions
      
      // Validation basique
      if (!effectifForm.value.annee || effectifForm.value.annee < 1900 || effectifForm.value.annee > 2100) {
        notifyError('Veuillez saisir une année valide')
        return
      }
      
      if (Number(effectifForm.value.nombre_homme) < 0 || Number(effectifForm.value.nombre_femme) < 0) {
        notifyError('Les nombres ne peuvent pas être négatifs')
        return
      }
      
      loadingEffectif.value = true
      try {
        const payload = {
          annee: Number(effectifForm.value.annee),
          nombre_total: Number(effectifForm.value.nombre_homme) + Number(effectifForm.value.nombre_femme),
          nombre_homme: Number(effectifForm.value.nombre_homme),
          nombre_femme: Number(effectifForm.value.nombre_femme),
          entity_id: currentEntityId.value || getEntityId()
        }

        if (isEditingEffectif.value && effectifForm.value.id) {
          await store.dispatch('effectifs/updateEffectif', { 
            id: effectifForm.value.id, 
            payload 
          })
          notifySuccess('Effectif mis à jour avec succès')
        } else {
          await store.dispatch('effectifs/createEffectif', payload)
          notifySuccess('Effectif ajouté avec succès')
        }

        // Fermer le modal
        const modalElement = document.getElementById('effectifModal')
        if (modalElement) {
          const modal = Modal.getInstance(modalElement)
          if (modal) modal.hide()
        }

        // Recharger les données
        await loadEntity()
        
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'effectif:', error)
        notifyError(error?.detail || 'Erreur lors de l\'enregistrement de l\'effectif')
      } finally {
        loadingEffectif.value = false
        resetEffectifForm()
      }
    }

    // Nettoyer les modals au démontage
    const cleanupModals = () => {
      const effectifModalEl = document.getElementById('effectifModal')
      const deleteModalEl = document.getElementById('deleteEffectifModal')
      
      if (effectifModalEl) {
        const modal = Modal.getInstance(effectifModalEl)
        if (modal) modal.dispose()
      }
      
      if (deleteModalEl) {
        const modal = Modal.getInstance(deleteModalEl)
        if (modal) modal.dispose()
      }
    }

    const confirmDeleteEffectif = (effectif) => {
      effectifToDelete.value = effectif
      
      // Attendre le prochain tick avant d'ouvrir le modal
      setTimeout(() => {
        const modalElement = document.getElementById('deleteEffectifModal')
        if (modalElement) {
          const modal = Modal.getOrCreateInstance(modalElement)
          modal.show()
        }
      }, 100)
    }

    const deleteEffectif = async () => {
      if (!effectifToDelete.value) return
      
      loadingEffectif.value = true
      try {
        await store.dispatch('effectifs/deleteEffectif', effectifToDelete.value.id)
        
        // Fermer le modal
        const modalElement = document.getElementById('deleteEffectifModal')
        if (modalElement) {
          const modal = Modal.getInstance(modalElement)
          if (modal) modal.hide()
        }

        // Recharger les données
        await loadEntity()
        
        notifySuccess('Effectif supprimé avec succès')
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'effectif:', error)
        notifyError('Erreur lors de la suppression de l\'effectif')
      } finally {
        loadingEffectif.value = false
        effectifToDelete.value = null
      }
    }

    return {
      entity,
      entityStats,
      boardCouncils,
      accountingOfficers,
      directionGenerale: directionGeneraleComputed,
      sortedEffectifs,
      loading,
      activeTab,
      currentEntityId,
      getEntityId,
      setActiveTab,
      goBackToDashboard,
      handleDirectionDataUpdated,
      handleDirectionSave,
      handleDirectionDelete,
      loadEntity,
      formatCurrency,
      getPercentage,
      // Variables pour les effectifs
      loadingEffectif,
      isEditingEffectif,
      effectifForm,
      effectifToDelete,
      // Méthodes pour les effectifs
      openEffectifModal,
      editEffectif,
      saveEffectif,
      confirmDeleteEffectif,
      deleteEffectif,
      resetEffectifForm
    }
  }
}
</script>