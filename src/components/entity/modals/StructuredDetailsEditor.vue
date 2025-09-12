<template>
  <div class="structured-details-editor">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="mb-0">
        <i class="fas fa-list-ul me-2"></i>
        {{ title }}
      </h6>
      <button 
        type="button" 
        @click="addItem"
        class="btn btn-outline-success btn-sm">
        <i class="fas fa-plus me-1"></i>
        Ajouter
      </button>
    </div>

    <div v-if="items.length === 0" class="text-center text-muted py-4">
      <i class="fas fa-inbox fa-2x mb-2"></i>
      <p class="mb-0">Aucun élément ajouté</p>
    </div>

    <div v-else class="items-container">
      <div 
        v-for="(item, index) in items" 
        :key="index"
        class="item-card mb-3">
        
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center py-2">
            <span class="fw-semibold">
              {{ getItemTitle(item, index) }}
            </span>
            <button 
              type="button" 
              @click="removeItem(index)"
              class="btn btn-outline-danger btn-sm"
              :disabled="items.length <= 1 && required">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          
          <div class="card-body">
            <div class="row">
              <div 
                v-for="field in template.fields" 
                :key="field.key"
                :class="getFieldColumnClass(field)">
                
                <!-- Champ texte -->
                <div v-if="field.type === 'text'" class="mb-3">
                  <label class="form-label">
                    {{ field.label }}
                    <span v-if="field.required" class="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    v-model="item[field.key]"
                    class="form-control form-control-sm"
                    :placeholder="field.label">
                </div>

                <!-- Champ nombre -->
                <div v-if="field.type === 'number'" class="mb-3">
                  <label class="form-label">
                    {{ field.label }}
                    <span v-if="field.required" class="text-danger">*</span>
                  </label>
                  <input 
                    type="number" 
                    v-model.number="item[field.key]"
                    class="form-control form-control-sm"
                    :placeholder="field.label">
                </div>

                <!-- Champ date -->
                <div v-if="field.type === 'date'" class="mb-3">
                  <label class="form-label">
                    {{ field.label }}
                    <span v-if="field.required" class="text-danger">*</span>
                  </label>
                  <input 
                    type="date" 
                    v-model="item[field.key]"
                    class="form-control form-control-sm">
                </div>

                <!-- Champ select -->
                <div v-if="field.type === 'select'" class="mb-3">
                  <label class="form-label">
                    {{ field.label }}
                    <span v-if="field.required" class="text-danger">*</span>
                  </label>
                  <select 
                    v-model="item[field.key]"
                    class="form-select form-select-sm">
                    <option value="">Sélectionner...</option>
                    <option 
                      v-for="option in field.options" 
                      :key="option.value"
                      :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <!-- Champ liste -->
                <div v-if="field.type === 'list'" class="mb-3">
                  <label class="form-label">
                    {{ field.label }}
                    <span v-if="field.required" class="text-danger">*</span>
                  </label>
                  <div class="list-field-container">
                    <div 
                      v-for="(listItem, listIndex) in (item[field.key] || [])" 
                      :key="listIndex"
                      class="input-group input-group-sm mb-1">
                      <input 
                        type="text" 
                        v-model="item[field.key][listIndex]"
                        class="form-control"
                        :placeholder="`${field.label} ${listIndex + 1}`">
                      <button 
                        type="button" 
                        @click="removeListItem(item, field.key, listIndex)"
                        class="btn btn-outline-danger"
                        :disabled="(item[field.key] || []).length <= 1">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                    <button 
                      type="button" 
                      @click="addListItem(item, field.key)"
                      class="btn btn-outline-primary btn-sm">
                      <i class="fas fa-plus me-1"></i>
                      Ajouter
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { createNewTemplateItem } from '@/utils/outilsTemplates'

export default {
  name: 'StructuredDetailsEditor',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    template: {
      type: Object,
      required: true
    },
    title: {
      type: String,
      default: 'Éléments structurés'
    },
    required: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const items = computed({
      get: () => props.modelValue || [],
      set: (value) => emit('update:modelValue', value)
    })

    const addItem = () => {
      const newItem = createNewTemplateItem(props.template)
      const currentItems = [...items.value]
      currentItems.push(newItem)
      items.value = currentItems
    }

    const removeItem = (index) => {
      if (items.value.length > 1 || !props.required) {
        const currentItems = [...items.value]
        currentItems.splice(index, 1)
        items.value = currentItems
      }
    }

    const addListItem = (item, fieldKey) => {
      if (!item[fieldKey]) {
        item[fieldKey] = []
      }
      item[fieldKey].push('')
    }

    const removeListItem = (item, fieldKey, index) => {
      if (item[fieldKey] && item[fieldKey].length > 1) {
        item[fieldKey].splice(index, 1)
      }
    }

    const getItemTitle = (item, index) => {
      // Essayer de trouver un champ descriptif pour le titre
      const titleField = props.template.fields.find(f => 
        f.key.includes('nom') || f.key.includes('titre') || f.key.includes('theme')
      )
      
      if (titleField && item[titleField.key]) {
        return item[titleField.key]
      }
      
      return `Élément ${index + 1}`
    }

    const getFieldColumnClass = (field) => {
      if (field.type === 'list') {
        return 'col-12'
      }
      if (field.type === 'text' && field.key.includes('description')) {
        return 'col-12'
      }
      return 'col-md-6'
    }

    return {
      items,
      addItem,
      removeItem,
      addListItem,
      removeListItem,
      getItemTitle,
      getFieldColumnClass
    }
  }
}
</script>

<style scoped>
.structured-details-editor {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

.item-card .card {
  border: 1px solid #e3e6f0;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.item-card .card-header {
  background-color: #f8f9fc;
  border-bottom: 1px solid #e3e6f0;
}

.list-field-container {
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  padding: 0.5rem;
  background-color: white;
}

.list-field-container .input-group:last-of-type {
  margin-bottom: 0.5rem !important;
}
</style>
