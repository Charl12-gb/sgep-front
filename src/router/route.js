// Auth routes
const authRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { 
      layout: 'auth',
      requiresAuth: false 
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { 
      layout: 'auth',
      requiresAuth: false 
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/auth/ForgotPasswordView.vue'),
    meta: { 
      layout: 'auth',
      requiresAuth: false 
    }
  }
]

// Dashboard routes
const dashboardRoutes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/entities/EntitiesListView.vue'),
    meta: { 
      requiresAuth: true,
      breadcrumb: 'Tableau de bord'
    }
  }
]

// Entities routes
const entityRoutes = [
  {
    path: '/entities',
    name: 'EntitiesList',
    component: () => import('@/views/entities/EntitiesListView.vue'),
    meta: { 
      requiresAuth: true,
      breadcrumb: 'Entités'
    }
  },
  {
    path: '/entities/create',
    name: 'EntitiesCreate',
    component: () => import('@/views/entities/EntitiesCreateView.vue'),
    meta: { 
      requiresAuth: true,
      breadcrumb: 'Créer une entité'
    }
  },
  {
    path: '/entities/:id',
    name: 'EntitiesShow',
    component: () => import('@/views/entities/EntitiesShowView.vue'),
    meta: { 
      requiresAuth: true,
      breadcrumb: 'Détails de l\'entité'
    }
  },
  {
    path: '/entities/:id/mandates/:councilId',
    name: 'EntityMandateShow',
    component: () => import('@/views/entities/BoardCouncilShowView.vue'),
    meta: {
      requiresAuth: true,
      breadcrumb: 'Mandat'
    }
  },
  {
    path: '/entities/:id/edit',
    name: 'EntitiesEdit',
    component: () => import('@/views/entities/EntitiesEditView.vue'),
    meta: { 
      requiresAuth: true,
      breadcrumb: 'Modifier l\'entité'
    }
  }
]

// Administration routes
const adminRoutes = [
  {
    path: '/users',
    name: 'UsersList',
    component: () => import('@/views/admin/UsersListView.vue'),
    meta: { 
      requiresAuth: true,
      permissions: ['manage_users'],
      breadcrumb: 'Utilisateurs'
    }
  },
  {
    path: '/admin/users',
    name: 'AdminUsersList',
    component: () => import('@/views/admin/UsersListView.vue'),
    meta: { 
      requiresAuth: true,
      permissions: ['manage_users'],
      breadcrumb: 'Gestion des utilisateurs'
    }
  },
  {
    path: '/admin/users/create',
    name: 'AdminUsersCreate',
    component: () => import('@/views/admin/UsersCreateView.vue'),
    meta: { 
      requiresAuth: true,
      permissions: ['manage_users'],
      breadcrumb: 'Créer un utilisateur'
    }
  },
  {
    path: '/admin/users/:id/edit',
    name: 'AdminUsersEdit',
    component: () => import('@/views/admin/UsersEditView.vue'),
    meta: { 
      requiresAuth: true,
      permissions: ['manage_users'],
      breadcrumb: 'Modifier l\'utilisateur'
    }
  },
  {
    path: '/admin/users/:id/activate',
    name: 'AdminUsersActivate',
    component: () => import('@/views/admin/UsersActivateView.vue'),
    meta: { 
      requiresAuth: true,
      permissions: ['manage_users'],
      breadcrumb: 'Activer l\'utilisateur'
    }
  },
  {
    path: '/roles',
    name: 'RolesList',
    component: () => import('@/views/admin/RolesListView.vue'),
    meta: { 
      requiresAuth: true,
      permissions: ['manage_roles'],
      breadcrumb: 'Rôles'
    }
  },
  {
    path: '/admin/roles',
    name: 'AdminRolesList',
    component: () => import('@/views/admin/RolesListView.vue'),
    meta: { 
      requiresAuth: true,
      permissions: ['manage_roles'],
      breadcrumb: 'Gestion des rôles'
    }
  },
  {
    path: '/permissions',
    name: 'PermissionsList',
    component: () => import('@/views/admin/PermissionsListView.vue'),
    meta: { 
      requiresAuth: true,
      permissions: ['manage_permissions'],
      breadcrumb: 'Permissions'
    }
  },
  {
    path: '/admin/permissions',
    name: 'AdminPermissionsList',
    component: () => import('@/views/admin/PermissionsListView.vue'),
    meta: { 
      requiresAuth: true,
      permissions: ['manage_permissions'],
      breadcrumb: 'Gestion des permissions'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/admin/SettingsView.vue'),
    meta: { 
      requiresAuth: true,
      permissions: ['manage_settings'],
      breadcrumb: 'Paramètres'
    }
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: () => import('@/views/admin/SettingsView.vue'),
    meta: { 
      requiresAuth: true,
      permissions: ['manage_settings'],
      breadcrumb: 'Paramètres système'
    }
  }
]

// Profile routes
const profileRoutes = [
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/ProfileView.vue'),
    meta: { 
      requiresAuth: true,
      breadcrumb: 'Mon profil'
    }
  }
]

// Reports routes
const reportsRoutes = [
  {
    path: '/reports-extended',
    name: 'ReportsExtended',
    component: () => import('@/views/ReportsExtendedView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Rapports Avancés'
    }
  },
]

// Error routes
const errorRoutes = [
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/ForbiddenView.vue'),
    meta: { 
      layout: 'auth',
      requiresAuth: false 
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/errors/404View.vue'),
    meta: { 
      layout: 'auth',
      requiresAuth: false 
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

// Combine all routes
const routes = [
  ...authRoutes,
  ...dashboardRoutes,
  ...entityRoutes,
  ...adminRoutes,
  ...profileRoutes,
  ...reportsRoutes,
  ...errorRoutes
]

export default routes