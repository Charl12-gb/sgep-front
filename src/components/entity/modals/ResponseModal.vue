<template>
  <div class="modal-container">
    <div class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-edit me-2"></i>
              {{ tool?.response ? 'Modifier la réponse' : 'Ajouter une réponse' }}
            </h5>
            <button type="button" class="btn-close" @click="$emit('close')"></button>
          </div>
          
          <div class="modal-body">
            <div v-if="tool">
              <!-- Informations sur l'outil -->
              <div class="card bg-light mb-4">
                <div class="card-body py-3">
                  <h6 class="card-title mb-2">
                    {{ tool.label }}
                    <span :class="getTypeClass(tool.type)" class="badge ms-2">
                      {{ getTypeLabel(tool.type) }}
                    </span>
                  </h6>
                  <p class="card-text text-muted mb-0" v-if="tool.description">
                    {{ tool.description }}
                  </p>
                  <small class="text-muted">
                    Catégorie: {{ tool.category || 'Non définie' }}
                  </small>
                </div>
              </div>

              <!-- Formulaire de réponse -->
              <form @submit.prevent="saveResponse">
                <!-- Réponse Boolean -->
                <div v-if="tool.type === 'boolean'" class="mb-4">
                  <label class="form-label fw-semibold">Réponse</label>
                  <div class="form-check-container">
                    <div class="form-check form-check-inline">
                      <input 
                        class="form-check-input" 
                        type="radio" 
                        :id="`yes_${tool.id}`"
                        :value="true" 
                        v-model="formData.reponse_boolean">
                      <label class="form-check-label text-success" :for="`yes_${tool.id}`">
                        <i class="fas fa-check me-1"></i>
                        Oui
                      </label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input 
                        class="form-check-input" 
                        type="radio" 
                        :id="`no_${tool.id}`"
                        :value="false" 
                        v-model="formData.reponse_boolean">
                      <label class="form-check-label text-danger" :for="`no_${tool.id}`">
                        <i class="fas fa-times me-1"></i>
                        Non
                      </label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input 
                        class="form-check-input" 
                        type="radio" 
                        :id="`null_${tool.id}`"
                        :value="null" 
                        v-model="formData.reponse_boolean">
                      <label class="form-check-label text-muted" :for="`null_${tool.id}`">
                        <i class="fas fa-question me-1"></i>
                        Non défini
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Réponse Text -->
                <div v-if="tool.type === 'text'" class="mb-4">
                  <label class="form-label fw-semibold">Réponse</label>
                  <textarea 
                    v-model="formData.reponse_text"
                    class="form-control"
                    rows="4"
                    placeholder="Saisissez votre réponse..."></textarea>
                </div>

                <!-- Réponse Number -->
                <div v-if="tool.type === 'number'" class="mb-4">
                  <label class="form-label fw-semibold">Réponse</label>
                  <input 
                    type="number" 
                    v-model.number="formData.reponse_number"
                    class="form-control"
                    step="any"
                    placeholder="Saisissez un nombre...">
                </div>

                <!-- Réponse Date -->
                <div v-if="tool.type === 'date'" class="mb-4">
                  <label class="form-label fw-semibold">Réponse</label>
                  <input 
                    type="date" 
                    v-model="formData.reponse_date"
                    class="form-control">
                </div>

                <!-- Réponse List -->
                <div v-if="tool.type === 'list'" class="mb-4">
                  <label class="form-label fw-semibold">Liste des éléments</label>
                  <div class="list-container">
                    <div v-for="(item, index) in formData.reponse_list" :key="index" class="input-group mb-2">
                      <input 
                        type="text" 
                        v-model="formData.reponse_list[index]"
                        class="form-control"
                        :placeholder="`Élément ${index + 1}`">
                      <button 
                        type="button" 
                        @click="removeListItem(index)"
                        class="btn btn-outline-danger"
                        :disabled="formData.reponse_list.length <= 1">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                    <button 
                      type="button" 
                      @click="addListItem"
                      class="btn btn-outline-primary btn-sm">
                      <i class="fas fa-plus me-1"></i>
                      Ajouter un élément
                    </button>
                  </div>
                </div>

                <!-- Détails supplémentaires - Uniquement données structurées -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">
                    Détails supplémentaires
                    <small class="text-muted">(optionnel)</small>
                  </label>
                  
                  <!-- Indication du mode structuré -->
                  <div class="alert alert-info d-flex align-items-center mb-3">
                    <i class="fas fa-database me-2"></i>
                    <span>Saisie structurée uniquement pour assurer la cohérence des données</span>
                  </div>

                  <!-- Données structurées uniquement -->
                  <div>
                    <StructuredDetailsEditor
                      v-model="structuredDetails"
                      :template="currentTemplate"
                      :title="getDetailsTitle()"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              Annuler
            </button>
            <button 
              type="button" 
              @click="saveResponse"
              class="btn btn-success"
              :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-save me-2"></i>
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'
import StructuredDetailsEditor from './StructuredDetailsEditor.vue'
import { getTemplateForOutil, createNewTemplateItem } from '@/utils/outilsTemplates'

