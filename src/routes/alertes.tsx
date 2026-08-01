import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, RotateCcw, Save, Swords } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  categoriesAlerte,
  metaCategorie,
  useAlertesConfig,
  type CategorieAlerte,
} from "@/lib/alertes-config";

export const Route = createFileRoute("/alertes")({
  head: () => ({
    meta: [
      { title: "Configuration des alertes — AirBleu AI" },
      {
        name: "description",
        content:
          "Réglez les seuils de veille, les catégories (note, prix, visibilité, nouveautés) et les canaux de notification pour chaque restaurant surveillé autour de L'Air Bleu.",
      },
      { property: "og:title", content: "Configuration des alertes — AirBleu AI" },
      {
        property: "og:description",
        content: "Seuils, catégories et canaux de notification par établissement surveillé.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PageAlertes,
});

const libelleCategorie: Record<CategorieAlerte, string> = {
  note: "Note",
  prix: "Prix",
  visibilite: "Visibilité",
  nouveaute: "Nouveautés",
};

function PageAlertes() {
  const { config, pret, enregistrer, majEtablissement, majCategorie, reinitialiser } = useAlertesConfig();
  const etablissements = Object.values(config);
  const surveilles = etablissements.filter((e) => e.surveille);

  return (
    <div>
      <PageHeader
        titre="Configuration des alertes"
        sousTitre="Seuils, catégories et canaux de notification, établissement par établissement"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { reinitialiser(); toast.success("Réglages réinitialisés."); }}>
              <RotateCcw className="mr-2 h-4 w-4" /> Réinitialiser
            </Button>
            <Button
              onClick={() => {
                enregistrer(config);
                toast.success("Configuration enregistrée", {
                  description: `${surveilles.length} établissement${surveilles.length > 1 ? "s" : ""} surveillé${surveilles.length > 1 ? "s" : ""}.`,
                });
              }}
            >
              <Save className="mr-2 h-4 w-4" /> Enregistrer
            </Button>
          </div>
        }
      />

      <Card className="surface-card mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-accent" /> Veille concurrentielle locale
          </CardTitle>
          <CardDescription>
            Les réglages ci-dessous pilotent le flux d'alertes affiché dans le module Concurrence.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="secondary">{surveilles.length} / {etablissements.length} surveillés</Badge>
          <Button asChild variant="outline" size="sm">
            <Link to="/concurrence">
              <Swords className="mr-2 h-4 w-4" /> Voir le flux d'alertes
            </Link>
          </Button>
        </CardContent>
      </Card>

      {!pret ? null : (
        <div className="space-y-6">
          {etablissements.map((etab) => (
            <Card key={etab.nom} className="surface-card">
              <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{etab.nom}</CardTitle>
                  <CardDescription>
                    {etab.surveille
                      ? `Analyse ${etab.frequence} des signaux activés`
                      : "Surveillance désactivée"}
                  </CardDescription>
                </div>
                <Switch
                  checked={etab.surveille}
                  onCheckedChange={(v) => majEtablissement(etab.nom, { surveille: v })}
                  aria-label={`Surveiller ${etab.nom}`}
                />
              </CardHeader>

              {etab.surveille && (
                <CardContent className="space-y-6">
                  <div className="space-y-5">
                    {categoriesAlerte.map((id) => {
                      const meta = metaCategorie(id);
                      const cat = etab.categories[id];
                      return (
                        <div key={id} className="space-y-3 rounded-2xl border border-border/70 bg-secondary/25 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium">
                                {libelleCategorie[id]} · {meta.label}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {meta.description}
                                {meta.unite && ` ${cat.seuil} ${meta.unite}`}
                              </p>
                            </div>
                            <Switch
                              checked={cat.active}
                              onCheckedChange={(v) => majCategorie(etab.nom, id, { active: v })}
                              aria-label={`Activer ${meta.label} pour ${etab.nom}`}
                            />
                          </div>
                          {cat.active && meta.unite && (
                            <Slider
                              value={[cat.seuil]}
                              min={meta.min}
                              max={meta.max}
                              step={meta.pas}
                              onValueChange={([v]) => majCategorie(etab.nom, id, { seuil: v })}
                              aria-label={`Seuil ${meta.label} pour ${etab.nom}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor={`email-${etab.nom}`} className="text-sm">
                        Notification e-mail
                      </Label>
                      <Switch
                        id={`email-${etab.nom}`}
                        checked={etab.canaux.email}
                        onCheckedChange={(v) =>
                          majEtablissement(etab.nom, { canaux: { ...etab.canaux, email: v } })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor={`push-${etab.nom}`} className="text-sm">
                        Notification push (PWA)
                      </Label>
                      <Switch
                        id={`push-${etab.nom}`}
                        checked={etab.canaux.push}
                        onCheckedChange={(v) =>
                          majEtablissement(etab.nom, { canaux: { ...etab.canaux, push: v } })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`dest-${etab.nom}`} className="text-sm">
                        Destinataire des alertes
                      </Label>
                      <Input
                        id={`dest-${etab.nom}`}
                        type="email"
                        maxLength={255}
                        value={etab.canaux.destinataire}
                        onChange={(e) =>
                          majEtablissement(etab.nom, {
                            canaux: { ...etab.canaux, destinataire: e.target.value.slice(0, 255) },
                          })
                        }
                        placeholder="contact@lairbleu.fr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Fréquence d'analyse</Label>
                      <div className="flex gap-2">
                        {(["quotidienne", "hebdomadaire"] as const).map((f) => (
                          <Button
                            key={f}
                            size="sm"
                            variant={etab.frequence === f ? "default" : "outline"}
                            onClick={() => majEtablissement(etab.nom, { frequence: f })}
                          >
                            {f}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
