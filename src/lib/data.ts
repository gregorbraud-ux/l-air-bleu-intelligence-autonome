export const restaurant = {
  nom: "L'Air Bleu",
  ville: "Marseille",
  couverts: 78,
  ticketMoyen: 46,
};

export type Kpi = { label: string; valeur: string; variation: number; detail: string };

export const kpis: Kpi[] = [
  { label: "Chiffre d'affaires (30 j)", valeur: "128 400 €", variation: 8.4, detail: "vs. mois précédent" },
  { label: "Ticket moyen", valeur: "46 €", variation: 3.1, detail: "objectif 48 €" },
  { label: "Taux de remplissage", valeur: "82 %", variation: -1.6, detail: "78 couverts / service" },
  { label: "Note Google", valeur: "4,6 / 5", variation: 2.2, detail: "1 284 avis cumulés" },
  { label: "Marge brute", valeur: "68 %", variation: 1.4, detail: "coût matière 32 %" },
  { label: "Réservations en ligne", valeur: "1 942", variation: 12.7, detail: "dont 41 % via Instagram" },
];

export const caMensuel = [
  { mois: "Jan", ca: 92000, couverts: 1780 },
  { mois: "Fév", ca: 98500, couverts: 1860 },
  { mois: "Mar", ca: 105200, couverts: 1990 },
  { mois: "Avr", ca: 112800, couverts: 2110 },
  { mois: "Mai", ca: 119400, couverts: 2240 },
  { mois: "Juin", ca: 124100, couverts: 2320 },
  { mois: "Juil", ca: 128400, couverts: 2415 },
];

export const canaux = [
  { canal: "Google", part: 38 },
  { canal: "Instagram", part: 26 },
  { canal: "Bouche-à-oreille", part: 18 },
  { canal: "TheFork", part: 12 },
  { canal: "Site web", part: 6 },
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
      "Une soirée magnifique, le menu dégustation autour du poisson est une réussite. Service attentionné et vue superbe.",
    sentiment: "positif",
    repondu: true,
  },
  {
    auteur: "Julien M.",
    note: 4,
    date: "10 juil.",
    texte: "Très bonne cuisine, mais l'attente entre les plats était un peu longue en terrasse.",
    sentiment: "neutre",
    repondu: false,
  },
  {
    auteur: "Sofia B.",
    note: 2,
    date: "8 juil.",
    texte: "Accueil froid le soir de notre réservation et plat principal servi tiède. Dommage pour le prix.",
    sentiment: "négatif",
    repondu: false,
  },
  {
    auteur: "Antoine L.",
    note: 5,
    date: "5 juil.",
    texte: "Le meilleur rapport qualité-prix du quartier. La carte des vins naturels est excellente.",
    sentiment: "positif",
    repondu: true,
  },
  {
    auteur: "Marie D.",
    note: 4,
    date: "2 juil.",
    texte: "Cadre élégant et produits frais. Je reviendrai pour le menu du midi.",
    sentiment: "positif",
    repondu: false,
  },
];

export const repartitionNotes = [
  { note: "5 étoiles", nombre: 742 },
  { note: "4 étoiles", nombre: 361 },
  { note: "3 étoiles", nombre: 108 },
  { note: "2 étoiles", nombre: 45 },
  { note: "1 étoile", nombre: 28 },
];

export type Publication = {
  jour: number;
  titre: string;
  canal: "Instagram" | "Google" | "Newsletter" | "TikTok";
  statut: "planifié" | "brouillon" | "publié";
  heure: string;
};

