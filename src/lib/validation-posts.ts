import { useCallback, useEffect, useState } from "react";
import type { IdeePost } from "@/lib/contenu.schema";

export type StatutValidation = "à valider" | "approuvé" | "publié";

export type PostValidation = IdeePost & {
  id: string;
  statutValidation: StatutValidation;
  majLe: string;
};

export const CLE_VALIDATION = "airbleu.posts.validation.v1";

function slug(valeur: string) {
  return valeur
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export function identifiantPost(idee: IdeePost) {
  return `${idee.jour}-${slug(idee.canal)}-${slug(idee.titre)}`;
}

function lire(): PostValidation[] {
  if (typeof window === "undefined") return [];
  try {
    const brut = window.localStorage.getItem(CLE_VALIDATION);
    if (!brut) return [];
    const donnees = JSON.parse(brut);
    return Array.isArray(donnees) ? (donnees as PostValidation[]) : [];
  } catch {
    return [];
  }
}

export function useValidationPosts() {
  const [posts, setPosts] = useState<PostValidation[]>([]);
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    setPosts(lire());
    setCharge(true);
  }, []);

  useEffect(() => {
    if (!charge) return;
    try {
      window.localStorage.setItem(CLE_VALIDATION, JSON.stringify(posts));
    } catch {
      /* stockage indisponible */
    }
  }, [posts, charge]);

  const ajouterIdees = useCallback((idees: IdeePost[]) => {
    let ajoutes = 0;
    setPosts((precedents) => {
      const existants = new Set(precedents.map((p) => p.id));
      const nouveaux = idees
        .map((idee) => ({
          ...idee,
          id: identifiantPost(idee),
          statutValidation: "à valider" as StatutValidation,
          majLe: new Date().toISOString(),
        }))
        .filter((p) => !existants.has(p.id));
      ajoutes = nouveaux.length;
      return [...precedents, ...nouveaux].sort((a, b) => a.jour - b.jour);
    });
    return ajoutes;
  }, []);

  const modifier = useCallback((id: string, patch: Partial<PostValidation>) => {
    setPosts((precedents) =>
      precedents
        .map((p) => (p.id === id ? { ...p, ...patch, majLe: new Date().toISOString() } : p))
        .sort((a, b) => a.jour - b.jour),
    );
  }, []);

  const changerStatut = useCallback(
    (id: string, statutValidation: StatutValidation) => modifier(id, { statutValidation }),
    [modifier],
  );

  const supprimer = useCallback((id: string) => {
    setPosts((precedents) => precedents.filter((p) => p.id !== id));
  }, []);

  const viderTout = useCallback(() => setPosts([]), []);

  return { posts, charge, ajouterIdees, modifier, changerStatut, supprimer, viderTout };
}
