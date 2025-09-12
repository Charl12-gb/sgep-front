export const OUTIL_TEMPLATES = {
  FONCTIONNEMENT_CONSEIL: {
    COMITES_SPECIALISES: {
      template: {
        nom_comite: '',
        administrateurs_membres: [],
        nombre_reunions_annee: 0,
        annee: new Date().getFullYear()
      },
      fields: [
        { key: 'nom_comite', label: 'Nom du comité', type: 'text', required: true },
        { key: 'administrateurs_membres', label: 'Administrateurs membres', type: 'list', required: true },
        { key: 'nombre_reunions_annee', label: 'Nombre de réunions/an', type: 'number', required: true },
        { key: 'annee', label: 'Année', type: 'number', required: true }
      ]
    },
    SUIVI_DECISIONS: {
      template: {
        annee: new Date().getFullYear(),
        nombre_recommandations_formulees: 0,
        nombre_recommandations_mises_en_oeuvre: 0,
        niveau_execution_pourcentage: 0
      },
      fields: [
        { key: 'annee', label: 'Année', type: 'number', required: true },
        { key: 'nombre_recommandations_formulees', label: 'Nombre de recommandations formulées', type: 'number', required: true },
        { key: 'nombre_recommandations_mises_en_oeuvre', label: 'Nombre de recommandations mises en œuvre', type: 'number', required: true },
        { key: 'niveau_execution_pourcentage', label: 'Niveau d\'exécution (%)', type: 'number', required: false }
      ]
    }
  },
  PILOTAGE_STRATEGIQUE: {
    PLAN_STRATEGIQUE: {
      template: {
        date_adoption: '',
        echeance_horizon: '',
        objectifs_principaux: []
      },
      fields: [
        { key: 'date_adoption', label: 'Date d\'adoption du Plan', type: 'date', required: true },
        { key: 'echeance_horizon', label: 'Échéance/Horizon du Plan', type: 'text', required: true },
        { key: 'objectifs_principaux', label: 'Objectifs principaux', type: 'list', required: false }
      ]
    },
    CONTRAT_OBJECTIF_DG: {
      template: {
        date_signature: '',
        periode: '',
        objectifs_definis: []
      },
      fields: [
        { key: 'date_signature', label: 'Date de signature', type: 'date', required: true },
        { key: 'periode', label: 'Période', type: 'text', required: true },
        { key: 'objectifs_definis', label: 'Objectifs définis', type: 'list', required: false }
      ]
    }
  },
  FORMATION_ADMINISTRATEURS: {
    template: {
      annee: new Date().getFullYear(),
      themes_formation: '',
      date_formation: '',
      nombre_administrateurs_formes: 0,
      structure_formation: '',
      nombre_jours_formation: 0,
      source_financement: 'Etat'
    },
    fields: [
      { key: 'annee', label: 'Année', type: 'number', required: true },
      { key: 'themes_formation', label: 'Thèmes de la formation', type: 'text', required: true },
      { key: 'date_formation', label: 'Date de formation', type: 'date', required: true },
      { key: 'nombre_administrateurs_formes', label: 'Nombre total d\'administrateurs formés', type: 'number', required: true },
      { key: 'structure_formation', label: 'Structure de formation', type: 'text', required: true },
      { key: 'nombre_jours_formation', label: 'Nombre de jours de formation', type: 'number', required: true },
      { 
        key: 'source_financement', 
        label: 'Source de financement', 
        type: 'select', 
        required: true,
        options: [
          { value: 'Etat', label: 'État' },
          { value: 'Ressources propres', label: 'Ressources propres' },
          { value: 'Partenaires Techniques et Financiers', label: 'Partenaires Techniques et Financiers' }
        ]
      }
    ]
  },
  DEFAULT: {
    template: {
      titre: '',
      description: '',
      date: '',
      statut: 'En cours'
    },
    fields: [
      { key: 'titre', label: 'Titre/Intitulé', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'text', required: false },
      { key: 'date', label: 'Date', type: 'date', required: false },
      { 
        key: 'statut', 
        label: 'Statut', 
        type: 'select', 
        required: false,
        options: [
          { value: 'En cours', label: 'En cours' },
          { value: 'Terminé', label: 'Terminé' },
          { value: 'Planifié', label: 'Planifié' },
          { value: 'Suspendu', label: 'Suspendu' }
        ]
      }
    ]
  }
}

export function createNewTemplateItem(template) {
  if (!template || !template.template) {
    return {
      titre: '',
      description: '',
      date: '',
      statut: 'En cours'
    }
  }
  return JSON.parse(JSON.stringify(template.template))
}

export function getTemplateForOutil(outilCode) {
  const code = outilCode ? outilCode.toLowerCase() : 'default'
  
  if (code.includes('comite') || code.includes('commission')) {
    return OUTIL_TEMPLATES.FONCTIONNEMENT_CONSEIL.COMITES_SPECIALISES
  }
  
  if (code.includes('suivi') && code.includes('decision')) {
    return OUTIL_TEMPLATES.FONCTIONNEMENT_CONSEIL.SUIVI_DECISIONS
  }
  
  if (code.includes('plan') && code.includes('strategique')) {
    return OUTIL_TEMPLATES.PILOTAGE_STRATEGIQUE.PLAN_STRATEGIQUE
  }
  
  if (code.includes('contrat') && code.includes('objectif')) {
    return OUTIL_TEMPLATES.PILOTAGE_STRATEGIQUE.CONTRAT_OBJECTIF_DG
  }
  
  if (code.includes('formation')) {
    return OUTIL_TEMPLATES.FORMATION_ADMINISTRATEURS
  }
  
  return OUTIL_TEMPLATES.DEFAULT
}

export function validateTemplateItem(item, template) {
  if (!template || !template.fields) {
    return { isValid: true, errors: [] }
  }
  
  const errors = []
  
  template.fields.forEach(field => {
    if (field.required && (!item[field.key] || item[field.key] === '')) {
      errors.push(`${field.label} est requis`)
    }
    
    if (field.type === 'number' && item[field.key] && isNaN(item[field.key])) {
      errors.push(`${field.label} doit être un nombre valide`)
    }
    
    if (field.type === 'list' && item[field.key] && !Array.isArray(item[field.key])) {
      errors.push(`${field.label} doit être une liste`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
