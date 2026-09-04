import type { IdeePost } from "@/lib/contenu.schema";
import { canaux } from "@/lib/contenu.schema";

export type Canal = (typeof canaux)[number];
export type Gravite = "bloquant" | "avertissement";

export type Anomalie = {
  gravite: Gravite;
  champ: string;
  message: string;
};

export type ContraintesConformite = {
  motsInterdits: string[];
  themes: string[];
  plateformes: Canal[];
  jourDebut: number;
  jourFin: number;
};

export const LIMITES = {
  titre: 70,
  accroche: 160,
  legendeMax: 1000,
  legendeMin: 180,
  hashtagsMin: 3,
  hashtagsMax: 8,
} as const;

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;

function normaliser(valeur: string) {
  return valeur
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function texteComplet(post: IdeePost) {
  return [post.titre, post.accroche, post.legende, post.cta, post.angle, post.hashtags.join(" ")]
    .filter(Boolean)
    .join("\n");
}

function motsInterditsTrouves(post: IdeePost, motsInterdits: string[]) {
  const cible = normaliser(texteComplet(post));
  return motsInterdits
    .map((m) => m.trim())
    .filter((m) => m.length > 1 && cible.includes(normaliser(m)));
}

export function themesDetectes(post: IdeePost, themes: string[]) {
  const cible = normaliser(texteComplet(post));
  return themes.filter((theme) => {
    const mots = normaliser(theme)
      .split(/[^a-z0-9]+/)
      .filter((m) => m.length > 3);
    if (!mots.length) return false;
    return mots.some((m) => cible.includes(m.replace(/s$/, "")));
  });
}

export function verifierPost(post: IdeePost, contraintes: ContraintesConformite): Anomalie[] {
  const anomalies: Anomalie[] = [];
  const min = Math.min(contraintes.jourDebut, contraintes.jourFin);
  const max = Math.max(contraintes.jourDebut, contraintes.jourFin);

  const interdits = motsInterditsTrouves(post, contraintes.motsInterdits);
  if (interdits.length) {
    anomalies.push({
      gravite: "bloquant",
      champ: "mots interdits",
      message: `Terme(s) interdit(s) détecté(s) : ${interdits.join(", ")}.`,
    });
  }

  if (post.titre.length > LIMITES.titre) {
    anomalies.push({
      gravite: "bloquant",
      champ: "titre",
      message: `Titre trop long (${post.titre.length}/${LIMITES.titre} caractères).`,
    });
  }
  if (post.accroche.length > LIMITES.accroche) {
    anomalies.push({
      gravite: "bloquant",
      champ: "accroche",
      message: `Accroche trop longue (${post.accroche.length}/${LIMITES.accroche} caractères).`,
    });
  }
  if (post.legende.length > LIMITES.legendeMax) {
    anomalies.push({
      gravite: "bloquant",
      champ: "légende",
      message: `Légende trop longue (${post.legende.length}/${LIMITES.legendeMax} caractères).`,
    });
  } else if (post.legende.length < LIMITES.legendeMin) {
    anomalies.push({
      gravite: "avertissement",
      champ: "légende",
      message: `Légende très courte (${post.legende.length} caractères) : enrichissez le texte avant publication.`,
    });
  }

  if (post.hashtags.length < LIMITES.hashtagsMin) {
    anomalies.push({
      gravite: "avertissement",
      champ: "hashtags",
      message: `Seulement ${post.hashtags.length} hashtag(s) : visez ${LIMITES.hashtagsMin} à ${LIMITES.hashtagsMax}.`,
    });
  } else if (post.hashtags.length > LIMITES.hashtagsMax) {
    anomalies.push({
      gravite: "avertissement",
      champ: "hashtags",
      message: `Trop de hashtags (${post.hashtags.length}/${LIMITES.hashtagsMax}).`,
    });
  }

  if (!post.cta?.trim()) {
    anomalies.push({ gravite: "avertissement", champ: "CTA", message: "Aucun appel à l'action." });
  }

  if (contraintes.plateformes.length && !contraintes.plateformes.includes(post.canal)) {
    anomalies.push({
      gravite: "bloquant",
      champ: "plateforme",
      message: `Canal « ${post.canal} » hors des plateformes de la stratégie (${contraintes.plateformes.join(", ")}).`,
    });
  }

  if (post.jour < min || post.jour > max) {
    anomalies.push({
      gravite: "bloquant",
      champ: "période",
      message: `Jour ${post.jour} hors de la période ${min}–${max}.`,
    });
  }

  if (contraintes.themes.length && themesDetectes(post, contraintes.themes).length === 0) {
    anomalies.push({
      gravite: "avertissement",
      champ: "thèmes",
      message: "Aucun thème de votre stratégie n'est identifiable dans ce post.",
    });
  }

  if (post.canal === "Google" && EMOJI.test(texteComplet(post))) {
    anomalies.push({
      gravite: "avertissement",
      champ: "format",
      message: "Emoji détecté sur une publication Google Business (à éviter).",
    });
  }

  return anomalies;
}

export type RapportConformite = {
  parPost: Array<{ post: IdeePost; anomalies: Anomalie[] }>;
  globales: Anomalie[];
  bloquants: number;
  avertissements: number;
  conformes: number;
};

export function verifierPlan(
  publications: IdeePost[],
  contraintes: ContraintesConformite,
): RapportConformite {
  const parPost = publications.map((post) => ({
    post,
    anomalies: verifierPost(post, contraintes),
  }));
  const globales: Anomalie[] = [];

  const joursVus = new Map<number, number>();
  publications.forEach((p) => joursVus.set(p.jour, (joursVus.get(p.jour) ?? 0) + 1));
  const doublons = [...joursVus.entries()].filter(([, n]) => n > 1).map(([jour]) => jour);
  if (doublons.length) {
    globales.push({
      gravite: "avertissement",
      champ: "planning",
      message: `Plusieurs publications le même jour : ${doublons.join(", ")}.`,
    });
  }

  if (contraintes.themes.length) {
    const couverts = new Set(publications.flatMap((p) => themesDetectes(p, contraintes.themes)));
    const manquants = contraintes.themes.filter((t) => !couverts.has(t));
    if (manquants.length) {
      globales.push({
        gravite: "avertissement",
        champ: "thèmes",
        message: `Thèmes non traités : ${manquants.join(", ")}.`,
      });
    }
  }

  if (contraintes.plateformes.length) {
    const utilises = new Set(publications.map((p) => p.canal));
    const oubliees = contraintes.plateformes.filter((c) => !utilises.has(c));
    if (oubliees.length) {
      globales.push({
        gravite: "avertissement",
        champ: "plateformes",
        message: `Plateforme(s) sans publication : ${oubliees.join(", ")}.`,
      });
    }
  }

  const bloquants = parPost.filter((p) => p.anomalies.some((a) => a.gravite === "bloquant")).length;
  const avertissements =
    parPost.filter(
      (p) => !p.anomalies.some((a) => a.gravite === "bloquant") && p.anomalies.length > 0,
    ).length + globales.length;

  return {
    parPost,
    globales,
    bloquants,
    avertissements,
    conformes: parPost.filter((p) => p.anomalies.length === 0).length,
  };
}
