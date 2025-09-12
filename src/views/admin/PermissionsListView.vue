<template>
  <div class="permissions-list">
    <div class="page-header">
      <h1>Gestion des permissions</h1>
      <button @click="createPermission" class="btn btn-success">
        <i class="fas fa-plus"></i>
        Créer une permission
      </button>
    </div>
    
    <!-- Filtres -->
    <div class="filters">
      <div class="search-group">
        <i class="fas fa-search"></i>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Rechercher une permission..."
          @input="debouncedSearch"
        />
      </div>
      
      <div class="filter-group">
        <label for="categoryFilter">Catégorie :</label>
        <select id="categoryFilter" v-model="filters.category" @change="loadPermissions">
          <option value="">Toutes les catégories</option>
          <option value="users">Utilisateurs</option>
          <option value="roles">Rôles</option>
          <option value="entities">Entités</option>
          <option value="sessions">Sessions</option>
          <option value="reports">Rapports</option>
          <option value="system">Système</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="statusFilter">Statut :</label>
        <select id="statusFilter" v-model="filters.status" @change="loadPermissions">
          <option value="">Tous les statuts</option>
          <option value="active">Actives</option>
          <option value="inactive">Inactives</option>
        </select>
      </div>
    </div>
    
    <!-- Statistiques -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-key"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.total }}</h3>
          <p>Permissions totales</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon active">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.active }}</h3>
          <p>Permissions actives</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon categories">
          <i class="fas fa-layer-group"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.categories }}</h3>
          <p>Catégories</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon roles">
          <i class="fas fa-users-cog"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.assignedRoles }}</h3>
          <p>Rôles assignés</p>
        </div>
      </div>
    </div>
    
    <!-- Liste des permissions -->
    <div class="permissions-container">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Chargement des permissions...
      </div>
      
      <div v-else-if="!permissions.length" class="empty-state">
        <i class="fas fa-key"></i>
        <h3>Aucune permission trouvée</h3>
        <p>Commencez par créer votre première permission.</p>
        <button @click="createPermission" class="btn btn-success">
          <i class="fas fa-plus"></i>
          Créer une permission
        </button>
      </div>
      
      <div v-else class="permissions-table">
        <table>
          <thead>
            <tr>
              <th>Permission</th>
              <th>Catégorie</th>
              <th>Description</th>
              <th>Rôles assignés</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="permission in permissions" :key="permission.id">
              <!-- Nom et code -->
              <td>
                <div class="permission-info">
                  <h4>{{ permission.name }}</h4>
                  <span class="permission-code">{{ permission.code }}</span>
                </div>
              </td>
              
              <!-- Catégorie -->
              <td>
                <span :class="['category-badge', permission.category]">
                  <i :class="getCategoryIcon(permission.category)"></i>
                  {{ getCategoryLabel(permission.category) }}
                </span>
              </td>
              
              <!-- Description -->
              <td>
                <p class="permission-description">
                  {{ permission.description || 'Aucune description' }}
                </p>
              </td>
              
              <!-- Rôles assignés -->
              <td>
                <div class="assigned-roles">
                  <span
                    v-for="role in permission.roles.slice(0, 2)"
                    :key="role.id"
                    class="role-tag"
                  >
                    {{ role.name }}
                  </span>
                  <span
                    v-if="permission.roles.length > 2"
                    class="role-tag more"
                    :title="permission.roles.slice(2).map(r => r.name).join(', ')"
                  >
                    +{{ permission.roles.length - 2 }}
                  </span>
                  <span v-if="!permission.roles.length" class="no-roles">
                    Aucun rôle
                  </span>
                </div>
              </td>
              
              <!-- Statut -->
              <td>
                <span :class="['status-badge', permission.status]">
                  {{ permission.status === 'active' ? 'Active' : 'Inactive' }}
                </span>
              </td>
              
              <!-- Actions -->
              <td>
                <div class="actions">
                  <button
                    @click="editPermission(permission)"
                    class="btn btn-sm btn-outline"
                    title="Modifier"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="togglePermissionStatus(permission)"
                    class="btn btn-sm btn-outline"
                    :title="permission.status === 'active' ? 'Désactiver' : 'Activer'"
                  >
                    <i :class="permission.status === 'active' ? 'fas fa-pause' : 'fas fa-play'"></i>
                  </button>
                  <button
                    @click="deletePermission(permission)"
                    class="btn btn-sm btn-danger"
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
        ({{ pagination.total }} permission(s))
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotyf } from '@/mixins/useNotyf'
import { debounce } from '@/utils/debounce'

