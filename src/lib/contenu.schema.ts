import { z } from "zod";

export const canaux = ["Facebook", "Instagram", "Google", "Newsletter"] as const;
export const statuts = ["planifié", "brouillon"] as const;

export type IdeePost = {
  jour: number;
  heure: string;
  canal: (typeof canaux)[number];
  statut: (typeof statuts)[number];
  titre: string;
  accroche: string;
  angle: string;
  tonVoix: string;
  legende: string;
  cta: string;
  hashtags: string[];
  source: string;
};

export type PlanEditorial = {
  synthese: string;
  tendances: string[];
  publications: IdeePost[];
};

export const planSchema = z.object({
  synthese: z.string(),
  tendances: z.array(z.string()),
  publications: z.array(
    z.object({
      jour: z.number(),
      heure: z.string(),
      canal: z.enum(canaux),
      statut: z.enum(statuts),
      titre: z.string(),
      accroche: z.string(),
      angle: z.string(),
      tonVoix: z.string(),
      legende: z.string(),
      cta: z.string(),
      hashtags: z.array(z.string()),
      source: z.string(),
    }),
  ),
});

export const entreePlan = z.object({
  mois: z.string().trim().max(40),
  nombre: z.number().int().min(4).max(16),
  ton: z.string().trim().max(40),
  frequenceParSemaine: z.number().min(0.5).max(21).default(3),
  plateformes: z.array(z.enum(canaux)).min(1).max(4).default(["Facebook", "Instagram"]),
  themes: z.array(z.string().max(80)).max(12).default([]),
  motsInterdits: z.array(z.string().max(40)).max(30).default([]),
  jourDebut: z.number().int().min(1).max(31).default(1),
  jourFin: z.number().int().min(1).max(31).default(31),
  avis: z
    .array(
      z.object({
        auteur: z.string().max(60),
        note: z.number(),
        date: z.string().max(30),
        texte: z.string().max(600),
        sentiment: z.string().max(20),
      }),
    )
    .max(20),
  tendancesConcurrence: z.array(z.string().max(200)).max(10),
});

export type EntreePlan = z.infer<typeof entreePlan>;

export function nettoyerPlan(plan: PlanEditorial, nombre: number): PlanEditorial {
  return nettoyerPlanAvecContraintes(plan, { nombre });
}

export function nettoyerPlanAvecContraintes(
  plan: PlanEditorial,
  options: {
    nombre: number;
    plateformes?: readonly (typeof canaux)[number][];
    jourDebut?: number;
    jourFin?: number;
  },
): PlanEditorial {
  const { nombre } = options;
  const min = Math.min(options.jourDebut ?? 1, options.jourFin ?? 31);
  const max = Math.max(options.jourDebut ?? 1, options.jourFin ?? 31);
  const plateformes = options.plateformes?.length ? options.plateformes : canaux;
  return {
    synthese: (plan.synthese ?? "").slice(0, 400),
    tendances: (plan.tendances ?? []).slice(0, 6).map((t) => t.slice(0, 160)),
    publications: (plan.publications ?? [])
      .filter((p) => Number.isFinite(p.jour))
      .map((p) => ({
        ...p,
        canal: plateformes.includes(p.canal) ? p.canal : plateformes[0],
      }))
      .slice(0, nombre)
      .map((p) => ({
        ...p,
        jour: Math.min(max, Math.max(min, Math.round(p.jour))),
        titre: p.titre.slice(0, 70),
        accroche: p.accroche.slice(0, 160),
        angle: (p.angle ?? "").slice(0, 120),
        tonVoix: (p.tonVoix ?? "").slice(0, 60),
        legende: p.legende.slice(0, 1100),
        cta: (p.cta ?? "").slice(0, 120),
        hashtags: (p.hashtags ?? []).slice(0, 8).map((h) => (h.startsWith("#") ? h : `#${h}`)),
        source: p.source.slice(0, 120),
      }))
      .sort((a, b) => a.jour - b.jour),
  };
}

