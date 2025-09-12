<template>
  <div class="roles-list">
    <div class="page-header">
      <h1>Gestion des rôles</h1>
      <button @click="createRole" class="btn btn-success">
        <i class="fas fa-plus"></i>
        Créer un rôle
      </button>
    </div>
    
    <!-- Filtres -->
    <div class="filters">
      <div class="search-group">
        <i class="fas fa-search"></i>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Rechercher un rôle..."
          @input="debouncedSearch"
        />
      </div>
      
      <div class="filter-group">
        <label for="statusFilter">Statut :</label>
        <select id="statusFilter" v-model="filters.status" @change="loadRoles">
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
      </div>
    </div>
    
    <!-- Liste des rôles -->
    <div class="roles-container">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Chargement des rôles...
      </div>
      
      <div v-else-if="!roles.length" class="empty-state">
        <i class="fas fa-user-tag"></i>
        <h3>Aucun rôle trouvé</h3>
        <p>Commencez par créer votre premier rôle.</p>
        <button @click="createRole" class="btn btn-success">
          <i class="fas fa-plus"></i>
          Créer un rôle
        </button>
      </div>
      
      <div v-else class="roles-grid">
        <div v-for="role in roles" :key="role.id" class="role-card">
          <!-- Header de la carte -->
          <div class="role-header">
            <div class="role-info">
              <h3>{{ role.name }}</h3>
              <span class="role-code">{{ role.code }}</span>
            </div>
            
            <div class="role-status">
              <span :class="['status-badge', role.status]">
                {{ role.status === 'active' ? 'Actif' : 'Inactif' }}
              </span>
            </div>
          </div>
          
          <!-- Description -->
          <div class="role-description">
            <p>{{ role.description || 'Aucune description' }}</p>
          </div>
          
          <!-- Permissions -->
          <div class="role-permissions">
            <h4>Permissions ({{ role.permissions.length }})</h4>
            <div class="permissions-list">
              <span
                v-for="permission in role.permissions.slice(0, 3)"
                :key="permission.id"
                class="permission-tag"
              >
                {{ permission.name }}
              </span>
              <span
                v-if="role.permissions.length > 3"
                class="permission-tag more"
              >
                +{{ role.permissions.length - 3 }} autres
              </span>
            </div>
          </div>
          
          <!-- Statistiques -->
          <div class="role-stats">
            <div class="stat">
              <i class="fas fa-users"></i>
              <span>{{ role.users_count }} utilisateur(s)</span>
            </div>
            <div class="stat">
              <i class="fas fa-calendar"></i>
              <span>Créé le {{ formatDate(role.created_at) }}</span>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="role-actions">
            <button @click="editRole(role)" class="btn btn-sm btn-outline">
              <i class="fas fa-edit"></i>
              Modifier
            </button>
            <button @click="toggleRoleStatus(role)" class="btn btn-sm btn-outline">
              <i :class="role.status === 'active' ? 'fas fa-pause' : 'fas fa-play'"></i>
              {{ role.status === 'active' ? 'Désactiver' : 'Activer' }}
            </button>
            <button @click="deleteRole(role)" class="btn btn-sm btn-danger">
              <i class="fas fa-trash"></i>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pagination -->
    <div v-if="pagination.total > 0" class="pagination">
      <button
        @click="changePage(pagination.current - 1)"
        :disabled="pagination.current <= 1"
        class="btn btn-outline"
      >
        <i class="fas fa-chevron-left"></i>
        Précédent
      </button>
      
      <span class="pagination-info">
        Page {{ pagination.current }} sur {{ pagination.pages }}
        ({{ pagination.total }} rôle(s))
      </span>
      
      <button
        @click="changePage(pagination.current + 1)"
        :disabled="pagination.current >= pagination.pages"
        class="btn btn-outline"
      >
        Suivant
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotyf } from '@/mixins/useNotyf'
import { debounce } from '@/utils/debounce'

