// Helper mixin with common utilities
export default {
  methods: {
    // Format date utilities
    formatDate(date, format = 'short') {
      if (!date) return ''
      
      const dateObj = new Date(date)
      
      switch (format) {
        case 'short':
          return dateObj.toLocaleDateString('fr-FR')
        case 'long':
          return dateObj.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        case 'time':
          return dateObj.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })
        case 'datetime':
          return dateObj.toLocaleDateString('fr-FR') + ' ' + 
                 dateObj.toLocaleTimeString('fr-FR', {
                   hour: '2-digit',
                   minute: '2-digit'
                 })
        default:
          return dateObj.toLocaleDateString('fr-FR')
      }
    },
    
    // Currency formatting
    formatCurrency(amount, currency = 'EUR') {
      if (amount === null || amount === undefined) return ''
      
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency
      }).format(amount)
    },
    
    // Number formatting
    formatNumber(number, decimals = 0) {
      if (number === null || number === undefined) return ''
      
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(number)
    },
    
    // Truncate text
    truncateText(text, length = 50) {
      if (!text) return ''
      if (text.length <= length) return text
      return text.substring(0, length) + '...'
    },
    
    // Capitalize first letter
    capitalize(text) {
      if (!text) return ''
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    },
    
    // Get initials from name
    getInitials(name) {
      if (!name) return ''
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2)
    },
    
    // File size formatting
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    // Debounce function
    debounce(func, wait) {
      let timeout
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    },
    
    // Copy to clipboard
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
        return false
      }
    },
    
    // Validate email
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    
    // Get relative time
    getRelativeTime(date) {
      if (!date) return ''
      
      const now = new Date()
      const diffInSeconds = Math.floor((now - new Date(date)) / 1000)
      
      if (diffInSeconds < 60) {
        return 'À l\'instant'
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
      } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400)
        return `Il y a ${days} jour${days > 1 ? 's' : ''}`
      } else {
        return this.formatDate(date)
      }
    },
    
    // Generate random color
    generateColor(text) {
      const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
      ]
      
      if (!text) return colors[0]
      
      let hash = 0
      for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash)
      }
      
      return colors[Math.abs(hash) % colors.length]
    }
  }
}
