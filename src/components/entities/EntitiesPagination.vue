<template>
  <div class="entities-pagination">
    <div class="row align-items-center">
      <!-- Informations de pagination -->
      <div class="col-md-6">
        <div class="d-flex align-items-center gap-3">
          <small class="text-muted">
            Affichage de {{ startItem }} à {{ endItem }} sur {{ total }} entités
          </small>
          
          <!-- Sélecteur de nombre d'éléments par page -->
          <div class="d-flex align-items-center gap-2">
            <small class="text-muted">Afficher:</small>
            <select 
              v-model="currentPerPage" 
              @change="changePerPage"
              class="form-select form-select-sm"
              style="width: auto;"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Navigation de pagination -->
      <div class="col-md-6">
        <nav class="d-flex justify-content-end">
          <ul class="pagination pagination-sm mb-0">
            <!-- Première page -->
            <li :class="['page-item', { 'disabled': currentPage === 1 }]">
              <button 
                @click="goToPage(1)" 
                class="page-link"
                :disabled="currentPage === 1"
                title="Première page"
              >
                <i class="fas fa-angle-double-left"></i>
              </button>
            </li>
            
            <!-- Page précédente -->
            <li :class="['page-item', { 'disabled': currentPage === 1 }]">
              <button 
                @click="goToPage(currentPage - 1)" 
                class="page-link"
                :disabled="currentPage === 1"
                title="Page précédente"
              >
                <i class="fas fa-angle-left"></i>
              </button>
            </li>

            <!-- Pages numérotées -->
            <li
              v-for="page in visiblePages"
              :key="page"
              :class="['page-item', { 'active': page === currentPage }]"
            >
              <button 
                v-if="page !== '...'"
                @click="goToPage(page)" 
                class="page-link"
              >
                {{ page }}
              </button>
              <span v-else class="page-link">...</span>
            </li>

            <!-- Page suivante -->
            <li :class="['page-item', { 'disabled': currentPage === totalPages }]">
              <button 
                @click="goToPage(currentPage + 1)" 
                class="page-link"
                :disabled="currentPage === totalPages"
                title="Page suivante"
              >
                <i class="fas fa-angle-right"></i>
              </button>
            </li>
            
            <!-- Dernière page -->
            <li :class="['page-item', { 'disabled': currentPage === totalPages }]">
              <button 
                @click="goToPage(totalPages)" 
                class="page-link"
                :disabled="currentPage === totalPages"
                title="Dernière page"
              >
                <i class="fas fa-angle-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Navigation rapide (pour mobile) -->
    <div class="row mt-3 d-md-none">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <button 
            @click="goToPage(currentPage - 1)"
            class="btn btn-outline-primary btn-sm"
            :disabled="currentPage === 1"
          >
            <i class="fas fa-angle-left me-1"></i>
            Précédent
          </button>
          
          <span class="text-muted">
            Page {{ currentPage }} sur {{ totalPages }}
          </span>
          
          <button 
            @click="goToPage(currentPage + 1)"
            class="btn btn-outline-primary btn-sm"
            :disabled="currentPage === totalPages"
          >
            Suivant
            <i class="fas fa-angle-right ms-1"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Saut de page rapide -->
    <div v-if="totalPages > 10" class="row mt-3">
      <div class="col-12">
        <div class="d-flex justify-content-center">
          <div class="input-group" style="max-width: 200px;">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input
              v-model="jumpToPage"
              type="number"
              :min="1"
              :max="totalPages"
              class="form-control"
              placeholder="N° page"
              @keyup.enter="goToPage(parseInt(jumpToPage))"
            />
            <button 
              @click="goToPage(parseInt(jumpToPage))"
              class="btn btn-outline-primary"
              :disabled="!isValidJumpPage"
            >
              Aller
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'EntitiesPagination',
  setup() {
    const store = useStore()
    
    const jumpToPage = ref('')
    const currentPerPage = ref(10)

    // Computed
    const pagination = computed(() => store.getters['entities/pagination'])
    const currentPage = computed(() => pagination.value.current_page)
    const totalPages = computed(() => pagination.value.total_pages)
    const total = computed(() => pagination.value.total)
    const perPage = computed(() => pagination.value.per_page)

    const startItem = computed(() => {
      return ((currentPage.value - 1) * perPage.value) + 1
    })

    const endItem = computed(() => {
      return Math.min(currentPage.value * perPage.value, total.value)
    })

    const isValidJumpPage = computed(() => {
      const page = parseInt(jumpToPage.value)
      return page >= 1 && page <= totalPages.value
    })

    const visiblePages = computed(() => {
      const pages = []
      const current = currentPage.value
      const last = totalPages.value
      
      if (last <= 7) {
        // Afficher toutes les pages si moins de 7
        for (let i = 1; i <= last; i++) {
          pages.push(i)
        }
      } else {
        // Logique complexe pour l'affichage des pages
        if (current <= 4) {
          // Début: 1 2 3 4 5 ... last
          for (let i = 1; i <= 5; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(last)
        } else if (current >= last - 3) {
          // Fin: 1 ... last-4 last-3 last-2 last-1 last
          pages.push(1)
          pages.push('...')
          for (let i = last - 4; i <= last; i++) {
            pages.push(i)
          }
        } else {
          // Milieu: 1 ... current-1 current current+1 ... last
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(last)
        }
      }
      
      return pages
    })

    // Methods
    const goToPage = async (page) => {
      if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
        await store.dispatch('entities/goToPage', page)
        jumpToPage.value = ''
      }
    }

    const changePerPage = async () => {
      // Mettre à jour le nombre d'éléments par page et recharger
      await store.commit('entities/SET_PAGINATION', {
        ...pagination.value,
        per_page: currentPerPage.value,
        current_page: 1
      })
      await store.dispatch('entities/fetchEntities')
    }

    // Watchers
    watch(() => pagination.value.per_page, (newPerPage) => {
      currentPerPage.value = newPerPage
    }, { immediate: true })

    return {
      jumpToPage,
      currentPerPage,
      currentPage,
      totalPages,
      total,
      perPage,
      startItem,
      endItem,
      isValidJumpPage,
      visiblePages,
      goToPage,
      changePerPage
    }
  }
}
</script>

<style scoped>
.entities-pagination .pagination .page-link {
  color: var(--bs-primary);
  border-color: #dee2e6;
}

.entities-pagination .pagination .page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.entities-pagination .pagination .page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

.entities-pagination .form-select-sm {
  padding: 0.25rem 1.5rem 0.25rem 0.5rem;
}

@media (max-width: 768px) {
  .entities-pagination .pagination {
    justify-content: center;
  }
  
  .entities-pagination .page-link {
    padding: 0.375rem 0.5rem;
  }
}
</style>