export const calendrier: Publication[] = [
  { jour: 2, titre: "Nouvelle carte d'été", canal: "Instagram", statut: "publié", heure: "12:00" },
  { jour: 4, titre: "Post Google : menu du midi", canal: "Google", statut: "publié", heure: "10:30" },
  { jour: 7, titre: "Reels coulisses cuisine", canal: "TikTok", statut: "planifié", heure: "18:00" },
  { jour: 9, titre: "Newsletter accords mets-vins", canal: "Newsletter", statut: "planifié", heure: "09:00" },
  { jour: 12, titre: "Portrait du chef", canal: "Instagram", statut: "brouillon", heure: "19:00" },
  { jour: 16, titre: "Offre brunch dominical", canal: "Google", statut: "planifié", heure: "11:00" },
  { jour: 19, titre: "Story sondage dessert", canal: "Instagram", statut: "brouillon", heure: "17:30" },
  { jour: 23, titre: "Teaser menu automne", canal: "TikTok", statut: "planifié", heure: "20:00" },
  { jour: 27, titre: "Newsletter fidélité", canal: "Newsletter", statut: "brouillon", heure: "08:30" },
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
  { nom: "L'Air Bleu", note: 4.6, avis: 1284, ticket: 46, visibilite: 78, tendance: 6.2 },
  { nom: "Le Comptoir Marin", note: 4.4, avis: 962, ticket: 52, visibilite: 71, tendance: 2.1 },
  { nom: "Table du Vieux-Port", note: 4.7, avis: 2140, ticket: 61, visibilite: 88, tendance: 4.8 },
  { nom: "Bistrot Azur", note: 4.1, avis: 540, ticket: 38, visibilite: 54, tendance: -1.3 },
  { nom: "Maison Calanque", note: 4.5, avis: 1105, ticket: 49, visibilite: 66, tendance: 3.4 },
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
    concurrent: "Table du Vieux-Port",
    type: "visibilite",
    titre: "Bond de visibilité locale",
    detail: "Score de visibilité passé de 79 à 88 en 14 jours (campagne Google Ads détectée).",
    variation: 11.4,
    gravite: "critique",
    date: "Aujourd'hui, 09:12",
    lue: false,
  },
  {
    id: "a2",
    concurrent: "Le Comptoir Marin",
    type: "prix",
    titre: "Hausse du ticket moyen",
    detail: "Nouvelle carte : ticket moyen estimé à 52 € (+6 €). Écart avec L'Air Bleu porté à 13 %.",
    variation: 13,
    gravite: "importante",
    date: "Hier, 18:40",
    lue: false,
  },
  {
    id: "a3",
    concurrent: "Maison Calanque",
    type: "note",
    titre: "Note Google en progression",
    detail: "4,3 → 4,5 / 5 après 38 nouveaux avis en un mois.",
    variation: 4.6,
    gravite: "importante",
    date: "Il y a 2 jours",
    lue: false,
  },
  {
    id: "a4",
    concurrent: "Bistrot Azur",
    type: "nouveaute",
    titre: "Lancement d'un brunch dominical",
    detail: "Offre 29 € annoncée sur Instagram : chevauche votre créneau du dimanche midi.",
    variation: 0,
    gravite: "info",
    date: "Il y a 4 jours",
    lue: true,
  },
  {
    id: "a5",
    concurrent: "Table du Vieux-Port",
    type: "note",
    titre: "Chute ponctuelle de la note",
    detail: "3 avis 2 étoiles publiés le même week-end : opportunité de captation clientèle.",
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
    description: "Rédige des publications Instagram et TikTok à partir du plat du jour et du ton de la maison.",
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
    description: "Analyse marges et popularité des plats pour recommander un nouveau menu-engineering.",
    categorie: "Revenus",
    duree: "~40 s",
  },
  {
    titre: "Campagne e-mail",
    description: "Crée une séquence de fidélisation segmentée selon la fréquence de visite des clients.",
    categorie: "CRM",
    duree: "~30 s",
  },
  {
    titre: "Veille concurrentielle",
    description: "Résume les nouveautés, prix et notes des restaurants comparables du quartier.",
    categorie: "Marché",
    duree: "~1 min",
  },
  {
    titre: "Prévision d'affluence",
    description: "Anticipe les couverts par service selon la météo, les événements locaux et l'historique.",
    categorie: "Opérations",
    duree: "~15 s",
  },
];
