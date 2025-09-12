<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="mb-0">Sessions du conseil</h5>
      <div class="btn-group">
        <button @click="downloadAllPV" class="btn btn-outline-primary btn-sm" :disabled="loading">
          <i class="fas fa-download me-2"></i>
          Télécharger tous les PV
        </button>
        <button @click="openCreateModal" class="btn btn-success btn-sm">
          <i class="fas fa-plus me-2"></i>
          Nouvelle session
        </button>
      </div>
    </div>
    
    <!-- Filtres -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="input-group">
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Rechercher..."
            class="form-control"
            @input="searchSessions"
          />
        </div>
      </div>
      
      <div class="col-md-3">
        <select v-model="filters.type" @change="filterSessions" class="form-select">
          <option value="">Tous les types</option>
          <option value="Arrêté des comptes">Arrêté des comptes</option>
          <option value="Adoption du budget">Adoption du budget</option>
          <option value="Session ordinaire">Session ordinaire</option>
          <option value="Session extraordinaire">Session extraordinaire</option>
          <option value="Autre">Autre</option>
        </select>
      </div>
      
      <div class="col-md-3">
        <select v-model="filters.session_mode" @change="filterSessions" class="form-select">
          <option value="">Tous les modes</option>
          <option value="Présentiel">Présentiel</option>
          <option value="En ligne">En ligne</option>
          <option value="Consultation à domicile">Consultation à domicile</option>
          <option value="Hybride">Hybride</option>
        </select>
      </div>
      
      <div class="col-md-3">
        <input
          v-model="filters.date"
          type="date"
          class="form-control"
          @change="filterSessions"
        />
      </div>
    </div>
    
    <!-- Tableau des sessions -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th class="border-0">Type</th>
                <th class="border-0">Date de session</th>
                <th class="border-0">Mode</th>
                <th class="border-0">Exercice</th>
                <th class="border-0">Participants</th>
                <th class="border-0 text-center">PV</th>
                <th class="border-0 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="session in sessions" :key="session.id">
                <td class="align-middle">
                  <span class="badge" :class="getTypeClass(session.type)">
                    {{ session.type }}
                  </span>
                </td>
                <td class="align-middle">
                  <div>
                    <strong>{{ formatDate(session.session_date) }}</strong>
                    <br>
                    <small class="text-muted">
                      Convocation: {{ formatDate(session.convocation_date) }}
                    </small>
                  </div>
                </td>
                <td class="align-middle">
                  <span class="badge bg-light text-dark">{{ session.session_mode }}</span>
                  <div v-if="session.url && session.session_mode === 'En ligne'" class="mt-1">
                    <small>
                      <a :href="session.url" target="_blank" class="text-decoration-none">
                        <i class="fas fa-external-link-alt me-1"></i>
                        Lien
                      </a>
                    </small>
                  </div>
                </td>
                <td class="align-middle">{{ session.fiscal_year || '—' }}</td>
                <td class="align-middle">
                  <span class="badge bg-info">
                    {{ session?.participants?.length || 0 }} participants
                  </span>
                  <div v-if="session?.participants?.length > 0" class="mt-1">
                    <small class="text-muted">
                      {{ getParticipantsStatus(session?.participants) }}
                    </small>
                  </div>
                </td>
                <td class="align-middle text-center">
                  <div>
                    <span class="badge" :class="session.pv_registered ? 'bg-success' : 'bg-secondary'">
                      {{ session.pv_registered ? 'Enregistré' : 'Non enregistré' }}
                    </span>
                    <div v-if="session.pv_signature_date && session.pv_registered" class="mt-1">
                      <small class="text-muted">
                        Signé le {{ formatDate(session.pv_signature_date) }}
                      </small>
                    </div>
                  </div>
                </td>
                <td class="align-middle text-center">
                  <div class="btn-group btn-group-sm">
                    <button 
                      class="btn btn-outline-info" 
                      @click="viewSession(session)"
                      title="Voir les détails"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      class="btn btn-outline-primary" 
                      @click="editSession(session)"
                      title="Modifier"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn btn-outline-success" 
                      @click="togglePVRegistration(session)"
                      title="Basculer PV"
                    >
                      <i class="fas fa-file-alt"></i>
                    </button>
                    <button 
                      class="btn btn-outline-danger" 
                      @click="confirmDelete(session)"
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
        
        <!-- État vide -->
        <div v-if="sessions.length === 0 && !loading" class="text-center py-5">
          <i class="fas fa-calendar fa-3x text-muted mb-3"></i>
          <p class="text-muted mb-0">Aucune session trouvée</p>
        </div>

        <!-- État de chargement -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
          <p class="text-muted mt-2">Chargement des sessions...</p>
        </div>
      </div>
    </div>
    
    <!-- Pagination -->
    <nav v-if="pagination.total > pagination.per_page" class="mt-4" aria-label="Navigation des sessions">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
          <button 
            class="page-link" 
            @click="goToPage(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
          >
            Précédent
          </button>
        </li>
        <li
          v-for="page in getPageNumbers()"
          :key="page"
          class="page-item"
          :class="{ active: page === pagination.current_page }"
        >
          <button class="page-link" @click="goToPage(page)">{{ page }}</button>
        </li>
        <li class="page-item" :class="{ disabled: pagination.current_page === pagination.total_pages }">
          <button 
            class="page-link" 
            @click="goToPage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.total_pages"
          >
            Suivant
          </button>
        </li>
      </ul>
    </nav>

    <!-- Modal de détails de la session -->
    <div class="modal fade" :id="`sessionDetailModal-${componentId}`" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Détails de la session - {{ selectedSession?.type }}
            </h5>
            <button type="button" class="btn-close" @click="closeDetailModal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedSession">
            <div class="row">
              <div class="col-md-6">
                <h6>Informations générales</h6>
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>Type:</strong></td>
                      <td>{{ selectedSession.type }}</td>
                    </tr>
                    <tr>
                      <td><strong>Exercice fiscal:</strong></td>
                      <td>{{ selectedSession.fiscal_year || '—' }}</td>
                    </tr>
                    <tr>
                      <td><strong>Date de session:</strong></td>
                      <td>{{ formatDate(selectedSession.session_date) }}</td>
                    </tr>
                    <tr>
                      <td><strong>Date de convocation:</strong></td>
                      <td>{{ formatDate(selectedSession.convocation_date) }}</td>
                    </tr>
                    <tr>
                      <td><strong>Mode:</strong></td>
                      <td>{{ selectedSession.session_mode }}</td>
                    </tr>
                    <tr v-if="selectedSession.url">
                      <td><strong>URL:</strong></td>
                      <td>
                        <a :href="selectedSession.url" target="_blank" class="text-decoration-none">
                          {{ selectedSession.url }}
                          <i class="fas fa-external-link-alt ms-1"></i>
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="col-md-6">
                <h6>Procès-verbal</h6>
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>Statut:</strong></td>
                      <td>
                        <span class="badge" :class="selectedSession.pv_registered ? 'bg-success' : 'bg-secondary'">
                          {{ selectedSession.pv_registered ? 'Enregistré' : 'Non enregistré' }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="selectedSession.pv_signature_date">
                      <td><strong>Date de signature:</strong></td>
                      <td>{{ formatDate(selectedSession.pv_signature_date) }}</td>
                    </tr>
                    <tr v-if="selectedSession.pv_file">
                      <td><strong>Fichier PV:</strong></td>
                      <td>
                        <a :href="selectedSession.pv_file" target="_blank" class="btn btn-sm btn-outline-primary">
                          <i class="fas fa-download me-1"></i>
                          Télécharger
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="mt-3" v-if="selectedSession.observations">
              <h6>Observations</h6>
              <div class="bg-light p-3 rounded">
                {{ selectedSession.observations }}
              </div>
            </div>

            <div class="mt-3" v-if="selectedSession.participants?.length > 0">
              <h6>Participants ({{ selectedSession.participants.length }})</h6>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Statut invitation</th>
                      <th>Invité</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="participant in selectedSession.participants" :key="participant.id">
                      <td>{{ participant.name }}</td>
                      <td>{{ participant.email }}</td>
                      <td>
                        <span class="badge" :class="getStatusClass(participant.status)">
                          {{ getStatusLabel(participant.status) }}
                        </span>
                      </td>
                      <td>
                        <i class="fas" :class="participant.invited ? 'fa-check text-success' : 'fa-times text-danger'"></i>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="mt-3" v-if="selectedSession.board_council?.members?.length > 0">
              <h6>Membres du conseil d'administration</h6>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Position</th>
                      <th>Structure</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="member in selectedSession.board_council?.members" :key="member.id">
                      <td>{{ member.nom_prenom }}</td>
                      <td>
                        <span class="badge" :class="member.position === 'Président' ? 'bg-primary' : 'bg-secondary'">
                          {{ member.position }}
                        </span>
                      </td>
                      <td>{{ member.structure_representee }}</td>
                      <td>{{ member.email }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDetailModal">Fermer</button>
            <button type="button" class="btn btn-success" @click="editSession(selectedSession)">
              <i class="fas fa-edit me-1"></i>
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div class="modal fade" :id="`deleteModal-${componentId}`" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmer la suppression</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer cette session ?</p>
            <div v-if="selectedSession" class="bg-light p-3 rounded">
              <strong>{{ selectedSession.type }}</strong><br>
              Date: {{ formatDate(selectedSession.session_date) }}<br>
              <span v-if="selectedSession.participants?.length > 0">
                {{ selectedSession.participants.length }} participant(s)
              </span>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Annuler</button>
            <button type="button" class="btn btn-danger" @click="handleDelete">
              <i class="fas fa-trash me-1"></i>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour basculer PV -->
    <div class="modal fade" :id="`pvModal-${componentId}`" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Basculer PV</h5>
            <button type="button" class="btn-close" @click="closePVModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedSession" class="mb-3">
              <div class="bg-light p-3 rounded mb-3">
                <strong>{{ selectedSession.type }}</strong><br>
                Date: {{ formatDate(selectedSession.session_date) }}<br>
                PV actuel: 
                <span class="badge" :class="selectedSession.pv_registered ? 'bg-success' : 'bg-secondary'">
                  {{ selectedSession.pv_registered ? 'Enregistré' : 'Non enregistré' }}
                </span>
              </div>
              
              <div class="form-group" v-if="!selectedSession.pv_registered">
                <label class="form-label">Sélectionner le fichier PV :</label>
                <input 
                  type="file" 
                  ref="pvFileInput"
                  @change="onPVFileSelected"
                  class="form-control" 
                  accept=".pdf,.doc,.docx"
                  required
                />
                <div class="form-text">
                  Formats acceptés : PDF, DOC, DOCX
                </div>
              </div>
              
              <div class="mt-3">
                <p class="text-muted">
                  Action : {{ selectedSession.pv_registered ? 'Supprimer le fichier PV existant' : 'Télécharger et enregistrer un fichier PV' }}
                </p>
                <div v-if="selectedSession.pv_registered && selectedSession.pv_file" class="bg-light p-2 rounded">
                  <small>
                    <i class="fas fa-file-alt me-1"></i>
                    Fichier actuel : {{ getFileName(selectedSession.pv_file) }}
                  </small>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closePVModal">Annuler</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="confirmPVToggle"
              :disabled="!selectedSession?.pv_registered && !selectedPVFile"
            >
              <i class="fas fa-exchange-alt me-1"></i>
              {{ selectedSession?.pv_registered ? 'Supprimer le PV' : 'Enregistrer le PV' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de session -->
    <SessionModal
      :modal-id="`sessionModal-${componentId}`"
      :mode="modalMode"
      :session-data="selectedSession"
      :board-council-id="boardCouncilId"
      @session-saved="onSessionSaved"
      @modal-closed="onModalClosed"
      ref="sessionModal"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'
import { Modal } from 'bootstrap'
import SessionModal from './SessionModal.vue'

export default {
  name: 'SessionsList',
  components: {
    SessionModal
  },
  props: {
    boardCouncilId: {
      type: String,
      required: true
    },
    componentId: {
      type: String,
      default: () => Math.random().toString(36).substr(2, 9)
    }
  },
  emits: ['sessions-updated'],
  setup(props, { emit }) {
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()
    
    // États
    const sessions = ref([])
    const loading = ref(false)
    const modalMode = ref('create')
    const selectedSession = ref(null)
    const sessionModal = ref(null)
    const selectedPC = ref('')
    const selectedPVFile = ref(null)
    const pvFileInput = ref(null)

    const filters = ref({
      search: '',
      type: '',
      session_mode: '',
      date: ''
    })
    
    const pagination = ref({
      current_page: 1,
      per_page: 10,
      total: 0,
      total_pages: 0
    })

    // Méthodes utilitaires
    const getTypeClass = (type) => {
      switch (type) {
        case 'Arrêté des comptes':
          return 'bg-primary'
        case 'Adoption du budget':
          return 'bg-success'
        case 'Session ordinaire':
          return 'bg-info'
        case 'Session extraordinaire':
          return 'bg-warning text-dark'
        default:
          return 'bg-secondary'
      }
    }

    const getStatusClass = (status) => {
      switch (status) {
        case 'accepted':
          return 'bg-success'
        case 'declined':
          return 'bg-danger'
        case 'pending':
          return 'bg-warning text-dark'
        default:
          return 'bg-secondary'
      }
    }

    const getStatusLabel = (status) => {
      switch (status) {
        case 'accepted':
          return 'Accepté'
        case 'declined':
          return 'Refusé'
        case 'pending':
          return 'En attente'
        default:
          return 'Non défini'
      }
    }

    const formatDate = (date) => {
      if (!date) return '—'
      return new Date(date).toLocaleDateString('fr-FR')
    }

    const getParticipantsStatus = (participants) => {
      if (!participants || participants.length === 0) return ''
      
      const accepted = participants.filter(p => p.status === 'accepted').length
      const pending = participants.filter(p => p.status === 'pending').length
      const declined = participants.filter(p => p.status === 'declined').length
      
      let status = []
      if (accepted > 0) status.push(`${accepted} accepté(s)`)
      if (pending > 0) status.push(`${pending} en attente`)
      if (declined > 0) status.push(`${declined} refusé(s)`)
      
      return status.join(', ')
    }

    const getFileName = (filePath) => {
      if (!filePath) return ''
      return filePath.split('/').pop() || filePath.split('\\').pop() || filePath
    }

    const onPVFileSelected = (event) => {
      const file = event.target.files[0]
      selectedPVFile.value = file
    }

    // Méthodes de chargement et filtrage
    const loadSessions = async (page = 1) => {
      loading.value = true
      try {
        const params = {
          page,
          board_council_id: props.boardCouncilId,
          ...filters.value
        }
        
        // Nettoyer les paramètres vides
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        const response = await store.dispatch('sessions/fetchSessions', params)
        
        // Adapter selon la structure de réponse de votre API
        if (Array.isArray(response)) {
          sessions.value = response
          pagination.value = {
            current_page: 1,
            per_page: response.length,
            total: response.length,
            total_pages: 1
          }
        } else {
          sessions.value = response.items || response.data || []
          pagination.value = {
            current_page: response.current_page || 1,
            per_page: response.per_page || 10,
            total: response.total || sessions.value.length,
            total_pages: response.total_pages || 1
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des sessions:', error)
        const errorMessage = error?.response?.data?.detail || 
                           error?.message || 
                           'Erreur lors du chargement des sessions'
        notifyError(errorMessage)
        sessions.value = []
      } finally {
        loading.value = false
      }
    }
    
    const searchSessions = () => loadSessions(1)
    const filterSessions = () => loadSessions(1)
    
    const goToPage = (page) => {
      if (page >= 1 && page <= pagination.value.total_pages) {
        loadSessions(page)
      }
    }
    
    const getPageNumbers = () => {
      const pages = []
      const start = Math.max(1, pagination.value.current_page - 2)
      const end = Math.min(pagination.value.total_pages, pagination.value.current_page + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }

    // Méthodes du modal
    const openCreateModal = () => {
      modalMode.value = 'create'
      selectedSession.value = {}
      sessionModal.value?.show()
    }

    const viewSession = (session) => {
      selectedSession.value = session
      const modal = Modal.getInstance(document.getElementById(`sessionDetailModal-${props.componentId}`)) || 
                   new Modal(document.getElementById(`sessionDetailModal-${props.componentId}`))
      modal.show()
    }

    const closeDetailModal = () => {
      const modal = Modal.getInstance(document.getElementById(`sessionDetailModal-${props.componentId}`))
      if (modal) {
        modal.hide()
        selectedSession.value = null
      }
    }

    const editSession = (session) => {
      closeDetailModal() // Fermer le modal de détails s'il est ouvert
      modalMode.value = 'edit'
      selectedSession.value = session
      sessionModal.value?.show()
    }

    const onSessionSaved = () => {
      loadSessions(pagination.value.current_page)
      emit('sessions-updated')
    }

    const onModalClosed = () => {
      selectedSession.value = null
    }

    // Actions
    const togglePVRegistration = (session) => {
      selectedSession.value = session
      selectedPC.value = ''
      selectedPVFile.value = null
      if (pvFileInput.value) {
        pvFileInput.value.value = ''
      }
      const modal = Modal.getInstance(document.getElementById(`pvModal-${props.componentId}`)) || 
                   new Modal(document.getElementById(`pvModal-${props.componentId}`))
      modal.show()
    }
    
    const closePVModal = () => {
      const modal = Modal.getInstance(document.getElementById(`pvModal-${props.componentId}`))
      if (modal) {
        modal.hide()
      }
      selectedSession.value = null
      selectedPC.value = ''
      selectedPVFile.value = null
      if (pvFileInput.value) {
        pvFileInput.value.value = ''
      }
    }
    
    const confirmPVToggle = async () => {
      if (!selectedSession.value) return
      
      try {
        if (selectedSession.value.pv_registered) {
          // Si le PV est déjà enregistré, on fait juste un toggle pour le supprimer
          await store.dispatch('sessions/togglePVRegistration', selectedSession.value.id)
          notifySuccess('PV supprimé avec succès')
        } else {
          // Si le PV n'est pas enregistré, on doit d'abord uploader le fichier
          if (!selectedPVFile.value) {
            notifyError('Veuillez sélectionner un fichier PV')
            return
          }
          
          await store.dispatch('sessions/uploadPVFile', {
            sessionId: selectedSession.value.id,
            file: selectedPVFile.value
          })
          notifySuccess('PV enregistré avec succès')
        }
        
        await loadSessions(pagination.value.current_page)
        closePVModal()
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut PV:', error)
        const errorMessage = error?.response?.data?.detail || 
                           error?.message || 
                           'Erreur lors de la mise à jour du statut PV'
        notifyError(errorMessage)
      }
    }

    const confirmDelete = (session) => {
      selectedSession.value = session
      const modal = Modal.getInstance(document.getElementById(`deleteModal-${props.componentId}`)) || 
                   new Modal(document.getElementById(`deleteModal-${props.componentId}`))
      modal.show()
    }

    const closeDeleteModal = () => {
      const modal = Modal.getInstance(document.getElementById(`deleteModal-${props.componentId}`))
      if (modal) {
        modal.hide()
        selectedSession.value = null
      }
    }

    const handleDelete = async () => {
      if (!selectedSession.value) return

      try {
        await store.dispatch('sessions/deleteSession', selectedSession.value.id)
        notifySuccess('Session supprimée avec succès')
        closeDeleteModal()
        loadSessions(pagination.value.current_page)
        emit('sessions-updated')
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        const errorMessage = error?.response?.data?.detail || 
                           error?.message || 
                           'Une erreur est survenue lors de la suppression'
        notifyError(errorMessage)
      }
    }

    const downloadAllPV = async () => {
      try {
        await store.dispatch('sessions/downloadAllPVFiles', props.boardCouncilId)
        notifySuccess('Téléchargement des PV commencé')
      } catch (error) {
        console.error('Erreur lors du téléchargement des PV:', error)
        const errorMessage = error?.response?.data?.detail || 
                           error?.message || 
                           'Erreur lors du téléchargement des PV'
        notifyError(errorMessage)
      }
    }
    
    onMounted(() => {
      loadSessions()
    })
    
    return {
      sessions,
      loading,
      filters,
      pagination,
      modalMode,
      selectedSession,
      sessionModal,
      pvFileInput,
      selectedPVFile,
      searchSessions,
      filterSessions,
      goToPage,
      getPageNumbers,
      getTypeClass,
      getStatusClass,
      getStatusLabel,
      formatDate,
      getParticipantsStatus,
      getFileName,
      onPVFileSelected,
      openCreateModal,
      viewSession,
      closeDetailModal,
      editSession,
      onSessionSaved,
      onModalClosed,
      togglePVRegistration,
      closePVModal,
      confirmPVToggle,
      selectedPC,
      confirmDelete,
      closeDeleteModal,
      handleDelete,
      downloadAllPV
    }
  }
}
</script>

<style scoped>
.table th {
  font-weight: 600;
  color: #495057;
}

.badge {
  font-size: 0.75em;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}

.modal-lg {
  max-width: 900px;
}

.table-responsive {
  border-radius: 0.375rem;
}
</style>