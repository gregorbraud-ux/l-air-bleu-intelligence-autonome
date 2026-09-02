import { createServerFn } from "@tanstack/react-start";
import { entreeAssistant, entreeMarketing } from "@/lib/ia-prompts";

export type StatutIA = {
  disponible: boolean;
  fournisseur: string | null;
  modele: string | null;
  cout: "gratuit" | "gratuit-limite" | "payant" | null;
  remarque: string;
};

/** Statut réel du fournisseur IA côté serveur (aucune simulation côté client). */
export const statutIA = createServerFn({ method: "GET" }).handler(async (): Promise<StatutIA> => {
  const { resoudreFournisseurIA } = await import("@/lib/ia-fournisseur.server");
  const r = resoudreFournisseurIA();
  if (!r.disponible) {
    return { disponible: false, fournisseur: null, modele: null, cout: null, remarque: r.raison };
  }
  return {
    disponible: true,
    fournisseur: r.fournisseur.nom,
    modele: r.fournisseur.modele,
    cout: r.fournisseur.cout,
    remarque: r.fournisseur.remarque,
  };
});

export const genererContenuMarketing = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => entreeMarketing.parse(input))
  .handler(async ({ data }): Promise<{ texte: string }> => {
    const { genererTexteIA } = await import("@/lib/ia-fournisseur.server");
    const { promptMarketing } = await import("@/lib/ia-prompts");
    return { texte: await genererTexteIA({ prompt: promptMarketing(data) }) };
  });

export const interrogerAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => entreeAssistant.parse(input))
  .handler(async ({ data }): Promise<{ texte: string }> => {
    const { genererTexteIA } = await import("@/lib/ia-fournisseur.server");
    const { promptAssistant } = await import("@/lib/ia-prompts");
    return { texte: await genererTexteIA({ prompt: promptAssistant(data) }) };
  });
