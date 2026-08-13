/**
 * ⚠️ Ce fichier contient à la fois des données OFFICIELLES (finances) et des jeux de
 * données de DÉMONSTRATION (avis, concurrents, signaux de veille, calendrier d'exemple).
 * Les données de démo NE DOIVENT JAMAIS être affichées comme des mesures réelles :
 * elles sont marquées DÉMO dans l'interface via <BadgeEtat etat="demo" />.
 * L'identité, les formules et les finances de référence vivent dans src/lib/lair-bleu.ts.
 */
export { restaurantAirBleu as restaurant } from "@/lib/lair-bleu";

/** Vrai tant qu'aucune source de données réelle (Google, veille) n'est connectée. */
export const DONNEES_DEMO = true;

/** Exercice clos au 31/08/2025 — données officielles de référence. */
export const finances = {
  exercice: "Exercice clos au 31/08/2025",
  chiffreAffaires: 492781.72,
  resultatNet: -9192.13,
};

/**
 * Exercice clos au 31/08/2024 (bilan Exco Avec, attesté le 27/11/2024) — données officielles.
 * Sert de comparatif N-1 pour toute analyse économique et de valorisation.
 */
export const financesN1 = {
  exercice: "Exercice du 01/09/2023 au 31/08/2024",
  chiffreAffaires: 473976.35,
  margeCommerciale: 291629.69,
  tauxMarge: 61.53,
  autresChargesExternes: 103610.08,
  valeurAjoutee: 187608.38,
  salairesEtTraitements: 121012.57,
  chargesSociales: 25046.3,
  excedentBrutExploitation: 40286.68,
  dotationsAmortissements: 26056.77,
  resultatExploitation: 13326.3,
  chargesFinancieres: 10737.69,
  resultatNet: 2598.61,
  capaciteAutofinancement: 28655.38,
  totalBilan: 269818.62,
  immobilisationsNettes: 193072.39,
  capitauxPropres: 12598.61,
  empruntsMoyenLongTerme: 233915.11,
  tresorerieNette: 69235.54,
  fondsDeRoulementNet: 53441.33,
  besoinEnFondsDeRoulement: -15794.21,
  stocks: 4710.97,
  effectifEquivalent: 5.25,
  autonomieFinanciere: 4.67,
  capaciteRemboursementAnnees: 8.16,
  cabinet: "Exco Avec (Pornichet) — Thierry Cadoret, expert-comptable",
};

/** Comparatif des deux derniers exercices clos (données officielles). */
export const historiqueExercices = [
  { exercice: "2023/2024", ca: 473976.35, resultatNet: 2598.61, ebe: 40286.68 },
  { exercice: "2024/2025", ca: 492781.72, resultatNet: -9192.13, ebe: null },
];

export type Avis = {
  auteur: string;
  note: number;
  date: string;
  texte: string;
  sentiment: "positif" | "neutre" | "négatif";
  repondu: boolean;
};

/** DÉMO — exemples de structure d'avis. Aucun avis Google réel n'est connecté. */
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

/** DÉMO — répartition d'exemple, non mesurée. */
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

/** DÉMO — calendrier d'exemple. Le calendrier réel provient du flux de validation. */
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

/** DÉMO — panel d'exemple. Aucune donnée n'est collectée automatiquement à ce jour. */
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
  /** Lien vers la source du signal (fiche Google, page Facebook, site…) */
  source: string;
  sourceLabel: string;
};

/** DÉMO — signaux d'exemple illustrant le format attendu d'une veille réellement connectée. */
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
    source: "https://www.google.com/maps/search/?api=1&query=Brasserie+du+Brivet+Trignac",
    sourceLabel: "Fiche Google Business",
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
    source: "https://www.google.com/maps/search/?api=1&query=Auberge+de+Donges",
    sourceLabel: "Fiche Google Business",
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
    source: "https://www.google.com/maps/search/?api=1&query=Le+Routier+de+Montoir",
    sourceLabel: "Avis Google",
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
    source: "https://www.facebook.com/search/top?q=Table%20de%20la%20Zone%20Saint-Nazaire",
    sourceLabel: "Publication Facebook",
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
    source: "https://www.google.com/maps/search/?api=1&query=Brasserie+du+Brivet+Trignac",
    sourceLabel: "Avis Google",
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

// ============ Veille automatique par zone ============

export type SignalVeille = {
  categorie: "menu" | "promotion" | "publication";
  etablissement: string;
  constat: string;
  variation?: string;
  date: string;
  source: string;
  sourceLabel: string;
};

export type ZoneVeille = {
  zone: "Trignac" | "Donges" | "Saint-Nazaire";
  etablissements: string[];
  signaux: SignalVeille[];
};

