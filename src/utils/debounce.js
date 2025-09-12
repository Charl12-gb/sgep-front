/**
 * Fonction debounce pour limiter la fréquence d'exécution d'une fonction
 * Utile pour les champs de recherche, redimensionnement de fenêtre, etc.
 * 
 * @param {Function} func - La fonction à débouncer
 * @param {number} delay - Le délai en millisecondes
 * @param {boolean} immediate - Si true, déclenche la fonction au début au lieu de la fin
 * @returns {Function} - La fonction débouncée
 */
export function debounce(func, delay = 300, immediate = false) {
  let timeoutId
  
  return function executedFunction(...args) {
    const later = () => {
      timeoutId = null
      if (!immediate) func.apply(this, args)
    }
    
    const callNow = immediate && !timeoutId
    
    clearTimeout(timeoutId)
    timeoutId = setTimeout(later, delay)
    
    if (callNow) func.apply(this, args)
  }
}

/**
 * Fonction throttle pour limiter l'exécution d'une fonction à une fois par période
 * Utile pour les événements de scroll, mousemove, etc.
 * 
 * @param {Function} func - La fonction à throttler
 * @param {number} limit - La limite en millisecondes
 * @returns {Function} - La fonction throttlée
 */
export function throttle(func, limit = 100) {
  let inThrottle
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Export par défaut pour compatibilité
export default debounce
