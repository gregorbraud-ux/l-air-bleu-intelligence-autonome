import { createServerFn } from "@tanstack/react-start";
import { entreeAssistant, entreeMarketing } from "@/lib/ia-prompts";

/** Indique si une clé IA est réellement configurée côté serveur (aucune simulation côté client). */
export const statutIA = createServerFn({ method: "GET" }).handler(async () => {
  const cle = process.env.LOVABLE_API_KEY;
  return { disponible: Boolean(cle), fournisseur: cle ? "Lovable AI Gateway" : null };
});

export const genererContenuMarketing = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => entreeMarketing.parse(input))
  .handler(async ({ data }): Promise<{ texte: string }> => {
    const cle = process.env.LOVABLE_API_KEY;
    if (!cle) throw new Error("IA non connectée : aucune clé IA configurée côté serveur.");

    const { generateText } = await import("ai");
    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const { promptMarketing } = await import("@/lib/ia-prompts");

    const gateway = createLovableAiGatewayProvider(cle);
    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3.6-flash"),
        prompt: promptMarketing(data),
      });
      const texte = text.trim();
      if (!texte) throw new Error("Réponse IA vide.");
      return { texte };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      if (message.includes("429")) throw new Error("Limite de requêtes IA atteinte, réessayez dans un instant.");
      if (message.includes("402")) throw new Error("Crédits IA épuisés pour cet espace de travail.");
      throw new Error(`Génération impossible : ${message}`);
    }
  });

export const interrogerAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => entreeAssistant.parse(input))
  .handler(async ({ data }): Promise<{ texte: string }> => {
    const cle = process.env.LOVABLE_API_KEY;
    if (!cle) throw new Error("IA non connectée : aucune clé IA configurée côté serveur.");

    const { generateText } = await import("ai");
    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const { promptAssistant } = await import("@/lib/ia-prompts");

    const gateway = createLovableAiGatewayProvider(cle);
    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3.6-flash"),
        prompt: promptAssistant(data),
      });
      const texte = text.trim();
      if (!texte) throw new Error("Réponse IA vide.");
      return { texte };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      if (message.includes("429")) throw new Error("Limite de requêtes IA atteinte, réessayez dans un instant.");
      if (message.includes("402")) throw new Error("Crédits IA épuisés pour cet espace de travail.");
      throw new Error(`Analyse impossible : ${message}`);
    }
  });
