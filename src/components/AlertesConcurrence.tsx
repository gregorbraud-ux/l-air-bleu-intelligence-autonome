import { BellRing, Check, Settings2, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { alertesConcurrence, reglesAlertesDefaut, type RegleAlerte } from "@/lib/data";

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
  const [regles, setRegles] = useState<RegleAlerte[]>(reglesAlertesDefaut);
  const [lues, setLues] = useState<string[]>(alertesConcurrence.filter((a) => a.lue).map((a) => a.id));
  const [canalEmail, setCanalEmail] = useState(true);
  const [canalPush, setCanalPush] = useState(false);
  const [reglagesOuverts, setReglagesOuverts] = useState(false);

  const typesActifs = useMemo(() => regles.filter((r) => r.active).map((r) => r.id), [regles]);

  const alertesVisibles = useMemo(
    () =>
      alertesConcurrence.filter((a) => {
        const regle = regles.find((r) => r.id === a.type);
        if (!regle?.active) return false;
        if (regle.id === "nouveaute") return true;
        return Math.abs(a.variation) >= regle.seuil;
      }),
    [regles],
  );

  const nonLues = alertesVisibles.filter((a) => !lues.includes(a.id)).length;

  function majRegle(id: RegleAlerte["id"], patch: Partial<RegleAlerte>) {
    setRegles((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <section className="surface-card mt-6 p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <BellRing className="h-4 w-4 text-accent" /> Alertes de veille
            {nonLues > 0 && <Badge variant="destructive">{nonLues} nouvelle{nonLues > 1 ? "s" : ""}</Badge>}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Surveillance quotidienne des {typesActifs.length} signaux activés sur 5 établissements comparables.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setReglagesOuverts((v) => !v)}>
          <Settings2 className="mr-2 h-4 w-4" /> Seuils
        </Button>
      </div>

      {reglagesOuverts && (
        <div className="mt-5 space-y-5 rounded-2xl border border-border/70 bg-secondary/30 p-4">
          {regles.map((r) => (
            <div key={r.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.description}
                    {r.unite && ` ${r.seuil} ${r.unite}`}
                  </p>
                </div>
                <Switch
                  checked={r.active}
                  onCheckedChange={(v) => majRegle(r.id, { active: v })}
                  aria-label={`Activer l'alerte ${r.label}`}
                />
              </div>
              {r.active && r.unite && (
                <Slider
                  value={[r.seuil]}
                  min={r.min}
                  max={r.max}
                  step={r.pas}
                  onValueChange={([v]) => majRegle(r.id, { seuil: v })}
                  aria-label={`Seuil ${r.label}`}
                />
              )}
            </div>
          ))}

          <div className="grid gap-3 border-t border-border/70 pt-4 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="canal-email" className="text-sm">
                Notification e-mail quotidienne
              </Label>
              <Switch id="canal-email" checked={canalEmail} onCheckedChange={setCanalEmail} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="canal-push" className="text-sm">
                Notification push (PWA)
              </Label>
              <Switch id="canal-push" checked={canalPush} onCheckedChange={setCanalPush} />
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => {
              setReglagesOuverts(false);
              toast.success("Règles d'alerte enregistrées", {
                description: `${typesActifs.length} signaux surveillés · ${
                  [canalEmail && "e-mail", canalPush && "push"].filter(Boolean).join(" + ") || "aucun canal"
                }`,
              });
            }}
          >
            Enregistrer les règles
          </Button>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {alertesVisibles.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Aucune alerte ne correspond à vos seuils actuels.
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