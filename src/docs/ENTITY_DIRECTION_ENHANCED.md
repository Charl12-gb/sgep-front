# EntityDirection - Composant Amélioré

## Vue d'ensemble des Améliorations

Le composant `EntityDirection` a été amélioré pour prendre en charge la gestion des directeurs "actuels" (current). Ces améliorations permettent une meilleure gestion de la direction générale avec un suivi historique complet.

## 🆕 Nouvelles Fonctionnalités

### 1. **Affichage du Statut Current**
- **Badge de statut** : Chaque directeur affiche maintenant un badge "ACTUEL" ou "ANCIEN"
- **Icône étoile** : Les directeurs actuels ont une icône étoile dorée
- **Section "Direction Actuelle"** : Résumé visuel des directeurs en poste

### 2. **Filtres Avancés**
- **Filtre par statut** : "Tous", "Directeurs actuels", "Anciens directeurs"
- **Filtre par position** : Inchangé, fonctionne avec le nouveau filtre de statut
- **Tri intelligent** : Directeurs actuels en premier, puis tri alphabétique

### 3. **Actions sur les Directeurs**
- **Bouton "Définir comme actuel"** : Icône étoile pour promouvoir un ancien directeur
- **Gestion automatique** : Désactive automatiquement l'ancien directeur actuel
- **Confirmation visuelle** : Messages de succès et mise à jour immédiate

### 4. **Formulaire Amélioré**
- **Checkbox "Directeur actuel"** : Option pour définir le statut lors de la création/modification
- **Aide contextuelle** : Explication de l'impact de cette option
- **Validation intelligente** : Gestion automatique des conflits

## 🎨 Interface Utilisateur

### Section "Direction Actuelle"
```vue
<!-- Affichage automatique si des directeurs actuels existent -->
<div class="card border-success">
  <div class="card-header bg-success bg-opacity-10">
    <i class="fas fa-star text-success me-2"></i>
    <h6 class="fw-semibold text-success mb-0">Direction Actuelle</h6>
  </div>
  <div class="card-body">
    <!-- Liste des directeurs actuels -->
  </div>
</div>
```

### Carte de Directeur Améliorée
```vue
<div class="card-header bg-light d-flex justify-content-between align-items-center">
  <div class="d-flex align-items-center">
    <h6 class="fw-semibold text-primary mb-0 me-2">{{ director.position }}</h6>
    <span v-if="director.is_current_director" class="badge bg-success">ACTUEL</span>
    <span v-else class="badge bg-secondary">ANCIEN</span>
  </div>
  <div class="btn-group btn-group-sm">
    <!-- Bouton pour définir comme actuel (si ancien) -->
    <button 
      v-if="!director.is_current_director" 
      class="btn btn-outline-success" 
      title="Définir comme directeur actuel" 
      @click="setAsCurrent(director)"
    >
      <i class="fas fa-star"></i>
    </button>
    <!-- Autres boutons... -->
  </div>
</div>
```

## ⚙️ Nouvelles Méthodes

### `setAsCurrent(director)`
Définit un directeur comme actuel en utilisant la nouvelle action du store.

```javascript
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
```

### Filtres Améliorés
```javascript
const filteredDirectors = computed(() => {
  let filtered = [...props.directors]
  
  // Filtre par position (existant)
  if (filters.value.position) {
    filtered = filtered.filter(d => d.position === filters.value.position)
  }
  
  // Nouveau filtre par statut
  if (filters.value.status === 'current') {
    filtered = filtered.filter(d => d.is_current_director === true)
  } else if (filters.value.status === 'former') {
    filtered = filtered.filter(d => d.is_current_director === false)
  }
  
  // Tri intelligent : actuels en premier
  return filtered.sort((a, b) => {
    if (a.is_current_director && !b.is_current_director) return -1
    if (!a.is_current_director && b.is_current_director) return 1
    return a.nom_prenom.localeCompare(b.nom_prenom)
  })
})
```

## 📋 Props et Émissions

