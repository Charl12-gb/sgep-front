<template>
  <div class="container">
    <!-- En-tête de page -->
    <div class="d-flex justify-content-between align-items-center mt-4 mb-4">
      <h1 class="h2 text-dark mb-0">Gestion des utilisateurs</h1>
      <div class="d-flex gap-2">
        <button @click="$router.push('/admin/users/create')" class="btn btn-success">
          <i class="fas fa-plus me-1"></i>
          Nouvel utilisateur
        </button>
        <button @click="refreshUsers" class="btn btn-outline-secondary" :disabled="loading">
          <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i>
          Actualiser
        </button>
      </div>
    </div>
    
    <!-- Section filtres -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input
                v-model="searchQuery"
                @input="onSearchChange"
                type="text"
                placeholder="Rechercher par nom, email..."
                class="form-control"
              />
            </div>
          </div>
          
          <div class="col-md-3">
            <select v-model="roleFilter" class="form-select">
              <option value="">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="manager">Gestionnaire</option>
              <option value="user">Utilisateur</option>
              <option value="viewer">Observateur</option>
            </select>
          </div>
          
          <div class="col-md-3">
            <select v-model="statusFilter" class="form-select">
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <!-- État de chargement -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary me-2" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
      <span class="text-muted">Chargement des utilisateurs...</span>
    </div>
    
    <!-- État vide -->
    <div v-else-if="filteredUsers.length === 0" class="text-center py-5">
      <div class="card">
        <div class="card-body py-5">
          <i class="fas fa-users text-muted mb-3" style="font-size: 4rem;"></i>
          <h3 class="text-muted">Aucun utilisateur trouvé</h3>
          <p class="text-muted mb-4" v-if="searchQuery || roleFilter || statusFilter">
            Aucun utilisateur ne correspond à vos critères de recherche.
          </p>
          <p class="text-muted mb-4" v-else>
            Vous n'avez pas encore d'utilisateurs.
          </p>
          <div class="alert alert-info mt-3">
            <strong>Debug Info:</strong><br>
            Users array length: {{ users.length }}<br>
            Filtered users length: {{ filteredUsers.length }}<br>
            Store users: {{ store.getters['users/all_users']?.length || 0 }}
          </div>
          <button @click="$router.push('/admin/users/create')" class="btn btn-success">
            <i class="fas fa-plus me-1"></i>
            Créer le premier utilisateur
          </button>
        </div>
      </div>
    </div>
    
    <!-- Contenu principal -->
    <div v-else>
      
      <!-- Tableau des utilisateurs -->
      <div class="card">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Entité/Fonction</th>
                <th>Statut</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="flex-shrink-0 me-3">
                      <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                        <i class="fas fa-user"></i>
                      </div>
                    </div>
                    <div>
                      <div class="fw-semibold text-dark">{{ user.first_name }} {{ user.last_name }}</div>
                      <small class="text-muted">ID: {{ user.id }}</small>
                    </div>
                  </div>
                </td>
                <td class="text-muted">{{ user.email }}</td>
                <td>
                  <span class="badge rounded-pill" :class="getRoleBadgeClass(user.role)">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td>
                  <div v-if="user.last_board_director" class="small">
                    <div class="fw-semibold text-dark">{{ user.last_board_director.entity_name || 'Entité non définie' }}</div>
                    <div class="text-muted">{{ user.last_board_director.position || user.last_board_director.fonction || 'Fonction non définie' }}</div>
                    <div class="text-muted" v-if="user.last_board_director.date_nomination">
                      <small>Nommé le {{ formatDate(user.last_board_director.date_nomination) }}</small>
                    </div>
                  </div>
                  <div v-else class="text-muted small">
                    <em>Aucune fonction CA</em>
                  </div>
                </td>
                <td>
                  <span class="badge rounded-pill" :class="getStatusBadgeClass(user.status)">
                    {{ getStatusLabel(user.status) }}
                  </span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm" role="group">
                    <button 
                      @click="viewUser(user)"
                      class="btn btn-outline-info"
                      title="Voir"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      @click="editUser(user.id)"
                      class="btn btn-outline-primary"
                      title="Modifier"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      v-if="!user.is_active"
                      @click="activateUser(user)"
                      class="btn btn-outline-success"
                      title="Activer"
                    >
                      <i class="fas fa-user-check"></i>
                    </button>
                    <button 
                      v-else
                      @click="deactivateUser(user)"
                      class="btn btn-outline-warning"
                      title="Désactiver"
                    >
                      <i class="fas fa-user-times"></i>
                    </button>
                    <button 
                      @click="deleteUser(user)"
                      class="btn btn-outline-danger"
                      title="Supprimer"
                      :disabled="user.role === 'admin' && user.id === currentUser?.id"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Barre de pagination -->
        <div class="d-flex justify-content-between align-items-center m-4">
          <div>
            <span class="text-muted">
              <span v-if="paginationInfo.total > 0">
                Affichage de {{ paginationInfo.start }} à {{ paginationInfo.end }} sur {{ paginationInfo.total }} résultats
              </span>
              <span v-else>
                Aucun résultat
              </span>
            </span>
          </div>
          
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="previousPage" :disabled="currentPage === 1">
                  <i class="bi bi-chevron-left"></i> Précédent
                </button>
              </li>
              
              <!-- Pages -->
              <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                <button class="page-link" @click="goToPage(page)">{{ page }}</button>
              </li>
              
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="nextPage" :disabled="currentPage === totalPages">
                  Suivant <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal de visualisation utilisateur -->
    <div v-if="showViewModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Détails de l'utilisateur</h5>
            <button type="button" class="btn-close" @click="showViewModal = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedUser" class="row g-3">
              <div class="col-md-6">
                <div class="d-flex align-items-center mb-3">
                  <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 60px; height: 60px;">
                    <i class="fas fa-user fs-4"></i>
                  </div>
                  <div>
                    <h6 class="mb-1">{{ selectedUser.first_name }} {{ selectedUser.last_name }}</h6>
                    <p class="text-muted mb-0">{{ selectedUser.email }}</p>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="text-end">
                  <span class="badge rounded-pill" :class="getStatusBadgeClass(selectedUser.status)">
                    {{ getStatusLabel(selectedUser.status) }}
                  </span>
                </div>
              </div>
              <div class="col-md-6">
                <strong class="text-muted d-block">Nom d'utilisateur:</strong>
                <span>{{ selectedUser.username }}</span>
              </div>
              <div class="col-md-6">
                <strong class="text-muted d-block">Rôle:</strong>
                <span class="badge rounded-pill" :class="getRoleBadgeClass(selectedUser.role)">
                  {{ getRoleLabel(selectedUser.role) }}
                </span>
              </div>
              <div class="col-md-6">
                <strong class="text-muted d-block">Téléphone:</strong>
                <span>{{ selectedUser.phone_number || 'Non renseigné' }}</span>
              </div>
              <div class="col-md-6">
                <strong class="text-muted d-block">Dernière connexion:</strong>
                <span>{{ formatDate(selectedUser.last_login) }}</span>
              </div>
              <div class="col-12">
                <strong class="text-muted d-block">Date de création:</strong>
                <span>{{ formatDate(selectedUser.created_at) }}</span>
              </div>
              
              <!-- Informations du BoardDirector -->
              <div class="col-12" v-if="selectedUser.last_board_director">
                <hr>
                <h6 class="text-primary mb-3">
                  <i class="fas fa-users me-2"></i>
                  Informations Conseil d'Administration
                </h6>
                <div class="row g-3">
                  <div class="col-md-6">
                    <strong class="text-muted d-block">Entité:</strong>
                    <span>{{ selectedUser.last_board_director.entity_name || 'Non définie' }}</span>
                  </div>
                  <div class="col-md-6">
                    <strong class="text-muted d-block">Fonction/Position:</strong>
                    <span>{{ selectedUser.last_board_director.position || selectedUser.last_board_director.fonction || 'Non définie' }}</span>
                  </div>
                  <div class="col-md-6">
                    <strong class="text-muted d-block">Date de nomination:</strong>
                    <span>{{ formatDate(selectedUser.last_board_director.date_nomination) || 'Non renseignée' }}</span>
                  </div>
                  <div class="col-md-6">
                    <strong class="text-muted d-block">Fin de mandat:</strong>
                    <span>{{ formatDate(selectedUser.last_board_director.date_fin_mandat) || 'Non renseignée' }}</span>
                  </div>
                  <div class="col-md-6">
                    <strong class="text-muted d-block">Statut CA:</strong>
                    <span class="badge rounded-pill" :class="getBoardDirectorStatusBadgeClass(selectedUser.last_board_director.status)">
                      {{ getBoardDirectorStatusLabel(selectedUser.last_board_director.status) }}
                    </span>
                  </div>
                  <div class="col-md-6" v-if="selectedUser.last_board_director.structure_representee">
                    <strong class="text-muted d-block">Structure représentée:</strong>
                    <span>{{ selectedUser.last_board_director.structure_representee }}</span>
                  </div>
                </div>
              </div>
              <div class="col-12" v-else>
                <hr>
                <div class="text-center text-muted">
                  <i class="fas fa-info-circle me-2"></i>
                  Cet utilisateur n'a pas de fonction dans un conseil d'administration
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showViewModal = false">
              Fermer
            </button>
            <button type="button" class="btn btn-primary" @click="editUser(selectedUser.id)">
              <i class="fas fa-edit me-1"></i>
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation d'activation -->
    <div v-if="showActivateModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Activer l'utilisateur</h5>
            <button type="button" class="btn-close" @click="showActivateModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir activer le compte de <strong>{{ userToActivate?.first_name }} {{ userToActivate?.last_name }}</strong> ?</p>
            <div class="form-check">
              <input
                id="sendActivationEmail"
                v-model="sendActivationEmail"
                class="form-check-input"
                type="checkbox"
              />
              <label for="sendActivationEmail" class="form-check-label">
                Envoyer un email de confirmation à l'utilisateur
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showActivateModal = false">
              Annuler
            </button>
            <button type="button" class="btn btn-success" @click="confirmActivateUser" :disabled="loadingActivate">
              <span v-if="loadingActivate" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="fas fa-check me-2"></i>
              {{ loadingActivate ? 'Activation...' : 'Activer' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de désactivation -->
    <div v-if="showDeactivateModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Désactiver l'utilisateur</h5>
            <button type="button" class="btn-close" @click="showDeactivateModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir désactiver le compte de <strong>{{ userToDeactivate?.first_name }} {{ userToDeactivate?.last_name }}</strong> ?</p>
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              L'utilisateur ne pourra plus se connecter au système après désactivation.
            </div>
            <div class="form-check">
              <input
                id="sendDeactivationEmail"
                v-model="sendDeactivationEmail"
                class="form-check-input"
                type="checkbox"
              />
              <label for="sendDeactivationEmail" class="form-check-label">
                Notifier l'utilisateur par email
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeactivateModal = false">
              Annuler
            </button>
            <button type="button" class="btn btn-warning" @click="confirmDeactivateUser" :disabled="loadingDeactivate">
              <span v-if="loadingDeactivate" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="fas fa-pause me-2"></i>
              {{ loadingDeactivate ? 'Désactivation...' : 'Désactiver' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Supprimer l'utilisateur</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer définitivement le compte de <strong>{{ userToDelete?.first_name }} {{ userToDelete?.last_name }}</strong> ?</p>
            <div class="alert alert-danger">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <strong>Attention :</strong> Cette action est irréversible. Toutes les données associées à cet utilisateur seront supprimées.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
              Annuler
            </button>
            <button type="button" class="btn btn-danger" @click="confirmDeleteUser" :disabled="loadingDelete">
              <span v-if="loadingDelete" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="fas fa-trash me-2"></i>
              {{ loadingDelete ? 'Suppression...' : 'Supprimer définitivement' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'

export default {
  name: 'UsersListView',
  setup() {
    const router = useRouter()
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()
    
    const loading = ref(false)
    const searchQuery = ref('')
    const roleFilter = ref('')
    const statusFilter = ref('')
    
    // Variables de pagination
    const currentPage = ref(1)
    const perPage = ref(20)
    const totalPages = ref(1)
    const totalItems = ref(0)

    // Fonctions de pagination
    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        loadUsers(page)
      }
    }
    
    const previousPage = () => {
      if (currentPage.value > 1) {
        const newPage = currentPage.value - 1
        currentPage.value = newPage
        loadUsers(newPage)
      }
    }
    
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        const newPage = currentPage.value + 1
        currentPage.value = newPage
        loadUsers(newPage)
      }
    }
    
    const onSearchChange = () => {
      // Réinitialiser à la première page lors d'une recherche
      currentPage.value = 1
      loadUsers()
    }
    
    // Modals
    const showViewModal = ref(false)
    const showActivateModal = ref(false)
    const showDeactivateModal = ref(false)
    const showDeleteModal = ref(false)
    
    // Selected users for modals
    const selectedUser = ref(null)
    const userToActivate = ref(null)
    const userToDeactivate = ref(null)
    const userToDelete = ref(null)
    
    // Loading states
    const loadingActivate = ref(false)
    const loadingDeactivate = ref(false)
    const loadingDelete = ref(false)
    
    // Email notifications
    const sendActivationEmail = ref(true)
    const sendDeactivationEmail = ref(true)
    
    const users = ref([])
    const currentUser = computed(() => store.getters['auth/user'])
    
    const filteredUsers = computed(() => {
      console.log('Computing filteredUsers, users.value:', users.value)
      
      if (!users.value || !Array.isArray(users.value)) {
        console.log('users.value is not an array:', users.value)
        return []
      }
      
      let filtered = users.value
      console.log('Starting with users:', filtered.length)
      
      // Filtre par recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(user => 
          `${user.first_name} ${user.last_name}`.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        )
        console.log('After search filter:', filtered.length)
      }
      
      // Filtre par rôle
      if (roleFilter.value) {
        filtered = filtered.filter(user => user.role === roleFilter.value)
        console.log('After role filter:', filtered.length)
      }
      
      // Filtre par statut
      if (statusFilter.value) {
        filtered = filtered.filter(user => user.status === statusFilter.value)
        console.log('After status filter:', filtered.length)
      }
      
      console.log('Final filtered users:', filtered)
      return filtered
    })
    
    const loadUsers = async (page = null) => {
      loading.value = true
      try {
        console.log('Loading users...')
        
        const targetPage = page || currentPage.value
        
        // Utiliser fetchUsers avec pagination
        await store.dispatch('users/fetchUsers', {
          page: targetPage,
          limit: perPage.value,
          search: searchQuery.value
        })
        
        // Récupérer les utilisateurs depuis le store
        const storeUsers = store.getters['users/users']
        const pagination = store.getters['users/pagination']
        
        console.log('Users from store:', storeUsers)
        console.log('Pagination from store:', pagination)
        
        // Mettre à jour la pagination
        if (!page) {
          // Ne mettre à jour currentPage que si on n'a pas passé de page explicite
          currentPage.value = Number(pagination.current_page) || 1
        }
        totalPages.value = Number(pagination.total_pages) || 1
        totalItems.value = Number(pagination.total_items) || 0
        
        if (Array.isArray(storeUsers) && storeUsers.length > 0) {
          // Mapper les données API vers le format attendu par l'interface
          users.value = storeUsers.map(user => ({
            id: user.id,
            // Utiliser username pour les noms car l'API n'a pas first_name/last_name séparés
            first_name: user.username || '',
            last_name: '', // Pas de nom de famille séparé dans l'API
            email: user.email || '',
            username: user.username || '',
            phone_number: user.phone_number || '',
            // Mapper is_active vers status pour l'affichage
            status: user.is_active ? 'active' : 'inactive',
            is_active: user.is_active || false,
            // Utiliser directement le role de l'API ou mapper role_id
            role: user.role?.name || getRoleFromId(user.role_id),
            role_id: user.role_id,
            last_login: user.last_login || null,
            created_at: user.created_at || null,
            // Ajouter les informations du dernier BoardDirector
            last_board_director: user.last_board_director || null
          }))
          
          console.log('Mapped users:', users.value)
        } else {
          users.value = []
          console.log('No users found in store')
        }
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error)
        notifyError('Erreur lors du chargement des utilisateurs')
        users.value = []
      } finally {
        loading.value = false
      }
    }
    
    const refreshUsers = () => {
      loadUsers()
    }
    
    const viewUser = (user) => {
      selectedUser.value = user
      showViewModal.value = true
    }
    
    const editUser = (id) => {
      router.push(`/admin/users/${id}/edit`)
    }
    
    const activateUser = (user) => {
      userToActivate.value = user
      showActivateModal.value = true
    }
    
    const deactivateUser = (user) => {
      userToDeactivate.value = user
      showDeactivateModal.value = true
    }
    
    const deleteUser = (user) => {
      userToDelete.value = user
      showDeleteModal.value = true
    }
    
    const confirmActivateUser = async () => {
      if (!userToActivate.value) return
      
      loadingActivate.value = true
      
      try {
        // Utiliser le store users pour activer l'utilisateur
        await store.dispatch('users/activateUser', userToActivate.value.id)
        
        notifySuccess(`Utilisateur ${userToActivate.value.first_name} ${userToActivate.value.last_name} activé avec succès`)
        
        // Envoyer email si demandé (simulation côté frontend)
        if (sendActivationEmail.value) {
          console.log('Email d\'activation envoyé à:', userToActivate.value.email)
        }
        
        showActivateModal.value = false
        userToActivate.value = null
        
        // Recharger la page courante
        await loadUsers()
      } catch (error) {
        console.error('Erreur lors de l\'activation:', error)
        notifyError(error?.detail || 'Erreur lors de l\'activation de l\'utilisateur')
      } finally {
        loadingActivate.value = false
      }
    }
    
    const confirmDeactivateUser = async () => {
      if (!userToDeactivate.value) return
      
      loadingDeactivate.value = true
      
      try {
        // Utiliser le store users pour désactiver l'utilisateur
        await store.dispatch('users/deactivateUser', userToDeactivate.value.id)
        
        notifySuccess(`Utilisateur ${userToDeactivate.value.first_name} ${userToDeactivate.value.last_name} désactivé avec succès`)
        
        // Envoyer email si demandé (simulation côté frontend)
        if (sendDeactivationEmail.value) {
          console.log('Email de désactivation envoyé à:', userToDeactivate.value.email)
        }
        
        showDeactivateModal.value = false
        userToDeactivate.value = null
        
        // Recharger la page courante
        await loadUsers()
      } catch (error) {
        console.error('Erreur lors de la désactivation:', error)
        notifyError(error?.detail || 'Erreur lors de la désactivation de l\'utilisateur')
      } finally {
        loadingDeactivate.value = false
      }
    }
    
    const confirmDeleteUser = async () => {
      if (!userToDelete.value) return
      
      loadingDelete.value = true
      
      try {
        // Utiliser le store users pour supprimer l'utilisateur
        await store.dispatch('users/deleteUser', userToDelete.value.id)
        
        notifySuccess(`Utilisateur ${userToDelete.value.first_name} ${userToDelete.value.last_name} supprimé avec succès`)
        
        showDeleteModal.value = false
        userToDelete.value = null
        
        // Recharger la page courante (ou revenir à la page précédente si c'était le dernier élément)
        const shouldGoToPreviousPage = users.value && users.value.length === 1 && currentPage.value > 1
        if (shouldGoToPreviousPage) {
          currentPage.value = currentPage.value - 1
        }
        await loadUsers()
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        notifyError(error?.detail || 'Erreur lors de la suppression de l\'utilisateur')
      } finally {
        loadingDelete.value = false
      }
    }
    
    const getUsersByRole = (role) => {
      if (!users.value || !Array.isArray(users.value)) {
        return []
      }
      return users.value.filter(user => user.role === role)
    }
    
    const getActiveUsers = () => {
      if (!users.value || !Array.isArray(users.value)) {
        return []
      }
      return users.value.filter(user => user.status === 'active')
    }
    
    const getRoleFromId = (roleId) => {
      const roleMap = {
        1: 'admin',
        2: 'manager', 
        3: 'user',
        4: 'viewer'
      }
      return roleMap[roleId] || 'user'
    }
    
    const getRoleLabel = (role) => {
      const labels = {
        admin: 'Administrateur',
        manager: 'Gestionnaire',
        user: 'Utilisateur',
        viewer: 'Observateur'
      }
      return labels[role] || role
    }

    const getBoardDirectorStatusLabel = (status) => {
      const labels = {
        active: 'Actif',
        inactive: 'Inactif',
        replaced: 'Remplacé'
      }
      return labels[status] || status
    }

    const getBoardDirectorStatusBadgeClass = (status) => {
      const classes = {
        active: 'bg-success',
        inactive: 'bg-warning',
        replaced: 'bg-secondary'
      }
      return classes[status] || 'bg-secondary'
    }

    // Computed property pour les pages visibles dans la pagination
    const visiblePages = computed(() => {
      const pages = []
      const startPage = Math.max(1, currentPage.value - 2)
      const endPage = Math.min(totalPages.value, currentPage.value + 2)
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      return pages
    })

    // Computed property pour l'affichage de la pagination
    const paginationInfo = computed(() => {
      const current = Number(currentPage.value) || 1
      const per_page = Number(perPage.value) || 20
      const total = Number(totalItems.value) || 0
      
      if (total === 0) {
        return {
          start: 0,
          end: 0,
          total: 0
        }
      }
      
      const start = Math.max(1, ((current - 1) * per_page) + 1)
      const end = Math.min(current * per_page, total)
      
      return {
        start,
        end,
        total
      }
    })
    
    const getStatusLabel = (status) => {
      const labels = {
        active: 'Actif',
        inactive: 'Inactif',
        pending: 'En attente'
      }
      return labels[status] || status
    }
    
    const getRoleBadgeClass = (role) => {
      const classes = {
        admin: 'bg-primary',
        manager: 'bg-info',
        user: 'bg-success',
        viewer: 'bg-secondary'
      }
      return classes[role] || 'bg-secondary'
    }
    
    const getStatusBadgeClass = (status) => {
      const classes = {
        active: 'bg-success',
        inactive: 'bg-danger',
        pending: 'bg-warning text-dark'
      }
      return classes[status] || 'bg-secondary'
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Jamais'
      try {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now - date
        
        if (diff < 1000 * 60) {
          return 'À l\'instant'
        } else if (diff < 1000 * 60 * 60) {
          const minutes = Math.floor(diff / (1000 * 60))
          return `Il y a ${minutes} min`
        } else if (diff < 1000 * 60 * 60 * 24) {
          const hours = Math.floor(diff / (1000 * 60 * 60))
          return `Il y a ${hours}h`
        } else {
          return date.toLocaleDateString('fr-FR')
        }
      } catch {
        return dateString
      }
    }
    
    onMounted(() => {
      loadUsers()
    })
    
    return {
      loading,
      searchQuery,
      roleFilter,
      statusFilter,
      filteredUsers,
      currentUser,
      users, // Ajouter users pour le debug
      store, // Ajouter store pour le debug
      // Modals
      showViewModal,
      showActivateModal,
      showDeactivateModal,
      showDeleteModal,
      selectedUser,
      userToActivate,
      userToDeactivate,
      userToDelete,
      // Loading states
      loadingActivate,
      loadingDeactivate,
      loadingDelete,
      // Email notifications
      sendActivationEmail,
      sendDeactivationEmail,
      // Functions
      refreshUsers,
      viewUser,
      editUser,
      activateUser,
      deactivateUser,
      deleteUser,
      confirmActivateUser,
      confirmDeactivateUser,
      confirmDeleteUser,
      getUsersByRole,
      getActiveUsers,
      getRoleLabel,
      getStatusLabel,
      getRoleBadgeClass,
      getStatusBadgeClass,
      getBoardDirectorStatusLabel,
      getBoardDirectorStatusBadgeClass,
      formatDate,
      visiblePages,
      paginationInfo,
      // Fonctions de pagination
      goToPage,
      previousPage,
      nextPage,
      onSearchChange
    }
  }
}
</script>

<style scoped>
.modal.show {
  display: block !important;
}

.card {
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.badge {
  font-size: 0.75rem;
}

.table-responsive {
  border-radius: 0.5rem;
}

.modal-content {
  border-radius: 1rem;
  border: none;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
  padding: 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
}

.alert {
  border-radius: 0.5rem;
}
</style>