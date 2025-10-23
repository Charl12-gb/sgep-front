<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Gestion des Entités</h2>
        <p class="text-muted mb-0">Liste complète des entités publiques</p>
      </div>
      <div class="d-flex gap-2">
        <button @click="showImportModal" class="btn btn-success">
          <i class="fas fa-upload me-2"></i>
          Importer
        </button>
        <router-link to="/entities/create" class="btn btn-primary">
          <i class="fas fa-plus me-2"></i>
          Créer une entité
        </router-link>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="bg-primary bg-opacity-10 rounded p-3 me-3">
                <i class="fas fa-building text-primary fa-2x"></i>
              </div>
              <div>
                <h3 class="mb-0">{{ entitiesStats?.total || 0 }}</h3>
                <small class="text-muted">Total Entités</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="bg-success bg-opacity-10 rounded p-3 me-3">
                <i class="fas fa-chart-line text-success fa-2x"></i>
              </div>
              <div>
                <h3 class="mb-0">{{ typesCount }}</h3>
                <small class="text-muted">Types d'entités</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="bg-info bg-opacity-10 rounded p-3 me-3">
                <i class="fas fa-users text-info fa-2x"></i>
              </div>
              <div>
                <h3 class="mb-0">{{ entitiesStats?.effectifs?.with_effectifs || 0 }}</h3>
                <small class="text-muted">Avec Effectifs</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="bg-warning bg-opacity-10 rounded p-3 me-3">
                <i class="fas fa-briefcase text-warning fa-2x"></i>
              </div>
              <div>
                <h3 class="mb-0">{{ secteursCount }}</h3>
                <small class="text-muted">Secteurs d'activité</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label small fw-semibold">Recherche</label>
            <input 
              v-model="filters.search" 
              @input="debouncedSearch"
              type="text" 
              class="form-control" 
              placeholder="Rechercher par nom, sigle..."
            >
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-semibold">Type</label>
            <select v-model="filters.type" @change="applyFilters" class="form-select">
              <option value="">Tous les types</option>
              <option v-for="type in filterOptions.types" :key="type" :value="type">
                {{ formatEntityType(type) }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Tutelle</label>
            <select v-model="filters.tutelle" @change="applyFilters" class="form-select">
              <option value="">Toutes les tutelles</option>
              <option v-for="tutelle in filterOptions.tutelles" :key="tutelle" :value="tutelle">
                {{ tutelle }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Secteur</label>
            <select v-model="filters.secteur_activite" @change="applyFilters" class="form-select">
              <option value="">Tous les secteurs</option>
              <option v-for="secteur in filterOptions.secteurs_activite" :key="secteur" :value="secteur">
                {{ secteur }}
              </option>
            </select>
          </div>
        </div>
        <div class="mt-3 d-flex justify-content-between align-items-center">
          <div>
            <span v-if="activeFiltersCount > 0" class="badge bg-primary me-2">
              {{ activeFiltersCount }} filtre(s) actif(s)
            </span>
          </div>
          <button @click="resetFilters" class="btn btn-sm btn-outline-secondary">
            <i class="fas fa-redo me-1"></i>
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Tableau des entités -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <div class="mt-2 text-muted">Chargement...</div>
        </div>

        <div v-else-if="entities.length === 0" class="text-center py-5">
          <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
          <p class="text-muted">Aucune entité trouvée</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-light">
              <tr>
                <th class="border-0">Nom</th>
                <th class="border-0">Sigle</th>
                <th class="border-0">Type</th>
                <th class="border-0">Tutelle</th>
                <th class="border-0">Secteur</th>
                <th class="border-0">Date création</th>
                <th class="border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entity in entities" :key="entity.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2" 
                         style="width: 40px; height: 40px;">
                      <i class="fas fa-building text-primary"></i>
                    </div>
                    <div>
                      <div class="fw-semibold">{{ entity.name }}</div>
                      <small class="text-muted">{{ entity.email || '-' }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge bg-secondary">{{ entity.sigle }}</span>
                </td>
                <td>{{ formatEntityType(entity.type) }}</td>
                <td>{{ entity.tutelle || 'N/A' }}</td>
                <td>{{ entity.secteur_activite || 'N/A' }}</td>
                <td>{{ formatDate(entity.created_at) }}</td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button 
                      @click="viewDetails(entity)" 
                      class="btn btn-outline-info"
                      title="Voir les détails"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <router-link 
                      :to="`/entities/${entity.id}/edit`" 
                      class="btn btn-outline-primary"
                      title="Modifier"
                    >
                      <i class="fas fa-edit"></i>
                    </router-link>
                    <button 
                      @click="confirmDelete(entity)" 
                      class="btn btn-outline-danger"
                      title="Supprimer"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="entities.length > 0" class="card-footer bg-white border-top">
        <div class="d-flex justify-content-between align-items-center">
          <div class="text-muted small">
            Affichage de {{ (pagination.current_page - 1) * pagination.per_page + 1 }} 
            à {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} 
            sur {{ pagination.total }} entités
          </div>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                <button 
                  @click="changePage(pagination.current_page - 1)" 
                  class="page-link"
                  :disabled="pagination.current_page === 1"
                >
                  Précédent
                </button>
              </li>
              <li 
                v-for="page in visiblePages" 
                :key="page" 
                class="page-item" 
                :class="{ active: page === pagination.current_page }"
              >
                <button @click="changePage(page)" class="page-link">
                  {{ page }}
                </button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.total_pages }">
                <button 
                  @click="changePage(pagination.current_page + 1)" 
                  class="page-link"
                  :disabled="pagination.current_page === pagination.total_pages"
                >
                  Suivant
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmer la suppression</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer cette entité ?</p>
            <div v-if="entityToDelete" class="alert alert-warning">
              <strong>{{ entityToDelete.name }}</strong> ({{ entityToDelete.sigle }})
            </div>
            <p class="text-danger small mb-0">
              <i class="fas fa-exclamation-triangle me-1"></i>
              Cette action est irréversible et supprimera toutes les données associées.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="button" @click="deleteEntity" class="btn btn-danger" :disabled="deleting">
              <i v-if="deleting" class="fas fa-spinner fa-spin me-1"></i>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de détails de l'entité -->
    <div class="modal fade" id="detailsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <div>
              <h5 class="modal-title mb-1">
                <i class="fas fa-building me-2"></i>
                {{ selectedEntity?.name }}
              </h5>
              <small v-if="selectedEntity" class="opacity-75">{{ selectedEntity.sigle }} - {{ formatEntityType(selectedEntity.type) }}</small>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          
          <div v-if="loadingDetails" class="modal-body text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <div class="mt-2 text-muted">Chargement des détails...</div>
          </div>

          <div v-else-if="selectedEntity" class="modal-body p-4">
            <div class="row g-4">
              <!-- Colonne de gauche -->
              <div class="col-md-6">
                <!-- Informations principales -->
                <div class="card border-0 shadow-sm mb-3">
                  <div class="card-header bg-light">
                    <h6 class="mb-0 fw-semibold">
                      <i class="fas fa-info-circle text-primary me-2"></i>
                      Informations principales
                    </h6>
                  </div>
                  <div class="card-body">
                    <div class="row g-3">
                      <div class="col-12">
                        <label class="text-muted small mb-1">Type d'entité</label>
                        <div class="fw-semibold">
                          <span class="badge bg-primary">{{ formatEntityType(selectedEntity.type) }}</span>
                        </div>
                      </div>
                      <div class="col-6">
                        <label class="text-muted small mb-1">Tutelle</label>
                        <div class="fw-semibold">{{ selectedEntity.tutelle || 'N/A' }}</div>
                      </div>
                      <div class="col-6">
                        <label class="text-muted small mb-1">Secteur d'activité</label>
                        <div class="fw-semibold">{{ selectedEntity.secteur_activite || 'N/A' }}</div>
                      </div>
                      <div class="col-12">
                        <label class="text-muted small mb-1">Capital social / Dotation initiale</label>
                        <div class="fw-semibold text-success">
                          {{ formatCurrency(selectedEntity.capital_social) }}
                        </div>
                      </div>
                      <div class="col-12">
                        <label class="text-muted small mb-1">Objet social</label>
                        <div class="text-muted" style="white-space: pre-wrap;">{{ selectedEntity.objet_social || 'N/A' }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Coordonnées -->
                <div class="card border-0 shadow-sm">
                  <div class="card-header bg-light">
                    <h6 class="mb-0 fw-semibold">
                      <i class="fas fa-address-card text-info me-2"></i>
                      Coordonnées
                    </h6>
                  </div>
                  <div class="card-body">
                    <div class="row g-3">
                      <div class="col-12">
                        <label class="text-muted small mb-1">
                          <i class="fas fa-envelope me-1"></i>
                          Email
                        </label>
                        <div class="fw-semibold">{{ selectedEntity.email || 'N/A' }}</div>
                      </div>
                      <div class="col-12">
                        <label class="text-muted small mb-1">
                          <i class="fas fa-phone me-1"></i>
                          Téléphone
                        </label>
                        <div class="fw-semibold">{{ selectedEntity.phone || 'N/A' }}</div>
                      </div>
                      <div class="col-12">
                        <label class="text-muted small mb-1">
                          <i class="fas fa-map-marker-alt me-1"></i>
                          Adresse
                        </label>
                        <div class="text-muted">{{ selectedEntity.address || 'N/A' }}</div>
                      </div>
                      <div class="col-12" v-if="selectedEntity.description">
                        <label class="text-muted small mb-1">
                          <i class="fas fa-comment me-1"></i>
                          Description
                        </label>
                        <div class="text-muted">{{ selectedEntity.description }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Colonne de droite -->
              <div class="col-md-6">
                <!-- Effectifs -->
                <div class="card border-0 shadow-sm mb-3">
                  <div class="card-header bg-light">
                    <h6 class="mb-0 fw-semibold">
                      <i class="fas fa-users text-success me-2"></i>
                      Effectifs
                    </h6>
                  </div>
                  <div class="card-body">
                    <div v-if="selectedEntity.effectifs && selectedEntity.effectifs.length > 0">
                      <div v-for="(eff, idx) in selectedEntity.effectifs" :key="idx" class="mb-3 pb-3" :class="{ 'border-bottom': idx < selectedEntity.effectifs.length - 1 }">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                          <span class="badge bg-info">Année {{ eff.annee }}</span>
                          <h4 class="mb-0 text-primary">{{ eff.nombre_total }}</h4>
                        </div>
                        <div class="row g-2 text-center">
                          <div class="col-6">
                            <div class="p-2 bg-light rounded">
                              <div class="text-muted small">Hommes</div>
                              <div class="fw-bold text-primary">{{ eff.nombre_homme }}</div>
                            </div>
                          </div>
                          <div class="col-6">
                            <div class="p-2 bg-light rounded">
                              <div class="text-muted small">Femmes</div>
                              <div class="fw-bold text-danger">{{ eff.nombre_femme }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-center text-muted py-3">
                      <i class="fas fa-users fa-2x mb-2 opacity-50"></i>
                      <p class="mb-0">Aucun effectif enregistré</p>
                    </div>
                  </div>
                </div>

                <!-- Direction générale -->
                <div class="card border-0 shadow-sm mb-3">
                  <div class="card-header bg-light">
                    <h6 class="mb-0 fw-semibold">
                      <i class="fas fa-user-tie text-warning me-2"></i>
                      Direction générale
                    </h6>
                  </div>
                  <div class="card-body">
                    <div v-if="selectedEntity.direction_generale && selectedEntity.direction_generale.length > 0">
                      <div v-for="(dir, idx) in selectedEntity.direction_generale" :key="idx" class="mb-2">
                        <div class="d-flex align-items-center">
                          <div class="bg-warning bg-opacity-10 rounded-circle p-2 me-2">
                            <i class="fas fa-user text-warning"></i>
                          </div>
                          <div>
                            <div class="fw-semibold">{{ dir.nom_complet || 'N/A' }}</div>
                            <small class="text-muted">{{ dir.poste || 'N/A' }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-center text-muted py-3">
                      <i class="fas fa-user-tie fa-2x mb-2 opacity-50"></i>
                      <p class="mb-0">Aucune direction enregistrée</p>
                    </div>
                  </div>
                </div>

                <!-- Informations système -->
                <div class="card border-0 shadow-sm">
                  <div class="card-header bg-light">
                    <h6 class="mb-0 fw-semibold">
                      <i class="fas fa-clock text-secondary me-2"></i>
                      Informations système
                    </h6>
                  </div>
                  <div class="card-body">
                    <div class="row g-2">
                      <div class="col-12">
                        <label class="text-muted small mb-1">Date de création</label>
                        <div class="fw-semibold">{{ formatDateTime(selectedEntity.created_at) }}</div>
                      </div>
                      <div class="col-12">
                        <label class="text-muted small mb-1">Dernière modification</label>
                        <div class="fw-semibold">{{ formatDateTime(selectedEntity.updated_at) }}</div>
                      </div>
                      <div class="col-12">
                        <label class="text-muted small mb-1">Identifiant</label>
                        <div class="small font-monospace text-muted">{{ selectedEntity.id }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-1"></i>
              Fermer
            </button>
            <router-link 
              v-if="selectedEntity" 
              :to="`/entities/${selectedEntity.id}/edit`" 
              class="btn btn-primary"
              @click="closeDetailsModal"
            >
              <i class="fas fa-edit me-1"></i>
              Modifier
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'importation -->
    <div class="modal fade" id="importModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">
              <i class="fas fa-upload me-2"></i>
              Importer des entités
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          
          <div class="modal-body">
            <!-- Étapes d'importation -->
            <div v-if="!importResult" class="import-steps">
              <!-- Étape 1: Télécharger le modèle -->
              <div class="alert alert-info">
                <h6 class="alert-heading">
                  <i class="fas fa-info-circle me-2"></i>
                  Instructions d'importation
                </h6>
                <p class="mb-2">Pour importer vos entités, suivez ces étapes :</p>
                <ol class="mb-3">
                  <li>Téléchargez le modèle Excel ci-dessous</li>
                  <li>Remplissez le fichier avec vos données</li>
                  <li>Téléchargez le fichier rempli</li>
                </ol>
                
                <div class="alert alert-warning mb-3">
                  <h6 class="mb-2">
                    <i class="fas fa-users me-2"></i>
                    Formats d'effectifs supportés
                  </h6>
                  <p class="mb-2 small">Le système reconnaît automatiquement ces formats :</p>
                  <ul class="mb-0 small">
                    <li><strong>Format simple :</strong> <code>150</code></li>
                    <li><strong>Format structuré :</strong> <code>Total: 44\nH:36\nF:08</code></li>
                    <li><strong>Format compact :</strong> <code>Total: 193 H:172 F:21</code></li>
                    <li><strong>Avec caractères spéciaux :</strong> <code>?????????\nTotal: 674\nH:517\nF:157</code></li>
                  </ul>
                </div>
                
                <button @click="downloadTemplate" class="btn btn-info btn-sm" :disabled="downloadingTemplate">
                  <i v-if="downloadingTemplate" class="fas fa-spinner fa-spin me-1"></i>
                  <i v-else class="fas fa-download me-1"></i>
                  Télécharger le modèle
                </button>
              </div>

              <!-- Étape 2: Format flexible -->
              <div class="alert alert-success">
                <h6 class="alert-heading">
                  <i class="fas fa-magic me-2"></i>
                  Importation flexible
                </h6>
                <p class="mb-2">Notre système s'adapte automatiquement :</p>
                <ul class="mb-0">
                  <li>Détection automatique de la ligne d'en-tête</li>
                  <li>Reconnaissance de multiples noms de colonnes</li>
                  <li>Support des fichiers Excel (.xlsx, .xls) et CSV</li>
                  <li>Colonnes dans n'importe quel ordre</li>
                  <li><strong>Gestion automatique des effectifs</strong> (total, hommes, femmes)</li>
                </ul>
              </div>

              <!-- Étape 3: Sélection du fichier -->
              <div class="mb-4">
                <label class="form-label fw-semibold">
                  <i class="fas fa-file-upload me-2"></i>
                  Sélectionner le fichier à importer
                </label>
                <input
                  ref="fileInput"
                  type="file"
                  class="form-control"
                  accept=".xlsx,.xls,.csv"
                  @change="handleFileSelection"
                />
                <div class="form-text">
                  Formats acceptés: .xlsx, .xls, .csv (max 10MB)
                </div>
              </div>

              <!-- Aperçu du fichier sélectionné -->
              <div v-if="selectedFile" class="card border-success mb-3">
                <div class="card-body">
                  <h6 class="card-title text-success">
                    <i class="fas fa-file-check me-2"></i>
                    Fichier sélectionné
                  </h6>
                  <p class="card-text mb-1">
                    <strong>Nom:</strong> {{ selectedFile.name }}
                  </p>
                  <p class="card-text mb-0">
                    <strong>Taille:</strong> {{ formatFileSize(selectedFile.size) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Résultat d'importation -->
            <div v-if="importResult" class="import-result">
              <div v-if="importResult.status === 'success'" class="alert alert-success">
                <h6 class="alert-heading">
                  <i class="fas fa-check-circle me-2"></i>
                  Importation terminée avec succès !
                </h6>
                <div class="row text-center mt-3">
                  <div class="col-3">
                    <div class="fs-3 text-success fw-bold">{{ importResult.result.entities_created || 0 }}</div>
                    <small class="text-muted">Nouvelles entités</small>
                  </div>
                  <div class="col-3">
                    <div class="fs-3 text-warning fw-bold">{{ importResult.result.entities_already_existed || 0 }}</div>
                    <small class="text-muted">Déjà existantes</small>
                  </div>
                  <div class="col-3">
                    <div class="fs-3 text-danger fw-bold">{{ importResult.result.failed_imports }}</div>
                    <small class="text-muted">Échouées</small>
                  </div>
                  <div class="col-3">
                    <div class="fs-3 text-info fw-bold">{{ importResult.result.total_rows }}</div>
                    <small class="text-muted">Total lignes</small>
                  </div>
                </div>
                
                <!-- Résumé détaillé -->
                <div v-if="importResult.result.summary" class="mt-3 pt-3 border-top">
                  <h6 class="text-primary mb-2">
                    <i class="fas fa-chart-pie me-2"></i>
                    Résumé détaillé
                  </h6>
                  <div class="row text-center">
                    <div class="col-6">
                      <div class="p-2 bg-success bg-opacity-10 rounded">
                        <div class="text-success fw-bold">{{ importResult.result.summary.new_entities }}</div>
                        <small class="text-muted">Entités créées</small>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="p-2 bg-warning bg-opacity-10 rounded">
                        <div class="text-warning fw-bold">{{ importResult.result.summary.existing_entities }}</div>
                        <small class="text-muted">Entités existantes</small>
                      </div>
                    </div>
                  </div>
                  <div class="row text-center mt-2">
                    <div class="col-12">
                      <div class="p-2 bg-info bg-opacity-10 rounded">
                        <div class="text-info fw-bold">{{ importResult.result.summary.total_effectifs_added }}</div>
                        <small class="text-muted">Effectifs ajoutés au total</small>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Statistiques des effectifs importés -->
                <div v-if="getEffectifsStats(importResult.result.success_details).total > 0" class="mt-3 pt-3 border-top">
                  <h6 class="text-info mb-2">
                    <i class="fas fa-users me-2"></i>
                    Effectifs importés
                  </h6>
                  <div class="row text-center">
                    <div class="col-4">
                      <div class="fs-5 text-info fw-bold">{{ getEffectifsStats(importResult.result.success_details).total }}</div>
                      <small class="text-muted">Effectifs créés</small>
                    </div>
                    <div class="col-4">
                      <div class="fs-5 text-primary fw-bold">{{ getEffectifsStats(importResult.result.success_details).hommes }}</div>
                      <small class="text-muted">Hommes</small>
                    </div>
                    <div class="col-4">
                      <div class="fs-5 text-danger fw-bold">{{ getEffectifsStats(importResult.result.success_details).femmes }}</div>
                      <small class="text-muted">Femmes</small>
                    </div>
                  </div>
                </div>
                
                <!-- Détails des entités traitées -->
                <div v-if="importResult.result.success_details && importResult.result.success_details.length > 0" class="mt-3 pt-3 border-top">
                  <h6 class="text-success mb-2">
                    <i class="fas fa-check-circle me-2"></i>
                    Détails des entités traitées
                  </h6>
                  <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
                    <table class="table table-sm table-striped">
                      <thead>
                        <tr>
                          <th>Ligne</th>
                          <th>Entité</th>
                          <th>Statut</th>
                          <th>Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="success in importResult.result.success_details" :key="success.row">
                          <td>{{ success.row }}</td>
                          <td>{{ success.data.name || 'N/A' }}</td>
                          <td>
                            <span v-if="success.status === 'created'" class="badge bg-success">
                              <i class="fas fa-plus me-1"></i>Créée
                            </span>
                            <span v-else-if="success.status === 'already_exists'" class="badge bg-warning">
                              <i class="fas fa-info-circle me-1"></i>Existante
                            </span>
                            <span v-else class="badge bg-secondary">Traitée</span>
                          </td>
                          <td class="small">{{ success.message || 'Traitée avec succès' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Détails des erreurs -->
              <div v-if="importResult.result.failed_imports > 0" class="mt-3">
                <h6 class="text-danger">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  Lignes avec erreurs :
                </h6>
                <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                  <table class="table table-sm table-striped">
                    <thead>
                      <tr>
                        <th>Ligne</th>
                        <th>Entité</th>
                        <th>Erreurs</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="error in importResult.result.error_details" :key="error.row">
                        <td>{{ error.row }}</td>
                        <td>{{ error.data.name || 'N/A' }}</td>
                        <td>
                          <ul class="mb-0 ps-3">
                            <li v-for="err in error.errors" :key="err" class="text-danger small">{{ err }}</li>
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Détails techniques -->
              <div class="mt-3">
                <button 
                  class="btn btn-sm btn-outline-info" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#technicalDetails"
                >
                  <i class="fas fa-cog me-1"></i>
                  Détails techniques
                </button>
                <div class="collapse mt-2" id="technicalDetails">
                  <div class="card card-body bg-light">
                    <p class="mb-1"><strong>Ligne d'en-tête détectée:</strong> {{ importResult.result.header_row }}</p>
                    <p class="mb-1"><strong>Mapping des colonnes:</strong></p>
                    <ul class="mb-0 small">
                      <li v-for="(column, field) in importResult.result.column_mapping" :key="field">
                        <code>{{ field }}</code> ← {{ column }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button v-if="!importResult" type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Annuler
            </button>
            <button 
              v-if="!importResult" 
              @click="startImport" 
              :disabled="!selectedFile || importing" 
              class="btn btn-success"
            >
              <i v-if="importing" class="fas fa-spinner fa-spin me-1"></i>
              <i v-else class="fas fa-upload me-1"></i>
              {{ importing ? 'Importation...' : 'Lancer l\'importation' }}
            </button>
            <button v-if="importResult" @click="closeImportModal" class="btn btn-primary">
              <i class="fas fa-check me-1"></i>
              Terminer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import { useNotyf } from '@/mixins/useNotyf'
import { VUE_APP_BASE_API_URL } from '@/env'

export default {
  name: 'EntitiesListView',
  setup() {
    const store = useStore()
    const router = useRouter()
    const { notifySuccess, notifyError } = useNotyf()

    const loading = ref(false)
    const deleting = ref(false)
    const entityToDelete = ref(null)
    let deleteModalInstance = null

    // Variables pour le modal de détails
    const selectedEntity = ref(null)
    const loadingDetails = ref(false)
    let detailsModalInstance = null

    // Variables pour l'importation
    const selectedFile = ref(null)
    const importing = ref(false)
    const downloadingTemplate = ref(false)
    const importResult = ref(null)
    let importModalInstance = null

    // Récupérer les données du store
    const entities = computed(() => store.getters['entities/entities'])
    const pagination = computed(() => store.getters['entities/pagination'])
    const filters = computed(() => store.getters['entities/filters'])
    const filterOptions = computed(() => store.getters['entities/filterOptions'])
    const entitiesStats = computed(() => store.getters['entities/entitiesStats'])
    const activeFiltersCount = computed(() => store.getters['entities/activeFiltersCount'])

    // Calculer le nombre de types
    const typesCount = computed(() => {
      if (!entitiesStats.value || !entitiesStats.value.by_type) return 0
      return Object.keys(entitiesStats.value.by_type).length
    })

    // Calculer le nombre de secteurs
    const secteursCount = computed(() => {
      if (!entitiesStats.value || !entitiesStats.value.by_secteur) return 0
      return Object.keys(entitiesStats.value.by_secteur).length
    })

    // Pagination visible
    const visiblePages = computed(() => {
      const pages = []
      const total = pagination.value.total_pages
      const current = pagination.value.current_page

      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i)
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i)
          pages.push('...', total)
        } else if (current >= total - 3) {
          pages.push(1, '...')
          for (let i = total - 4; i <= total; i++) pages.push(i)
        } else {
          pages.push(1, '...', current - 1, current, current + 1, '...', total)
        }
      }

      return pages.filter(p => p !== '...' || pages.indexOf(p) === pages.lastIndexOf(p))
    })

    // Formater le type d'entité
    const formatEntityType = (type) => {
      if (!type) return 'N/A'
      switch (type) {
        case 'Establishment':
          return 'Établissement'
        case 'Society':
          return 'Société'
        default:
          return type
      }
    }

    // Formater la date
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // Formater la date et l'heure
    const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Formater la devise
    const formatCurrency = (amount) => {
      if (!amount || amount === 0) return 'N/A'
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }

    // Charger les entités
    const loadEntities = async () => {
      loading.value = true
      try {
        await store.dispatch('entities/fetchEntities')
        await store.dispatch('entities/fetchEntitiesStats')
        await store.dispatch('entities/fetchFilterOptions')
      } catch (error) {
        console.error('Erreur lors du chargement des entités:', error)
        notifyError('Erreur lors du chargement des entités')
      } finally {
        loading.value = false
      }
    }

    // Recherche avec debounce
    let searchTimeout = null
    const debouncedSearch = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        applyFilters()
      }, 500)
    }

    // Appliquer les filtres
    const applyFilters = async () => {
      loading.value = true
      try {
        await store.dispatch('entities/fetchEntities')
      } catch (error) {
        console.error('Erreur lors de l\'application des filtres:', error)
        notifyError('Erreur lors de l\'application des filtres')
      } finally {
        loading.value = false
      }
    }

    // Réinitialiser les filtres
    const resetFilters = async () => {
      store.commit('entities/RESET_FILTERS')
      await loadEntities()
    }

    // Changer de page
    const changePage = async (page) => {
      if (page < 1 || page > pagination.value.total_pages || page === '...') return
      
      loading.value = true
      try {
        await store.dispatch('entities/goToPage', page)
      } catch (error) {
        console.error('Erreur lors du changement de page:', error)
        notifyError('Erreur lors du changement de page')
      } finally {
        loading.value = false
      }
    }

    // Confirmer la suppression
    const confirmDelete = (entity) => {
      entityToDelete.value = entity
      const modalElement = document.getElementById('deleteModal')
      if (modalElement) {
        deleteModalInstance = new Modal(modalElement)
        deleteModalInstance.show()
      }
    }

    // Supprimer l'entité
    const deleteEntity = async () => {
      if (!entityToDelete.value) return

      deleting.value = true
      try {
        await store.dispatch('entities/deleteEntity', entityToDelete.value.id)
        notifySuccess('Entité supprimée avec succès')
        
        if (deleteModalInstance) {
          deleteModalInstance.hide()
        }
        
        entityToDelete.value = null
        await loadEntities()
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        notifyError('Erreur lors de la suppression de l\'entité')
      } finally {
        deleting.value = false
      }
    }

    // Voir les détails d'une entité
    const viewDetails = async (entity) => {
      loadingDetails.value = true
      selectedEntity.value = null
      
      const modalElement = document.getElementById('detailsModal')
      if (modalElement) {
        detailsModalInstance = new Modal(modalElement)
        detailsModalInstance.show()
      }

      try {
        // Charger les détails complets de l'entité
        const fullEntity = await store.dispatch('entities/fetchEntityById', entity.id)
        selectedEntity.value = fullEntity
      } catch (error) {
        console.error('Erreur lors du chargement des détails:', error)
        notifyError('Erreur lors du chargement des détails')
        if (detailsModalInstance) {
          detailsModalInstance.hide()
        }
      } finally {
        loadingDetails.value = false
      }
    }

    // Fermer le modal de détails
    const closeDetailsModal = () => {
      if (detailsModalInstance) {
        detailsModalInstance.hide()
      }
      selectedEntity.value = null
    }

    // === MÉTHODES D'IMPORTATION ===

    // Afficher le modal d'importation
    const showImportModal = () => {
      selectedFile.value = null
      importing.value = false
      importResult.value = null
      
      if (!importModalInstance) {
        importModalInstance = new Modal(document.getElementById('importModal'))
      }
      importModalInstance.show()
    }

    // Fermer le modal d'importation
    const closeImportModal = () => {
      if (importModalInstance) {
        importModalInstance.hide()
      }
      
      // Si l'importation a réussi, recharger la liste
      if (importResult.value?.result?.successful_imports > 0) {
        loadEntities()
      }
      
      // Reset
      selectedFile.value = null
      importing.value = false
      importResult.value = null
    }

    // Gérer la sélection de fichier
    const handleFileSelection = (event) => {
      const file = event.target.files[0]
      if (file) {
        // Vérifier le type de fichier
        const allowedTypes = ['.xlsx', '.xls', '.csv']
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
        
        if (!allowedTypes.includes(fileExtension)) {
          notifyError('Type de fichier non supporté. Utilisez .xlsx, .xls ou .csv')
          event.target.value = ''
          return
        }
        
        // Vérifier la taille (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          notifyError('Le fichier est trop volumineux. Taille maximale: 10MB')
          event.target.value = ''
          return
        }
        
        selectedFile.value = file
      }
    }

    // Formater la taille du fichier
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // Télécharger le modèle
    const downloadTemplate = async () => {
      downloadingTemplate.value = true
      try {
        const response = await fetch(`${VUE_APP_BASE_API_URL}/entities/import/template`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${store.getters['auth/token']}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Erreur lors du téléchargement du modèle')
        }
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'modele_import_entites.xlsx'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        notifySuccess('Modèle téléchargé avec succès')
      } catch (error) {
        console.error('Erreur:', error)
        notifyError('Erreur lors du téléchargement du modèle')
      } finally {
        downloadingTemplate.value = false
      }
    }

    // Lancer l'importation
    const startImport = async () => {
      if (!selectedFile.value) {
        notifyError('Veuillez sélectionner un fichier')
        return
      }
      
      importing.value = true
      
      try {
        const formData = new FormData()
        formData.append('file', selectedFile.value)
        
        const response = await fetch(`${VUE_APP_BASE_API_URL}/entities/import`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${store.getters['auth/token']}`
          },
          body: formData
        })
        
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.detail || 'Erreur lors de l\'importation')
        }
        
        importResult.value = result
        
        if (result.result.successful_imports > 0) {
          notifySuccess(`${result.result.successful_imports} entité(s) importée(s) avec succès`)
        }
        
        if (result.result.failed_imports > 0) {
          notifyError(`${result.result.failed_imports} ligne(s) ont échoué`)
        }
        
      } catch (error) {
        console.error('Erreur:', error)
        notifyError(error.message || 'Erreur lors de l\'importation')
      } finally {
        importing.value = false
      }
    }

    // Calculer les statistiques des effectifs importés
    const getEffectifsStats = (successDetails) => {
      let totalEffectifs = 0
      let totalHommes = 0
      let totalFemmes = 0
      
      if (successDetails) {
        successDetails.forEach(detail => {
          if (detail.effectifs) {
            detail.effectifs.forEach(eff => {
              totalEffectifs += eff.nombre_total || 0
              totalHommes += eff.nombre_homme || 0
              totalFemmes += eff.nombre_femme || 0
            })
          }
        })
      }
      
      return {
        total: totalEffectifs,
        hommes: totalHommes,
        femmes: totalFemmes
      }
    }

    onMounted(() => {
      loadEntities()
    })

    return {
      loading,
      deleting,
      entities,
      pagination,
      filters,
      filterOptions,
      entitiesStats,
      activeFiltersCount,
      typesCount,
      secteursCount,
      visiblePages,
      entityToDelete,
      selectedEntity,
      loadingDetails,
      selectedFile,
      importing,
      downloadingTemplate,
      importResult,
      formatEntityType,
      formatDate,
      formatDateTime,
      formatCurrency,
      loadEntities,
      debouncedSearch,
      applyFilters,
      resetFilters,
      changePage,
      confirmDelete,
      deleteEntity,
      viewDetails,
      closeDetailsModal,
      showImportModal,
      closeImportModal,
      handleFileSelection,
      formatFileSize,
      downloadTemplate,
      startImport,
      getEffectifsStats
    }
  }
}
</script>

<style scoped>
.table tbody tr {
  transition: background-color 0.2s;
}

.table tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}

.page-link {
  cursor: pointer;
}

.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

/* Styles pour le modal d'importation */
.import-steps {
  max-height: 60vh;
  overflow-y: auto;
}

.import-result {
  max-height: 70vh;
  overflow-y: auto;
}

.alert-heading {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.table-responsive {
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

code {
  color: #e83e8c;
  background-color: #f8f9fa;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}
</style>
