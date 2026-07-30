import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

const canaux = ["Instagram", "Google", "Newsletter", "TikTok"] as const;
const statuts = ["planifié", "brouillon"] as const;

export type IdeePost = {
  jour: number;
  heure: string;
  canal: (typeof canaux)[number];
  statut: (typeof statuts)[number];
  titre: string;
  accroche: string;
  legende: string;
  hashtags: string[];
  source: string;
};

export type PlanEditorial = {
  synthese: string;
  tendances: string[];
  publications: IdeePost[];
};

const schema = z.object({
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
      legende: z.string(),
      hashtags: z.array(z.string()),
      source: z.string(),
    }),
  ),
});

const entree = z.object({
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

function nettoyer(plan: PlanEditorial, nombre: number): PlanEditorial {
  return {
    synthese: plan.synthese.slice(0, 400),
    tendances: (plan.tendances ?? []).slice(0, 6).map((t) => t.slice(0, 160)),
    publications: (plan.publications ?? [])
      .filter((p) => Number.isFinite(p.jour))
      .slice(0, nombre)
      .map((p) => ({
        ...p,
        jour: Math.min(31, Math.max(1, Math.round(p.jour))),
        titre: p.titre.slice(0, 70),
        accroche: p.accroche.slice(0, 160),
        legende: p.legende.slice(0, 500),
        hashtags: (p.hashtags ?? []).slice(0, 6),
        source: p.source.slice(0, 120),
      }))
      .sort((a, b) => a.jour - b.jour),
  };
}

export const genererPlanEditorial = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => entree.parse(input))
  .handler(async ({ data }): Promise<PlanEditorial> => {
    const cle = process.env.LOVABLE_API_KEY;
    if (!cle) throw new Error("La clé de l'IA n'est pas configurée.");

    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(cle, undefined, { structuredOutputs: true });

    const prompt = [
      `Restaurant : L'Air Bleu, cuisine méditerranéenne de produits frais à Marseille, ticket moyen 46 €, note Google 4,6/5.`,
      `Mois à planifier : ${data.mois}. Ton souhaité : ${data.ton}.`,
      ``,
      `Avis Google récents :`,
      ...data.avis.map(
        (a) => `- ${a.date} · ${a.note}/5 (${a.sentiment}) · ${a.auteur} : ${a.texte}`,
      ),
      ``,
      `Tendances et signaux de veille concurrentielle :`,
      ...data.tendancesConcurrence.map((t) => `- ${t}`),
      ``,
      `Génère exactement ${data.nombre} publications réparties sur le mois (jours 1 à 31, jamais deux publications le même jour),`,
      `sur les canaux Instagram, Google, Newsletter et TikTok, en français.`,
      `Chaque publication doit s'appuyer sur un avis récent ou une tendance : indique-le dans "source".`,
      `Contraintes de longueur : titre max 70 caractères, accroche max 160 caractères, légende max 500 caractères, 3 à 5 hashtags.`,
      `"tendances" : 4 enseignements courts issus des avis et de la concurrence. "synthese" : 2 phrases max.`,
    ].join("\n");

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3.6-flash"),
        output: Output.object({ schema }),
        prompt,
      });
      return nettoyer(output as PlanEditorial, data.nombre);
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        try {
          const brut = JSON.parse(error.text ?? "");
          return nettoyer(schema.parse(brut) as PlanEditorial, data.nombre);
        } catch {
          throw new Error("L'IA n'a pas pu générer un plan exploitable. Réessayez.");
        }
      }
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      if (message.includes("429")) throw new Error("Limite de requêtes IA atteinte, réessayez dans un instant.");
      if (message.includes("402")) throw new Error("Crédits IA épuisés pour cet espace de travail.");
      throw new Error(`Génération impossible : ${message}`);
    }
  });