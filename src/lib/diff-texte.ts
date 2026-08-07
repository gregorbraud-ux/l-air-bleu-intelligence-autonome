import type { IdeePost } from "@/lib/contenu.schema";

export type Segment = { type: "egal" | "ajout" | "retrait"; texte: string };

export type ChampDiff = {
  champ: string;
  avant: string;
  apres: string;
  segments: Segment[];
  /** Variation de longueur en caractères (apres - avant). */
  delta: number;
};

const LABELS: Record<string, string> = {
  titre: "Titre",
  accroche: "Accroche",
  legende: "Légende",
  cta: "Appel à l'action",
  angle: "Angle éditorial",
  hashtags: "Hashtags",
  canal: "Plateforme",
  jour: "Jour de publication",
  heure: "Heure",
};

function enTexte(valeur: unknown): string {
  if (Array.isArray(valeur)) return valeur.join(" ");
  if (valeur === undefined || valeur === null) return "";
  return String(valeur);
}

/** Découpe en mots en conservant les espaces pour une reconstruction fidèle. */
function decouper(texte: string): string[] {
  return texte.length ? texte.match(/\s+|[^\s]+/g) ?? [] : [];
}

/** Diff mot à mot par plus longue sous-séquence commune. */
export function diffMots(avant: string, apres: string): Segment[] {
  const a = decouper(avant);
  const b = decouper(apres);
  const n = a.length;
  const m = b.length;
  const table: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const brut: Segment[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      brut.push({ type: "egal", texte: a[i] });
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      brut.push({ type: "retrait", texte: a[i] });
      i += 1;
    } else {
      brut.push({ type: "ajout", texte: b[j] });
      j += 1;
    }
  }
  while (i < n) {
    brut.push({ type: "retrait", texte: a[i] });
    i += 1;
  }
  while (j < m) {
    brut.push({ type: "ajout", texte: b[j] });
    j += 1;
  }

  // Fusion des segments consécutifs de même type
  return brut.reduce<Segment[]>((acc, seg) => {
    const dernier = acc[acc.length - 1];
    if (dernier && dernier.type === seg.type) dernier.texte += seg.texte;
    else acc.push({ ...seg });
    return acc;
  }, []);
}

export function libelleChamp(champ: string) {
  return LABELS[champ] ?? champ;
}

/** Compare un post à son patch de correction et renvoie un diff par champ modifié. */
export function diffPatch(post: IdeePost, patch: Partial<IdeePost>): ChampDiff[] {
  return Object.entries(patch)
    .map(([champ, valeur]) => {
      const avant = enTexte((post as Record<string, unknown>)[champ]);
      const apres = enTexte(valeur);
      return { champ, avant, apres, segments: diffMots(avant, apres), delta: apres.length - avant.length };
    })
    .filter((d) => d.avant !== d.apres);
}
