import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RapportConformite as Rapport } from "@/lib/conformite-posts";

export function RapportConformite({ rapport }: { rapport: Rapport }) {
  const total = rapport.parPost.length;
  if (!total) return null;
  const problemes = rapport.parPost.filter((p) => p.anomalies.length > 0);
  const toutConforme = problemes.length === 0 && rapport.globales.length === 0;

  return (
    <div className="mt-5 rounded-xl border border-border/70 bg-secondary/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          {toutConforme ? (
            <ShieldCheck className="h-4 w-4 text-chart-2" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-chart-4" />
          )}
          Contrôle automatique des contraintes
        </h3>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <Badge variant="secondary">{rapport.conformes}/{total} conformes</Badge>
          {rapport.bloquants > 0 && (
            <Badge className="border-0 bg-destructive/15 text-destructive">
              {rapport.bloquants} à corriger
            </Badge>
          )}
          {rapport.avertissements > 0 && (
            <Badge className="border-0 bg-chart-4/15 text-chart-4">
              {rapport.avertissements} avertissement(s)
            </Badge>
          )}
        </div>
      </div>

      {toutConforme ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-chart-2" />
          Mots interdits, longueurs, thèmes, plateformes et période : tout est respecté.
        </p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {rapport.globales.map((a) => (
            <li key={`g-${a.champ}-${a.message}`} className="flex gap-2 text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-chart-4" />
              <span>
                <span className="font-medium text-foreground">Plan global</span> · {a.message}
              </span>
            </li>
          ))}
          {problemes.map(({ post, anomalies }) => (
            <li key={`${post.jour}-${post.titre}`} className="flex gap-2 text-muted-foreground">
              <AlertTriangle
                className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                  anomalies.some((a) => a.gravite === "bloquant") ? "text-destructive" : "text-chart-4"
                }`}
              />
              <span>
                <span className="font-medium text-foreground">
                  Jour {post.jour} · {post.titre}
                </span>{" "}
                · {anomalies.map((a) => a.message).join(" ")}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        Les posts signalés restent en file de validation : corrigez-les dans l'éditeur avant de les
        approuver.
      </p>
    </div>
  );
}
