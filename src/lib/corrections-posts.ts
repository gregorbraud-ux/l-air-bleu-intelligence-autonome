import type { IdeePost } from "@/lib/contenu.schema";
import {
  LIMITES,
  themesDetectes,
  verifierPost,
  type ContraintesConformite,
  type Gravite,
} from "@/lib/conformite-posts";

export type Suggestion = {
  id: string;
  champ: string;
  gravite: Gravite;
  titre: string;
  detail: string;
  patch: Partial<IdeePost>;
};

/** Remplacements neutres, cohérents avec le ton chaleureux de L'Air Bleu. */
const REMPLACEMENTS: Record<string, string> = {
  gastronomique: "fait maison",
  gastronomie: "cuisine maison",
  "pas cher": "au bon rapport qualité/prix",
  promo: "offre du midi",
  promotion: "offre du midi",
  "meilleur restaurant": "table du midi",
  incroyable: "savoureux",
  unique: "authentique",
  luxe: "soigné",
  exceptionnel: "généreux",
  imbattable: "juste",
  gratuit: "offert",
  chef: "équipe",
};

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu;

function normaliser(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function echapper(v: string) {
  return v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function remplacementPour(mot: string) {
  const cle = normaliser(mot.trim());
  const trouve = Object.entries(REMPLACEMENTS).find(([k]) => normaliser(k) === cle);
  return trouve?.[1] ?? "";
}

function nettoyerEspaces(v: string) {
  return v
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([,.;!?])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function remplacerDansTexte(texte: string, mot: string, parDefaut: string) {
  const motif = new RegExp(echapper(mot.trim()), "gi");
  if (!motif.test(texte)) return texte;
  return nettoyerEspaces(texte.replace(new RegExp(echapper(mot.trim()), "gi"), parDefaut));
}

function motsInterditsPresents(post: IdeePost, motsInterdits: string[]) {
  const cible = normaliser(
    [post.titre, post.accroche, post.legende, post.cta, post.angle, post.hashtags.join(" ")].join(
      "\n",
    ),
  );
  return motsInterdits
    .map((m) => m.trim())
    .filter((m) => m.length > 1 && cible.includes(normaliser(m)));
}

/** Raccourcit un texte sans couper un mot, en gardant une ponctuation propre. */
export function raccourcir(texte: string, max: number) {
  const propre = nettoyerEspaces(texte);
  if (propre.length <= max) return propre;
  const coupe = propre.slice(0, max);
  const phrase = coupe.lastIndexOf(". ");
  if (phrase > max * 0.5) return coupe.slice(0, phrase + 1).trim();
  const espace = coupe.lastIndexOf(" ");
  return `${(espace > 0 ? coupe.slice(0, espace) : coupe).replace(/[,;:.\-–]$/, "").trim()}…`;
}

function enrichirLegende(post: IdeePost, min: number) {
  const blocs = [nettoyerEspaces(post.legende)];
  if (post.angle && !normaliser(post.legende).includes(normaliser(post.angle))) {
    blocs.push(post.angle);
  }
  blocs.push(
    "Cuisine maison, produits frais et service rapide le midi : idéal pour une pause déjeuner en équipe ou en famille.",
    "L'Air Bleu — 3 rue Anatole France, 44550 Montoir-de-Bretagne · Réservations au 02 40 90 01 17.",
  );
  if (post.cta?.trim()) blocs.push(post.cta.trim());
  let texte = nettoyerEspaces(blocs.join("\n\n"));
  if (texte.length < min) {
    texte = nettoyerEspaces(
      `${texte}\n\nMenu du midi renouvelé chaque semaine, dressé minute par notre équipe.`,
    );
  }
  return texte;
}

export function suggestionsPour(post: IdeePost, contraintes: ContraintesConformite): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const anomalies = verifierPost(post, contraintes);
  const aAnomalie = (champ: string) => anomalies.some((a) => a.champ === champ);
  const min = Math.min(contraintes.jourDebut, contraintes.jourFin);
  const max = Math.max(contraintes.jourDebut, contraintes.jourFin);

  // 1. Mots interdits
  const interdits = motsInterditsPresents(post, contraintes.motsInterdits);
  interdits.forEach((mot) => {
    const remplacement = remplacementPour(mot);
    const patch: Partial<IdeePost> = {
      titre: remplacerDansTexte(post.titre, mot, remplacement),
      accroche: remplacerDansTexte(post.accroche, mot, remplacement),
      legende: remplacerDansTexte(post.legende, mot, remplacement),
      cta: remplacerDansTexte(post.cta, mot, remplacement),
      angle: remplacerDansTexte(post.angle, mot, remplacement),
      hashtags: post.hashtags.filter(
        (h) => !normaliser(h).includes(normaliser(mot.replace(/\s+/g, ""))),
      ),
    };
    suggestions.push({
      id: `interdit-${mot}`,
      champ: "mots interdits",
      gravite: "bloquant",
      titre: remplacement
        ? `Remplacer « ${mot} » par « ${remplacement} »`
        : `Retirer « ${mot} » du texte`,
      detail: remplacement
        ? "Le terme est remplacé partout (titre, accroche, légende, CTA, hashtags)."
        : "Le terme est supprimé partout et les espaces sont nettoyés.",
      patch,
    });
  });

  // 2. Longueurs
  if (post.titre.length > LIMITES.titre) {
    suggestions.push({
      id: "titre-long",
      champ: "titre",
      gravite: "bloquant",
      titre: `Raccourcir le titre à ${LIMITES.titre} caractères`,
      detail: `${post.titre.length} → ${raccourcir(post.titre, LIMITES.titre).length} caractères, sans couper de mot.`,
      patch: { titre: raccourcir(post.titre, LIMITES.titre) },
    });
  }
  if (post.accroche.length > LIMITES.accroche) {
    suggestions.push({
      id: "accroche-longue",
      champ: "accroche",
      gravite: "bloquant",
      titre: `Raccourcir l'accroche à ${LIMITES.accroche} caractères`,
      detail: `${post.accroche.length} → ${raccourcir(post.accroche, LIMITES.accroche).length} caractères.`,
      patch: { accroche: raccourcir(post.accroche, LIMITES.accroche) },
    });
  }
  if (post.legende.length > LIMITES.legendeMax) {
    suggestions.push({
      id: "legende-longue",
      champ: "légende",
      gravite: "bloquant",
      titre: `Réduire la légende à ${LIMITES.legendeMax} caractères`,
      detail: `${post.legende.length} → ${raccourcir(post.legende, LIMITES.legendeMax).length} caractères.`,
      patch: { legende: raccourcir(post.legende, LIMITES.legendeMax) },
    });
  } else if (post.legende.length < LIMITES.legendeMin) {
    const enrichie = enrichirLegende(post, LIMITES.legendeMin);
    suggestions.push({
      id: "legende-courte",
      champ: "légende",
      gravite: "avertissement",
      titre: "Compléter la légende (trop courte)",
      detail: `${post.legende.length} → ${enrichie.length} caractères : bénéfices déjeuner + coordonnées ajoutés.`,
      patch: { legende: enrichie },
    });
  }

  // 3. Hashtags
  if (post.hashtags.length > LIMITES.hashtagsMax) {
    suggestions.push({
      id: "hashtags-trop",
      champ: "hashtags",
      gravite: "avertissement",
      titre: `Ne garder que ${LIMITES.hashtagsMax} hashtags`,
      detail: "Les hashtags surnuméraires sont retirés en fin de liste.",
      patch: { hashtags: post.hashtags.slice(0, LIMITES.hashtagsMax) },
    });
  } else if (post.hashtags.length < LIMITES.hashtagsMin) {
    const base = [
      "#LAirBleu",
      "#MontoirDeBretagne",
      "#DejeunerLoireAtlantique",
      "#CuisineMaison",
      "#MenuDuMidi",
    ];
    const complet = [...post.hashtags];
    base.forEach((h) => {
      if (
        complet.length < LIMITES.hashtagsMin &&
        !complet.some((x) => normaliser(x) === normaliser(h))
      ) {
        complet.push(h);
      }
    });
    suggestions.push({
      id: "hashtags-peu",
      champ: "hashtags",
      gravite: "avertissement",
      titre: "Ajouter des hashtags locaux",
      detail: `Complète jusqu'à ${LIMITES.hashtagsMin} hashtags avec des mots-clés SEO local.`,
      patch: { hashtags: complet },
    });
  }

  // 4. CTA manquant
  if (!post.cta?.trim()) {
    const cta = "Réservez votre table du midi au 02 40 90 01 17.";
    suggestions.push({
      id: "cta",
      champ: "CTA",
      gravite: "avertissement",
      titre: "Ajouter un appel à l'action",
      detail: `« ${cta} »`,
      patch: { cta },
    });
  }

  // 5. Période
  if (post.jour < min || post.jour > max) {
    const jour = Math.min(max, Math.max(min, post.jour));
    suggestions.push({
      id: "periode",
      champ: "période",
      gravite: "bloquant",
      titre: `Replacer la publication au jour ${jour}`,
      detail: `Jour ${post.jour} hors de la période ${min}–${max}.`,
      patch: { jour },
    });
  }

  // 6. Plateforme hors stratégie
  if (contraintes.plateformes.length && !contraintes.plateformes.includes(post.canal)) {
    const canal = contraintes.plateformes[0];
    suggestions.push({
      id: "plateforme",
      champ: "plateforme",
      gravite: "bloquant",
      titre: `Basculer le post sur ${canal}`,
      detail: `« ${post.canal} » ne fait pas partie de vos plateformes cibles.`,
      patch: { canal },
    });
  }

  // 7. Thème stratégique absent
  if (
    contraintes.themes.length &&
    themesDetectes(post, contraintes.themes).length === 0 &&
    aAnomalie("thèmes")
  ) {
    const theme = contraintes.themes[0];
    suggestions.push({
      id: "theme",
      champ: "thèmes",
      gravite: "avertissement",
      titre: `Rattacher le post au thème « ${theme} »`,
      detail: "Le thème est ajouté à l'angle éditorial et rappelé en fin de légende.",
      patch: {
        angle: post.angle ? `${post.angle} · ${theme}` : theme,
        legende: nettoyerEspaces(`${post.legende}\n\nAu programme : ${theme.toLowerCase()}.`),
      },
    });
  }

  // 8. Emoji sur Google Business
  if (
    post.canal === "Google" &&
    EMOJI.test(`${post.titre}${post.accroche}${post.legende}${post.cta}`)
  ) {
    suggestions.push({
      id: "emoji",
      champ: "format",
      gravite: "avertissement",
      titre: "Retirer les emojis (Google Business)",
      detail: "Les emojis sont supprimés du titre, de l'accroche, de la légende et du CTA.",
      patch: {
        titre: nettoyerEspaces(post.titre.replace(EMOJI, "")),
        accroche: nettoyerEspaces(post.accroche.replace(EMOJI, "")),
        legende: nettoyerEspaces(post.legende.replace(EMOJI, "")),
        cta: nettoyerEspaces(post.cta.replace(EMOJI, "")),
      },
    });
  }

  return suggestions;
}

/** Applique en cascade toutes les corrections proposées (recalculées à chaque étape). */
export function appliquerToutesCorrections(
  post: IdeePost,
  contraintes: ContraintesConformite,
  options?: { seulementBloquants?: boolean },
): { post: IdeePost; appliquees: string[] } {
  let courant: IdeePost = { ...post };
  const appliquees: string[] = [];
  for (let i = 0; i < 8; i += 1) {
    const restantes = suggestionsPour(courant, contraintes).filter((s) =>
      options?.seulementBloquants ? s.gravite === "bloquant" : true,
    );
    const suivante = restantes.find((s) => !appliquees.includes(s.id));
    if (!suivante) break;
    courant = { ...courant, ...suivante.patch };
    appliquees.push(suivante.id);
  }
  return { post: courant, appliquees };
}
