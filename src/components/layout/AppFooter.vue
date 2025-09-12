<template>
  <footer class="footer bg-dark text-light py-4 mt-auto">    
    <div class="container-fluid">
      
      <!-- Ligne de séparation -->
      <div class="benin-flag-line">
        <div class="flag-color flag-green"></div>
        <div class="flag-color flag-yellow"></div>
        <div class="flag-color flag-red"></div>
      </div>
      
      <!-- Copyright -->
      <div class="row align-items-center">
        <div class="col-md-6">
          <a href="#" class="text-muted text-decoration-none small">
            <i class="fas fa-chevron-right me-2"></i>
            Documentation
          </a>
        </div>
        <div class="col-md-6 text-md-end">
         <p class="mb-0 text-muted small">
            SGEP &copy; {{ currentYear }} Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'AppFooter',
  setup() {
    const currentYear = computed(() => new Date().getFullYear())
    const version = '1.0.0' // Version de l'application
    
    return {
      currentYear,
      version
    }
  }
}
</script>

<style scoped>
.benin-flag-line {
  display: flex;
  height: 4px;
  width: 100%;
}

.flag-color {
  flex: 1;
  height: 100%;
}

.flag-green {
  background-color: #008751; /* Vert du drapeau du Bénin */
}

.flag-yellow {
  background-color: #FCD116; /* Jaune du drapeau du Bénin */
}

.flag-red {
  background-color: #CE1126; /* Rouge du drapeau du Bénin */
}

.footer {
  background-color: #2c3e50 !important;
}

.footer h6 {
  font-weight: 600;
  font-size: 0.9rem;
}

.footer a {
  transition: color 0.3s ease;
}

.footer a:hover {
  color: #FCD116 !important; /* Couleur jaune du drapeau au survol */
}

.footer .text-muted {
  color: #bdc3c7 !important;
}

.footer .border-secondary {
  border-color: #495057 !important;
}

.footer {
  transition: all 0.3s ease;
}

/* Style pour les icônes */
.footer i {
  width: 16px;
}
</style>
