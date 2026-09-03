import { useCallback, useEffect, useState } from "react";
import type { IdeePost } from "@/lib/contenu.schema";

export type StatutValidation = "à valider" | "approuvé" | "rejeté" | "publié";

export type OrigineVersion = "correction" | "edition" | "statut" | "decision";

export type ContenuPost = Pick<
  IdeePost,
  "titre" | "accroche" | "legende" | "cta" | "angle" | "hashtags" | "canal" | "jour" | "heure"
>;

export type VersionPost = {
  numero: number;
  le: string;
  statut: StatutValidation;
  origine: OrigineVersion;
  /** Libellés des corrections appliquées lors de ce renvoi en validation. */
  corrections: string[];
  resume: string;
  /** Commentaire de décision (approbation / rejet). */
  commentaire?: string;
  /** Statut décidé lors de cette action, si c'est une décision. */
  decision?: StatutValidation;
  /** État du post AVANT la modification enregistrée. */
  contenu: ContenuPost;
};

export type PostValidation = IdeePost & {
  id: string;
  statutValidation: StatutValidation;
  majLe: string;
  /** Dernier commentaire de décision saisi. */
  commentaireDecision?: string;
  versions?: VersionPost[];
};

export function contenuDe(post: IdeePost): ContenuPost {
  return {
    titre: post.titre,
    accroche: post.accroche,
    legende: post.legende,
    cta: post.cta,
    angle: post.angle,
    hashtags: [...post.hashtags],
    canal: post.canal,
    jour: post.jour,
    heure: post.heure,
  };
}

export type MetaVersion = {
  origine: OrigineVersion;
  corrections?: string[];
  resume?: string;
  commentaire?: string;
  decision?: StatutValidation;
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
    void chargerReglageCloud<PostValidation[]>(CLE_VALIDATION).then((distant) => {
      if (Array.isArray(distant) && distant.length > 0) setPosts(distant);
    });
  }, []);

  useEffect(() => {
    if (!charge) return;
    enregistrerReglageCloud(CLE_VALIDATION, posts);
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

  const modifier = useCallback((id: string, patch: Partial<PostValidation>, meta?: MetaVersion) => {
    setPosts((precedents) =>
      precedents
        .map((p) => {
          if (p.id !== id) return p;
          const versions = p.versions ?? [];
          const suivant: PostValidation = { ...p, ...patch, majLe: new Date().toISOString() };
          if (!meta) return suivant;
          const version: VersionPost = {
            numero: versions.length + 1,
            le: new Date().toISOString(),
            statut: p.statutValidation,
            origine: meta.origine,
            corrections: meta.corrections ?? [],
            resume: meta.resume ?? "",
            commentaire: meta.commentaire,
            decision: meta.decision,
            contenu: contenuDe(p),
          };
          return { ...suivant, versions: [...versions, version] };
        })
        .sort((a, b) => a.jour - b.jour),
    );
  }, []);

  const changerStatut = useCallback(
    (id: string, statutValidation: StatutValidation, meta?: MetaVersion) =>
      modifier(
        id,
        meta?.commentaire !== undefined
          ? { statutValidation, commentaireDecision: meta.commentaire }
          : { statutValidation },
        meta,
      ),
    [modifier],
  );

  /** Enregistre une version à partir d'un état antérieur connu (édition manuelle). */
  const journaliser = useCallback((id: string, contenu: ContenuPost, meta: MetaVersion) => {
    setPosts((precedents) =>
      precedents.map((p) => {
        if (p.id !== id) return p;
        const versions = p.versions ?? [];
        return {
          ...p,
          versions: [
            ...versions,
            {
              numero: versions.length + 1,
              le: new Date().toISOString(),
              statut: p.statutValidation,
              origine: meta.origine,
              corrections: meta.corrections ?? [],
              resume: meta.resume ?? "",
              commentaire: meta.commentaire,
              decision: meta.decision,
              contenu,
            },
          ],
        };
      }),
    );
  }, []);

  const supprimer = useCallback((id: string) => {
    setPosts((precedents) => precedents.filter((p) => p.id !== id));
  }, []);

  const viderTout = useCallback(() => setPosts([]), []);

  return { posts, charge, ajouterIdees, modifier, changerStatut, journaliser, supprimer, viderTout };
}
