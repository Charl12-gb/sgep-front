<template>
  <div class="reports-container">
    <!-- Header moderne avec gradient -->
    <div class="hero-section">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h1 class="hero-title">
              <i class="fas fa-chart-line me-3"></i>
              Générateur de Rapports
            </h1>
            <p class="hero-subtitle">
              Créez des rapports personnalisés et exportez-les dans le format de votre choix
            </p>
          </div>
          <div class="col-lg-4 text-end">
            <div class="hero-stats">
              <div class="stat-item">
                <div class="stat-number">{{ reportTypes?.length || 0 }}</div>
                <div class="stat-label">Types de rapports</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container py-4">
      <!-- Configuration du rapport avec design moderne -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="modern-card">
            <div class="card-header-modern">
              <div class="d-flex align-items-center">
                <div class="icon-wrapper me-3">
                  <i class="fas fa-cog"></i>
                </div>
                <div>
                  <h2 class="card-title-modern">Configuration du Rapport</h2>
                  <p class="card-subtitle-modern">Définissez les paramètres de votre rapport</p>
                </div>
              </div>
            </div>
            
            <div class="card-body-modern">
              <!-- Sélection du type de rapport -->
              <div class="form-group-modern mb-4">
                <label for="reportType" class="form-label-modern">
                  <i class="fas fa-file-alt me-2"></i>Type de rapport
                </label>
                <select 
                  id="reportType"
                  v-model="selectedReportType" 
                  @change="onReportTypeChange"
                  class="form-control-modern"
                >
                  <option value="">Sélectionner un type de rapport...</option>
                  <option 
                    v-for="type in reportTypes" 
                    :key="type.id" 
                    :value="type.id"
                  >
                    {{ type.name }}
                  </option>
                </select>
              </div>

              <!-- Configuration du format et titre -->
              <div v-if="selectedReportType" class="row mb-4">
                <div class="col-md-6">
                  <div class="form-group-modern">
                    <label for="format" class="form-label-modern">
                      <i class="fas fa-download me-2"></i>Format
                    </label>
                    <select id="format" v-model="reportConfig.format" class="form-control-modern">
                      <option value="pdf">📄 PDF</option>
                      <option value="word">📝 Word</option>
                      <option value="excel">📊 Excel</option>
                    </select>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="form-group-modern">
                    <label for="title" class="form-label-modern">
                      <i class="fas fa-heading me-2"></i>Titre du rapport
                    </label>
                    <input 
                      id="title"
                      v-model="reportConfig.title" 
                      type="text" 
                      class="form-control-modern"
                      placeholder="Entrez le titre du rapport"
                    />
                  </div>
                </div>
              </div>

              <!-- Filtres généraux -->
              <div v-if="selectedReportType">
                <h3 class="h5 mt-4 mb-3">🎯 Filtres</h3>
              <div class="row">
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Année :</label>
                  <div class="mb-2">
                    <button 
                      @click="selectAllYears" 
                      class="btn btn-outline-primary btn-sm me-2"
                      type="button"
                    >
                      Toutes
                    </button>
                    <button 
                      @click="selectCurrentYear" 
                      class="btn btn-outline-secondary btn-sm"
                      type="button"
                    >
                      Année courante
                    </button>
                  </div>
                  <select 
                    v-model="filters.years" 
                    class="form-select"
                    multiple
                  >
                    <option 
                      v-for="year in availableYears" 
                      :key="year" 
                      :value="year"
                    >
                      {{ year }}
                    </option>
                  </select>
                  <small class="form-text text-muted">Maintenez Ctrl/Cmd pour sélectionner plusieurs années</small>
                </div>
                
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Entités :</label>
                  <div class="mb-2">
                    <button 
                      @click="selectAllEntities" 
                      class="btn btn-outline-primary btn-sm me-2"
                      type="button"
                    >
                      Toutes
                    </button>
                    <button 
                      @click="clearEntitySelection" 
                      class="btn btn-outline-secondary btn-sm"
                      type="button"
                    >
                      Aucune
                    </button>
                  </div>
                  <select 
                    v-model="filters.entity_ids" 
                    class="form-select"
                    multiple
                    size="4"
                  >
                    <option 
                      v-for="entity in availableEntities" 
                      :key="entity.id" 
                      :value="entity.id"
                    >
                      {{ entity.name }}{{ entity.sigle ? ` (${entity.sigle})` : '' }}
                    </option>
                  </select>
                  <small class="form-text text-muted">
                    {{ filters.entity_ids.length }} entité(s) sélectionnée(s)
                  </small>
                </div>
                
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Limite d'aperçu :</label>
                  <input 
                    v-model.number="filters.limit" 
                    type="number" 
                    min="1" 
                    max="100" 
                    class="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- Sélection des colonnes -->
      <div v-if="showColumnsSection" class="row mb-4">
        <div class="col-12">
          <div class="modern-card">
            <div class="card-header-modern">
              <div class="d-flex align-items-center">
                <div class="icon-wrapper me-3">
                  <i class="fas fa-columns"></i>
                </div>
                <div>
                  <h2 class="card-title-modern">Sélection des Colonnes</h2>
                  <p class="card-subtitle-modern">Choisissez les données à inclure dans votre rapport</p>
                </div>
              </div>
            </div>
            
            <div class="card-body-modern">
              <div class="d-flex justify-content-center mb-4">
                <button @click="selectAllColumns" class="btn-filter-action primary me-3">
                  <i class="fas fa-check-double me-2"></i>Tout sélectionner
                </button>
                <button @click="deselectAllColumns" class="btn-filter-action secondary">
                  <i class="fas fa-times me-2"></i>Tout désélectionner
                </button>
              </div>

              <div class="columns-grid">
                <div 
                  v-for="column in availableColumns" 
                  :key="column.key"
                  class="column-item"
                >
                  <label class="column-checkbox" :for="`col-${column.key}`">
                    <input 
                      v-model="selectedColumns" 
                      :value="column.key" 
                      type="checkbox"
                      :id="`col-${column.key}`"
                      class="checkbox-input"
                    />
                    <div class="checkbox-custom"></div>
                    <div class="column-content">
                      <div class="column-label">{{ column.label }}</div>
                      <div v-if="column.description" class="column-description">{{ column.description }}</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    <!-- Actions de prévisualisation -->
    <div v-if="selectedReportType" class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">
            <h2 class="card-title border-bottom border-primary border-3 pb-2 mb-3">👁️ Prévisualisation</h2>
            
            <!-- Affichage des filtres appliqués -->
            <div v-if="hasActiveFilters" class="mb-3">
              <h6 class="text-muted mb-2">🏷️ Filtres appliqués :</h6>
              <div class="d-flex flex-wrap gap-2">
                <span v-if="filters.years.length > 0" class="badge bg-secondary">
                  📅 {{ filters.years.length }} année(s): {{ filters.years.join(', ') }}
                </span>
                <span v-if="filters.entity_ids.length > 0" class="badge bg-info">
                  🏢 {{ filters.entity_ids.length }} entité(s) sélectionnée(s)
                </span>
                <span class="badge bg-warning text-dark">
                  📊 Limite: {{ filters.limit }} lignes
                </span>
              </div>
            </div>
            
            <div class="d-flex gap-3 justify-content-center mb-3">
              <button 
                @click="loadPreview"
                :disabled="!canPreview || previewLoading"
                class="btn btn-info"
              >
                <span v-if="previewLoading">⏳ Chargement...</span>
                <span v-else>🔍 Prévisualiser</span>
              </button>
              
              <button 
                v-if="hasPreviewData"
                @click="clearPreview"
                class="btn btn-secondary"
              >
                🗑️ Effacer l'aperçu
              </button>
            </div>

            <!-- Erreurs -->
            <div v-if="previewError" class="alert alert-danger d-flex align-items-center">
              <span>❌ {{ previewError }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Prévisualisation des données -->
    <div v-if="hasPreviewData" class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">
            <h2 class="card-title border-bottom border-primary border-3 pb-2 mb-3">📊 Aperçu des Données</h2>
            
            <!-- Informations sur l'aperçu -->
            <div class="mb-3">
              <div class="d-flex flex-wrap gap-2">
                <span class="badge bg-primary fs-6">
                  📊 {{ previewData?.total_records || 0 }} enregistrements total
                </span>
                <span class="badge bg-info fs-6">
                  👁️ {{ previewData?.preview_data?.length || 0 }} lignes affichées
                </span>
                <span class="badge bg-secondary fs-6">
                  📋 {{ filteredColumns.length }} colonnes sélectionnées
                </span>
              </div>
            </div>

            <!-- Tableau de prévisualisation -->
            <div v-if="filteredColumns.length > 0 && previewData?.preview_data?.length > 0" class="table-responsive mb-4">
              <table class="table table-striped table-hover">
                <thead class="table-dark">
                  <tr>
                    <th v-for="column in filteredColumns" :key="column" class="fw-semibold">
                      {{ formatColumnName(column) }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in previewData.preview_data" :key="index">
                    <td v-for="column in filteredColumns" :key="column">
                      {{ formatCellValue(row[column]) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Message si pas de colonnes ou pas de données -->
            <div v-else class="alert alert-warning">
              <span v-if="filteredColumns.length === 0">
                Aucune colonne sélectionnée pour la prévisualisation.
              </span>
              <span v-else>
                Aucune donnée disponible pour la prévisualisation.
              </span>
            </div>

            <!-- Actions de génération -->
            <div class="d-flex justify-content-center">
              <button 
                @click="generateReportAction"
                :disabled="!canGenerate || generating"
                class="btn btn-success btn-lg"
              >
                <span v-if="generating">🚀 Génération en cours...</span>
                <span v-else>📥 Télécharger le Rapport</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Suivi des générations -->
    <div v-if="activeGenerations.length > 0" class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">
            <h2 class="card-title border-bottom border-primary border-3 pb-2 mb-3">⏳ Générations en Cours</h2>
            
            <div class="row g-3">
              <div 
                v-for="task in activeGenerations" 
                :key="task.report_id"
                class="col-lg-6"
              >
                <div class="card border">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                      <h5 class="card-title mb-0">{{ task.report_type }}</h5>
                      <span class="badge bg-primary">{{ (task.format || '').toUpperCase() }}</span>
                    </div>
                    
                    <div class="mb-3">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <small class="text-muted">Progression</small>
                        <small class="fw-semibold">{{ task.progress || 0 }}%</small>
                      </div>
                      <div class="progress">
                        <div 
                          class="progress-bar bg-success"
                          role="progressbar"
                          :style="{ width: (task.progress || 0) + '%' }"
                          :aria-valuenow="task.progress || 0"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                    
                    <p class="card-text text-muted fst-italic">{{ task.message || 'En cours...' }}</p>
                    
                    <div v-if="task.status === 'completed'" class="d-flex gap-2">
                      <button 
                        @click="downloadReport(task.report_id)"
                        class="btn btn-primary btn-sm"
                      >
                        📥 Télécharger
                      </button>
                      <button 
                        @click="removeTask(task.report_id)"
                        class="btn btn-outline-secondary btn-sm"
                      >
                        🗑️ Supprimer
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
    <!-- Fin du container principal -->
    </div>

    <!-- Messages globaux -->
    <div v-if="error" class="position-fixed top-0 end-0 p-3" style="z-index: 1000;">
      <div class="alert alert-danger alert-dismissible shadow" role="alert">
        <span>❌ {{ error }}</span>
        <button type="button" class="btn-close" @click="dismissError" aria-label="Close"></button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'ReportsExtendedView',
  
  data() {
    return {
      selectedReportType: '',
      selectedColumns: [],
      availableColumns: [],
      
      reportConfig: {
        format: 'pdf',
        title: '',
        description: '',
        include_summary: true,
        include_charts: false
      },
      
      filters: {
        years: [new Date().getFullYear()],
        limit: 20,
        entity_ids: []
      },
      
      availableYears: [2020, 2021, 2022, 2023, 2024, 2025],
      availableEntities: [],
      
      generating: false,
      
      // Polling pour les tâches
      pollTimer: null
    }
  },
  
  computed: {
    ...mapState('reports', [
      'reportTypes',
      'previewData',
      'previewLoading',
      'previewError',
      'generationTasks',
      'loading',
      'error'
    ]),
    
    ...mapState('entities', {
      entities: 'entities'
    }),
    
    ...mapGetters('reports', [
      'hasPreviewData',
      'getActiveGenerations'
    ]),
    
    activeGenerations() {
      return this.getActiveGenerations || []
    },
    
    canPreview() {
      return this.selectedReportType && !this.previewLoading
    },
    
    canGenerate() {
      const hasValidPreviewData = this.hasPreviewData && this.previewData?.preview_data?.length > 0
      const hasSelectedColumns = this.filteredColumns.length > 0
      const hasTitleFilled = this.reportConfig.title?.trim()
      
      return hasValidPreviewData && hasSelectedColumns && hasTitleFilled && !this.generating
    },
    
    filteredColumns() {
      // Si on a des données de prévisualisation avec des colonnes définies par l'API
      if (this.hasPreviewData && this.previewData?.columns?.length > 0) {
        // Retourner seulement les colonnes sélectionnées par l'utilisateur qui existent dans la réponse API
        return this.previewData.columns.filter(column => this.selectedColumns.includes(column))
      }
      
      // Sinon utiliser les colonnes sélectionnées manuellement
      return this.selectedColumns || []
    },
    
    hasActiveFilters() {
      return this.filters.years.length > 0 || this.filters.entity_ids.length > 0
    },
    
    showColumnsSection() {
      return this.selectedReportType && this.availableColumns.length > 0
    }
  },
  
  async created() {
    await this.initializeReports()
    this.startPolling()
  },
  
  beforeUnmount() {
    this.stopPolling()
  },

  watch: {
    selectedReportType: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.onReportTypeChange()
        }
      },
      immediate: false
    },
    
    entities: {
      handler(newEntities) {
        this.availableEntities = newEntities || []
      },
      immediate: true
    }
  },
  
  methods: {
    ...mapActions('reports', [
      'fetchReportTypes',
      'previewReport',
      'generateReport',
      'downloadReport',
      'clearPreview',
      'updateFilters',
      'updateReportConfig',
      'removeGenerationTask'
    ]),
    
    ...mapActions('entities', [
      'fetchEntities'
    ]),
    
    async initializeReports() {
      try {
        await this.fetchReportTypes()
        await this.loadEntities()
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
      }
    },
    
    async loadEntities() {
      try {
        await this.fetchEntities({ 
          page: 1, 
          per_page: 100, // Charger toutes les entités pour le filtre
          sort_by: 'name',
          sort_order: 'asc'
        })
        
        // Mettre à jour la liste des entités disponibles
        this.availableEntities = this.entities || []
      } catch (error) {
        console.error('Erreur lors du chargement des entités:', error)
      }
    },
    
    // Méthodes pour la gestion des filtres rapides
    selectAllYears() {
      this.filters.years = [...this.availableYears]
    },
    
    selectCurrentYear() {
      this.filters.years = [new Date().getFullYear()]
    },
    
    selectAllEntities() {
      this.filters.entity_ids = this.availableEntities.map(entity => entity.id)
    },
    
    clearEntitySelection() {
      this.filters.entity_ids = []
    },
    
    // Validation des filtres
    validateFilters() {
      const errors = []
      
      if (this.filters.years.length === 0) {
        errors.push('Veuillez sélectionner au moins une année')
      }
      
      if (this.filters.limit < 1 || this.filters.limit > 100) {
        errors.push('La limite doit être entre 1 et 100')
      }
      
      return errors
    },
    
    onReportTypeChange() {
      if (this.selectedReportType) {
        // Réinitialiser l'état
        this.clearPreview()
        
        // Configurer les colonnes pour ce type de rapport
        this.setupColumnsForReportType()
        
        // Configurer la configuration par défaut
        this.setupDefaultConfig()
      } else {
        // Réinitialiser si aucun type sélectionné
        this.availableColumns = []
        this.selectedColumns = []
        this.clearPreview()
      }
    },
    
    setupColumnsForReportType() {
      // Mapping des colonnes basé sur les types de rapports de l'API
      const columnMappings = {
        'liste_entites': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'nom_entite', label: 'Nom de l\'entité', description: 'Nom de l\'entité' },
          { key: 'sigle', label: 'Sigle', description: 'Sigle de l\'entité' },
          { key: 'statut', label: 'Statut', description: 'Statut de l\'entité' },
          { key: 'tutelle', label: 'Tutelle', description: 'Ministère de tutelle' },
          { key: 'secteur', label: 'Secteur', description: 'Secteur d\'activité' },
          { key: 'capital_social', label: 'Capital social/Dotation', description: 'Capital social ou dotation initiale' },
          { key: 'objet', label: 'Objet', description: 'Objet social' },
          { key: 'date_creation', label: 'Date de création', description: 'Date de création' }
        ],
        'effectif_entites': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'entite', label: 'Entité', description: 'Nom de l\'entité' },
          { key: 'statut', label: 'Statut', description: 'Statut de l\'entité' },
          { key: 'annee', label: 'Année', description: 'Année de référence' },
          { key: 'effectif_total', label: 'Effectif total', description: 'Total des effectifs' },
          { key: 'hommes', label: 'Hommes', description: 'Nombre d\'hommes' },
          { key: 'femmes', label: 'Femmes', description: 'Nombre de femmes' }
        ],
        'directeurs_generaux': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'entite', label: 'Entité', description: 'Nom de l\'entité' },
          { key: 'statut', label: 'Statut', description: 'Statut de l\'entité' },
          { key: 'annee', label: 'Année', description: 'Année de référence' },
          { key: 'nom_prenom', label: 'Nom et prénom', description: 'Nom et prénom du directeur' },
          { key: 'date_nomination', label: 'Date de nomination', description: 'Date de nomination' },
          { key: 'email', label: 'Email', description: 'Adresse email' },
          { key: 'telephone', label: 'Téléphone', description: 'Numéro de téléphone' }
        ],
        'directeurs_financiers': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'entite', label: 'Entité', description: 'Nom de l\'entité' },
          { key: 'statut', label: 'Statut', description: 'Statut de l\'entité' },
          { key: 'annee', label: 'Année', description: 'Année de référence' },
          { key: 'nom_prenom', label: 'Nom et prénom', description: 'Nom et prénom du directeur financier' },
          { key: 'date_nomination', label: 'Date de nomination', description: 'Date de nomination' },
          { key: 'email', label: 'Email', description: 'Adresse email' },
          { key: 'telephone', label: 'Téléphone', description: 'Numéro de téléphone' }
        ],
        'administrateurs': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'entite', label: 'Entité', description: 'Nom de l\'entité' },
          { key: 'nom_prenom', label: 'Nom et prénom', description: 'Nom et prénom de l\'administrateur' },
          { key: 'sexe', label: 'Sexe', description: 'Sexe' },
          { key: 'age', label: 'Âge', description: 'Âge' },
          { key: 'profil_professionnel', label: 'Profil professionnel', description: 'Profil professionnel' },
          { key: 'structure_representee', label: 'Structure représentée', description: 'Structure représentée' },
          { key: 'mandat', label: 'Mandat', description: 'Mandat' },
          { key: 'position_conseil', label: 'Position dans le conseil', description: 'Position dans le conseil' }
        ],
        'contact_administrateurs': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'nom_prenom', label: 'Nom et prénom', description: 'Nom et prénom' },
          { key: 'email', label: 'Email', description: 'Adresse email' },
          { key: 'telephone', label: 'Téléphone', description: 'Numéro de téléphone' }
        ],
        'suivi_mandats': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'annee', label: 'Année', description: 'Année de référence' },
          { key: 'entite', label: 'Entité', description: 'Nom de l\'entité' },
          { key: 'statut', label: 'Statut', description: 'Statut de l\'entité' },
          { key: 'date_nomination', label: 'Date de nomination', description: 'Date de nomination' },
          { key: 'reference_decret', label: 'Référence décret nomination', description: 'Référence du décret de nomination' },
          { key: 'date_installation', label: 'Date d\'installation du conseil', description: 'Date d\'installation du conseil' },
          { key: 'date_debut_mandat', label: 'Date début mandat', description: 'Date de début du mandat' },
          { key: 'date_fin_mandat', label: 'Date de fin mandat', description: 'Date de fin du mandat' },
          { key: 'temps_restant', label: 'Temps restant', description: 'Temps restant du mandat' }
        ],
        'etat_arrete_comptes': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'annee', label: 'Année', description: 'Année de référence' },
          { key: 'entite', label: 'Entité', description: 'Nom de l\'entité' },
          { key: 'statut', label: 'Statut', description: 'Statut de l\'entité' },
          { key: 'date_arrete_comptes', label: 'Date d\'arrêté des comptes', description: 'Date d\'arrêté des comptes' },
          { key: 'exercice_concerne', label: 'Exercice concerné', description: 'Exercice comptable concerné' },
          { key: 'ecart_date_reglementaire', label: 'Écart/date réglementaire', description: 'Écart par rapport à la date réglementaire' }
        ],
        'etat_adoption_budgets': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'annee', label: 'Année', description: 'Année de référence' },
          { key: 'entite', label: 'Entité', description: 'Nom de l\'entité' },
          { key: 'statut', label: 'Statut', description: 'Statut de l\'entité' },
          { key: 'date_adoption_budget', label: 'Date d\'adoption du budget', description: 'Date d\'adoption du budget' },
          { key: 'annee_concernee', label: 'Année concernée', description: 'Année budgétaire concernée' },
          { key: 'ecart_date_reglementaire', label: 'Écart/date réglementaire', description: 'Écart par rapport à la date réglementaire' }
        ],
        'organisation_sessions': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'annee', label: 'Année', description: 'Année de référence' },
          { key: 'entite', label: 'Entité', description: 'Nom de l\'entité' },
          { key: 'statut', label: 'Statut', description: 'Statut de l\'entité' },
          { key: 'type_session', label: 'Type de session', description: 'Type de session' },
          { key: 'date_convocation', label: 'Date de convocation', description: 'Date de convocation' },
          { key: 'date_tenue_session', label: 'Date de tenue de la session', description: 'Date de tenue de la session' },
          { key: 'ecart_convocation_tenue', label: 'Écart convocation-tenue', description: 'Écart entre convocation et tenue' },
          { key: 'mode_tenue', label: 'Mode de tenue', description: 'Mode de tenue' },
          { key: 'nb_admin_present', label: 'Nb admin présent', description: 'Nombre d\'administrateurs présents' }
        ],
        'gestion_pv': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'annee', label: 'Année', description: 'Année de référence' },
          { key: 'entite', label: 'Entité', description: 'Nom de l\'entité' },
          { key: 'statut', label: 'Statut', description: 'Statut de l\'entité' },
          { key: 'type_session', label: 'Type de session', description: 'Type de session' },
          { key: 'date_tenue_session', label: 'Date de tenue de la session', description: 'Date de tenue de la session' },
          { key: 'date_signature_pv', label: 'Date de signature PV', description: 'Date de signature du PV' },
          { key: 'pv_enregistre_registre', label: 'PV enregistré dans le registre', description: 'PV enregistré dans le registre' }
        ],
        'outils_fonctionnement': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'entite', label: 'Entité', description: 'Nom de l\'entité' },
          { key: 'statut', label: 'Statut', description: 'Statut de l\'entité' },
          { key: 'reglement_interieur', label: 'Règlement intérieur', description: 'Règlement intérieur' },
          { key: 'charte_administrateur', label: 'Charte administrateur', description: 'Charte administrateur' },
          { key: 'registre_cote_paraphe', label: 'Registre côté paraphé', description: 'Registre côté paraphé' },
          { key: 'secretariat_archivage', label: 'Secrétariat et archivage', description: 'Secrétariat et archivage des dossiers du conseil' },
          { key: 'comite_specialise', label: 'Comité spécialisé', description: 'Comité spécialisé' },
          { key: 'tableau_bord_suivi', label: 'Tableau de bord de suivi', description: 'Tableau de bord de suivi des recommandations' },
          { key: 'mecanisme_evaluation', label: 'Mécanisme d\'évaluation', description: 'Mécanisme d\'évaluation des administrateurs' }
        ],
        'fonctionnement_comites': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'annee', label: 'Année', description: 'Année de référence' },
          { key: 'entite', label: 'Entité', description: 'Nom de l\'entité' },
          { key: 'statut', label: 'Statut', description: 'Statut de l\'entité' },
          { key: 'comite', label: 'Comité', description: 'Nom du comité' },
          { key: 'membres', label: 'Membres', description: 'Nombre de membres' },
          { key: 'nombre_reunions', label: 'Nombre de réunions', description: 'Nombre de réunions tenues' }
        ],
        'suivi_recommandations': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'annee', label: 'Année', description: 'Année de référence' },
          { key: 'entite', label: 'Entité', description: 'Nom de l\'entité' },
          { key: 'statut', label: 'Statut', description: 'Statut de l\'entité' },
          { key: 'nb_recommandations_formulees', label: 'Nb recommandations formulées', description: 'Nombre de recommandations formulées' },
          { key: 'nb_recommandations_mises_oeuvre', label: 'Nb recommandations mises en œuvre', description: 'Nombre de recommandations mises en œuvre' },
          { key: 'taux_mise_oeuvre', label: 'Taux de mise en œuvre', description: 'Taux de mise en œuvre des recommandations' }
        ],
        'outils_pilotage': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'annee', label: 'Année', description: 'Année de référence' },
          { key: 'entite', label: 'Entité', description: 'Nom de l\'entité' },
          { key: 'statut', label: 'Statut', description: 'Statut de l\'entité' },
          { key: 'plan_strategique', label: 'Plan stratégique', description: 'Plan stratégique' },
          { key: 'contrat_objectif', label: 'Contrat d\'objectif', description: 'Contrat d\'objectif' },
          { key: 'organigramme', label: 'Organigramme', description: 'Organigramme' },
          { key: 'manuel_procedure', label: 'Manuel de procédure', description: 'Manuel de procédure' }
        ],
        'synthese_plans_strategiques': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'annee', label: 'Année', description: 'Année de référence' },
          { key: 'entite', label: 'Entité', description: 'Nom de l\'entité' },
          { key: 'statut', label: 'Statut', description: 'Statut de l\'entité' },
          { key: 'plan_strategique', label: 'Plan stratégique', description: 'Présence d\'un plan stratégique' },
          { key: 'date_adoption', label: 'Date d\'adoption', description: 'Date d\'adoption du plan' },
          { key: 'horizon', label: 'Horizon', description: 'Horizon du plan stratégique' },
          { key: 'plan_venu_echeance', label: 'Plan venu à échéance', description: 'Plan arrivé à échéance' }
        ],
        'synthese_contrats_objectifs': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'annee', label: 'Année', description: 'Année de référence' },
          { key: 'entite', label: 'Entité', description: 'Nom de l\'entité' },
          { key: 'statut', label: 'Statut', description: 'Statut de l\'entité' },
          { key: 'contrat_objectif_dg', label: 'Contrat d\'objectif à DG', description: 'Présence d\'un contrat d\'objectif' },
          { key: 'date_signature', label: 'Date de signature', description: 'Date de signature du contrat' },
          { key: 'date_echeance', label: 'Date d\'échéance', description: 'Date d\'échéance du contrat' },
          { key: 'contrat_venu_echeance', label: 'Contrat venu à échéance', description: 'Contrat arrivé à échéance' }
        ],
        'formations_administrateurs': [
          { key: 'numero', label: 'N°', description: 'Numéro d\'ordre' },
          { key: 'annee', label: 'Année', description: 'Année de référence' },
          { key: 'entite', label: 'Entité', description: 'Nom de l\'entité' },
          { key: 'statut', label: 'Statut', description: 'Statut de l\'entité' },
          { key: 'date_formation', label: 'Date de formation', description: 'Date de la formation' },
          { key: 'nombre_jours', label: 'Nombre de jours', description: 'Nombre de jours de formation' },
          { key: 'nombre_administrateurs_formes', label: 'Nb administrateurs formés', description: 'Nombre d\'administrateurs formés' },
          { key: 'theme', label: 'Thème formation', description: 'Thème de la formation' },
          { key: 'structure_formation', label: 'Structure de formation', description: 'Organisme formateur' },
          { key: 'source_financement', label: 'Source de financement', description: 'Source de financement' }
        ]
      }
      
      const columns = columnMappings[this.selectedReportType] || []
      
      this.$nextTick(() => {
        this.availableColumns = [...columns]
        this.selectedColumns = columns.map(col => col.key)
      })
    },
    
    setupDefaultConfig() {
      const reportType = this.reportTypes?.find(t => t.id === this.selectedReportType)
      if (reportType) {
        this.reportConfig.title = reportType.name
        this.reportConfig.description = reportType.description || ''
      }
    },
    
    selectAllColumns() {
      this.selectedColumns = [...this.availableColumns.map(col => col.key)]
    },
    
    deselectAllColumns() {
      this.selectedColumns = []
    },
    
    async loadPreview() {
      try {
        // Validation des filtres
        const validationErrors = this.validateFilters()
        if (validationErrors.length > 0) {
          alert('Erreurs de validation:\n' + validationErrors.join('\n'))
          return
        }
        
        // S'assurer qu'on a des colonnes sélectionnées, sinon sélectionner toutes
        let columnsToUse = [...this.selectedColumns]
        if (columnsToUse.length === 0 && this.availableColumns.length > 0) {
          columnsToUse = this.availableColumns.map(col => col.key)
          this.selectedColumns = [...columnsToUse]
        }
        
        // Mettre à jour les filtres avec les colonnes sélectionnées
        if (this.updateFilters) {
          this.updateFilters({
            ...this.filters,
            columns: columnsToUse
          })
        }
        
        // Mettre à jour la configuration du rapport
        if (this.updateReportConfig) {
          this.updateReportConfig({
            report_type: this.selectedReportType,
            ...this.reportConfig
          })
        }
        
        // Lancer la prévisualisation
        const previewResult = await this.previewReport({
          reportType: this.selectedReportType,
          filters: {
            ...this.filters,
            columns: columnsToUse
          },
          limit: this.filters.limit
        })
        
        // Synchroniser les colonnes sélectionnées avec celles retournées par l'API
        if (previewResult?.columns && Array.isArray(previewResult.columns)) {
          // Garder seulement les colonnes qui existent vraiment dans la réponse API
          const validColumns = this.selectedColumns.filter(col => 
            previewResult.columns.includes(col)
          )
          if (validColumns.length !== this.selectedColumns.length) {
            this.selectedColumns = validColumns
          }
        }
        
      } catch (error) {
        console.error('Erreur lors de la prévisualisation:', error)
      }
    },
    
    async generateReportAction() {
      try {
        this.generating = true
        
        if (this.updateReportConfig) {
          this.updateReportConfig({
            report_type: this.selectedReportType,
            ...this.reportConfig
          })
        }
        
        await this.generateReport({
          ...this.reportConfig,
          filters: {
            ...this.filters,
            columns: this.selectedColumns
          }
        })
        
        this.$emit('notification', {
          type: 'success',
          message: `Génération du rapport "${this.reportConfig.title}" lancée avec succès`
        })
        
      } catch (error) {
        console.error('Erreur de génération:', error)
        this.$emit('notification', {
          type: 'error',
          message: 'Erreur lors de la génération du rapport'
        })
      } finally {
        this.generating = false
      }
    },
    
    removeTask(reportId) {
      if (this.removeGenerationTask) {
        this.removeGenerationTask(reportId)
      }
    },
    
    startPolling() {
      this.pollTimer = setInterval(() => {
        if (this.activeGenerations.length > 0) {
          // Optionnel: ajouter une action pour vérifier le statut des tâches
        }
      }, 3000)
    },
    
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },
    
    dismissError() {
      // Action pour dismisser l'erreur si disponible
      if (this.$store.dispatch) {
        this.$store.dispatch('reports/clearError')
      }
    },
    
    formatColumnName(column) {
      const columnLabels = this.availableColumns.reduce((acc, col) => {
        acc[col.key] = col.label
        return acc
      }, {})
      
      return columnLabels[column] || column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    },
    
    formatCellValue(value) {
      if (value === null || value === undefined) return ''
      if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
      if (typeof value === 'number') return value.toLocaleString()
      if (typeof value === 'string' && value.includes('T')) {
        // Probablement une date ISO
        try {
          return new Date(value).toLocaleDateString('fr-FR')
        } catch (e) {
          return value
        }
      }
      return String(value)
    }
  }
}
</script>

