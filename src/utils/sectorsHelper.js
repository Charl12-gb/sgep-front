/**
 * Helper pour la gestion des secteurs d'activité
 * Fournit une liste exhaustive des secteurs d'activité organisés par catégories
 */

/**
 * Liste exhaustive des secteurs d'activité
 * Organisée par catégories pour une meilleure lisibilité
 */
export const ACTIVITY_SECTORS = {
  // Secteurs par nature juridique
  NATURE: [
    'Public',
    'Privé',
    'Mixte',
    'Associatif',
    'Coopératif'
  ],

  // Secteurs primaires
  PRIMARY: [
    'Agriculture',
    'Élevage',
    'Pêche',
    'Aquaculture',
    'Aviculture',
    'Apiculture',
    'Foresterie',
    'Sylviculture',
    'Mines et Carrières',
    'Pétrole et Gaz',
    'Extraction minière',
    'Exploitation forestière',
    'Chasse'
  ],

  // Secteurs secondaires (Industrie et transformation)
  SECONDARY: [
    'Industrie Agroalimentaire',
    'Industrie Textile',
    'Industrie Chimique',
    'Industrie Pharmaceutique',
    'Industrie Métallurgique',
    'Industrie Mécanique',
    'Industrie Automobile',
    'Industrie Électronique',
    'Industrie du Bois',
    'Industrie du Papier',
    'Industrie du Cuir',
    'Industrie Plastique',
    'Industrie Céramique',
    'Industrie Minière',
    'Sidérurgie',
    'Métallurgie',
    'Raffinage',
    'Pétrochimie',
    'Cimenterie',
    'Verrerie',
    'BTP',
    'Construction',
    'Travaux Publics',
    'Génie Civil',
    'Architecture',
    'Urbanisme',
    'Aménagement du territoire'
  ],

  // Secteurs tertiaires (Services)
  TERTIARY: [
    'Commerce',
    'Commerce de Gros',
    'Commerce de Détail',
    'Import-Export',
    'Distribution',
    'Transport',
    'Transport Routier',
    'Transport Aérien',
    'Transport Maritime',
    'Transport Ferroviaire',
    'Logistique',
    'Entreposage',
    'Télécommunications',
    'Services Informatiques',
    'Technologie',
    'Informatique',
    'Développement logiciel',
    'Finance',
    'Banque',
    'Microfinance',
    'Assurance',
    'Courtage',
    'Change',
    'Immobilier',
    'Promotion immobilière',
    'Tourisme',
    'Hôtellerie',
    'Restauration',
    'Santé',
    'Services Médicaux',
    'Hôpitaux',
    'Cliniques',
    'Laboratoires médicaux',
    'Pharmacie',
    'Médecine traditionnelle',
    'Protection sociale',
    'Assistance humanitaire',
    'Action sociale',
    'Éducation',
    'Enseignement',
    'Formation',
    'Formation professionnelle',
    'Recherche',
    'Conseil',
    'Audit',
    'Services Juridiques',
    'Services Comptables',
    'Marketing',
    'Publicité',
    'Communication',
    'Relations publiques',
    'Médias',
    'Presse',
    'Radio',
    'Télévision',
    'Cinéma',
    'Arts',
    'Culture',
    'Patrimoine',
    'Musées',
    'Spectacles',
    'Sport',
    'Loisirs',
    'Événementiel',
    'Services à la Personne',
    'Services aux Entreprises',
    'Consulting',
    'Ressources Humaines',
    'Recrutement',
    'Intérim',
    'Nettoyage',
    'Gardiennage',
    'Sécurité',
    'Surveillance',
    'Maintenance',
    'Réparation',
    'Artisanat',
    'Coiffure',
    'Esthétique',
    'Photographie'
  ],

  // Secteurs d'utilité publique
  PUBLIC_UTILITY: [
    'Énergie',
    'Électricité',
    'Gaz',
    'Énergie solaire',
    'Énergie éolienne',
    'Hydroélectricité',
    'Eau',
    'Traitement des eaux',
    'Distribution d\'eau',
    'Mine',
    'Assainissement',
    'Déchets',
    'Recyclage',
    'Environnement',
    'Écologie',
    'Meteorologie'
  ],

  // Secteurs administratifs et gouvernementaux
  ADMINISTRATIVE: [
    'Administration publique',
    'Fonction publique',
    'Ministères',
    'Collectivités locales',
    'Communes',
    'Préfectures',
    'Justice',
    'Police',
    'Gendarmerie',
    'Douanes',
    'Impôts',
    'Statistiques',
    'Diplomatie',
    'Coopération internationale',
    'Emploi',
    'Travail',
    'Affaires sociales'
  ],

  // Secteurs émergents et modernes
  EMERGING: [
    'Économie Numérique',
    'E-commerce',
    'Marketplace',
    'Fintech',
    'Insurtech',
    'Edtech',
    'Healthtech',
    'Agritech',
    'Biotechnologie',
    'Nanotechnologie',
    'Énergies Renouvelables',
    'Développement Durable',
    'Économie verte',
    'Intelligence Artificielle',
    'Machine Learning',
    'Big Data',
    'IoT',
    'Robotique',
    'Blockchain',
    'Cryptomonnaies',
    'Services Cloud',
    'Cybersécurité',
    'Réalité virtuelle',
    'Impression 3D',
    'Drones'
  ]
}

