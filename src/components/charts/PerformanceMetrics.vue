<template>
  <div class="performance-metrics">
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="h4 mb-3">
          <i class="fas fa-tachometer-alt me-2"></i>
          Métriques de performance
        </h2>
      </div>
    </div>

    <div class="row">
      <!-- Taux de conformité -->
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <div class="mb-3">
              <div class="progress-circle mx-auto" :style="{ '--progress': complianceRate }">
                <span class="progress-text h4 mb-0">{{ complianceRate }}%</span>
              </div>
            </div>
            <h6 class="card-title mb-2">Taux de conformité</h6>
            <p class="text-muted small mb-0">Sessions réalisées dans les délais</p>
            <div class="mt-2">
              <span class="badge" :class="complianceRate >= 80 ? 'bg-success' : complianceRate >= 60 ? 'bg-warning' : 'bg-danger'">
                {{ getComplianceStatus(complianceRate) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Taux d'activité -->
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <div class="mb-3">
              <div class="progress-circle mx-auto" :style="{ '--progress': activityRate }">
                <span class="progress-text h4 mb-0">{{ activityRate }}%</span>
              </div>
            </div>
            <h6 class="card-title mb-2">Taux d'activité</h6>
            <p class="text-muted small mb-0">Entités actives ce mois</p>
            <div class="mt-2">
              <small class="text-muted">
                {{ stats.activeEntities }} / {{ stats.entities }} entités
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Moyenne formations -->
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <div class="mb-3">
              <i class="fas fa-graduation-cap fs-1 text-info"></i>
            </div>
            <h6 class="card-title mb-2">Formations</h6>
            <h3 class="h2 mb-1 text-info">{{ trainingStats.average_training_days || 0 }}</h3>
            <p class="text-muted small mb-0">Jours moyens de formation</p>
            <div class="mt-2">
              <small class="text-muted">
                {{ trainingStats.total_administrators_trained || 0 }} administrateurs formés
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Sessions moyennes -->
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <div class="mb-3">
              <i class="fas fa-calendar-alt fs-1 text-warning"></i>
            </div>
            <h6 class="card-title mb-2">Sessions mensuelles</h6>
            <h3 class="h2 mb-1 text-warning">{{ averageSessionsPerMonth }}</h3>
            <p class="text-muted small mb-0">Moyenne par mois</p>
            <div class="mt-2">
              <small class="text-success">
                <i class="fas fa-arrow-up me-1"></i>
                +{{ stats.upcomingSessions }} ce mois
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'PerformanceMetrics',
  props: {
    stats: {
      type: Object,
      required: true
    },
    sessionStats: {
      type: Object,
      default: () => ({})
    },
    trainingStats: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const complianceRate = computed(() => {
      const total = props.sessionStats.total_sessions || 0
      const overdue = props.sessionStats.overdue_sessions || 0
      return total > 0 ? Math.round(((total - overdue) / total) * 100) : 100
    })

    const activityRate = computed(() => {
      const total = props.stats.entities || 0
      const active = props.stats.activeEntities || 0
      return total > 0 ? Math.round((active / total) * 100) : 0
    })

    const averageSessionsPerMonth = computed(() => {
      const sessions = props.sessionStats.sessions_by_month || {}
      const monthlyValues = Object.values(sessions)
      if (monthlyValues.length === 0) return 0
      const total = monthlyValues.reduce((sum, value) => sum + value, 0)
      return Math.round(total / monthlyValues.length)
    })

    const getComplianceStatus = (rate) => {
      if (rate >= 80) return 'Excellent'
      if (rate >= 60) return 'Bon'
      return 'À améliorer'
    }

    return {
      complianceRate,
      activityRate,
      averageSessionsPerMonth,
      getComplianceStatus
    }
  }
}
</script>

<style scoped>
.progress-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: conic-gradient(#0d6efd calc(var(--progress) * 1%), #e9ecef 0);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.progress-circle::before {
  content: '';
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: white;
}

.progress-text {
  position: relative;
  z-index: 1;
  color: #0d6efd;
  font-weight: bold;
}
</style>
