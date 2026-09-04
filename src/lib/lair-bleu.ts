/**
 * Source de vérité — L'Air Bleu (SARL LG AIR).
 * Toute donnée de ce fichier est OFFICIELLE ou explicitement marquée PROVISOIRE / PRÉVISION.
 * Ne jamais y ajouter un prix, un horaire, un avis ou une caractéristique non confirmés.
 */

export const restaurantAirBleu = {
  nom: "L'Air Bleu",
  societe: "SARL LG AIR",
  adresse: "3 rue Anatole France, 44550 Montoir-de-Bretagne",
  ville: "Montoir-de-Bretagne",
  telephone: "02 40 90 01 17",
  couverts: 70,
  type: "Restaurant traditionnel",
  service: "Service du midi uniquement, jours ouvrés",
  clientele: "Clientèle professionnelle et familiale",
  gerance: "Deux cogérants (70 % / 30 % du capital) — contexte de gestion uniquement",
} as const;

export type Formule = { libelle: string; prix: number };

/** Formules connues et confirmées. Aucune autre offre ne doit être inventée. */
export const formules: Formule[] = [
  { libelle: "Entrée + plat OU plat + dessert", prix: 16 },
  { libelle: "Entrée + plat + dessert + 1/4 boisson", prix: 17.5 },
  { libelle: "Burger maison + 1/4 boisson", prix: 15.8 },
];

export const snackDisponible = true;

export type NiveauDonnee = "officiel" | "provisoire" | "prevision" | "demo" | "non-connecte";

export type ExerciceOfficiel = {
  exercice: string;
  cloture: string;
  chiffreAffaires: number;
  resultatNet: number;
  ebe: number | null;
  niveau: "officiel";
};

/** Exercices clos — données comptables officielles. */
export const exercicesOfficiels: ExerciceOfficiel[] = [
  {
    exercice: "2023/2024",
    cloture: "31/08/2024",
    chiffreAffaires: 473976.35,
    resultatNet: 2598.61,
    ebe: 40286.68,
    niveau: "officiel",
  },
  {
    exercice: "2024/2025",
    cloture: "31/08/2025",
    chiffreAffaires: 492781.72,
    resultatNet: -9192.13,
    ebe: null,
    niveau: "officiel",
  },
];

export const dernierExerciceOfficiel = exercicesOfficiels[exercicesOfficiels.length - 1];
export const exercicePrecedentOfficiel = exercicesOfficiels[exercicesOfficiels.length - 2];

/**
 * Exercice 2025/2026 — PROVISOIRE (comptabilité de gestion).
 * Août 2026 est CLÔTURÉ en gestion : il n'y a plus de projection de services restants.
 * À confirmer par le bilan 2026.
 */
export const exerciceEnCoursProvisoire = {
  exercice: "2025/2026",
  cloture: "31/08/2026",
  niveau: "provisoire" as const,
  caAu30Juin2026: 420000,
  caJuillet2026: 48000,
  /** Cumul provisoire réel constaté à fin juillet 2026. */
  caCumuleAu31Juillet2026: 468000,
  /** Août 2026 CLÔTURÉ en gestion. */
  caAout2026: 27800,
  aoutCloture: true,
  /** CA cumulé provisoire de clôture au 31/08/2026 = 468 000 + 27 800. */
  caCumuleAu31Aout2026: 495800,
  fermeture: "Fermeture après le service du midi du 14 août — reprise le 31 août",
  servicesAoutRealises: 11,
  detailServicesAout: "3–7 août, 10–14 août, 31 août",
  note: "DONNÉE DE GESTION PROVISOIRE — à confirmer par le bilan 2026. Ce n'est pas un chiffre comptable définitif.",
} as const;

/** CA de clôture provisoire 2025/2026 (donnée de gestion, août clôturé). */
export const caClotureProvisoire2026 = exerciceEnCoursProvisoire.caCumuleAu31Aout2026;

/** CA moyen par service constaté en août (indicateur dérivé, non comptable). */
export const caMoyenParServiceAout = Math.round(
  exerciceEnCoursProvisoire.caAout2026 / exerciceEnCoursProvisoire.servicesAoutRealises,
);

/**
 * HISTORIQUE — OBSOLÈTE.
 * Anciennes projections de clôture 2025/2026, conservées uniquement pour traçabilité.
 * Ne jamais les afficher comme valeur courante.
 */
