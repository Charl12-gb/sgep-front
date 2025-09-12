<template>
  <div class="chart-container">
    <canvas :id="chartId" :width="width" :height="height"></canvas>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController,
  BarController,
  LineController
} from 'chart.js'

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController,
  BarController,
  LineController
)

export default {
  name: 'BaseChart',
  props: {
    chartId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    },
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 200
    }
  },
  setup(props) {
    let chart = null

    const createChart = () => {
      const ctx = document.getElementById(props.chartId)
      if (ctx && !chart) {
        chart = new ChartJS(ctx, {
          type: props.type,
          data: props.data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            ...props.options
          }
        })
      }
    }

    const updateChart = () => {
      if (chart) {
        chart.data = props.data
        chart.options = {
          responsive: true,
          maintainAspectRatio: false,
          ...props.options
        }
        chart.update()
      }
    }

    const destroyChart = () => {
      if (chart) {
        chart.destroy()
        chart = null
      }
    }

    onMounted(() => {
      createChart()
    })

    onBeforeUnmount(() => {
      destroyChart()
    })

    watch(() => props.data, updateChart, { deep: true })
    watch(() => props.options, updateChart, { deep: true })

    return {}
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
}
</style>
