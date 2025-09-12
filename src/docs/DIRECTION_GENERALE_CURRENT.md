# Direction Générale - Nouvelles Fonctionnalités "Current Director"

## Vue d'ensemble

Le module Direction Générale a été amélioré avec de nouvelles fonctionnalités pour gérer les directeurs "actuels" (current). Ces améliorations permettent de :

- Définir un directeur comme "actuel" pour une position donnée
- Automatiquement désactiver les autres directeurs de la même position
- Maintenir un historique des directeurs tout en identifiant clairement qui est en poste actuellement

## Backend - Nouveaux Endpoints

### 1. Définir un directeur comme current (méthode simple)
```
PUT /direction-generale/{director_id}/set-current
```

### 2. Définir un directeur comme current par position
```
PUT /direction-generale/entity/{entity_id}/position/{position}/set-current/{director_id}
```

### 3. Récupérer uniquement les directeurs actuels d'une entité
```
GET /direction-generale/entity/{entity_id}/current
```

## Frontend - Nouvelles Actions du Store

### Actions

#### `fetchCurrentDirectionGeneraleByEntity(entityId)`
Récupère uniquement les directeurs actuels d'une entité.

```javascript
// Utilisation
await this.$store.dispatch('directionGenerale/fetchCurrentDirectionGeneraleByEntity', entityId)
```

#### `setDirectorAsCurrent(directorId)`
Définit un directeur comme actuel (méthode simple).

```javascript
// Utilisation
const updatedDirector = await this.$store.dispatch('directionGenerale/setDirectorAsCurrent', directorId)
```

#### `setDirectorAsCurrentByPosition({ entityId, position, directorId })`
Définit un directeur comme actuel pour une position spécifique.

```javascript
// Utilisation
const result = await this.$store.dispatch('directionGenerale/setDirectorAsCurrentByPosition', {
  entityId: 'entity-uuid',
  position: 'Directeur Général',
  directorId: 'director-uuid'
})
```

#### `fetchDirectionGeneraleWithCurrentFilter({ entityId, isCurrentOnly, ...params })`
Récupère les directeurs avec filtre sur le statut "current".

```javascript
// Récupérer uniquement les directeurs actuels
const currentDirectors = await this.$store.dispatch('directionGenerale/fetchDirectionGeneraleWithCurrentFilter', {
  entityId: 'entity-uuid',
  isCurrentOnly: true
})

// Récupérer tous les directeurs (actuels et anciens)
const allDirectors = await this.$store.dispatch('directionGenerale/fetchDirectionGeneraleWithCurrentFilter', {
  entityId: 'entity-uuid',
  isCurrentOnly: false
})
```

### Getters

#### `currentDirectorsOnly`
Retourne uniquement les directeurs marqués comme "current".

```javascript
const currentDirectors = this.$store.getters['directionGenerale/currentDirectorsOnly']
```

#### `currentDirectorsByPosition(position)`
Retourne les directeurs actuels pour une position donnée.

```javascript
const currentDGs = this.$store.getters['directionGenerale/currentDirectorsByPosition']('Directeur Général')
```

#### `currentDirectorGeneral`
Retourne le Directeur Général actuel (s'il existe).

```javascript
const currentDG = this.$store.getters['directionGenerale/currentDirectorGeneral']
```

#### `currentDirectorAdmin`
Retourne le Directeur Administratif actuel (s'il existe).

```javascript
const currentDA = this.$store.getters['directionGenerale/currentDirectorAdmin']
```

#### `historicalDirectors`
Retourne les directeurs qui ne sont plus en poste (is_current_director = false).

```javascript
const formerDirectors = this.$store.getters['directionGenerale/historicalDirectors']
```

#### `currentDirectorsByEntity(entityId)`
Retourne les directeurs actuels d'une entité spécifique.

```javascript
const entityCurrentDirectors = this.$store.getters['directionGenerale/currentDirectorsByEntity'](entityId)
```

#### `hasCurrentDirectorForPosition(entityId, position)`
Vérifie s'il existe un directeur actuel pour une position donnée dans une entité.

```javascript
const hasDG = this.$store.getters['directionGenerale/hasCurrentDirectorForPosition'](entityId, 'Directeur Général')
```

## Règles Métier Importantes

### 1. Unicité par Position
- Un seul directeur peut être "current" par position dans une entité
- Quand un nouveau directeur est défini comme "current", tous les autres de la même position deviennent automatiquement "non-current"

### 2. Positions Indépendantes
- Les positions sont gérées indépendamment
- Un DG actuel n'affecte pas le statut du DA actuel

### 3. Historique Conservé
- Les anciens directeurs restent en base avec `is_current_director = false`
- L'historique est préservé pour les audits et rapports

## Exemples d'Utilisation Pratiques

### 1. Afficher les Directeurs Actuels
```vue
<template>
  <div v-if="currentDirectors.length > 0">
    <h4>Direction Actuelle</h4>
    <div v-for="director in currentDirectors" :key="director.id">
      <strong>{{ director.nom_prenom }}</strong> - {{ director.position }}
      <span class="badge badge-success">ACTUEL</span>
    </div>
  </div>
</template>

<script>
computed: {
  currentDirectors() {
    return this.$store.getters['directionGenerale/currentDirectorsOnly']
  }
}
</script>
```

### 2. Changer le Directeur Général
```vue
<template>
  <div>
    <select v-model="selectedDirectorId">
      <option v-for="director in allDGs" :key="director.id" :value="director.id">
        {{ director.nom_prenom }} 
        <span v-if="director.is_current_director">(ACTUEL)</span>
      </option>
    </select>
    <button @click="changeCurrentDG" :disabled="!selectedDirectorId">
      Définir comme DG Actuel
    </button>
  </div>
</template>

<script>
methods: {
  async changeCurrentDG() {
    try {
      await this.$store.dispatch('directionGenerale/setDirectorAsCurrentByPosition', {
        entityId: this.entityId,
        position: 'Directeur Général',
        directorId: this.selectedDirectorId
      })
      this.$toast.success('Directeur Général mis à jour')
    } catch (error) {
      this.$toast.error('Erreur lors de la mise à jour')
    }
  }
}
</script>
```

### 3. Vérifications Avant Actions
```javascript
methods: {
  async performDirectorAction() {
    // Vérifier s'il y a un DG actuel
    const hasDG = this.$store.getters['directionGenerale/hasCurrentDirectorForPosition'](
      this.entityId, 
      'Directeur Général'
    )
    
    if (!hasDG) {
      this.$toast.warning('Aucun Directeur Général actuel défini')
      return
    }
    
    // Obtenir le DG actuel
    const currentDG = this.$store.getters['directionGenerale/currentDirectorGeneral']
    
    if (currentDG) {
      console.log('DG actuel:', currentDG.nom_prenom)
      // Continuer avec l'action...
    }
  }
}
```

## Migration et Données Existantes

Les données existantes ont été automatiquement migrées :
- Tous les directeurs existants ont été marqués comme `is_current_director = true`
- Il est recommandé de réviser manuellement ces données pour définir correctement qui est actuellement en poste

## Tests et Validation

Un script de test complet est disponible dans `/api/test_current_director_logic.py` pour valider toutes les fonctionnalités backend.

Les nouvelles actions du store peuvent être testées via les outils de développement Vue.js ou en créant des composants de test spécifiques.