export default {
  name: 'ResponseModal',
  components: {
    StructuredDetailsEditor
  },
  props: {
    tool: {
      type: Object,
      required: true
    },
    entityId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const store = useStore()
    const { notifyError } = useNotyf()
    
    const saving = ref(false)
    const structuredDetails = ref([])
    
    const formData = reactive({
      reponse_boolean: null,
      reponse_text: '',
      reponse_number: null,
      reponse_date: '',
      reponse_list: [''],
      details: ''
    })

    // Template dynamique basé sur le type d'outil
    const currentTemplate = computed(() => {
      if (props.tool && props.tool.code) {
        return getTemplateForOutil(props.tool.code)
      }
      return getTemplateForOutil('default')
    })

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

    // Gestion des listes de réponses
    const addListItem = () => {
      formData.reponse_list.push('')
    }

    const removeListItem = (index) => {
      if (formData.reponse_list.length > 1) {
        formData.reponse_list.splice(index, 1)
      }
    }

    // Méthodes pour les détails structurés
    const getDetailsTitle = () => {
      if (props.tool && props.tool.code) {
        const code = props.tool.code.toLowerCase()
        if (code.includes('formation')) {
          return 'Formations des administrateurs'
        }
        if (code.includes('comite')) {
          return 'Comités spécialisés'
        }
        if (code.includes('suivi')) {
          return 'Suivi des décisions'
        }
      }
      return 'Détails structurés'
    }

    // Convertir les détails en format structuré uniquement
    const convertDetailsToFormat = () => {
      // Filtrer les éléments valides
      const validDetails = structuredDetails.value.filter(item => {
        // Vérifier qu'au moins un champ non vide existe
        return Object.values(item).some(value => 
          value !== null && value !== undefined && value !== ''
        )
      })
      
      if (validDetails.length > 0) {
        formData.details = validDetails
      } else {
        formData.details = null
      }
    }

    // Initialiser les détails structurés
    const initializeDetails = (details) => {
      if (!details) {
        structuredDetails.value = []
        formData.details = ''
        return
      }

      if (Array.isArray(details)) {
        // C'est une liste structurée
        structuredDetails.value = details.length > 0 ? [...details] : []
        formData.details = details
      } else if (typeof details === 'object') {
        // C'est un objet, créer une liste avec cet objet
        structuredDetails.value = [details]
        formData.details = [details]
      } else {
        // Legacy texte - créer un objet structuré basique
        const newItem = createNewTemplateItem(currentTemplate.value)
        if (newItem) {
          // Si c'est du texte, l'ajouter dans le champ description du template
          if (newItem.description !== undefined) {
            newItem.description = details.toString()
          } else if (newItem.titre !== undefined) {
            newItem.titre = details.toString()
          }
          structuredDetails.value = [newItem]
          formData.details = [newItem]
        } else {
          structuredDetails.value = []
          formData.details = null
        }
      }
      
      // Si aucun élément structuré, en créer un par défaut
      if (structuredDetails.value.length === 0) {
        const newItem = createNewTemplateItem(currentTemplate.value)
        if (newItem) {
          structuredDetails.value = [newItem]
        }
      }
    }

    // Initialisation des données
    const initializeFormData = () => {
      if (props.tool?.response) {
        const response = props.tool.response
        formData.reponse_boolean = response.reponse_boolean
        formData.reponse_text = response.reponse_text || ''
        formData.reponse_number = response.reponse_number
        formData.reponse_date = response.reponse_date || ''
        formData.reponse_list = response.reponse_list && response.reponse_list.length > 0 
          ? [...response.reponse_list] 
          : ['']
        
        // Initialiser les détails selon leur format
        initializeDetails(response.details)
      } else {
        // Réinitialiser pour un nouvel outil
        formData.reponse_boolean = null
        formData.reponse_text = ''
        formData.reponse_number = null
        formData.reponse_date = ''
        formData.reponse_list = ['']
        initializeDetails(null)
      }
    }

    // Validation des données
    const validateFormData = () => {
      // Convertir les détails selon le mode sélectionné
      convertDetailsToFormat()

      if (props.tool.type === 'list') {
        // Filtrer les éléments vides
        formData.reponse_list = formData.reponse_list.filter(item => item && item.trim())
        if (formData.reponse_list.length === 0) {
          formData.reponse_list = null
        }
      }

      // Nettoyage des champs texte
      if (formData.reponse_text && !formData.reponse_text.trim()) {
        formData.reponse_text = null
      }
      
      // Les détails structurés sont déjà gérés par convertDetailsToFormat()

      // Nettoyage des champs date - convertir chaînes vides en null
      if (formData.reponse_date === '' || (formData.reponse_date && !formData.reponse_date.trim())) {
        formData.reponse_date = null
      }

      return true
    }

    // Sauvegarde
    const saveResponse = async () => {
      if (!validateFormData()) return

      saving.value = true
      try {
        const responseData = {
          outil_id: props.tool.id,
          entity_id: props.entityId,
          annee: new Date().getFullYear(),
          ...formData
        }

        if (props.tool.response) {
          // Mise à jour
          await store.dispatch('outils/updateEntityReponse', {
            entityId: props.entityId,
            reponseId: props.tool.response.id,
            reponseData: responseData
          })
        } else {
          // Création
          await store.dispatch('outils/saveEntityReponse', {
            entityId: props.entityId,
            reponseData: responseData
          })
        }

        emit('saved')
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        notifyError('Erreur lors de la sauvegarde de la réponse')
      } finally {
        saving.value = false
      }
    }

    // Watchers
    watch(() => props.tool, () => {
      if (props.tool) {
        initializeFormData()
      }
    })

    // Lifecycle
    onMounted(() => {
      if (props.tool) {
        initializeFormData()
      }
    })

    return {
      saving,
      formData,
      structuredDetails,
      currentTemplate,
      getTypeClass,
      getTypeLabel,
      addListItem,
      removeListItem,
      getDetailsTitle,
      saveResponse
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

.form-check-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-check-inline {
  margin-right: 0;
}

.list-container {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

.details-list-container {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #f8f9fa;
  margin-bottom: 1rem;
}

.details-list-container .row {
  margin-left: 0;
  margin-right: 0;
}

.details-list-container .row > [class*="col-"] {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.card-title {
  color: #495057;
  font-weight: 600;
}

.fw-semibold {
  font-weight: 600;
}
</style>
