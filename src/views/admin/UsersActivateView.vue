<template>
  <div class="container-fluid py-4">
    <!-- En-tête de page -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h2 text-dark mb-1">Activer l'utilisateur</h1>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/dashboard" class="text-decoration-none">Tableau de bord</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link to="/admin/users" class="text-decoration-none">Utilisateurs</router-link>
            </li>
            <li class="breadcrumb-item active">Activer</li>
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
      <div class="col-xl-10">
        <!-- Informations utilisateur -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white py-3">
            <h5 class="card-title mb-0">Informations de l'utilisateur</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <div class="row g-3">
                  <div class="col-12">
                    <h6 class="text-muted mb-2">Informations personnelles</h6>
                  </div>
                  <div class="col-sm-6">
                    <strong>Nom complet :</strong><br>
                    <span class="text-muted">{{ user.first_name }} {{ user.last_name }}</span>
                  </div>
                  <div class="col-sm-6">
                    <strong>Email :</strong><br>
                    <span class="text-muted">{{ user.email }}</span>
                  </div>
                  <div class="col-sm-6">
                    <strong>Téléphone :</strong><br>
                    <span class="text-muted">{{ user.phone_number || 'Non renseigné' }}</span>
                  </div>
                  <div class="col-sm-6">
                    <strong>Nom d'utilisateur :</strong><br>
                    <span class="text-muted">{{ user.username }}</span>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="row g-3">
                  <div class="col-12">
                    <h6 class="text-muted mb-2">Affiliation</h6>
                  </div>
                  <div class="col-sm-6">
                    <strong>Entité :</strong><br>
                    <span class="text-muted">{{ user.entity_name || 'Aucune entité' }}</span>
                  </div>
                  <div class="col-sm-6">
                    <strong>Directeur de référence :</strong><br>
                    <span class="text-muted">{{ user.board_director_name || 'Aucun directeur' }}</span>
                  </div>
                  <div class="col-sm-6">
                    <strong>Demande créée le :</strong><br>
                    <span class="text-muted">{{ formatDate(user.created_at) }}</span>
                  </div>
                  <div class="col-sm-6">
                    <strong>Statut actuel :</strong><br>
                    <span class="badge" :class="user.is_active ? 'bg-success' : 'bg-warning'">
                      {{ user.is_active ? 'Actif' : 'En attente d\'activation' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Justification de la demande -->
        <div v-if="user.justification" class="card shadow-sm mb-4">
          <div class="card-header bg-white py-3">
            <h5 class="card-title mb-0">Justification de la demande</h5>
          </div>
          <div class="card-body">
            <p class="text-muted mb-0">{{ user.justification }}</p>
          </div>
        </div>

        <!-- Formulaire d'activation -->
        <div class="card shadow-sm">
          <div class="card-header bg-white py-3">
            <h5 class="card-title mb-0">Activation du compte</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleActivation" novalidate>
              <!-- Action à effectuer -->
              <div class="mb-4">
                <label class="form-label">Action à effectuer <span class="text-danger">*</span></label>
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="form-check">
                      <input
                        id="activate"
                        v-model="form.action"
                        type="radio"
                        class="form-check-input"
                        value="activate"
                      />
                      <label for="activate" class="form-check-label">
                        <i class="fas fa-check text-success me-2"></i>
                        Activer le compte
                      </label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-check">
                      <input
                        id="reject"
                        v-model="form.action"
                        type="radio"
                        class="form-check-input"
                        value="reject"
                      />
                      <label for="reject" class="form-check-label">
                        <i class="fas fa-times text-danger me-2"></i>
                        Rejeter la demande
                      </label>
                    </div>
                  </div>
                </div>
                <div v-if="errors.action" class="invalid-feedback d-block">
                  {{ errors.action }}
                </div>
              </div>

              <!-- Modifications des informations (si activation) -->
              <div v-if="form.action === 'activate'" class="mb-4">
                <h6 class="text-muted mb-3">
                  <i class="fas fa-edit me-2"></i>
                  Modifier les informations (optionnel)
                </h6>
                
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label for="firstName" class="form-label">Prénom</label>
                    <input
                      id="firstName"
                      v-model="form.firstName"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.firstName }"
                    />
                    <div v-if="errors.firstName" class="invalid-feedback">
                      {{ errors.firstName }}
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label for="lastName" class="form-label">Nom</label>
                    <input
                      id="lastName"
                      v-model="form.lastName"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.lastName }"
                    />
                    <div v-if="errors.lastName" class="invalid-feedback">
                      {{ errors.lastName }}
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label for="email" class="form-label">Email</label>
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      class="form-control"
                      :class="{ 'is-invalid': errors.email }"
                    />
                    <div v-if="errors.email" class="invalid-feedback">
                      {{ errors.email }}
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label for="phone" class="form-label">Téléphone</label>
                    <input
                      id="phone"
                      v-model="form.phoneNumber"
                      type="tel"
                      class="form-control"
                      :class="{ 'is-invalid': errors.phoneNumber }"
                    />
                    <div v-if="errors.phoneNumber" class="invalid-feedback">
                      {{ errors.phoneNumber }}
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label for="role" class="form-label">Rôle</label>
                    <select
                      id="role"
                      v-model="form.roleId"
                      class="form-select"
                      :class="{ 'is-invalid': errors.roleId }"
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
                </div>
              </div>

              <!-- Commentaire de l'administrateur -->
              <div class="mb-4">
                <label for="adminComment" class="form-label">
                  Commentaire de l'administrateur 
                  <span v-if="form.action === 'reject'" class="text-danger">*</span>
                </label>
                <textarea
                  id="adminComment"
                  v-model="form.adminComment"
                  class="form-control"
                  :class="{ 'is-invalid': errors.adminComment }"
                  rows="4"
                  :placeholder="form.action === 'activate' ? 'Commentaire optionnel...' : 'Expliquez la raison du rejet...'"
                ></textarea>
                <div v-if="errors.adminComment" class="invalid-feedback">
                  {{ errors.adminComment }}
                </div>
                <div class="form-text">
                  {{ form.action === 'activate' 
                    ? 'Ce commentaire sera inclus dans l\'email de confirmation d\'activation.' 
                    : 'Ce commentaire sera envoyé à l\'utilisateur pour expliquer le rejet.' }}
                </div>
              </div>

              <!-- Notifications -->
              <div class="mb-4">
                <h6 class="text-muted mb-3">Notifications</h6>
                <div class="form-check">
                  <input
                    id="sendEmail"
                    v-model="form.sendEmail"
                    type="checkbox"
                    class="form-check-input"
                  />
                  <label for="sendEmail" class="form-check-label">
                    Envoyer un email de notification à l'utilisateur
                  </label>
                </div>
                <div v-if="form.action === 'activate'" class="form-check">
                  <input
                    id="notifyDirector"
                    v-model="form.notifyDirector"
                    type="checkbox"
                    class="form-check-input"
                  />
                  <label for="notifyDirector" class="form-check-label">
                    Notifier le directeur de conseil de référence
                  </label>
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
                  class="btn"
                  :class="form.action === 'activate' ? 'btn-success' : 'btn-danger'"
                  :disabled="loading || !form.action"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i v-else :class="form.action === 'activate' ? 'fas fa-check me-2' : 'fas fa-times me-2'"></i>
                  {{ loading ? 'Traitement...' : (form.action === 'activate' ? 'Activer le compte' : 'Rejeter la demande') }}
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
  name: 'UsersActivateView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()
    
    const loading = ref(false)
    const loadingUser = ref(true)
    
    const user = ref({})
    const roles = ref([])
    const entities = ref([])
    const boardDirectors = ref([])
    
    const form = ref({
      action: '', // 'activate' ou 'reject'
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      roleId: '',
      entityId: '',
      boardDirectorId: '',
      adminComment: '',
      sendEmail: true,
      notifyDirector: true
    })
    
    const errors = ref({})
    
    const loadUser = async () => {
      try {
        loadingUser.value = true
        const userId = route.params.id
        
        // Utiliser le store users pour récupérer l'utilisateur
        const userData = await store.dispatch('users/getUserById', userId)
        user.value = userData
        
        // Pré-remplir le formulaire avec les données existantes
        form.value.firstName = userData.first_name || ''
        form.value.lastName = userData.last_name || ''
        form.value.email = userData.email || ''
        form.value.phoneNumber = userData.phone_number || ''
        form.value.roleId = userData.role_id?.toString() || ''
        form.value.entityId = userData.entity_id?.toString() || ''
        form.value.boardDirectorId = userData.board_director_id?.toString() || ''
        
        // Charger les directeurs si une entité est sélectionnée
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
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Date inconnue'
      try {
        return new Date(dateString).toLocaleDateString('fr-FR', {
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
    
    const validateForm = () => {
      errors.value = {}
      
      if (!form.value.action) {
        errors.value.action = 'Veuillez sélectionner une action'
      }
      
      if (form.value.action === 'reject' && !form.value.adminComment.trim()) {
        errors.value.adminComment = 'Un commentaire est obligatoire pour justifier le rejet'
      }
      
      if (form.value.action === 'activate') {
        if (form.value.firstName && !form.value.firstName.trim()) {
          errors.value.firstName = 'Le prénom ne peut pas être vide'
        }
        
        if (form.value.lastName && !form.value.lastName.trim()) {
          errors.value.lastName = 'Le nom ne peut pas être vide'
        }
        
        if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
          errors.value.email = 'Format d\'email invalide'
        }
      }
      
      return Object.keys(errors.value).length === 0
    }
    
    const handleActivation = async () => {
      if (!validateForm()) {
        return
      }
      
      loading.value = true
      
      try {
        if (form.value.action === 'activate') {
          // Mettre à jour l'utilisateur d'abord s'il y a des modifications
          const updateData = {
            id: user.value.id,
            first_name: form.value.firstName,
            last_name: form.value.lastName,
            email: form.value.email,
            phone_number: form.value.phoneNumber,
            role_id: form.value.roleId,
            entity_id: form.value.entityId || null,
            board_director_id: form.value.boardDirectorId || null,
            is_active: false // Toujours false ici, on active après
          }
          
          await store.dispatch('users/updateUser', updateData)
          
          // Puis activer l'utilisateur
          await store.dispatch('users/activateUser', user.value.id)
          
          notifySuccess('Utilisateur activé avec succès. Un email de confirmation a été envoyé.')
        } else {
          // Pour le rejet, on pourrait ajouter une action spécifique ou simplement supprimer
          await store.dispatch('users/deleteUser', user.value.id)
          notifySuccess('Demande rejetée. L\'utilisateur a été notifié par email.')
        }
        
        router.push('/admin/users')
      } catch (error) {
        console.error('Erreur lors du traitement:', error)
        notifyError(error?.detail || 'Erreur lors du traitement de la demande')
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
      user,
      roles,
      entities,
      boardDirectors,
      form,
      errors,
      loadBoardDirectors,
      formatDate,
      handleActivation
    }
  }
}
</script>
