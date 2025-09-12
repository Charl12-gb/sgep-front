// Utilities pour Bootstrap avec Vue 3
// Importez ce fichier dans vos composants si nécessaire

export const SGEP_CLASSES = {
  // Cartes
  CARD: 'card card-sgep',
  CARD_HOVER: 'card card-sgep hover-lift',
  CARD_XL: 'card card-sgep card-sgep-xl',
  
  // Boutons
  BTN_PRIMARY: 'btn btn-success btn-sgep',
  BTN_SECONDARY: 'btn btn-secondary btn-sgep',
  BTN_SUCCESS: 'btn btn-success btn-sgep',
  BTN_WARNING: 'btn btn-warning btn-sgep',
  BTN_DANGER: 'btn btn-danger btn-sgep',
  BTN_OUTLINE_PRIMARY: 'btn btn-outline-primary btn-sgep',
  
  // Tailles de boutons
  BTN_SM: 'btn-sgep-sm',
  BTN_LG: 'btn-sgep-lg',
  
  // Formulaires
  FORM_CONTROL: 'form-control form-control-sgep',
  FORM_LABEL: 'form-label form-label-sgep',
  
  // Tables
  TABLE: 'table table-sgep',
  
  // Alertes
  ALERT_PRIMARY: 'alert alert-primary alert-sgep',
  ALERT_SUCCESS: 'alert alert-success alert-sgep',
  ALERT_WARNING: 'alert alert-warning alert-sgep',
  ALERT_DANGER: 'alert alert-danger alert-sgep',
  
  // Status badges
  BADGE_ACTIVE: 'badge badge-status active',
  BADGE_INACTIVE: 'badge badge-status inactive',
  BADGE_PENDING: 'badge badge-status pending',
  BADGE_ERROR: 'badge badge-status error',
  
  // Navigation
  NAV: 'nav nav-sgep',
  
  // Modales
  MODAL: 'modal modal-sgep',
  
  // Grid
  GRID_2: 'grid-sgep grid-sgep-2',
  GRID_3: 'grid-sgep grid-sgep-3',
  GRID_4: 'grid-sgep grid-sgep-4',
  
  // Dashboard
  DASHBOARD_CARD: 'dashboard-card',
  DASHBOARD_HEADER: 'dashboard-header',
  STAT_CARD: 'stat-card',
  STAT_CARD_PRIMARY: 'stat-card primary',
  STAT_CARD_SUCCESS: 'stat-card success',
  STAT_CARD_WARNING: 'stat-card warning',
  STAT_CARD_INFO: 'stat-card info',
  
  // Utilitaires
  LOADING: 'loading-spinner',
  EMPTY_STATE: 'empty-state',
  ANIMATE_FADE_IN: 'animate-fade-in-up'
}

export const SGEP_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  INFO: 'info'
}

export const SGEP_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl'
}

// Helpers pour générer des classes Bootstrap
export const sgepClass = {
  btn: (variant = 'primary', size = null, outline = false) => {
    let classes = ['btn', 'btn-sgep']
    
    if (outline) {
      classes.push(`btn-outline-${variant}`)
    } else {
      classes.push(`btn-${variant}`)
    }
    
    if (size) {
      classes.push(`btn-sgep-${size}`)
    }
    
    return classes.join(' ')
  },
  
  card: (hover = false, shadow = 'md') => {
    let classes = ['card', 'card-sgep']
    
    if (hover) {
      classes.push('hover-lift')
    }
    
    if (shadow === 'xl') {
      classes.push('card-sgep-xl')
    }
    
    return classes.join(' ')
  },
  
  alert: (variant = 'primary') => {
    return `alert alert-${variant} alert-sgep`
  },
  
  badge: (status = 'active') => {
    return `badge badge-status ${status}`
  },
  
  grid: (cols = 2) => {
    return `grid-sgep grid-sgep-${cols}`
  },
  
  statCard: (variant = 'primary') => {
    return `stat-card ${variant}`
  }
}

export default {
  SGEP_CLASSES,
  SGEP_VARIANTS,
  SGEP_SIZES,
  sgepClass
}
