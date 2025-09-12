<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center" style="background-color: #f8f9fa;">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-5">
          <div class="card shadow-lg border-0">
            <div class="card-body p-4">
              <!-- Header avec logo et titre -->
              <div class="text-center mb-4">
                <div class="mb-3">
                  <img src="/logo.0d7d6044.png" alt="République du Bénin" class="img-fluid mb-2" style="max-height: 80px;">
                </div>
                <h4 class="text-dark mb-2">Récupération de mot de passe</h4>
                <p class="text-muted small">Entrez votre adresse email pour recevoir un lien de réinitialisation</p>
              </div>

              <!-- Alert d'information -->
              <div class="alert alert-info border-0 mb-4" style="background-color: #d1ecf1;">
                <i class="fas fa-info-circle me-2"></i>
                <small>
                  Un email contenant les instructions de réinitialisation vous sera envoyé si votre adresse est valide.
                </small>
              </div>

              <!-- Formulaire de récupération -->
              <form @submit.prevent="handleForgotPassword">
                <div class="mb-4">
                  <label for="email" class="form-label fw-semibold text-dark">
                    <i class="fas fa-envelope me-2 text-muted"></i>Adresse email
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="fas fa-envelope text-muted"></i>
                    </span>
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      required
                      class="form-control border-start-0"
                      placeholder="exemple@email.com"
                    />
                  </div>
                  <small class="form-text text-muted">
                    Utilisez l'adresse email associée à votre compte SGEP
                  </small>
                </div>

                <button 
                  type="submit" 
                  :disabled="loading" 
                  class="btn btn-success w-100 py-2 fw-bold mb-3"
                  style="background-color: #667eea; border-color: #667eea;"
                >
                  <span v-if="loading">
                    <i class="fas fa-spinner fa-spin me-2"></i>Envoi en cours...
                  </span>
                  <span v-else>
                    <i class="fas fa-paper-plane me-2"></i>Envoyer le lien
                  </span>
                </button>
              </form>

              <!-- Séparateur -->
              <div class="text-center my-3">
                <span class="text-muted">ou</span>
              </div>

              <!-- Bouton retour -->
              <router-link 
                to="/login" 
                class="btn btn-outline-secondary w-100 py-2 text-decoration-none"
              >
                <i class="fas fa-arrow-left me-2"></i>Retour à la connexion
              </router-link>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'

export default {
  name: 'ForgotPasswordView',
  setup() {
    const router = useRouter()
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()
    
    const form = ref({
      email: ''
    })
    
    const loading = ref(false)
    
    const handleForgotPassword = async () => {
      loading.value = true
      try {
        const result = await store.dispatch('auth/forgotPassword', form.value.email)
        if (result.success) {
          notifySuccess('Email de réinitialisation envoyé avec succès ! Vérifiez votre boîte de réception.')
          // Optionnel: rester sur la page pour permettre de renvoyer l'email si nécessaire
          // router.push('/login')
        } else {
          notifyError(result.message || 'Erreur lors de l\'envoi de l\'email de récupération')
        }
      } catch (error) {
        notifyError('Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.')
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      loading,
      handleForgotPassword
    }
  }
}
</script>

<style scoped>
.input-group-text {
  background-color: #f8f9fa !important;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.card {
  border-radius: 10px;
}

.alert-info {
  border-left: 4px solid #17a2b8;
}

/* Animation pour le spinner */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fa-spinner {
  animation: spin 1s linear infinite;
}
</style>