<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="mb-0">Mandats</h5>
      <div class="d-flex gap-2">
        <!-- Filtres -->
        <select v-model="filters.status" @change="applyFilters" class="form-select form-select-sm">
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
        <select v-model="filters.is_active" @change="applyFilters" class="form-select form-select-sm">
          <option value="">Toutes les périodes</option>
          <option value="true">En cours</option>
          <option value="false">Expirés</option>
        </select>
        <input type="number" v-model.number="filters.start_year" @change="applyFilters" placeholder="Année début" class="form-control form-control-sm" style="width:110px" />
        <input type="number" v-model.number="filters.end_year" @change="applyFilters" placeholder="Année fin" class="form-control form-control-sm" style="width:110px" />
        <button class="btn btn-success btn-sm" @click="showCouncilModal()">
          <i class="fas fa-plus me-1"></i>
          Ajouter Mandat
        </button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th>Référence Décret</th>
            <th>Date Installation</th>
            <th>Période de Mandat</th>
            <th>Durée (Mois)</th>
            <th class="text-center">Statut</th>
            <th class="text-center">Nombre de Membres</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="council in councils" :key="council.id" class="align-middle">
            <td>
              <div>
                <h6 class="mb-1">{{ council.reference_decret }}</h6>
                <small class="text-muted">{{ council.entity_id.substring(0, 8) }}...</small>
              </div>
            </td>
            <td>
              <div class="small">
                <strong>{{ formatDate(council.date_installation) }}</strong>
              </div>
            </td>
            <td>
              <div class="small">
                <div><strong>Du:</strong> {{ formatDate(council.start_date) }}</div>
                <div><strong>Au:</strong> {{ formatDate(council.end_date) }}</div>
              </div>
            </td>
            <td>
              <span class="badge bg-info">{{ council.duration_months }} mois</span>
            </td>
            <td class="text-center">
              <span class="badge" :class="council.status === 'active' ? 'bg-success' : 'bg-secondary'">
                {{ council.status === 'active' ? 'Actif' : 'Inactif' }}
              </span>
            </td>
            <td class="text-center">
              <span class="badge bg-secondary">
                {{ council?.members?.length || 0 }} membre{{ (council?.members?.length || 0) > 1 ? 's' : '' }}
              </span>
            </td>
            <td class="text-center">
              <div class="btn-group btn-group-sm">
                <!-- Bouton Créer Session - seulement pour les conseils actifs -->
                <button v-if="council.status === 'active'" 
                        class="btn btn-success btn-sm" 
                        :title="'Créer une session pour ' + council.reference_decret"
                        @click="createSessionForCouncil(council)">
                  <i class="fas fa-calendar-plus"></i>
                </button>
                <button class="btn btn-outline-secondary" 
                        :title="'Voir conseil ' + council.reference_decret" 
                        @click="openCouncil(council.id)">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-outline-primary" 
                        :title="'Modifier conseil ' + council.reference_decret"
                        @click="showCouncilModal(council.id)">
                  <i class="fas fa-edit"></i>
                </button>
                <!-- Bouton toggle statut -->
                <button class="btn" 
                        :class="council.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'"
                        :title="council.status === 'active' ? 'Désactiver' : 'Activer'"
                        @click="toggleCouncilStatus(council)">
                  <i :class="council.status === 'active' ? 'fas fa-pause' : 'fas fa-play'"></i>
                </button>
                <button v-if="council.pv_installation && council.pv_installation.trim() !== ''" 
                        class="btn btn-outline-info" 
                        :title="'Télécharger PV ' + council.reference_decret"
                        @click="downloadPV(council.pv_installation)">
                  <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-outline-danger" 
                        :title="'Supprimer conseil ' + council.reference_decret"
                        @click="confirmDeleteCouncil(council)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!councils || councils.length === 0">
            <td colspan="7" class="text-center text-muted py-4">
              <i class="fas fa-inbox fa-2x mb-2"></i>
              <div>Aucun conseil d'administration trouvé</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <nav v-if="pagination.total_pages > 1" class="mt-3">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: !pagination.has_previous }">
          <a class="page-link" href="#" @click.prevent="changePage(pagination.current_page - 1)">Préc</a>
        </li>
        <li class="page-item disabled">
          <span class="page-link">Page {{ pagination.current_page }} / {{ pagination.total_pages }}</span>
        </li>
        <li class="page-item" :class="{ disabled: !pagination.has_next }">
          <a class="page-link" href="#" @click.prevent="changePage(pagination.current_page + 1)">Suiv</a>
        </li>
      </ul>
    </nav>

    <!-- Informations sur le total -->
    <div class="row mt-3">
      <div class="col-12">
        <small class="text-muted">
          Total: {{ pagination.total_items || councils.length }} mandat(s)
        </small>
      </div>
    </div>

    <!-- Modal de confirmation de suppression de mandat -->
    <div class="modal fade" id="deleteCouncilModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmer la suppression</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer ce mandat ?</p>
            <p class="text-danger fw-semibold mb-0" v-if="councilToDelete">
              {{ councilToDelete.reference_decret }}
            </p>
            <small class="text-muted">Cette action supprimera également tous les membres associés à ce mandat.</small>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="button" class="btn btn-danger" @click="deleteCouncil" :disabled="loading">
              <i v-if="loading" class="fas fa-spinner fa-spin me-2"></i>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal création / modification Mandat (BoardCouncil) -->
    <div class="modal fade" id="boardCouncilModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ councilEditing ? 'Modifier le mandat' : 'Créer un mandat' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCouncil">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Référence décret *</label>
                  <input v-model="councilForm.reference_decret" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">PV d'installation</label>
                  <input type="file" class="form-control" @change="onPvFileChange" accept=".pdf,.doc,.docx" />
                  <div v-if="councilForm.pv_installation && typeof councilForm.pv_installation === 'string'"
                    class="small text-muted mt-1">Fichier actuel: {{ councilForm.pv_installation }}</div>
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-semibold">Date installation *</label>
                  <input type="date" v-model="councilForm.date_installation" class="form-control" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Date début *</label>
                  <input type="date" v-model="councilForm.start_date" class="form-control" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Date fin *</label>
                  <input type="date" v-model="councilForm.end_date" class="form-control" required />
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-semibold">Durée (mois)</label>
                  <input type="number" min="0" v-model.number="councilForm.duration_months" class="form-control" readonly />
                  <small class="text-muted">Calculé automatiquement</small>
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-semibold">Statut</label>
                  <select v-model="councilForm.status" class="form-select">
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" class="btn btn-success" :disabled="councilLoading">
                  <i v-if="councilLoading" class="fas fa-spinner fa-spin me-2"></i>
                  {{ councilEditing ? 'Mettre à jour' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de session -->
    <SessionModal
      modal-id="sessionModalFromMandates"
      :mode="sessionModalMode"
      :session-data="selectedSession"
      :board-council-id="selectedCouncilForSession"
      @session-saved="onSessionSaved"
      @modal-closed="onSessionModalClosed"
      ref="sessionModal"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'
import { Modal } from 'bootstrap'
import SessionModal from '@/components/sessions/SessionModal.vue'

export default {
  name: 'MandatesView',
  components: {
    SessionModal
  },
  props: {
    entityId: {
      type: [String, Number],
      required: true
    },
    reloadData: {
      type: Function,
      required: false
    }
  },
  emits: ['data-updated'],
  setup(props, { emit }) {
    const store = useStore()
    const { notifyError, notifySuccess } = useNotyf()
    const router = useRouter()
    const councils = ref([])

    // États pour le modal de session
    const sessionModal = ref(null)
    const sessionModalMode = ref('create')
    const selectedSession = ref({})
    const selectedCouncilForSession = ref(null)

    // PV file reference
    const pvFile = ref(null)

    // Council modal state
    const councilForm = ref({
      id: null,
      entity_id: props.entityId,
      reference_decret: '',
      pv_installation: '',
      date_installation: '',
      start_date: '',
      duration_months: null,
      end_date: '',
      status: 'active'
    })

    const onPvFileChange = (event) => {
      const f = event.target.files && event.target.files[0]
      if (f) {
        pvFile.value = f
        // Show filename in the form for user feedback
        councilForm.value.pv_installation = f.name
      } else {
        pvFile.value = null
      }
    }

    // Auto compute duration_months from start_date and end_date
    const computeDurationMonths = () => {
      const s = councilForm.value.start_date
      const e = councilForm.value.end_date
      if (!s || !e) {
        councilForm.value.duration_months = null
        return
      }
      const sd = new Date(s)
      const ed = new Date(e)
      if (isNaN(sd) || isNaN(ed) || ed < sd) {
        councilForm.value.duration_months = 0
        return
      }
      let months = (ed.getFullYear() - sd.getFullYear()) * 12 + (ed.getMonth() - sd.getMonth())
      // Adjust by day
      if (ed.getDate() >= sd.getDate()) {
        // Keep months
      } else {
        months -= 1
      }
      councilForm.value.duration_months = months >= 0 ? months : 0
    }

    watch(() => councilForm.value.start_date, computeDurationMonths)
    watch(() => councilForm.value.end_date, computeDurationMonths)

    const filters = ref({
      status: '',
      is_active: '',
      start_year: '',
      end_year: ''
    })
    const loading = ref(false)
    const councilToDelete = ref(null)

    const formatDate = (date) => {
      return date ? new Date(date).toLocaleDateString('fr-FR') : 'Non renseigné'
    }

    const applyFilters = async () => {
      try {
        await loadCouncils()
        // Emit event to notify parent
        emit('data-updated')
      } catch (error) {
        console.error('Erreur lors du filtrage:', error)
        notifyError('Erreur lors du filtrage des mandats')
      }
    }

    const pagination = computed(() => store.getters['boardCouncils/pagination'] || {
      current_page: 1,
      total_pages: 1,
      has_previous: false,
      has_next: false,
      total_items: 0
    })

    const loadCouncils = async (page = 1) => {
      loading.value = true
      try {
        const params = { entity_id: props.entityId }
        if (filters.value.start_year) params.start_year = filters.value.start_year
        if (filters.value.end_year) params.end_year = filters.value.end_year
        if (filters.value.status) params.status = filters.value.status
        if (filters.value.is_active !== '') params.is_active = filters.value.is_active
        
        const res = await store.dispatch('boardCouncils/fetchBoardCouncils', { page, limit: 10, params })
        councils.value = res.board_councils || []
      } catch (error) {
        console.error('Erreur chargement conseils:', error)
        notifyError('Erreur lors du chargement des mandats')
      } finally {
        loading.value = false
      }
    }

    const openCouncil = (councilId) => {
      // Navigate to council detail page using router
      if (!councilId) return
      router.push({ path: `/entities/${props.entityId}/mandates/${councilId}` })
    }

    const confirmDeleteCouncil = (council) => {
      councilToDelete.value = council
      const modal = new Modal(document.getElementById('deleteCouncilModal'))
      modal.show()
    }

    const deleteCouncil = async () => {
      if (!councilToDelete.value) return

      loading.value = true
      try {
        await store.dispatch('boardCouncils/deleteBoardCouncil', councilToDelete.value.id)

        const modal = Modal.getInstance(document.getElementById('deleteCouncilModal')) || 
                     new Modal(document.getElementById('deleteCouncilModal'))
        modal.hide()
        
        // Reload councils
        await loadCouncils()
        notifySuccess('Mandat supprimé avec succès')
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        notifyError('Erreur lors de la suppression du mandat')
      } finally {
        loading.value = false
        councilToDelete.value = null
      }
    }

    const downloadPV = async (filename) => {
      try {
        // Assuming there's a method to download files
        await store.dispatch('boardCouncils/downloadPV', filename)
        notifySuccess('Téléchargement en cours...')
      } catch (error) {
        console.error('Erreur téléchargement:', error)
        notifyError('Erreur lors du téléchargement du PV')
      }
    }

    const createSessionForCouncil = (council) => {
      sessionModalMode.value = 'create'
      selectedSession.value = {}
      selectedCouncilForSession.value = council.id
      sessionModal.value?.show()
    }

    const onSessionSaved = () => {
      // Optionnel : recharger les données ou mettre à jour l'état
      emit('data-updated')
    }

    const onSessionModalClosed = () => {
      selectedSession.value = {}
      selectedCouncilForSession.value = null
    }

    const toggleCouncilStatus = async (council) => {
      try {
        await store.dispatch('boardCouncils/toggleBoardCouncilStatus', council.id)
        
        // Update local council status
        const index = councils.value.findIndex(c => c.id === council.id)
        if (index !== -1) {
          councils.value[index].status = councils.value[index].status === 'active' ? 'inactive' : 'active'
        }
        
        const newStatus = council.status === 'active' ? 'désactivé' : 'activé'
        notifySuccess(`Mandat ${newStatus} avec succès`)

        // Reload councils
        await loadCouncils()
      } catch (error) {
        console.error('Erreur toggle statut:', error)
        notifyError('Erreur lors du changement de statut')
      }
    }

    // Council modal state
    const councilEditing = ref(false)
    const councilLoading = ref(false)

    const showCouncilModal = async (councilId = null) => {
      resetCouncilForm()
      councilEditing.value = false
      pvFile.value = null

      if (councilId) {
        // Load existing council
        try {
          councilLoading.value = true
          const res = await store.dispatch('boardCouncils/fetchBoardCouncil', councilId)
          const c = res
          councilForm.value = {
            id: c.id,
            entity_id: c.entity_id,
            reference_decret: c.reference_decret || '',
            pv_installation: c.pv_installation || '',
            date_installation: c.date_installation || '',
            start_date: c.start_date || '',
            duration_months: c.duration_months || null,
            end_date: c.end_date || '',
            status: c.status || 'active'
          }
          councilEditing.value = true
        } catch (err) {
          console.error('Erreur chargement mandat:', err)
          notifyError('Impossible de charger le mandat')
          return
        } finally {
          councilLoading.value = false
        }
      }

      const modal = new Modal(document.getElementById('boardCouncilModal'))
      modal.show()
    }

    const resetCouncilForm = () => {
      councilForm.value = {
        id: null,
        entity_id: props.entityId,
        reference_decret: '',
        pv_installation: '',
        date_installation: '',
        start_date: '',
        duration_months: null,
        end_date: '',
        status: 'active'
      }
    }

    const preparePayloadForAPI = (payload) => {
      // Clean and prepare the payload for API submission
      const cleanedPayload = { ...payload }
      
      // Ensure entity_id is set
      cleanedPayload.entity_id = props.entityId

      // Remove empty or null fields from main payload, but preserve important fields like status
      Object.keys(cleanedPayload).forEach(key => {
        // Don't remove status field even if empty, as it has default values
        if (key === 'status') return
        
        if (cleanedPayload[key] === '' || cleanedPayload[key] === null) {
          delete cleanedPayload[key]
        }
      })

      return cleanedPayload
    }

    const saveCouncil = async () => {
      councilLoading.value = true
      try {
        // Prepare the payload
        const rawPayload = { ...councilForm.value }
        const cleanedPayload = preparePayloadForAPI(rawPayload)

        let res
        // Handle file upload if present
        if (pvFile.value) {
          const formData = new FormData()
          
          // Append simple fields to FormData
          Object.keys(cleanedPayload).forEach(key => {
            const val = cleanedPayload[key]
            if (val !== undefined && val !== null) {
              formData.append(key, String(val))
            }
          })
          
          // Append file
          formData.append('pv_installation', pvFile.value)

          // Make API call
          if (councilEditing.value && cleanedPayload.id) {
            res = await store.dispatch('boardCouncils/updateBoardCouncil', { 
              id: cleanedPayload.id, 
              payload: formData, 
              isForm: true 
            })
          } else {
            res = await store.dispatch('boardCouncils/createBoardCouncil', { 
              payload: formData, 
              isForm: true 
            })
          }
        } else {
          // Regular JSON payload
          if (councilEditing.value && cleanedPayload.id) {
            res = await store.dispatch('boardCouncils/updateBoardCouncil', { 
              id: cleanedPayload.id, 
              payload: cleanedPayload 
            })
          } else {
            res = await store.dispatch('boardCouncils/createBoardCouncil', cleanedPayload)
          }
        }

        // Close modal and reload data
        const modal = Modal.getInstance(document.getElementById('boardCouncilModal')) || 
                     new Modal(document.getElementById('boardCouncilModal'))
        modal.hide()
        
        await loadCouncils()
        emit('data-updated')
        
        notifySuccess(councilEditing.value ? 'Mandat mis à jour avec succès' : 'Mandat créé avec succès')
        
      } catch (err) {
        console.error('Erreur sauvegarde mandat:', err)
        const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.message || 
                           'Erreur lors de l\'enregistrement du mandat'
        notifyError(errorMessage)
      } finally {
        councilLoading.value = false
      }
    }

    onMounted(() => {
      loadCouncils()
    })

    return {
      // State
      filters,
      loading,
      councilToDelete,
      councils,
      pvFile,

      // Council modal state
      councilForm,
      councilEditing,
      councilLoading,

      // Session modal state
      sessionModal,
      sessionModalMode,
      selectedSession,
      selectedCouncilForSession,

      // Computed
      pagination,

      // Methods
      formatDate,
      applyFilters,
      openCouncil,
      showCouncilModal,
      saveCouncil,
      changePage: (p) => loadCouncils(p),
      onPvFileChange,
      resetCouncilForm,
      confirmDeleteCouncil,
      deleteCouncil,
      downloadPV,
      createSessionForCouncil,
      onSessionSaved,
      onSessionModalClosed,
      toggleCouncilStatus
    }
  }
}
</script>