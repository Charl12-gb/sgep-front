<template>
  <div class="users-edit">
    <div class="page-header">
      <h1>Modifier l'utilisateur</h1>
      <button @click="$router.back()" class="btn btn-outline">
        <i class="fas fa-arrow-left"></i>
        Retour
      </button>
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
        <!-- Informations utilisateur -->
        <div class="form-section">
          <h3>Informations utilisateur</h3>
          
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
        
        <!-- Rôle et statut -->
        <div class="form-section">
          <h3>Rôle et statut</h3>
          
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
              <span v-if="errors.role" class="error-message">{{ errors.role }}</span>
            </div>
            
            <div class="form-group">
              <label for="status">Statut</label>
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
        </div>
        
        <!-- Actions -->
        <div class="form-actions">
          <button type="button" @click="$router.back()" class="btn btn-outline">
            Annuler
          </button>
          <button type="submit" class="btn btn-success" :disabled="loading">
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
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotyf } from '@/mixins/useNotyf'

export default {
  name: 'UsersEditView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { notifySuccess, notifyError } = useNotyf()
    
    const loading = ref(false)
    const userLoading = ref(true)
    const user = ref(null)
    
    const form = reactive({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      status: ''
    })
    
    const errors = ref({})
    
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
          status: 'active'
        }
        
        // Remplir le formulaire
        Object.assign(form, {
          firstName: user.value.first_name,
          lastName: user.value.last_name,
          email: user.value.email,
          phone: user.value.phone || '',
          role: user.value.role,
          status: user.value.status
        })
        
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error)
        notifyError('Erreur lors du chargement des données utilisateur')
      } finally {
        userLoading.value = false
      }
    }
    
    const updateUser = async () => {
      loading.value = true
      
      try {
        // Simuler la mise à jour de l'utilisateur
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        notifySuccess('Utilisateur mis à jour avec succès')
        
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error)
        notifyError('Erreur lors de la mise à jour de l\'utilisateur')
      } finally {
        loading.value = false
      }
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
      updateUser
    }
  }
}
</script>

<style scoped>
.users-edit {
  padding: 2rem;
  max-width: 800px;
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

.form-group input.error,
.form-group select.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
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
  .users-edit {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
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
