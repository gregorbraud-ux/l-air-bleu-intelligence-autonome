/**
 * Valorisation du fonds de commerce — méthodes transparentes.
 * Aucun multiple n'est présenté comme une vérité sectorielle : chaque hypothèse est
 * modifiable et affichée. Un EBE reconstitué à partir du CA est TOUJOURS signalé.
 */
import { exercicesOfficiels } from "@/lib/lair-bleu";

export type SourceEbe = "officiel" | "estime";

export type HypothesesValorisation = {
  /** CA de référence retenu (€). */
  caReference: number;
  /** EBE retenu (€). */
  ebe: number;
  /** Origine de l'EBE : bilan officiel ou reconstitution à partir du CA. */
  sourceEbe: SourceEbe;
  /** Taux d'EBE utilisé en cas de reconstitution (% du CA). */
  tauxEbeEstime: number;
  /** Fourchette de multiple de CA (restauration indépendante, hypothèse à ajuster). */
  multipleCaBas: number;
  multipleCaHaut: number;
  /** Fourchette de multiple d'EBE. */
  multipleEbeBas: number;
  multipleEbeHaut: number;
  /** Approche capacité de remboursement : annuité supportable et durée du financement. */
  cafDisponible: number;
  dureeFinancementAnnees: number;
  tauxInteret: number;
};

/** EBE officiel le plus récent disponible dans les bilans (null si aucun). */
export function ebeOfficielLePlusRecent(): { exercice: string; ebe: number } | null {
  for (let i = exercicesOfficiels.length - 1; i >= 0; i -= 1) {
    const ex = exercicesOfficiels[i];
    if (ex.ebe !== null) return { exercice: ex.exercice, ebe: ex.ebe };
  }
  return null;
}

export function hypothesesValorisationDefaut(): HypothesesValorisation {
  const ebeOff = ebeOfficielLePlusRecent();
  const dernier = exercicesOfficiels[exercicesOfficiels.length - 1];
  return {
    caReference: dernier.chiffreAffaires,
    ebe: ebeOff?.ebe ?? 0,
    sourceEbe: ebeOff ? "officiel" : "estime",
    tauxEbeEstime: 8,
    multipleCaBas: 0.4,
    multipleCaHaut: 0.8,
    multipleEbeBas: 2.5,
    multipleEbeHaut: 4,
    // CAF 2023/2024 officielle : 28 655,38 €.
    cafDisponible: 28655,
    dureeFinancementAnnees: 7,
    tauxInteret: 4.5,
  };
}

export type Methode = {
  cle: "ca" | "ebe" | "remboursement";
  titre: string;
  formule: string;
  bas: number;
  haut: number;
  fiable: boolean;
  avertissement?: string;
};

export type ResultatValorisation = {
  methodes: Methode[];
  /** Fourchette retenue = min des bas / max des hauts des méthodes fiables. */
  fourchetteBasse: number;
  fourchetteHaute: number;
  ebeRetenu: number;
  ebeReconstitue: boolean;
};

/** Capital théoriquement remboursable par la CAF sur la durée (annuité constante). */
function capaciteEmprunt(caf: number, annees: number, tauxPourcent: number): number {
  const t = tauxPourcent / 100;
  if (caf <= 0 || annees <= 0) return 0;
  if (t === 0) return caf * annees;
  return caf * ((1 - Math.pow(1 + t, -annees)) / t);
}

export function calculerValorisation(h: HypothesesValorisation): ResultatValorisation {
  const ebeReconstitue = h.sourceEbe === "estime";
  const ebeRetenu = ebeReconstitue ? (h.caReference * h.tauxEbeEstime) / 100 : h.ebe;

  const methodes: Methode[] = [
    {
      cle: "ca",
      titre: "Multiple de chiffre d'affaires",
      formule: `${h.multipleCaBas.toFixed(2).replace(".", ",")} à ${h.multipleCaHaut
        .toFixed(2)
        .replace(".", ",")} × CA de référence`,
      bas: h.caReference * h.multipleCaBas,
      haut: h.caReference * h.multipleCaHaut,
      fiable: h.caReference > 0,
      avertissement:
        "Les bornes de multiple sont une hypothèse de travail modifiable, pas un barème sectoriel sourcé.",
    },
    {
      cle: "ebe",
      titre: "Multiple d'EBE / EBITDA",
      formule: `${h.multipleEbeBas.toFixed(2).replace(".", ",")} à ${h.multipleEbeHaut
        .toFixed(2)
        .replace(".", ",")} × EBE retenu`,
      bas: ebeRetenu * h.multipleEbeBas,
      haut: ebeRetenu * h.multipleEbeHaut,
      fiable: !ebeReconstitue && ebeRetenu > 0,
      avertissement: ebeReconstitue
        ? "EBE RECONSTITUÉ à partir d'un pourcentage du CA : cette valeur n'est pas comptable et ne doit pas servir de base de négociation."
        : "EBE issu du dernier bilan disponible : à réactualiser avec le bilan 2026.",
    },
    {
      cle: "remboursement",
      titre: "Capacité de remboursement",
      formule: `CAF ${Math.round(h.cafDisponible).toLocaleString("fr-FR")} € sur ${h.dureeFinancementAnnees} ans à ${h.tauxInteret
        .toFixed(2)
        .replace(".", ",")} %`,
      bas: capaciteEmprunt(h.cafDisponible * 0.8, h.dureeFinancementAnnees, h.tauxInteret),
      haut: capaciteEmprunt(h.cafDisponible, h.dureeFinancementAnnees, h.tauxInteret),
      fiable: h.cafDisponible > 0,
      avertissement:
        "Montant qu'un repreneur peut financer avec la capacité d'autofinancement, hors apport personnel et hors reprise de dette.",
    },
  ];

  const fiables = methodes.filter((m) => m.fiable);
  const base = fiables.length > 0 ? fiables : methodes;
  return {
    methodes,
    fourchetteBasse: Math.min(...base.map((m) => m.bas)),
    fourchetteHaute: Math.max(...base.map((m) => m.haut)),
    ebeRetenu,
    ebeReconstitue,
  };
}
