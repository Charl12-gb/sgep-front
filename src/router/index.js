import { createRouter, createWebHistory } from 'vue-router'
import jwt_decode from 'jwt-decode'
import store from '@/store'
import routes from './route'

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware global pour vérifier l'authentification et les permissions
router.beforeEach(async (to, from, next) => {
  const accessToken = localStorage.getItem('access_token');
  
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!accessToken) {
      next('/login');
      return;
    }

    try {
      const decoded = jwt_decode(accessToken);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        localStorage.removeItem('access_token');
        store.dispatch('auth/logout');
        next('/login');
        return;
      }

      // Load user data if not already loaded
      if (!store.getters['auth/user']) {
        try {
          await store.dispatch('auth/loadUser');
        } catch (error) {
          console.error('Error loading user:', error);
          // Clear invalid token and redirect to login
          localStorage.removeItem('access_token');
          store.dispatch('auth/logout');
          next('/login');
          return;
        }
      }

      next();
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('access_token');
      store.dispatch('auth/logout');
      next('/login');
    }
  } else {
    // Route doesn't require auth
    if (accessToken && (to.path === '/login' || to.path === '/')) {
      // Redirect authenticated users away from login page
      next('/dashboard');
    } else {
      next();
    }
  }
});

// After each route change
router.afterEach((to, from) => {
  // Update page title
  const appName = 'SGEP';
  const pageTitle = to.meta.breadcrumb || to.name;
  document.title = pageTitle ? `${pageTitle} - ${appName}` : appName;
  
  // Scroll to top
  window.scrollTo(0, 0);
});

export default router