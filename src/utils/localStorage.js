/**
 * Utilitaire pour gérer localStorage de manière sécurisée
 */

export const localStorageUtil = {
  /**
   * Sauvegarde une valeur dans localStorage
   * @param {string} key - Clé de stockage
   * @param {any} value - Valeur à stocker
   */
  set(key, value) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const serializedValue = JSON.stringify(value)
        localStorage.setItem(key, serializedValue)
      }
    } catch (error) {
      console.warn(`Erreur lors de la sauvegarde dans localStorage (${key}):`, error)
    }
  },

  /**
   * Récupère une valeur depuis localStorage
   * @param {string} key - Clé de stockage
   * @param {any} defaultValue - Valeur par défaut si la clé n'existe pas
   * @returns {any} - Valeur récupérée ou valeur par défaut
   */
  get(key, defaultValue = null) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = localStorage.getItem(key)
        if (item === null) return defaultValue
        return JSON.parse(item)
      }
      return defaultValue
    } catch (error) {
      console.warn(`Erreur lors de la lecture dans localStorage (${key}):`, error)
      return defaultValue
    }
  },

  /**
   * Supprime une valeur de localStorage
   * @param {string} key - Clé à supprimer
   */
  remove(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Erreur lors de la suppression dans localStorage (${key}):`, error)
    }
  },

  /**
   * Vérifie si localStorage est disponible
   * @returns {boolean}
   */
  isAvailable() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false
      }
      // Test avec une clé temporaire
      const testKey = '__localStorage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch (error) {
      return false
    }
  }
}

// Clés de localStorage utilisées dans l'application
export const STORAGE_KEYS = {
  SELECTED_ENTITY_ID: 'selectedEntityId',
  SELECTED_ENTITY: 'selectedEntity',
  USER: 'user',
  ACCESS_TOKEN: 'access_token'
}