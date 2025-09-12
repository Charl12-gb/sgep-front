<template>
  <div class="card border-0 shadow-sm">
    <div class="card-header bg-white border-0 py-3">
      <h3 class="h6 mb-0">
        <i class="fas fa-chart-line me-2 text-primary"></i>
        {{ title }}
      </h3>
    </div>
    <div class="card-body">
      <BaseChart
        :chart-id="chartId"
        type="line"
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
  name: 'LineChart',
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
    const chartData = computed(() => ({
      labels: props.labels,
      datasets: props.datasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        borderColor: dataset.borderColor || `hsl(${index * 60}, 70%, 50%)`,
        backgroundColor: dataset.backgroundColor || `hsl(${index * 60}, 70%, 50%, 0.1)`,
        borderWidth: 2,
        fill: dataset.fill || false,
        tension: 0.4,
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
            text: 'Période'
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
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      ...props.options
    }))

    return {
      chartData,
      chartOptions
    }
  }
}
</script>
