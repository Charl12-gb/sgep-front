// Debug helper pour vérifier les secteurs d'activité
import { getSectorsByCategory, getAllSectors, searchSectors } from '@/utils/sectorsHelper'

export function debugSectors() {
  console.group('🔍 DEBUG SECTEURS D\'ACTIVITÉ')
  
  const allSectors = getAllSectors()
  const sectorsByCategory = getSectorsByCategory()
  
  console.log(`📊 Total des secteurs: ${allSectors.length}`)
  console.log(`📁 Nombre de catégories: ${Object.keys(sectorsByCategory).length}`)
  
  console.group('🏷️ Catégories détaillées:')
  Object.entries(sectorsByCategory).forEach(([category, sectors]) => {
    console.log(`${category}: ${sectors.length} secteurs`)
    console.log(`   Premiers: ${sectors.slice(0, 3).join(', ')}...`)
  })
  console.groupEnd()
  
  // Vérification des secteurs mentionnés par l'utilisateur
  const sectorsToCheck = [
    'Aménagement du territoire',
    'Emploi', 
    'Travail',
    'Administration publique',
    'Culture',
    'Tourisme',
    'Sport'
  ]
  
  console.group('✅ Vérification secteurs spécifiques:')
  sectorsToCheck.forEach(sector => {
    const found = allSectors.includes(sector)
    const searchResults = searchSectors(sector)
    console.log(`${sector}: ${found ? '✅' : '❌'} ${found ? 'Trouvé' : 'Manquant'}`)
    if (searchResults.length > 0 && !found) {
      console.log(`   Suggestions: ${searchResults.slice(0, 3).join(', ')}`)
    }
  })
  console.groupEnd()
  
  console.groupEnd()
  
  return {
    totalSectors: allSectors.length,
    totalCategories: Object.keys(sectorsByCategory).length,
    categories: sectorsByCategory,
    allSectors
  }
}

// Auto-exécuter en développement
if (process.env.NODE_ENV === 'development') {
  // Attendre que le DOM soit chargé
  if (typeof window !== 'undefined') {
    window.debugSectors = debugSectors
    console.log('🔧 Debug secteurs disponible: tapez debugSectors() dans la console')
  }
}