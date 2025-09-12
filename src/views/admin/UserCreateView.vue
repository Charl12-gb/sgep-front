<template>
  <div class="user-create">
    <div class="page-header">
      <h1>Créer un nouvel utilisateur</h1>
      <button @click="$router.back()" class="btn btn-outline">
        <i class="fas fa-arrow-left"></i>
        Retour
      </button>
    </div>
    
    <div class="form-container">
      <form @submit.prevent="createUser" class="user-form">
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
        
        <!-- Authentification -->
        <div class="form-section">
          <h3>Authentification</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="password">Mot de passe *</label>
              <div class="password-input">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  :class="{ error: errors.password }"
                  placeholder="Mot de passe sécurisé"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="password-toggle"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div class="password-strength">
                <div class="strength-bar">
                  <div 
                    class="strength-fill" 
                    :class="passwordStrength.class"
                    :style="{ width: passwordStrength.width }"
                  ></div>
                </div>
                <span class="strength-text">{{ passwordStrength.text }}</span>
              </div>
              <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirmer le mot de passe *</label>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                required
                :class="{ error: errors.confirmPassword }"
                placeholder="Répétez le mot de passe"
              />
              <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
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
              >
                <option value="">Sélectionnez un rôle</option>
                <option value="admin">Administrateur</option>
                <option value="manager">Gestionnaire</option>
                <option value="user">Utilisateur</option>
                <option value="viewer">Observateur</option>
              </select>
              <div class="role-description">{{ getRoleDescription(form.role) }}</div>
              <span v-if="errors.role" class="error-message">{{ errors.role }}</span>
            </div>
            
            <div class="form-group">
              <label for="status">Statut initial</label>
              <select
                id="status"
                v-model="form.status"
                :class="{ error: errors.status }"
              >
                <option value="active">Actif</option>
                <option value="pending">En attente d'activation</option>
                <option value="inactive">Inactif</option>
              </select>
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
          
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="form.sendWelcomeEmail"
                type="checkbox"
              />
              <span class="checkmark"></span>
              Envoyer un email de bienvenue avec les informations de connexion
            </label>
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
          <button type="submit" class="btn btn-success" :disabled="loading || !isFormValid">
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-user-plus"></i>
            {{ loading ? 'Création...' : 'Créer l\'utilisateur' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useNotyf } from '@/mixins/useNotyf'

export default {
  name: 'UserCreateView',
  setup() {
    const router = useRouter()
    const { notifySuccess, notifyError } = useNotyf()
    
    const loading = ref(false)
    const showPassword = ref(false)
    
    const form = reactive({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: '',
      status: 'active',
      permissions: [],
      department: '',
      notes: '',
      sendWelcomeEmail: true
    })
    
    const errors = ref({})
    
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
    
    const passwordStrength = computed(() => {
      const password = form.password
      let score = 0
      
      if (password.length >= 8) score++
      if (/[a-z]/.test(password)) score++
      if (/[A-Z]/.test(password)) score++
      if (/\d/.test(password)) score++
      if (/[^a-zA-Z\d]/.test(password)) score++
      
      const levels = [
        { class: 'very-weak', width: '20%', text: 'Très faible' },
        { class: 'weak', width: '40%', text: 'Faible' },
        { class: 'medium', width: '60%', text: 'Moyen' },
        { class: 'strong', width: '80%', text: 'Fort' },
        { class: 'very-strong', width: '100%', text: 'Très fort' }
      ]
      
      return levels[score] || { class: '', width: '0%', text: '' }
    })
    
    const isFormValid = computed(() => {
      return form.firstName && 
             form.lastName && 
             form.email && 
             form.password && 
             form.confirmPassword && 
             form.role &&
             form.password === form.confirmPassword &&
             Object.keys(errors.value).length === 0
    })
    
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
      
      // Validation mot de passe
      if (!form.password) {
        errors.value.password = 'Le mot de passe est requis'
      } else if (form.password.length < 8) {
        errors.value.password = 'Le mot de passe doit contenir au moins 8 caractères'
      }
      
      // Validation confirmation mot de passe
      if (!form.confirmPassword) {
        errors.value.confirmPassword = 'La confirmation du mot de passe est requise'
      } else if (form.password !== form.confirmPassword) {
        errors.value.confirmPassword = 'Les mots de passe ne correspondent pas'
      }
      
      // Validation rôle
      if (!form.role) {
        errors.value.role = 'Le rôle est requis'
      }
      
      return Object.keys(errors.value).length === 0
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
    
    const createUser = async () => {
      if (!validateForm()) {
        notifyError('Veuillez corriger les erreurs dans le formulaire')
        return
      }
      
      loading.value = true
      
      try {
        // Simuler la création de l'utilisateur
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const userData = {
          ...form,
          id: Date.now(),
          created_at: new Date().toISOString()
        }
        
        console.log('Nouvel utilisateur créé:', userData)
        
        notifySuccess('Utilisateur créé avec succès')
        router.push('/admin/users')
        
      } catch (error) {
        console.error('Erreur lors de la création:', error)
        notifyError('Erreur lors de la création de l\'utilisateur')
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
    
    return {
      form,
      errors,
      loading,
      showPassword,
      availablePermissions,
      passwordStrength,
      isFormValid,
      createUser,
      saveAsDraft,
      getRoleDescription
    }
  }
}
</script>

<style scoped>
.user-create {
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

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  padding: 0.25rem;
}

.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s;
}

.strength-fill.very-weak {
  background: #dc3545;
}

.strength-fill.weak {
  background: #fd7e14;
}

.strength-fill.medium {
  background: #ffc107;
}

.strength-fill.strong {
  background: #20c997;
}

.strength-fill.very-strong {
  background: #28a745;
}

.strength-text {
  font-size: 0.8rem;
  color: #7f8c8d;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.95rem;
}

.checkbox-label input {
  margin: 0;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-label input:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-label input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
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

@media (max-width: 768px) {
  .user-create {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .permissions-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
