<template>
  <div class="admin-dashboard">
    <div class="page-header">
      <h1>Administration</h1>
      <div class="header-actions">
        <button @click="refreshData" class="btn btn-outline" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          Actualiser
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      Chargement des données...
    </div>
    
    <div v-else class="dashboard-content">
      <!-- Statistiques globales -->
      <div class="stats-section">
        <h2>Statistiques générales</h2>
        <div class="stats-grid">
          <div class="stat-card users">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total_users || 0 }}</div>
              <div class="stat-label">Utilisateurs</div>
              <div class="stat-change positive">
                <i class="fas fa-arrow-up"></i>
                +{{ stats.new_users_this_month || 0 }} ce mois
              </div>
            </div>
          </div>
          
          <div class="stat-card entities">
            <div class="stat-icon">
              <i class="fas fa-building"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total_entities || 0 }}</div>
              <div class="stat-label">Entités</div>
              <div class="stat-change">
                {{ stats.active_entities || 0 }} actives
              </div>
            </div>
          </div>
          
          <div class="stat-card sessions">
            <div class="stat-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total_sessions || 0 }}</div>
              <div class="stat-label">Sessions</div>
              <div class="stat-change">
                {{ stats.upcoming_sessions || 0 }} à venir
              </div>
            </div>
          </div>
          
          <div class="stat-card reports">
            <div class="stat-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total_reports || 0 }}</div>
              <div class="stat-label">Rapports</div>
              <div class="stat-change">
                {{ stats.reports_this_month || 0 }} ce mois
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Actions d'administration -->
      <div class="actions-section">
        <h2>Actions d'administration</h2>
        <div class="actions-grid">
          <div class="action-card">
            <div class="action-icon">
              <i class="fas fa-users-cog"></i>
            </div>
            <div class="action-content">
              <h3>Gestion des utilisateurs</h3>
              <p>Créer, modifier et gérer les comptes utilisateurs</p>
              <button @click="$router.push('/admin/users')" class="btn btn-success">
                Gérer les utilisateurs
              </button>
            </div>
          </div>
          
          <div class="action-card">
            <div class="action-icon">
              <i class="fas fa-database"></i>
            </div>
            <div class="action-content">
              <h3>Sauvegarde des données</h3>
              <p>Effectuer et gérer les sauvegardes de la base de données</p>
              <button @click="openBackupModal" class="btn btn-warning">
                Créer une sauvegarde
              </button>
            </div>
          </div>
          
          <div class="action-card">
            <div class="action-icon">
              <i class="fas fa-cogs"></i>
            </div>
            <div class="action-content">
              <h3>Configuration système</h3>
              <p>Modifier les paramètres et configurations générales</p>
              <button @click="$router.push('/admin/settings')" class="btn btn-secondary">
                Paramètres
              </button>
            </div>
          </div>
          
          <div class="action-card">
            <div class="action-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="action-content">
              <h3>Rapports et analyses</h3>
              <p>Consulter les rapports détaillés et analyses</p>
              <button @click="$router.push('/reports')" class="btn btn-info">
                Voir les rapports
              </button>
            </div>
          </div>
          
          <div class="action-card">
            <div class="action-icon">
              <i class="fas fa-bell"></i>
            </div>
            <div class="action-content">
              <h3>Notifications système</h3>
              <p>Gérer les notifications et alertes</p>
              <button @click="$router.push('/admin/notifications')" class="btn btn-purple">
                Gérer les notifications
              </button>
            </div>
          </div>
          
          <div class="action-card">
            <div class="action-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <div class="action-content">
              <h3>Sécurité et audit</h3>
              <p>Consulter les journaux d'audit et de sécurité</p>
              <button @click="$router.push('/admin/audit')" class="btn btn-dark">
                Audit et sécurité
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tableau de bord des sessions -->
      <div class="sessions-section">
        <SessionsDashboard />
      </div>
      
      <!-- Activité récente -->
      <div class="activity-section">
        <h2>Activité récente</h2>
        <div class="activity-list">
          <div 
            v-for="activity in recentActivities" 
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-icon" :class="activity.type">
              <i :class="getActivityIcon(activity.type)"></i>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-description">{{ activity.description }}</div>
              <div class="activity-time">{{ formatDate(activity.created_at) }}</div>
            </div>
          </div>
        </div>
        
        <div v-if="recentActivities.length === 0" class="no-activity">
          <i class="fas fa-info-circle"></i>
          Aucune activité récente
        </div>
      </div>
    </div>
    
    <!-- Modal de sauvegarde -->
    <div v-if="showBackupModal" class="modal-overlay" @click="closeBackupModal">
      <div class="modal-dialog" @click.stop>
        <div class="modal-header">
          <h3>Créer une sauvegarde</h3>
          <button @click="closeBackupModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>
            Voulez-vous créer une sauvegarde complète de la base de données ?
          </p>
          <div class="backup-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="backupOptions.includeFiles" />
              <span class="checkmark"></span>
              Inclure les fichiers uploadés
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="backupOptions.compress" />
              <span class="checkmark"></span>
              Compresser la sauvegarde
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeBackupModal" class="btn btn-secondary">
            Annuler
          </button>
          <button @click="createBackup" :disabled="creatingBackup" class="btn btn-warning">
            <i v-if="creatingBackup" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-download"></i>
            {{ creatingBackup ? 'Création...' : 'Créer la sauvegarde' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'
import SessionsDashboard from '@/components/sessions/SessionsDashboard.vue'

export default {
  name: 'AdminDashboardView',
  components: {
    SessionsDashboard
  },
  setup() {
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()
    
    const loading = ref(false)
    const showBackupModal = ref(false)
    const creatingBackup = ref(false)
    
    const stats = reactive({
      total_users: 0,
      new_users_this_month: 0,
      total_entities: 0,
      active_entities: 0,
      total_sessions: 0,
      upcoming_sessions: 0,
      total_reports: 0,
      reports_this_month: 0
    })
    
    const backupOptions = reactive({
      includeFiles: true,
      compress: true
    })
    
    const recentActivities = ref([])
    
    const loadStats = async () => {
      loading.value = true
      try {
        // Simuler le chargement des statistiques
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        Object.assign(stats, {
          total_users: 25,
          new_users_this_month: 3,
          total_entities: 18,
          active_entities: 16,
          total_sessions: 42,
          upcoming_sessions: 8,
          total_reports: 156,
          reports_this_month: 12
        })
        
        recentActivities.value = [
          {
            id: 1,
            type: 'user',
            title: 'Nouvel utilisateur créé',
            description: 'Jean Dupont a été ajouté comme membre du conseil',
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
          },
          {
            id: 2,
            type: 'session',
            title: 'Session programmée',
            description: 'Assemblée générale ordinaire pour SARL TechCorp',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
          },
          {
            id: 3,
            type: 'report',
            title: 'Rapport généré',
            description: 'Rapport d\'audit pour l\'entité SASU Innovation',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
          },
          {
            id: 4,
            type: 'backup',
            title: 'Sauvegarde automatique',
            description: 'Sauvegarde quotidienne effectuée avec succès',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
          }
        ]
      } catch (error) {
        notifyError('Erreur lors du chargement des statistiques')
      } finally {
        loading.value = false
      }
    }
    
    const refreshData = () => {
      loadStats()
    }
    
    const openBackupModal = () => {
      showBackupModal.value = true
    }
    
    const closeBackupModal = () => {
      showBackupModal.value = false
    }
    
    const createBackup = async () => {
      creatingBackup.value = true
      try {
        // Simuler la création de sauvegarde
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        notifySuccess('Sauvegarde créée avec succès')
        closeBackupModal()
      } catch (error) {
        notifyError('Erreur lors de la création de la sauvegarde')
      } finally {
        creatingBackup.value = false
      }
    }
    
    const getActivityIcon = (type) => {
      const icons = {
        user: 'fas fa-user-plus',
        session: 'fas fa-calendar-plus',
        report: 'fas fa-file-alt',
        backup: 'fas fa-database',
        entity: 'fas fa-building',
        default: 'fas fa-info-circle'
      }
      return icons[type] || icons.default
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now - date
        
        if (diff < 1000 * 60) {
          return 'À l\'instant'
        } else if (diff < 1000 * 60 * 60) {
          const minutes = Math.floor(diff / (1000 * 60))
          return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
        } else if (diff < 1000 * 60 * 60 * 24) {
          const hours = Math.floor(diff / (1000 * 60 * 60))
          return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
        } else {
          return date.toLocaleDateString('fr-FR')
        }
      } catch {
        return dateString
      }
    }
    
    onMounted(() => {
      loadStats()
    })
    
    return {
      loading,
      stats,
      recentActivities,
      showBackupModal,
      creatingBackup,
      backupOptions,
      refreshData,
      openBackupModal,
      closeBackupModal,
      createBackup,
      getActivityIcon,
      formatDate
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
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

.loading {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-section h2,
.actions-section h2,
.activity-section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  border-left: 4px solid #667eea;
  padding-left: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.stat-card.users .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.entities .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.sessions .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.reports .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.stat-change {
  font-size: 0.9rem;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-change.positive {
  color: #27ae60;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1.5rem;
  transition: transform 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
}

.action-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-content h3 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.action-content p {
  margin: 0 0 1rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.5;
}

.activity-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.activity-item:hover {
  background-color: #f8f9fa;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: white;
  flex-shrink: 0;
}

.activity-icon.user {
  background: #667eea;
}

.activity-icon.session {
  background: #4facfe;
}

.activity-icon.report {
  background: #43e97b;
}

.activity-icon.backup {
  background: #f093fb;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.activity-description {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.activity-time {
  color: #bdc3c7;
  font-size: 0.8rem;
}

.no-activity {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.btn {
  padding: 0.75rem 1.5rem;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-warning {
  background-color: #f39c12;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background-color: #e67e22;
}

.btn-info {
  background-color: #3498db;
  color: white;
}

.btn-info:hover {
  background-color: #2980b9;
}

.btn-purple {
  background-color: #9b59b6;
  color: white;
}

.btn-purple:hover {
  background-color: #8e44ad;
}

.btn-dark {
  background-color: #2c3e50;
  color: white;
}

.btn-dark:hover {
  background-color: #34495e;
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

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-body {
  padding: 1.5rem;
}

.backup-options {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  position: absolute;
  opacity: 0;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  position: relative;
}

.checkbox-label input[type="checkbox"]:checked ~ .checkmark {
  background-color: #667eea;
  border-color: #667eea;
}

.checkbox-label input[type="checkbox"]:checked ~ .checkmark::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.modal-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .stats-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-card,
  .action-card {
    flex-direction: column;
    text-align: center;
  }
  
  .action-content {
    text-align: left;
  }
}
</style>
