<template>
  <div class="container-fluid px-4 py-4">
    <div class="row g-5">
      <!-- Colonne principale -->
      <div class="col-lg-8">
        <!-- Informations essentielles -->
        <div class="row g-4 mb-5">
          <div v-if="entity.secteur_activite" class="col-md-6">
            <div class="border-start border-primary border-4 ps-3">
              <h6 class="text-muted text-uppercase small mb-1">Secteur d'activité</h6>
              <p class="mb-0 fw-semibold">{{ entity.secteur_activite }}</p>
            </div>
          </div>
          <div v-if="entity.capital_social" class="col-md-6">
            <div class="border-start border-success border-4 ps-3">
              <h6 class="text-muted text-uppercase small mb-1">Capital social</h6>
              <p class="mb-0 fw-bold text-success fs-5">{{ formatCurrency(entity.capital_social) }}</p>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="entity.objet_social || entity.description" class="mb-5">
          <div v-if="entity.objet_social" class="mb-4">
            <h3 class="h5 fw-bold mb-3">Objet social</h3>
            <p class="text-muted lh-lg">{{ entity.objet_social }}</p>
          </div>
          <div v-if="entity.description" class="mb-4">
            <h3 class="h5 fw-bold mb-3">À propos</h3>
            <p class="text-muted lh-lg">{{ entity.description }}</p>
          </div>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="h4 fw-bold mb-4">Informations de contact</h3>
          <div class="row g-3">
            <div v-if="entity.email" class="col-md-6">
              <div class="d-flex align-items-center p-3 bg-light rounded">
                <div class="me-3 text-primary fs-4">📧</div>
                <div>
                  <small class="text-muted d-block">Email</small>
                  <a :href="`mailto:${entity.email}`" class="text-decoration-none fw-semibold">{{ entity.email }}</a>
                </div>
              </div>
            </div>
            <div v-if="entity.phone" class="col-md-6">
              <div class="d-flex align-items-center p-3 bg-light rounded">
                <div class="me-3 text-primary fs-4">📞</div>
                <div>
                  <small class="text-muted d-block">Téléphone</small>
                  <a :href="`tel:${entity.phone}`" class="text-decoration-none fw-semibold">{{ entity.phone }}</a>
                </div>
              </div>
            </div>
            <div v-if="entity.address" class="col-12">
              <div class="d-flex align-items-start p-3 bg-light rounded">
                <div class="me-3 text-primary fs-4">📍</div>
                <div>
                  <small class="text-muted d-block">Adresse</small>
                  <span class="fw-semibold">{{ entity.address }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne latérale -->
      <div class="col-lg-4">

        <!-- Effectifs -->
        <div>
          <div class="d-flex align-items-center mb-4">
            <h3 class="h4 fw-bold mb-0 me-2">Effectifs par année</h3>
            <button class="btn btn-success btn-sm" @click="openEffectifModal()">
              <i class="fas fa-plus me-1"></i> Ajouter
            </button>
          </div>
          <div v-if="entity.effectifs && entity.effectifs.length > 0" class="d-flex flex-column gap-4">
            <div v-for="effectif in sortedEffectifs" :key="effectif.id" class="border rounded-3 p-3">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center gap-2">
                  <h4 class="h6 fw-bold mb-0">{{ effectif.annee }}</h4>
                  <button class="btn btn-outline-primary btn-sm" title="Modifier" @click="editEffectif(effectif)"><i class="fas fa-edit"></i></button>
                  <button class="btn btn-outline-danger btn-sm" title="Supprimer" @click="confirmDeleteEffectif(effectif)"><i class="fas fa-trash"></i></button>
                </div>
                <span class="badge bg-dark fs-6">{{ effectif.nombre_total }}</span>
              </div>
              <div class="progress mb-2" style="height: 20px;">
                <div 
                  class="progress-bar bg-primary" 
                  role="progressbar" 
                  :style="`width: ${getPercentage(effectif.nombre_homme, effectif.nombre_total)}%`"
                  :title="`${effectif.nombre_homme} Hommes`"
                >
                </div>
                <div 
                  class="progress-bar bg-danger" 
                  role="progressbar" 
                  :style="`width: ${getPercentage(effectif.nombre_femme, effectif.nombre_total)}%`"
                  :title="`${effectif.nombre_femme} Femmes`"
                >
                </div>
              </div>
              <div class="d-flex justify-content-between small">
                <div class="d-flex align-items-center">
                  <span class="bg-primary rounded-circle d-inline-block me-2" style="width: 8px; height: 8px;"></span>
                  <span class="text-muted">{{ effectif.nombre_homme }} Hommes</span>
                </div>
                <div class="d-flex align-items-center">
                  <span class="bg-danger rounded-circle d-inline-block me-2" style="width: 8px; height: 8px;"></span>
                  <span class="text-muted">{{ effectif.nombre_femme }} Femmes</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-5 text-muted">
            <div class="mb-3" style="font-size: 3rem; opacity: 0.3;">👥</div>
            <p class="mb-0">Aucun effectif renseigné</p>
          </div>

          <!-- Modal Ajout/Modification Effectif -->
          <div class="modal fade" id="effectifModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">{{ isEditingEffectif ? 'Modifier' : 'Ajouter' }} un effectif</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <form @submit.prevent="saveEffectif">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label fw-semibold">Année <span class="text-danger">*</span></label>
                        <input type="number" v-model="effectifForm.annee" class="form-control" required min="1900" max="2100">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label fw-semibold">Nombre total <span class="text-danger">*</span></label>
                        <input type="number" :value="effectifForm.nombre_homme + effectifForm.nombre_femme" class="form-control" readonly>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label fw-semibold">Nombre d'hommes <span class="text-danger">*</span></label>
                        <input type="number" v-model="effectifForm.nombre_homme" class="form-control" required min="0">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label fw-semibold">Nombre de femmes <span class="text-danger">*</span></label>
                        <input type="number" v-model="effectifForm.nombre_femme" class="form-control" required min="0">
                      </div>
                    </div>
                    <div class="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                      <button type="submit" class="btn btn-success" :disabled="loadingEffectif">
                        <i v-if="loadingEffectif" class="fas fa-spinner fa-spin me-2"></i>
                        {{ isEditingEffectif ? 'Mettre à jour' : 'Ajouter' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Confirmation Suppression Effectif -->
          <div class="modal fade" id="deleteEffectifModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-sm">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Confirmer la suppression</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <p>Êtes-vous sûr de vouloir supprimer cet effectif ?</p>
                  <p class="text-danger fw-semibold mb-0" v-if="effectifToDelete">
                    Année : {{ effectifToDelete.annee }}<br>
                    Total : {{ effectifToDelete.nombre_total }}
                  </p>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                  <button type="button" class="btn btn-danger" @click="deleteEffectif" :disabled="loadingEffectif">
                    <i v-if="loadingEffectif" class="fas fa-spinner fa-spin me-2"></i>
                    Supprimer
                  </button>
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
import { computed, ref } from 'vue'
import { Modal } from 'bootstrap'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'

export default {
  name: 'EntityGeneralInfo',
  props: {
    entity: {
      type: Object,
      required: true
    },
    reloadData: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const store = useStore()
    const loadingEffectif = ref(false)
    const isEditingEffectif = ref(false)
    const { notifyError, notifySuccess } = useNotyf()

    const effectifForm = ref({
      id: null,
      annee: '',
      nombre_homme: 0,
      nombre_femme: 0,
      entity_id: props.entity.id
    })
    const effectifToDelete = ref(null)

    const sortedEffectifs = computed(() => {
      if (!props.entity || !props.entity.effectifs) return []
      return [...props.entity.effectifs].sort((a, b) => b.annee - a.annee)
    })

    const getPercentage = (value, total) => {
      if (total === 0) return 0
      return (value / total) * 100
    }

    const formatCurrency = (amount) => {
      if (!amount) return 'Non renseigné'
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF'
      }).format(amount)
    }

    const formatDate = (date) => {
      return date ? new Date(date).toLocaleDateString('fr-FR') : 'Non renseigné'
    }

    function openEffectifModal() {
      resetEffectifForm()
      isEditingEffectif.value = false
      const modal = new Modal(document.getElementById('effectifModal'))
      modal.show()
    }

    function editEffectif(effectif) {
      effectifForm.value = {
        id: effectif.id,
        annee: effectif.annee,
        nombre_total: effectif.nombre_total,
        nombre_homme: effectif.nombre_homme,
        nombre_femme: effectif.nombre_femme,
        entity_id: props.entity.id
      }
      isEditingEffectif.value = true
      const modal = new Modal(document.getElementById('effectifModal'))
      modal.show()
    }

    function resetEffectifForm() {
      effectifForm.value = {
        id: null,
        annee: '',
        nombre_homme: 0,
        nombre_femme: 0,
        entity_id: props.entity.id
      }
    }

    async function saveEffectif() {
      loadingEffectif.value = true
      try {
        const payload = {
          annee: effectifForm.value.annee,
          nombre_total: effectifForm.value.nombre_homme + effectifForm.value.nombre_femme,
          nombre_homme: effectifForm.value.nombre_homme,
          nombre_femme: effectifForm.value.nombre_femme,
          entity_id: props.entity.id
        }
        if (isEditingEffectif.value && effectifForm.value.id) {
          await store.dispatch('effectifs/updateEffectif', { id: effectifForm.value.id, payload })
        } else {
          await store.dispatch('effectifs/createEffectif', payload)
        }
        const modal = Modal.getInstance(document.getElementById('effectifModal')) || new Modal(document.getElementById('effectifModal'))
        modal.hide()
        await props.reloadData()
        notifySuccess('Effectif enregistré avec succès')
      } catch (e) {
        console.log(e)
        notifyError(e?.detail ?? 'Erreur lors de l\'enregistrement de l\'effectif')
      } finally {
        loadingEffectif.value = false
        resetEffectifForm()
      }
    }

    function confirmDeleteEffectif(effectif) {
      effectifToDelete.value = effectif
      const modal = new Modal(document.getElementById('deleteEffectifModal'))
      modal.show()
    }

    async function deleteEffectif() {
      if (!effectifToDelete.value) return
      loadingEffectif.value = true
      try {
        await store.dispatch('effectifs/deleteEffectif', effectifToDelete.value.id)
        const modal = Modal.getInstance(document.getElementById('deleteEffectifModal')) || new Modal(document.getElementById('deleteEffectifModal'))
        modal.hide()
        await props.reloadData()
        notifySuccess('Effectif supprimé avec succès')
      } catch (e) {
        notifyError('Erreur lors de la suppression de l\'effectif')
      } finally {
        loadingEffectif.value = false
        effectifToDelete.value = null
      }
    }

    return {
      sortedEffectifs,
      getPercentage,
      formatCurrency,
      formatDate,
      openEffectifModal,
      editEffectif,
      saveEffectif,
      loadingEffectif,
      isEditingEffectif,
      effectifForm,
      confirmDeleteEffectif,
      deleteEffectif,
      effectifToDelete
    }
  }
}
</script>