export const restaurant = {
  nom: "L'Air Bleu",
  societe: "SARL LG AIR",
  adresse: "3 rue Anatole France, 44550 Montoir-de-Bretagne",
  ville: "Montoir-de-Bretagne",
  telephone: "02 40 90 01 17",
  positionnement: "Restaurant traditionnel — référence du déjeuner en Loire-Atlantique",
  couverts: 70,
  ticketMoyen: 17.5,
};

/** Exercice clos au 31/08/2025 — données officielles de référence. */
export const finances = {
  exercice: "Exercice clos au 31/08/2025",
  chiffreAffaires: 492781.72,
  resultatNet: -9192.13,
};

export type Kpi = { label: string; valeur: string; variation: number; detail: string };

export const kpis: Kpi[] = [
  { label: "Chiffre d'affaires annuel", valeur: "492 782 €", variation: 2.1, detail: "exercice clos au 31/08/2025" },
  { label: "Résultat net", valeur: "-9 192 €", variation: -1.9, detail: "objectif : retour à l'équilibre" },
  { label: "Ticket moyen déjeuner", valeur: "17,50 €", variation: 2.4, detail: "objectif 19 € (dessert + café)" },
  { label: "Couverts / service midi", valeur: "70", variation: 3.2, detail: "capacité utilisée à 84 %" },
  { label: "Note Google", valeur: "4,5 / 5", variation: 1.8, detail: "312 avis cumulés" },
  { label: "Communauté Facebook + Instagram", valeur: "2 480", variation: 6.4, detail: "dont 1 690 abonnés Facebook" },
];

/** Répartition mensuelle indicative du CA de l'exercice clos au 31/08/2025 (total 492 782 €). */
export const caMensuel = [
  { mois: "Fév", ca: 38900, couverts: 2210 },
  { mois: "Mar", ca: 41200, couverts: 2350 },
  { mois: "Avr", ca: 42600, couverts: 2430 },
  { mois: "Mai", ca: 43800, couverts: 2500 },
  { mois: "Juin", ca: 44500, couverts: 2540 },
  { mois: "Juil", ca: 39100, couverts: 2230 },
  { mois: "Août", ca: 33400, couverts: 1910 },
];

export const canaux = [
  { canal: "Google Business", part: 42 },
  { canal: "Bouche-à-oreille", part: 24 },
  { canal: "Facebook", part: 16 },
  { canal: "Instagram", part: 10 },
  { canal: "Téléphone / passage", part: 8 },
];

export type Avis = {
  auteur: string;
  note: number;
  date: string;
  texte: string;
  sentiment: "positif" | "neutre" | "négatif";
  repondu: boolean;
};

export const avis: Avis[] = [
  {
    auteur: "Camille R.",
    note: 5,
    date: "12 juil.",
    texte:
      "Menu du midi copieux et vraiment fait maison. Servis en 45 minutes avec le sourire, parfait pour la pause déjeuner.",
    sentiment: "positif",
    repondu: true,
  },
  {
    auteur: "Julien M.",
    note: 4,
    date: "10 juil.",
    texte: "Bon rapport qualité-prix, mais salle très pleine à 12 h 30 : pensez à réserver si vous êtes pressés.",
    sentiment: "neutre",
    repondu: false,
  },
  {
    auteur: "Sofia B.",
    note: 2,
    date: "8 juil.",
    texte: "Plat du jour épuisé quand nous sommes arrivés à 13 h et peu d'alternatives proposées. Dommage.",
    sentiment: "négatif",
    repondu: false,
  },
  {
    auteur: "Antoine L.",
    note: 5,
    date: "5 juil.",
    texte: "On y déjeune entre collègues chaque semaine : cuisine généreuse, accueil chaleureux, addition raisonnable.",
    sentiment: "positif",
    repondu: true,
  },
  {
    auteur: "Marie D.",
    note: 4,
    date: "2 juil.",
    texte: "Desserts maison excellents et produits frais. Repas de famille du dimanche très réussi.",
    sentiment: "positif",
    repondu: false,
  },
];

