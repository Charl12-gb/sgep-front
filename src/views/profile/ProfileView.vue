<template>
  <div class="profile">
    <div class="page-header">
      <h1>Mon Profil</h1>
      <p class="page-description">Gestion de vos informations personnelles et préférences</p>
    </div>
    
    <div class="profile-container">
      <div class="profile-tabs">
        <button 
          @click="activeTab = 'personal'"
          :class="{ active: activeTab === 'personal' }"
          class="tab-button"
        >
          <i class="fas fa-user"></i>
          Informations personnelles
        </button>
        <button 
          @click="activeTab = 'security'"
          :class="{ active: activeTab === 'security' }"
          class="tab-button"
        >
          <i class="fas fa-lock"></i>
          Sécurité
        </button>
        <button 
          @click="activeTab = 'preferences'"
          :class="{ active: activeTab === 'preferences' }"
          class="tab-button"
        >
          <i class="fas fa-cog"></i>
          Préférences
        </button>
      </div>
      
      <!-- Informations personnelles -->
      <div v-if="activeTab === 'personal'" class="tab-content">
        <div class="profile-card">
          <div class="card-header">
            <h3>Informations personnelles</h3>
            <button 
              v-if="!editingPersonal"
              @click="editingPersonal = true"
              class="btn btn-secondary"
            >
              <i class="fas fa-edit"></i>
              Modifier
            </button>
          </div>
          
          <form @submit.prevent="savePersonalInfo" class="card-body">
            <div class="form-grid">
              <div class="form-group">
                <label for="first_name">Prénom</label>
                <input
                  id="first_name"
                  v-model="personalForm.first_name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.first_name }"
                  :readonly="!editingPersonal"
                />
                <div v-if="errors.first_name" class="invalid-feedback">{{ errors.first_name }}</div>
              </div>
              
              <div class="form-group">
                <label for="last_name">Nom</label>
                <input
                  id="last_name"
                  v-model="personalForm.last_name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.last_name }"
                  :readonly="!editingPersonal"
                />
                <div v-if="errors.last_name" class="invalid-feedback">{{ errors.last_name }}</div>
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input
                  id="email"
                  v-model="personalForm.email"
                  type="email"
                  class="form-control"
                  :class="{ 'is-invalid': errors.email }"
                  :readonly="!editingPersonal"
                />
                <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
              </div>
              
              <div class="form-group">
                <label for="phone">Téléphone</label>
                <input
                  id="phone"
                  v-model="personalForm.phone"
                  type="tel"
                  class="form-control"
                  :class="{ 'is-invalid': errors.phone }"
                  :readonly="!editingPersonal"
                />
                <div v-if="errors.phone" class="invalid-feedback">{{ errors.phone }}</div>
              </div>
            </div>
            
            <div v-if="editingPersonal" class="form-actions">
              <button type="button" @click="cancelPersonalEdit" class="btn btn-secondary">
                <i class="fas fa-times"></i>
                Annuler
              </button>
              <button type="submit" :disabled="savingPersonal" class="btn btn-success">
                <i v-if="savingPersonal" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-save"></i>
                {{ savingPersonal ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Sécurité -->
      <div v-if="activeTab === 'security'" class="tab-content">
        <div class="profile-card">
          <div class="card-header">
            <h3>Changer le mot de passe</h3>
          </div>
          
          <form @submit.prevent="changePassword" class="card-body">
            <div class="form-group">
              <label for="current_password">Mot de passe actuel</label>
              <input
                id="current_password"
                v-model="passwordForm.current_password"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': errors.current_password }"
                required
              />
              <div v-if="errors.current_password" class="invalid-feedback">{{ errors.current_password }}</div>
            </div>
            
            <div class="form-group">
              <label for="new_password">Nouveau mot de passe</label>
              <input
                id="new_password"
                v-model="passwordForm.new_password"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': errors.new_password }"
                required
              />
              <div v-if="errors.new_password" class="invalid-feedback">{{ errors.new_password }}</div>
              <small class="form-text">Minimum 8 caractères avec majuscules, minuscules et chiffres</small>
            </div>
            
            <div class="form-group">
              <label for="confirm_password">Confirmer le nouveau mot de passe</label>
              <input
                id="confirm_password"
                v-model="passwordForm.confirm_password"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': errors.confirm_password }"
                required
              />
              <div v-if="errors.confirm_password" class="invalid-feedback">{{ errors.confirm_password }}</div>
            </div>
            
            <div class="form-actions">
              <button type="submit" :disabled="savingPassword" class="btn btn-success">
                <i v-if="savingPassword" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-key"></i>
                {{ savingPassword ? 'Changement...' : 'Changer le mot de passe' }}
              </button>
            </div>
          </form>
        </div>
        
        <div class="profile-card">
          <div class="card-header">
            <h3>Sessions actives</h3>
          </div>
          
          <div class="card-body">
            <div class="session-info">
              <div class="session-item current">
                <div class="session-details">
                  <i class="fas fa-desktop"></i>
                  <div>
                    <strong>Session actuelle</strong>
                    <p>{{ userAgent }} - {{ currentIP }}</p>
                    <small>Connecté depuis {{ formatDate(loginTime) }}</small>
                  </div>
                </div>
                <span class="session-badge current">Actuelle</span>
              </div>
            </div>
            
            <button @click="logoutAllSessions" class="btn btn-danger">
              <i class="fas fa-sign-out-alt"></i>
              Déconnecter toutes les sessions
            </button>
          </div>
        </div>
      </div>
      
      <!-- Préférences -->
      <div v-if="activeTab === 'preferences'" class="tab-content">
        <div class="profile-card">
          <div class="card-header">
            <h3>Préférences d'affichage</h3>
          </div>
          
          <form @submit.prevent="savePreferences" class="card-body">
            <div class="form-group">
              <label>Thème</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input
                    type="radio"
                    value="light"
                    v-model="preferencesForm.theme"
                  />
                  <span class="radio-custom"></span>
                  Clair
                </label>
                <label class="radio-label">
                  <input
                    type="radio"
                    value="dark"
                    v-model="preferencesForm.theme"
                  />
                  <span class="radio-custom"></span>
                  Sombre
                </label>
                <label class="radio-label">
                  <input
                    type="radio"
                    value="auto"
                    v-model="preferencesForm.theme"
                  />
                  <span class="radio-custom"></span>
                  Automatique
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label for="language">Langue</label>
              <select
                id="language"
                v-model="preferencesForm.language"
                class="form-control"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Notifications</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="preferencesForm.email_notifications"
                  />
                  <span class="checkmark"></span>
                  Notifications par email
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="preferencesForm.browser_notifications"
                  />
                  <span class="checkmark"></span>
                  Notifications navigateur
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="preferencesForm.session_reminders"
                  />
                  <span class="checkmark"></span>
                  Rappels de sessions
                </label>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" :disabled="savingPreferences" class="btn btn-success">
                <i v-if="savingPreferences" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-save"></i>
                {{ savingPreferences ? 'Enregistrement...' : 'Enregistrer les préférences' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'

export default {
  name: 'ProfileView',
  setup() {
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()
    
    const activeTab = ref('personal')
    const editingPersonal = ref(false)
    const savingPersonal = ref(false)
    const savingPassword = ref(false)
    const savingPreferences = ref(false)
    
    const errors = reactive({})
    
    const personalForm = reactive({
      first_name: '',
      last_name: '',
      email: '',
      phone: ''
    })
    
    const passwordForm = reactive({
      current_password: '',
      new_password: '',
      confirm_password: ''
    })
    
    const preferencesForm = reactive({
      theme: 'light',
      language: 'fr',
      email_notifications: true,
      browser_notifications: true,
      session_reminders: true
    })
    
    const user = computed(() => store.getters['auth/user'])
    const userAgent = computed(() => navigator.userAgent.split(' ')[0])
    const currentIP = ref('127.0.0.1') // Simulated
    const loginTime = computed(() => store.getters['auth/loginTime'] || new Date())
    
    const loadUserData = () => {
      if (user.value) {
        Object.assign(personalForm, {
          first_name: user.value.first_name || '',
          last_name: user.value.last_name || '',
          email: user.value.email || '',
          phone: user.value.phone || ''
        })
        
        // Load preferences from user data or localStorage
        const savedPrefs = localStorage.getItem('userPreferences')
        if (savedPrefs) {
          Object.assign(preferencesForm, JSON.parse(savedPrefs))
        }
      }
    }
    
    const validatePersonalInfo = () => {
      Object.keys(errors).forEach(key => delete errors[key])
      
      if (!personalForm.first_name.trim()) {
        errors.first_name = 'Le prénom est requis'
      }
      
      if (!personalForm.last_name.trim()) {
        errors.last_name = 'Le nom est requis'
      }
      
      if (!personalForm.email.trim()) {
        errors.email = 'L\'email est requis'
      } else if (!personalForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.email = 'Format d\'email invalide'
      }
      
      if (personalForm.phone && !personalForm.phone.match(/^(\+33|0)[1-9](\d{8})$/)) {
        errors.phone = 'Format de téléphone invalide'
      }
      
      return Object.keys(errors).length === 0
    }
    
    const validatePassword = () => {
      Object.keys(errors).forEach(key => delete errors[key])
      
      if (!passwordForm.current_password) {
        errors.current_password = 'Le mot de passe actuel est requis'
      }
      
      if (!passwordForm.new_password) {
        errors.new_password = 'Le nouveau mot de passe est requis'
      } else if (passwordForm.new_password.length < 8) {
        errors.new_password = 'Le mot de passe doit contenir au moins 8 caractères'
      } else if (!passwordForm.new_password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
        errors.new_password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      }
      
      if (passwordForm.new_password !== passwordForm.confirm_password) {
        errors.confirm_password = 'Les mots de passe ne correspondent pas'
      }
      
      return Object.keys(errors).length === 0
    }
    
    const savePersonalInfo = async () => {
      if (!validatePersonalInfo()) {
        notifyError('Veuillez corriger les erreurs dans le formulaire')
        return
      }
      
      savingPersonal.value = true
      
      try {
        await store.dispatch('auth/updateProfile', personalForm)
        notifySuccess('Informations mises à jour avec succès')
        editingPersonal.value = false
      } catch (error) {
        notifyError('Erreur lors de la mise à jour des informations')
      } finally {
        savingPersonal.value = false
      }
    }
    
    const cancelPersonalEdit = () => {
      editingPersonal.value = false
      loadUserData() // Reset form
      Object.keys(errors).forEach(key => delete errors[key])
    }
    
    const changePassword = async () => {
      if (!validatePassword()) {
        notifyError('Veuillez corriger les erreurs dans le formulaire')
        return
      }
      
      savingPassword.value = true
      
      try {
        await store.dispatch('auth/changePassword', {
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        })
        notifySuccess('Mot de passe changé avec succès')
        
        // Reset form
        passwordForm.current_password = ''
        passwordForm.new_password = ''
        passwordForm.confirm_password = ''
      } catch (error) {
        if (error.response && error.response.status === 400) {
          errors.current_password = 'Mot de passe actuel incorrect'
        } else {
          notifyError('Erreur lors du changement de mot de passe')
        }
      } finally {
        savingPassword.value = false
      }
    }
    
    const savePreferences = async () => {
      savingPreferences.value = true
      
      try {
        // Save to localStorage for now
        localStorage.setItem('userPreferences', JSON.stringify(preferencesForm))
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', preferencesForm.theme)
        
        notifySuccess('Préférences enregistrées avec succès')
      } catch (error) {
        notifyError('Erreur lors de l\'enregistrement des préférences')
      } finally {
        savingPreferences.value = false
      }
    }
    
    const logoutAllSessions = async () => {
      try {
        await store.dispatch('auth/logoutAllSessions')
        notifySuccess('Toutes les sessions ont été fermées')
      } catch (error) {
        notifyError('Erreur lors de la fermeture des sessions')
      }
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    onMounted(() => {
      loadUserData()
    })
    
    return {
      activeTab,
      editingPersonal,
      savingPersonal,
      savingPassword,
      savingPreferences,
      personalForm,
      passwordForm,
      preferencesForm,
      errors,
      user,
      userAgent,
      currentIP,
      loginTime,
      savePersonalInfo,
      cancelPersonalEdit,
      changePassword,
      savePreferences,
      logoutAllSessions,
      formatDate
    }
  }
}
</script>

<style scoped>
.profile {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-description {
  color: #7f8c8d;
  margin: 0;
}

.profile-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-button {
  flex: 1;
  padding: 1rem;
  border: none;
  background: none;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab-button:hover {
  background-color: #f8f9fa;
  color: #2c3e50;
}

.tab-button.active {
  background-color: #667eea;
  color: white;
  border-bottom: 3px solid #5a6fd8;
}

.tab-content {
  padding: 2rem;
}

.profile-card {
  margin-bottom: 2rem;
}

.profile-card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  color: #2c3e50;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-control:read-only {
  background-color: #f8f9fa;
  color: #6c757d;
}

.form-control.is-invalid {
  border-color: #e74c3c;
}

.invalid-feedback {
  display: block;
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-text {
  color: #7f8c8d;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.radio-group,
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-label,
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.radio-label input[type="radio"],
.checkbox-label input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 50%;
  position: relative;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  position: relative;
}

.radio-label input[type="radio"]:checked ~ .radio-custom {
  border-color: #667eea;
}

.radio-label input[type="radio"]:checked ~ .radio-custom::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #667eea;
  transform: translate(-50%, -50%);
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

.session-info {
  margin-bottom: 1.5rem;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.session-details {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.session-details i {
  color: #667eea;
  font-size: 1.2rem;
  margin-top: 0.25rem;
}

.session-details strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 0.25rem;
}

.session-details p {
  color: #7f8c8d;
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
}

.session-details small {
  color: #7f8c8d;
  font-size: 0.8rem;
}

.session-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.session-badge.current {
  background-color: #28a745;
  color: white;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
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
  font-size: 1rem;
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

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

@media (max-width: 768px) {
  .profile-tabs {
    flex-direction: column;
  }
  
  .tab-button {
    justify-content: flex-start;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .session-item {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
