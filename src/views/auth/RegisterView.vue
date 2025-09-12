<template>
  <div class="auth-page d-flex align-items-center min-vh-100">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6 col-xl-5">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <!-- Header avec logo et titre -->
              <div class="text-center mb-4">
                <img src="/logo-benin.png" alt="Logo" height="60" class="mb-3">
                <h2 class="h3 text-dark fw-bold">Créer un compte</h2>
                <p class="text-muted">
                  Rejoignez le Système de Gestion des Établissements Publics
                </p>
              </div>

              <!-- Alert d'avertissement -->
              <div class="alert alert-warning border-0 mb-4" style="background-color: #fff3cd;">
                <small>
                  <strong>AVERTISSEMENT :</strong> L'accès non autorisé à ce système est strictement interdit et 
                  sera sujet à des poursuites judiciaires conformément à la législation en vigueur. 
                  En créant un compte, vous consentez à ce que vos activités puissent être 
                  surveillées en cas de suspicion d'utilisation non autorisée.
                </small>
              </div>

              <!-- Formulaire d'inscription -->
              <form @submit.prevent="handleRegister" novalidate>
                <!-- Informations personnelles -->
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label for="firstName" class="form-label">Prénom <span class="text-danger">*</span></label>
                    <input
                      id="firstName"
                      v-model="form.firstName"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.firstName }"
                      placeholder="Votre prénom"
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
                      placeholder="Votre nom"
                      required
                    />
                    <div v-if="errors.lastName" class="invalid-feedback">
                      {{ errors.lastName }}
                    </div>
                  </div>
                </div>

                <!-- Email -->
                <div class="mb-3">
                  <label for="email" class="form-label">Adresse email <span class="text-danger">*</span></label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="form-control"
                    :class="{ 'is-invalid': errors.email }"
                    placeholder="votre.email@exemple.com"
                    required
                  />
                  <div v-if="errors.email" class="invalid-feedback">
                    {{ errors.email }}
                  </div>
                </div>

                <!-- Téléphone -->
                <div class="mb-3">
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

                <!-- Nom d'utilisateur -->
                <div class="mb-3">
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

                <!-- Mot de passe -->
                <div class="mb-3">
                  <label for="password" class="form-label">Mot de passe <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input
                      id="password"
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      :class="{ 'is-invalid': errors.password }"
                      placeholder="Votre mot de passe"
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
                  <div class="form-text">
                    Le mot de passe doit contenir au moins 8 caractères, incluant majuscules, minuscules et chiffres.
                  </div>
                </div>

                <!-- Confirmation du mot de passe -->
                <div class="mb-4">
                  <label for="confirmPassword" class="form-label">Confirmer le mot de passe <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input
                      id="confirmPassword"
                      v-model="form.confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="form-control"
                      :class="{ 'is-invalid': errors.confirmPassword }"
                      placeholder="Confirmer votre mot de passe"
                      required
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div v-if="errors.confirmPassword" class="invalid-feedback d-block">
                    {{ errors.confirmPassword }}
                  </div>
                </div>

                <!-- Sélection de l'entité -->
                <div class="mb-3">
                  <label for="entity" class="form-label">Entité <span class="text-danger">*</span></label>
                  <select
                    id="entity"
                    v-model="form.entityId"
                    class="form-select"
                    :class="{ 'is-invalid': errors.entityId }"
                    @change="loadBoardDirectors"
                    required
                  >
                    <option value="">Sélectionnez votre entité</option>
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

                <!-- Sélection du directeur du conseil -->
                <div v-if="form.entityId && boardDirectors.length > 0" class="mb-4">
                  <label for="boardDirector" class="form-label">Directeur de conseil de référence <span class="text-danger">*</span></label>
                  <select
                    id="boardDirector"
                    v-model="form.boardDirectorId"
                    class="form-select"
                    :class="{ 'is-invalid': errors.boardDirectorId }"
                    required
                  >
                    <option value="">Sélectionnez un directeur de conseil</option>
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
                  <div class="form-text">
                    Choisissez le directeur de conseil qui supervisera votre demande d'accès.
                  </div>
                </div>

                <!-- Message d'attente si aucun directeur -->
                <div v-else-if="form.entityId && boardDirectors.length === 0" class="mb-4">
                  <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Aucun directeur de conseil n'est configuré pour cette entité. 
                    Veuillez contacter l'administrateur système.
                  </div>
                </div>

                <!-- Justification -->
                <div class="mb-4">
                  <label for="justification" class="form-label">Justification de la demande <span class="text-danger">*</span></label>
                  <textarea
                    id="justification"
                    v-model="form.justification"
                    class="form-control"
                    :class="{ 'is-invalid': errors.justification }"
                    rows="4"
                    placeholder="Expliquez brièvement pourquoi vous demandez l'accès à cette entité..."
                    required
                  ></textarea>
                  <div v-if="errors.justification" class="invalid-feedback">
                    {{ errors.justification }}
                  </div>
                </div>

                <!-- Conditions d'utilisation -->
                <div class="mb-4">
                  <div class="form-check">
                    <input
                      id="acceptTerms"
                      v-model="form.acceptTerms"
                      type="checkbox"
                      class="form-check-input"
                      :class="{ 'is-invalid': errors.acceptTerms }"
                      required
                    />
                    <label for="acceptTerms" class="form-check-label">
                      J'accepte les <a href="#" class="text-primary">conditions d'utilisation</a> 
                      et la <a href="#" class="text-primary">politique de confidentialité</a> <span class="text-danger">*</span>
                    </label>
                    <div v-if="errors.acceptTerms" class="invalid-feedback">
                      {{ errors.acceptTerms }}
                    </div>
                  </div>
                </div>

                <!-- Bouton de soumission -->
                <button
                  type="submit"
                  class="btn btn-primary w-100 py-2 mb-3"
                  :disabled="loading || !isFormValid"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i v-else class="fas fa-user-plus me-2"></i>
                  {{ loading ? 'Création en cours...' : 'Créer mon compte' }}
                </button>

                <!-- Lien vers la connexion -->
                <div class="text-center">
                  <p class="text-muted mb-0">
                    Vous avez déjà un compte ?
                    <router-link to="/login" class="text-primary text-decoration-none fw-medium">
                      Se connecter
                    </router-link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          <!-- Information sur l'activation -->
          <div class="card mt-4 bg-light border-0">
            <div class="card-body p-4 text-center">
              <div class="text-warning mb-2">
                <i class="fas fa-info-circle fs-4"></i>
              </div>
              <h6 class="fw-bold text-dark">Activation du compte</h6>
              <p class="text-muted mb-0 small">
                Votre compte sera créé en mode "inactif" et devra être activé par un administrateur 
                après vérification de vos informations et validation par le directeur de conseil sélectionné.
              </p>
            </div>
          </div>
        </div>
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
  name: 'RegisterView',
  setup() {
    const router = useRouter()
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()
    
    const loading = ref(false)
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    
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
      entityId: '',
      boardDirectorId: '',
      justification: '',
      acceptTerms: false
    })
    
    const errors = ref({})
    
    const isFormValid = computed(() => {
      return form.value.firstName &&
             form.value.lastName &&
             form.value.email &&
             form.value.username &&
             form.value.password &&
             form.value.confirmPassword &&
             form.value.entityId &&
             form.value.boardDirectorId &&
             form.value.justification &&
             form.value.acceptTerms &&
             form.value.password === form.value.confirmPassword
    })
    
    const loadEntities = async () => {
      try {
        // Utiliser le store entities pour récupérer les données de l'API
        await store.dispatch('entities/fetchEntities', { 
          page: 1, 
          per_page: 100, // Récupérer toutes les entités actives
          is_active: true 
        })
        
        entities.value = store.getters['entities/entities']
      } catch (error) {
        console.error('Erreur lors du chargement des entités:', error)
        notifyError('Erreur lors du chargement des entités')
        
        // Fallback avec des données simulées en cas d'erreur API
        entities.value = [
          {
            id: '1',
            name: 'Office National du Tourisme',
            sigle: 'ONT',
            type: 'Establishment'
          },
          {
            id: '2', 
            name: 'Société Béninoise d\'Électricité',
            sigle: 'SBEE',
            type: 'Society'
          },
          {
            id: '3',
            name: 'Port Autonome de Cotonou',
            sigle: 'PAC',
            type: 'Establishment'
          }
        ]
      }
    }
    
    const loadBoardDirectors = async () => {
      if (!form.value.entityId) {
        boardDirectors.value = []
        return
      }
      
      try {
        // Utiliser le store entities pour récupérer les directeurs de l'entité
        const response = await store.dispatch('entities/fetchEntityBoardDirectors', {
          entityId: form.value.entityId,
          params: { status: 'active' } // Récupérer seulement les directeurs actifs
        })
        
        boardDirectors.value = store.getters['entities/boardDirectors']
        
        // Réinitialiser la sélection du directeur
        form.value.boardDirectorId = ''
      } catch (error) {
        console.error('Erreur lors du chargement des directeurs:', error)
        notifyError('Erreur lors du chargement des directeurs')
        
        // Fallback avec des données simulées en cas d'erreur API
        const directorsData = {
          '1': [
            {
              id: '1',
              nom_prenom: 'Alain KOUASSI',
              fonction: 'Président du Conseil d\'Administration'
            },
            {
              id: '2',
              nom_prenom: 'Marie ADJOVI',
              fonction: 'Vice-Présidente'
            }
          ],
          '2': [
            {
              id: '3',
              nom_prenom: 'Jean-Baptiste HOUNKPE',
              fonction: 'Président du Conseil d\'Administration'
            },
            {
              id: '4',
              nom_prenom: 'Fatima ALASSANE',
              fonction: 'Secrétaire du Conseil'
            }
          ],
          '3': [
            {
              id: '5',
              nom_prenom: 'Robert DOSSOU',
              fonction: 'Président du Conseil d\'Administration'
            }
          ]
        }
        
        boardDirectors.value = directorsData[form.value.entityId] || []
        form.value.boardDirectorId = ''
      }
    }
    
    const validateForm = () => {
      errors.value = {}
      
      // Validation des champs obligatoires
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
      } else if (form.value.username.length < 3) {
        errors.value.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
      }
      
      if (!form.value.password) {
        errors.value.password = 'Le mot de passe est obligatoire'
      } else if (form.value.password.length < 8) {
        errors.value.password = 'Le mot de passe doit contenir au moins 8 caractères'
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.value.password)) {
        errors.value.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      }
      
      if (!form.value.confirmPassword) {
        errors.value.confirmPassword = 'La confirmation du mot de passe est obligatoire'
      } else if (form.value.password !== form.value.confirmPassword) {
        errors.value.confirmPassword = 'Les mots de passe ne correspondent pas'
      }
      
      if (!form.value.entityId) {
        errors.value.entityId = 'Veuillez sélectionner une entité'
      }
      
      if (form.value.entityId && !form.value.boardDirectorId) {
        errors.value.boardDirectorId = 'Veuillez sélectionner un directeur de conseil'
      }
      
      if (!form.value.justification.trim()) {
        errors.value.justification = 'La justification est obligatoire'
      } else if (form.value.justification.trim().length < 20) {
        errors.value.justification = 'La justification doit contenir au moins 20 caractères'
      }
      
      if (!form.value.acceptTerms) {
        errors.value.acceptTerms = 'Vous devez accepter les conditions d\'utilisation'
      }
      
      return Object.keys(errors.value).length === 0
    }
    
    const handleRegister = async () => {
      if (!validateForm()) {
        return
      }
      
      loading.value = true
      
      try {
        const registrationData = {
          first_name: form.value.firstName,
          last_name: form.value.lastName,
          email: form.value.email,
          phone_number: form.value.phoneNumber,
          username: form.value.username,
          password: form.value.password,
          entity_id: form.value.entityId,
          board_director_id: form.value.boardDirectorId,
          justification: form.value.justification
        }
        
        // Utiliser le store pour l'inscription
        await store.dispatch('auth/register', registrationData)
        
        notifySuccess('Votre demande d\'inscription a été envoyée avec succès ! Vous recevrez un email de confirmation une fois votre compte activé par l\'administrateur.')
        
        // Rediriger vers la page de connexion
        setTimeout(() => {
          router.push('/login')
        }, 2000)
        
      } catch (error) {
        console.error('Erreur lors de l\'inscription:', error)
        notifyError(error?.detail || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.')
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      loadEntities()
    })
    
    return {
      loading,
      showPassword,
      showConfirmPassword,
      entities,
      boardDirectors,
      form,
      errors,
      isFormValid,
      loadBoardDirectors,
      handleRegister
    }
  }
}
</script>

<style scoped>
.auth-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.card {
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.form-control:focus,
.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  transform: none;
  box-shadow: none;
}

.text-primary {
  color: #667eea !important;
}

.text-primary:hover {
  color: #764ba2 !important;
}

.alert {
  border-radius: 0.5rem;
}

.form-text {
  font-size: 0.875rem;
}

.bg-light {
  background-color: #f8f9fa !important;
}
</style>