/** DÉMO — signaux d'exemple par zone. Non collectés, à ne pas présenter comme une veille réelle. */
export const zonesVeille: ZoneVeille[] = [
  {
    zone: "Trignac",
    etablissements: ["Brasserie du Brivet", "Le Comptoir de la Zone"],
    signaux: [
      {
        categorie: "menu",
        etablissement: "Brasserie du Brivet",
        constat:
          "Nouvelle carte du midi : 2 plats du jour au choix (dont un poisson) + suggestion végétarienne quotidienne.",
        date: "Cette semaine",
        source: "https://www.google.com/maps/search/?api=1&query=Brasserie+du+Brivet+Trignac",
        sourceLabel: "Fiche Google Business",
      },
      {
        categorie: "promotion",
        etablissement: "Brasserie du Brivet",
        constat: "Formule entrée + plat + café à 15,90 € annoncée pour les artisans et salariés de la zone.",
        variation: "-1,10 € vs formule précédente",
        date: "Il y a 3 jours",
        source: "https://www.facebook.com/search/top?q=Brasserie%20du%20Brivet%20Trignac",
        sourceLabel: "Publication Facebook",
      },
      {
        categorie: "publication",
        etablissement: "Brasserie du Brivet",
        constat: "Rythme de publication passé à 5 posts / semaine (plat du jour publié chaque matin avant 10 h).",
        variation: "+12 pts de visibilité en 14 jours",
        date: "Aujourd'hui",
        source: "https://www.google.com/maps/search/?api=1&query=Brasserie+du+Brivet+Trignac",
        sourceLabel: "Posts Google Business",
      },
      {
        categorie: "publication",
        etablissement: "Le Comptoir de la Zone",
        constat: "Aucune publication depuis 3 semaines : fenêtre de visibilité libre sur les recherches déjeuner Trignac.",
        date: "Il y a 3 semaines",
        source: "https://www.facebook.com/search/top?q=Le%20Comptoir%20de%20la%20Zone%20Trignac",
        sourceLabel: "Page Facebook",
      },
    ],
  },
  {
    zone: "Donges",
    etablissements: ["Auberge de Donges", "Le Relais du Port"],
    signaux: [
      {
        categorie: "promotion",
        etablissement: "Auberge de Donges",
        constat: "Formule déjeuner passée de 19 € à 21 €, dessert désormais en supplément.",
        variation: "+10,5 %",
        date: "Hier",
        source: "https://www.google.com/maps/search/?api=1&query=Auberge+de+Donges",
        sourceLabel: "Fiche Google Business",
      },
      {
        categorie: "menu",
        etablissement: "Auberge de Donges",
        constat: "Carte recentrée sur 6 plats maison, mise en avant des producteurs locaux dans les descriptions.",
        date: "Il y a 5 jours",
        source: "https://www.google.com/maps/search/?api=1&query=Auberge+de+Donges",
        sourceLabel: "Menu Google",
      },
      {
        categorie: "publication",
        etablissement: "Le Relais du Port",
        constat: "2 posts Instagram par semaine avec photos de l'équipe : forte interaction locale malgré peu d'abonnés.",
        variation: "+18 % d'engagement",
        date: "Cette semaine",
        source: "https://www.instagram.com/explore/search/keyword/?q=relais%20du%20port%20donges",
        sourceLabel: "Compte Instagram",
      },
    ],
  },
  {
    zone: "Saint-Nazaire",
    etablissements: ["Table de la Zone", "Cantine des Chantiers"],
    signaux: [
      {
        categorie: "promotion",
        etablissement: "Table de la Zone",
        constat: "Formule express 13,90 € (entrée + plat servis en 30 min) ciblant la clientèle professionnelle du midi.",
        variation: "-2,60 € vs notre ticket moyen",
        date: "Il y a 4 jours",
        source: "https://www.facebook.com/search/top?q=Table%20de%20la%20Zone%20Saint-Nazaire",
        sourceLabel: "Publication Facebook",
      },
      {
        categorie: "menu",
        etablissement: "Cantine des Chantiers",
        constat: "Ajout d'un menu à emporter en bocal pour les équipes des chantiers, retrait avant 11 h 30.",
        date: "Cette semaine",
        source: "https://www.google.com/maps/search/?api=1&query=Cantine+des+Chantiers+Saint-Nazaire",
        sourceLabel: "Fiche Google Business",
      },
      {
        categorie: "publication",
        etablissement: "Table de la Zone",
        constat: "Publication irrégulière (1 post / 10 jours) mais forte activité d'avis clients sollicités en caisse.",
        variation: "-1,3 % de tendance",
        date: "Il y a 6 jours",
        source: "https://www.google.com/maps/search/?api=1&query=Table+de+la+Zone+Saint-Nazaire",
        sourceLabel: "Avis Google",
      },
    ],
  },
];
