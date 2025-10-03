<template>
  <div class="container-fluid py-4">
    <!-- En-tête de page -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h2 text-dark mb-1">Créer un utilisateur</h1>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/dashboard" class="text-decoration-none">Tableau de bord</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link to="/admin/users" class="text-decoration-none">Utilisateurs</router-link>
            </li>
            <li class="breadcrumb-item active">Créer</li>
          </ol>
        </nav>
      </div>
      <button @click="$router.go(-1)" class="btn btn-outline-secondary">
        <i class="fas fa-arrow-left me-1"></i>
        Retour
      </button>
    </div>

    <div class="row">
      <div class="col-xl-8 col-lg-10">
        <div class="card shadow-sm">
          <div class="card-header bg-white py-3">
            <h5 class="card-title mb-0">Informations de l'utilisateur</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleCreate" novalidate>
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
                <div class="col-md-6">
                  <label for="password" class="form-label">Mot de passe <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input
                      id="password"
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      :class="{ 'is-invalid': errors.password }"
                      placeholder="Mot de passe"
                      required
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
                <div class="col-md-6">
                  <label for="confirmPassword" class="form-label">Confirmer le mot de passe <span class="text-danger">*</span></label>
                  <input
                    id="confirmPassword"
                    v-model="form.confirmPassword"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control"
                    :class="{ 'is-invalid': errors.confirmPassword }"
                    placeholder="Confirmer le mot de passe"
                    required
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
                  {{ loading ? 'Création...' : 'Créer l\'utilisateur' }}
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
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'

export default {
  name: 'UsersCreateView',
  setup() {
    const router = useRouter()
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()
    
    const loading = ref(false)
    const showPassword = ref(false)
    
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
    
    const loadRoles = async () => {
      try {
        // Simuler le chargement des rôles
        roles.value = [
          { id: 'Super Administrateur', name: 'Super Administrateur' },
          { id: 'Administrateur', name: 'Administrateur' },
          { id: 'Membre', name: 'Membre' }
        ]
      } catch (error) {
        notifyError('Erreur lors du chargement des rôles')
      }
    }
    
    const loadEntities = async () => {
      try {
        // Utiliser le store entities pour récupérer les entités
        await store.dispatch('entities/fetchEntities', { 
          page: 1, 
          per_page: 100,
          is_active: true 
        })
        
        entities.value = store.getters['entities/entities']
      } catch (error) {
        console.error('Erreur lors du chargement des entités:', error)
        notifyError('Erreur lors du chargement des entités')
      }
    }
    
    const loadBoardDirectors = async () => {
      if (!form.value.entityId) {
        boardDirectors.value = []
        return
      }
      
      try {
        // Utiliser le store entities pour récupérer les directeurs
        await store.dispatch('entities/fetchEntityBoardDirectors', {
          entityId: form.value.entityId,
          params: { status: 'active' }
        })
        
        boardDirectors.value = store.getters['entities/boardDirectors']
        form.value.boardDirectorId = ''
      } catch (error) {
        console.error('Erreur lors du chargement des directeurs:', error)
        notifyError('Erreur lors du chargement des directeurs')

        boardDirectors.value = []
        form.value.boardDirectorId = ''
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
      
      if (!form.value.password) {
        errors.value.password = 'Le mot de passe est obligatoire'
      } else if (form.value.password.length < 8) {
        errors.value.password = 'Le mot de passe doit contenir au moins 8 caractères'
      }
      
      if (form.value.password !== form.value.confirmPassword) {
        errors.value.confirmPassword = 'Les mots de passe ne correspondent pas'
      }
      
      if (!form.value.roleId) {
        errors.value.roleId = 'Le rôle est obligatoire'
      }
      
      return Object.keys(errors.value).length === 0
    }
    
    const handleCreate = async () => {
      if (!validateForm()) {
        return
      }
      
      loading.value = true
      
      try {
        const userData = {
          first_name: form.value.firstName,
          last_name: form.value.lastName,
          email: form.value.email,
          phone_number: form.value.phoneNumber,
          username: form.value.username,
          password: form.value.password,
          role_id: form.value.roleId,
          entity_id: form.value.entityId || null,
          board_director_id: form.value.boardDirectorId || null,
          is_active: form.value.isActive
        }
        
        // Utiliser le store users pour créer l'utilisateur
        await store.dispatch('users/createUser', userData)
        
        notifySuccess('Utilisateur créé avec succès')
        router.push('/admin/users')
      } catch (error) {
        console.error('Erreur lors de la création:', error)
        notifyError(error?.detail || 'Erreur lors de la création de l\'utilisateur')
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      loadRoles()
      loadEntities()
    })
    
    return {
      loading,
      showPassword,
      roles,
      entities,
      boardDirectors,
      form,
      errors,
      loadBoardDirectors,
      handleCreate
    }
  }
}
</script>
