import { useCallback, useEffect, useState } from "react";
import { canaux } from "@/lib/contenu.schema";

export type Canal = (typeof canaux)[number];

export type StrategieIA = {
  frequenceParSemaine: number;
  plateformes: Canal[];
  themes: string[];
  motsInterdits: string[];
  mois: string;
  jourDebut: number;
  jourFin: number;
  ton: string;
};

export const themesDisponibles = [
  "Menu du midi",
  "Plat du jour",
  "Desserts maison",
  "Produits frais & fournisseurs locaux",
  "Équipe & coulisses",
  "Avis clients",
  "Clientèle professionnelle",
  "Événements & jours spéciaux",
] as const;

export const tonsDisponibles = ["Chaleureux", "Convivial", "Authentique", "Dynamique", "Gourmand"] as const;

export const CLE_STRATEGIE = "airbleu.strategie.ia.v1";

export function strategieParDefaut(): StrategieIA {
  return {
    frequenceParSemaine: 3,
    plateformes: ["Facebook", "Instagram", "Google"],
    themes: ["Menu du midi", "Plat du jour", "Produits frais & fournisseurs locaux", "Équipe & coulisses"],
    motsInterdits: ["promo choc", "pas cher", "fast-food"],
    mois: "Août 2026",
    jourDebut: 1,
    jourFin: 31,
    ton: "Chaleureux",
  };
}

export function nombreDePosts(s: StrategieIA) {
  const jours = Math.max(1, s.jourFin - s.jourDebut + 1);
  const brut = Math.round((s.frequenceParSemaine * jours) / 7);
  return Math.min(16, Math.max(4, brut));
}

function fusionner(brut: unknown): StrategieIA {
  const base = strategieParDefaut();
  if (!brut || typeof brut !== "object") return base;
  const s = brut as Partial<StrategieIA>;
  const plateformes = (s.plateformes ?? []).filter((p): p is Canal => canaux.includes(p as Canal));
  return {
    ...base,
    ...s,
    plateformes: plateformes.length ? plateformes : base.plateformes,
    themes: Array.isArray(s.themes) ? s.themes : base.themes,
    motsInterdits: Array.isArray(s.motsInterdits) ? s.motsInterdits : base.motsInterdits,
  };
}

export function lireStrategie(): StrategieIA {
  try {
    const brut = window.localStorage.getItem(CLE_STRATEGIE);
    return fusionner(brut ? JSON.parse(brut) : null);
  } catch {
    return strategieParDefaut();
  }
}

export function useStrategieIA() {
  const [strategie, setStrategie] = useState<StrategieIA>(strategieParDefaut);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    setStrategie(lireStrategie());
    setPret(true);
  }, []);

  const persister = useCallback((suivant: StrategieIA) => {
    setStrategie(suivant);
    try {
      window.localStorage.setItem(CLE_STRATEGIE, JSON.stringify(suivant));
    } catch {
      /* stockage indisponible */
    }
  }, []);

  const maj = useCallback(
    (patch: Partial<StrategieIA>) =>
      setStrategie((p) => {
        const suivant = { ...p, ...patch };
        try {
          window.localStorage.setItem(CLE_STRATEGIE, JSON.stringify(suivant));
        } catch {
          /* stockage indisponible */
        }
        return suivant;
      }),
    [],
  );

  const basculerPlateforme = useCallback(
    (canal: Canal) =>
      maj({
        plateformes: strategie.plateformes.includes(canal)
          ? strategie.plateformes.filter((c) => c !== canal)
          : [...strategie.plateformes, canal],
      }),
    [maj, strategie.plateformes],
  );

  const basculerTheme = useCallback(
    (theme: string) =>
      maj({
        themes: strategie.themes.includes(theme)
          ? strategie.themes.filter((t) => t !== theme)
          : [...strategie.themes, theme],
      }),
    [maj, strategie.themes],
  );

  const reinitialiser = useCallback(() => persister(strategieParDefaut()), [persister]);

  return { strategie, pret, maj, basculerPlateforme, basculerTheme, reinitialiser };
}
