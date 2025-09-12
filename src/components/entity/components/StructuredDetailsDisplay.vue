<template>
  <div class="structured-details-display">
    <!-- Affichage des détails sous forme de liste d'éléments -->
    <div v-if="Array.isArray(details)" class="details-list">
      <div v-if="details.length === 0" class="text-center text-muted py-4">
        <i class="fas fa-inbox fa-2x mb-2"></i>
        <p class="mb-0">Aucun élément trouvé</p>
      </div>
      
      <div v-else>
        <div 
          v-for="(item, index) in details" 
          :key="index"
          class="detail-item mb-3">
          
          <div class="card border-primary">
            <div class="card-header bg-primary text-white py-2">
              <h6 class="mb-0">
                <i class="fas fa-list-alt me-2"></i>
                {{ getItemTitle(item, index) }}
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div 
                  v-for="field in getVisibleFields(item)" 
                  :key="field.key"
                  :class="getFieldColumnClass(field)">
                  
                  <div class="mb-3">
                    <strong class="text-primary">{{ field.label }}:</strong>
                    <div class="mt-1">
                      <!-- Affichage selon le type de champ -->
                      <div v-if="field.type === 'list' && Array.isArray(item[field.key])">
                        <ul v-if="item[field.key].length > 0" class="list-group list-group-flush">
                          <li 
                            v-for="(listItem, listIndex) in item[field.key]" 
                            :key="listIndex"
                            class="list-group-item border-0 px-0 py-1">
                            <i class="fas fa-chevron-right text-muted me-2"></i>
                            {{ listItem }}
                          </li>
                        </ul>
                        <span v-else class="text-muted fst-italic">Aucun élément</span>
                      </div>
                      
                      <div v-else-if="field.type === 'date' && item[field.key]">
                        <span class="badge bg-info">
                          <i class="fas fa-calendar me-1"></i>
                          {{ formatDate(item[field.key]) }}
                        </span>
                      </div>
                      
                      <div v-else-if="field.type === 'number' && item[field.key] !== null && item[field.key] !== undefined">
                        <span class="badge bg-success">
                          <i class="fas fa-hashtag me-1"></i>
                          {{ item[field.key] }}
                        </span>
                      </div>
                      
                      <div v-else-if="field.type === 'select' && item[field.key]">
                        <span class="badge bg-warning text-dark">
                          <i class="fas fa-tag me-1"></i>
                          {{ item[field.key] }}
                        </span>
                      </div>
                      
                      <div v-else-if="item[field.key]">
                        <span class="text-break">{{ item[field.key] }}</span>
                      </div>
                      
                      <div v-else>
                        <span class="text-muted fst-italic">Non renseigné</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Affichage d'un seul objet -->
    <div v-else-if="typeof details === 'object'" class="single-object">
      <div class="card border-info">
        <div class="card-header bg-info text-white py-2">
          <h6 class="mb-0">
            <i class="fas fa-info-circle me-2"></i>
            Informations détaillées
          </h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div 
              v-for="(value, key) in details" 
              :key="key"
              class="col-md-6 mb-3">
              
              <strong class="text-info">{{ formatFieldLabel(key) }}:</strong>
              <div class="mt-1">
                <div v-if="Array.isArray(value)">
                  <ul v-if="value.length > 0" class="list-group list-group-flush">
                    <li 
                      v-for="(item, index) in value" 
                      :key="index"
                      class="list-group-item border-0 px-0 py-1">
                      <i class="fas fa-chevron-right text-muted me-2"></i>
                      {{ item }}
                    </li>
                  </ul>
                  <span v-else class="text-muted fst-italic">Aucun élément</span>
                </div>
                
                <div v-else-if="isDate(key) && value">
                  <span class="badge bg-info">
                    <i class="fas fa-calendar me-1"></i>
                    {{ formatDate(value) }}
                  </span>
                </div>
                
                <div v-else-if="isNumber(value)">
                  <span class="badge bg-success">
                    <i class="fas fa-hashtag me-1"></i>
                    {{ value }}
                  </span>
                </div>
                
                <div v-else-if="value">
                  <span class="text-break">{{ value }}</span>
                </div>
                
                <div v-else>
                  <span class="text-muted fst-italic">Non renseigné</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Fallback pour les autres types -->
    <div v-else class="fallback-display">
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Format non reconnu:</strong>
        <pre class="mt-2 mb-0">{{ JSON.stringify(details, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StructuredDetailsDisplay',
  props: {
    details: {
      type: [Object, Array],
      required: true
    },
    template: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    
    // Obtenir le titre d'un élément
    const getItemTitle = (item, index) => {
      // Essayer de trouver un champ descriptif pour le titre
      const titleFields = ['nom_comite', 'themes_formation', 'titre', 'nom', 'theme']
      
      for (const field of titleFields) {
        if (item[field]) {
          return item[field]
        }
      }
      
      // Si c'est une formation, créer un titre descriptif
      if (item.annee && item.themes_formation) {
        return `Formation ${item.annee} - ${item.themes_formation}`
      }
      
      if (item.annee) {
        return `Élément ${item.annee}`
      }
      
      return `Élément ${index + 1}`
    }

    // Obtenir les champs visibles d'un élément
    const getVisibleFields = (item) => {
      if (props.template && props.template.fields) {
        return props.template.fields.filter(field => 
          // eslint-disable-next-line no-prototype-builtins
          Object.prototype.hasOwnProperty.call(item, field.key) && 
          item[field.key] !== null && 
          item[field.key] !== undefined && 
          item[field.key] !== ''
        )
      }
      
      // Créer des champs dynamiques si pas de template
      return Object.keys(item).map(key => ({
        key,
        label: formatFieldLabel(key),
        type: guessFieldType(item[key])
      })).filter(field => 
        item[field.key] !== null && 
        item[field.key] !== undefined && 
        item[field.key] !== ''
      )
    }

    // Déterminer la classe de colonne pour un champ
    const getFieldColumnClass = (field) => {
      if (field.type === 'list') {
        return 'col-12'
      }
      if (field.key.includes('description') || field.key.includes('objectifs')) {
        return 'col-12'
      }
      return 'col-md-6'
    }

    // Formater le label d'un champ
    const formatFieldLabel = (key) => {
      const labels = {
        'nom_comite': 'Nom du comité',
        'administrateurs_membres': 'Administrateurs membres',
        'nombre_reunions_annee': 'Nombre de réunions/an',
        'annee': 'Année',
        'themes_formation': 'Thèmes de formation',
        'date_formation': 'Date de formation',
        'nombre_administrateurs_formes': 'Administrateurs formés',
        'structure_formation': 'Structure de formation',
        'nombre_jours_formation': 'Nombre de jours',
        'source_financement': 'Source de financement',
        'date_adoption': 'Date d\'adoption',
        'echeance_horizon': 'Échéance/Horizon',
        'objectifs_principaux': 'Objectifs principaux',
        'date_signature': 'Date de signature',
        'periode': 'Période',
        'objectifs_definis': 'Objectifs définis',
        'nombre_recommandations_formulees': 'Recommandations formulées',
        'nombre_recommandations_mises_en_oeuvre': 'Recommandations mises en œuvre',
        'niveau_execution_pourcentage': 'Niveau d\'exécution (%)',
        'titre': 'Titre',
        'description': 'Description',
        'date': 'Date',
        'statut': 'Statut'
      }
      
      return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    // Deviner le type d'un champ
    const guessFieldType = (value) => {
      if (Array.isArray(value)) return 'list'
      if (typeof value === 'number') return 'number'
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return 'date'
      return 'text'
    }

    // Vérifier si c'est un champ de date
    const isDate = (key) => {
      return key.includes('date') || key.includes('echeance')
    }

    // Vérifier si c'est un nombre
    const isNumber = (value) => {
      return typeof value === 'number' && !isNaN(value)
    }

    // Formater une date
    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        return new Date(dateString).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch (error) {
        return dateString
      }
    }

    return {
      getItemTitle,
      getVisibleFields,
      getFieldColumnClass,
      formatFieldLabel,
      isDate,
      isNumber,
      formatDate
    }
  }
}
</script>

<style scoped>
.structured-details-display {
  min-height: 100px;
}

.detail-item .card {
  border-left: 4px solid var(--bs-primary);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.detail-item .card-header {
  font-weight: 600;
}

.list-group-item {
  border: none;
  padding: 0.25rem 0;
  background: transparent;
}

.badge {
  font-size: 0.875rem;
}

.text-break {
  word-break: break-word;
  line-height: 1.5;
}

.alert pre {
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 0.25rem;
  padding: 0.5rem;
  font-size: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
}

.single-object .card {
  border-left: 4px solid var(--bs-info);
}

.fallback-display .alert {
  margin-bottom: 0;
}
</style>
