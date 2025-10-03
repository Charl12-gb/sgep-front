import { createStore } from 'vuex'
import auth from './modules/auth'
import entities from './modules/entities'
import sessions from './modules/sessions'
import boardDirectors from './modules/boardDirectors'
import accountingOfficers from './modules/accountingOfficers'
import boardCouncils from './modules/boardCouncils'
import users from './modules/users'
import notifications from './modules/notifications'
import permissions from './modules/permissions'
import roles from './modules/role'
import effectifs from './modules/effectifs'
import directionGenerale from './modules/directionGenerale'
import reports from './modules/reports'
import outils from './modules/outils'

export default createStore({
  modules: {
    auth,
    entities,
    sessions,
    boardDirectors,
    accountingOfficers,
    users,
    roles,
    permissions,
    notifications,
    effectifs,
    directionGenerale,
    boardCouncils,
    reports,
    outils
  },
  
  actions: {
    // Action pour initialiser l'application
    async initializeApp({ dispatch }) {
      try {
        // Initialiser les entités au démarrage de l'application
        await dispatch('entities/initializeEntities')
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'application:', error)
      }
    }
  }
})
