<template>
  <div class="user-edit">
    <div class="page-header">
      <h1>Modifier l'utilisateur</h1>
      <div class="header-actions">
        <button @click="$router.back()" class="btn btn-outline">
          <i class="fas fa-arrow-left"></i>
          Retour
        </button>
        <button @click="resetPassword" class="btn btn-warning" :disabled="loading">
          <i class="fas fa-key"></i>
          Réinitialiser le mot de passe
        </button>
      </div>
    </div>
    
    <div v-if="userLoading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      Chargement des informations utilisateur...
    </div>
    
    <div v-else-if="!user" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Utilisateur non trouvé</h3>
      <p>L'utilisateur que vous tentez de modifier n'existe pas ou a été supprimé.</p>
      <button @click="$router.push('/admin/users')" class="btn btn-success">
        Retour à la liste
      </button>
    </div>
    
    <div v-else class="form-container">
      <form @submit.prevent="updateUser" class="user-form">
        <!-- Informations générales -->
        <div class="form-section">
          <h3>Informations générales</h3>
          <div class="user-summary">
            <div class="user-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-info">
              <div class="user-name">{{ user.first_name }} {{ user.last_name }}</div>
              <div class="user-meta">
                <span class="user-id">ID: {{ user.id }}</span>
                <span class="user-created">Créé le {{ formatDate(user.created_at) }}</span>
              </div>
            </div>
            <div class="user-status">
              <span class="status-badge" :class="user.status">
                {{ getStatusLabel(user.status) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Informations personnelles -->
        <div class="form-section">
          <h3>Informations personnelles</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Prénom *</label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                required
                :class="{ error: errors.firstName }"
                placeholder="Entrez le prénom"
              />
              <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
            </div>
            
            <div class="form-group">
              <label for="lastName">Nom *</label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                required
                :class="{ error: errors.lastName }"
                placeholder="Entrez le nom"
              />
              <span v-if="errors.lastName" class="error-message">{{ errors.lastName }}</span>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="email">Email *</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                :class="{ error: errors.email }"
                placeholder="user@example.com"
              />
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>
            
            <div class="form-group">
              <label for="phone">Téléphone</label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                :class="{ error: errors.phone }"
                placeholder="+33 1 23 45 67 89"
              />
              <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
            </div>
          </div>
        </div>
        
        <!-- Rôle et permissions -->
        <div class="form-section">
          <h3>Rôle et permissions</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="role">Rôle *</label>
              <select
                id="role"
                v-model="form.role"
                required
                :class="{ error: errors.role }"
                :disabled="user.id === currentUser?.id && user.role === 'admin'"
              >
                <option value="">Sélectionnez un rôle</option>
                <option value="admin">Administrateur</option>
                <option value="manager">Gestionnaire</option>
                <option value="user">Utilisateur</option>
                <option value="viewer">Observateur</option>
              </select>
              <div class="role-description">{{ getRoleDescription(form.role) }}</div>
              <div v-if="user.id === currentUser?.id && user.role === 'admin'" class="warning-message">
                <i class="fas fa-exclamation-triangle"></i>
                Vous ne pouvez pas modifier votre propre rôle d'administrateur
              </div>
              <span v-if="errors.role" class="error-message">{{ errors.role }}</span>
            </div>
            
            <div class="form-group">
              <label for="status">Statut</label>
              <select
                id="status"
                v-model="form.status"
                :class="{ error: errors.status }"
                :disabled="user.id === currentUser?.id"
              >
                <option value="active">Actif</option>
                <option value="pending">En attente d'activation</option>
                <option value="inactive">Inactif</option>
              </select>
              <div v-if="user.id === currentUser?.id" class="warning-message">
                <i class="fas fa-exclamation-triangle"></i>
                Vous ne pouvez pas modifier votre propre statut
              </div>
              <span v-if="errors.status" class="error-message">{{ errors.status }}</span>
            </div>
          </div>
          
          <!-- Permissions spéciales -->
          <div v-if="form.role !== 'admin'" class="permissions-section">
            <label class="section-label">Permissions spéciales</label>
            <div class="permissions-grid">
              <label v-for="permission in availablePermissions" :key="permission.key" class="permission-item">
                <input
                  v-model="form.permissions"
                  type="checkbox"
                  :value="permission.key"
                />
                <span class="checkmark"></span>
                <div class="permission-info">
                  <div class="permission-name">{{ permission.name }}</div>
                  <div class="permission-description">{{ permission.description }}</div>
                </div>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Informations supplémentaires -->
        <div class="form-section">
          <h3>Informations supplémentaires</h3>
          
          <div class="form-group">
            <label for="department">Département</label>
            <input
              id="department"
              v-model="form.department"
              type="text"
              :class="{ error: errors.department }"
              placeholder="IT, RH, Finance..."
            />
            <span v-if="errors.department" class="error-message">{{ errors.department }}</span>
          </div>
          
          <div class="form-group">
            <label for="notes">Notes administratives</label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              :class="{ error: errors.notes }"
              placeholder="Notes internes sur cet utilisateur..."
            ></textarea>
            <span v-if="errors.notes" class="error-message">{{ errors.notes }}</span>
          </div>
        </div>
        
        <!-- Statistiques d'utilisation -->
        <div class="form-section">
          <h3>Statistiques d'utilisation</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">Dernière connexion</div>
              <div class="stat-value">{{ formatDate(user.last_login) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Nombre de connexions</div>
              <div class="stat-value">{{ user.login_count || 0 }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Sessions créées</div>
              <div class="stat-value">{{ user.sessions_created || 0 }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Temps d'activité total</div>
              <div class="stat-value">{{ formatDuration(user.total_activity_time) }}</div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="form-actions">
          <button type="button" @click="$router.back()" class="btn btn-outline">
            Annuler
          </button>
          <button type="button" @click="saveAsDraft" class="btn btn-secondary" :disabled="loading">
            <i class="fas fa-save"></i>
            Enregistrer en brouillon
          </button>
          <button type="submit" class="btn btn-success" :disabled="loading || !isFormValid || !hasChanges">
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ loading ? 'Sauvegarde...' : 'Sauvegarder les modifications' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'

export default {
  name: 'UserEditView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()
    
    const loading = ref(false)
    const userLoading = ref(true)
    const user = ref(null)
    const originalForm = ref({})
    
    const form = reactive({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      status: '',
      permissions: [],
      department: '',
      notes: ''
    })
    
    const errors = ref({})
    const currentUser = computed(() => store.getters['auth/user'])
    
    const availablePermissions = [
      {
        key: 'read_reports',
        name: 'Lecture des rapports',
        description: 'Peut consulter les rapports générés'
      },
      {
        key: 'export_data',
        name: 'Export de données',
        description: 'Peut exporter les données en CSV/PDF'
      },
      {
        key: 'manage_sessions',
        name: 'Gestion des sessions',
        description: 'Peut créer et modifier les sessions'
      },
      {
        key: 'view_statistics',
        name: 'Statistiques avancées',
        description: 'Accès aux statistiques détaillées'
      },
      {
        key: 'manage_entities',
        name: 'Gestion des entités',
        description: 'Peut créer et modifier les entités'
      }
    ]
    
    const isFormValid = computed(() => {
      return form.firstName && 
             form.lastName && 
             form.email && 
             form.role &&
             Object.keys(errors.value).length === 0
    })
    
    const hasChanges = computed(() => {
      return JSON.stringify(form) !== JSON.stringify(originalForm.value)
    })
    
    const loadUser = async () => {
      userLoading.value = true
      
      try {
        const userId = route.params.id
        
        // Simuler le chargement de l'utilisateur
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Données simulées
        user.value = {
          id: parseInt(userId),
          first_name: 'Marie',
          last_name: 'Martin',
          email: 'marie.martin@example.com',
          phone: '+33 1 23 45 67 89',
          role: 'manager',
          status: 'active',
          permissions: ['read_reports', 'export_data'],
          department: 'IT',
          notes: 'Gestionnaire de l\'équipe technique',
          created_at: '2024-01-15T08:30:00Z',
          last_login: '2024-01-20T14:22:00Z',
          login_count: 42,
          sessions_created: 8,
          total_activity_time: 87600 // en secondes
        }
        
        // Remplir le formulaire avec les données utilisateur
        Object.assign(form, {
          firstName: user.value.first_name,
          lastName: user.value.last_name,
          email: user.value.email,
          phone: user.value.phone || '',
          role: user.value.role,
          status: user.value.status,
          permissions: user.value.permissions || [],
          department: user.value.department || '',
          notes: user.value.notes || ''
        })
        
        // Sauvegarder l'état original pour détecter les changements
        originalForm.value = { ...form }
        
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error)
        notifyError('Erreur lors du chargement des données utilisateur')
      } finally {
        userLoading.value = false
      }
    }
    
    const validateForm = () => {
      errors.value = {}
      
      // Validation prénom
      if (!form.firstName.trim()) {
        errors.value.firstName = 'Le prénom est requis'
      } else if (form.firstName.length < 2) {
        errors.value.firstName = 'Le prénom doit contenir au moins 2 caractères'
      }
      
      // Validation nom
      if (!form.lastName.trim()) {
        errors.value.lastName = 'Le nom est requis'
      } else if (form.lastName.length < 2) {
        errors.value.lastName = 'Le nom doit contenir au moins 2 caractères'
      }
      
      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!form.email.trim()) {
        errors.value.email = 'L\'email est requis'
      } else if (!emailRegex.test(form.email)) {
        errors.value.email = 'Format d\'email invalide'
      }
      
      // Validation téléphone
      if (form.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(form.phone)) {
        errors.value.phone = 'Format de téléphone invalide'
      }
      
      // Validation rôle
      if (!form.role) {
        errors.value.role = 'Le rôle est requis'
      }
      
      return Object.keys(errors.value).length === 0
    }
    
    const updateUser = async () => {
      if (!validateForm()) {
        notifyError('Veuillez corriger les erreurs dans le formulaire')
        return
      }
      
      loading.value = true
      
      try {
        // Simuler la mise à jour de l'utilisateur
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const updatedData = {
          ...user.value,
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
          role: form.role,
          status: form.status,
          permissions: form.permissions,
          department: form.department,
          notes: form.notes,
          updated_at: new Date().toISOString()
        }
        
        console.log('Utilisateur mis à jour:', updatedData)
        
        notifySuccess('Utilisateur mis à jour avec succès')
        
        // Mettre à jour l'état original
        originalForm.value = { ...form }
        
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error)
        notifyError('Erreur lors de la mise à jour de l\'utilisateur')
      } finally {
        loading.value = false
      }
    }
    
    const saveAsDraft = async () => {
      loading.value = true
      
      try {
        // Simuler la sauvegarde en brouillon
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        notifySuccess('Brouillon sauvegardé')
        
      } catch (error) {
        notifyError('Erreur lors de la sauvegarde')
      } finally {
        loading.value = false
      }
    }
    
    const resetPassword = async () => {
      if (confirm('Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?')) {
        try {
          loading.value = true
          
          // Simuler la réinitialisation du mot de passe
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          notifySuccess('Mot de passe réinitialisé. Un email avec le nouveau mot de passe a été envoyé à l\'utilisateur.')
          
        } catch (error) {
          notifyError('Erreur lors de la réinitialisation du mot de passe')
        } finally {
          loading.value = false
        }
      }
    }
    
    const getRoleDescription = (role) => {
      const descriptions = {
        admin: 'Accès complet à toutes les fonctionnalités du système',
        manager: 'Gestion des sessions, entités et utilisateurs de son équipe',
        user: 'Accès aux fonctionnalités de base et à ses propres données',
        viewer: 'Consultation uniquement, sans droits de modification'
      }
      return descriptions[role] || ''
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
        return date.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return dateString
      }
    }
    
    const formatDuration = (seconds) => {
      if (!seconds) return '0h'
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`
    }
    
    onMounted(() => {
      loadUser()
    })
    
    return {
      form,
      errors,
      loading,
      userLoading,
      user,
      currentUser,
      availablePermissions,
      isFormValid,
      hasChanges,
      updateUser,
      saveAsDraft,
      resetPassword,
      getRoleDescription,
      getStatusLabel,
      formatDate,
      formatDuration
    }
  }
}
</script>

<style scoped>
.user-edit {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
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

.loading {
  text-align: center;
  padding: 4rem;
  color: #7f8c8d;
}

.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-state i {
  font-size: 4rem;
  color: #e74c3c;
  margin-bottom: 1rem;
}

.form-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.user-form {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
}

.form-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.user-summary {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.user-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.user-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.user-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.warning-message {
  background: #fff3cd;
  color: #856404;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.role-description {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-top: 0.25rem;
  font-style: italic;
}

.section-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  display: block;
}

.permissions-section {
  margin-top: 1.5rem;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.permission-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.permission-item:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.02);
}

.permission-item input {
  margin: 0;
}

.permission-info {
  flex: 1;
}

.permission-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.permission-description {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.permission-item input:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.permission-item input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
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

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background: #e0a800;
}

@media (max-width: 768px) {
  .user-edit {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .permissions-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .user-summary {
    flex-direction: column;
    text-align: center;
  }
}
</style>
