<template>
  <div class="container-fluid py-4">
    <!-- En-tête de page -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h2 text-dark mb-1">Modifier l'utilisateur</h1>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/dashboard" class="text-decoration-none">Tableau de bord</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link to="/admin/users" class="text-decoration-none">Utilisateurs</router-link>
            </li>
            <li class="breadcrumb-item active">Modifier</li>
          </ol>
        </nav>
      </div>
      <button @click="$router.go(-1)" class="btn btn-outline-secondary">
        <i class="fas fa-arrow-left me-1"></i>
        Retour
      </button>
    </div>

    <!-- État de chargement -->
    <div v-if="loadingUser" class="text-center py-5">
      <div class="spinner-border text-primary me-2" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
      <span class="text-muted">Chargement des informations utilisateur...</span>
    </div>

    <!-- Contenu principal -->
    <div v-else class="row">
      <div class="col-xl-8 col-lg-10">
        <div class="card shadow-sm">
          <div class="card-header bg-white py-3">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Informations de l'utilisateur</h5>
              <span class="badge" :class="user.is_active ? 'bg-success' : 'bg-danger'">
                {{ user.is_active ? 'Actif' : 'Inactif' }}
              </span>
            </div>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleUpdate" novalidate>
              <!-- Informations personnelles -->
              <div class="row g-3 mb-4">
                <div class="col-12">
                  <h6 class="text-muted mb-3">
                    <i class="fas fa-user me-2"></i>
                    Informations personnelles
                  </h6>
                </div>
                <div class="col-md-6">
                  <label for="firstName" class="form-label">Prénom <span class="text-danger">*</span></label>
                  <input
                    id="firstName"
                    v-model="form.firstName"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.firstName }"
                    placeholder="Prénom de l'utilisateur"
                    required
                  />
                  <div v-if="errors.firstName" class="invalid-feedback">
                    {{ errors.firstName }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="lastName" class="form-label">Nom <span class="text-danger">*</span></label>
                  <input
                    id="lastName"
                    v-model="form.lastName"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.lastName }"
                    placeholder="Nom de l'utilisateur"
                    required
                  />
                  <div v-if="errors.lastName" class="invalid-feedback">
                    {{ errors.lastName }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="email" class="form-label">Adresse email <span class="text-danger">*</span></label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="form-control"
                    :class="{ 'is-invalid': errors.email }"
                    placeholder="email@exemple.com"
                    required
                  />
                  <div v-if="errors.email" class="invalid-feedback">
                    {{ errors.email }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="phone" class="form-label">Numéro de téléphone</label>
                  <input
                    id="phone"
                    v-model="form.phoneNumber"
                    type="tel"
                    class="form-control"
                    :class="{ 'is-invalid': errors.phoneNumber }"
                    placeholder="+229 XX XX XX XX"
                  />
                  <div v-if="errors.phoneNumber" class="invalid-feedback">
                    {{ errors.phoneNumber }}
                  </div>
                </div>
              </div>

              <!-- Informations de connexion -->
              <div class="row g-3 mb-4">
                <div class="col-12">
                  <h6 class="text-muted mb-3">
                    <i class="fas fa-key me-2"></i>
                    Informations de connexion
                  </h6>
                </div>
                <div class="col-md-6">
                  <label for="username" class="form-label">Nom d'utilisateur <span class="text-danger">*</span></label>
                  <input
                    id="username"
                    v-model="form.username"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.username }"
                    placeholder="nom.utilisateur"
                    required
                  />
                  <div v-if="errors.username" class="invalid-feedback">
                    {{ errors.username }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="role" class="form-label">Rôle <span class="text-danger">*</span></label>
                  <select
                    id="role"
                    v-model="form.roleId"
                    class="form-select"
                    :class="{ 'is-invalid': errors.roleId }"
                    required
                  >
                    <option value="">Sélectionnez un rôle</option>
                    <option
                      v-for="role in roles"
                      :key="role.id"
                      :value="role.id"
                    >
                      {{ role.name }}
                    </option>
                  </select>
                  <div v-if="errors.roleId" class="invalid-feedback">
                    {{ errors.roleId }}
                  </div>
                </div>
              </div>

              <!-- Changer le mot de passe -->
              <div class="row g-3 mb-4">
                <div class="col-12">
                  <div class="d-flex align-items-center mb-3">
                    <h6 class="text-muted mb-0 me-3">
                      <i class="fas fa-lock me-2"></i>
                      Changer le mot de passe
                    </h6>
                    <div class="form-check">
                      <input
                        id="changePassword"
                        v-model="changePassword"
                        type="checkbox"
                        class="form-check-input"
                      />
                      <label for="changePassword" class="form-check-label">
                        Modifier le mot de passe
                      </label>
                    </div>
                  </div>
                </div>
                <div v-if="changePassword" class="col-md-6">
                  <label for="password" class="form-label">Nouveau mot de passe <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input
                      id="password"
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      :class="{ 'is-invalid': errors.password }"
                      placeholder="Nouveau mot de passe"
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="showPassword = !showPassword"
                    >
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div v-if="errors.password" class="invalid-feedback d-block">
                    {{ errors.password }}
                  </div>
                </div>
                <div v-if="changePassword" class="col-md-6">
                  <label for="confirmPassword" class="form-label">Confirmer le nouveau mot de passe <span class="text-danger">*</span></label>
                  <input
                    id="confirmPassword"
                    v-model="form.confirmPassword"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control"
                    :class="{ 'is-invalid': errors.confirmPassword }"
                    placeholder="Confirmer le nouveau mot de passe"
                  />
                  <div v-if="errors.confirmPassword" class="invalid-feedback">
                    {{ errors.confirmPassword }}
                  </div>
                </div>
              </div>

              <!-- Entité et directeur de conseil -->
              <div class="row g-3 mb-4">
                <div class="col-12">
                  <h6 class="text-muted mb-3">
                    <i class="fas fa-building me-2"></i>
                    Affiliation
                  </h6>
                </div>
                <div class="col-md-6">
                  <label for="entity" class="form-label">Entité</label>
                  <select
                    id="entity"
                    v-model="form.entityId"
                    class="form-select"
                    :class="{ 'is-invalid': errors.entityId }"
                    @change="loadBoardDirectors"
                  >
                    <option value="">Aucune entité</option>
                    <option
                      v-for="entity in entities"
                      :key="entity.id"
                      :value="entity.id"
                    >
                      {{ entity.name }} {{ entity.sigle ? `(${entity.sigle})` : '' }}
                    </option>
                  </select>
                  <div v-if="errors.entityId" class="invalid-feedback">
                    {{ errors.entityId }}
                  </div>
                </div>
                <div v-if="form.entityId && boardDirectors.length > 0" class="col-md-6">
                  <label for="boardDirector" class="form-label">Directeur de conseil de référence</label>
                  <select
                    id="boardDirector"
                    v-model="form.boardDirectorId"
                    class="form-select"
                    :class="{ 'is-invalid': errors.boardDirectorId }"
                  >
                    <option value="">Aucun directeur</option>
                    <option
                      v-for="director in boardDirectors"
                      :key="director.id"
                      :value="director.id"
                    >
                      {{ director.nom_prenom }} - {{ director.fonction || 'Membre du conseil' }}
                    </option>
                  </select>
                  <div v-if="errors.boardDirectorId" class="invalid-feedback">
                    {{ errors.boardDirectorId }}
                  </div>
                </div>
              </div>

              <!-- Statut -->
              <div class="row g-3 mb-4">
                <div class="col-12">
                  <h6 class="text-muted mb-3">
                    <i class="fas fa-cog me-2"></i>
                    Configuration
                  </h6>
                </div>
                <div class="col-md-6">
                  <label for="status" class="form-label">Statut du compte</label>
                  <select
                    id="status"
                    v-model="form.isActive"
                    class="form-select"
                  >
                    <option :value="true">Actif</option>
                    <option :value="false">Inactif</option>
                  </select>
                </div>
              </div>

              <!-- Boutons d'action -->
              <div class="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="$router.go(-1)"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i v-else class="fas fa-save me-2"></i>
                  {{ loading ? 'Mise à jour...' : 'Mettre à jour' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'

export default {
  name: 'UsersEditView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()
    
    const loading = ref(false)
    const loadingUser = ref(true)
    const showPassword = ref(false)
    const changePassword = ref(false)
    
    const user = ref({})
    const roles = ref([])
    const entities = ref([])
    const boardDirectors = ref([])
    
    const form = ref({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      username: '',
      password: '',
      confirmPassword: '',
      roleId: '',
      entityId: '',
      boardDirectorId: '',
      isActive: true
    })
    
    const errors = ref({})
    
    const loadUser = async () => {
      try {
        loadingUser.value = true
        const userId = route.params.id
        
        // Utiliser le store users pour récupérer l'utilisateur
        const userData = await store.dispatch('users/getUserById', userId)
        user.value = userData
        
        // Remplir le formulaire avec les données existantes
        form.value = {
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          email: userData.email || '',
          phoneNumber: userData.phone_number || '',
          username: userData.username || '',
          password: '',
          confirmPassword: '',
          roleId: userData.role_id?.toString() || '',
          entityId: userData.entity_id?.toString() || '',
          boardDirectorId: userData.board_director_id?.toString() || '',
          isActive: userData.is_active || false
        }
        
        if (form.value.entityId) {
          await loadBoardDirectors(form.value.entityId)
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error)
        notifyError('Erreur lors du chargement de l\'utilisateur')
        router.push('/admin/users')
      } finally {
        loadingUser.value = false
      }
    }
    
    const loadRoles = async () => {
      try {
        roles.value = [
          { id: '1', name: 'Administrateur' },
          { id: '2', name: 'Membre' },
          { id: '3', name: 'Utilisateur' },
          { id: '4', name: 'Observateur' }
        ]
      } catch (error) {
        notifyError('Erreur lors du chargement des rôles')
      }
    }
    
    const loadEntities = async () => {
      try {
        // Utiliser le store entities pour récupérer les entités
        await store.dispatch('entities/fetchEntities')
        entities.value = store.getters['entities/entities']
      } catch (error) {
        console.error('Erreur lors du chargement des entités:', error)
        // Fallback avec des données simulées
        entities.value = [
          { id: '1', name: 'Office National du Tourisme', sigle: 'ONT' },
          { id: '2', name: 'Société Béninoise d\'Électricité', sigle: 'SBEE' },
          { id: '3', name: 'Port Autonome de Cotonou', sigle: 'PAC' }
        ]
      }
    }
    
    const loadBoardDirectors = async (entityId = null) => {
      const targetEntityId = entityId || form.value.entityId
      
      if (!targetEntityId) {
        boardDirectors.value = []
        return
      }
      
      try {
        // Utiliser le store entities pour récupérer les directeurs
        await store.dispatch('entities/fetchBoardDirectors', targetEntityId)
        boardDirectors.value = store.getters['entities/boardDirectorsByEntity'](targetEntityId)
      } catch (error) {
        console.error('Erreur lors du chargement des directeurs:', error)
        // Fallback avec des données simulées
        const directorsData = {
          '1': [
            { id: '1', nom_prenom: 'Alain KOUASSI', fonction: 'Président du Conseil d\'Administration' },
            { id: '2', nom_prenom: 'Marie ADJOVI', fonction: 'Vice-Présidente' }
          ],
          '2': [
            { id: '3', nom_prenom: 'Jean-Baptiste HOUNKPE', fonction: 'Président du Conseil d\'Administration' },
            { id: '4', nom_prenom: 'Fatima ALASSANE', fonction: 'Secrétaire du Conseil' }
          ],
          '3': [
            { id: '5', nom_prenom: 'Robert DOSSOU', fonction: 'Président du Conseil d\'Administration' }
          ]
        }
        
        boardDirectors.value = directorsData[targetEntityId] || []
      }
    }
    
    const validateForm = () => {
      errors.value = {}
      
      if (!form.value.firstName.trim()) {
        errors.value.firstName = 'Le prénom est obligatoire'
      }
      
      if (!form.value.lastName.trim()) {
        errors.value.lastName = 'Le nom est obligatoire'
      }
      
      if (!form.value.email.trim()) {
        errors.value.email = 'L\'email est obligatoire'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        errors.value.email = 'Format d\'email invalide'
      }
      
      if (!form.value.username.trim()) {
        errors.value.username = 'Le nom d\'utilisateur est obligatoire'
      }
      
      if (!form.value.roleId) {
        errors.value.roleId = 'Le rôle est obligatoire'
      }
      
      if (changePassword.value) {
        if (!form.value.password) {
          errors.value.password = 'Le nouveau mot de passe est obligatoire'
        } else if (form.value.password.length < 8) {
          errors.value.password = 'Le mot de passe doit contenir au moins 8 caractères'
        }
        
        if (form.value.password !== form.value.confirmPassword) {
          errors.value.confirmPassword = 'Les mots de passe ne correspondent pas'
        }
      }
      
      return Object.keys(errors.value).length === 0
    }
    
    const handleUpdate = async () => {
      if (!validateForm()) {
        return
      }
      
      loading.value = true
      
      try {
        const updateData = {
          id: user.value.id,
          first_name: form.value.firstName,
          last_name: form.value.lastName,
          email: form.value.email,
          phone_number: form.value.phoneNumber,
          username: form.value.username,
          role_id: form.value.roleId,
          entity_id: form.value.entityId || null,
          board_director_id: form.value.boardDirectorId || null,
          is_active: form.value.isActive
        }
        
        // Si l'utilisateur veut changer le mot de passe
        if (changePassword.value && form.value.password) {
          await store.dispatch('users/changeUserPassword', {
            userId: user.value.id,
            passwordData: {
              new_password: form.value.password,
              confirm_password: form.value.confirmPassword
            }
          })
        }
        
        // Utiliser le store users pour mettre à jour l'utilisateur
        await store.dispatch('users/updateUser', updateData)
        
        notifySuccess('Utilisateur mis à jour avec succès')
        router.push('/admin/users')
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error)
        notifyError(error?.detail || 'Erreur lors de la mise à jour de l\'utilisateur')
      } finally {
        loading.value = false
      }
    }
    
    onMounted(async () => {
      await loadRoles()
      await loadEntities()
      await loadUser()
    })
    
    return {
      loading,
      loadingUser,
      showPassword,
      changePassword,
      user,
      roles,
      entities,
      boardDirectors,
      form,
      errors,
      loadBoardDirectors,
      handleUpdate
    }
  }
}
</script>
