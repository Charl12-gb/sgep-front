<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="mb-0">Commissaires aux Comptes</h5>
      <div class="d-flex gap-2">
        <select v-model="filters.type" @change="applyFilters" class="form-select form-select-sm">
          <option value="">Tous les types</option>
          <option value="Incumbent">Titulaire</option>
          <option value="Representative">Suppléant</option>
        </select>
        <button class="btn btn-success btn-sm" @click="showModal()">
          <i class="fas fa-plus me-1"></i>
          Ajouter
        </button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th>Cabinet</th>
            <th>Type</th>
            <th>Représentant</th>
            <th>Contact</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="officer in filteredOfficers" :key="officer.id" class="align-middle">
            <td>
              <h6 class="mb-0">{{ officer.cabinet }}</h6>
            </td>
            <td>
              <span :class="{
                'badge': true,
                'bg-primary': officer.type === 'Incumbent',
                'bg-secondary': officer.type === 'Representative'
              }">
                {{ officer.type === 'Incumbent' ? 'Titulaire' : 'Suppléant' }}
              </span>
            </td>
            <td>
              <div class="small">
                <div class="fw-semibold">{{ officer.representant_nom_prenom || '-' }}</div>
                <div class="text-muted small">
                  <template v-if="officer.mandat_date_debut || officer.mandat_date_fin">
                    <div>
                      <small>
                        <span v-if="officer.mandat_date_debut">{{ new
                          Date(officer.mandat_date_debut).toLocaleDateString() }}</span>
                        <span v-if="officer.mandat_date_debut && officer.mandat_date_fin"> - </span>
                        <span v-if="officer.mandat_date_fin">{{ new Date(officer.mandat_date_fin).toLocaleDateString()
                        }}</span>
                      </small>
                    </div>
                  </template>
                </div>
              </div>
            </td>
            <td>
              <div class="small">
                <div v-if="officer.representant_email">
                  <i class="fas fa-envelope me-1"></i>
                  {{ officer.representant_email }}
                </div>
                <div v-if="officer.representant_telephone">
                  <i class="fas fa-phone me-1"></i>
                  {{ officer.representant_telephone }}
                </div>
              </div>
            </td>
            <td class="text-center">
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" title="Modifier" @click="showModal(officer)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline-danger" title="Supprimer" @click="confirmDelete(officer)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="filteredOfficers.length === 0" class="text-center py-5">
      <i class="fas fa-user-tie fa-3x text-muted opacity-50 mb-3"></i>
      <h6 class="text-muted">Aucun commissaire aux comptes</h6>
      <p class="text-muted">Commencez par ajouter des commissaires</p>
      <button class="btn btn-success mt-2" @click="showModal()">
        <i class="fas fa-plus me-2"></i>
        Ajouter un commissaire
      </button>
    </div>

    <!-- Modal d'ajout/modification -->
    <div class="modal fade" id="officerModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Modifier' : 'Ajouter' }} un commissaire aux comptes</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="save">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="cabinet" class="form-label fw-semibold">
                    Nom du cabinet <span class="text-danger">*</span>
                  </label>
                  <input type="text" id="cabinet" v-model="form.cabinet" class="form-control" required>
                </div>

                <div class="col-md-6">
                  <label for="type" class="form-label fw-semibold">
                    Type <span class="text-danger">*</span>
                  </label>
                  <select id="type" v-model="form.type" class="form-select" required>
                    <option value="">Sélectionner</option>
                    <option value="Incumbent">Titulaire</option>
                    <option value="Representative">Suppléant</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label for="representant_nom_prenom" class="form-label fw-semibold">Nom et prénom du
                    représentant</label>
                  <input type="text" id="representant_nom_prenom" v-model="form.representant_nom_prenom"
                    class="form-control">
                </div>

                <div class="col-md-6">
                  <label for="representant_email" class="form-label fw-semibold">Email du représentant</label>
                  <input type="email" id="representant_email" v-model="form.representant_email" class="form-control">
                </div>

                <div class="col-md-6">
                  <label for="representant_telephone" class="form-label fw-semibold">Tél du représentant</label>
                  <input type="tel" id="representant_telephone" v-model="form.representant_telephone"
                    class="form-control">
                </div>

                <div class="col-md-6">
                  <label for="mandat_date_debut" class="form-label fw-semibold">Date de début mandat</label>
                  <input type="date" id="mandat_date_debut" v-model="form.mandat_date_debut" class="form-control">
                </div>

                <div class="col-md-6">
                  <label for="mandat_date_fin" class="form-label fw-semibold">Date de fin mandat</label>
                  <input type="date" id="mandat_date_fin" v-model="form.mandat_date_fin" class="form-control">
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
    <div class="modal fade" id="deleteOfficerModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmer la suppression</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer ce commissaire ?</p>
            <p class="text-danger fw-semibold mb-0" v-if="itemToDelete">
              {{ itemToDelete.cabinet || itemToDelete.representant_nom_prenom || '-' }}
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
import { ref, computed, onMounted } from 'vue'
import { useNotyf } from '@/mixins/useNotyf'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'

