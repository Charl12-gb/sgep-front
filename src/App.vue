<template>
  <div id="app">
    <template v-if="$route.meta.layout === 'auth'">
      <router-view />
    </template>
    
    <template v-else>
      <AppLayout>
        <router-view />
      </AppLayout>
    </template>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import AppLayout from '@/components/layout/AppLayout.vue'

export default {
  name: 'App',
  components: {
    AppLayout
  },
  setup() {
    const store = useStore()
    
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    
    return {
      isAuthenticated
    }
  }
}
</script>