export const repartitionNotes = [
  { note: "5 étoiles", nombre: 178 },
  { note: "4 étoiles", nombre: 86 },
  { note: "3 étoiles", nombre: 28 },
  { note: "2 étoiles", nombre: 12 },
  { note: "1 étoile", nombre: 8 },
];

export type Publication = {
  jour: number;
  titre: string;
  canal: "Instagram" | "Facebook" | "Google" | "Newsletter";
  statut: "planifié" | "brouillon" | "publié";
  heure: string;
};

export const calendrier: Publication[] = [
  { jour: 1, titre: "Menu de la semaine", canal: "Facebook", statut: "publié", heure: "09:00" },
  { jour: 2, titre: "Plat du jour : blanquette maison", canal: "Google", statut: "publié", heure: "10:30" },
  { jour: 4, titre: "Coulisses cuisine : épluchage du matin", canal: "Instagram", statut: "planifié", heure: "11:00" },
  { jour: 8, titre: "Menu de la semaine", canal: "Facebook", statut: "planifié", heure: "09:00" },
  { jour: 11, titre: "Dessert maison du jour", canal: "Instagram", statut: "brouillon", heure: "11:30" },
  { jour: 15, titre: "Offre déjeuner pro : formule express", canal: "Google", statut: "planifié", heure: "10:00" },
  { jour: 18, titre: "Portrait de l'équipe en salle", canal: "Facebook", statut: "brouillon", heure: "17:30" },
  { jour: 22, titre: "Produits frais : nos fournisseurs locaux", canal: "Instagram", statut: "planifié", heure: "11:00" },
  { jour: 26, titre: "Newsletter fidélité déjeuner", canal: "Newsletter", statut: "brouillon", heure: "08:30" },
];

export type Concurrent = {
  nom: string;
  note: number;
  avis: number;
  ticket: number;
  visibilite: number;
  tendance: number;
};

export const concurrents: Concurrent[] = [
  { nom: "L'Air Bleu", note: 4.5, avis: 312, ticket: 17.5, visibilite: 68, tendance: 4.2 },
  { nom: "Brasserie du Brivet (Trignac)", note: 4.3, avis: 486, ticket: 19, visibilite: 74, tendance: 2.1 },
  { nom: "Le Routier de Montoir", note: 4.4, avis: 264, ticket: 15, visibilite: 61, tendance: 3.5 },
  { nom: "Table de la Zone (Saint-Nazaire)", note: 4.1, avis: 198, ticket: 16.5, visibilite: 52, tendance: -1.3 },
  { nom: "Auberge de Donges", note: 4.6, avis: 402, ticket: 21, visibilite: 70, tendance: 3.4 },
];

export type ModuleIA = { titre: string; description: string; categorie: string; duree: string };

export type AlerteConcurrence = {
  id: string;
  concurrent: string;
  type: "note" | "prix" | "visibilite" | "nouveaute";
  titre: string;
  detail: string;
  variation: number;
  gravite: "critique" | "importante" | "info";
  date: string;
  lue: boolean;
};