### Props (inchangées)
- `directors` : Array des directeurs
- `entityId` : ID de l'entité
- `reloadData` : Fonction de rechargement

### Nouvelles Computed Properties
- `currentDirectors` : Liste des directeurs actuels uniquement
- `filteredDirectors` : Liste filtrée avec nouveau tri

## 🔄 Flux de Données

### 1. Création/Modification
```
Formulaire → Validation → Store Action → Backend → Reload → UI Update
```

### 2. Définir comme Actuel
```
Clic Étoile → setDirectorAsCurrentByPosition → Backend → Reload → UI Update
```

### 3. Filtrage
```
Changement Filtre → Computed Property → UI Update (Instantané)
```

## 🎯 Règles Métier Appliquées

### 1. **Unicité par Position**
- Un seul directeur actuel par position par entité
- Désactivation automatique de l'ancien lors de la promotion d'un nouveau

### 2. **Positions Indépendantes**
- DG et DA gérés séparément
- Possible d'avoir un DG actuel ET un DA actuel simultanément

### 3. **Conservation de l'Historique**
- Les anciens directeurs restent en base
- Aucune suppression de données historiques

## 📱 Responsivité

### Mobile (< 768px)
- Cartes en une colonne
- Boutons empilés verticalement
- Section direction actuelle compacte

### Tablette (768px - 1024px)
- Cartes en 2 colonnes
- Filtres horizontaux
- Interface optimisée

### Desktop (> 1024px)
- Cartes en 2 colonnes maximum pour lisibilité
- Tous les contrôles visibles
- Interface complète

## 🧪 Tests et Validation

### Tests Unitaires
Le fichier `EntityDirectionTest.js` fournit :
- Données de test réalistes
- Scénarios de validation
- Tests d'interface utilisateur
- Validation des règles métier

### Tests Manuels Recommandés
1. **Scénario Promotion** : Promouvoir un ancien directeur → Vérifier désactivation automatique
2. **Scénario Création** : Ajouter directeur avec "actuel" coché → Vérifier impact
3. **Scénario Filtres** : Tester toutes les combinaisons de filtres
4. **Scénario Responsive** : Tester sur différentes tailles d'écran

## 🚀 Utilisation dans l'Application

### Import et Usage
```vue
<template>
  <EntityDirection 
    :directors="entityDirectors"
    :entityId="currentEntity.id"
    :reloadData="loadEntityDirectors"
    @data-updated="handleDirectorsUpdate"
  />
</template>

<script>
import EntityDirection from '@/components/entity/EntityDirection.vue'

export default {
  components: {
    EntityDirection
  },
  
  methods: {
    async loadEntityDirectors() {
      // Charger les directeurs depuis l'API
      await this.$store.dispatch('directionGenerale/fetchDirectionGeneraleByEntity', this.currentEntity.id)
    },
    
    handleDirectorsUpdate(data) {
      // Gérer les mises à jour si nécessaire
      console.log('Directeurs mis à jour:', data)
    }
  }
}
</script>
```

## 🔧 Configuration et Personnalisation

### Classes CSS Personnalisables
- `.current-director-badge` : Badge directeur actuel
- `.former-director-badge` : Badge ancien directeur
- `.current-director-section` : Section direction actuelle
- `.star-action-button` : Bouton étoile

### Messages Personnalisables
Tous les messages sont configurables via les méthodes `notifySuccess` et `notifyError`.

## 📈 Métriques de Performance

### Optimisations Appliquées
- **Computed Properties** : Recalcul intelligent des filtres
- **v-if Conditions** : Rendu conditionnel des éléments
- **Array Methods** : Utilisation efficace de filter() et sort()
- **Event Handling** : Debouncing implicite des actions

### Recommandations
- Limiter à 50 directeurs par entité pour des performances optimales
- Utiliser la pagination si plus de 20 directeurs affichés
- Précharger les données critiques

Cette documentation couvre toutes les améliorations apportées au composant `EntityDirection` pour la gestion des directeurs "actuels".
