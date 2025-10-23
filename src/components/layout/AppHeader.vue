<template>
  <header class="main-header">
    <!-- Top Header avec logo et navigation principale -->
    <div class="top-header bg-primary">
      <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center py-2">
          <!-- Logo section -->
          <div class="logo-section d-flex align-items-center">
            <div class="logo-container me-3">
              <router-link to="/dashboard" class="logo-link d-flex align-items-center text-white text-decoration-none">
                <img src="/logo.0d7d6044.png" alt="SGEP Logo" class="logo-img me-2" style="height: 40px;">
                <span class="h5 mb-0 fw-bold">SGEP</span>
              </router-link>
            </div>
          </div>
          
          <!-- Navigation principale -->
          <nav class="main-nav d-none d-lg-block">
            <ul class="nav-list d-flex list-unstyled mb-0">
              <li class="nav-item" v-if="user && (user.role.name === 'Super Administrateur' || user.role.name === 'Administrateur')">
                <router-link to="/reports-extended" class="nav-link text-white px-3 py-2" :class="{ active: $route.path === '/reports-extended' }">
                  RAPPORTS
                </router-link>
              </li>
              <li class="nav-item" v-if="user && (user.role.name === 'Super Administrateur' || user.role.name === 'Administrateur')">
                <router-link to="/users" class="nav-link text-white px-3 py-2" :class="{ active: $route.path === '/users' }">
                  UTILISATEURS
                </router-link>
              </li>
            </ul>
          </nav>
          
          <!-- Actions utilisateur -->
          <div class="user-actions d-flex align-items-center">
            <!-- Menu mobile -->
            <button @click="toggleMobileMenu" class="btn btn-outline-light me-3 d-lg-none">
              <i class="fas fa-bars"></i>
            </button>
            
            <!-- Sélecteur d'entité -->
            <div class="entity-selector me-3 d-flex align-items-center">
              <select 
                v-model="selectedEntityId" 
                @change="onEntityChange"
                class="form-select form-select-sm bg-light text-dark"
                style="min-width: 200px;"
                v-if="availableEntities.length > 0 && !isInitializing"
                :disabled="isInitializing"
              >
                <option 
                  v-for="entity in availableEntities" 
                  :key="entity.id" 
                  :value="entity.id"
                >
                  {{ entity.name }} ({{ entity.sigle }})
                </option>
              </select>
              <div v-else-if="isInitializing" class="text-light small">
                Chargement...
              </div>
              
              <!-- Bouton d'ajout d'entité -->
              <router-link 
                v-if="user && (user.role.name === 'Super Administrateur' || user.role.name === 'Administrateur')"
                to="/entities/create" 
                class="btn btn-outline-light btn-sm ms-2"
                title="Créer une nouvelle entité"
              >
                <i class="fas fa-plus"></i>
              </router-link>
            </div>
            
            <!-- Profil utilisateur -->
            <div v-if="user" class="dropdown">
              <button 
                @click="toggleUserMenu"
                class="btn btn-outline-light d-flex align-items-center"
                type="button"
                :class="{ 'active': showUserMenu }"
                ref="userDropdown"
              >
                <div class="bg-light text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px;">
                  <i class="fas fa-user"></i>
                </div>
                <div class="d-none d-md-block text-start me-2">
                  <small class="opacity-75">{{ user.email }}</small>
                </div>
                <i class="fas fa-chevron-down"></i>
              </button>
              
              <ul v-if="showUserMenu" class="dropdown-menu dropdown-menu-end show">
                <li v-if="user && (user.role.name === 'Super Administrateur' || user.role.name === 'Administrateur')">
                  <router-link to="/entities" class="dropdown-item" @click="showUserMenu = false">
                    <i class="fas fa-building me-2"></i>
                    Gestion des Entités
                  </router-link>
                </li>
                <li v-if="user && (user.role.name === 'Super Administrateur' || user.role.name === 'Administrateur')">
                  <hr class="dropdown-divider">
                </li>
                <li>
                  <button @click="logout" class="dropdown-item text-danger">
                    <i class="fas fa-sign-out-alt me-2"></i>
                    Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Menu mobile -->
    <div v-if="showMobileMenu" class="mobile-menu d-lg-none bg-white border-bottom shadow">
      <div class="container-fluid">
        <nav class="mobile-nav py-3">
          <ul class="list-unstyled mb-0">
            <li class="mb-2">
              <a @click="toggleMobileSubmenu('entities')" class="mobile-nav-link d-flex justify-content-between align-items-center">
                <span><i class="fas fa-building me-2"></i>Entités</span>
                <i class="fas fa-chevron-down" :class="{ 'rotate-180': mobileSubmenus.entities }"></i>
              </a>
              <ul v-if="mobileSubmenus.entities" class="list-unstyled ms-4 mt-2">
                <li><router-link to="/entities/create" class="mobile-submenu-link" @click="closeMobileMenu">Nouvelle entité</router-link></li>
              </ul>
            </li>
            <li class="mb-2" v-if="user && (user.role.name === 'Super Administrateur' || user.role.name === 'Administrateur')">
              <router-link to="/entities" class="mobile-nav-link" @click="closeMobileMenu">
                <i class="fas fa-building me-2"></i>
                Gestion des Entités
              </router-link>
            </li>
            <li class="mb-2" v-if="user && (user.role.name === 'Super Administrateur' || user.role.name === 'Administrateur')">
              <router-link to="/reports-extended" class="mobile-nav-link" @click="closeMobileMenu">
                <i class="fas fa-chart-bar me-2"></i>
                Rapports
              </router-link>
            </li>
            <li class="mb-2" v-if="user && (user.role.name === 'Super Administrateur' || user.role.name === 'Administrateur')">
              <router-link to="/users" class="mobile-nav-link" @click="closeMobileMenu">
                <i class="fas fa-users me-2"></i>
                Utilisateurs
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'

