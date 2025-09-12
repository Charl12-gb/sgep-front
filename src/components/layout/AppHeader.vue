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
              <li class="nav-item">
                <router-link to="/dashboard" class="nav-link text-white px-3 py-2" active-class="active">
                  TABLEAU DE BORD
                </router-link>
              </li>
              <li class="nav-item dropdown" @mouseenter="showDropdown('entities')" @mouseleave="hideDropdown('entities')">
                <a href="#" class="nav-link text-white px-3 py-2 dropdown-toggle" :class="{ active: isActiveMenu('entities') }">
                  ENTITÉS
                </a>
                <ul v-show="dropdowns.entities" class="dropdown-menu show">
                  <li><router-link to="/entities" class="dropdown-item">Liste des entités</router-link></li>
                  <li><router-link to="/entities/create" class="dropdown-item">Nouvelle entité</router-link></li>
                </ul>
              </li>
              <li class="nav-item">
                <router-link to="/reports-extended" class="nav-link text-white px-3 py-2" active-class="active">
                  RAPPORTS
                </router-link>
              </li>
              <li class="nav-item dropdown" @mouseenter="showDropdown('admin')" @mouseleave="hideDropdown('admin')">
                <a href="#" class="nav-link text-white px-3 py-2 dropdown-toggle" :class="{ active: isActiveMenu('admin') }">
                  ADMINISTRATION
                </a>
                <ul v-show="dropdowns.admin" class="dropdown-menu show">
                  <li><router-link to="/users" class="dropdown-item">Utilisateurs</router-link></li>
                  <li><router-link to="/roles" class="dropdown-item">Rôles</router-link></li>
                  <li><router-link to="/permissions" class="dropdown-item">Permissions</router-link></li>
                  <li><router-link to="/settings" class="dropdown-item">Paramètres</router-link></li>
                </ul>
              </li>
            </ul>
          </nav>
          
          <!-- Actions utilisateur -->
          <div class="user-actions d-flex align-items-center">
            <!-- Menu mobile -->
            <button @click="toggleMobileMenu" class="btn btn-outline-light me-3 d-lg-none">
              <i class="fas fa-bars"></i>
            </button>
            
            <!-- Notifications
            <div class="dropdown me-3">
              <button 
                @click="toggleNotifications" 
                class="btn btn-outline-light position-relative"
                type="button"
                :class="{ 'active': showNotifications }"
                ref="notificationsDropdown"
              >
                <i class="fas fa-bell"></i>
                <span v-if="unreadNotifications > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {{ unreadNotifications }}
                </span>
              </button>
              
              <div v-if="showNotifications" class="dropdown-menu dropdown-menu-end show" style="width: 320px;">
                <div class="dropdown-header d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">Notifications</h6>
                  <button @click="markAllAsRead" class="btn btn-link btn-sm text-primary p-0">
                    Tout marquer comme lu
                  </button>
                </div>
                
                <div class="dropdown-divider"></div>
                
                <div style="max-height: 300px; overflow-y: auto;">
                  <div v-if="notifications.length === 0" class="dropdown-item-text text-center text-muted py-4">
                    Aucune notification
                  </div>
                  
                  <a
                    v-for="notification in notifications"
                    :key="notification.id"
                    href="#"
                    @click.prevent="markAsRead(notification)"
                    class="dropdown-item d-flex align-items-start"
                    :class="{ 'bg-light': !notification.read }"
                  >
                    <div class="me-3 mt-1">
                      <i :class="getNotificationIcon(notification.type)"></i>
                    </div>
                    <div class="flex-grow-1">
                      <p class="mb-1 small">{{ notification.message }}</p>
                      <small class="text-muted">{{ formatTime(notification.created_at) }}</small>
                    </div>
                  </a>
                </div>
                
                <div class="dropdown-divider"></div>
                <div class="dropdown-header text-center">
                  <router-link to="/notifications" class="btn btn-link btn-sm text-primary">
                    Voir toutes les notifications
                  </router-link>
                </div>
              </div>
            </div> -->
            
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
                  <small class="opacity-75">{{ user.role?.name }}</small>
                </div>
                <i class="fas fa-chevron-down"></i>
              </button>
              
              <ul v-if="showUserMenu" class="dropdown-menu dropdown-menu-end show">
                <!-- <li>
                  <router-link to="/profile" class="dropdown-item">
                    <i class="fas fa-user me-2"></i>
                    Mon profil
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li> -->
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
              <router-link to="/dashboard" class="mobile-nav-link" @click="closeMobileMenu">
                <i class="fas fa-tachometer-alt me-2"></i>
                Tableau de bord
              </router-link>
            </li>
            <li class="mb-2">
              <a @click="toggleMobileSubmenu('entities')" class="mobile-nav-link d-flex justify-content-between align-items-center">
                <span><i class="fas fa-building me-2"></i>Entités</span>
                <i class="fas fa-chevron-down" :class="{ 'rotate-180': mobileSubmenus.entities }"></i>
              </a>
              <ul v-if="mobileSubmenus.entities" class="list-unstyled ms-4 mt-2">
                <li><router-link to="/entities" class="mobile-submenu-link" @click="closeMobileMenu">Liste des entités</router-link></li>
                <li><router-link to="/entities/create" class="mobile-submenu-link" @click="closeMobileMenu">Nouvelle entité</router-link></li>
              </ul>
            </li>
            <li class="mb-2">
              <a @click="toggleMobileSubmenu('sessions')" class="mobile-nav-link d-flex justify-content-between align-items-center">
                <span><i class="fas fa-calendar me-2"></i>Sessions</span>
                <i class="fas fa-chevron-down" :class="{ 'rotate-180': mobileSubmenus.sessions }"></i>
              </a>
              <ul v-if="mobileSubmenus.sessions" class="list-unstyled ms-4 mt-2">
                <li><router-link to="/sessions" class="mobile-submenu-link" @click="closeMobileMenu">Liste des sessions</router-link></li>
              </ul>
            </li>
            <li class="mb-2">
              
            </li>
            <li class="mb-2">
              <a @click="toggleMobileSubmenu('analytics')" class="mobile-nav-link d-flex justify-content-between align-items-center">
                <span><i class="fas fa-chart-bar me-2"></i>Analyses</span>
                <i class="fas fa-chevron-down" :class="{ 'rotate-180': mobileSubmenus.analytics }"></i>
              </a>
              <ul v-if="mobileSubmenus.analytics" class="list-unstyled ms-4 mt-2">
                <li><router-link to="/statistics" class="mobile-submenu-link" @click="closeMobileMenu">Statistiques</router-link></li>
                <li><router-link to="/reports" class="mobile-submenu-link" @click="closeMobileMenu">Rapports</router-link></li>
                <li><router-link to="/reports-extended" class="mobile-submenu-link" @click="closeMobileMenu">Rapports Avancés</router-link></li>
              </ul>
            </li>
            <li class="mb-2">
              <a @click="toggleMobileSubmenu('admin')" class="mobile-nav-link d-flex justify-content-between align-items-center">
                <span><i class="fas fa-cog me-2"></i>Administration</span>
                <i class="fas fa-chevron-down" :class="{ 'rotate-180': mobileSubmenus.admin }"></i>
              </a>
              <ul v-if="mobileSubmenus.admin" class="list-unstyled ms-4 mt-2">
                <li><router-link to="/users" class="mobile-submenu-link" @click="closeMobileMenu">Utilisateurs</router-link></li>
                <li><router-link to="/roles" class="mobile-submenu-link" @click="closeMobileMenu">Rôles</router-link></li>
                <li><router-link to="/permissions" class="mobile-submenu-link" @click="closeMobileMenu">Permissions</router-link></li>
                <li><router-link to="/settings" class="mobile-submenu-link" @click="closeMobileMenu">Paramètres</router-link></li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    
    <!-- Breadcrumb -->
    <div class="breadcrumb-section bg-light border-bottom">
      <div class="container-fluid">
        <nav aria-label="breadcrumb" class="py-2">
          <ol class="breadcrumb mb-0">
            <li v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
              <router-link v-if="crumb.to && index < breadcrumbs.length - 1" :to="crumb.to" class="text-decoration-none">
                {{ crumb.text }}
              </router-link>
              <span v-else class="text-muted">{{ crumb.text }}</span>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
    
    const showNotifications = ref(false)
    const showUserMenu = ref(false)
    const showMobileMenu = ref(false)
    const notificationsDropdown = ref(null)
    const userDropdown = ref(null)
    
    const dropdowns = ref({
      entities: false,
      sessions: false,
      trainings: false,
      analytics: false,
      admin: false
    })
    
    const mobileSubmenus = ref({
      entities: false,
      sessions: false,
      trainings: false,
      analytics: false,
      admin: false
    })
    
    const user = computed(() => store.getters['auth/user'])
    const notifications = computed(() => store.getters['notifications/notifications'])
    const unreadNotifications = computed(() => store.getters['notifications/unreadCount'])
    
    const breadcrumbs = computed(() => {
      const matched = route.matched.filter(item => item.meta && item.meta.breadcrumb)
      const crumbs = []
      
      // Add home breadcrumb
      crumbs.push({ text: 'Accueil', to: '/dashboard' })
      
      // Generate breadcrumbs from route
      if (route.path !== '/dashboard') {
        const pathSegments = route.path.split('/').filter(segment => segment)
        
        pathSegments.forEach((segment, index) => {
          const routePath = '/' + pathSegments.slice(0, index + 1).join('/')
          const breadcrumbText = getBreadcrumbText(segment, route.params)
          
          if (index === pathSegments.length - 1) {
            crumbs.push({ text: breadcrumbText })
          } else {
            crumbs.push({ text: breadcrumbText, to: routePath })
          }
        })
      }
      
      return crumbs
    })
    
    const getBreadcrumbText = (segment, params) => {
      const breadcrumbMap = {
        entities: 'Entités',
        'board-members': 'Membres du Conseil',
        sessions: 'Sessions',
        'accounting-officers': 'Agents Comptables',
        documents: 'Documents',
        users: 'Utilisateurs',
        roles: 'Rôles',
        permissions: 'Permissions',
        reports: 'Rapports',
        statistics: 'Statistiques',
        create: 'Créer',
        edit: 'Modifier',
        planning: 'Planning',
        pv: 'Procès-verbaux',
        attendance: 'Présence',
        participants: 'Participants',
        calendar: 'Calendrier',
        archive: 'Archives'
      }
      
      // Handle ID parameters
      if (segment.match(/^[\w-]+$/)) {
        return breadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      }
      
      return `#${segment}`
    }
    
    const showDropdown = (menu) => {
      dropdowns.value[menu] = true
    }
    
    const hideDropdown = (menu) => {
      setTimeout(() => {
        dropdowns.value[menu] = false
      }, 200)
    }
    
    const isActiveMenu = (path) => {
      return route.path.includes(path)
    }
    
    const toggleMobileMenu = () => {
      showMobileMenu.value = !showMobileMenu.value
      showNotifications.value = false
      showUserMenu.value = false
    }
    
    const closeMobileMenu = () => {
      showMobileMenu.value = false
    }
    
    const toggleMobileSubmenu = (menu) => {
      mobileSubmenus.value[menu] = !mobileSubmenus.value[menu]
    }
    
    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value
      showUserMenu.value = false
      showMobileMenu.value = false
    }
    
    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
      showNotifications.value = false
      showMobileMenu.value = false
    }
    
    const markAllAsRead = async () => {
      try {
        await store.dispatch('notifications/markAllAsRead')
      } catch (error) {
        console.error('Erreur lors du marquage des notifications:', error)
      }
    }
    
    const markAsRead = async (notification) => {
      if (!notification.read) {
        try {
          await store.dispatch('notifications/markAsRead', notification.id)
        } catch (error) {
          console.error('Erreur lors du marquage de la notification:', error)
        }
      }
    }
    
    const getNotificationIcon = (type) => {
      const icons = {
        info: 'fas fa-info-circle text-info',
        success: 'fas fa-check-circle text-success',
        warning: 'fas fa-exclamation-triangle text-warning',
        error: 'fas fa-times-circle text-danger',
        session: 'fas fa-calendar text-primary',
        entity: 'fas fa-building text-primary',
        board_director: 'fas fa-users text-primary'
      }
      return icons[type] || 'fas fa-bell text-info'
    }
    
    const formatTime = (date) => {
      const now = new Date()
      const notificationDate = new Date(date)
      const diffInSeconds = Math.floor((now - notificationDate) / 1000)
      
      if (diffInSeconds < 60) {
        return 'À l\'instant'
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
      } else {
        return notificationDate.toLocaleDateString('fr-FR')
      }
    }
    
    const logout = async () => {
      try {
        await store.dispatch('auth/logout')
        notifySuccess('Déconnexion réussie')
        router.push('/login')
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
      }
    }
    
    const handleClickOutside = (event) => {
      if (notificationsDropdown.value && !notificationsDropdown.value.closest('.dropdown').contains(event.target)) {
        showNotifications.value = false
      }
      if (userDropdown.value && !userDropdown.value.closest('.dropdown').contains(event.target)) {
        showUserMenu.value = false
      }
      if (!event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-toggle')) {
        showMobileMenu.value = false
      }
    }
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    return {
      showNotifications,
      showUserMenu,
      showMobileMenu,
      notificationsDropdown,
      userDropdown,
      dropdowns,
      mobileSubmenus,
      user,
      notifications,
      unreadNotifications,
      breadcrumbs,
      showDropdown,
      hideDropdown,
      isActiveMenu,
      toggleMobileMenu,
      closeMobileMenu,
      toggleMobileSubmenu,
      toggleNotifications,
      toggleUserMenu,
      markAllAsRead,
      markAsRead,
      getNotificationIcon,
      formatTime,
      logout
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
