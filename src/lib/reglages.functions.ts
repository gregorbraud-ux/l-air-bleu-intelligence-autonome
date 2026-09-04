import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Persistance des réglages métier (paramètres admin, stratégie IA, seuils
 * d'alertes, posts en validation) dans la base, protégée par RLS :
 * chaque utilisateur ne lit et n'écrit que ses propres réglages.
 */

const schemaCle = z.object({ cle: z.string().min(3).max(80) });
const schemaEcriture = schemaCle.extend({ valeur: z.unknown() });

export const lireReglage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schemaCle.parse(input))
  .handler(async ({ data, context }) => {
    const { data: ligne, error } = await context.supabase
      .from("app_reglages")
      .select("valeur")
      .eq("user_id", context.userId)
      .eq("cle", data.cle)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { valeur: ligne?.valeur ?? null };
  });

export const ecrireReglage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schemaEcriture.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("app_reglages").upsert(
      {
        user_id: context.userId,
        cle: data.cle,
        valeur: (data.valeur ?? null) as never,
      },
      { onConflict: "user_id,cle" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