<style scoped>
.hover-shadow:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transform: translateY(-1px);
  transition: all 0.3s ease;
}

.form-check {
  min-height: 1.5rem;
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

/* Styles pour les multi-select */
select[multiple] {
  min-height: 120px;
}

select[multiple] option {
  padding: 8px 12px;
  margin-bottom: 2px;
}

select[multiple] option:checked {
  background-color: #0d6efd;
  color: white;
}

.form-text {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Améliorations pour les boutons de filtre */
.btn-sm {
  font-size: 0.775rem;
  padding: 0.25rem 0.5rem;
}

/* Badges pour les filtres appliqués */
.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
}

/* Hover effects pour une meilleure UX */
.btn:hover {
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

.form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* =================
   DESIGN MODERNE
   ================= */

/* Container principal */
.reports-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

/* Section Hero */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 0;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 0;
}

.hero-stats {
  text-align: center;
}

.stat-item {
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Cards modernes */
.modern-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: none;
  overflow: hidden;
  transition: all 0.3s ease;
}

.modern-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.card-header-modern {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: none;
  padding: 2rem;
}

.card-body-modern {
  padding: 2rem;
}

.icon-wrapper {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.card-title-modern {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.card-subtitle-modern {
  color: #718096;
  margin-bottom: 0;
  font-size: 0.95rem;
}

/* Formulaires modernes */
.form-group-modern {
  margin-bottom: 1.5rem;
}

.form-label-modern {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.form-control-modern {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-control-modern:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
  outline: none;
}

/* Section des filtres */
.filters-section {
  margin-top: 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  color: #718096;
  font-size: 0.95rem;
}

/* Cards de filtres */
.filter-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 1.5rem;
  height: 100%;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.filter-card:hover {
  border-color: #667eea;
  background: white;
}

.filter-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #2d3748;
}

.filter-header i {
  margin-right: 0.5rem;
  color: #667eea;
  width: 20px;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-filter-action {
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-filter-action.primary {
  background: #667eea;
  color: white;
}

.btn-filter-action.primary:hover {
  background: #5a6fd8;
}

.btn-filter-action.secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-filter-action.secondary:hover {
  background: #cbd5e0;
}

.filter-select {
  min-height: 120px;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.filter-help {
  color: #718096;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .card-header-modern,
  .card-body-modern {
    padding: 1.5rem;
  }
  
  .filter-card {
    margin-bottom: 1rem;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modern-card {
  animation: slideIn 0.6s ease-out;
}

.filter-card {
  animation: slideIn 0.6s ease-out;
}

/* Grille des colonnes */
.columns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  max-height: 500px;
  overflow-y: auto;
  padding: 0.5rem;
}

.column-item {
  background: white;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.column-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.column-checkbox {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  cursor: pointer;
  margin: 0;
  width: 100%;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e0;
  border-radius: 6px;
  margin-right: 0.75rem;
  margin-top: 2px;
  flex-shrink: 0;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.column-content {
  flex: 1;
}

.column-label {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.column-description {
  font-size: 0.85rem;
  color: #718096;
  line-height: 1.4;
}

/* Scrollbar personnalisée */
.columns-grid::-webkit-scrollbar {
  width: 8px;
}

.columns-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.columns-grid::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 10px;
}

.columns-grid::-webkit-scrollbar-thumb:hover {
  background: #5a6fd8;
}

/* Styles pour la prévisualisation */
.applied-filters {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
}

.filters-title {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.filters-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-badge {
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.filter-badge.years {
  background: #e6f3ff;
  color: #0066cc;
  border: 1px solid #b3d9ff;
}

.filter-badge.entities {
  background: #e6ffe6;
  color: #006600;
  border: 1px solid #b3ffb3;
}

.filter-badge.limit {
  background: #fff5e6;
  color: #cc6600;
  border: 1px solid #ffdb99;
}

.preview-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-preview {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  min-width: 150px;
  justify-content: center;
}

.btn-preview.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-preview.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-preview.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-preview.secondary {
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #e2e8f0;
}

.btn-preview.secondary:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.error-alert {
  background: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #e53e3e;
  margin-top: 1rem;
  display: flex;
  align-items: center;
}

/* Animations pour les icônes */
.fa-spin {
  animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>