export default {
  name: 'AppHeader',
  emits: ['toggle-sidebar'],
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const { notifySuccess } = useNotyf()
    
    const showUserMenu = ref(false)
    const showMobileMenu = ref(false)
    const userDropdown = ref(null)
    const selectedEntityId = ref('')
    const isInitializing = ref(true)
    
    const mobileSubmenus = ref({
      entities: false
    })
    
    const user = computed(() => store.getters['auth/user'])
    const availableEntities = computed(() => store.getters['entities/headerEntities'])
    const selectedEntity = computed(() => store.getters['entities/selectedEntity'])


    
    const toggleMobileMenu = () => {
      showMobileMenu.value = !showMobileMenu.value
      showUserMenu.value = false
    }
    
    const closeMobileMenu = () => {
      showMobileMenu.value = false
    }
    
    const toggleMobileSubmenu = (menu) => {
      mobileSubmenus.value[menu] = !mobileSubmenus.value[menu]
    }
    
    const onEntityChange = async () => {
      if (selectedEntityId.value) {
        await store.dispatch('entities/selectEntityById', selectedEntityId.value)
      }
    }
    
    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
      showMobileMenu.value = false
    }
    
    const logout = async () => {
      try {
        await store.dispatch('auth/logout')
        notifySuccess('Déconnexion réussie')
        router.push('/login')
      } catch (error) {
        router.push('/login')
        console.error('Erreur lors de la déconnexion:', error)
      }
    }
    
    const handleClickOutside = (event) => {
      if (userDropdown.value && !userDropdown.value.closest('.dropdown').contains(event.target)) {
        showUserMenu.value = false
      }
      if (!event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-toggle')) {
        showMobileMenu.value = false
      }
    }
    
    // Watcher pour synchroniser l'ID sélectionné avec l'entité du store
    watch(selectedEntity, (newEntity) => {
      if (newEntity && selectedEntityId.value !== newEntity.id.toString()) {
        selectedEntityId.value = newEntity.id.toString()
      } else if (!newEntity) {
        selectedEntityId.value = ''
      }
    }, { immediate: true })
    
    onMounted(async () => {
      document.addEventListener('click', handleClickOutside)
      
      // Initialiser les entités (chargement + sélection depuis localStorage)
      try {
        await store.dispatch('entities/initializeEntities')
        isInitializing.value = false
      } catch (error) {
        isInitializing.value = false
      }
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    return {
      showUserMenu,
      showMobileMenu,
      userDropdown,
      mobileSubmenus,
      user,
      toggleMobileMenu,
      closeMobileMenu,
      toggleMobileSubmenu,
      toggleUserMenu,
      logout,
      selectedEntityId,
      availableEntities,
      selectedEntity,
      onEntityChange,
      isInitializing
    }
  }
}
</script>

<style scoped>
/* Header principal */
.main-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.top-header {
  background: #1f416f !important; /* Bleu foncé comme sur l'image ANIP */
  min-height: 70px;
}

