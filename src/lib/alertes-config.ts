import { useCallback, useEffect, useState } from "react";
import { concurrents, reglesAlertesDefaut, type RegleAlerte } from "@/lib/data";
import { chargerReglageCloud, enregistrerReglageCloud } from "@/lib/reglages-sync";

export type CategorieAlerte = RegleAlerte["id"];

export const categoriesAlerte: CategorieAlerte[] = reglesAlertesDefaut.map((r) => r.id);

export type ConfigCategorie = { active: boolean; seuil: number };

export type ConfigEtablissement = {
  nom: string;
  surveille: boolean;
  frequence: "quotidienne" | "hebdomadaire";
  categories: Record<CategorieAlerte, ConfigCategorie>;
  canaux: { email: boolean; push: boolean; destinataire: string };
};

export type ConfigAlertes = Record<string, ConfigEtablissement>;

export const CLE_STOCKAGE = "airbleu.alertes.config.v2";

export function metaCategorie(id: CategorieAlerte): RegleAlerte {
  return reglesAlertesDefaut.find((r) => r.id === id) ?? reglesAlertesDefaut[0];
}

export function configParDefaut(): ConfigAlertes {
  const categories = Object.fromEntries(
    reglesAlertesDefaut.map((r) => [r.id, { active: r.active, seuil: r.seuil }]),
  ) as Record<CategorieAlerte, ConfigCategorie>;

  return Object.fromEntries(
    concurrents
      .filter((c) => c.nom !== "L'Air Bleu")
      .map((c) => [
        c.nom,
        {
          nom: c.nom,
          surveille: true,
          frequence: "quotidienne",
          categories: structuredClone(categories),
          canaux: { email: true, push: false, destinataire: "contact@lairbleu.fr" },
        } satisfies ConfigEtablissement,
      ]),
  );
}

function fusionner(brut: unknown): ConfigAlertes {
  const base = configParDefaut();
  if (!brut || typeof brut !== "object") return base;
  const stocke = brut as ConfigAlertes;
  for (const nom of Object.keys(base)) {
    const s = stocke[nom];
    if (!s) continue;
    base[nom] = {
      ...base[nom],
      ...s,
      categories: { ...base[nom].categories, ...(s.categories ?? {}) },
      canaux: { ...base[nom].canaux, ...(s.canaux ?? {}) },
    };
  }
  return base;
}

export function useAlertesConfig() {
  const [config, setConfig] = useState<ConfigAlertes>(configParDefaut);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    try {
      const brut = window.localStorage.getItem(CLE_STOCKAGE);
      setConfig(fusionner(brut ? JSON.parse(brut) : null));
    } catch {
      setConfig(configParDefaut());
    }
    setPret(true);
    void chargerReglageCloud<unknown>(CLE_STOCKAGE).then((distant) => {
      if (!distant) return;
      const fusionnee = fusionner(distant);
      setConfig(fusionnee);
      try {
        window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(fusionnee));
      } catch {
        /* cache local indisponible */
      }
    });
  }, []);

  const enregistrer = useCallback((suivant: ConfigAlertes) => {
    setConfig(suivant);
    enregistrerReglageCloud(CLE_STOCKAGE, suivant);
    try {
      window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(suivant));
    } catch {
      /* stockage indisponible */
    }
  }, []);

  const majEtablissement = useCallback(
    (nom: string, patch: Partial<ConfigEtablissement>) =>
      setConfig((prev) => ({ ...prev, [nom]: { ...prev[nom], ...patch } })),
    [],
  );

  const majCategorie = useCallback(
    (nom: string, categorie: CategorieAlerte, patch: Partial<ConfigCategorie>) =>
      setConfig((prev) => ({
        ...prev,
        [nom]: {
          ...prev[nom],
          categories: {
            ...prev[nom].categories,
            [categorie]: { ...prev[nom].categories[categorie], ...patch },
          },
        },
      })),
    [],
  );

  const reinitialiser = useCallback(() => enregistrer(configParDefaut()), [enregistrer]);

  return { config, pret, setConfig, enregistrer, majEtablissement, majCategorie, reinitialiser };
}
