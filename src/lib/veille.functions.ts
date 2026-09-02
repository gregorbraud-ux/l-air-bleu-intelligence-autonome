import { createServerFn } from "@tanstack/react-start";
import { entreeVeille, type RapportVeille } from "@/lib/veille.schema";

export const genererRapportVeille = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => entreeVeille.parse(input))
  .handler(async ({ data }): Promise<RapportVeille> => {
    const { genererObjetIA } = await import("@/lib/ia-fournisseur.server");
    const { rapportVeilleSchema, construirePromptVeille } = await import("@/lib/veille.schema");

    const rapport = await genererObjetIA(construirePromptVeille(data), rapportVeilleSchema);
    return { ...(rapport as Omit<RapportVeille, "genereLe">), genereLe: new Date().toISOString() };
  });
