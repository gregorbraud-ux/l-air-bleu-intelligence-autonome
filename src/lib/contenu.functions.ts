import { createServerFn } from "@tanstack/react-start";
import type { PlanEditorial } from "@/lib/contenu.schema";
import { entreePlan } from "@/lib/contenu.schema";

export type { IdeePost, PlanEditorial } from "@/lib/contenu.schema";

export const genererPlanEditorial = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => entreePlan.parse(input))
  .handler(async ({ data }): Promise<PlanEditorial> => {
    const { genererObjetIA } = await import("@/lib/ia-fournisseur.server");
    const { planSchema, nettoyerPlanAvecContraintes, construirePrompt } =
      await import("@/lib/contenu.schema");

    const plan = await genererObjetIA(construirePrompt(data), planSchema);
    return nettoyerPlanAvecContraintes(plan as PlanEditorial, {
      nombre: data.nombre,
      plateformes: data.plateformes,
      jourDebut: data.jourDebut,
      jourFin: data.jourFin,
    });
  });
