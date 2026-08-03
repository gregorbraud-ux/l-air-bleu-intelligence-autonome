import { useCallback, useEffect, useState } from "react";

export type ModuleCle = "marketing" | "calendrier" | "avis" | "valorisation" | "concurrence" | "alertes";

export type ModuleMeta = { cle: ModuleCle; label: string; description: string };

export const modulesApp: ModuleMeta[] = [
  { cle: "marketing", label: "Marketing IA", description: "Studio de génération de publications Facebook et Instagram." },
  { cle: "calendrier", label: "Calendrier éditorial", description: "Planification IA des posts du mois." },
  { cle: "avis", label: "Avis Google", description: "Analyse de réputation et réponses assistées." },
  { cle: "valorisation", label: "Valorisation", description: "Estimation du fonds de commerce à partir des indicateurs." },
  { cle: "concurrence", label: "Concurrence", description: "Veille des établissements du secteur et flux d'alertes." },
  { cle: "alertes", label: "Alertes & seuils", description: "Configuration des seuils et des canaux de notification." },
];

export type SourceGooglePlaces = {
  active: boolean;
  placeId: string;
  nomFiche: string;
  frequenceHeures: number;
  nbAvis: number;
};

export type SourceConcurrence = {
  active: boolean;
  rayonKm: number;
  frequenceHeures: number;
  reseauxSociaux: boolean;
  sitesWeb: boolean;
};

export type SourceKpi = {
  active: boolean;
  exercice: string;
  chiffreAffaires: number;
  resultatNet: number;
  ticketMoyen: number;
  couvertsMidi: number;
};

export type SeuilsGlobaux = {
  noteMini: number;
  ticketCible: number;
  couvertsCible: number;
  visibiliteCible: number;
};

export type ParametresAdmin = {
  modules: Record<ModuleCle, boolean>;
  googlePlaces: SourceGooglePlaces;
  concurrence: SourceConcurrence;
  kpi: SourceKpi;
  seuils: SeuilsGlobaux;
};

export const CLE_PARAMETRES = "airbleu.parametres.admin.v1";

export function parametresParDefaut(): ParametresAdmin {
  return {
    modules: Object.fromEntries(modulesApp.map((m) => [m.cle, true])) as Record<ModuleCle, boolean>,
    googlePlaces: {
      active: true,
      placeId: "",
      nomFiche: "L'Air Bleu, 3 rue Anatole France, 44550 Montoir-de-Bretagne",
      frequenceHeures: 24,
      nbAvis: 5,
    },
    concurrence: {
      active: true,
      rayonKm: 15,
      frequenceHeures: 24,
      reseauxSociaux: true,
      sitesWeb: false,
    },
    kpi: {
      active: true,
      exercice: "Exercice clos au 31/08/2025",
      chiffreAffaires: 492781.72,
      resultatNet: -9192.13,
      ticketMoyen: 17.5,
      couvertsMidi: 70,
    },
    seuils: { noteMini: 4.4, ticketCible: 19, couvertsCible: 80, visibiliteCible: 75 },
  };
}

function fusionner(brut: unknown): ParametresAdmin {
  const base = parametresParDefaut();
  if (!brut || typeof brut !== "object") return base;
  const s = brut as Partial<ParametresAdmin>;
  return {
    modules: { ...base.modules, ...(s.modules ?? {}) },
    googlePlaces: { ...base.googlePlaces, ...(s.googlePlaces ?? {}) },
    concurrence: { ...base.concurrence, ...(s.concurrence ?? {}) },
    kpi: { ...base.kpi, ...(s.kpi ?? {}) },
    seuils: { ...base.seuils, ...(s.seuils ?? {}) },
  };
}

export function lireParametres(): ParametresAdmin {
  try {
    const brut = window.localStorage.getItem(CLE_PARAMETRES);
    return fusionner(brut ? JSON.parse(brut) : null);
  } catch {
    return parametresParDefaut();
  }
}

export function useParametresAdmin() {
  const [parametres, setParametres] = useState<ParametresAdmin>(parametresParDefaut);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    setParametres(lireParametres());
    setPret(true);
    const surStockage = (e: StorageEvent) => {
      if (e.key === CLE_PARAMETRES) setParametres(lireParametres());
    };
    window.addEventListener("storage", surStockage);
    window.addEventListener("airbleu:parametres", surStockage as EventListener);
    return () => {
      window.removeEventListener("storage", surStockage);
      window.removeEventListener("airbleu:parametres", surStockage as EventListener);
    };
  }, []);

  const enregistrer = useCallback((suivant: ParametresAdmin) => {
    setParametres(suivant);
    try {
      window.localStorage.setItem(CLE_PARAMETRES, JSON.stringify(suivant));
      window.dispatchEvent(new Event("airbleu:parametres"));
    } catch {
      /* stockage indisponible */
    }
  }, []);

  const majModule = useCallback(
    (cle: ModuleCle, actif: boolean) =>
      setParametres((p) => ({ ...p, modules: { ...p.modules, [cle]: actif } })),
    [],
  );

  const majSection = useCallback(
    <K extends "googlePlaces" | "concurrence" | "kpi" | "seuils">(
      section: K,
      patch: Partial<ParametresAdmin[K]>,
    ) => setParametres((p) => ({ ...p, [section]: { ...p[section], ...patch } })),
    [],
  );

  const reinitialiser = useCallback(() => enregistrer(parametresParDefaut()), [enregistrer]);

  return { parametres, pret, enregistrer, majModule, majSection, reinitialiser };
}