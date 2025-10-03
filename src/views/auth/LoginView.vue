<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center" style="background-color: #f8f9fa;">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-5">
          <div class="card shadow-lg border-0">
            <div class="card-body">
              <!-- Header avec logo et titre -->
              <div class="text-center mb-4">
                <div class="mb-3">
                  <img src="/logo.0d7d6044.png" alt="République du Bénin" class="img-fluid mb-2" style="max-height: 80px;">
                </div>
              </div>

              <!-- Alert d'avertissement -->
              <div class="alert alert-warning border-0 mb-4" style="background-color: #fff3cd;">
                <small>
                  <strong>AVERTISSEMENT :</strong> L'accès non autorisé à ce système est strictement interdit et 
                  sera sujet à des poursuites judiciaires conformément à la législation en vigueur. 
                  En accédant à ce système, vous consentez à ce que vos activités puissent être 
                  surveillées en cas de suspicion d'utilisation non autorisée.
                </small>
              </div>

              <!-- Formulaire de connexion -->
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="fas fa-envelope text-muted"></i>
                    </span>
                    <input
                      id="username"
                      v-model="form.username"
                      type="text"
                      required
                      class="form-control border-start-0"
                      :class="{ 'is-invalid': errors.username }"
                      placeholder="Entrez votre nom d'utilisateur"
                    />
                  </div>
                  <div v-if="errors.username" class="invalid-feedback d-block">
                    {{ errors.username }}
                  </div>
                </div>

                <div class="mb-3">
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="fas fa-lock text-muted"></i>
                    </span>
                    <input
                      id="password"
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      class="form-control border-start-0 border-end-0"
                      :class="{ 'is-invalid': errors.password }"
                      placeholder="Entrez votre mot de passe"
                    />
                    <button
                      type="button"
                      class="input-group-text bg-light border-start-0"
                      @click="togglePasswordVisibility"
                      :title="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                    >
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-muted"></i>
                    </button>
                  </div>
                  <div v-if="errors.password" class="invalid-feedback d-block">
                    {{ errors.password }}
                  </div>
                </div>

                <div class="text-end mb-3">
                  <router-link to="/forgot-password" class="text-primary text-decoration-none small">
                    Mot de passe oublié?
                  </router-link>
                </div>

                <button 
                  type="submit" 
                  :disabled="loading" 
                  class="btn btn-success w-100 py-2 fw-bold"
                >
                  <span v-if="loading">
                    <i class="fas fa-spinner fa-spin me-2"></i>Connexion...
                  </span>
                  <span v-else>Se connecter</span>
                </button>

                <!-- Lien vers l'inscription -->
                <div class="text-center mt-3">
                  <p class="text-muted mb-0">
                    Vous n'avez pas de compte ?
                    <router-link to="/register" class="text-primary text-decoration-none fw-medium">
                      Créer un compte
                    </router-link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center mt-4">
            <small class="text-muted">
              SGEP © {{ new Date().getFullYear() }}
            </small>
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
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()
    
    const form = ref({
      username: '',
      password: ''
    })
    
    const loading = ref(false)
    const showPassword = ref(false)
    const errors = ref({})
    
    const validateForm = () => {
      errors.value = {}
      
      if (!form.value.username.trim()) {
        errors.value.username = 'L\'adresse email ou téléphone est requis'
      }
      
      if (!form.value.password.trim()) {
        errors.value.password = 'Le mot de passe est requis'
      }
      
      if (form.value.password.length > 0 && form.value.password.length < 3) {
        errors.value.password = 'Le mot de passe doit contenir au moins 3 caractères'
      }
      
      return Object.keys(errors.value).length === 0
    }
    
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }
    
    const handleLogin = async () => {
      if (!validateForm()) {
        return
      }
      
      loading.value = true
      errors.value = {}
      
      try {
        const result = await store.dispatch('auth/login', form.value)
        notifySuccess('Bienvenue sur votre tableau de bord !')
        router.push('/dashboard')
      } catch (error) {
        notifyError(error?.detail ?? 'Erreur lors de la connexion, veuillez vérifier vos identifiants et réessayer.')
      } finally {
        loading.value = false
      }
    }

    // Nettoyer le localStorage au montage du composant de login
    onMounted(() => {
      // Supprimer l'entité sélectionnée du localStorage
      localStorage.removeItem('selectedEntity')
      localStorage.removeItem('selectedEntityId')
    })
    
    return {
      form,
      loading,
      showPassword,
      errors,
      handleLogin,
      togglePasswordVisibility,
      validateForm
    }
  }
}
</script>

<style scoped>
/* Styles personnalisés additionnels si nécessaire */
.input-group-text {
  background-color: #f8f9fa !important;
}

.form-control:focus {
  border-color: #5cb85c;
  box-shadow: 0 0 0 0.2rem rgba(92, 184, 92, 0.25);
}



.card {
  border-radius: 10px;
}

.alert-warning {
  border-left: 4px solid #ffc107;
}
</style>