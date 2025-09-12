<template>
  <div class="container py-4" style="background-color: #f8f9fa; min-height: 100vh;">

    <!-- Configuration du rapport -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-3">
          <!-- Header avec bouton toggle -->
          <div class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
            <h5 class="fw-bold mb-0 text-primary">
              <i class="fas fa-cog me-2"></i>Configuration du Rapport
              <small v-if="!showConfigSection" class="text-muted ms-2">(masquée)</small>
            </h5>
            <div class="d-flex align-items-center">
              <small class="text-muted me-2">Ctrl+H</small>
              <button 
                @click="toggleConfigSection"
                class="btn btn-outline-primary btn-sm"
                type="button"
                :title="showConfigSection ? 'Masquer la configuration (Ctrl+H)' : 'Afficher la configuration (Ctrl+H)'"
              >
                <i :class="showConfigSection ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="me-1"></i>
                {{ showConfigSection ? 'Masquer' : 'Afficher' }}
              </button>
            </div>
          </div>
          
          <!-- Contenu conditionnel -->
          <div v-show="showConfigSection" class="card-body collapse-content">
            <div class="row g-4">
              <!-- Colonne gauche -->
              <div class="col-lg-4 border-end">
                
                <!-- Type de rapport -->
                <div class="mb-4">
                  <label for="reportType" class="form-label fw-semibold">Type</label>
                  <select 
                    id="reportType"
                    v-model="selectedReportType" 
                    @change="onReportTypeChange"
                    class="form-select"
                  >
                    <option value="">Sélectionner...</option>
                    <option v-for="type in reportTypes" :key="type.id" :value="type.id">
                      {{ type.name }}
                    </option>
                  </select>
                </div>

                <!-- Format -->
                <div v-if="selectedReportType" class="mb-4">
                  <label for="format" class="form-label fw-semibold">Format</label>
                  <select id="format" v-model="reportConfig.format" class="form-select">
                    <option value="pdf">📄 PDF</option>
                    <option value="word">📝 Word</option>
                    <option value="excel">📊 Excel</option>
                  </select>
                </div>

                <!-- Titre -->
                <div v-if="selectedReportType" class="mb-4">
                  <label for="title" class="form-label fw-semibold">Titre</label>
                  <input 
                    id="title"
                    v-model="reportConfig.title" 
                    type="text" 
                    class="form-control"
                    placeholder="Entrez le titre"
                  />
                </div>

                <div class="mb-4">
                      <label class="form-label fw-semibold">Limite d'aperçu</label>
                      <input 
                        v-model.number="filters.limit" 
                        type="number" 
                        min="1" max="100" 
                        class="form-control w-50"
                      />
                    </div>
              </div>

              <!-- Colonne droite -->
              <div class="col-lg-8">
                <div v-if="selectedReportType">
                  <h6 class="fw-bold mb-3">🎯 Filtres</h6>
                  <div class="row g-4">

                    <!-- Années -->
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Année</label>
                      <div class="d-flex gap-2 mb-2">
                        <button @click="selectAllYears" type="button" class="btn btn-sm btn-outline-primary">Toutes</button>
                        <button @click="selectCurrentYear" type="button" class="btn btn-sm btn-outline-secondary">Courante</button>
                      </div>
                      <select v-model="filters.years" class="form-select" multiple>
                        <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
                      </select>
                    </div>

                    <!-- Entités -->
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Entités</label>
                      <div class="d-flex gap-2 mb-2">
                        <button @click="selectAllEntities" type="button" class="btn btn-sm btn-outline-primary">Toutes</button>
                        <button @click="clearEntitySelection" type="button" class="btn btn-sm btn-outline-secondary">Aucune</button>
                      </div>
                      <select v-model="filters.entity_ids" class="form-select" multiple size="5">
                        <option v-for="entity in availableEntities" :key="entity.id" :value="entity.id">
                          {{ entity.name }}{{ entity.sigle ? ` (${entity.sigle})` : '' }}
                        </option>
                      </select>
                      <small class="text-muted d-block mt-1">{{ filters.entity_ids.length }} sélectionnée(s)</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Sélection des colonnes + Prévisualisation -->
    <div v-if="showColumnsSection" class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-3">
          <div class="card-body">

            <!-- Header avec actions -->
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
              <div class="btn-group btn-group-sm">
                <button @click="selectAllColumns" class="btn btn-outline-success">✅ Tout</button>
                <button @click="deselectAllColumns" class="btn btn-outline-danger">❌ Aucun</button>
              </div>
            </div>

            <div class="row">
              <!-- Colonnes -->
              <div class="col-lg-8 mb-3 mb-lg-0">
                <div class="d-flex flex-wrap gap-2 p-2 border rounded" style="max-height: 320px; overflow-y: auto;">
                  <div 
                    v-for="column in availableColumns" 
                    :key="column.key"
                    class="form-check form-check-inline m-0"
                  >
                    <input 
                      type="checkbox" 
                      class="btn-check" 
                      :id="`col-${column.key}`"
                      :value="column.key"
                      v-model="selectedColumns"
                    />
                    <label class="btn btn-outline-primary btn-sm" :for="`col-${column.key}`">
                      {{ column.label }}
                    </label>
                  </div>
                </div>
                <small class="text-muted fst-italic mt-2 d-block">
                  {{ selectedColumns.length }} colonne(s) sélectionnée(s)
                </small>
              </div>

              <!-- Prévisualisation -->
              <div class="col-lg-4 border-start">
                <h6 class="fw-bold mb-3">👁️ Prévisualisation</h6>

                <!-- Filtres appliqués -->
                <div v-if="hasActiveFilters" class="mb-3">
                  <div class="d-flex flex-wrap gap-2">
                    <span v-if="filters.years.length > 0" class="badge bg-secondary">
                      📅 {{ filters.years.length }} année(s)
                    </span>
                    <span v-if="filters.entity_ids.length > 0" class="badge bg-info">
                      🏢 {{ filters.entity_ids.length }} entité(s)
                    </span>
                    <span class="badge bg-warning text-dark">
                      📊 Limite: {{ filters.limit }}
                    </span>
                  </div>
                </div>

                <!-- Boutons -->
                <div class="d-flex flex-wrap gap-2">
                  <button 
                    @click="loadPreview"
                    :disabled="!canPreview || previewLoading"
                    class="btn btn-sm btn-info"
                  >
                    <span v-if="previewLoading">⏳ Chargement...</span>
                    <span v-else>🔍 Aperçu</span>
                  </button>
                  
                  <button 
                    v-if="hasPreviewData"
                    @click="clearPreview"
                    class="btn btn-sm btn-secondary"
                  >
                    🗑️ Effacer
                  </button>
                </div>

                <!-- Erreur -->
                <div v-if="previewError" class="alert alert-danger py-1 px-2 mt-3 small">
                  ❌ {{ previewError }}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>


    <!-- Prévisualisation des données -->
    <div v-if="hasPreviewData" class="row mb-4">
      <div class="col-12">
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
        <div class="d-flex flex-column align-items-center">
          <!-- Bouton principal selon le format sélectionné -->
          <button 
            @click="generateReportAction"
            :disabled="!canGenerate || generating"
            class="btn btn-success btn-lg mb-3"
            style="min-width: 250px"
          >
            <span v-if="generating">
              <i class="fas fa-spinner fa-spin me-2"></i>Génération en cours...
            </span>
            <span v-else>
              <i :class="getFormatIcon(reportConfig.format)" class="me-2"></i>
              Télécharger {{ getFormatLabel(reportConfig.format) }}
            </span>
          </button>

          <!-- Boutons de téléchargement rapide pour tous les formats -->
          <div v-if="!generating && canGenerate" class="btn-group" role="group" aria-label="Téléchargement rapide">
            <button 
              v-for="format in ['pdf', 'excel', 'word']" 
              :key="format"
              @click="quickDownload(format)"
              :class="['btn', format === reportConfig.format ? 'btn-primary' : 'btn-outline-secondary']"
              :title="`Télécharger en ${getFormatLabel(format)}`"
            >
              <i :class="getFormatIcon(format)" class="me-1"></i>
              {{ getFormatLabel(format) }}
            </button>
          </div>
          
          <small class="text-muted mt-2">
            <i class="fas fa-info-circle me-1"></i>
            Le téléchargement inclut le logo officiel du Bénin
          </small>
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
import reportGenerator from '@/services/reportGenerator'

