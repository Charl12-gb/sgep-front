<template>
  <div class="sessions-dashboard">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="mb-0">
        <i class="fas fa-calendar-alt me-2"></i>
        Tableau de bord des sessions
      </h4>
      <button 
        @click="sendReminders" 
        class="btn btn-primary btn-sm"
        :disabled="loading"
      >
        <i class="fas fa-bell me-2"></i>
        Envoyer les rappels
      </button>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else>
      <!-- Statistiques générales -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0">
                  <div class="stat-icon bg-primary">
                    <i class="fas fa-calendar-week text-white"></i>
                  </div>
                </div>
                <div class="flex-grow-1 ms-3">
                  <div class="stat-value">{{ statistics.upcoming_sessions || 0 }}</div>
                  <div class="stat-label">Sessions à venir (7 jours)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0">
                  <div class="stat-icon bg-warning">
                    <i class="fas fa-calendar-day text-white"></i>
                  </div>
                </div>
                <div class="flex-grow-1 ms-3">
                  <div class="stat-value">{{ statistics.today_sessions || 0 }}</div>
                  <div class="stat-label">Sessions aujourd'hui</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0">
                  <div class="stat-icon bg-danger">
                    <i class="fas fa-file-medical-alt text-white"></i>
                  </div>
                </div>
                <div class="flex-grow-1 ms-3">
                  <div class="stat-value">{{ statistics.past_sessions_no_pv || 0 }}</div>
                  <div class="stat-label">PV manquants</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des sessions à venir -->
      <div class="card border-0 shadow-sm" v-if="statistics.upcoming_details && statistics.upcoming_details.length > 0">
        <div class="card-header bg-white border-bottom">
          <h5 class="mb-0">
            <i class="fas fa-clock me-2"></i>
            Sessions à venir
          </h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th class="border-0">Type de session</th>
                  <th class="border-0">Date</th>
                  <th class="border-0">Entité</th>
                  <th class="border-0 text-center">Participants</th>
                  <th class="border-0 text-center">Jours restants</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="session in statistics.upcoming_details" :key="session.id">
                  <td class="align-middle">
                    <span class="badge bg-info">{{ session.type }}</span>
                  </td>
                  <td class="align-middle">
                    <strong>{{ formatDate(session.date) }}</strong>
                  </td>
                  <td class="align-middle">{{ session.entity }}</td>
                  <td class="align-middle text-center">
                    <span class="badge bg-secondary">{{ session.participants }}</span>
                  </td>
                  <td class="align-middle text-center">
                    <span 
                      class="badge"
                      :class="getDaysRemainingClass(session.date)"
                    >
                      {{ getDaysRemaining(session.date) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Message si aucune session -->
      <div v-else class="card border-0 shadow-sm">
        <div class="card-body text-center py-5">
          <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Aucune session programmée</h5>
          <p class="text-muted mb-0">Il n'y a aucune session prévue dans les 7 prochains jours.</p>
        </div>
      </div>

      <!-- Section rappels récents -->
      <div v-if="lastReminderStats" class="card border-0 shadow-sm mt-4">
        <div class="card-header bg-white border-bottom">
          <h5 class="mb-0">
            <i class="fas fa-bell me-2"></i>
            Dernier envoi de rappels
          </h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <div class="text-center">
                <div class="h4 text-primary mb-1">{{ lastReminderStats.sent }}</div>
                <div class="small text-muted">Rappels envoyés</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="text-center">
                <div class="h4 text-warning mb-1">{{ lastReminderStats.processed }}</div>
                <div class="small text-muted">Sessions traitées</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="text-center">
                <div class="h4 text-danger mb-1">{{ lastReminderStats.errors }}</div>
                <div class="small text-muted">Erreurs</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="text-center">
                <div class="h4 text-success mb-1">
                  {{ Math.round((lastReminderStats.sent / Math.max(lastReminderStats.processed, 1)) * 100) }}%
                </div>
                <div class="small text-muted">Taux de succès</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'

export default {
  name: 'SessionsDashboard',
  setup() {
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()
    
    const loading = ref(false)
    const statistics = ref({})
    const lastReminderStats = ref(null)
    
    const loadStatistics = async () => {
      loading.value = true
      try {
        const stats = await store.dispatch('sessions/fetchSessionStatistics')
        statistics.value = stats
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
        notifyError('Erreur lors du chargement des statistiques')
      } finally {
        loading.value = false
      }
    }
    
    const sendReminders = async () => {
      loading.value = true
      try {
        const result = await store.dispatch('sessions/sendSessionReminders')
        lastReminderStats.value = result.statistics
        notifySuccess(`Rappels envoyés avec succès (${result.statistics.sent} envoyés)`)
      } catch (error) {
        console.error('Erreur lors de l\'envoi des rappels:', error)
        notifyError('Erreur lors de l\'envoi des rappels')
      } finally {
        loading.value = false
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return '—'
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    const getDaysRemaining = (dateString) => {
      const sessionDate = new Date(dateString)
      const today = new Date()
      const diffTime = sessionDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Aujourd\'hui'
      if (diffDays === 1) return 'Demain'
      if (diffDays < 0) return 'Passée'
      return `${diffDays} jours`
    }
    
    const getDaysRemainingClass = (dateString) => {
      const sessionDate = new Date(dateString)
      const today = new Date()
      const diffTime = sessionDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 0) return 'bg-danger'
      if (diffDays <= 1) return 'bg-warning'
      if (diffDays <= 3) return 'bg-info'
      return 'bg-success'
    }
    
    onMounted(() => {
      loadStatistics()
    })
    
    return {
      loading,
      statistics,
      lastReminderStats,
      loadStatistics,
      sendReminders,
      formatDate,
      getDaysRemaining,
      getDaysRemainingClass
    }
  }
}
</script>

<style scoped>
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
}

.sessions-dashboard .card {
  transition: transform 0.2s ease-in-out;
}

.sessions-dashboard .card:hover {
  transform: translateY(-2px);
}

.table th {
  font-weight: 600;
  color: #495057;
}

.badge {
  font-size: 0.75em;
}
</style>
