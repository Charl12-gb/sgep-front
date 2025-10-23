<template>
  <div class="container-fluid py-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
    
    <div v-else-if="form" class="entity-form">
      <!-- En-tête -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="h3 mb-1 text-dark fw-bold">
                {{ isEdit ? 'Modifier l\'entité' : 'Créer une entité' }}
              </h1>
              <p class="text-muted mb-0">
                {{ isEdit ? 'Modifiez les informations de l\'entité' : 'Remplissez les informations pour créer une nouvelle entité' }}
              </p>
            </div>
            <button @click="goBack" class="btn btn-outline-secondary">
              <i class="fas fa-times me-1"></i>
              Annuler
            </button>
          </div>
        </div>
      </div>
      
      <!-- Formulaire -->
      <form @submit.prevent="submitForm">
        <div class="row g-4">
          <div class="col-lg-8">
            <!-- Informations principales -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-header bg-white py-3 border-bottom">
                <h5 class="mb-0 fw-semibold text-dark">Informations principales</h5>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-8">
                    <label for="name" class="form-label fw-semibold">
                      Nom de l'entité <span class="text-danger">*</span>
                    </label>
                    <input
                      id="name"
                      v-model="form.name"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.name }"
                      placeholder="Nom de l'entité"
                      required
                    />
                    <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
                  </div>
                  
                  <div class="col-md-4">
                    <label for="sigle" class="form-label fw-semibold">Sigle</label>
                    <input
                      id="sigle"
                      v-model="form.sigle"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.sigle }"
                      placeholder="Ex: SARL, SA..."
                    />
                    <div v-if="errors.sigle" class="invalid-feedback">{{ errors.sigle }}</div>
                  </div>
                  
                  <div class="col-md-6">
                    <label for="type" class="form-label fw-semibold">
                      Type d'entité <span class="text-danger">*</span>
                    </label>
                    <select
                      id="type"
                      v-model="form.type"
                      class="form-select"
                      :class="{ 'is-invalid': errors.type }"
                      required
                    >
                      <option value="">Sélectionner un type</option>
                      <option value="Establishment">Établissement</option>
                      <option value="Society">Société</option>
                    </select>
                    <div v-if="errors.type" class="invalid-feedback">{{ errors.type }}</div>
                  </div>
                  
                  <div class="col-md-4">
                    <label for="tutelle" class="form-label fw-semibold">Tutelle</label>
                    <input
                      id="tutelle"
                      v-model="form.tutelle"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.tutelle }"
                      placeholder="Organisme de tutelle"
                    />
                    <div v-if="errors.tutelle" class="invalid-feedback">{{ errors.tutelle }}</div>
                  </div>
                  
                  <div class="col-md-4">
                    <label for="capital_social" class="form-label fw-semibold">Capital social / Dotation initiale (XOF)</label>
                    <input
                      id="capital_social"
                      v-model.number="form.capital_social"
                      type="number"
                      class="form-control"
                      :class="{ 'is-invalid': errors.capital_social }"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    <div v-if="errors.capital_social" class="invalid-feedback">{{ errors.capital_social }}</div>
                  </div>
                </div>
                
                <div class="mt-4">
                  <label for="objet_social" class="form-label fw-semibold">Objet social</label>
                  <textarea
                    id="objet_social"
                    v-model="form.objet_social"
                    class="form-control"
                    :class="{ 'is-invalid': errors.objet_social }"
                    rows="3"
                    placeholder="Description de l'objet social de l'entité"
                  ></textarea>
                  <div v-if="errors.objet_social" class="invalid-feedback">{{ errors.objet_social }}</div>
                </div>
              </div>
            </div>
            
            <!-- Coordonnées -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-header bg-white py-3 border-bottom">
                <h5 class="mb-0 fw-semibold text-dark">Coordonnées</h5>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label for="email" class="form-label fw-semibold">Email</label>
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      class="form-control"
                      :class="{ 'is-invalid': errors.email }"
                      placeholder="contact@entite.com"
                    />
                    <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
                  </div>
                  
                  <div class="col-md-6">
                    <label for="phone" class="form-label fw-semibold">Téléphone</label>
                    <input
                      id="phone"
                      v-model="form.phone"
                      type="tel"
                      class="form-control"
                      :class="{ 'is-invalid': errors.phone }"
                      placeholder="+213 21 00 00 00"
                    />
                    <div v-if="errors.phone" class="invalid-feedback">{{ errors.phone }}</div>
                  </div>
                </div>
                
                <div class="mt-4">
                  <label for="address" class="form-label fw-semibold">Adresse</label>
                  <textarea
                    id="address"
                    v-model="form.address"
                    class="form-control"
                    :class="{ 'is-invalid': errors.address }"
                    rows="3"
                    placeholder="Adresse complète de l'entité"
                  ></textarea>
                  <div v-if="errors.address" class="invalid-feedback">{{ errors.address }}</div>
                </div>
                
                <div class="mt-4">
                  <label for="description" class="form-label fw-semibold">Description</label>
                  <textarea
                    id="description"
                    v-model="form.description"
                    class="form-control"
                    :class="{ 'is-invalid': errors.description }"
                    rows="4"
                    placeholder="Description générale de l'entité"
                  ></textarea>
                  <div v-if="errors.description" class="invalid-feedback">{{ errors.description }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="col-lg-4">
            <!-- Card Secteur d'activité -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-header bg-white py-3 border-bottom">
                <h6 class="mb-0 fw-semibold text-dark">Secteur d'activité <span class="text-danger">*</span></h6>
              </div>
              <div class="card-body">
                <select
                  id="secteur_activite"
                  v-model="selectedSectors"
                  class="form-select"
                  multiple
                  size="8"
                  style="height: 200px;"
                  :class="{ 'is-invalid': errors.secteur_activite }"
                  required
                >
                  <optgroup 
                    v-for="(sectors, categoryName) in sectorsByCategory" 
                    :key="categoryName" 
                    :label="categoryName"
                  >
                    <option 
                      v-for="sector in sectors" 
                      :key="sector" 
                      :value="sector"
                    >
                      {{ sector }}
                    </option>
                  </optgroup>
                </select>
                <div class="form-text">
                  <i class="fas fa-info-circle me-1"></i>
                  Maintenez Ctrl/Cmd pour sélectionner plusieurs secteurs
                </div>
                
                <!-- Affichage du format final -->
                <div v-if="selectedSectors.length > 0" class="mt-3">
                  <small class="text-muted d-block mb-1">Format final :</small>
                  <div class="p-2 bg-light border rounded">
                    <code class="text-primary">{{ selectedSectors.join('/') }}</code>
                  </div>
                  <div class="mt-2">
                    <span 
                      v-for="secteur in selectedSectors" 
                      :key="secteur" 
                      class="sector-badge me-1 mb-1"
                    >
                      {{ secteur }}
                      <button 
                        type="button" 
                        @click="removeSector(secteur)"
                        class="btn btn-sm ms-1 p-0"
                        style="background: none; border: none; color: inherit; font-size: 0.75rem;"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                </div>
                <div v-if="errors.secteur_activite" class="text-danger small mt-2">{{ errors.secteur_activite }}</div>
              </div>
            </div>
            
            <!-- Card Effectifs ajoutée -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-header bg-white py-3 border-bottom">
                <h6 class="mb-0 fw-semibold text-dark">Effectifs</h6>
              </div>
              <div class="card-body">
                <div v-for="(eff, idx) in effectifs" :key="idx" class="row g-2 align-items-end mb-2">
                  <div class="col-3">
                    <label class="form-label small mb-1">Année</label>
                    <input type="number" v-model.number="eff.annee" class="form-control" min="1900" max="2100" required />
                  </div>
                  <div class="col-3">
                    <label class="form-label small mb-1">Total</label>
                    <input type="number" :value="eff.nombre_homme + eff.nombre_femme" class="form-control" disabled readonly />
                  </div>
                  <div class="col-3">
                    <label class="form-label small mb-1">Hommes</label>
                    <input type="number" v-model.number="eff.nombre_homme" class="form-control" min="0" required @input="updateTotal(idx)" />
                  </div>
                  <div class="col-3">
                    <label class="form-label small mb-1">Femmes</label>
                    <div class="input-group">
                      <input type="number" v-model.number="eff.nombre_femme" class="form-control" min="0" required @input="updateTotal(idx)" />
                      <button type="button" class="btn btn-outline-danger btn-sm" @click="confirmDeleteEffectif(eff, idx)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm mt-2" @click="addEffectif">
                  <i class="fas fa-plus me-1"></i> Ajouter une ligne
                </button>
              </div>
            </div>
            
            <div class="card border-0 shadow-sm position-sticky" style="top: 2rem;">
              <div class="card-header bg-white py-3 border-bottom">
                <h6 class="mb-0 fw-semibold text-dark">Actions</h6>
              </div>
              <div class="card-body">
                <div class="d-grid gap-2">
                  <button type="submit" :disabled="submitting" class="btn btn-success btn-lg">
                    <i v-if="submitting" class="fas fa-spinner fa-spin me-2"></i>
                    <i v-else class="fas fa-save me-2"></i>
                    {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
                  </button>
                  <button type="button" @click="goBack" class="btn btn-outline-secondary btn-lg">
                    <i class="fas fa-times me-2"></i>
                    Annuler
                  </button>
                </div>
                
                <hr class="my-4">
                
                <div class="text-muted small">
                  <div class="d-flex align-items-start mb-3">
                    <i class="fas fa-info-circle me-2 mt-1 text-info"></i>
                    <div>
                      Les champs marqués d'un <span class="text-danger fw-semibold">*</span> sont obligatoires.
                    </div>
                  </div>
                  <div class="d-flex align-items-start">
                    <i class="fas fa-clock me-2 mt-1 text-success"></i>
                    <div>
                      Les modifications seront sauvegardées automatiquement.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
    
    <div v-else class="text-center py-5">
      <div class="mb-4">
        <i class="fas fa-exclamation-triangle display-1 text-warning"></i>
      </div>
      <h4 class="text-muted mb-3">Entité non trouvée</h4>
      <p class="text-muted mb-4">L'entité demandée n'existe pas ou a été supprimée.</p>
      <router-link to="/entities" class="btn btn-success btn-lg">
        <i class="fas fa-arrow-left me-2"></i>
        Retour à la liste
      </router-link>
    </div>
    
    <!-- Modal de confirmation de suppression d'effectif -->
    <div class="modal fade" id="deleteEffectifModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmer la suppression</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer cet effectif ?</p>
            <div v-if="effectifToDelete" class="alert alert-warning">
              <strong>Année {{ effectifToDelete.effectif?.annee }}</strong> - 
              {{ effectifToDelete.effectif?.nombre_total }} employé(s)
            </div>
            <p class="text-danger small mb-0">
              <i class="fas fa-exclamation-triangle me-1"></i>
              Cette action est irréversible.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="button" @click="deleteEffectif" class="btn btn-danger" :disabled="deletingEffectif">
              <i v-if="deletingEffectif" class="fas fa-spinner fa-spin me-1"></i>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'
import { Modal } from 'bootstrap'
import { getSectorsByCategory } from '@/utils/sectorsHelper'

export default {
  name: 'EntitiesEditView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()
    
    const loading = ref(false)
    const submitting = ref(false)
    const deletingEffectif = ref(false)
    const effectifToDelete = ref(null)
    const errors = reactive({})
    let deleteEffectifModalInstance = null
    
    const form = reactive({
      name: '',
      type: '',
      sigle: '',
      tutelle: '',
      secteur_activite: '',
      objet_social: '',
      capital_social: null,
      address: '',
      phone: '',
      email: '',
      description: ''
    })
    
    // Variable séparée pour gérer la sélection multiple des secteurs
    const selectedSectors = ref([])
    
    // Import des secteurs depuis le helper
    const sectorsByCategory = getSectorsByCategory()
    
    // Ajout de la gestion des effectifs
    const effectifs = ref([])
    
    // Méthode pour ajouter une ligne d'effectif
    const addEffectif = () => {
      effectifs.value.push({
        annee: new Date().getFullYear(),
        nombre_total: 0,
        nombre_homme: 0,
        nombre_femme: 0
      })
    }
    
    // Méthode pour confirmer la suppression d'une ligne d'effectif
    const confirmDeleteEffectif = (effectif, idx) => {
      effectifToDelete.value = { effectif, idx }
      
      if (!deleteEffectifModalInstance) {
        deleteEffectifModalInstance = new Modal(document.getElementById('deleteEffectifModal'))
      }
      deleteEffectifModalInstance.show()
    }
    
    // Méthode pour supprimer un effectif
    const deleteEffectif = async () => {
      if (!effectifToDelete.value) return
      
      const { effectif, idx } = effectifToDelete.value
      deletingEffectif.value = true
      
      try {
        // Si l'effectif a un ID, le supprimer en base de données
        if (effectif.id) {
          await store.dispatch('effectifs/deleteEffectif', effectif.id)
          notifySuccess('Effectif supprimé avec succès')
        }
        
        // Supprimer de la liste locale
        effectifs.value.splice(idx, 1)
        
        // Fermer le modal
        if (deleteEffectifModalInstance) {
          deleteEffectifModalInstance.hide()
        }
        effectifToDelete.value = null
        
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'effectif:', error)
        notifyError('Erreur lors de la suppression de l\'effectif')
      } finally {
        deletingEffectif.value = false
      }
    }
    
    // Méthode pour retirer une ligne d'effectif (conservée pour compatibilité)
    const removeEffectif = (idx) => {
      effectifs.value.splice(idx, 1)
    }
    
    // Méthode pour mettre à jour le total
    const updateTotal = (idx) => {
      const eff = effectifs.value[idx]
      eff.nombre_total = eff.nombre_homme + eff.nombre_femme
    }
    
    const isEdit = computed(() => !!route.params.id)
    const entity = computed(() => store.getters['entities/entity'])
    
    const loadEntity = async () => {
      if (!isEdit.value) return
      
      loading.value = true
      try {
        await store.dispatch('entities/fetchEntityById', route.params.id)
        if (entity.value) {
          Object.assign(form, {
            name: entity.value.name || '',
            type: entity.value.type || '',
            sigle: entity.value.sigle || '',
            tutelle: entity.value.tutelle || '',
            secteur_activite: entity.value.secteur_activite || '',
            objet_social: entity.value.objet_social || '',
            capital_social: entity.value.capital_social || null,
            address: entity.value.address || '',
            phone: entity.value.phone || '',
            email: entity.value.email || '',
            description: entity.value.description || ''
          })
          
          // Initialiser les secteurs sélectionnés à partir de secteur_activite
          if (entity.value.secteur_activite) {
            selectedSectors.value = entity.value.secteur_activite.split('/')
          } else {
            selectedSectors.value = []
          }
          
          // Charger les effectifs
          if (entity.value.effectifs && entity.value.effectifs.length > 0) {
            effectifs.value = entity.value.effectifs.map(eff => ({
              id: eff.id, // Conserve l'ID pour la mise à jour
              annee: eff.annee,
              nombre_total: eff.nombre_total,
              nombre_homme: eff.nombre_homme,
              nombre_femme: eff.nombre_femme
            }))
          }
        }
      } catch (error) {
        notifyError('Erreur lors du chargement de l\'entité')
      } finally {
        loading.value = false
      }
    }
    
    const validateForm = () => {
      Object.keys(errors).forEach(key => delete errors[key])
      
      if (!form.name.trim()) {
        errors.name = 'Le nom est requis'
      }
      
      if (!form.type) {
        errors.type = 'Le type d\'entité est requis'
      }
      
      if (form.email && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.email = 'Format d\'email invalide'
      }
      
      if (form.capital_social && form.capital_social < 0) {
        errors.capital_social = 'Le capital ne peut pas être négatif'
      }
      
      return Object.keys(errors).length === 0
    }
    
    const submitForm = async () => {
      if (!validateForm()) {
        notifyError('Veuillez corriger les erreurs dans le formulaire')
        return
      }
      
      // Validation du secteur d'activité
      if (selectedSectors.value.length === 0) {
        notifyError('Veuillez sélectionner au moins un secteur d\'activité')
        return
      }
      
      submitting.value = true
      
      try {
        const formData = { ...form }
        
        // Convertir les secteurs sélectionnés en chaîne avec "/"
        formData.secteur_activite = selectedSectors.value.join('/')
        
        // Pour la création seulement, nettoyer les champs vides (null uniquement)
        // Pour la modification, garder tous les champs pour permettre de vider des valeurs
        if (!isEdit.value) {
          // En création : supprimer seulement les valeurs null
          Object.keys(formData).forEach(key => {
            if (formData[key] === null) {
              delete formData[key]
            }
          })
        } else {
          // En modification : convertir les chaînes vides en null pour vider les champs
          Object.keys(formData).forEach(key => {
            if (formData[key] === '') {
              formData[key] = null
            }
          })
        }
        
        // Ajouter les effectifs au formData
        if (effectifs.value.length > 0) {
          formData.effectifs = effectifs.value.map(eff => ({
            id: eff.id, // Inclut l'ID si présent pour la mise à jour
            annee: eff.annee,
            nombre_total: eff.nombre_homme + eff.nombre_femme, // Recalcule le total par sécurité
            nombre_homme: eff.nombre_homme,
            nombre_femme: eff.nombre_femme
          }))
        }
        
        if (isEdit.value) {
          await store.dispatch('entities/updateEntity', {
            id: route.params.id,
            data: formData
          })
          notifySuccess('Entité modifiée avec succès')
        } else {
          await store.dispatch('entities/createEntity', formData)
          notifySuccess('Entité créée avec succès')
        }
        
        router.push('/entities')
      } catch (error) {
        console.error('Erreur:', error)
        
        if (error.response && error.response.data && error.response.data.detail) {
          if (Array.isArray(error.response.data.detail)) {
            error.response.data.detail.forEach(err => {
              if (err.loc && err.loc.length > 1) {
                errors[err.loc[1]] = err.msg
              }
            })
          } else {
            notifyError(error.response.data.detail)
          }
        } else {
          notifyError('Erreur lors de l\'enregistrement de l\'entité')
        }
      } finally {
        submitting.value = false
      }
    }
    
    const goBack = () => {
      router.go(-1)
    }
    
    const removeSector = (sectorToRemove) => {
      const index = selectedSectors.value.indexOf(sectorToRemove)
      if (index > -1) {
        selectedSectors.value.splice(index, 1)
      }
    }
    
    onMounted(() => {
      loadEntity()
    })
    
    return {
      form,
      errors,
      loading,
      submitting,
      deletingEffectif,
      effectifToDelete,
      isEdit,
      submitForm,
      goBack,
      effectifs,
      addEffectif,
      removeEffectif,
      confirmDeleteEffectif,
      deleteEffectif,
      updateTotal,
      selectedSectors,
      removeSector,
      sectorsByCategory
    }
  }
}
</script>

<style scoped>
/* Amélioration de l'apparence du select multiple */
select[multiple] {
  border: 2px solid #e9ecef;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

select[multiple]:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

select[multiple] option {
  padding: 0.375rem 0.5rem;
  margin: 0.125rem 0;
  border-radius: 0.25rem;
}

select[multiple] option:hover {
  background-color: #f8f9fa;
}

select[multiple] option:checked {
  background-color: #0d6efd;
  color: white;
}

/* Style pour les optgroups */
select[multiple] optgroup {
  font-weight: bold;
  color: #495057;
  background-color: #f8f9fa;
  font-size: 0.875rem;
}

select[multiple] optgroup option {
  font-weight: normal;
  padding-left: 1rem;
}

/* Style pour les badges des secteurs sélectionnés */
.selected-sectors {
  margin-top: 0.5rem;
}

.sector-badge {
  display: inline-block;
  background-color: #e7f3ff;
  color: #0066cc;
  padding: 0.25rem 0.5rem;
  margin: 0.125rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  border: 1px solid #b3d9ff;
}
</style>