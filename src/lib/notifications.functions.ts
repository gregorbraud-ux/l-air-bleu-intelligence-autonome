import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { alerteEnvoiSchema, abonnementSchema } from "@/lib/notifications.schema";

export const clePubliquePush = createServerFn({ method: "GET" }).handler(async () => {
  return { cle: process.env["VAPID_PUBLIC_KEY"] ?? null };
});

export const enregistrerAbonnementPush = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => abonnementSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("push_subscriptions").upsert(
      {
        user_id: context.userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        libelle: data.libelle ?? null,
      },
      { onConflict: "endpoint" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const supprimerAbonnementPush = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ endpoint: z.string().min(10).max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", data.endpoint);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const envoyerAlertes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        alertes: z.array(alerteEnvoiSchema).min(1).max(20),
        email: z.boolean(),
        push: z.boolean(),
        destinataire: z.string().email().max(255).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { envoyerEmailAlertes, envoyerPushAlertes } = await import("@/lib/notifications.server");
    const resultats = [];
    if (data.email && data.destinataire) {
      resultats.push(await envoyerEmailAlertes(context.userId, data.destinataire, data.alertes));
    }
    if (data.push) {
      resultats.push(await envoyerPushAlertes(context.userId, data.alertes));
    }
    return { resultats };
  });

export const historiqueEnvois = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("alertes_envois")
      .select("id, alerte_id, canal, destinataire, statut, erreur, created_at")
      .order("created_at", { ascending: false })
      .limit(12);
    if (error) throw new Error(error.message);
    return { envois: data ?? [] };
  });