<template>
  <div class="container-fluid py-4">
    <!-- En-tête -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h3 mb-1 text-dark fw-bold">Créer une nouvelle entité</h1>
            <p class="text-muted mb-0">Remplissez les informations pour créer une nouvelle entité</p>
          </div>
          <button @click="goBack" class="btn btn-outline-secondary">
            <i class="fas fa-times me-1"></i>
            Annuler
          </button>
        </div>
      </div>
    </div>
    
    <!-- Formulaire -->
    <form @submit.prevent="handleSubmit">
      <div class="row g-4">
        <div class="col-lg-8">
          <!-- Informations principales -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 fw-semibold">Informations principales</h5>
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
                    placeholder="Nom de l'entité"
                    required
                  />
                </div>
                
                <div class="col-md-4">
                  <label for="sigle" class="form-label fw-semibold">Sigle</label>
                  <input
                    id="sigle"
                    v-model="form.sigle"
                    type="text"
                    class="form-control"
                    placeholder="Ex: SARL, SA..."
                  />
                </div>
                
                <div class="col-md-6">
                  <label for="type" class="form-label fw-semibold">
                    Type d'entité <span class="text-danger">*</span>
                  </label>
                  <select
                    id="type"
                    v-model="form.type"
                    class="form-select"
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="Establishment">Établissement</option>
                    <option value="Society">Société</option>
                  </select>
                </div>
                
                <div class="col-md-6">
                  <label for="secteur_activite" class="form-label fw-semibold">Secteur d'activité</label>
                  <select
                    id="secteur_activite"
                    v-model="form.secteur_activite"
                    class="form-select"
                  >
                    <option value="">Sélectionner un secteur</option>
                    <option value="Public">Public</option>
                    <option value="Privé">Privé</option>
                    <option value="Mixte">Mixte</option>
                    <option value="Industrie">Industrie</option>
                    <option value="Services">Services</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="BTP">BTP</option>
                    <option value="Transport">Transport</option>
                    <option value="Énergie">Énergie</option>
                    <option value="Santé">Santé</option>
                    <option value="Éducation">Éducation</option>
                    <option value="Finance">Finance</option>
                    <option value="Technologie">Technologie</option>
                  </select>
                </div>
                
                <div class="col-md-6">
                  <label for="tutelle" class="form-label fw-semibold">Tutelle</label>
                  <input
                    id="tutelle"
                    v-model="form.tutelle"
                    type="text"
                    class="form-control"
                    placeholder="Organisme de tutelle"
                  />
                </div>
                
                <div class="col-md-6">
                  <label for="capital_social" class="form-label fw-semibold">Capital social / Dotation initiale (XOF)</label>
                  <input
                    id="capital_social"
                    v-model.number="form.capital_social"
                    type="number"
                    class="form-control"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div class="mt-3">
                <label for="objet_social" class="form-label fw-semibold">Objet social</label>
                <textarea
                  id="objet_social"
                  v-model="form.objet_social"
                  class="form-control"
                  rows="3"
                  placeholder="Description de l'objet social de l'entité"
                ></textarea>
              </div>
            </div>
          </div>
          
          <!-- Coordonnées -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 fw-semibold">Coordonnées</h5>
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
                    placeholder="contact@entite.com"
                  />
                </div>
                
                <div class="col-md-6">
                  <label for="phone" class="form-label fw-semibold">Téléphone</label>
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    class="form-control"
                    placeholder="+213 21 00 00 00"
                  />
                </div>
              </div>
              
              <div class="mt-3">
                <label for="address" class="form-label fw-semibold">Adresse</label>
                <textarea
                  id="address"
                  v-model="form.address"
                  class="form-control"
                  rows="3"
                  placeholder="Adresse complète de l'entité"
                ></textarea>
              </div>
              
              <div class="mt-3">
                <label for="description" class="form-label fw-semibold">Description</label>
                <textarea
                  id="description"
                  v-model="form.description"
                  class="form-control"
                  rows="4"
                  placeholder="Description générale de l'entité"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="col-lg-4">
          <!-- Card Effectifs ajoutée -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white py-3">
              <h6 class="mb-0 fw-semibold">Effectifs</h6>
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
                    <button type="button" class="btn btn-outline-danger btn-sm" @click="removeEffectif(idx)">
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
            <div class="card-header bg-white py-3">
              <h6 class="mb-0 fw-semibold">Actions</h6>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button type="submit" :disabled="loading" class="btn btn-success">
                  <i v-if="loading" class="fas fa-spinner fa-spin me-2"></i>
                  <i v-else class="fas fa-save me-2"></i>
                  {{ loading ? 'Création...' : 'Créer l\'entité' }}
                </button>
                <button type="button" @click="goBack" class="btn btn-outline-secondary">
                  <i class="fas fa-times me-2"></i>
                  Annuler
                </button>
              </div>
              
              <hr class="my-3">
              
              <div class="text-muted small">
                <p class="mb-2">
                  <i class="fas fa-info-circle me-1"></i>
                  Les champs marqués d'un <span class="text-danger">*</span> sont obligatoires.
                </p>
                <p class="mb-0">
                  <i class="fas fa-lightbulb me-1"></i>
                  Vous pourrez ajouter les effectifs et la direction après création.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useNotyf } from '@/mixins/useNotyf'

export default {
  name: 'EntitiesCreateView',
  setup() {
    const router = useRouter()
    const store = useStore()
    const { notifySuccess, notifyError } = useNotyf()
    
    const form = ref({
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
    
    // Ajout de la liste d'effectifs
    const effectifs = ref([])

    // Méthode pour ajouter une ligne
    const addEffectif = () => {
      effectifs.value.push({
        annee: new Date().getFullYear(),
        nombre_total: 0,
        nombre_homme: 0,
        nombre_femme: 0
      })
    }

    // Méthode pour retirer une ligne
    const removeEffectif = (idx) => {
      effectifs.value.splice(idx, 1)
    }
    
    // Méthode pour mettre à jour le total
    const updateTotal = (idx) => {
      const eff = effectifs.value[idx]
      eff.nombre_total = eff.nombre_homme + eff.nombre_femme
    }
    
    const loading = ref(false)
    
    const handleSubmit = async () => {
      loading.value = true
      try {
        const formData = { ...form.value }
        
        // Nettoyer les champs vides
        Object.keys(formData).forEach(key => {
          if (formData[key] === '' || formData[key] === null) {
            delete formData[key]
          }
        })
        
        // Ajouter la liste d'effectifs au formData
        if (effectifs.value.length > 0) {
          formData.effectifs = effectifs.value.map(eff => ({
            annee: eff.annee,
            nombre_total: eff.nombre_total,
            nombre_homme: eff.nombre_homme,
            nombre_femme: eff.nombre_femme
          }))
        }
        
        const result = await store.dispatch('entities/createEntity', formData)
        if (result.success) {
          notifySuccess('Entité créée avec succès')
          router.push('/entities')
        } else {
          notifyError(result.message || 'Erreur lors de la création')
        }
      } catch (error) {
        notifyError('Erreur lors de la création de l\'entité')
      } finally {
        loading.value = false
      }
    }
    
    const goBack = () => {
      router.go(-1)
    }
    
    return {
      form,
      loading,
      handleSubmit,
      goBack,
      effectifs,
      addEffectif,
      removeEffectif,
      updateTotal
    }
  }
}
</script>

