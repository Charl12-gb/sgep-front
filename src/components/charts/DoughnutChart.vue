<template>
  <div class="card border-0 shadow-sm">
    <div class="card-header bg-white border-0 py-3">
      <h3 class="h6 mb-0">
        <i class="fas fa-chart-pie me-2 text-primary"></i>
        {{ title }}
      </h3>
    </div>
    <div class="card-body">
      <BaseChart
        :chart-id="chartId"
        type="doughnut"
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

export default {
  name: 'DoughnutChart',
  components: {
    BaseChart
  },
  props: {
    title: {
      type: String,
      required: true
    },
    chartId: {
      type: String,
      required: true
    },
    labels: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    colors: {
      type: Array,
      default: () => [
        '#0d6efd', '#6f42c1', '#d63384', '#dc3545', '#fd7e14',
        '#ffc107', '#198754', '#20c997', '#0dcaf0', '#6c757d'
      ]
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const chartData = computed(() => ({
      labels: props.labels,
      datasets: [{
        data: props.data,
        backgroundColor: props.colors.slice(0, props.data.length),
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 4
      }]
    }))

    const chartOptions = computed(() => ({
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = Math.round((context.parsed / total) * 100)
              return `${context.label}: ${context.parsed} (${percentage}%)`
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      ...props.options
    }))

    return {
      chartData,
      chartOptions
    }
  }
}
</script>
