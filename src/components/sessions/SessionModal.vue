<template>
  <div class="modal fade" :id="modalId" tabindex="-1" aria-labelledby="sessionModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="sessionModalLabel">
            {{ modalTitle }}
          </h5>
          <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Mode lecture seule -->
          <div v-if="mode === 'view'" class="row g-3">
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Type de session</label>
              <div class="form-control-plaintext">{{ safeSessionData.type || '—' }}</div>
            </div>
            
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Mode</label>
              <div class="form-control-plaintext">{{ safeSessionData.session_mode || '—' }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label small fw-semibold">Date de session</label>
              <div class="form-control-plaintext">{{ formatDate(safeSessionData.session_date) || '—' }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label small fw-semibold">Date de convocation</label>
              <div class="form-control-plaintext">{{ formatDate(safeSessionData.convocation_date) || '—' }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label small fw-semibold">Exercice fiscal</label>
              <div class="form-control-plaintext">{{ safeSessionData.fiscal_year || '—' }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label small fw-semibold">PV enregistré</label>
              <div class="form-control-plaintext">
                <span class="badge" :class="safeSessionData.pv_registered ? 'bg-success' : 'bg-secondary'">
                  {{ safeSessionData.pv_registered ? 'Oui' : 'Non' }}
                </span>
              </div>
            </div>

            <div class="col-12" v-if="safeSessionData.observations">
              <label class="form-label small fw-semibold">Observations</label>
              <div class="form-control-plaintext">{{ sessionData.observations }}</div>
            </div>
          </div>

          <!-- Mode création/modification -->
          <form v-else @submit.prevent="handleSubmit">
            <div class="row g-3">
              <div class="col-md-12">
                <label class="form-label required">Type de session</label>
                <select v-model="sessionForm.type" class="form-select" required>
                  <option value="">Sélectionner un type</option>
                  <option value="Arrêté des comptes">Arrêté des comptes</option>
                  <option value="Adoption du budget">Adoption du budget</option>
                  <option value="Session ordinaire">Session ordinaire</option>
                  <option value="Session extraordinaire">Session extraordinaire</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label required">Date de session</label>
                <input
                  v-model="sessionForm.session_date"
                  type="date"
                  class="form-control"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Date de convocation</label>
                <input
                  v-model="sessionForm.convocation_date"
                  type="date"
                  class="form-control"
                />
              </div>

              <div class="col-md-6">
                <label class="form-label required">Mode de session</label>
                <select v-model="sessionForm.session_mode" class="form-select" required>
                  <option value="">Sélectionner un mode</option>
                  <option value="Présentiel">Présentiel</option>
                  <option value="En ligne">En ligne</option>
                  <option value="Consultation à domicile">Consultation à domicile</option>
                  <option value="Hybride">Hybride</option>
                </select>
              </div>

              <!-- Champ URL si En ligne -->
              <div class="col-md-6" v-if="sessionForm.session_mode === 'En ligne'">
                <label class="form-label">URL de la session en ligne</label>
                <input v-model="sessionForm.url" type="url" class="form-control" placeholder="https://..." />
              </div>
            <!-- Bloc Participants -->
            <div class="col-12 mb-3">
              <h6>Participants</h6>
              
              <!-- Recherche d'utilisateur -->
              <div class="mb-3">
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Rechercher un utilisateur..."
                    v-model="userSearchQuery"
                    @input="searchUsers"
                  />
                </div>
                
                <!-- Résultats de recherche -->
                <div v-if="searchResults.length > 0" class="list-group mt-2" style="max-height: 200px; overflow-y: auto;">
                  <button
                    v-for="user in searchResults"
                    :key="user.id"
                    type="button"
                    class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    @click="addUserAsParticipant(user)"
                  >
                    <div>
                      <strong>{{ user.username || user.email }}</strong>
                      <small class="text-muted d-block">{{ user.email }}</small>
                    </div>
                    <i class="fas fa-plus text-primary"></i>
                  </button>
                </div>
                
                <!-- Message si pas de résultats -->
                <div v-if="userSearchQuery.length >= 2 && searchResults.length === 0" class="text-muted small mt-2">
                  Aucun utilisateur trouvé
                </div>
              </div>
              
              <!-- Liste des participants sélectionnés -->
              <div v-if="participants.length > 0">
                <h6 class="small text-muted">Participants sélectionnés ({{ participants.length }})</h6>
                <ul class="list-group">
                  <li v-for="p in participants" :key="p.email || p.id" class="list-group-item d-flex justify-content-between align-items-center py-2">
                    <div>
                      <strong>{{ p.name || p.username || p.email }}</strong>
                      <small class="text-muted d-block">{{ p.email }}</small>
                    </div>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-sm btn-outline-danger" @click="removeParticipant(p)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
              <div v-else class="text-muted small">Aucun participant sélectionné</div>
            </div>              <div class="col-md-6" v-if="['Arrêté des comptes', 'Adoption du budget'].includes(sessionForm.type)">
                <label class="form-label">Exercice fiscal</label>
                <input
                  v-model="sessionForm.fiscal_year"
                  type="number"
                  class="form-control"
                  min="2020"
                  :max="new Date().getFullYear() + 1"
                  placeholder="Ex: 2024"
                />
              </div>

                            <div class="col-md-6">
                <label class="form-label">Date de signature PV</label>
                <input
                  v-model="sessionForm.pv_signature_date"
                  type="date"
                  class="form-control"
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Liste de présence</label>
                <input
                  @change="handleAttendanceFileUpload"
                  type="file"
                  class="form-control"
                  accept=".pdf,.doc,.docx"
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Fichier PV</label>
                <input
                  @change="handlePVFileUpload"
                  type="file"
                  class="form-control"
                  accept=".pdf,.doc,.docx"
                />
              </div>

              <div class="col-12">
                <label class="form-label">Observations</label>
                <textarea
                  v-model="sessionForm.observations"
                  class="form-control"
                  rows="3"
                  placeholder="Observations ou remarques..."
                ></textarea>
              </div>
            </div>
          </form>

          <div v-if="errorMessage" class="alert alert-danger mt-3">
            {{ errorMessage }}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            {{ mode === 'view' ? 'Fermer' : 'Annuler' }}
          </button>
          <button 
            v-if="mode !== 'view'" 
            type="button" 
            class="btn btn-success" 
            @click="handleSubmit"
            :disabled="loading"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin me-2"></i>
            {{ mode === 'edit' ? 'Enregistrer' : 'Créer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import api from '@/services/api'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'
import { Modal } from 'bootstrap'

export default {
  name: 'SessionModal',
  props: {
    modalId: {
      type: String,
      default: 'sessionModal'
    },
    mode: {
      type: String,
      default: 'create', // 'create', 'edit', 'view'
      validator: (value) => ['create', 'edit', 'view'].includes(value)
    },
    sessionData: {
      type: Object,
      default: () => ({
        type: '',
        session_mode: '',
        session_date: null,
        convocation_date: null,
        fiscal_year: '',
        pv_registered: false,
        observations: '',
        url: '',
        pv_signature_date: null
      })
    },
    boardCouncilId: {
      type: String,
      default: null
    }
  },
  emits: ['session-saved', 'modal-closed'],
  setup(props, { emit }) {
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()
    
    const loading = ref(false)
    const errorMessage = ref('')
    
    const sessionForm = ref({
      // Champs requis
      board_council_id: '',
      type: 'Session ordinaire',
      session_mode: 'Présentiel',
      session_date: '',
      convocation_date: '',
      
      // Champs optionnels
      url: '',  // Requis si session_mode = "En ligne"
      fiscal_year: '',  // Requis si type = "Arrêté des comptes" ou "Adoption du budget"
      pv_signature_date: '',
      observations: '',
      
      // Fichiers
      attendance_list: null,
      pv_file: null
    })

    // Participants (frontend state)
    const participants = ref([])
    const newParticipant = ref({ email: '', name: '' })
    
    // User search functionality (like in BoardDirectorReplacement.vue)
    const userSearchQuery = ref('')
    const searchResults = ref([])
    const searchTimeout = ref(null)

    const modalTitle = computed(() => {
      switch (props.mode) {
        case 'view':
          return 'Détails de la session'
        case 'edit':
          return 'Modifier la session'
        default:
          return 'Nouvelle session'
      }
    })

    const safeSessionData = computed(() => ({
      type: props.sessionData?.type || '',
      session_mode: props.sessionData?.session_mode || '',
      session_date: props.sessionData?.session_date || null,
      convocation_date: props.sessionData?.convocation_date || null,
      fiscal_year: props.sessionData?.fiscal_year || '',
      pv_registered: props.sessionData?.pv_registered || false,
      observations: props.sessionData?.observations || '',
      url: props.sessionData?.url || '',
      pv_signature_date: props.sessionData?.pv_signature_date || null
    }))

    // Charger automatiquement les membres du conseil comme participants par défaut
    const loadBoardMembers = async (boardCouncilId) => {
      try {
        const members = await store.dispatch('boardDirectors/fetchBoardDirectorsByCouncil', {
          boardCouncilId: boardCouncilId
        })
        
        // Convertir les membres en participants et filtrer les doublons
        const newParticipants = members.map(member => ({
          id: member.user_id,
          email: member.email,
          name: member.nom_prenom,
          username: member.nom_prenom,
          invited: false
        })).filter(p => {
          // Filtrer seulement ceux qui ont un email et qui ne sont pas déjà dans la liste
          return p.email && !participants.value.some(existing => existing.email === p.email)
        })
        
        // Ajouter les nouveaux participants
        participants.value.push(...newParticipants)
        
        if (newParticipants.length > 0) {
          // notifySuccess(`${newParticipants.length} membre(s) du conseil ajouté(s) automatiquement`)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des membres du conseil:', error)
        // Ne pas afficher d'erreur car ce n'est pas critique
      }
    }

    // Watchers pour mettre à jour le formulaire
    watch(() => props.sessionData, (newData) => {
      if (newData && Object.keys(newData).length > 0) {
        sessionForm.value = {
          board_council_id: newData.board_council_id || props.boardCouncilId || '',
          type: newData.type || 'Session ordinaire',
          session_mode: newData.session_mode || 'Présentiel',
          url: newData.url || '',
          session_date: formatDateForInput(newData.session_date),
          convocation_date: formatDateForInput(newData.convocation_date),
          fiscal_year: newData.fiscal_year || '',
          attendance_list: null,
          pv_signature_date: formatDateForInput(newData.pv_signature_date),
          pv_file: null,
          observations: newData.observations || ''
        }
        // Charger les participants si mode édition/lecture
        if (props.mode !== 'create' && newData.id) {
          fetchParticipants(newData.id)
        } else {
          participants.value = []
        }
      }
    }, { immediate: true })
    
    // Watcher pour le boardCouncilId - charger les membres automatiquement en mode création
    watch(() => props.boardCouncilId, (newBoardCouncilId) => {
      if (newBoardCouncilId) {
        sessionForm.value.board_council_id = newBoardCouncilId
        // Si on est en mode création, charger automatiquement les membres du conseil
        if (props.mode === 'create') {
          loadBoardMembers(newBoardCouncilId)
        }
      }
    }, { immediate: true })
    // User search functionality
    const searchUsers = async () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }
      
      searchTimeout.value = setTimeout(async () => {
        if (userSearchQuery.value.length < 2) {
          searchResults.value = []
          return
        }
        
        try {
          const res = await api.get(`/users?search=${encodeURIComponent(userSearchQuery.value)}&per_page=10`)
          searchResults.value = res.data?.items || res.data || []
        } catch (error) {
          console.error('Erreur recherche utilisateurs:', error)
          searchResults.value = []
        }
      }, 300)
    }
    
    const addUserAsParticipant = (user) => {
      // Vérifier si l'utilisateur n'est pas déjà dans la liste
      const exists = participants.value.some(p => p.email === user.email || p.id === user.id)
      if (exists) {
        notifyError('Cet utilisateur est déjà dans la liste des participants')
        // Reset search
        userSearchQuery.value = ''
        searchResults.value = []
        return
      }
      
      const participantData = {
        id: user.id,
        email: user.email,
        name: user.username || user.email,
        username: user.username,
        invited: false
      }
      
      if (props.mode !== 'create' && props.sessionData.id) {
        // Mode édition - ajouter via l'API
        addParticipantToSession(participantData)
      } else {
        // Mode création - ajouter localement
        participants.value.push(participantData)
      }
      
      // Reset search
      userSearchQuery.value = ''
      searchResults.value = []
    }

    const addParticipantToSession = async (participantData) => {
      try {
        await store.dispatch('sessions/addParticipant', {
          sessionId: props.sessionData.id,
          participant: participantData
        })
        fetchParticipants(props.sessionData.id)
        notifySuccess('Participant ajouté avec succès')
      } catch (error) {
        console.error('Erreur ajout participant:', error)
        notifyError('Erreur lors de l\'ajout du participant')
      }
    }

    // Gestion participants (via le store)
    const fetchParticipants = async (sessionId) => {
      try {
        const data = await store.dispatch('sessions/fetchParticipants', sessionId)
        participants.value = data || []
        
        // Si aucun participant et que nous avons les données de session avec board_council
        if (participants.value.length === 0 && props.sessionData?.board_council?.members) {
          loadBoardMembersFromSessionData()
        }
      } catch (e) {
        console.error('Error fetching participants:', e)
        participants.value = []
        
        // En cas d'erreur, essayer de charger les membres du conseil depuis les données de session
        if (props.sessionData?.board_council?.members) {
          loadBoardMembersFromSessionData()
        }
      }
    }

    // Charger les membres depuis les données de session déjà disponibles
    const loadBoardMembersFromSessionData = () => {
      if (!props.sessionData?.board_council?.members) {
        return
      }
      
      // Filtrer seulement les membres actifs
      const activeMembers = props.sessionData.board_council.members.filter(member => 
        member.status === 'active' && member.email
      )
      
      // Convertir les membres en participants et filtrer les doublons
      const newParticipants = activeMembers.map(member => ({
        id: member.user_id,
        email: member.email,
        name: member.nom_prenom,
        username: member.nom_prenom,
        invited: false
      })).filter(p => {
        // Filtrer ceux qui ne sont pas déjà dans la liste
        return !participants.value.some(existing => existing.email === p.email)
      })
      
      // Ajouter les nouveaux participants
      participants.value.push(...newParticipants)
    }

    const addParticipant = async () => {
      if (!newParticipant.value.email) return
      
      // Vérifier si le participant existe déjà
      const existingParticipant = participants.value.find(p => p.email === newParticipant.value.email)
      if (existingParticipant) {
        notifyError('Ce participant est déjà dans la liste')
        return
      }
      
      // Si la session existe déjà (édition), on envoie via le store
      if (props.mode !== 'create' && props.sessionData.id) {
        try {
          await store.dispatch('sessions/addParticipant', {
            sessionId: props.sessionData.id,
            participant: {
              email: newParticipant.value.email,
              name: newParticipant.value.name
            }
          })
          fetchParticipants(props.sessionData.id)
        } catch (e) {}
      } else {
        // Sinon, on ajoute localement (création)
        participants.value.push({
          email: newParticipant.value.email,
          name: newParticipant.value.name,
          invited: false
        })
      }
      newParticipant.value = { email: '', name: '' }
    }

    const removeParticipant = async (p) => {
      if (props.mode !== 'create' && props.sessionData.id && p.id) {
        try {
          await store.dispatch('sessions/removeParticipant', {
            sessionId: props.sessionData.id,
            participantId: p.id
          })
          fetchParticipants(props.sessionData.id)
        } catch (e) {}
      } else {
        participants.value = participants.value.filter(x => x.email !== p.email)
      }
    }

    // Méthodes
    const formatDate = (date) => {
      if (!date) return null
      return new Date(date).toLocaleDateString('fr-FR')
    }

    const formatDateForInput = (date) => {
      if (!date) return ''
      return new Date(date).toISOString().split('T')[0]
    }

    const resetForm = () => {
      sessionForm.value = {
        board_council_id: props.boardCouncilId || '',
        type: 'Session ordinaire',
        session_mode: 'Présentiel',
        session_date: '',
        convocation_date: '',
        fiscal_year: '',
        attendance_list: null,
        pv_signature_date: '',
        pv_file: null,
        observations: ''
      }
      errorMessage.value = ''
    }

    const handleAttendanceFileUpload = (event) => {
      sessionForm.value.attendance_list = event.target.files[0]
    }

    const handlePVFileUpload = (event) => {
      sessionForm.value.pv_file = event.target.files[0]
    }

    const handleSubmit = async () => {
      if (props.mode === 'view') return

      loading.value = true
      errorMessage.value = ''

      try {
        // Validation des champs requis
        const requiredFields = [
          'board_council_id',
          'type',
          'session_date',
          'convocation_date',
          'session_mode'
        ]
        
        // Vérifier que tous les champs requis sont présents
        const missingFields = requiredFields.filter(field => 
          !sessionForm.value[field] || sessionForm.value[field] === ''
        )
        
        if (missingFields.length > 0) {
          throw new Error(`Champs requis manquants: ${missingFields.join(', ')}`)
        }

        // Validation spécifique pour le mode en ligne
        if (sessionForm.value.session_mode === 'En ligne' && !sessionForm.value.url) {
          throw new Error('L\'URL est requise pour une session en ligne')
        }

        // Validation spécifique pour les types nécessitant un exercice fiscal
        if (['Arrêté des comptes', 'Adoption du budget'].includes(sessionForm.value.type) 
            && !sessionForm.value.fiscal_year) {
          throw new Error('L\'exercice fiscal est requis pour ce type de session')
        }

        if (props.mode === 'edit') {
          // Pour la mise à jour, on utilise aussi FormData pour gérer les participants
          const formData = new FormData()

          // Ajouter tous les champs du formulaire
          Object.keys(sessionForm.value).forEach(key => {
            if (sessionForm.value[key] !== null && sessionForm.value[key] !== '') {
              // Convertir fiscal_year en string si c'est un nombre
              const value = key === 'fiscal_year' && typeof sessionForm.value[key] === 'number'
                ? sessionForm.value[key].toString()
                : sessionForm.value[key]
              formData.append(key, value)
            }
          })

          // Ajouter les participants à la mise à jour
          if (participants.value.length) {
            formData.append('participants', JSON.stringify(participants.value.map(p => ({ email: p.email, name: p.name }))))
          }
          
          await store.dispatch('sessions/updateSessionWithParticipants', {
            id: props.sessionData.id,
            formData: formData
          })
          notifySuccess('Session mise à jour avec succès')
        } else {
          // Pour la création, on utilise FormData pour gérer les fichiers
          const formData = new FormData()

          // Ajouter tous les champs du formulaire
          Object.keys(sessionForm.value).forEach(key => {
            if (sessionForm.value[key] !== null && sessionForm.value[key] !== '') {
              // Convertir fiscal_year en string si c'est un nombre
              const value = key === 'fiscal_year' && typeof sessionForm.value[key] === 'number'
                ? sessionForm.value[key].toString()
                : sessionForm.value[key]
              formData.append(key, value)
            }
          })

          // Ajouter les participants à la création
          if (participants.value.length) {
            formData.append('participants', JSON.stringify(participants.value.map(p => ({ email: p.email, name: p.name }))))
          }
          
          await store.dispatch('sessions/createSession', formData)
          notifySuccess('Session créée avec succès')
        }
        emit('session-saved')
        closeModal()
      } catch (error) {
        console.error('Erreur lors de la soumission:', error)
        const errorMsg = error?.response?.data?.detail || 
                        error?.message || 
                        'Une erreur est survenue'
        errorMessage.value = errorMsg
        notifyError(errorMsg)
      } finally {
        loading.value = false
      }
    }

    const closeModal = () => {
      const modal = Modal.getInstance(document.getElementById(props.modalId))
      if (modal) {
        modal.hide()
      }
      
      if (props.mode === 'create') {
        resetForm()
      }
      
      emit('modal-closed')
    }

    const show = () => {
      const modal = Modal.getInstance(document.getElementById(props.modalId)) || 
                   new Modal(document.getElementById(props.modalId))
      modal.show()
    }

    return {
      loading,
      errorMessage,
      sessionForm,
      modalTitle,
      safeSessionData,
      formatDate,
      formatDateForInput,
      handleAttendanceFileUpload,
      handlePVFileUpload,
      handleSubmit,
      closeModal,
      show,
      resetForm,
      // Participants
      participants,
      newParticipant,
      addParticipant,
      removeParticipant,
      // User search
      userSearchQuery,
      searchResults,
      searchUsers,
      addUserAsParticipant,
      loadBoardMembers,
      loadBoardMembersFromSessionData
    }
  }
}
</script>

<style scoped>
.required::after {
  content: ' *';
  color: red;
}
</style>