export default {
  name: 'RolesListView',
  setup() {
    const router = useRouter()
    const { notifySuccess, notifyError, notifyConfirm } = useNotyf()
    
    const loading = ref(false)
    const roles = ref([])
    
    const filters = reactive({
      search: '',
      status: ''
    })
    
    const pagination = reactive({
      current: 1,
      pages: 1,
      total: 0,
      perPage: 12
    })
    
    const loadRoles = async () => {
      loading.value = true
      
      try {
        // Simuler le chargement des rôles
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Données simulées
        roles.value = [
          {
            id: 1,
            name: 'Administrateur',
            code: 'ADMIN',
            description: 'Accès complet au système avec tous les privilèges administratifs',
            status: 'active',
            users_count: 5,
            created_at: '2024-01-15T10:00:00Z',
            permissions: [
              { id: 1, name: 'Gérer les utilisateurs' },
              { id: 2, name: 'Gérer les rôles' },
              { id: 3, name: 'Voir les rapports' },
              { id: 4, name: 'Configurer le système' }
            ]
          },
          {
            id: 2,
            name: 'Gestionnaire',
            code: 'MANAGER',
            description: 'Gestion des entités et supervision des activités',
            status: 'active',
            users_count: 12,
            created_at: '2024-01-20T14:30:00Z',
            permissions: [
              { id: 5, name: 'Gérer les entités' },
              { id: 6, name: 'Voir les sessions' },
              { id: 7, name: 'Créer des rapports' }
            ]
          },
          {
            id: 3,
            name: 'Utilisateur Standard',
            code: 'USER',
            description: 'Accès limité aux fonctionnalités de base',
            status: 'active',
            users_count: 25,
            created_at: '2024-02-01T09:15:00Z',
            permissions: [
              { id: 8, name: 'Voir son profil' },
              { id: 9, name: 'Participer aux sessions' }
            ]
          },
          {
            id: 4,
            name: 'Observateur',
            code: 'OBSERVER',
            description: 'Accès en lecture seule pour consultation',
            status: 'inactive',
            users_count: 3,
            created_at: '2024-02-10T16:45:00Z',
            permissions: [
              { id: 10, name: 'Voir les données publiques' }
            ]
          }
        ]
        
        // Mise à jour de la pagination
        pagination.total = roles.value.length
        pagination.pages = Math.ceil(pagination.total / pagination.perPage)
        
      } catch (error) {
        console.error('Erreur lors du chargement des rôles:', error)
        notifyError('Erreur lors du chargement des rôles')
      } finally {
        loading.value = false
      }
    }
    
    const debouncedSearch = debounce(() => {
      loadRoles()
    }, 500)
    
    const changePage = (page) => {
      if (page >= 1 && page <= pagination.pages) {
        pagination.current = page
        loadRoles()
      }
    }
    
    const createRole = () => {
      router.push('/admin/roles/create')
    }
    
    const editRole = (role) => {
      router.push(`/admin/roles/${role.id}/edit`)
    }
    
    const toggleRoleStatus = async (role) => {
      try {
        const newStatus = role.status === 'active' ? 'inactive' : 'active'
        const action = newStatus === 'active' ? 'activer' : 'désactiver'
        
        const confirmed = await notifyConfirm(
          `Êtes-vous sûr de vouloir ${action} le rôle "${role.name}" ?`
        )
        
        if (confirmed) {
          // Simuler la mise à jour
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          role.status = newStatus
          notifySuccess(`Rôle ${newStatus === 'active' ? 'activé' : 'désactivé'} avec succès`)
        }
      } catch (error) {
        console.error('Erreur lors du changement de statut:', error)
        notifyError('Erreur lors du changement de statut')
      }
    }
    
    const deleteRole = async (role) => {
      try {
        if (role.users_count > 0) {
          notifyError('Impossible de supprimer un rôle assigné à des utilisateurs')
          return
        }
        
        const confirmed = await notifyConfirm(
          `Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`,
          'Cette action est irréversible.'
        )
        
        if (confirmed) {
          // Simuler la suppression
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const index = roles.value.findIndex(r => r.id === role.id)
          if (index > -1) {
            roles.value.splice(index, 1)
          }
          
          notifySuccess('Rôle supprimé avec succès')
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        notifyError('Erreur lors de la suppression du rôle')
      }
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR')
    }
    
    onMounted(() => {
      loadRoles()
    })
    
    return {
      loading,
      roles,
      filters,
      pagination,
      loadRoles,
      debouncedSearch,
      changePage,
      createRole,
      editRole,
      toggleRoleStatus,
      deleteRole,
      formatDate
    }
  }
}
</script>

<style scoped>
.roles-list {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #2c3e50;
}

.filters {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-group {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-group i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.search-group input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.filter-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: #7f8c8d;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-state i {
  font-size: 4rem;
  color: #bdc3c7;
  margin-bottom: 1rem;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.role-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.role-info h3 {
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
}

.role-code {
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: 500;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.role-description {
  margin-bottom: 1.5rem;
}

.role-description p {
  color: #7f8c8d;
  line-height: 1.5;
  margin: 0;
}

.role-permissions {
  margin-bottom: 1.5rem;
}

.role-permissions h4 {
  color: #2c3e50;
  font-size: 0.9rem;
  margin: 0 0 0.75rem 0;
}

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.permission-tag {
  padding: 0.25rem 0.5rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #495057;
}

.permission-tag.more {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.role-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #7f8c8d;
  font-size: 0.85rem;
}

.stat i {
  color: #667eea;
}

.role-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.pagination-info {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid #667eea;
  color: #667eea;
}

.btn-outline:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c0392b;
}

@media (max-width: 768px) {
  .roles-list {
    padding: 1rem;
  }
  
  .filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .roles-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .role-actions {
    justify-content: center;
  }
}
</style>
