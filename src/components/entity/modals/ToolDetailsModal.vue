<template>
  <div class="modal-container">
    <div class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-info-circle me-2"></i>
              Détails de l'outil
            </h5>
            <button type="button" class="btn-close" @click="$emit('close')"></button>
          </div>
          
          <div class="modal-body">
            <div v-if="tool">
              <!-- Informations générales -->
              <div class="row mb-4">
                <div class="col-md-8">
                  <h4 class="mb-2">{{ tool.label }}</h4>
                  <p class="text-muted mb-3" v-if="tool.description">
                    {{ tool.description }}
                  </p>
                </div>
                <div class="col-md-4">
                  <div class="d-flex flex-column gap-2">
                    <span :class="getTypeClass(tool.type)" class="badge">
                      {{ getTypeLabel(tool.type) }}
                    </span>
                    <span class="badge bg-secondary">
                      {{ tool.category || 'Sans catégorie' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Statut et réponse actuelle -->
              <div class="card mb-4">
                <div class="card-header">
                  <h6 class="card-title mb-0">
                    <i class="fas fa-clipboard-check me-2"></i>
                    Statut et Réponse
                  </h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-3">
                      <strong>Statut:</strong>
                      <br>
                      <span :class="getStatusClass(tool.response)" class="badge mt-1">
                        {{ getStatusLabel(tool.response) }}
                      </span>
                    </div>
                    <div class="col-md-9">
                      <strong>Réponse actuelle:</strong>
                      <div class="mt-2">
                        <div v-if="tool.response">
                          <!-- Réponse Boolean -->
                          <div v-if="tool.type === 'boolean' && tool.response.reponse_boolean !== null">
                            <span :class="tool.response.reponse_boolean ? 'text-success' : 'text-danger'">
                              <i :class="tool.response.reponse_boolean ? 'fas fa-check' : 'fas fa-times'"></i>
                              {{ tool.response.reponse_boolean ? 'Oui' : 'Non' }}
                            </span>
                          </div>
                          
                          <!-- Réponse Text -->
                          <div v-else-if="tool.type === 'text' && tool.response.reponse_text">
                            <div class="border rounded p-3 bg-light">
                              {{ tool.response.reponse_text }}
                            </div>
                          </div>
                          
                          <!-- Réponse Number -->
                          <div v-else-if="tool.type === 'number' && tool.response.reponse_number !== null">
                            <span class="fw-bold">{{ tool.response.reponse_number }}</span>
                          </div>
                          
                          <!-- Réponse Date -->
                          <div v-else-if="tool.type === 'date' && tool.response.reponse_date">
                            <span>{{ formatDate(tool.response.reponse_date) }}</span>
                          </div>
                          
                          <!-- Réponse List -->
                          <div v-else-if="tool.type === 'list' && tool.response.reponse_list && tool.response.reponse_list.length > 0">
                            <!-- Liste d'objets structurés -->
                            <div v-if="isStructuredList(tool.response.reponse_list)">
                              <div class="alert alert-info d-flex align-items-center mb-3">
                                <i class="fas fa-database me-2"></i>
                                <span>Liste structurée ({{ tool.response.reponse_list.length }} élément(s))</span>
                              </div>
                              <StructuredDetailsDisplay 
                                :details="tool.response.reponse_list"
                                :template="currentTemplate"
                              />
                            </div>
                            <!-- Liste simple -->
                            <div v-else>
                              <ul class="list-group list-group-flush">
                                <li v-for="(item, index) in tool.response.reponse_list" :key="index" class="list-group-item py-2">
                                  <i class="fas fa-chevron-right text-primary me-2"></i>
                                  {{ item }}
                                </li>
                              </ul>
                            </div>
                          </div>
                          
                          <!-- Aucune réponse -->
                          <div v-else>
                            <span class="text-muted fst-italic">Aucune réponse fournie</span>
                          </div>
                        </div>
                        <div v-else>
                          <span class="text-muted fst-italic">Aucune réponse enregistrée</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Détails supplémentaires -->
              <div v-if="tool.response && tool.response.details" class="card mb-4">
                <div class="card-header">
                  <h6 class="card-title mb-0">
                    <i class="fas fa-database me-2"></i>
                    {{ getDetailsTitle() }}
                  </h6>
                </div>
                <div class="card-body">
                  <!-- Affichage des détails structurés -->
                  <div v-if="isStructuredDetails(tool.response.details)">
                    <StructuredDetailsDisplay 
                      :details="tool.response.details"
                      :template="currentTemplate"
                    />
                  </div>
                  <!-- Affichage des détails texte (legacy) -->
                  <div v-else class="border rounded p-3 bg-light">
                    <div class="d-flex align-items-center mb-2">
                      <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                      <small class="text-muted">Données en format texte (legacy)</small>
                    </div>
                    <div class="text-break">{{ tool.response.details }}</div>
                  </div>
                </div>
              </div>

              <!-- Métadonnées -->
              <div class="card mb-4">
                <div class="card-header">
                  <h6 class="card-title mb-0">
                    <i class="fas fa-info me-2"></i>
                    Informations techniques
                  </h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <dl class="row">
                        <dt class="col-sm-5">ID Outil:</dt>
                        <dd class="col-sm-7">{{ tool.id }}</dd>
                        
                        <dt class="col-sm-5">Catégorie:</dt>
                        <dd class="col-sm-7">{{ tool.category || 'Non définie' }}</dd>
                        
                        <dt class="col-sm-5">Type:</dt>
                        <dd class="col-sm-7">{{ tool.type }}</dd>
                        
                        <dt class="col-sm-5">Créé le:</dt>
                        <dd class="col-sm-7">{{ formatDate(tool.created_at) }}</dd>
                      </dl>
                    </div>
                    <div class="col-md-6" v-if="tool.response">
                      <dl class="row">
                        <dt class="col-sm-6">ID Réponse:</dt>
                        <dd class="col-sm-6">{{ tool.response.id }}</dd>
                        
                        <dt class="col-sm-6">Répondu le:</dt>
                        <dd class="col-sm-6">{{ formatDate(tool.response.created_at) }}</dd>
                        
                        <dt class="col-sm-6">Modifié le:</dt>
                        <dd class="col-sm-6">{{ formatDate(tool.response.updated_at) }}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              Fermer
            </button>
            <button 
              type="button" 
              @click="editResponse"
              class="btn btn-success"
              v-if="tool">
              <i class="fas fa-edit me-2"></i>
              {{ tool.response ? 'Modifier la réponse' : 'Ajouter une réponse' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { computed } from 'vue'
import StructuredDetailsDisplay from '../components/StructuredDetailsDisplay.vue'
import { getTemplateForOutil } from '@/utils/outilsTemplates'

export default {
  name: 'ToolDetailsModal',
  components: {
    StructuredDetailsDisplay
  },
  props: {
    tool: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'edit-response'],
  setup(props, { emit }) {
    
    // Template dynamique basé sur le type d'outil
    const currentTemplate = computed(() => {
      if (props.tool && props.tool.code) {
        return getTemplateForOutil(props.tool.code)
      }
      return getTemplateForOutil('default')
    })

    // Vérifier si les détails sont structurés
    const isStructuredDetails = (details) => {
      return details && (typeof details === 'object') && details !== null
    }

    // Vérifier si une liste contient des objets structurés
    const isStructuredList = (list) => {
      return Array.isArray(list) && list.length > 0 && 
             typeof list[0] === 'object' && list[0] !== null
    }

    // Obtenir le titre approprié pour les détails
    const getDetailsTitle = () => {
      if (props.tool && props.tool.code) {
        const code = props.tool.code.toLowerCase()
        if (code.includes('formation')) {
          return 'Détails des formations'
        }
        if (code.includes('comite') || code.includes('commission')) {
          return 'Composition des comités'
        }
        if (code.includes('suivi')) {
          return 'Suivi des décisions'
        }
        if (code.includes('plan') && code.includes('strategique')) {
          return 'Détails du plan stratégique'
        }
        if (code.includes('contrat') && code.includes('objectif')) {
          return 'Détails du contrat d\'objectifs'
        }
      }
      return 'Détails structurés'
    }
    
    // Méthodes utilitaires
    const getTypeClass = (type) => {
      const classes = {
        boolean: 'bg-primary',
        text: 'bg-info',
        number: 'bg-warning',
        date: 'bg-success',
        list: 'bg-secondary'
      }
      return classes[type] || 'bg-dark'
    }

    const getTypeLabel = (type) => {
      const labels = {
        boolean: 'Oui/Non',
        text: 'Texte',
        number: 'Nombre',
        date: 'Date',
        list: 'Liste'
      }
      return labels[type] || type
    }

    const getStatusClass = (response) => {
      if (!response) return 'bg-secondary'
      
      const hasContent = (
        (response.reponse_boolean !== null) ||
        response.reponse_text ||
        (response.reponse_number !== null) ||
        response.reponse_date ||
        (response.reponse_list && response.reponse_list.length > 0)
      )
      
      return hasContent ? 'bg-success' : 'bg-warning'
    }

    const getStatusLabel = (response) => {
      if (!response) return 'En attente'
      
      const hasContent = (
        (response.reponse_boolean !== null) ||
        response.reponse_text ||
        (response.reponse_number !== null) ||
        response.reponse_date ||
        (response.reponse_list && response.reponse_list.length > 0)
      )
      
      return hasContent ? 'Complété' : 'En attente'
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Non défini'
      return new Date(dateString).toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const editResponse = () => {
      emit('edit-response', props.tool)
      emit('close')
    }

    return {
      currentTemplate,
      isStructuredDetails,
      isStructuredList,
      getDetailsTitle,
      getTypeClass,
      getTypeLabel,
      getStatusClass,
      getStatusLabel,
      formatDate,
      editResponse
    }
  }
}
</script>

<style scoped>
.modal {
  z-index: 1055;
}

.modal-backdrop {
  z-index: 1050;
}

.card-title {
  color: #495057;
  font-weight: 600;
}

.badge {
  font-size: 0.75rem;
}

dl.row dt {
  font-weight: 600;
  color: #495057;
}

dl.row dd {
  color: #6c757d;
}

.list-group-item {
  border-left: none;
  border-right: none;
  background-color: transparent;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:last-child {
  border-bottom: none;
}
</style>
