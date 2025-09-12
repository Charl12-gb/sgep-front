// Exemple de données de test pour les membres du conseil avec les nouvelles fonctionnalités

const exempleMembresConseil = [
  {
    id: 1,
    nom_prenom: "Marie Durand",
    email: "marie.durand@example.com",
    sexe: "Femme",
    age: 45,
    telephone: "01 23 45 67 89",
    profil_professionnel: "Directrice générale d'une entreprise de technologie avec 20 ans d'expérience",
    structure_representee: "Secteur privé - Technologies",
    position: "Présidente",
    status: "active", // 🟢 Membre actuel
    is_committee: true,
    user_id: 101,
    board_council_id: 1,
    replace_date: null,
    replaces_id: null,
    replaced_by_id: null
  },
  {
    id: 2,
    nom_prenom: "Jean Martin",
    email: "jean.martin@example.com",
    sexe: "Homme",
    age: 52,
    telephone: "01 23 45 67 90",
    profil_professionnel: "Professeur d'université en économie",
    structure_representee: "Secteur académique",
    position: "Membre",
    status: "replaced", // 🟡 Membre remplacé
    is_committee: false,
    user_id: 102,
    board_council_id: 1,
    replace_date: "2024-01-15",
    replaces_id: null,
    replaced_by_id: 3 // Remplacé par Pierre Dubois
  },
  {
    id: 3,
    nom_prenom: "Pierre Dubois",
    email: "pierre.dubois@example.com",
    sexe: "Homme",
    age: 38,
    telephone: "01 23 45 67 91",
    profil_professionnel: "Expert comptable et commissaire aux comptes",
    structure_representee: "Secteur académique",
    position: "Membre",
    status: "active", // 🟢 Membre actuel (remplaçant)
    is_committee: true,
    user_id: 103,
    board_council_id: 1,
    replace_date: null,
    replaces_id: 2, // Remplace Jean Martin
    replaced_by_id: null
  },
  {
    id: 4,
    nom_prenom: "Sophie Leclerc",
    email: "sophie.leclerc@example.com",
    sexe: "Femme",
    age: 41,
    telephone: "01 23 45 67 92",
    profil_professionnel: "Avocate spécialisée en droit des affaires",
    structure_representee: "Secteur juridique",
    position: "Membre",
    status: "inactive", // ⚪ Membre inactif
    is_committee: false,
    user_id: 104,
    board_council_id: 1,
    replace_date: "2023-12-01",
    replaces_id: null,
    replaced_by_id: null
  },
  {
    id: 5,
    nom_prenom: "Ahmed Benali",
    email: "ahmed.benali@example.com",
    sexe: "Homme",
    age: 48,
    telephone: "01 23 45 67 93",
    profil_professionnel: "Directeur financier d'une grande entreprise publique",
    structure_representee: "Secteur public",
    position: "Trésorier",
    status: "active", // 🟢 Membre actuel
    is_committee: true,
    user_id: 105,
    board_council_id: 1,
    replace_date: null,
    replaces_id: null,
    replaced_by_id: null
  }
];

// Exemple d'historique de remplacement pour Jean Martin (ID: 2)
const exempleHistoriqueRemplacement = [
  {
    id: 1,
    director_id: 2,
    replacement_id: 3,
    replacement_date: "2024-01-15",
    reason: "Fin de mandat et passation de responsabilités",
    original_member: {
      id: 2,
      nom_prenom: "Jean Martin",
      position: "Membre",
      structure_representee: "Secteur académique"
    },
    replacement_member: {
      id: 3,
      nom_prenom: "Pierre Dubois", 
      position: "Membre",
      structure_representee: "Secteur académique"
    }
  }
];

// Exemple de filtrage par statut
const filtreParStatut = {
  tous: exempleMembresConseil, // 5 membres
  actifs: exempleMembresConseil.filter(m => m.status === 'active'), // 3 membres
  remplaces: exempleMembresConseil.filter(m => m.status === 'replaced'), // 1 membre
  inactifs: exempleMembresConseil.filter(m => m.status === 'inactive') // 1 membre
};

// Actions disponibles selon le statut
const actionsDisponibles = {
  active: ['remplacer', 'historique', 'modifier', 'supprimer'],
  replaced: ['historique', 'modifier'], // Pas de suppression ni de remplacement
  inactive: ['historique', 'modifier', 'supprimer']
};

console.log('📊 Exemples de données pour les tests:');
console.log('- Membres du conseil:', exempleMembresConseil.length);
console.log('- Membres actifs:', filtreParStatut.actifs.length);
console.log('- Membres remplacés:', filtreParStatut.remplaces.length);
console.log('- Membres inactifs:', filtreParStatut.inactifs.length);
console.log('- Historique disponible pour:', exempleHistoriqueRemplacement.length, 'remplacement(s)');

export {
  exempleMembresConseil,
  exempleHistoriqueRemplacement,
  filtreParStatut,
  actionsDisponibles
};
