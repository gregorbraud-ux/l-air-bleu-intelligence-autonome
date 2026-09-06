import { supabase } from "@/integrations/supabase/client";

/**
 * Connexion Google.
 *
 * Production (domaine propre / hébergement autonome) : Supabase Auth natif,
 * aucune dépendance externe.
 *
 * Aperçu dans l'éditeur (iframe) : le flux natif est bloqué par l'iframe, on
 * charge alors dynamiquement le connecteur d'aperçu. Cet import n'est jamais
 * évalué en production.
 */
export function estApercuEditeur(): boolean {
  if (typeof window === "undefined") return false;
  const hote = window.location.hostname;
  const dansIframe = window.self !== window.top;
  return dansIframe && (hote.endsWith(".lovable.app") || hote.endsWith(".lovableproject.com"));
}

export async function connexionGoogle(): Promise<{
  error?: Error | null;
  redirected?: boolean;
}> {
  const redirect_uri = `${window.location.origin}/auth`;

  if (estApercuEditeur()) {
    const { lovable } = await import("@/integrations/lovable/index");
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri });
    return { error: res.error ?? null, redirected: res.redirected };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirect_uri },
  });
  return { error: error ?? null, redirected: !error };
}
