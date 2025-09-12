<template>
  <div class="card border-0 shadow-sm">
    <div class="card-header bg-white border-0 py-3">
      <h3 class="h6 mb-0">
        <i class="fas fa-chart-bar me-2 text-primary"></i>
        {{ title }}
      </h3>
    </div>
    <div class="card-body">
      <BaseChart
        :chart-id="chartId"
        type="bar"
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
  name: 'BarChart',
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
    datasets: {
      type: Array,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const colors = [
      '#0d6efd', '#6f42c1', '#d63384', '#dc3545', '#fd7e14',
      '#ffc107', '#198754', '#20c997', '#0dcaf0', '#6c757d'
    ]

    const chartData = computed(() => ({
      labels: props.labels,
      datasets: props.datasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.backgroundColor || colors[index % colors.length],
        borderColor: dataset.borderColor || colors[index % colors.length],
        borderWidth: 1,
        ...dataset
      }))
    }))

    const chartOptions = computed(() => ({
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Catégories'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Valeur'
          },
          beginAtZero: true
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      ...props.options
    }))

    return {
      chartData,
      chartOptions
    }
  }
}
</script>