/**
 * Retourne tous les secteurs d'activité sous forme de liste plate
 * @returns {string[]} Liste de tous les secteurs
 */
export const getAllSectors = () => {
  const allSectors = []
  
  Object.values(ACTIVITY_SECTORS).forEach(categoryArray => {
    allSectors.push(...categoryArray)
  })
  
  return allSectors.sort()
}

/**
 * Retourne les secteurs organisés par catégories avec labels
 * @returns {Object} Secteurs organisés par catégories
 */
export const getSectorsByCategory = () => {
  return {
    'Nature Juridique': ACTIVITY_SECTORS.NATURE,
    'Secteur Primaire': ACTIVITY_SECTORS.PRIMARY,
    'Secteur Secondaire': ACTIVITY_SECTORS.SECONDARY,
    'Secteur Tertiaire': ACTIVITY_SECTORS.TERTIARY,
    'Utilité Publique': ACTIVITY_SECTORS.PUBLIC_UTILITY,
    'Administration': ACTIVITY_SECTORS.ADMINISTRATIVE,
    'Secteurs Émergents': ACTIVITY_SECTORS.EMERGING
  }
}

/**
 * Retourne les secteurs les plus couramment utilisés
 * @returns {string[]} Liste des secteurs populaires
 */
export const getPopularSectors = () => {
  return [
    'Public',
    'Privé',
    'Commerce',
    'Services',
    'Industrie',
    'BTP',
    'Construction',
    'Transport',
    'Logistique',
    'Agriculture',
    'Élevage',
    'Pêche',
    'Santé',
    'Hôpitaux',
    'Protection sociale',
    'Éducation',
    'Enseignement',
    'Finance',
    'Banque',
    'Microfinance',
    'Assurance',
    'Technologie',
    'Informatique',
    'Télécommunications',
    'Énergie',
    'Électricité',
    'Eau',
    'Mine',
    'Tourisme',
    'Hôtellerie',
    'Culture',
    'Sport',
    'Administration publique',
    'Aménagement du territoire',
    'Travaux Publics',
    'Environnement',
    'E-commerce',
    'Fintech'
  ]
}

/**
 * Recherche des secteurs par mot-clé
 * @param {string} keyword - Mot-clé de recherche
 * @returns {string[]} Liste des secteurs correspondants
 */
export const searchSectors = (keyword) => {
  if (!keyword || keyword.trim() === '') {
    return []
  }
  
  const searchTerm = keyword.toLowerCase().trim()
  const allSectors = getAllSectors()
  
  return allSectors.filter(sector => 
    sector.toLowerCase().includes(searchTerm)
  )
}

/**
 * Valide si un secteur existe dans la liste
 * @param {string} sector - Secteur à valider
 * @returns {boolean} True si le secteur existe
 */
export const isValidSector = (sector) => {
  const allSectors = getAllSectors()
  return allSectors.includes(sector)
}

/**
 * Formate une liste de secteurs en chaîne avec séparateur
 * @param {string[]} sectors - Liste des secteurs
 * @param {string} separator - Séparateur (défaut: '/')
 * @returns {string} Chaîne formatée
 */
export const formatSectorsString = (sectors, separator = '/') => {
  if (!Array.isArray(sectors) || sectors.length === 0) {
    return ''
  }
  
  return sectors.join(separator)
}

/**
 * Parse une chaîne de secteurs en tableau
 * @param {string} sectorsString - Chaîne de secteurs
 * @param {string} separator - Séparateur (défaut: '/')
 * @returns {string[]} Tableau des secteurs
 */
export const parseSectorsString = (sectorsString, separator = '/') => {
  if (!sectorsString || typeof sectorsString !== 'string') {
    return []
  }
  
  return sectorsString.split(separator)
    .map(sector => sector.trim())
    .filter(sector => sector !== '')
}

/**
 * Retourne les secteurs avec leur catégorie
 * @returns {Object[]} Liste des secteurs avec métadonnées
 */
export const getSectorsWithMetadata = () => {
  const sectorsWithMeta = []
  const categories = getSectorsByCategory()
  
  Object.entries(categories).forEach(([categoryName, sectors]) => {
    sectors.forEach(sector => {
      sectorsWithMeta.push({
        name: sector,
        category: categoryName,
        value: sector
      })
    })
  })
  
  return sectorsWithMeta.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Configuration par défaut pour les composants de sélection
 */
export const SECTOR_CONFIG = {
  // Configuration pour les select multiples
  MULTI_SELECT_CONFIG: {
    placeholder: 'Sélectionner un ou plusieurs secteurs...',
    searchPlaceholder: 'Rechercher un secteur...',
    noResultsText: 'Aucun secteur trouvé',
    maxItems: 10
  },
  
  // Textes d'aide
  HELP_TEXTS: {
    single: 'Sélectionnez le secteur d\'activité principal',
    multiple: 'Maintenez Ctrl/Cmd pour sélectionner plusieurs secteurs',
    search: 'Tapez pour rechercher dans la liste des secteurs'
  }
}