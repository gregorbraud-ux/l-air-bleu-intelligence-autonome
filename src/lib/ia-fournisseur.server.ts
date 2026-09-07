/**
 * Fournisseur IA — 100 % indépendant.
 *
 * Un seul mode : un endpoint compatible OpenAI configuré côté serveur
 * (IA_API_URL — alias historique IA_BASE_URL — + IA_API_KEY + IA_MODELE).
 * Sans configuration : mode « IA NON CONFIGURÉE », aucune simulation.
 */

export type FournisseurIA = {
  id: "externe";
  nom: string;
  modele: string;
  /** Statut de coût réel, affiché tel quel dans l'interface. */
  cout: "gratuit" | "gratuit-limite" | "payant";
  remarque: string;
};

export type ResolutionIA =
  | { disponible: true; fournisseur: FournisseurIA }
  | { disponible: false; fournisseur: null; raison: string };

const MODELE_DEFAUT = "gpt-4o-mini";

function baseIA() {
  return (process.env.IA_API_URL ?? process.env.IA_BASE_URL)?.trim();
}

export function resoudreFournisseurIA(): ResolutionIA {
  const base = baseIA();
  const cle = process.env.IA_API_KEY?.trim();
  if (base && cle) {
    return {
      disponible: true,
      fournisseur: {
        id: "externe",
        nom: `Fournisseur IA (${new URL(base).host})`,
        modele: process.env.IA_MODELE?.trim() || MODELE_DEFAUT,
        cout: "payant",
        remarque:
          "Fournisseur configuré manuellement : le coût dépend de votre contrat avec ce fournisseur (un serveur local compatible OpenAI reste gratuit).",
      },
    };
  }

  return {
    disponible: false,
    fournisseur: null,
    raison:
      "IA NON CONFIGURÉE : renseignez IA_API_URL, IA_API_KEY et IA_MODELE côté serveur. Les modules de génération restent désactivés, aucun texte n'est simulé.",
  };
}

type OptionsTexte = { prompt: string; structure?: boolean };

/** Crée le provider AI SDK correspondant au fournisseur résolu. */
async function creerProvider(structure: boolean) {
  const resolution = resoudreFournisseurIA();
  if (!resolution.disponible) throw new Error(resolution.raison);
  const { fournisseur } = resolution;

  const { createOpenAICompatible } = await import("@ai-sdk/openai-compatible");
  const provider = createOpenAICompatible({
    name: "ia-externe",
    baseURL: baseIA()!,
    supportsStructuredOutputs: structure,
    headers: { Authorization: `Bearer ${process.env.IA_API_KEY!.trim()}` },
  });
  return { modele: provider(fournisseur.modele), fournisseur };
}

function messageErreur(error: unknown): never {
  const message = error instanceof Error ? error.message : "Erreur inconnue";
  if (message.includes("429"))
    throw new Error("Limite de requêtes IA atteinte, réessayez dans un instant.");
  if (message.includes("402"))
    throw new Error("Crédits IA épuisés : l'application repasse en mode sans IA.");
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
export async function genererObjetIA<T>(
  prompt: string,
  schema: { parse: (v: unknown) => T },
): Promise<T> {
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