export const projectionsObsoletes = [
  {
    valeur: 490957,
    libelle: "Projection centrale initiale (11 services × ≈2 087 €)",
    statut: "OBSOLÈTE",
  },
  { valeur: 491000, libelle: "Projection centrale arrondie", statut: "OBSOLÈTE" },
  { valeur: 493960, libelle: "Variante haute de projection", statut: "OBSOLÈTE" },
  { valeur: 494000, libelle: "Variante haute arrondie", statut: "OBSOLÈTE" },
] as const;

export type HypothesesCloture = {
  caCumuleJuillet: number;
  caAout: number;
};

export function hypothesesClotureDefaut(): HypothesesCloture {
  return {
    caCumuleJuillet: exerciceEnCoursProvisoire.caCumuleAu31Juillet2026,
    caAout: exerciceEnCoursProvisoire.caAout2026,
  };
}

export type ClotureProvisoire = {
  caCloture: number;
  ecartExerciceOfficiel: number;
  ecartPourcent: number;
};

/** Cumul provisoire de clôture = cumul au 31/07 + août clôturé (modifiable si la gestion est corrigée). */
export function calculerClotureProvisoire(h: HypothesesCloture): ClotureProvisoire {
  const caCloture = Math.max(0, h.caCumuleJuillet) + Math.max(0, h.caAout);
  const ref = dernierExerciceOfficiel.chiffreAffaires;
  return {
    caCloture,
    ecartExerciceOfficiel: caCloture - ref,
    ecartPourcent: ((caCloture - ref) / ref) * 100,
  };
}

export const euro = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;
export const euroPrecis = (v: number) =>
  v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

/** Contexte texte injecté dans tous les prompts IA — uniquement des faits confirmés. */
export function contexteAirBleu(): string {
  return [
    `Restaurant : ${restaurantAirBleu.nom} (${restaurantAirBleu.societe}).`,
    `Adresse : ${restaurantAirBleu.adresse}. Téléphone : ${restaurantAirBleu.telephone}.`,
    `${restaurantAirBleu.type}, ${restaurantAirBleu.couverts} couverts. ${restaurantAirBleu.service}.`,
    `Clientèle : ${restaurantAirBleu.clientele}. Réseaux utilisés : Facebook et Instagram uniquement (jamais TikTok).`,
    `Formules confirmées : ${formules.map((f) => `${f.libelle} ${f.prix.toString().replace(".", ",")} €`).join(" ; ")}${snackDisponible ? " ; snack." : "."}`,
    `Finances OFFICIELLES — exercice 2023/2024 : CA ${euroPrecis(exercicesOfficiels[0].chiffreAffaires)}, EBE ${euroPrecis(exercicesOfficiels[0].ebe ?? 0)}, résultat net ${euroPrecis(exercicesOfficiels[0].resultatNet)}.`,
    `Finances OFFICIELLES — exercice 2024/2025 : CA ${euroPrecis(exercicesOfficiels[1].chiffreAffaires)}, résultat net ${euroPrecis(exercicesOfficiels[1].resultatNet)}.`,
    `Exercice 2025/2026 PROVISOIRE (gestion) : CA cumulé au 31/07/2026 = ${euro(exerciceEnCoursProvisoire.caCumuleAu31Juillet2026)} (dont juillet ${euro(exerciceEnCoursProvisoire.caJuillet2026)}) ; août 2026 CLÔTURÉ à ${euro(exerciceEnCoursProvisoire.caAout2026)} sur ${exerciceEnCoursProvisoire.servicesAoutRealises} services (${exerciceEnCoursProvisoire.detailServicesAout}).`,
    `CA cumulé PROVISOIRE au 31/08/2026 = ${euro(caClotureProvisoire2026)}. Aucune projection restante : août est clôturé. Donnée de gestion à confirmer par le bilan 2026, jamais présentée comme comptable définitive.`,
    "Les anciennes projections (490 957 / 491 000 / 493 960 / 494 000 €) sont OBSOLÈTES et ne doivent plus être citées.",
    `Résultat net 2025/2026 : non disponible avant le bilan 2026.`,
    "Règles absolues : ne jamais inventer un prix, un horaire, un menu, un avis, un chiffre ou un concurrent. Si une donnée manque, écrire « donnée non disponible ».",
  ].join("\n");
}
