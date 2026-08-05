import { createServerFn } from "@tanstack/react-start";
import type { PlanEditorial } from "@/lib/contenu.schema";
import { entreePlan } from "@/lib/contenu.schema";

export type { IdeePost, PlanEditorial } from "@/lib/contenu.schema";

export const genererPlanEditorial = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => entreePlan.parse(input))
  .handler(async ({ data }): Promise<PlanEditorial> => {
    const cle = process.env.LOVABLE_API_KEY;
    if (!cle) throw new Error("La clé de l'IA n'est pas configurée.");

    const { generateText, Output, NoObjectGeneratedError } = await import("ai");
    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const { planSchema, nettoyerPlanAvecContraintes, construirePrompt } = await import("@/lib/contenu.schema");
    const contraintes = {
      nombre: data.nombre,
      plateformes: data.plateformes,
      jourDebut: data.jourDebut,
      jourFin: data.jourFin,
    };

    const gateway = createLovableAiGatewayProvider(cle, undefined, { structuredOutputs: true });

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3.6-flash"),
        output: Output.object({ schema: planSchema }),
        prompt: construirePrompt(data),
      });
      return nettoyerPlanAvecContraintes(output as PlanEditorial, contraintes);
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        try {
          const brut = planSchema.parse(JSON.parse(error.text ?? ""));
          return nettoyerPlanAvecContraintes(brut as PlanEditorial, contraintes);
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