export const alertesConcurrence: AlerteConcurrence[] = [
  {
    id: "a1",
    concurrent: "Brasserie du Brivet (Trignac)",
    type: "visibilite",
    titre: "Bond de visibilité locale",
    detail: "Score de visibilité passé de 66 à 74 en 14 jours : publications Google Business quasi quotidiennes.",
    variation: 12.1,
    gravite: "critique",
    date: "Aujourd'hui, 09:12",
    lue: false,
  },
  {
    id: "a2",
    concurrent: "Auberge de Donges",
    type: "prix",
    titre: "Hausse de la formule déjeuner",
    detail: "Formule du midi passée de 19 € à 21 € : opportunité de mise en avant de notre rapport qualité/prix.",
    variation: 10.5,
    gravite: "importante",
    date: "Hier, 18:40",
    lue: false,
  },
  {
    id: "a3",
    concurrent: "Le Routier de Montoir",
    type: "note",
    titre: "Note Google en progression",
    detail: "4,2 → 4,4 / 5 après 26 nouveaux avis en un mois (sollicitation active en fin de repas).",
    variation: 4.8,
    gravite: "importante",
    date: "Il y a 2 jours",
    lue: false,
  },
  {
    id: "a4",
    concurrent: "Table de la Zone (Saint-Nazaire)",
    type: "nouveaute",
    titre: "Formule express 13,90 € pour les pros",
    detail: "Entrée + plat servis en 30 minutes, annoncée sur Facebook : cible la clientèle professionnelle du midi.",
    variation: 0,
    gravite: "info",
    date: "Il y a 4 jours",
    lue: true,
  },
  {
    id: "a5",
    concurrent: "Brasserie du Brivet (Trignac)",
    type: "note",
    titre: "Chute ponctuelle de la note",
    detail: "3 avis 2 étoiles sur l'attente du midi : opportunité de captation de la clientèle pressée.",
    variation: -2.1,
    gravite: "info",
    date: "Il y a 6 jours",
    lue: true,
  },
];

export type RegleAlerte = {
  id: "note" | "prix" | "visibilite" | "nouveaute";
  label: string;
  description: string;
  unite: string;
  seuil: number;
  min: number;
  max: number;
  pas: number;
  active: boolean;
};

export const reglesAlertesDefaut: RegleAlerte[] = [
  {
    id: "note",
    label: "Variation de note Google",
    description: "Alerter si la note d'un concurrent bouge de plus de",
    unite: "%",
    seuil: 3,
    min: 1,
    max: 15,
    pas: 1,
    active: true,
  },
  {
    id: "prix",
    label: "Évolution tarifaire",
    description: "Alerter si le ticket moyen estimé varie de plus de",
    unite: "%",
    seuil: 8,
    min: 2,
    max: 30,
    pas: 1,
    active: true,
  },
  {
    id: "visibilite",
    label: "Visibilité locale",
    description: "Alerter si le score de visibilité gagne plus de",
    unite: "pts",
    seuil: 6,
    min: 2,
    max: 25,
    pas: 1,
    active: true,
  },
  {
    id: "nouveaute",
    label: "Nouveautés & offres",
    description: "Alerter à chaque nouvelle offre détectée (carte, brunch, événement)",
    unite: "",
    seuil: 0,
    min: 0,
    max: 0,
    pas: 1,
    active: false,
  },
];

export const modulesIA: ModuleIA[] = [
  {
    titre: "Générateur de posts réseaux",
    description: "Rédige des publications Facebook et Instagram à partir du menu de la semaine et du plat du jour.",
    categorie: "Contenu",
    duree: "~20 s",
  },
  {
    titre: "Réponses aux avis",
    description: "Propose une réponse personnalisée à chaque avis Google, adaptée au sentiment détecté.",
    categorie: "Réputation",
    duree: "~10 s",
  },
  {
    titre: "Optimisation de la carte",
    description: "Analyse marges et popularité des plats du midi pour retrouver l'équilibre et gagner en rentabilité.",
    categorie: "Revenus",
    duree: "~40 s",
  },
  {
    titre: "Campagne e-mail & SEO local",
    description: "Crée une séquence de fidélisation et des textes optimisés sur les mots-clés déjeuner Montoir-de-Bretagne.",
    categorie: "CRM & SEO",
    duree: "~30 s",
  },
  {
    titre: "Veille concurrentielle",
    description: "Résume nouveautés, prix et notes des restaurants du secteur Montoir, Trignac, Donges, Saint-Nazaire.",
    categorie: "Marché",
    duree: "~1 min",
  },
  {
    titre: "Prévision d'affluence du midi",
    description: "Anticipe les couverts du déjeuner selon la météo, l'activité des entreprises voisines et l'historique.",
    categorie: "Opérations",
    duree: "~15 s",
  },
];
