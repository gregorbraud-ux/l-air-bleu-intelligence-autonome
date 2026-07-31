import { z } from "zod";

export const canaux = ["Instagram", "Google", "Newsletter", "TikTok"] as const;
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
  return {
    synthese: (plan.synthese ?? "").slice(0, 400),
    tendances: (plan.tendances ?? []).slice(0, 6).map((t) => t.slice(0, 160)),
    publications: (plan.publications ?? [])
      .filter((p) => Number.isFinite(p.jour))
      .slice(0, nombre)
      .map((p) => ({
        ...p,
        jour: Math.min(31, Math.max(1, Math.round(p.jour))),
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
    `Restaurant : L'Air Bleu, cuisine méditerranéenne de produits frais à Marseille, ticket moyen 46 €, note Google 4,6/5.`,
    `Mois à planifier : ${data.mois}. Ton souhaité : ${data.ton}.`,
    ``,
    `Avis Google récents :`,
    ...data.avis.map((a) => `- ${a.date} · ${a.note}/5 (${a.sentiment}) · ${a.auteur} : ${a.texte}`),
    ``,
    `Tendances et signaux de veille concurrentielle :`,
    ...data.tendancesConcurrence.map((t) => `- ${t}`),
    ``,
    `Génère exactement ${data.nombre} publications réparties sur le mois (jours 1 à 31, jamais deux publications le même jour),`,
    `sur les canaux Instagram, Google, Newsletter et TikTok, en français.`,
    `Chaque publication doit s'appuyer sur un avis récent ou une tendance : indique-le dans "source".`,
    ``,
    `Pour chaque publication, produis un texte de post PRÊT À PUBLIER dans "legende" :`,
    `- une caption complète et autonome (3 à 5 courts paragraphes séparés par des sauts de ligne),`,
    `- écrite à la première personne du pluriel ("nous"), voix du restaurant, sans placeholder ni crochets,`,
    `- adaptée au canal (Instagram sensoriel et rythmé, TikTok punchy avec accroche en 1re ligne,`,
    `  Google Business informatif et local, Newsletter plus narrative et un peu plus longue),`,
    `- terminée par l'appel à l'action donné dans "cta" (réservation, lien en bio, visite, etc.).`,
    `"angle" : l'angle éditorial en une phrase courte (ex. « preuve sociale via avis 5/5 sur le poulpe »).`,
    `"tonVoix" : 2 à 4 adjectifs décrivant le ton employé, cohérents avec le ton souhaité "${data.ton}".`,
    `"accroche" : la première ligne accrocheuse du post. "hashtags" : 4 à 6 hashtags pertinents, mélange marque/local/thème,`,
    `avec le préfixe #, sans doublon entre publications d'un même canal.`,
    `Contraintes : titre max 70 caractères, accroche max 160 caractères, légende max 1000 caractères, aucun emoji sur Google Business, emojis sobres ailleurs.`,
    `"tendances" : 4 enseignements courts issus des avis et de la concurrence. "synthese" : 2 phrases max.`,
  ].join("\n");
}