export function construirePrompt(data: EntreePlan) {
  return [
    `Restaurant : L'Air Bleu (SARL LG AIR), restaurant traditionnel de cuisine maison, 3 rue Anatole France, 44550 Montoir-de-Bretagne (Loire-Atlantique), tél. 02 40 90 01 17.`,
    `Positionnement : la référence du déjeuner du secteur (Montoir-de-Bretagne, Trignac, Donges, Saint-Nazaire) — chaleureux, convivial, généreux, produits frais, cuisine maison, excellent rapport qualité/prix, service rapide le midi.`,
    `Cibles : clientèle professionnelle du midi et clientèle familiale. Ticket moyen déjeuner 17,50 €, note Google 4,5/5.`,
    `Objectifs : fréquentation du midi, réservations, avis Google, notoriété locale, communauté Facebook et Instagram.`,
    `Mois à planifier : ${data.mois}. Ton souhaité : ${data.ton}.`,
    `Période à couvrir : du jour ${data.jourDebut} au jour ${data.jourFin} du mois.`,
    `Fréquence cible : environ ${data.frequenceParSemaine} publication(s) par semaine.`,
    `Plateformes autorisées (n'utilise AUCUN autre canal) : ${data.plateformes.join(", ")}.`,
    data.themes.length
      ? `Thèmes imposés par la stratégie (répartis-les équitablement) : ${data.themes.join(" ; ")}.`
      : "",
    data.motsInterdits.length
      ? `Mots et expressions STRICTEMENT interdits dans tous les textes (titres, accroches, légendes, hashtags, CTA) : ${data.motsInterdits.join(", ")}. N'utilise ni ces termes ni de variantes proches.`
      : "",
    ``,
    `Avis Google récents :`,
    ...data.avis.map(
      (a) => `- ${a.date} · ${a.note}/5 (${a.sentiment}) · ${a.auteur} : ${a.texte}`,
    ),
    ``,
    `Tendances et signaux de veille concurrentielle :`,
    ...data.tendancesConcurrence.map((t) => `- ${t}`),
    ``,
    `Génère exactement ${data.nombre} publications réparties sur la période (jours ${data.jourDebut} à ${data.jourFin}, jamais deux publications le même jour),`,
    `uniquement sur les canaux suivants : ${data.plateformes.join(", ")}, en français.`,
    data.themes.length
      ? `Thèmes à traiter : ${data.themes.join(" ; ")}.`
      : `Thèmes à privilégier : menus de la semaine, plats du jour, desserts maison, produits frais et fournisseurs locaux, équipes, cuisine, clients (avec autorisation), événements.`,
    `Intègre naturellement des mots-clés locaux (déjeuner Montoir-de-Bretagne, restaurant traditionnel Loire-Atlantique, menu du midi près de Saint-Nazaire) pour le référencement local.`,
    `Chaque publication doit s'appuyer sur un avis récent ou une tendance : indique-le dans "source".`,
    ``,
    `Pour chaque publication, produis un texte de post PRÊT À PUBLIER dans "legende" :`,
    `- une caption complète et autonome (3 à 5 courts paragraphes séparés par des sauts de ligne),`,
    `- écrite à la première personne du pluriel ("nous"), voix du restaurant, sans placeholder ni crochets,`,
    `- adaptée au canal (Facebook chaleureux et communautaire avec info pratique, Instagram visuel et rythmé,`,
    `  Google Business informatif et local sans emoji, Newsletter plus narrative et un peu plus longue),`,
    `- ton professionnel, chaleureux, authentique, humain et dynamique : jamais artificiel ni trop commercial,`,
    `- chaque post doit pouvoir être adapté à la fois à Facebook et Instagram,`,
    `- terminée par l'appel à l'action donné dans "cta" (réservation, lien en bio, visite, etc.).`,
    `"angle" : l'angle éditorial en une phrase courte (ex. « preuve sociale via avis 5/5 sur le poulpe »).`,
    `"tonVoix" : 2 à 4 adjectifs décrivant le ton employé, cohérents avec le ton souhaité "${data.ton}".`,
    `"accroche" : la première ligne accrocheuse du post. "hashtags" : 4 à 6 hashtags pertinents, mélange marque/local/thème,`,
    `avec le préfixe #, sans doublon entre publications d'un même canal.`,
    `Contraintes : titre max 70 caractères, accroche max 160 caractères, légende max 1000 caractères, aucun emoji sur Google Business, emojis sobres ailleurs.`,
    `"tendances" : 4 enseignements courts issus des avis et de la concurrence. "synthese" : 2 phrases max.`,
  ].join("\n");
}
