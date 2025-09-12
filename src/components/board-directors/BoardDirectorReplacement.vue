<template>
  <div class="board-director-replacement">
    <!-- Modal de remplacement -->
    <div 
      v-if="show && !showHistory" 
      class="modal d-block" 
      tabindex="-1" 
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-exchange-alt me-2"></i>
              Remplacer un membre du conseil
            </h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Informations du membre à remplacer -->
            <div class="card mb-3" v-if="director">
              <div class="card-header bg-light">
                <h6 class="mb-0">
                  <i class="fas fa-user me-2"></i>
                  Membre à remplacer
                </h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <strong>Nom :</strong> {{ director.nom_prenom }}
                  </div>
                  <div class="col-md-6">
                    <strong>Position :</strong> {{ director.position || 'Non spécifiée' }}
                  </div>
                  <div class="col-md-6">
                    <strong>Email :</strong> {{ director.email || 'Non renseigné' }}
                  </div>
                  <div class="col-md-6">
                    <strong>Statut :</strong> 
                    <span class="badge bg-success">{{ director.status || 'actif' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Formulaire du nouveau membre -->
                        <!-- Formulaire du nouveau membre -->
            <form @submit.prevent="submitReplacement">
              <div class="card">
                <div class="card-header bg-primary text-white">
                  <h6 class="mb-0">
                    <i class="fas fa-user-plus me-2"></i>
                    Nouveau membre
                  </h6>
                </div>
                <div class="card-body">
                  <!-- Sélection d'utilisateur (même logique que création) -->
                  <div class="mb-3">
                    <label class="form-label small fw-semibold">Associer un utilisateur</label>
                    <div class="btn-group btn-group-sm d-flex" role="group">
                      <input type="radio" class="btn-check" name="userChoice" id="newUserReplace" :checked="!chooseExisting" @change="chooseExisting = false">
                      <label class="btn btn-outline-secondary" for="newUserReplace">Créer un nouvel utilisateur</label>
                      
                      <input type="radio" class="btn-check" name="userChoice" id="existingUserReplace" :checked="chooseExisting" @change="chooseExisting = true">
                      <label class="btn btn-outline-secondary" for="existingUserReplace">Sélectionner un utilisateur</label>
                    </div>
                  </div>

                  <!-- Recherche d'utilisateur existant -->
                  <div v-if="chooseExisting" class="mb-3">
                    <label class="form-label small fw-semibold">Rechercher un utilisateur</label>
                    <div class="input-group input-group-sm mb-2">
                      <input v-model="usersSearchTerm" @input="debouncedSearchUsers" type="text" class="form-control" placeholder="Rechercher par nom/email" />
                      <button class="btn btn-outline-secondary" @click="searchUsers">Rechercher</button>
                    </div>
                    
                    <!-- Indicateur de chargement pour la recherche -->
                    <div v-if="usersSearchLoading" class="text-center py-2">
                      <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                      <small class="text-muted ms-2">Recherche en cours...</small>
                    </div>
                    
                    <!-- Résultats de la recherche -->
                    <div v-else-if="usersResults?.length" class="border rounded">
                      <div v-for="u in usersResults" :key="u.id" class="d-flex justify-content-between align-items-center p-2 border-bottom">
                        <div>
                          <div class="fw-medium small">{{ u.username || u.email }}</div>
                          <div class="text-muted small">{{ u.email || '' }}</div>
                          <div v-if="u.role" class="text-muted small">Rôle: {{ u.role.name }}</div>
                          <div v-if="director.user_id === u.id" class="text-danger small">
                            <i class="fas fa-exclamation-triangle me-1"></i>
                            Cette personne est déjà le membre actuel
                          </div>
                        </div>
                        <button 
                          class="btn btn-sm"
                          :class="director.user_id === u.id ? 'btn-outline-danger' : 'btn-success'"
                          :disabled="director.user_id === u.id"
                          @click="selectExistingUser(u)"
                        >
                          {{ director.user_id === u.id ? 'Déjà membre' : 'Choisir' }}
                        </button>
                      </div>
                    </div>
                    
                    <!-- Message si aucun résultat -->
                    <div v-else-if="usersSearchTerm && !usersSearchLoading" class="small text-muted p-2 bg-light rounded">
                      Aucun résultat trouvé pour "{{ usersSearchTerm }}"
                    </div>
                    
                    <!-- Utilisateur sélectionné -->
                    <div v-if="selectedUser" class="alert alert-success small mt-2">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>Utilisateur sélectionné :</strong><br>
                          <span class="fw-medium">{{ selectedUser.username || selectedUser.email }}</span><br>
                          <span class="text-muted">{{ selectedUser.email }}</span>
                        </div>
                        <button type="button" class="btn btn-sm btn-link text-danger p-0" @click="clearSelectedUser" title="Désélectionner">
                          <i class="bi bi-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Création d'un nouvel utilisateur -->
                  <div v-else class="mb-3">
                    <div class="row g-2 mb-3">
                      <div class="col-md-6">
                        <label class="form-label">Email *</label>
                        <input 
                          type="email" 
                          v-model="newUser.email" 
                          class="form-control" 
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Nom d'utilisateur *</label>
                        <input 
                          type="text" 
                          v-model="newUser.username" 
                          class="form-control" 
                          placeholder="nom_utilisateur"
                          required
                        />
                      </div>
                      <div class="col-12">
                        <label class="form-label">Mot de passe *</label>
                        <input 
                          type="password" 
                          v-model="newUser.password" 
                          class="form-control" 
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <hr class="my-3" />

                  <!-- Informations spécifiques au conseil (pour tous les types) -->
                  <div class="row g-2">
                    <div class="col-md-3">
                      <label class="form-label">Sexe *</label>
                      <select v-model="replacementForm.sexe" class="form-select" required>
                        <option value="">Sélectionner...</option>
                        <option value="Homme">Homme</option>
                        <option value="Femme">Femme</option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <label class="form-label">Âge</label>
                      <input 
                        type="number" 
                        v-model.number="replacementForm.age" 
                        class="form-control" 
                        min="18" 
                        max="100"
                        placeholder="Âge"
                      />
                    </div>
                    <div class="col-md-3">
                      <label class="form-label">Position</label>
                      <select v-model="replacementForm.position" class="form-select">
                        <option value="">Sélectionner...</option>
                        <option value="Président">Président</option>
                        <option value="Membre">Membre</option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <label class="form-label">Membre du comité</label>
                      <div class="form-check form-switch mt-2">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          v-model="replacementForm.is_committee" 
                          id="isCommitteeReplace"
                        />
                        <label class="form-check-label" for="isCommitteeReplace">
                          {{ replacementForm.is_committee ? 'Oui' : 'Non' }}
                        </label>
                      </div>
                    </div>

                    <div class="col-12">
                      <label class="form-label">Structure représentée</label>
                      <input 
                        type="text" 
                        v-model="replacementForm.structure_representee" 
                        class="form-control" 
                        placeholder="Nom de l'organisation ou structure"
                      />
                    </div>

                    <div class="col-12">
                      <label class="form-label">Profil professionnel</label>
                      <textarea 
                        v-model="replacementForm.profil_professionnel" 
                        class="form-control" 
                        rows="3"
                        placeholder="Expérience et qualifications professionnelles..."
                      ></textarea>
                    </div>

                    <div class="col-12">
                      <label class="form-label">Date de remplacement</label>
                      <input 
                        type="date" 
                        v-model="replacementForm.replace_date" 
                        class="form-control"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-outline-secondary" @click="closeModal">
                  <i class="fas fa-times me-2"></i>
                  Annuler
                </button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <i v-if="loading" class="fas fa-spinner fa-spin me-2"></i>
                  <i v-else class="fas fa-exchange-alt me-2"></i>
                  {{ loading ? 'Remplacement...' : 'Remplacer le membre' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'historique des remplacements -->
    <div 
      v-if="show && showHistory" 
      class="modal d-block" 
      tabindex="-1" 
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-history me-2"></i>
              Historique des remplacements
            </h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="replacementHistory.length === 0" class="text-center py-4">
              <i class="fas fa-info-circle fa-2x text-muted mb-3"></i>
              <p class="text-muted">Aucun historique de remplacement disponible</p>
            </div>
            
            <div v-else class="timeline">
              <div 
                v-for="director in replacementHistory" 
                :key="director.id"
                class="timeline-item"
              >
                <div class="timeline-marker" :class="getTimelineMarkerClass(director)">
                  <i :class="getTimelineIcon(director)"></i>
                </div>
                <div class="timeline-content">
                  <div class="card">
                    <div class="card-body">
                      <h6 class="card-title mb-2">
                        {{ director.nom_prenom }}
                        <span class="badge ms-2" :class="getStatusBadgeClass(director.status)">
                          {{ getStatusLabel(director.status) }}
                        </span>
                      </h6>
                      <div class="row text-sm">
                        <div class="col-md-4">
                          <strong>Position :</strong> {{ director.position || 'Non spécifiée' }}
                        </div>
                        <div class="col-md-4">
                          <strong>Date nomination :</strong> 
                          {{ formatDate(director.date_nomination) }}
                        </div>
                        <div class="col-md-4" v-if="director.replace_date">
                          <strong>Date remplacement :</strong> 
                          {{ formatDate(director.replace_date) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between mt-4">
              <button type="button" class="btn btn-outline-primary" @click="showHistory = false">
                <i class="fas fa-arrow-left me-2"></i>
                Retour au remplacement
              </button>
              <button type="button" class="btn btn-outline-secondary" @click="closeModal">
                <i class="fas fa-times me-2"></i>
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'
import api from '@/services/api'

export default {
  name: 'BoardDirectorReplacement',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    director: {
      type: Object,
      default: null
    },
    boardCouncilId: {
      type: String,
      default: null
    }
  },
  emits: ['close', 'replaced', 'show-history'],
  setup(props, { emit }) {
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()

    const loading = ref(false)
    const showHistory = ref(false)
    const replacementHistory = ref([])

    // Logique de recherche d'utilisateur (même que création/modification)
    const chooseExisting = ref(true)
    const selectedUser = ref(null)
    const newUser = ref({
      email: '',
      username: '',
      password: ''
    })

    // Recherche d'utilisateurs
    const usersSearchTerm = ref('')
    const usersResults = ref([])
    const usersSearchLoading = ref(false)
    const debounceTimeout = ref(null)

    // Formulaire de remplacement (nouveau format simplifié)
    const replacementForm = ref({
      replace_date: new Date().toISOString().split('T')[0],
      nom_prenom: '',  // Champ nom_prenom
      sexe: '',  // Champ sexe obligatoire
      age: null,  // Ajout du champ âge
      position: '',
      structure_representee: '',
      profil_professionnel: '',
      is_committee: false
    })

    const resetForm = () => {
      replacementForm.value = {
        replace_date: new Date().toISOString().split('T')[0],
        nom_prenom: '',  // Reset du champ nom_prenom
        sexe: '',  // Reset du champ sexe
        age: null,  // Reset du champ âge
        position: '',
        structure_representee: '',
        profil_professionnel: '',
        is_committee: false
      }
      chooseExisting.value = false
      selectedUser.value = null
      newUser.value = {
        email: '',
        username: '',
        password: ''
      }
      usersSearchTerm.value = ''
      usersResults.value = []
      usersSearchLoading.value = false
    }

    // Recherche d'utilisateurs (même logique que BoardCouncilShowView.vue)
    const searchUsers = async () => {
      if (!usersSearchTerm.value || usersSearchTerm.value.trim().length < 2) {
        usersResults.value = []
        return
      }

      usersSearchLoading.value = true
      usersResults.value = []

      try {
        const searchQuery = encodeURIComponent(usersSearchTerm.value.trim())
        const res = await api.get(`/users?search=${searchQuery}&per_page=10`)
        
        // Traiter la réponse selon le format de l'API
        if (res.data && res.data.items) {
          usersResults.value = res.data.items
        } else if (Array.isArray(res.data)) {
          // Au cas où l'API retournerait directement un tableau
          usersResults.value = res.data
        } else {
          usersResults.value = []
        }
        
        console.log('Résultats de recherche:', usersResults.value)
      } catch (error) {
        console.error('Erreur lors de la recherche d\'utilisateurs:', error)
        notifyError('Erreur lors de la recherche d\'utilisateurs')
        usersResults.value = []
      } finally {
        usersSearchLoading.value = false
      }
    }

    const debouncedSearchUsers = () => {
      clearTimeout(debounceTimeout.value)
      debounceTimeout.value = setTimeout(() => {
        searchUsers()
      }, 500)
    }

    const selectExistingUser = (user) => {
      // Vérifier que l'utilisateur ne se remplace pas par lui-même
      if (props.director.user_id && props.director.user_id === user.id) {
        notifyError('Une personne ne peut pas se remplacer par elle-même')
        return
      }
      
      selectedUser.value = user
      usersSearchTerm.value = user.username || user.email
      usersResults.value = []
      // Mettre à jour le nom_prenom comme dans la création
      replacementForm.value.nom_prenom = user.username || user.email
    }

    const clearSelectedUser = () => {
      selectedUser.value = null
      usersSearchTerm.value = ''
      usersResults.value = []
      // Vider aussi le nom_prenom
      replacementForm.value.nom_prenom = ''
    }

    const validateForm = () => {
      if (chooseExisting.value) {
        if (!selectedUser.value) {
          notifyError('Veuillez sélectionner un utilisateur existant')
          return false
        }
      } else {
        if (!newUser.value.email || !newUser.value.username || !newUser.value.password) {
          notifyError('Veuillez remplir tous les champs obligatoires pour le nouvel utilisateur')
          return false
        }
      }
      
      if (!replacementForm.value.sexe) {
        notifyError('Veuillez sélectionner le sexe')
        return false
      }
      
      return true
    }

    const closeModal = () => {
      showHistory.value = false
      resetForm()
      emit('close')
    }

    const submitReplacement = async () => {
      if (!props.director) {
        notifyError('Aucun membre sélectionné pour le remplacement')
        return
      }

      if (!validateForm()) {
        return
      }

      loading.value = true
      
      try {
        const payload = {
          replace_date: replacementForm.value.replace_date,
          nom_prenom: replacementForm.value.nom_prenom,  // Champ nom_prenom
          sexe: replacementForm.value.sexe,  // Champ sexe
          age: replacementForm.value.age,  // Ajout du champ âge
          position: replacementForm.value.position,
          structure_representee: replacementForm.value.structure_representee,
          profil_professionnel: replacementForm.value.profil_professionnel,
          is_committee: replacementForm.value.is_committee
        }

        // Ajouter soit user_id soit new_user selon le choix
        if (chooseExisting.value) {
          payload.user_id = selectedUser.value.id
        } else {
          payload.new_user = newUser.value
        }

        console.log('Payload envoyé:', payload)

        await store.dispatch('boardDirectors/replaceBoardDirector', {
          directorId: props.director.id,
          replacementData: payload
        })

        notifySuccess('Membre remplacé avec succès')
        resetForm()
        emit('replaced')
        
      } catch (error) {
        console.error('Erreur lors du remplacement:', error)
        notifyError('Erreur lors du remplacement du membre')
      } finally {
        loading.value = false
      }
    }

    const loadReplacementHistory = async () => {
      if (!props.director) return
      
      try {
        const history = await store.dispatch('boardDirectors/fetchBoardDirectorReplacements', props.director.id)
        replacementHistory.value = history || []
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error)
        replacementHistory.value = []
      }
    }

    // Watcher pour charger l'historique quand le director change
    watch(() => props.director, (newDirector) => {
      if (newDirector && newDirector.replacementHistory) {
        replacementHistory.value = newDirector.replacementHistory
        showHistory.value = true
      } else if (newDirector) {
        showHistory.value = false
        // Pré-remplir la position avec celle du membre à remplacer
        if (newDirector.position) {
          replacementForm.value.position = newDirector.position
        }
        loadReplacementHistory()
      }
    }, { immediate: true })

    // Watcher pour mettre à jour nom_prenom quand l'utilisateur crée un nouveau compte
    watch(() => newUser.value.username, (newUsername) => {
      if (!chooseExisting.value && newUsername) {
        replacementForm.value.nom_prenom = newUsername || newUser.value.email
      }
    })

    watch(() => newUser.value.email, (newEmail) => {
      if (!chooseExisting.value && !newUser.value.username && newEmail) {
        replacementForm.value.nom_prenom = newEmail
      }
    })

    // Fonctions utilitaires pour l'affichage
    const formatDate = (dateString) => {
      return dateString ? new Date(dateString).toLocaleDateString('fr-FR') : 'Non renseignée'
    }

    const getStatusLabel = (status) => {
      const labels = {
        'active': 'Actif',
        'inactive': 'Inactif', 
        'replaced': 'Remplacé'
      }
      return labels[status] || status
    }

    const getStatusBadgeClass = (status) => {
      const classes = {
        'active': 'bg-success',
        'inactive': 'bg-secondary',
        'replaced': 'bg-warning'
      }
      return classes[status] || 'bg-secondary'
    }

    const getTimelineMarkerClass = (director) => {
      const classes = {
        'active': 'bg-success',
        'inactive': 'bg-secondary', 
        'replaced': 'bg-warning'
      }
      return classes[director.status] || 'bg-secondary'
    }

    const getTimelineIcon = (director) => {
      const icons = {
        'active': 'fas fa-user-check',
        'inactive': 'fas fa-user-times',
        'replaced': 'fas fa-exchange-alt'
      }
      return icons[director.status] || 'fas fa-user'
    }

    return {
      loading,
      showHistory,
      replacementForm,
      replacementHistory,
      // Nouvelles variables pour la recherche d'utilisateur
      chooseExisting,
      selectedUser,
      newUser,
      usersSearchTerm,
      usersResults,
      usersSearchLoading,
      // Méthodes
      resetForm,
      closeModal,
      submitReplacement,
      loadReplacementHistory,
      searchUsers,
      debouncedSearchUsers,
      selectExistingUser,
      clearSelectedUser,
      validateForm,
      formatDate,
      getStatusLabel,
      getStatusBadgeClass,
      getTimelineMarkerClass,
      getTimelineIcon
    }
  }
}
</script>

<style scoped>
/* Timeline styles */
.timeline {
  position: relative;
  padding-left: 3rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #dee2e6;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-marker {
  position: absolute;
  left: -2.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  z-index: 1;
}

.timeline-content {
  margin-left: 1rem;
}

.text-sm {
  font-size: 0.875rem;
}
</style>
