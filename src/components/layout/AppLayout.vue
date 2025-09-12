<template>
  <div class="app-layout">    
    <div class="main-content">
      <AppHeader />
      
      <main class="content">
        <slot />
      </main>
      
      <AppFooter />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'

export default {
  name: 'AppLayout',
  components: {
    AppHeader,
    AppFooter
  },
  setup() {
    return {}
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 0;
  overflow-y: auto;
}
</style>