export default {
  name: 'ReportsExtendedView',
  
  data() {
    return {
      selectedReportType: '',
      selectedColumns: [],
      availableColumns: [],
      
      // État d'affichage des sections
      showConfigSection: true,
      
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
    
    // Ajouter un raccourci clavier pour toggle la configuration (Ctrl/Cmd + H)
    document.addEventListener('keydown', this.handleKeydown)
  },

  beforeUnmount() {
    // Nettoyer l'event listener
    document.removeEventListener('keydown', this.handleKeydown)
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
    }
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
    
    // Méthode pour toggle la section de configuration
    toggleConfigSection() {
      this.showConfigSection = !this.showConfigSection
    },
    
    // Gestionnaire de raccourci clavier
    handleKeydown(event) {
      // Ctrl/Cmd + H pour toggle la configuration
      if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
        event.preventDefault()
        this.toggleConfigSection()
      }
    },
    
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
        
        // Validation des données nécessaires
        if (!this.hasPreviewData || !this.previewData?.preview_data?.length) {
          throw new Error('Aucune donnée à exporter. Veuillez d\'abord prévisualiser le rapport.')
        }

        if (!this.reportConfig.title?.trim()) {
          throw new Error('Veuillez entrer un titre pour le rapport.')
        }

        // Configuration du rapport avec informations d'application
        const config = {
          ...this.reportConfig,
          title: this.reportConfig.title,
          format: this.reportConfig.format,
          reportType: this.selectedReportType,
          filters: this.filters,
          columns: this.selectedColumns
        }

        // Générer et télécharger le rapport
        const result = await reportGenerator.downloadReport(this.previewData, config)
        
        // Notification de succès
        this.showNotification({
          type: 'success',
          title: 'Rapport généré !',
          message: `Le fichier "${result.filename}.${config.format}" a été téléchargé avec succès.`
        })
        
      } catch (error) {
        console.error('Erreur de génération:', error)
        this.showNotification({
          type: 'error',
          title: 'Erreur de génération',
          message: error.message || 'Erreur lors de la génération du rapport'
        })
      } finally {
        this.generating = false
      }
    },

    // Méthode pour afficher les notifications
    showNotification(notification) {
      // Si le composant parent gère les notifications
      if (this.$emit) {
        this.$emit('notification', notification)
      } else {
        // Sinon, utiliser une notification simple
        const type = notification.type === 'success' ? '✅' : '❌'
        alert(`${type} ${notification.title}\n${notification.message}`)
      }
    },

    // Méthodes pour gérer les formats et icônes
    getFormatIcon(format) {
      const icons = {
        pdf: 'fas fa-file-pdf',
        excel: 'fas fa-file-excel',
        word: 'fas fa-file-word'
      }
      return icons[format] || 'fas fa-file'
    },

    getFormatLabel(format) {
      const labels = {
        pdf: 'PDF',
        excel: 'Excel',
        word: 'Word'
      }
      return labels[format] || format.toUpperCase()
    },

    // Téléchargement rapide dans un format spécifique
    async quickDownload(format) {
      const originalFormat = this.reportConfig.format
      this.reportConfig.format = format
      
      try {
        await this.generateReportAction()
      } finally {
        // Restaurer le format original
        this.reportConfig.format = originalFormat
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

/* ===============================
   STYLES POUR SECTIONS PLIABLES
   =============================== */

/* Animation de transition pour le contenu pliable */
.collapse-content {
  transition: all 0.3s ease;
  overflow: hidden;
}

/* Styles pour le bouton toggle */
.btn-outline-primary {
  transition: all 0.2s ease;
}

.btn-outline-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.2);
}

/* Animation des icônes chevron */
.fas.fa-chevron-up,
.fas.fa-chevron-down {
  transition: transform 0.2s ease;
}

/* Header de carte avec hover effect */
.card-header {
  transition: background-color 0.2s ease;
}

.card-header:hover {
  background-color: rgba(13, 110, 253, 0.05) !important;
}

/* Animation d'entrée */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* Application des animations */
.collapse-content {
  animation: slideDown 0.3s ease;
}

/* Effet de focus pour le bouton toggle */
.btn-outline-primary:focus {
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* Style pour les icônes dans les titres */
.text-primary i {
  color: #0d6efd !important;
}
</style>