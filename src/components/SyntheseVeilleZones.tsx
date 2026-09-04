import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
  UtensilsCrossed,
  Megaphone,
  CalendarClock,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { zonesVeille } from "@/lib/data";
import { genererRapportVeille } from "@/lib/veille.functions";
import type { RapportVeille } from "@/lib/veille.schema";

const CLE_STOCKAGE = "airbleu.veille.rapport.v1";
const FRAICHEUR_MS = 12 * 60 * 60 * 1000;

const graviteStyle: Record<string, string> = {
  critique: "bg-destructive/10 text-destructive",
  importante: "bg-warning/15 text-accent-foreground",
  info: "bg-secondary text-secondary-foreground",
};

function lireCache(): RapportVeille | null {
  if (typeof window === "undefined") return null;
  try {
    const brut = window.localStorage.getItem(CLE_STOCKAGE);
    return brut ? (JSON.parse(brut) as RapportVeille) : null;
  } catch {
    return null;
  }
}

export function SyntheseVeilleZones() {
  const analyser = useServerFn(genererRapportVeille);
  const [rapport, setRapport] = useState<RapportVeille | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const auto = useRef(false);

  const lancer = useCallback(
    async (silencieux = false) => {
      setChargement(true);
      setErreur(null);
      try {
        const resultat = await analyser({
          data: {
            zones: zonesVeille.map((z) => ({
              zone: z.zone,
              etablissements: z.etablissements,
              signaux: z.signaux,
            })),
          },
        });
        setRapport(resultat);
        try {
          window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(resultat));
        } catch {
          /* quota indisponible */
        }
        if (!silencieux) toast.success("Rapport de veille mis à jour");
      } catch (e) {
        const message = e instanceof Error ? e.message : "Analyse impossible";
        setErreur(message);
        if (!silencieux) toast.error(message);
      } finally {
        setChargement(false);
      }
    },
    [analyser],
  );

  useEffect(() => {
    if (auto.current) return;
    auto.current = true;
    const cache = lireCache();
    if (cache) setRapport(cache);
    const perime = !cache || Date.now() - new Date(cache.genereLe).getTime() > FRAICHEUR_MS;
    if (perime) void lancer(true);
  }, [lancer]);

  const sources = zonesVeille.flatMap((z) => z.signaux.map((s) => ({ zone: z.zone, ...s })));

  return (
    <section className="surface-card mt-6 p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-4 w-4 text-accent" /> Alertes automatiques par zone
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Synthèse IA des changements de menus, promotions et rythme de publication à Trignac,
            Donges et Saint-Nazaire
            {rapport
              ? ` · actualisée le ${new Date(rapport.genereLe).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}`
              : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void lancer()} disabled={chargement}>
          {chargement ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Actualiser
        </Button>
      </div>

      {chargement && !rapport && (
        <p className="mt-5 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Analyse des signaux du secteur en cours…
        </p>
      )}

      {erreur && !rapport && (
        <p className="mt-5 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {erreur}
        </p>
      )}

      {rapport && (
        <>
          <p className="mt-4 rounded-2xl bg-secondary/40 p-4 text-sm">{rapport.synthese}</p>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {rapport.zones.map((z) => (
              <article key={z.zone} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{z.zone}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${graviteStyle[z.gravite]}`}
                  >
                    {z.gravite}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{z.resume}</p>

                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <UtensilsCrossed className="h-3.5 w-3.5" /> Menus
                    </dt>
                    <dd className="mt-0.5">{z.menus}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <Megaphone className="h-3.5 w-3.5" /> Promotions
                    </dt>
                    <dd className="mt-0.5">{z.promotions}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5" /> Rythme de publication
                    </dt>
                    <dd className="mt-0.5">{z.rythmePublication}</dd>
                  </div>
                </dl>

                {z.menaces.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {z.menaces.map((m) => (
                      <li key={m} className="flex gap-1.5">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {z.actions.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Actions recommandées
                    </p>
                    {z.actions.map((a) => (
                      <p key={a} className="rounded-xl bg-secondary/40 px-3 py-2 text-xs">
                        {a}
                      </p>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {sources
                    .filter((s) => s.zone === z.zone)
                    .map((s) => (
                      <a
                        key={`${s.etablissement}-${s.constat}`}
                        href={s.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-accent underline"
                      >
                        <ExternalLink className="h-3 w-3" /> {s.etablissement} — {s.sourceLabel}
                      </a>
                    ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">{sources.length} signaux analysés</Badge>
            <Badge variant="secondary">Actualisation automatique toutes les 12 h</Badge>
          </div>
        </>
      )}
    </section>
  );
}
