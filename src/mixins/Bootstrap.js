// Mixin Bootstrap pour Vue 3
// Provides Bootstrap utilities to all components

import { SGEP_CLASSES, SGEP_VARIANTS, SGEP_SIZES, sgepClass } from '@/utils/bootstrap-utils'

export default {
  data() {
    return {
      // Classes Bootstrap prêtes à utiliser
      bs: SGEP_CLASSES,
      bsVariants: SGEP_VARIANTS,
      bsSizes: SGEP_SIZES
    }
  },
  
  methods: {
    // Générateurs de classes Bootstrap
    btnClass(variant = 'primary', size = null, outline = false) {
      return sgepClass.btn(variant, size, outline)
    },
    
    cardClass(hover = false, shadow = 'md') {
      return sgepClass.card(hover, shadow)
    },
    
    alertClass(variant = 'primary') {
      return sgepClass.alert(variant)
    },
    
    badgeClass(status = 'active') {
      return sgepClass.badge(status)
    },
    
    gridClass(cols = 2) {
      return sgepClass.grid(cols)
    },
    
    statCardClass(variant = 'primary') {
      return sgepClass.statCard(variant)
    },
    
    // Utilitaires pour les icônes
    iconClass(variant = 'primary') {
      return `icon-${variant}`
    },
    
    // Utilitaires pour les couleurs de texte
    textVariant(variant = 'primary') {
      return `text-${variant}`
    },
    
    // Utilitaires pour les backgrounds
    bgVariant(variant = 'primary', gradient = false) {
      if (gradient) {
        return `bg-gradient-${variant}`
      }
      return `bg-${variant}`
    },
    
    // Générateur de classes responsive
    responsiveClass(baseClass, breakpoint = 'md') {
      return `${baseClass} ${baseClass}-${breakpoint}`
    },
    
    // Classes de status pour les éléments
    statusClass(status = 'active') {
      const statusClasses = {
        active: 'text-success',
        inactive: 'text-secondary',
        pending: 'text-warning',
        error: 'text-danger',
        success: 'text-success',
        warning: 'text-warning',
        danger: 'text-danger',
        info: 'text-info'
      }
      return statusClasses[status] || 'text-secondary'
    },
    
    // Helper pour les tailles
    sizeClass(component, size = 'md') {
      if (size === 'md') return ''
      return `${component}-${size}`
    },
    
    // Helper pour les espacements Bootstrap
    spacingClass(type, size, side = null) {
      // type: m (margin), p (padding)
      // size: 0-5
      // side: t (top), b (bottom), l (left), r (right), x (horizontal), y (vertical)
      let cls = type
      if (side) cls += side
      cls += `-${size}`
      return cls
    },
    
    // Helper pour les flex utilities
    flexClass(direction = 'row', justify = 'start', align = 'start', wrap = false) {
      let classes = ['d-flex']
      
      if (direction !== 'row') {
        classes.push(`flex-${direction}`)
      }
      
      if (justify !== 'start') {
        classes.push(`justify-content-${justify}`)
      }
      
      if (align !== 'start') {
        classes.push(`align-items-${align}`)
      }
      
      if (wrap) {
        classes.push('flex-wrap')
      }
      
      return classes.join(' ')
    },
    
    // Helper pour les positions
    positionClass(position = 'relative') {
      return `position-${position}`
    },
    
    // Helper pour les displays
    displayClass(display = 'block', breakpoint = null) {
      if (breakpoint) {
        return `d-${breakpoint}-${display}`
      }
      return `d-${display}`
    },
    
    // Helper pour les bordures
    borderClass(sides = '', color = '', radius = '') {
      let classes = []
      
      if (sides) {
        if (sides === 'all') {
          classes.push('border')
        } else {
          sides.split('').forEach(side => {
            const sideMap = { t: 'top', b: 'bottom', l: 'start', r: 'end' }
            classes.push(`border-${sideMap[side] || side}`)
          })
        }
      }
      
      if (color) {
        classes.push(`border-${color}`)
      }
      
      if (radius) {
        classes.push(`rounded-${radius}`)
      }
      
      return classes.join(' ')
    },
    
    // Helper pour les shadows
    shadowClass(size = 'sm') {
      return `shadow-${size}`
    }
  }
}
