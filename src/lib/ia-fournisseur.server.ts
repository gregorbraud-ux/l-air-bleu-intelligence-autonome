/**
 * Couche d'abstraction du fournisseur IA.
 * Objectif : pouvoir remplacer Lovable AI Gateway par un autre fournisseur
 * compatible OpenAI (ou désactiver l'IA) sans toucher au reste de l'application.
 *
 * Ordre de résolution :
 *  1. IA_BASE_URL + IA_API_KEY (+ IA_MODELE)  → fournisseur externe compatible OpenAI
 *  2. LOVABLE_API_KEY                          → Lovable AI Gateway (par défaut)
 *  3. aucun                                    → mode SANS IA (aucune simulation)
 */

export type FournisseurIA = {
  id: "externe" | "lovable";
  nom: string;
  modele: string;
  /** Statut de coût réel, affiché tel quel dans l'interface. */
  cout: "gratuit" | "gratuit-limite" | "payant";
  remarque: string;
};

export type ResolutionIA =
  | { disponible: true; fournisseur: FournisseurIA }
  | { disponible: false; fournisseur: null; raison: string };

const MODELE_DEFAUT = "google/gemini-3.6-flash";

export function resoudreFournisseurIA(): ResolutionIA {
  const baseExterne = process.env.IA_BASE_URL?.trim();
  const cleExterne = process.env.IA_API_KEY?.trim();
  if (baseExterne && cleExterne) {
    return {
      disponible: true,
      fournisseur: {
        id: "externe",
        nom: `Fournisseur externe (${new URL(baseExterne).host})`,
        modele: process.env.IA_MODELE?.trim() || MODELE_DEFAUT,
        cout: "payant",
        remarque:
          "Fournisseur configuré manuellement : le coût dépend de votre contrat avec ce fournisseur.",
      },
    };
  }

  const cleLovable = process.env.LOVABLE_API_KEY?.trim();
  if (cleLovable) {
    return {
      disponible: true,
      fournisseur: {
        id: "lovable",
        nom: "Lovable AI Gateway",
        modele: MODELE_DEFAUT,
        cout: "gratuit-limite",
        remarque:
          "Inclus dans l'espace de travail Lovable, avec un quota de crédits mensuel. Une fois le quota atteint, la génération s'arrête : ce n'est pas une gratuité illimitée.",
      },
    };
  }

  return {
    disponible: false,
    fournisseur: null,
    raison:
      "Aucun fournisseur IA configuré. L'application fonctionne en mode sans IA : les modules de génération sont désactivés, aucun texte n'est simulé.",
  };
}

type OptionsTexte = { prompt: string; structure?: boolean };

/** Crée le provider AI SDK correspondant au fournisseur résolu. */
async function creerProvider(structure: boolean) {
  const resolution = resoudreFournisseurIA();
  if (!resolution.disponible) throw new Error(resolution.raison);
  const { fournisseur } = resolution;

  if (fournisseur.id === "externe") {
    const { createOpenAICompatible } = await import("@ai-sdk/openai-compatible");
    const provider = createOpenAICompatible({
      name: "ia-externe",
      baseURL: process.env.IA_BASE_URL!.trim(),
      supportsStructuredOutputs: structure,
      headers: { Authorization: `Bearer ${process.env.IA_API_KEY!.trim()}` },
    });
    return { modele: provider(fournisseur.modele), fournisseur };
  }

  const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
  const provider = createLovableAiGatewayProvider(process.env.LOVABLE_API_KEY!.trim(), undefined, {
    structuredOutputs: structure,
  });
  return { modele: provider(fournisseur.modele), fournisseur };
}

function messageErreur(error: unknown): never {
  const message = error instanceof Error ? error.message : "Erreur inconnue";
  if (message.includes("429")) throw new Error("Limite de requêtes IA atteinte, réessayez dans un instant.");
  if (message.includes("402")) throw new Error("Crédits IA épuisés : l'application repasse en mode sans IA.");
  if (message.includes("401") || message.includes("403"))
    throw new Error("Fournisseur IA refusé : vérifiez la clé configurée côté serveur.");
  throw new Error(`Génération impossible : ${message}`);
}

/** Génère un texte libre via le fournisseur actif. */
export async function genererTexteIA({ prompt }: OptionsTexte): Promise<string> {
  const { generateText } = await import("ai");
  const { modele } = await creerProvider(false);
  try {
    const { text } = await generateText({ model: modele, prompt });
    const texte = text.trim();
    if (!texte) throw new Error("Réponse IA vide.");
    return texte;
  } catch (error) {
    messageErreur(error);
  }
}

/** Génère un objet structuré validé par un schéma Zod via le fournisseur actif. */
export async function genererObjetIA<T>(prompt: string, schema: { parse: (v: unknown) => T }): Promise<T> {
  const { generateText, Output, NoObjectGeneratedError } = await import("ai");
  const { modele } = await creerProvider(true);
  try {
    const { output } = await generateText({
      model: modele,
      output: Output.object({ schema: schema as never }),
      prompt,
    });
    return schema.parse(output);
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      try {
        return schema.parse(JSON.parse(error.text ?? ""));
      } catch {
        throw new Error("L'IA n'a pas produit de résultat exploitable. Réessayez.");
      }
    }
    messageErreur(error);
  }
}
