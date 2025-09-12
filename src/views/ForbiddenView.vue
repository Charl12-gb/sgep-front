<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-icon">
        <i class="fas fa-ban"></i>
      </div>
      
      <div class="error-content">
        <h1 class="error-title">Accès refusé</h1>
        <h2 class="error-code">Erreur 403</h2>
        
        <p class="error-message">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        
        <div class="error-details">
          <p>Cette page nécessite des permissions d'administration que vous ne possédez pas actuellement.</p>
          <p>Si vous pensez que c'est une erreur, contactez votre administrateur système.</p>
        </div>
        
        <div class="error-actions">
          <button @click="goBack" class="btn btn-outline">
            <i class="fas fa-arrow-left"></i>
            Retour
          </button>
          
          <button @click="goHome" class="btn btn-success">
            <i class="fas fa-home"></i>
            Accueil
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'ForbiddenView',
  setup() {
    const router = useRouter()
    
    const goBack = () => {
      if (window.history.length > 1) {
        router.go(-1)
      } else {
        router.push('/dashboard')
      }
    }
    
    const goHome = () => {
      router.push('/dashboard')
    }
    
    return {
      goBack,
      goHome
    }
  }
}
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.error-container {
  text-align: center;
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.error-icon {
  margin-bottom: 30px;
}

.error-icon i {
  font-size: 100px;
  color: #e74c3c;
  opacity: 0.8;
}

.error-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}

.error-code {
  font-size: 24px;
  font-weight: 500;
  color: #e74c3c;
  margin-bottom: 30px;
}

.error-message {
  font-size: 18px;
  color: #5a6c7d;
  margin-bottom: 30px;
  line-height: 1.6;
}

.error-details {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 40px;
  border-left: 4px solid #e74c3c;
}

.error-details p {
  margin: 0 0 10px 0;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
}

.error-details p:last-child {
  margin-bottom: 0;
}

.error-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;
  font-size: 16px;
}



.btn-outline {
  background: transparent;
  color: #6c757d;
  border-color: #dee2e6;
}

.btn-outline:hover {
  background: #f8f9fa;
  color: #495057;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .error-container {
    padding: 40px 20px;
  }
  
  .error-title {
    font-size: 28px;
  }
  
  .error-code {
    font-size: 20px;
  }
  
  .error-message {
    font-size: 16px;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
