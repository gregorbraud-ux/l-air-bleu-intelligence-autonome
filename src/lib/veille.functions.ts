import { createServerFn } from "@tanstack/react-start";
import { entreeVeille, type RapportVeille } from "@/lib/veille.schema";

export const genererRapportVeille = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => entreeVeille.parse(input))
  .handler(async ({ data }): Promise<RapportVeille> => {
    const cle = process.env.LOVABLE_API_KEY;
    if (!cle) throw new Error("La clé de l'IA n'est pas configurée.");

    const { generateText, Output, NoObjectGeneratedError } = await import("ai");
    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const { rapportVeilleSchema, construirePromptVeille } = await import("@/lib/veille.schema");

    const gateway = createLovableAiGatewayProvider(cle, undefined, { structuredOutputs: true });

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3.6-flash"),
        output: Output.object({ schema: rapportVeilleSchema }),
        prompt: construirePromptVeille(data),
      });
      return { ...(output as Omit<RapportVeille, "genereLe">), genereLe: new Date().toISOString() };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        try {
          const brut = rapportVeilleSchema.parse(JSON.parse(error.text ?? ""));
          return { ...brut, genereLe: new Date().toISOString() };
        } catch {
          throw new Error("L'IA n'a pas pu produire de rapport exploitable. Réessayez.");
        }
      }
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      if (message.includes("429")) throw new Error("Limite de requêtes IA atteinte, réessayez dans un instant.");
      if (message.includes("402")) throw new Error("Crédits IA épuisés pour cet espace de travail.");
      throw new Error(`Analyse impossible : ${message}`);
    }
  });
