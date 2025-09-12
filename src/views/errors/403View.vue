<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-code">403</div>
      <div class="error-title">Accès refusé</div>
      <div class="error-message">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </div>
      <div class="error-actions">
        <router-link to="/dashboard" class="btn btn-success">
          <i class="fas fa-home"></i>
          Retour au tableau de bord
        </router-link>
        <button @click="goBack" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i>
          Retour
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ForbiddenView',
  methods: {
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.error-container {
  text-align: center;
  max-width: 500px;
  padding: 2rem;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.error-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
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
  font-size: 1rem;
  gap: 0.5rem;
}

.btn-secondary {
  background-color: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 250px;
    justify-content: center;
  }
}
</style>
