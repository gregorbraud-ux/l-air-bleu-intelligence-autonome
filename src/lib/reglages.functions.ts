import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Persistance des réglages métier (paramètres admin, stratégie IA, seuils
 * d'alertes, posts en validation) dans la base, protégée par RLS :
 * chaque utilisateur ne lit et n'écrit que ses propres réglages.
 *
 * La table `app_reglages` n'est pas encore présente dans les types générés
 * (régénération en attente côté backend) : on passe donc par un client
 * non typé, sans jamais contourner l'authentification ni la RLS.
 */
type ClientMinimal = {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (
        col: string,
        v: string,
      ) => {
        eq: (
          col: string,
          v: string,
        ) => {
          maybeSingle: () => Promise<{
            data: { valeur: unknown } | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
    upsert: (
      valeurs: Record<string, unknown>,
      options: { onConflict: string },
    ) => Promise<{ error: { message: string } | null }>;
  };
};

const schemaCle = z.object({ cle: z.string().min(3).max(80) });
const schemaEcriture = schemaCle.extend({ valeur: z.unknown() });

export const lireReglage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schemaCle.parse(input))
  .handler(async ({ data, context }) => {
    const client = context.supabase as unknown as ClientMinimal;
    const { data: ligne, error } = await client
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
    const client = context.supabase as unknown as ClientMinimal;
    const { error } = await client
      .from("app_reglages")
      .upsert(
        { user_id: context.userId, cle: data.cle, valeur: data.valeur ?? null },
        { onConflict: "user_id,cle" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
