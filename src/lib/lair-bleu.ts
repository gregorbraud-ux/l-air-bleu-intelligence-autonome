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
 * Exercice 2025/2026 — PROVISOIRE.
 * Chiffres de gestion non validés par le bilan : à recalculer dès réception du bilan 2026.
 */
export const exerciceEnCoursProvisoire = {
  exercice: "2025/2026",
  cloture: "31/08/2026",
  niveau: "provisoire" as const,
  caAu30Juin2026: 420000,
  caJuillet2026: 48000,
  /** Cumul provisoire réel constaté à fin juillet 2026 (ce n'est pas une hypothèse). */
  caCumuleAu31Juillet2026: 468000,
  fermeture: "Fermeture après le service du midi du 14 août — reprise le 31 août",
  servicesAoutPrevus: 11,
  detailServicesAout: "3–7 août, 10–14 août, 31 août",
  note: "PRÉVISION PROVISOIRE — recalculer dès réception du bilan 2026.",
} as const;

/** CA moyen par service retenu par défaut pour la projection d'août (issu du cumul provisoire). */
export const caMoyenParServiceAoutDefaut = 2087;

export type HypothesesProjection = {
  caCumule: number;
  servicesRestants: number;
  caMoyenParService: number;
};

export function hypothesesProjectionDefaut(): HypothesesProjection {
  return {
    caCumule: exerciceEnCoursProvisoire.caCumuleAu31Juillet2026,
    servicesRestants: exerciceEnCoursProvisoire.servicesAoutPrevus,
    caMoyenParService: caMoyenParServiceAoutDefaut,
  };
}

export type Projection = {
  caPeriodeRestante: number;
  caProjeteCloture: number;
  ecartExerciceOfficiel: number;
  ecartPourcent: number;
};

/** Projection modifiable : CA cumulé + (services restants × CA moyen/service). */
export function calculerProjection(h: HypothesesProjection): Projection {
  const caPeriodeRestante = Math.max(0, h.servicesRestants) * Math.max(0, h.caMoyenParService);
  const caProjeteCloture = h.caCumule + caPeriodeRestante;
  const ref = dernierExerciceOfficiel.chiffreAffaires;
  return {
    caPeriodeRestante,
    caProjeteCloture,
    ecartExerciceOfficiel: caProjeteCloture - ref,
    ecartPourcent: ((caProjeteCloture - ref) / ref) * 100,
  };
}

/** Repères de projection centrale communiqués (arrondis). */
export const projectionCentraleAout = 23000;
export const projectionCentraleCloture = 491000;

export const euro = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;
export const euroPrecis = (v: number) =>
  v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

/** Contexte texte injecté dans tous les prompts IA — uniquement des faits confirmés. */
export function contexteAirBleu(): string {
  const proj = calculerProjection(hypothesesProjectionDefaut());
  return [
    `Restaurant : ${restaurantAirBleu.nom} (${restaurantAirBleu.societe}).`,
    `Adresse : ${restaurantAirBleu.adresse}. Téléphone : ${restaurantAirBleu.telephone}.`,
    `${restaurantAirBleu.type}, ${restaurantAirBleu.couverts} couverts. ${restaurantAirBleu.service}.`,
    `Clientèle : ${restaurantAirBleu.clientele}. Réseaux utilisés : Facebook et Instagram uniquement (jamais TikTok).`,
    `Formules confirmées : ${formules.map((f) => `${f.libelle} ${f.prix.toString().replace(".", ",")} €`).join(" ; ")}${snackDisponible ? " ; snack." : "."}`,
    `Finances OFFICIELLES — exercice 2023/2024 : CA ${euroPrecis(exercicesOfficiels[0].chiffreAffaires)}, EBE ${euroPrecis(exercicesOfficiels[0].ebe ?? 0)}, résultat net ${euroPrecis(exercicesOfficiels[0].resultatNet)}.`,
    `Finances OFFICIELLES — exercice 2024/2025 : CA ${euroPrecis(exercicesOfficiels[1].chiffreAffaires)}, résultat net ${euroPrecis(exercicesOfficiels[1].resultatNet)}.`,
    `Exercice 2025/2026 PROVISOIRE : CA cumulé au 31/07/2026 = ${euro(exerciceEnCoursProvisoire.caCumuleAu31Juillet2026)} (dont juillet ${euro(exerciceEnCoursProvisoire.caJuillet2026)}). ${exerciceEnCoursProvisoire.fermeture}. ${exerciceEnCoursProvisoire.servicesAoutPrevus} services du midi prévus en août (${exerciceEnCoursProvisoire.detailServicesAout}).`,
    `PRÉVISION PROVISOIRE de clôture au 31/08/2026 : environ ${euro(proj.caProjeteCloture)} — jamais présentée comme un chiffre comptable définitif.`,
    "Règles absolues : ne jamais inventer un prix, un horaire, un menu, un avis, un chiffre ou un concurrent. Si une donnée manque, écrire « donnée non disponible ».",
  ].join("\n");
}