export default {
  name: 'EntityOfficers',
  props: {
    officers: {
      type: Array,
      default: () => []
    },
    entityId: {
      type: [String, Number],
      required: true
    },
    reloadData: {
      type: Function,
      required: true
    }
  },
  setup(props, { emit }) {
    const store = useStore()

    const filters = ref({
      type: ''
    })
    const loading = ref(false)
    const isEditing = ref(false)
    const itemToDelete = ref(null)
    const { notifyError, notifySuccess } = useNotyf()

    const form = ref({
      id: null,
      cabinet: '',
      type: '',
      representant_nom_prenom: '',
      representant_email: '',
      representant_telephone: '',
      mandat_date_debut: '',
      mandat_date_fin: ''
    })

    const filteredOfficers = computed(() => {
      let filtered = [...props.officers]

      if (filters.value.type) {
        filtered = filtered.filter(o => o.type === filters.value.type)
      }

      return filtered
    })

    const resetForm = () => {
      Object.assign(form.value, {
        id: null,
        cabinet: '',
        type: '',
        representant_nom_prenom: '',
        representant_email: '',
        representant_telephone: '',
        mandat_date_debut: '',
        mandat_date_fin: ''
      })
    }

    const showModal = (officer = null) => {
      resetForm()

      if (officer) {
        isEditing.value = true
        Object.assign(form.value, {
          id: officer.id,
          cabinet: officer.cabinet,
          type: officer.type,
          representant_nom_prenom: officer.representant_nom_prenom || '',
          representant_email: officer.representant_email || '',
          representant_telephone: officer.representant_telephone || '',
          mandat_date_debut: officer.mandat_date_debut || '',
          mandat_date_fin: officer.mandat_date_fin || ''
        })
      } else {
        isEditing.value = false
      }

      const modal = Modal.getInstance(document.getElementById('officerModal')) || new Modal(document.getElementById('officerModal'))
      modal.show()
    }

    const loadAccountingOfficers = async (params = {}) => {
      loading.value = true
      try {
        // Prefer the accountingOfficers module; if filters provided, use the generic fetchAccountingOfficers
        if (params && Object.keys(params).length > 0) {
          await store.dispatch('accountingOfficers/fetchAccountingOfficers', {
            page: params.page || 1,
            limit: params.limit || 10,
            entity_id: props.entityId,
            ...params
          })
        } else {
          await store.dispatch('accountingOfficers/fetchAccountingOfficersByEntity', {
            entityId: props.entityId,
            page: 1,
            limit: 50
          })
        }
      } catch (error) {
        notifyError('Erreur lors du chargement des commissaires')
      } finally {
        loading.value = false
      }
    }

    const save = async () => {
      loading.value = true
      try {
        const formData = { ...form.value, entity_id: props.entityId }

        // Nettoyer les champs vides
        Object.keys(formData).forEach(key => {
          if (formData[key] === '') {
            delete formData[key]
          }
        })

        if (isEditing.value && formData.id) {
          await store.dispatch('accountingOfficers/updateAccountingOfficer', formData)
          notifySuccess('Commissaire mis à jour avec succès')
        } else {
          await store.dispatch('accountingOfficers/createAccountingOfficer', formData)
          notifySuccess('Commissaire ajouté avec succès')
        }

        // Refresh local list and optionally parent
        await loadAccountingOfficers()
        if (props.reloadData) props.reloadData()

        const modal = Modal.getInstance(document.getElementById('officerModal')) || new Modal(document.getElementById('officerModal'))
        modal.hide()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        notifyError(error?.response?.data?.detail || 'Erreur lors de l\'enregistrement du commissaire')
      } finally {
        loading.value = false
      }
    }

    const confirmDelete = (officer) => {
      itemToDelete.value = officer
      const modal = Modal.getInstance(document.getElementById('deleteOfficerModal')) || new Modal(document.getElementById('deleteOfficerModal'))
      modal.show()
    }

    const deleteItem = async () => {
      if (!itemToDelete.value) return

      loading.value = true
      try {
        await store.dispatch('accountingOfficers/deleteAccountingOfficer', itemToDelete.value.id)
        notifySuccess('Commissaire supprimé avec succès')

        // Refresh list and parent stats
        await loadAccountingOfficers()
        if (props.reloadData) props.reloadData()
        const modal = Modal.getInstance(document.getElementById('deleteOfficerModal')) || new Modal(document.getElementById('deleteOfficerModal'))
        modal.hide()
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        notifyError(error?.response?.data?.detail || 'Erreur lors de la suppression du commissaire')
      } finally {
        loading.value = false
        itemToDelete.value = null
      }
    }

    const applyFilters = async () => {
      // Call the entities fetch with filter params
      try {
        await loadAccountingOfficers(filters.value)
      } catch (error) {
        notifyError('Erreur lors du filtrage des commissaires')
      }
    }

    onMounted(() => {
      loadAccountingOfficers()
    })

    return {
      filters,
      loading,
      isEditing,
      itemToDelete,
      form,
      filteredOfficers,
      showModal,
      save,
      confirmDelete,
      deleteItem,
      applyFilters
    }
  }
}
</script>