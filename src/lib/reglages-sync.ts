import { supabase } from "@/integrations/supabase/client";
import { ecrireReglage, lireReglage } from "@/lib/reglages.functions";

/**
 * Synchronisation des réglages métier avec la base.
 * - Hors session : on reste sur le stockage local du navigateur (aucun secret,
 *   aucune écriture serveur).
 * - En session : la base fait référence, le stockage local sert de cache
 *   hors-ligne pour la PWA.
 */

async function connecte(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}

export async function chargerReglageCloud<T>(cle: string): Promise<T | null> {
  try {
    if (!(await connecte())) return null;
    const res = await lireReglage({ data: { cle } });
    return (res.valeur as T | null) ?? null;
  } catch {
    return null;
  }
}

const minuteurs = new Map<string, ReturnType<typeof setTimeout>>();

/** Écriture différée (600 ms) pour éviter une requête par frappe. */
export function enregistrerReglageCloud(cle: string, valeur: unknown): void {
  if (typeof window === "undefined") return;
  const precedent = minuteurs.get(cle);
  if (precedent) clearTimeout(precedent);
  minuteurs.set(
    cle,
    setTimeout(() => {
      minuteurs.delete(cle);
      void (async () => {
        try {
          if (!(await connecte())) return;
          await ecrireReglage({ data: { cle, valeur } });
        } catch {
          /* la valeur reste disponible dans le cache local */
        }
      })();
    }, 600),
  );
}
