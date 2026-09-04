import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getMonEspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [{ data: profil }, { data: roles }, { data: estAdmin }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("id", userId)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    ]);

    return {
      userId,
      email: (context.claims.email as string | undefined) ?? null,
      profil: profil ?? null,
      roles: (roles ?? []).map((r) => r.role),
      estAdmin: estAdmin === true,
    };
  });

export const listerMembres = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: estAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (estAdmin !== true) throw new Error("Accès refusé : rôle administrateur requis.");

    const { data: profils, error } = await context.supabase
      .from("profiles")
      .select("id, display_name, created_at")
      .order("created_at", { ascending: true });
    if (error) throw error;

    const { data: roles, error: erreurRoles } = await context.supabase
      .from("user_roles")
      .select("user_id, role");
    if (erreurRoles) throw erreurRoles;

    return (profils ?? []).map((p) => ({
      ...p,
      roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
    }));
  });

const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "manager", "viewer"]),
  action: z.enum(["ajouter", "retirer"]),
});

export const modifierRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => roleSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: estAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (estAdmin !== true) throw new Error("Accès refusé : rôle administrateur requis.");

    if (data.userId === context.userId && data.role === "admin" && data.action === "retirer") {
      throw new Error("Vous ne pouvez pas retirer votre propre rôle administrateur.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.action === "ajouter") {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw error;
    }

    return { ok: true };
  });
