<template>
  <div class="users-list">
    <div class="page-header">
      <h1>Gestion des utilisateurs</h1>
      <div class="header-actions">
        <button @click="$router.push('/admin/users/create')" class="btn btn-success">
          <i class="fas fa-plus"></i>
          Nouvel utilisateur
        </button>
        <button @click="refreshUsers" class="btn btn-outline" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          Actualiser
        </button>
      </div>
    </div>
    
    <div class="filters-section">
      <div class="search-filters">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par nom, email..."
            class="search-input"
          />
        </div>
        
        <div class="filter-group">
          <select v-model="roleFilter" class="filter-select">
            <option value="">Tous les rôles</option>
            <option value="admin">Administrateur</option>
            <option value="manager">Gestionnaire</option>
            <option value="user">Utilisateur</option>
            <option value="viewer">Observateur</option>
          </select>
          
          <select v-model="statusFilter" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="pending">En attente</option>
          </select>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      Chargement des utilisateurs...
    </div>
    
    <div v-else-if="filteredUsers.length === 0" class="empty-state">
      <i class="fas fa-users"></i>
      <h3>Aucun utilisateur trouvé</h3>
      <p v-if="searchQuery || roleFilter || statusFilter">
        Aucun utilisateur ne correspond à vos critères de recherche.
      </p>
      <p v-else>
        Vous n'avez pas encore d'utilisateurs.
      </p>
      <button @click="$router.push('/admin/users/create')" class="btn btn-success">
        <i class="fas fa-plus"></i>
        Créer le premier utilisateur
      </button>
    </div>
    
    <div v-else class="users-content">
      <!-- Statistiques -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon admin">
            <i class="fas fa-user-shield"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getUsersByRole('admin').length }}</div>
            <div class="stat-label">Administrateurs</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon manager">
            <i class="fas fa-user-cog"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getUsersByRole('manager').length }}</div>
            <div class="stat-label">Gestionnaires</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon user">
            <i class="fas fa-user"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getUsersByRole('user').length }}</div>
            <div class="stat-label">Utilisateurs</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon active">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getActiveUsers().length }}</div>
            <div class="stat-label">Actifs</div>
          </div>
        </div>
      </div>
      
      <!-- Table des utilisateurs -->
      <div class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Dernière connexion</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
              <td class="user-info">
                <div class="user-avatar">
                  <i class="fas fa-user"></i>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ user.first_name }} {{ user.last_name }}</div>
                  <div class="user-id">ID: {{ user.id }}</div>
                </div>
              </td>
              <td class="user-email">{{ user.email }}</td>
              <td>
                <span class="role-badge" :class="user.role">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="user.status">
                  {{ getStatusLabel(user.status) }}
                </span>
              </td>
              <td class="last-login">
                {{ formatDate(user.last_login) }}
              </td>
              <td class="user-actions">
                <button 
                  @click="editUser(user.id)"
                  class="btn btn-sm btn-outline"
                  title="Modifier"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  @click="toggleUserStatus(user)"
                  class="btn btn-sm"
                  :class="user.status === 'active' ? 'btn-warning' : 'btn-success'"
                  :title="user.status === 'active' ? 'Désactiver' : 'Activer'"
                >
                  <i :class="user.status === 'active' ? 'fas fa-pause' : 'fas fa-play'"></i>
                </button>
                <button 
                  @click="deleteUser(user)"
                  class="btn btn-sm btn-danger"
                  title="Supprimer"
                  :disabled="user.role === 'admin' && user.id === currentUser?.id"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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
    
    const users = ref([])
    const currentUser = computed(() => store.getters['auth/user'])
    
    const filteredUsers = computed(() => {
      let filtered = users.value
      
      // Filtre par recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(user => 
          `${user.first_name} ${user.last_name}`.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        )
      }
      
      // Filtre par rôle
      if (roleFilter.value) {
        filtered = filtered.filter(user => user.role === roleFilter.value)
      }
      
      // Filtre par statut
      if (statusFilter.value) {
        filtered = filtered.filter(user => user.status === statusFilter.value)
      }
      
      return filtered
    })
    
    const loadUsers = async () => {
      loading.value = true
      try {
        // Simuler le chargement des utilisateurs
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        users.value = [
          {
            id: 1,
            first_name: 'Jean',
            last_name: 'Dupont',
            email: 'jean.dupont@example.com',
            role: 'admin',
            status: 'active',
            last_login: new Date(Date.now() - 1000 * 60 * 30).toISOString()
          },
          {
            id: 2,
            first_name: 'Marie',
            last_name: 'Martin',
            email: 'marie.martin@example.com',
            role: 'manager',
            status: 'active',
            last_login: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
          },
          {
            id: 3,
            first_name: 'Pierre',
            last_name: 'Durand',
            email: 'pierre.durand@example.com',
            role: 'user',
            status: 'inactive',
            last_login: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
          }
        ]
      } catch (error) {
        notifyError('Erreur lors du chargement des utilisateurs')
      } finally {
        loading.value = false
      }
    }
    
    const refreshUsers = () => {
      loadUsers()
    }
    
    const editUser = (id) => {
      router.push(`/admin/users/${id}/edit`)
    }
    
    const toggleUserStatus = async (user) => {
      try {
        const newStatus = user.status === 'active' ? 'inactive' : 'active'
        user.status = newStatus
        notifySuccess(`Utilisateur ${newStatus === 'active' ? 'activé' : 'désactivé'} avec succès`)
      } catch (error) {
        notifyError('Erreur lors de la modification du statut')
      }
    }
    
    const deleteUser = async (user) => {
      if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.first_name} ${user.last_name} ?`)) {
        try {
          users.value = users.value.filter(u => u.id !== user.id)
          notifySuccess('Utilisateur supprimé avec succès')
        } catch (error) {
          notifyError('Erreur lors de la suppression')
        }
      }
    }
    
    const getUsersByRole = (role) => {
      return users.value.filter(user => user.role === role)
    }
    
    const getActiveUsers = () => {
      return users.value.filter(user => user.status === 'active')
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
    
    const getStatusLabel = (status) => {
      const labels = {
        active: 'Actif',
        inactive: 'Inactif',
        pending: 'En attente'
      }
      return labels[status] || status
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
      refreshUsers,
      editUser,
      toggleUserStatus,
      deleteUser,
      getUsersByRole,
      getActiveUsers,
      getRoleLabel,
      getStatusLabel,
      formatDate
    }
  }
}
</script>

<style scoped>
.users-list {
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  position: relative;
  min-width: 300px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.filter-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  min-width: 150px;
}

.loading {
  text-align: center;
  padding: 3rem;
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

.users-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
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
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
}

.stat-icon.admin {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.manager {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.user {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.users-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
}

.user-row {
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.user-row:hover {
  background-color: #f8f9fa;
}

.users-table td {
  padding: 1rem;
  vertical-align: middle;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
}

.user-id {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.user-email {
  color: #7f8c8d;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.admin {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.role-badge.manager {
  background: rgba(79, 172, 254, 0.1);
  color: #4facfe;
}

.role-badge.user {
  background: rgba(67, 233, 123, 0.1);
  color: #43e97b;
}

.role-badge.viewer {
  background: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
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

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.last-login {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #667eea;
  color: #667eea;
}

.btn-outline:hover:not(:disabled) {
  background-color: #667eea;
  color: white;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #218838;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background-color: #e0a800;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

@media (max-width: 768px) {
  .search-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .filter-group {
    justify-content: stretch;
  }
  
  .filter-select {
    min-width: auto;
    flex: 1;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .users-table-container {
    overflow-x: auto;
  }
  
  .users-table {
    min-width: 800px;
  }
}
</style>
