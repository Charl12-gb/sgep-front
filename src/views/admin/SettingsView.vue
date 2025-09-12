<template>
  <div class="settings">
    <div class="page-header">
      <h1>Paramètres du système</h1>
    </div>
    
    <div class="settings-container">
      <!-- Navigation des onglets -->
      <div class="tabs-nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="['tab', { active: activeTab === tab.key }]"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>
      
      <!-- Contenu des onglets -->
      <div class="tab-content">
        <!-- Paramètres généraux -->
        <div v-if="activeTab === 'general'" class="tab-panel">
          <h2>Paramètres généraux</h2>
          
          <form @submit.prevent="saveGeneralSettings" class="settings-form">
            <div class="form-section">
              <h3>Informations de l'organisation</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="orgName">Nom de l'organisation</label>
                  <input
                    id="orgName"
                    v-model="generalSettings.organizationName"
                    type="text"
                    required
                    placeholder="Nom de votre organisation"
                  />
                </div>
                
                <div class="form-group">
                  <label for="orgCode">Code organisation</label>
                  <input
                    id="orgCode"
                    v-model="generalSettings.organizationCode"
                    type="text"
                    required
                    placeholder="CODE_ORG"
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="orgEmail">Email de contact</label>
                  <input
                    id="orgEmail"
                    v-model="generalSettings.contactEmail"
                    type="email"
                    required
                    placeholder="contact@organisation.fr"
                  />
                </div>
                
                <div class="form-group">
                  <label for="orgPhone">Téléphone</label>
                  <input
                    id="orgPhone"
                    v-model="generalSettings.contactPhone"
                    type="tel"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h3>Configuration système</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="timezone">Fuseau horaire</label>
                  <select id="timezone" v-model="generalSettings.timezone">
                    <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="America/New_York">America/New_York (UTC-5)</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="language">Langue par défaut</label>
                  <select id="language" v-model="generalSettings.defaultLanguage">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="dateFormat">Format de date</label>
                  <select id="dateFormat" v-model="generalSettings.dateFormat">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="sessionDuration">Durée de session (minutes)</label>
                  <input
                    id="sessionDuration"
                    v-model.number="generalSettings.sessionDuration"
                    type="number"
                    min="30"
                    max="480"
                  />
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-success" :disabled="saving">
                <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-save"></i>
                {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- Notifications -->
        <div v-if="activeTab === 'notifications'" class="tab-panel">
          <h2>Paramètres de notifications</h2>
          
          <form @submit.prevent="saveNotificationSettings" class="settings-form">
            <div class="form-section">
              <h3>Notifications par email</h3>
              
              <div class="form-group checkbox-group">
                <label>
                  <input
                    v-model="notificationSettings.emailEnabled"
                    type="checkbox"
                  />
                  <span class="checkmark"></span>
                  Activer les notifications par email
                </label>
              </div>
              
              <div v-if="notificationSettings.emailEnabled" class="sub-settings">
                <div class="form-group checkbox-group">
                  <label>
                    <input
                      v-model="notificationSettings.newUserNotification"
                      type="checkbox"
                    />
                    <span class="checkmark"></span>
                    Nouvel utilisateur inscrit
                  </label>
                </div>
                
                <div class="form-group checkbox-group">
                  <label>
                    <input
                      v-model="notificationSettings.sessionReminders"
                      type="checkbox"
                    />
                    <span class="checkmark"></span>
                    Rappels de sessions
                  </label>
                </div>
                
                <div class="form-group checkbox-group">
                  <label>
                    <input
                      v-model="notificationSettings.systemAlerts"
                      type="checkbox"
                    />
                    <span class="checkmark"></span>
                    Alertes système
                  </label>
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h3>Configuration SMTP</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="smtpHost">Serveur SMTP</label>
                  <input
                    id="smtpHost"
                    v-model="notificationSettings.smtpHost"
                    type="text"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                
                <div class="form-group">
                  <label for="smtpPort">Port</label>
                  <input
                    id="smtpPort"
                    v-model.number="notificationSettings.smtpPort"
                    type="number"
                    placeholder="587"
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="smtpUser">Nom d'utilisateur</label>
                  <input
                    id="smtpUser"
                    v-model="notificationSettings.smtpUser"
                    type="text"
                    placeholder="votre-email@example.com"
                  />
                </div>
                
                <div class="form-group">
                  <label for="smtpPassword">Mot de passe</label>
                  <input
                    id="smtpPassword"
                    v-model="notificationSettings.smtpPassword"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div class="form-group checkbox-group">
                <label>
                  <input
                    v-model="notificationSettings.smtpTls"
                    type="checkbox"
                  />
                  <span class="checkmark"></span>
                  Utiliser TLS/SSL
                </label>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="testEmailConfig" class="btn btn-outline">
                <i class="fas fa-paper-plane"></i>
                Tester la configuration
              </button>
              <button type="submit" class="btn btn-success" :disabled="saving">
                <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-save"></i>
                {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- Sécurité -->
        <div v-if="activeTab === 'security'" class="tab-panel">
          <h2>Paramètres de sécurité</h2>
          
          <form @submit.prevent="saveSecuritySettings" class="settings-form">
            <div class="form-section">
              <h3>Politique des mots de passe</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="minPasswordLength">Longueur minimale</label>
                  <input
                    id="minPasswordLength"
                    v-model.number="securitySettings.minPasswordLength"
                    type="number"
                    min="6"
                    max="32"
                  />
                </div>
                
                <div class="form-group">
                  <label for="passwordExpiry">Expiration (jours)</label>
                  <input
                    id="passwordExpiry"
                    v-model.number="securitySettings.passwordExpiry"
                    type="number"
                    min="30"
                    max="365"
                  />
                </div>
              </div>
              
              <div class="form-group checkbox-group">
                <label>
                  <input
                    v-model="securitySettings.requireUppercase"
                    type="checkbox"
                  />
                  <span class="checkmark"></span>
                  Exiger des majuscules
                </label>
              </div>
              
              <div class="form-group checkbox-group">
                <label>
                  <input
                    v-model="securitySettings.requireNumbers"
                    type="checkbox"
                  />
                  <span class="checkmark"></span>
                  Exiger des chiffres
                </label>
              </div>
              
              <div class="form-group checkbox-group">
                <label>
                  <input
                    v-model="securitySettings.requireSpecialChars"
                    type="checkbox"
                  />
                  <span class="checkmark"></span>
                  Exiger des caractères spéciaux
                </label>
              </div>
            </div>
            
            <div class="form-section">
              <h3>Sécurité des sessions</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="maxLoginAttempts">Tentatives de connexion max</label>
                  <input
                    id="maxLoginAttempts"
                    v-model.number="securitySettings.maxLoginAttempts"
                    type="number"
                    min="3"
                    max="10"
                  />
                </div>
                
                <div class="form-group">
                  <label for="lockoutDuration">Durée de verrouillage (minutes)</label>
                  <input
                    id="lockoutDuration"
                    v-model.number="securitySettings.lockoutDuration"
                    type="number"
                    min="5"
                    max="60"
                  />
                </div>
              </div>
              
              <div class="form-group checkbox-group">
                <label>
                  <input
                    v-model="securitySettings.twoFactorAuth"
                    type="checkbox"
                  />
                  <span class="checkmark"></span>
                  Authentification à deux facteurs (2FA)
                </label>
              </div>
              
              <div class="form-group checkbox-group">
                <label>
                  <input
                    v-model="securitySettings.logSecurityEvents"
                    type="checkbox"
                  />
                  <span class="checkmark"></span>
                  Journaliser les événements de sécurité
                </label>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-success" :disabled="saving">
                <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-save"></i>
                {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useNotyf } from '@/mixins/useNotyf'

export default {
  name: 'SettingsView',
  setup() {
    const { notifySuccess, notifyError } = useNotyf()
    
    const activeTab = ref('general')
    const saving = ref(false)
    
    const tabs = [
      { key: 'general', label: 'Général', icon: 'fas fa-cog' },
      { key: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
      { key: 'security', label: 'Sécurité', icon: 'fas fa-shield-alt' }
    ]
    
    const generalSettings = reactive({
      organizationName: 'Mon Organisation',
      organizationCode: 'ORG001',
      contactEmail: 'contact@organisation.fr',
      contactPhone: '+33 1 23 45 67 89',
      timezone: 'Europe/Paris',
      defaultLanguage: 'fr',
      dateFormat: 'DD/MM/YYYY',
      sessionDuration: 120
    })
    
    const notificationSettings = reactive({
      emailEnabled: true,
      newUserNotification: true,
      sessionReminders: true,
      systemAlerts: true,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      smtpTls: true
    })
    
    const securitySettings = reactive({
      minPasswordLength: 8,
      passwordExpiry: 90,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      twoFactorAuth: false,
      logSecurityEvents: true
    })
    
    const loadSettings = async () => {
      try {
        // Simuler le chargement des paramètres
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Les paramètres sont déjà initialisés avec des valeurs par défaut
        
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error)
        notifyError('Erreur lors du chargement des paramètres')
      }
    }
    
    const saveGeneralSettings = async () => {
      saving.value = true
      
      try {
        // Simuler la sauvegarde
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        notifySuccess('Paramètres généraux sauvegardés avec succès')
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        notifyError('Erreur lors de la sauvegarde des paramètres')
      } finally {
        saving.value = false
      }
    }
    
    const saveNotificationSettings = async () => {
      saving.value = true
      
      try {
        // Simuler la sauvegarde
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        notifySuccess('Paramètres de notifications sauvegardés avec succès')
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        notifyError('Erreur lors de la sauvegarde des paramètres')
      } finally {
        saving.value = false
      }
    }
    
    const saveSecuritySettings = async () => {
      saving.value = true
      
      try {
        // Simuler la sauvegarde
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        notifySuccess('Paramètres de sécurité sauvegardés avec succès')
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        notifyError('Erreur lors de la sauvegarde des paramètres')
      } finally {
        saving.value = false
      }
    }
    
    const testEmailConfig = async () => {
      try {
        // Simuler le test de configuration email
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        notifySuccess('Email de test envoyé avec succès !')
      } catch (error) {
        console.error('Erreur lors du test email:', error)
        notifyError('Erreur lors de l\'envoi de l\'email de test')
      }
    }
    
    onMounted(() => {
      loadSettings()
    })
    
    return {
      activeTab,
      saving,
      tabs,
      generalSettings,
      notificationSettings,
      securitySettings,
      saveGeneralSettings,
      saveNotificationSettings,
      saveSecuritySettings,
      testEmailConfig
    }
  }
}
</script>

<style scoped>
.settings {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #2c3e50;
}

.settings-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs-nav {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.tab {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #6c757d;
  font-weight: 500;
  transition: all 0.2s;
}

.tab:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.tab.active {
  background: #667eea;
  color: white;
}

.tab-content {
  padding: 2rem;
}

.tab-panel h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.settings-form {
  max-width: 800px;
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
  font-size: 1.1rem;
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
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.checkbox-group {
  flex-direction: row !important;
  align-items: center;
  margin-bottom: 1rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 0;
}

.checkbox-group input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-right: 0.75rem;
  position: relative;
  transition: all 0.2s;
}

.checkbox-group input[type="checkbox"]:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-group input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

.sub-settings {
  margin-left: 2rem;
  padding-left: 1rem;
  border-left: 2px solid #e9ecef;
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
  .settings {
    padding: 1rem;
  }
  
  .tabs-nav {
    flex-direction: column;
  }
  
  .tab-content {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .sub-settings {
    margin-left: 1rem;
  }
}
</style>