/* Logo */
.logo-container {
  min-width: 120px;
}

.logo-link {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.logo-link:hover {
  color: #ffffff !important;
  transform: scale(1.02);
  transition: all 0.3s ease;
}

/* Navigation principale */
.main-nav .nav-list {
  align-items: center;
}

.nav-link {
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  position: relative;
  transition: all 0.3s ease;
  border-radius: 0;
  padding: 1rem 1.5rem !important;
  color: #ffffff !important;
}

.nav-link:hover {
  background-color: #2a4d6b;
  color: #ffffff !important;
  transform: none;
}

.nav-link.active {
  background-color: #ffffff;
  color: #1e3a5f !important;
  font-weight: 700;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #1e3a5f;
}

/* Dropdowns */
.dropdown {
  position: relative;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  border-radius: 0;
  padding: 0;
  margin-top: 0;
  min-width: 200px;
  background-color: #ffffff;
}

.dropdown-item {
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  color: #1e3a5f;
  border-bottom: 1px solid #f8f9fa;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #1e3a5f;
  padding-left: 1.5rem;
}

.dropdown-item:active {
  background-color: #1e3a5f;
  color: white;
}

/* Actions utilisateur */
.user-actions .btn {
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border-color: rgba(255, 255, 255, 0.3);
}

.user-actions .btn:hover {
  background-color: #2a4d6b;
  border-color: rgba(255, 255, 255, 0.5);
  transform: none;
}

.user-actions .btn.active {
  background-color: #ffffff;
  border-color: #ffffff;
  color: #1e3a5f !important;
}

/* Menu mobile */
.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  z-index: 999;
  max-height: 70vh;
  overflow-y: auto;
  border-top: 3px solid #1e3a5f;
}

.mobile-nav-link {
  display: block;
  padding: 0.75rem 0;
  color: #1e3a5f;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  cursor: pointer;
}

.mobile-nav-link:hover {
  color: #2a4d6b;
}

.mobile-nav-link.router-link-active {
  color: #1e3a5f;
  font-weight: 700;
}

.mobile-submenu-link {
  display: block;
  padding: 0.5rem 0;
  color: #6c757d;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.mobile-submenu-link:hover {
  color: #1e3a5f;
}

.mobile-submenu-link.router-link-active {
  color: #1e3a5f;
  font-weight: 600;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

/* Breadcrumb */
.breadcrumb-section {
  border-top: 1px solid #dee2e6;
  background-color: #f8f9fa !important;
}

.breadcrumb {
  margin-bottom: 0;
  background: transparent;
}

.breadcrumb-item {
  font-size: 0.9rem;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: "›";
  color: #6c757d;
  font-weight: bold;
}

.breadcrumb-item a {
  color: #1e3a5f;
  font-weight: 500;
}

.breadcrumb-item a:hover {
  color: #2a4d6b;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 991.98px) {
  .main-nav {
    display: none !important;
  }
  
  .logo-text {
    font-size: 1.25rem;
  }
  
  .user-actions .d-none.d-md-block {
    display: none !important;
  }
}

@media (max-width: 575.98px) {
  .top-header .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .breadcrumb-section .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .logo-text {
    font-size: 1.1rem;
  }
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-menu.show {
  animation: slideDown 0.3s ease;
}

.mobile-menu {
  animation: slideDown 0.3s ease;
}

/* Notification badge */
.badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.4rem;
}

/* Couleurs ANIP - Bleu gouvernemental */
.anip-blue-dark { color: #1e3a5f; }
.anip-blue-medium { color: #2a4d6b; }
.anip-blue-light { color: #4a90a4; }

.bg-anip-blue-dark { background-color: #1e3a5f; }
.bg-anip-blue-medium { background-color: #2a4d6b; }
.bg-anip-blue-light { background-color: #4a90a4; }

/* Couleurs Bénin - pour les accents */
.benin-green { color: #008751; }
.benin-yellow { color: #FCD116; }
.benin-red { color: #CE1126; }

.bg-benin-green { background-color: #008751; }
.bg-benin-yellow { background-color: #FCD116; }
.bg-benin-red { background-color: #CE1126; }

/* Effets de survol avancés */
.nav-item {
  position: relative;
}

.nav-item::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: #ffffff;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-item:hover::before {
  width: 80%;
}

.nav-item .nav-link.active::before {
  width: 100%;
  background-color: #1e3a5f;
}
</style>
