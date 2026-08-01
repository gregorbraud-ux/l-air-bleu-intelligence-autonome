import { Link } from "@tanstack/react-router";
import { BellRing, Check, Settings2, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { alertesConcurrence, type RegleAlerte } from "@/lib/data";
import { useAlertesConfig } from "@/lib/alertes-config";

const graviteStyle: Record<string, string> = {
  critique: "bg-destructive/10 text-destructive",
  importante: "bg-warning/15 text-accent-foreground",
  info: "bg-secondary text-secondary-foreground",
};

const typeLabel: Record<RegleAlerte["id"], string> = {
  note: "Note",
  prix: "Prix",
  visibilite: "Visibilité",
  nouveaute: "Nouveauté",
};

export function AlertesConcurrence() {
  const { config, pret } = useAlertesConfig();
  const [lues, setLues] = useState<string[]>(alertesConcurrence.filter((a) => a.lue).map((a) => a.id));

  const etablissementsSurveilles = useMemo(
    () => Object.values(config).filter((e) => e.surveille),
    [config],
  );

  const canaux = useMemo(() => {
    const email = etablissementsSurveilles.some((e) => e.canaux.email);
    const push = etablissementsSurveilles.some((e) => e.canaux.push);
    return [email && "e-mail", push && "push"].filter(Boolean).join(" + ") || "aucun canal";
  }, [etablissementsSurveilles]);

  const alertesVisibles = useMemo(
    () =>
      alertesConcurrence.filter((a) => {
        const etab = config[a.concurrent];
        if (!etab?.surveille) return false;
        const cat = etab.categories[a.type];
        if (!cat?.active) return false;
        if (a.type === "nouveaute") return true;
        return Math.abs(a.variation) >= cat.seuil;
      }),
    [config],
  );

  const nonLues = alertesVisibles.filter((a) => !lues.includes(a.id)).length;

  return (
    <section className="surface-card mt-6 p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <BellRing className="h-4 w-4 text-accent" /> Alertes de veille
            {nonLues > 0 && <Badge variant="destructive">{nonLues} nouvelle{nonLues > 1 ? "s" : ""}</Badge>}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {pret
              ? `${etablissementsSurveilles.length} établissement${etablissementsSurveilles.length > 1 ? "s" : ""} surveillé${etablissementsSurveilles.length > 1 ? "s" : ""} · notifications : ${canaux}`
              : "Chargement de vos réglages de veille…"}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/alertes">
            <Settings2 className="mr-2 h-4 w-4" /> Configurer
          </Link>
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        {alertesVisibles.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Aucune alerte ne correspond à vos seuils actuels.{" "}
            <Link to="/alertes" className="underline">
              Ajuster la configuration
            </Link>
          </p>
        )}
        {alertesVisibles.map((a) => {
          const lue = lues.includes(a.id);
          return (
            <article
              key={a.id}
              className={`rounded-2xl border border-border/70 p-4 transition-colors ${lue ? "opacity-70" : "bg-secondary/25"}`}
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{a.titre}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.concurrent} · {a.date} · {typeLabel[a.type]}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${graviteStyle[a.gravite]}`}>
                  {a.gravite}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{a.detail}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {a.variation !== 0 && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      a.variation >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {a.variation >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {Math.abs(a.variation)} %
                  </span>
                )}
                {lue ? (
                  <Badge variant="secondary">Traitée</Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setLues((prev) => [...prev, a.id])}>
                    <Check className="mr-2 h-4 w-4" /> Marquer comme traitée
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}