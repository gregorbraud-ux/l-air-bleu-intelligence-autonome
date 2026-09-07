import { supabase } from "@/integrations/supabase/client";

/**
 * Connexion Google — Supabase Auth natif uniquement.
 *
 * Aucun connecteur propriétaire n'est importé : le build est totalement
 * autonome. Dans un aperçu en iframe, le flux de redirection peut être bloqué
 * par le navigateur ; on ouvre alors la page d'autorisation dans un onglet.
 */
export function estApercuIframe(): boolean {
  if (typeof window === "undefined") return false;
  return window.self !== window.top;
}

export async function connexionGoogle(): Promise<{
  error?: Error | null;
  redirected?: boolean;
}> {
  const redirect_uri = `${window.location.origin}/auth`;

  if (estApercuIframe()) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirect_uri, skipBrowserRedirect: true },
    });
    if (error) return { error, redirected: false };
    if (data?.url) window.open(data.url, "_blank", "noopener,noreferrer");
    return { error: null, redirected: Boolean(data?.url) };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirect_uri },
  });
  return { error: error ?? null, redirected: !error };
}
