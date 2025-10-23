<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="mb-0">Direction Générale</h5>
      <div class="d-flex gap-2">
        <!-- Filtres -->
        <select v-model="filters.status" @change="applyFilters" class="form-select form-select-sm me-2">
          <option value="">Tous les directeurs</option>
          <option value="current">Directeurs actuels</option>
          <option value="former">Anciens directeurs</option>
        </select>
        <select v-model="filters.position" @change="applyFilters" class="form-select form-select-sm">
          <option value="">Tous les postes</option>
          <option value="Directeur Général">Directeur Général</option>
          <option value="Directeur de l'Administration et des Finances">DAF</option>
        </select>
        <button class="btn btn-success btn-sm" @click="showModal()">
          <i class="fas fa-plus me-1"></i>
          Ajouter
        </button>
      </div>
    </div>
    
    <div class="row g-4">
      <div v-for="director in filteredDirectors" :key="director.id" class="col-md-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-light d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <h6 class="fw-semibold text-primary mb-0 me-2">{{ director.position }}</h6>
              <span v-if="director.is_current_director" class="badge bg-success">ACTUEL</span>
            </div>
            <div class="btn-group btn-group-sm">
              <button 
                v-if="!director.is_current_director" 
                class="btn btn-outline-success" 
                title="Définir comme directeur actuel" 
                @click="setAsCurrent(director)"
              >
                <i class="fas fa-star"></i>
              </button>
              <button class="btn btn-outline-primary" title="Modifier" @click="showModal(director)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-outline-danger" title="Supprimer" @click="confirmDelete(director)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="d-flex mb-3">
              <div class="flex-shrink-0">
                <div class="rounded-circle bg-primary bg-opacity-10 p-3 text-center" style="width: 64px; height: 64px">
                  <i class="fas fa-user-tie text-primary fa-lg"></i>
                </div>
              </div>
              <div class="ms-3">
                <h5 class="mb-1">{{ director.nom_prenom }}</h5>
                <p class="mb-0 text-muted small">
                  <span class="badge" :class="director.sexe === 'Homme' ? 'bg-info' : 'bg-warning'">
                    {{ director.sexe }}
                  </span>
                  <span v-if="calculateAge(director.date_naissance)" class="ms-2">{{ calculateAge(director.date_naissance) }} ans</span>
                  <span v-if="director.is_current_director" class="ms-2">
                    <i class="fas fa-star text-success" title="Directeur actuel"></i>
                  </span>
                </p>
              </div>
            </div>
            
            <div v-if="director.profil_professionnel" class="mb-3">
              <h6 class="text-muted small mb-1">Profil professionnel</h6>
              <p class="mb-0">{{ director.profil_professionnel }}</p>
            </div>
            
            <div class="mb-3">
              <h6 class="text-muted small mb-2">Contact</h6>
              <div v-if="director.email" class="d-flex align-items-center mb-2">
                <i class="fas fa-envelope text-muted me-2"></i>
                <a :href="`mailto:${director.email}`">{{ director.email }}</a>
              </div>
              <div v-if="director.telephone" class="d-flex align-items-center">
                <i class="fas fa-phone text-muted me-2"></i>
                <a :href="`tel:${director.telephone}`">{{ director.telephone }}</a>
              </div>
            </div>
            
            <div v-if="director.date_nomination" class="small text-muted">
              <i class="fas fa-calendar-alt me-1"></i>
              Nommé le {{ formatDate(director.date_nomination) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="filteredDirectors.length === 0" class="text-center py-5">
      <i class="fas fa-user-tie fa-3x text-muted opacity-50 mb-3"></i>
      <h6 class="text-muted">Aucun membre de la direction générale</h6>
      <p class="text-muted">Commencez par ajouter des membres de la direction</p>
      <button class="btn btn-success mt-2" @click="showModal()">
        <i class="fas fa-plus me-2"></i>
        Ajouter un membre
      </button>
    </div>
    
    <!-- Modal d'ajout/modification -->
    <div class="modal fade" id="directionModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Modifier' : 'Ajouter' }} un membre de la direction</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="save">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="position" class="form-label fw-semibold">
                    Position <span class="text-danger">*</span>
                  </label>
                  <select id="position" v-model="form.position" class="form-select" required>
                    <option value="">Sélectionner une position</option>
                    <option value="Directeur Général">Directeur Général</option>
                    <option value="Directeur de l'Administration et des Finances">Directeur Admin. et Finances</option>
                  </select>
                </div>
                
                <div class="col-md-6">
                  <label for="sexe" class="form-label fw-semibold">
                    Sexe <span class="text-danger">*</span>
                  </label>
                  <select id="sexe" v-model="form.sexe" class="form-select" required>
                    <option value="">Sélectionner</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </select>
                </div>
                
                <div class="col-md-8">
                  <label for="nom_prenom" class="form-label fw-semibold">
                    Nom et prénom <span class="text-danger">*</span>
                  </label>
                  <input type="text" id="nom_prenom" v-model="form.nom_prenom" class="form-control" required>
                </div>
                
                <div class="col-md-4">
                  <label for="date_naissance" class="form-label fw-semibold">Date de naissance</label>
                  <input type="date" id="date_naissance" v-model="form.date_naissance" class="form-control" :max="today">
                </div>
                
                <div class="col-md-6">
                  <label for="email" class="form-label fw-semibold">Email</label>
                  <input type="email" id="email" v-model="form.email" class="form-control">
                </div>
                
                <div class="col-md-6">
                  <label for="telephone" class="form-label fw-semibold">Téléphone</label>
                  <input type="tel" id="telephone" v-model="form.telephone" class="form-control">
                </div>
                
                <div class="col-md-6">
                  <label for="date_nomination" class="form-label fw-semibold">Date de nomination</label>
                  <input type="date" id="date_nomination" v-model="form.date_nomination" class="form-control" :max="today">
                </div>
                
                <div class="col-md-6 d-flex align-items-center">
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="is_current_director" 
                      v-model="form.is_current_director" 
                      class="form-check-input"
                    >
                    <label for="is_current_director" class="form-check-label fw-semibold">
                      Directeur actuel
                      <small class="text-muted d-block">Désactivera automatiquement les autres directeurs de cette position</small>
                    </label>
                  </div>
                </div>
                
                <div class="col-12">
                  <label for="profil_professionnel" class="form-label fw-semibold">Profil professionnel</label>
                  <textarea id="profil_professionnel" v-model="form.profil_professionnel" class="form-control" rows="3"></textarea>
                </div>
              </div>
              
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" class="btn btn-success" :disabled="loading">
                  <i v-if="loading" class="fas fa-spinner fa-spin me-2"></i>
                  {{ isEditing ? 'Mettre à jour' : 'Ajouter' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmation de suppression -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmer la suppression</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer ce membre de la direction ?</p>
            <p class="text-danger fw-semibold mb-0" v-if="itemToDelete">
              {{ itemToDelete.position }} - {{ itemToDelete.nom_prenom }}
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="button" class="btn btn-danger" @click="deleteItem" :disabled="loading">
              <i v-if="loading" class="fas fa-spinner fa-spin me-2"></i>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'
import { Modal } from 'bootstrap'

export default {
  name: 'EntityDirection',
  props: {
    directors: {
      type: Array,
      default: () => []
    },
    entityId: {
      type: [String, Number],
      required: true
    },
    reloadData: {
      type: Function,
      required: false
    }
  },
  emits: ['data-updated'],
  setup(props, { emit }) {
    const store = useStore()
    const { notifyError, notifySuccess } = useNotyf()
    
    const filters = ref({ 
      position: '',
      status: '' // 'current', 'former', ou ''
    })
    const loading = ref(false)
    const isEditing = ref(false)
    const itemToDelete = ref(null)
    
    const form = ref({
      id: null,
      position: '',
      nom_prenom: '',
      sexe: '',
      date_naissance: null,
      profil_professionnel: '',
      email: '',
      telephone: '',
      date_nomination: null,
      is_current_director: false
    })
    
    const filteredDirectors = computed(() => {
      let filtered = [...props.directors]
      
      if (filters.value.position) {
        filtered = filtered.filter(d => d.position === filters.value.position)
      }
      
      if (filters.value.status === 'current') {
        filtered = filtered.filter(d => d.is_current_director === true)
      } else if (filters.value.status === 'former') {
        filtered = filtered.filter(d => d.is_current_director === false)
      }
      
      // Trier par statut (actuels en premier) puis par nom
      return filtered.sort((a, b) => {
        if (a.is_current_director && !b.is_current_director) return -1
        if (!a.is_current_director && b.is_current_director) return 1
        return a.nom_prenom.localeCompare(b.nom_prenom)
      })
    })
    
    const currentDirectors = computed(() => {
      return props.directors.filter(d => d.is_current_director === true)
    })
    
    const today = computed(() => {
      return new Date().toISOString().split('T')[0]
    })
    
    const calculateAge = (birthDate) => {
      if (!birthDate) return null
      const birth = new Date(birthDate)
      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      return age
    }
    
    const resetForm = () => {
      Object.assign(form.value, {
        id: null,
        position: '',
        nom_prenom: '',
        sexe: '',
        date_naissance: null,
        profil_professionnel: '',
        email: '',
        telephone: '',
        date_nomination: null,
        is_current_director: false
      })
    }
    
    const showModal = (director = null) => {
      resetForm()
      
      if (director) {
        isEditing.value = true
        Object.assign(form.value, {
          id: director.id,
          position: director.position,
          nom_prenom: director.nom_prenom,
          sexe: director.sexe,
          date_naissance: director.date_naissance ? new Date(director.date_naissance).toISOString().split('T')[0] : null,
          profil_professionnel: director.profil_professionnel,
          email: director.email,
          telephone: director.telephone,
          date_nomination: director.date_nomination ? new Date(director.date_nomination).toISOString().split('T')[0] : null,
          is_current_director: director.is_current_director || false
        })
      } else {
        isEditing.value = false
      }
      
      const modal = new Modal(document.getElementById('directionModal'))
      modal.show()
    }
    
    const save = async () => {
      // Validation côté client
      if (form.value.date_nomination && new Date(form.value.date_nomination) > new Date()) {
        notifyError('La date de nomination ne peut pas être ultérieure à aujourd\'hui')
        return
      }
      
      if (form.value.date_naissance && new Date(form.value.date_naissance) > new Date()) {
        notifyError('La date de naissance ne peut pas être ultérieure à aujourd\'hui')
        return
      }
      
      loading.value = true
      try {
        const formData = { ...form.value, entity_id: props.entityId }
        
        // S'assurer que is_current_director est un booléen
        if (Object.prototype.hasOwnProperty.call(formData, 'is_current_director')) {
          formData.is_current_director = Boolean(formData.is_current_director)
        }

        if (isEditing.value) {
          // Pour la modification, on envoie tous les champs (même vides) pour permettre de vider des champs
          // Convertir les chaînes vides en null pour les champs optionnels
          const updateData = { ...formData }
          
          // Liste des champs texte optionnels qui peuvent être vidés
          const optionalTextFields = ['profil_professionnel', 'email', 'telephone']
          optionalTextFields.forEach(field => {
            if (updateData[field] === '') {
              updateData[field] = null
            }
          })
          
          // Liste des champs date optionnels qui peuvent être vidés
          const optionalDateFields = ['date_naissance', 'date_nomination']
          optionalDateFields.forEach(field => {
            if (updateData[field] === '') {
              updateData[field] = null
            }
          })
          
          await store.dispatch('directionGenerale/updateDirectionGenerale', {
            id: updateData.id,
            payload: updateData
          })
        } else {
          // Pour la création, on nettoie les champs vides seulement
          Object.keys(formData).forEach(key => {
            if (formData[key] === '' || formData[key] === null) {
              delete formData[key]
            }
          })
          
          await store.dispatch('directionGenerale/createDirectionGenerale', formData)
        }

        const modal = Modal.getInstance(document.getElementById('directionModal')) || new Modal(document.getElementById('directionModal'))
        modal.hide()
        await props.reloadData()
        notifySuccess(isEditing.value ? 'Directeur mis à jour avec succès' : 'Directeur ajouté avec succès')

      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        notifyError('Erreur lors de l\'enregistrement du membre de la direction')
      } finally {
        loading.value = false
      }
    }
    
    const setAsCurrent = async (director) => {
      loading.value = true
      try {
        await store.dispatch('directionGenerale/setDirectorAsCurrentByPosition', {
          entityId: props.entityId,
          position: director.position,
          directorId: director.id
        })
        
        await props.reloadData()
        notifySuccess(`${director.nom_prenom} est maintenant le ${director.position} actuel`)
        
      } catch (error) {
        console.error('Erreur lors de la définition du directeur actuel:', error)
        notifyError('Erreur lors de la définition du directeur comme actuel')
      } finally {
        loading.value = false
      }
    }
    
    const confirmDelete = (director) => {
      itemToDelete.value = director
      const modal = new Modal(document.getElementById('deleteModal'))
      modal.show()
    }
    
    const deleteItem = async () => {
      if (!itemToDelete.value) return
      
      loading.value = true
      try {
        await store.dispatch('directionGenerale/deleteDirectionGenerale', itemToDelete.value.id)

        const modal = Modal.getInstance(document.getElementById('deleteModal')) || new Modal(document.getElementById('deleteModal'))
        modal.hide()

        await props.reloadData()
        notifySuccess('Données rechargées avec succès')
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        notifyError('Erreur lors de la suppression du membre de la direction')
      } finally {
        loading.value = false
        itemToDelete.value = null
      }
    }
    
    const formatDate = (date) => {
      return date ? new Date(date).toLocaleDateString('fr-FR') : 'Non renseigné'
    }
    
    const applyFilters = () => {
      // Les filtres sont appliqués automatiquement via le computed
    }
    
    return {
      filters,
      loading,
      isEditing,
      itemToDelete,
      form,
      filteredDirectors,
      currentDirectors,
      today,
      calculateAge,
      showModal,
      save,
      setAsCurrent,
      confirmDelete,
      deleteItem,
      formatDate,
      applyFilters
    }
  }
}
</script>