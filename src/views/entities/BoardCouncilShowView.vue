<template>
  <div class="container-lg py-3">
    <nav class="d-flex align-items-center mb-4"> 
      <router-link :to="`/entities/${entityId}/mandates`" class="me-3 text-muted">
        <i class="bi bi-arrow-left"></i>
      </router-link>
      <div class="flex-grow-1">
        <h2 class="mb-0">Conseil d'administration</h2>
        <small class="text-muted">{{ council.reference_decret || 'Référence non définie' }}</small>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-success" @click="openCreateModal" title="Ajouter un membre">
          <i class="fas fa-user-plus"></i>
          Ajouter un membre
        </button>
      </div>
    </nav>

    <div v-if="loading" class="d-flex flex-column align-items-center justify-content-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <div class="mt-2 text-muted">Chargement...</div>
    </div>

    <div v-else>
      <ul class="nav nav-tabs mb-3" id="councilTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link" :class="{active: activeTab === 'council'}" id="council-tab" data-bs-toggle="tab" type="button" role="tab" @click="activeTab = 'council'">
            Conseil d'administration
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" :class="{active: activeTab === 'sessions'}" id="sessions-tab" data-bs-toggle="tab" type="button" role="tab" @click="activeTab = 'sessions'">
            Sessions du conseil
          </button>
        </li>
      </ul>
      <div class="tab-content">
        <div class="tab-pane fade" :class="{show: activeTab === 'council', active: activeTab === 'council'}" id="council" role="tabpanel">
          <!-- Conseil d'administration (copie de l'ancien contenu) -->
          <div class="row align-items-center mb-4 g-3">
            <div class="col-lg-8">
              <div class="card bg-light border-0 shadow-sm">
                <div class="card-body">
                  <div class="small text-muted">Date d'installation</div>
                  <div class="fw-medium">{{ formatDate(council.date_installation) || '—' }}</div>
                  <div class="small text-muted mt-2">Période</div>
                  <div class="fw-medium">{{ formatDate(council.start_date) || '—' }} → {{ formatDate(council.end_date) || '—' }}</div>
                </div>
              </div>
            </div>
            <div class="col-lg-4">
              <div class="d-flex justify-content-around text-center">
                <div class="px-3">
                  <div class="fs-4 fw-bold text-primary">{{ members.length }}</div>
                  <div class="small text-muted">Membres</div>
                </div>
                <div class="px-3">
                  <div class="fs-4 fw-bold text-success">{{ uniqueStructures }}</div>
                  <div class="small text-muted">Structures</div>
                </div>
                <div class="px-3">
                  <div class="fs-4 fw-bold text-info">{{ uniquePositions }}</div>
                  <div class="small text-muted">Positions</div>
                </div>
              </div>
            </div>
          </div>
          <div class="row justify-content-between align-items-center mb-3 g-3">
            <div class="col-auto">
              <div class="d-flex gap-2 align-items-center">
                <input v-model.number="yearFrom" type="number" class="form-control form-control-sm" placeholder="Année début" min="1900" :max="new Date().getFullYear()" style="width:120px" />
                <input v-model.number="yearTo" type="number" class="form-control form-control-sm" placeholder="Année fin" min="1900" :max="new Date().getFullYear()" style="width:120px" />
                <select v-model="statusFilter" class="form-select form-select-sm" style="width:130px">
                  <option value="">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="replaced">Remplacés</option>
                  <option value="inactive">Inactifs</option>
                </select>
                <button @click="applyFilters" class="btn btn-sm btn-success">Filtrer</button>
                <button @click="resetFilters" class="btn btn-sm btn-outline-secondary">Réinit</button>
              </div>
            </div>
            <div class="col-auto">
              <div class="input-group input-group-sm" style="min-width:260px;">
                <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input v-model="searchTerm" type="text" class="form-control border-start-0" placeholder="Rechercher un membre..." />
              </div>
            </div>
          </div>
          <div class="card border-0 shadow-sm">
            <div class="table-responsive">
              <table class="table table-borderless mb-0 align-middle">
                <thead class="border-bottom">
                  <tr class="text-muted small">
                    <th class="fw-semibold">Nom</th>
                    <th class="fw-semibold">Sexe</th>
                    <th class="fw-semibold">Âge</th>
                    <th class="fw-semibold">Téléphone</th>
                    <th class="fw-semibold">Profil professionnel</th>
                    <th class="fw-semibold">Structure</th>
                    <th class="fw-semibold">Position</th>
                    <th class="fw-semibold">Statut</th>
                    <th class="fw-semibold">Comité</th>
                    <th class="text-end fw-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="member in paginatedMembers" :key="member.id" class="border-bottom border-light">
                    <td>
                      <div class="d-flex align-items-center gap-3">
                        <div class="bg-light rounded d-flex align-items-center justify-content-center" style="width:40px; height:40px;">
                          <i class="fas fa-user-circle fs-4 text-muted"></i>
                        </div>
                        <div>
                          <div class="fw-medium">{{ member.nom_prenom || 'Non défini' }}</div>
                          <div class="small text-muted">{{ member.email || '' }}</div>
                        </div>
                      </div>
                    </td>
                    <td><span class="small text-muted">{{ member.sexe || '—' }}</span></td>
                    <td><span class="small text-muted">{{ member.age || '—' }}</span></td>
                    <td><span class="small text-muted">{{ member.telephone || '—' }}</span></td>
                    <td><span class="small text-muted" :title="member.profil_professionnel">{{ (member.profil_professionnel && member.profil_professionnel.length > 20) ? member.profil_professionnel.substring(0, 20) + '...' : (member.profil_professionnel || '—') }}</span></td>
                    <td><span class="small text-muted">{{ member.structure_representee || '—' }}</span></td>
                    <td><span :class="getPositionClass(member.position)">{{ member.position || '—' }}</span></td>
                    <td>
                      <span class="badge" :class="getStatusClass(member.status)">
                        {{ getStatusLabel(member.status) }}
                      </span>
                      <div v-if="member.replace_date" class="small text-muted mt-1">
                        Remplacé le {{ formatDate(member.replace_date) }}
                      </div>
                    </td>
                    <td>
                      <span class="badge" :class="member.is_committee ? 'bg-success' : 'bg-secondary'">
                        {{ member.is_committee ? 'Oui' : 'Non' }}
                      </span>
                    </td>
                    <td class="text-end">
                      <div class="d-flex gap-1 justify-content-end flex-wrap">
                        <button 
                          v-if="member.status === 'active'" 
                          class="btn btn-sm btn-outline-warning" 
                          title="Remplacer ce membre" 
                          @click="openReplacementModal(member)"
                        >
                          <i class="fas fa-exchange-alt"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-outline-info" 
                          title="Voir l'historique" 
                          @click="openHistoryModal(member)"
                        >
                          <i class="fas fa-history"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" title="Modifier" @click="openEditModal(member)">
                          <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button 
                          v-if="member.status !== 'replaced'" 
                          class="btn btn-sm btn-outline-danger" 
                          title="Supprimer" 
                          @click="deleteDirector(member)"
                        >
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="card-footer bg-white d-flex justify-content-between align-items-center border-top">
              <div class="small text-muted">{{ filteredMembers.length }} membres</div>
              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-outline-secondary" :disabled="currentPage === 1" @click="currentPage--">Précédent</button>
                <span class="small text-muted">{{ currentPage }} / {{ totalPages || 1 }}</span>
                <button class="btn btn-sm btn-outline-secondary" :disabled="currentPage === totalPages" @click="currentPage++">Suivant</button>
              </div>
            </div>
          </div>
          <div v-if="!loading && members.length === 0" class="text-center py-5 text-muted">
            <i class="bi bi-people display-4 mb-3 d-block"></i>
            <div>Aucun membre trouvé pour ce conseil.</div>
          </div>
        </div>
        <div class="tab-pane fade" :class="{show: activeTab === 'sessions', active: activeTab === 'sessions'}" id="sessions" role="tabpanel">
          <SessionsList 
            :board-council-id="$route.params.councilId"
            component-id="boardCouncilShow"
            @sessions-updated="onSessionsUpdated"
          />
        </div>
      </div>
    </div>

    <!-- Modal création / modification Board Director -->
    <div v-if="showModal" class="modal d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Modifier membre' : 'Ajouter un membre' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label small fw-semibold">Associer un utilisateur</label>
              <div class="btn-group btn-group-sm d-flex" role="group">
                <input type="radio" class="btn-check" name="userChoice" id="newUser" :checked="!chooseExisting" @change="chooseExisting = false">
                <label class="btn btn-outline-secondary" for="newUser">Créer un nouvel utilisateur</label>
                
                <input type="radio" class="btn-check" name="userChoice" id="existingUser" :checked="chooseExisting" @change="chooseExisting = true">
                <label class="btn btn-outline-secondary" for="existingUser">Sélectionner un utilisateur</label>
              </div>
            </div>

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
              <div v-else-if="usersResults.length" class="border rounded">
                <div v-for="u in usersResults" :key="u.id" class="d-flex justify-content-between align-items-center p-2 border-bottom">
                  <div>
                    <div class="fw-medium small">{{ u.username || u.email }}</div>
                    <div class="text-muted small">{{ u.email || '' }}</div>
                    <div v-if="u.role" class="text-muted small">Rôle: {{ u.role.name }}</div>
                  </div>
                  <button class="btn btn-sm btn-success" @click="selectExistingUser(u)">Choisir</button>
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
                    <strong>Utilisateur {{ isEditing ? 'associé' : 'sélectionné' }} :</strong><br>
                    <span class="fw-medium">{{ selectedUser.username || selectedUser.email }}</span><br>
                    <span class="text-muted">{{ selectedUser.email }}</span>
                    <span v-if="isEditing" class="small text-info d-block">(Utilisateur actuellement lié)</span>
                  </div>
                  <button type="button" class="btn btn-sm btn-link text-danger p-0" @click="clearSelectedUser" :title="isEditing ? 'Dissocier cet utilisateur' : 'Désélectionner'">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </div>

            <div v-else>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Nom et prénom</label>
                <input v-model="form.nom_prenom" type="text" class="form-control form-control-sm" />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Email</label>
                <input v-model="newUser.email" type="email" class="form-control form-control-sm" />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Nom d'utilisateur</label>
                <input v-model="newUser.username" type="text" class="form-control form-control-sm" />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Mot de passe</label>
                <input v-model="newUser.password" type="password" class="form-control form-control-sm" />
              </div>
            </div>

            <hr class="my-3" />

            <div class="mb-3">
              <label class="form-label small fw-semibold">Position dans le Conseil</label>
              <select v-model="form.position" class="form-select form-select-sm">
                <option value="">Sélectionner une position</option>
                <option value="Président">Président</option>
                <option value="Membre">Membre</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold">Structure représentée</label>
              <input v-model="form.structure_representee" type="text" class="form-control form-control-sm" />
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold">Profil professionnel</label>
              <textarea v-model="form.profil_professionnel" class="form-control form-control-sm" rows="3" placeholder="Décrivez le profil professionnel..."></textarea>
            </div>
            <div class="row mb-3">
              <div class="col-8">
                <label class="form-label small fw-semibold">Sexe</label>
                <select v-model="form.sexe" class="form-select form-select-sm">
                  <option value="">--</option>
                  <option>Homme</option>
                  <option>Femme</option>
                </select>
              </div>
              <div class="col-4">
                <label class="form-label small fw-semibold">Âge</label>
                <input v-model.number="form.age" type="number" class="form-control form-control-sm" />
              </div>
            </div>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" v-model="form.is_committee" id="isCommitteeSwitch" />
              <label class="form-check-label small" for="isCommitteeSwitch">Membre du comité</label>
            </div>
            <div v-if="errorMessage" class="alert alert-danger small mt-3 mb-0">{{ errorMessage }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-outline-secondary" @click="closeModal">Annuler</button>
            <button class="btn btn-sm btn-success" :disabled="modalLoading" @click="submitDirector">
              <span v-if="modalLoading" class="spinner-border spinner-border-sm me-1"></span>
              {{ modalLoading ? 'En cours...' : (isEditing ? 'Enregistrer' : 'Créer') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de remplacement -->
    <BoardDirectorReplacement
      :show="showReplacementModal"
      :director="selectedDirectorForReplacement"
      :board-council-id="$route.params.councilId"
      @close="closeReplacementModal"
      @replaced="onDirectorReplaced"
      @show-history="openHistoryModal"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import SessionsList from '@/components/sessions/SessionsList.vue'
import BoardDirectorReplacement from '@/components/board-directors/BoardDirectorReplacement.vue'

export default {
  name: 'BoardCouncilShowView',
  components: {
    SessionsList,
    BoardDirectorReplacement
  },
  props: ['entityId'],
  setup(props) {
    const store = useStore()
    const route = useRoute()
  const loading = ref(false)
  // Onglets
  const activeTab = ref('council')
    const council = ref({})
    const members = ref([])
    const yearFrom = ref(null)
    const yearTo = ref(null)
    const searchTerm = ref('')
    const statusFilter = ref('')
    const sortField = ref('nom_prenom')
    const sortDirection = ref('asc')
    const currentPage = ref(1)
    const itemsPerPage = ref(10)

    // Fonctions utilitaires
    const formatDate = (dateString) => {
      if (!dateString) return null
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const getPositionClass = (position) => {
      const baseClass = 'badge '
      switch (position?.toLowerCase()) {
        case 'président':
        case 'présidente':
          return baseClass + 'bg-primary'
        case 'vice-président':
        case 'vice-présidente':
          return baseClass + 'bg-secondary'
        case 'secrétaire':
          return baseClass + 'bg-info'
        case 'trésorier':
        case 'trésorière':
          return baseClass + 'bg-warning text-dark'
        default:
          return baseClass + 'bg-light text-dark'
      }
    }

    const getStatusClass = (status) => {
      switch (status) {
        case 'active':
          return 'bg-success'
        case 'replaced':
          return 'bg-warning text-dark'
        case 'inactive':
          return 'bg-secondary'
        default:
          return 'bg-success' // Par défaut, considérer comme actif
      }
    }

    const getStatusLabel = (status) => {
      switch (status) {
        case 'active':
          return 'Actif'
        case 'replaced':
          return 'Remplacé'
        case 'inactive':
          return 'Inactif'
        default:
          return 'Actif' // Par défaut, considérer comme actif
      }
    }

    // Computed properties
    const uniqueStructures = computed(() => {
      const structures = members.value.map(m => m.structure_representee).filter(Boolean)
      return new Set(structures).size
    })

    const uniquePositions = computed(() => {
      const positions = members.value.map(m => m.position).filter(Boolean)
      return new Set(positions).size
    })

    const filteredMembers = computed(() => {
      // Ensure we work with only defined member objects
      let filtered = members.value ? members.value.filter(m => m) : []

      // Filtrage par terme de recherche
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter(m => {
          return (
            (m.nom_prenom || '').toString().toLowerCase().includes(term) ||
            (m.structure_representee || '').toString().toLowerCase().includes(term) ||
            (m.position || '').toString().toLowerCase().includes(term)
          )
        })
      }

      // Filtrage par statut
      if (statusFilter.value) {
        filtered = filtered.filter(m => {
          const memberStatus = m.status || 'active' // Par défaut, considérer comme actif
          return memberStatus === statusFilter.value
        })
      }

      // Tri (use safe access)
      filtered.sort((a, b) => {
        const aVal = (a && a[sortField.value]) || ''
        const bVal = (b && b[sortField.value]) || ''
        const comparison = aVal.toString().localeCompare(bVal.toString(), 'fr', { sensitivity: 'base' })
        return sortDirection.value === 'asc' ? comparison : -comparison
      })

      return filtered
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredMembers.value.length / itemsPerPage.value)
    })

    const paginatedMembers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      // filter out any falsy entries after slicing to be extra safe
      return (filteredMembers.value.slice(start, end) || []).filter(m => m)
    })

    const visiblePages = computed(() => {
      const pages = []
      const total = totalPages.value
      const current = currentPage.value

      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i)
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i)
          pages.push('...', total)
        } else if (current >= total - 3) {
          pages.push(1, '...')
          for (let i = total - 4; i <= total; i++) pages.push(i)
        } else {
          pages.push(1, '...')
          for (let i = current - 1; i <= current + 1; i++) pages.push(i)
          pages.push('...', total)
        }
      }

      return pages.filter(p => p !== '...' || pages.indexOf(p) === pages.lastIndexOf(p))
    })

    // Modal and creation/editing of BoardDirector
    const showModal = ref(false)
    const isEditing = ref(false)
    const modalLoading = ref(false)
    const errorMessage = ref(null)
    const chooseExisting = ref(true)
    const usersSearchTerm = ref('')
    const usersResults = ref([])
    const usersSearchLoading = ref(false)
    const selectedUser = ref(null)
    const newUser = ref({ username: '', email: '', password: '' })

    // Modal de remplacement
    const showReplacementModal = ref(false)
    const selectedDirectorForReplacement = ref(null)

    const form = ref({
      nom_prenom: '',
      sexe: '',
      age: null,
      profil_professionnel: '',
      email: '',
      telephone: '',
      structure_representee: '',
      position: '',
      is_committee: false,
      user_id: null,
      board_council_id: route.params.councilId
    })

    const openCreateModal = () => {
      isEditing.value = false
      showModal.value = true
      errorMessage.value = null
      // reset form
      form.value = { ...form.value, nom_prenom: '', sexe: '', age: null, profil_professionnel: '', email: '', telephone: '', structure_representee: '', position: '', is_committee: false, user_id: null }
      selectedUser.value = null
      newUser.value = { username: '', email: '', password: '' }
      chooseExisting.value = true
      usersResults.value = []
      usersSearchTerm.value = ''
    }

    const closeModal = () => {
      showModal.value = false
    }

    const clearSelectedUser = () => {
      selectedUser.value = null
      form.value.user_id = null
      
      // Si on est en mode édition, garder les données originales du membre
      if (!isEditing.value) {
        form.value.nom_prenom = ''
        form.value.email = ''
      }
      
      // Basculer vers le mode "créer un nouvel utilisateur"
      chooseExisting.value = false
    }

    // user search (corrigé pour le nouveau format d'API)
    let searchTimeout = null
    const debouncedSearchUsers = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => searchUsers(), 400)
    }

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
        
        // Traiter la réponse selon le nouveau format
        if (res.data && res.data.items) {
          usersResults.value = res.data.items
        } else if (Array.isArray(res.data)) {
          // Au cas où l'API retournerait directement un tableau
          usersResults.value = res.data
        } else {
          usersResults.value = []
        }
      } catch (error) {
        console.error('Erreur lors de la recherche d\'utilisateurs:', error)
        usersResults.value = []
        // Optionnel: afficher un message d'erreur à l'utilisateur
        if (error.response?.status === 404) {
          // Endpoint non trouvé
        } else if (error.response?.status >= 500) {
          // Erreur serveur
        }
      } finally {
        usersSearchLoading.value = false
      }
    }

    const selectExistingUser = (user) => {
      selectedUser.value = user
      form.value.user_id = user.id
      form.value.nom_prenom = user.username || user.email
      form.value.email = user.email
      
      // Vider la liste de résultats après sélection
      usersResults.value = []
      usersSearchTerm.value = ''
    }

    const submitDirector = async () => {
      errorMessage.value = null
      modalLoading.value = true
      try {
        let payload = { ...form.value }
        
        // Nettoyer les champs vides ou null
        Object.keys(payload).forEach(key => {
          if (payload[key] === '' || payload[key] === null) {
            delete payload[key]
          }
        })
        
        // Gestion spécifique pour la création vs modification
        if (isEditing.value && form.value.id) {
          // Mode édition : ne pas inclure new_user, gérer user_id
          if (chooseExisting.value && selectedUser.value) {
            payload.user_id = selectedUser.value.id
          } else if (!chooseExisting.value) {
            // Si on passe d'un utilisateur existant à la création d'un nouveau
            payload.user_id = null
            if (newUser.value.email && newUser.value.username && newUser.value.password) {
              payload.new_user = { ...newUser.value }
            }
          }
          
          await store.dispatch('boardDirectors/updateBoardDirector', { id: form.value.id, payload })
        } else {
          // Mode création
          if (!chooseExisting.value && newUser.value.email && newUser.value.username && newUser.value.password) {
            payload.new_user = { ...newUser.value }
            payload.user_id = null // S'assurer que user_id est null lors de la création d'un nouvel utilisateur
          } else if (chooseExisting.value && selectedUser.value) {
            payload.user_id = selectedUser.value.id
          }
          
          await store.dispatch('boardDirectors/createBoardDirector', payload)
        }
        
        // refresh members list by reloading council
        await load()
        closeModal()
      } catch (e) {
        console.error('Erreur lors de la soumission:', e)
        errorMessage.value = e?.detail || e?.message || 'Erreur lors de la création/modification'
      } finally {
        modalLoading.value = false
      }
    }

    const openEditModal = (member) => {
      isEditing.value = true
      showModal.value = true
      errorMessage.value = null
      
      // populate form with member data
      form.value = {
        id: member.id,
        nom_prenom: member.nom_prenom || '',
        sexe: member.sexe || '',
        age: member.age || null,
        profil_professionnel: member.profil_professionnel || '',
        email: member.email || '',
        telephone: member.telephone || '',
        structure_representee: member.structure_representee || '',
        position: member.position || '',
        is_committee: !!member.is_committee,
        user_id: member.user_id || null,
        board_council_id: route.params.councilId
      }
      
      // Gérer l'utilisateur associé
      if (member.user_id) {
        chooseExisting.value = true
        selectedUser.value = {
          id: member.user_id,
          username: member.user?.username || member.nom_prenom,
          email: member.user?.email || member.email
        }
        
        // Mettre à jour les champs du formulaire avec les données utilisateur si disponibles
        if (member.user) {
          form.value.nom_prenom = member.user.username || member.nom_prenom
          form.value.email = member.user.email || member.email
        }
      } else {
        chooseExisting.value = false
        selectedUser.value = null
        // Préparer les données pour un nouvel utilisateur si nécessaire
        newUser.value = {
          username: '',
          email: member.email || '',
          password: ''
        }
      }
      
      // Réinitialiser les résultats de recherche
      usersResults.value = []
      usersSearchTerm.value = ''
    }

    const deleteDirector = async (member) => {
      if (!confirm('Confirmer la suppression de ce membre ?')) return
      try {
        await store.dispatch('boardDirectors/deleteBoardDirector', member.id)
        // remove locally
        members.value = members.value.filter(m => m.id !== member.id)
      } catch (err) {
        console.error('Erreur suppression:', err)
        alert('Impossible de supprimer ce membre')
      }
    }

    // Méthodes pour le remplacement
    const openReplacementModal = (member) => {
      console.log('🔄 openReplacementModal appelé avec:', member)
      selectedDirectorForReplacement.value = member
      showReplacementModal.value = true
      console.log('✅ showReplacementModal.value =', showReplacementModal.value)
      console.log('✅ selectedDirectorForReplacement.value =', selectedDirectorForReplacement.value)
    }

    const closeReplacementModal = () => {
      console.log('❌ closeReplacementModal appelé')
      showReplacementModal.value = false
      selectedDirectorForReplacement.value = null
    }

    const onDirectorReplaced = async () => {
      console.log('✅ onDirectorReplaced appelé')
      // Recharger la liste des membres après un remplacement
      await load()
      closeReplacementModal()
    }

    const openHistoryModal = async (member) => {
      console.log('📜 openHistoryModal appelé avec:', member)
      try {
        // Récupérer l'historique des remplacements pour ce membre
        const history = await store.dispatch('boardDirectors/fetchBoardDirectorReplacements', member.id)
        console.log('📊 Historique récupéré:', history)
        
        // Ouvrir le modal avec l'historique
        selectedDirectorForReplacement.value = { ...member, replacementHistory: history }
        showReplacementModal.value = true
        console.log('✅ Modal d\'historique ouvert')
      } catch (error) {
        console.error('❌ Erreur lors de la récupération de l\'historique:', error)
        alert('Impossible de récupérer l\'historique des remplacements')
      }
    }

    // Méthodes
    const load = async () => {
      loading.value = true
      try {
        const res = await store.dispatch('boardCouncils/fetchBoardCouncil', route.params.councilId)
        council.value = res
        members.value = res.members || []
      } catch (e) {
        console.error('Erreur lors du chargement:', e)
      } finally {
        loading.value = false
      }
    }

    const applyFilters = async () => {
      await load()
      if (yearFrom.value || yearTo.value) {
        // Implémentation du filtrage par années
        members.value = members.value.filter(m => {
          // Logique de filtrage à implémenter selon votre structure de données
          return true
        })
      }
      currentPage.value = 1
    }

    const resetFilters = () => {
      yearFrom.value = null
      yearTo.value = null
      searchTerm.value = ''
      statusFilter.value = ''
      currentPage.value = 1
      load()
    }

    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = field
        sortDirection.value = 'asc'
      }
      currentPage.value = 1
    }

    const getSortIcon = (field) => {
      if (sortField.value !== field) return 'bi bi-chevron-expand'
      return sortDirection.value === 'asc' ? 'bi bi-chevron-up' : 'bi bi-chevron-down'
    }

    const onSessionsUpdated = () => {
      // Optionnel : recharger les données du conseil si nécessaire
      console.log('Sessions mises à jour')
    }

    onMounted(load)

    return {
      loading,
      council,
      members,
      yearFrom,
      yearTo,
      searchTerm,
      statusFilter,
      currentPage,
      filteredMembers,
      paginatedMembers,
      totalPages,
      visiblePages,
      uniqueStructures,
      uniquePositions,
      applyFilters,
      resetFilters,
      formatDate,
      getPositionClass,
      getStatusClass,
      getStatusLabel,
      sortBy,
      getSortIcon,
      onSessionsUpdated,
      // modal
      showModal,
      openCreateModal,
      closeModal,
      submitDirector,
      openEditModal,
      deleteDirector,
      isEditing,
      modalLoading,
      errorMessage,
      chooseExisting,
      usersSearchTerm,
      usersResults,
      usersSearchLoading,
      debouncedSearchUsers,
      searchUsers,
      selectExistingUser,
      clearSelectedUser,
      selectedUser,
      newUser,
      form,
      activeTab,
      // modal de remplacement
      showReplacementModal,
      selectedDirectorForReplacement,
      openReplacementModal,
      closeReplacementModal,
      onDirectorReplaced,
      openHistoryModal
    }
  }
}
</script>