export default {
  name: 'PermissionsListView',
  setup() {
    const router = useRouter()
    const { notifySuccess, notifyError, notifyConfirm } = useNotyf()
    
    const loading = ref(false)
    const permissions = ref([])
    
    const filters = reactive({
      search: '',
      category: '',
      status: ''
    })
    
    const pagination = reactive({
      current: 1,
      pages: 1,
      total: 0,
      perPage: 15
    })
    
    const stats = computed(() => {
      const total = permissions.value.length
      const active = permissions.value.filter(p => p.status === 'active').length
      const categories = [...new Set(permissions.value.map(p => p.category))].length
      const assignedRoles = permissions.value.reduce((sum, p) => sum + p.roles.length, 0)
      
      return { total, active, categories, assignedRoles }
    })
    
    const loadPermissions = async () => {
      loading.value = true
      
      try {
        // Simuler le chargement des permissions
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Données simulées
        permissions.value = [
          {
            id: 1,
            name: 'Gérer les utilisateurs',
            code: 'MANAGE_USERS',
            description: 'Créer, modifier et supprimer des utilisateurs',
            category: 'users',
            status: 'active',
            roles: [
              { id: 1, name: 'Administrateur' },
              { id: 2, name: 'Gestionnaire RH' }
            ]
          },
          {
            id: 2,
            name: 'Voir les rapports',
            code: 'VIEW_REPORTS',
            description: 'Accès en lecture aux rapports et statistiques',
            category: 'reports',
            status: 'active',
            roles: [
              { id: 1, name: 'Administrateur' },
              { id: 2, name: 'Gestionnaire' },
              { id: 3, name: 'Analyste' }
            ]
          },
          {
            id: 3,
            name: 'Créer des entités',
            code: 'CREATE_ENTITIES',
            description: 'Créer de nouvelles entités dans le système',
            category: 'entities',
            status: 'active',
            roles: [
              { id: 1, name: 'Administrateur' }
            ]
          },
          {
            id: 4,
            name: 'Gérer les sessions',
            code: 'MANAGE_SESSIONS',
            description: 'Créer, modifier et planifier les sessions de conseil',
            category: 'sessions',
            status: 'active',
            roles: [
              { id: 1, name: 'Administrateur' },
              { id: 2, name: 'Secrétaire' }
            ]
          },
          {
            id: 5,
            name: 'Configurer le système',
            code: 'SYSTEM_CONFIG',
            description: 'Accès aux paramètres de configuration du système',
            category: 'system',
            status: 'active',
            roles: [
              { id: 1, name: 'Administrateur' }
            ]
          },
          {
            id: 6,
            name: 'Archiver les données',
            code: 'ARCHIVE_DATA',
            description: 'Archiver les anciennes données du système',
            category: 'system',
            status: 'inactive',
            roles: []
          }
        ]
        
        // Mise à jour de la pagination
        pagination.total = permissions.value.length
        pagination.pages = Math.ceil(pagination.total / pagination.perPage)
        
      } catch (error) {
        console.error('Erreur lors du chargement des permissions:', error)
        notifyError('Erreur lors du chargement des permissions')
      } finally {
        loading.value = false
      }
    }
    
    const debouncedSearch = debounce(() => {
      loadPermissions()
    }, 500)
    
    const changePage = (page) => {
      if (page >= 1 && page <= pagination.pages) {
        pagination.current = page
        loadPermissions()
      }
    }
    
    const createPermission = () => {
      router.push('/admin/permissions/create')
    }
    
    const editPermission = (permission) => {
      router.push(`/admin/permissions/${permission.id}/edit`)
    }
    
    const togglePermissionStatus = async (permission) => {
      try {
        const newStatus = permission.status === 'active' ? 'inactive' : 'active'
        const action = newStatus === 'active' ? 'activer' : 'désactiver'
        
        const confirmed = await notifyConfirm(
          `Êtes-vous sûr de vouloir ${action} la permission "${permission.name}" ?`
        )
        
        if (confirmed) {
          // Simuler la mise à jour
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          permission.status = newStatus
          notifySuccess(`Permission ${newStatus === 'active' ? 'activée' : 'désactivée'} avec succès`)
        }
      } catch (error) {
        console.error('Erreur lors du changement de statut:', error)
        notifyError('Erreur lors du changement de statut')
      }
    }
    
    const deletePermission = async (permission) => {
      try {
        if (permission.roles.length > 0) {
          notifyError('Impossible de supprimer une permission assignée à des rôles')
          return
        }
        
        const confirmed = await notifyConfirm(
          `Êtes-vous sûr de vouloir supprimer la permission "${permission.name}" ?`,
          'Cette action est irréversible.'
        )
        
        if (confirmed) {
          // Simuler la suppression
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const index = permissions.value.findIndex(p => p.id === permission.id)
          if (index > -1) {
            permissions.value.splice(index, 1)
          }
          
          notifySuccess('Permission supprimée avec succès')
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        notifyError('Erreur lors de la suppression de la permission')
      }
    }
    
    const getCategoryIcon = (category) => {
      const icons = {
        users: 'fas fa-users',
        roles: 'fas fa-user-tag',
        entities: 'fas fa-building',
        sessions: 'fas fa-calendar-alt',
        reports: 'fas fa-chart-bar',
        system: 'fas fa-cog'
      }
      return icons[category] || 'fas fa-question'
    }
    
    const getCategoryLabel = (category) => {
      const labels = {
        users: 'Utilisateurs',
        roles: 'Rôles',
        entities: 'Entités',
        sessions: 'Sessions',
        reports: 'Rapports',
        system: 'Système'
      }
      return labels[category] || category
    }
    
    onMounted(() => {
      loadPermissions()
    })
    
    return {
      loading,
      permissions,
      filters,
      pagination,
      stats,
      loadPermissions,
      debouncedSearch,
      changePage,
      createPermission,
      editPermission,
      togglePermissionStatus,
      deletePermission,
      getCategoryIcon,
      getCategoryLabel
    }
  }
}
</script>

<style scoped>
.permissions-list {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #667eea;
  color: white;
  font-size: 1.5rem;
}

.stat-icon.active {
  background: #27ae60;
}

.stat-icon.categories {
  background: #f39c12;
}

.stat-icon.roles {
  background: #9b59b6;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.stat-content p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.9rem;
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

.permissions-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8f9fa;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 1px solid #dee2e6;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: top;
}

tr:hover {
  background: #f8f9fa;
}

.permission-info h4 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.permission-code {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.category-badge.users {
  background: #e3f2fd;
  color: #1976d2;
}

.category-badge.roles {
  background: #f3e5f5;
  color: #7b1fa2;
}

.category-badge.entities {
  background: #e8f5e8;
  color: #388e3c;
}

.category-badge.sessions {
  background: #fff3e0;
  color: #f57c00;
}

.category-badge.reports {
  background: #fce4ec;
  color: #c2185b;
}

.category-badge.system {
  background: #f5f5f5;
  color: #616161;
}

.permission-description {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.4;
  max-width: 300px;
}

.assigned-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.role-tag {
  padding: 0.2rem 0.5rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #495057;
}

.role-tag.more {
  background: #667eea;
  color: white;
  border-color: #667eea;
  cursor: help;
}

.no-roles {
  color: #adb5bd;
  font-style: italic;
  font-size: 0.8rem;
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

.actions {
  display: flex;
  gap: 0.5rem;
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

@media (max-width: 1200px) {
  .permissions-table {
    overflow-x: auto;
  }
  
  table {
    min-width: 800px;
  }
}

@media (max-width: 768px) {
  .permissions-list {
    padding: 1rem;
  }
  
  .filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
