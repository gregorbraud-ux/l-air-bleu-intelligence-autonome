import { createFileRoute } from "@tanstack/react-router";
import { Database, Gauge, RotateCcw, Save, Star, Swords, ToggleLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { modulesApp, useParametresAdmin } from "@/lib/parametres-config";

export const Route = createFileRoute("/_authenticated/parametres")({
  head: () => ({
    meta: [
      { title: "Paramètres admin — AirBleu AI" },
      {
        name: "description",
        content:
          "Configurez les sources de données (Google Places, veille concurrentielle, KPI), les seuils cibles et activez ou désactivez chaque module d'AirBleu AI.",
      },
      { property: "og:title", content: "Paramètres admin — AirBleu AI" },
      {
        property: "og:description",
        content: "Sources de données, seuils cibles et activation des modules du restaurant L'Air Bleu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PageParametres,
});

function PageParametres() {
  const { parametres, pret, enregistrer, majModule, majSection, reinitialiser } = useParametresAdmin();
  const actifs = modulesApp.filter((m) => parametres.modules[m.cle]).length;

  return (
    <div>
      <PageHeader
        titre="Paramètres admin"
        sousTitre="Sources de données, seuils cibles et activation des modules"
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                reinitialiser();
                toast.success("Paramètres réinitialisés.");
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Réinitialiser
            </Button>
            <Button
              onClick={() => {
                enregistrer(parametres);
                toast.success("Paramètres enregistrés.");
              }}
            >
              <Save className="mr-2 h-4 w-4" /> Enregistrer
            </Button>
          </div>
        }
      />

      {!pret ? (
        <p className="text-sm text-muted-foreground">Chargement des paramètres…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="surface-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ToggleLeft className="h-4 w-4 text-primary" /> Modules de l'application
              </CardTitle>
              <CardDescription>
                {actifs} module{actifs > 1 ? "s" : ""} actif{actifs > 1 ? "s" : ""} sur {modulesApp.length} — les
                modules désactivés disparaissent de la navigation.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {modulesApp.map((m) => (
                <div
                  key={m.cle}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 p-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{m.label}</p>
                      <Badge variant={parametres.modules[m.cle] ? "default" : "secondary"}>
                        {parametres.modules[m.cle] ? "Actif" : "Masqué"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{m.description}</p>
                  </div>
                  <Switch
                    checked={parametres.modules[m.cle]}
                    onCheckedChange={(v) => majModule(m.cle, v)}
                    aria-label={`Activer ${m.label}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" /> Source Google Places (avis)
              </CardTitle>
              <CardDescription>Récupération automatique des avis de la fiche établissement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="gp-active">Source activée</Label>
                <Switch
                  id="gp-active"
                  checked={parametres.googlePlaces.active}
                  onCheckedChange={(v) => majSection("googlePlaces", { active: v })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gp-fiche">Fiche surveillée</Label>
                <Input
                  id="gp-fiche"
                  value={parametres.googlePlaces.nomFiche}
                  onChange={(e) => majSection("googlePlaces", { nomFiche: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gp-place">Place ID (optionnel)</Label>
                <Input
                  id="gp-place"
                  placeholder="ChIJ…"
                  value={parametres.googlePlaces.placeId}
                  onChange={(e) => majSection("googlePlaces", { placeId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fréquence de synchronisation : {parametres.googlePlaces.frequenceHeures} h</Label>
                <Slider
                  min={6}
                  max={72}
                  step={6}
                  value={[parametres.googlePlaces.frequenceHeures]}
                  onValueChange={([v]) => majSection("googlePlaces", { frequenceHeures: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Avis récupérés par synchronisation : {parametres.googlePlaces.nbAvis}</Label>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[parametres.googlePlaces.nbAvis]}
                  onValueChange={([v]) => majSection("googlePlaces", { nbAvis: v })}
                />
                <p className="text-xs text-muted-foreground">
                  L'API Google Places expose au maximum 5 avis par fiche.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-4 w-4 text-primary" /> Source veille concurrentielle
              </CardTitle>
              <CardDescription>Périmètre et canaux surveillés autour de Montoir-de-Bretagne.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="cc-active">Source activée</Label>
                <Switch
                  id="cc-active"
                  checked={parametres.concurrence.active}
                  onCheckedChange={(v) => majSection("concurrence", { active: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Rayon de veille : {parametres.concurrence.rayonKm} km</Label>
                <Slider
                  min={5}
                  max={40}
                  step={5}
                  value={[parametres.concurrence.rayonKm]}
                  onValueChange={([v]) => majSection("concurrence", { rayonKm: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fréquence d'analyse : {parametres.concurrence.frequenceHeures} h</Label>
                <Slider
                  min={6}
                  max={72}
                  step={6}
                  value={[parametres.concurrence.frequenceHeures]}
                  onValueChange={([v]) => majSection("concurrence", { frequenceHeures: v })}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="cc-reseaux">Facebook &amp; Instagram des concurrents</Label>
                <Switch
                  id="cc-reseaux"
                  checked={parametres.concurrence.reseauxSociaux}
                  onCheckedChange={(v) => majSection("concurrence", { reseauxSociaux: v })}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="cc-sites">Sites web &amp; cartes en ligne</Label>
                <Switch
                  id="cc-sites"
                  checked={parametres.concurrence.sitesWeb}
                  onCheckedChange={(v) => majSection("concurrence", { sitesWeb: v })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" /> Source KPI &amp; finances
              </CardTitle>
              <CardDescription>Données de référence utilisées par le tableau de bord et la valorisation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="kpi-active">Source activée</Label>
                <Switch
                  id="kpi-active"
                  checked={parametres.kpi.active}
                  onCheckedChange={(v) => majSection("kpi", { active: v })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kpi-exercice">Exercice de référence</Label>
                <Input
                  id="kpi-exercice"
                  value={parametres.kpi.exercice}
                  onChange={(e) => majSection("kpi", { exercice: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="kpi-ca">Chiffre d'affaires (€)</Label>
                  <Input
                    id="kpi-ca"
                    type="number"
                    step="0.01"
                    value={parametres.kpi.chiffreAffaires}
                    onChange={(e) => majSection("kpi", { chiffreAffaires: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kpi-rn">Résultat net (€)</Label>
                  <Input
                    id="kpi-rn"
                    type="number"
                    step="0.01"
                    value={parametres.kpi.resultatNet}
                    onChange={(e) => majSection("kpi", { resultatNet: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kpi-ticket">Ticket moyen midi (€)</Label>
                  <Input
                    id="kpi-ticket"
                    type="number"
                    step="0.1"
                    value={parametres.kpi.ticketMoyen}
                    onChange={(e) => majSection("kpi", { ticketMoyen: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kpi-couverts">Couverts / service midi</Label>
                  <Input
                    id="kpi-couverts"
                    type="number"
                    value={parametres.kpi.couvertsMidi}
                    onChange={(e) => majSection("kpi", { couvertsMidi: Number(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" /> Seuils cibles
              </CardTitle>
              <CardDescription>
                Objectifs de pilotage. Les seuils de veille par établissement restent réglables dans « Alertes
                &amp; seuils ».
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Note Google minimale : {parametres.seuils.noteMini.toFixed(1)} / 5</Label>
                <Slider
                  min={3}
                  max={5}
                  step={0.1}
                  value={[parametres.seuils.noteMini]}
                  onValueChange={([v]) => majSection("seuils", { noteMini: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ticket moyen cible : {parametres.seuils.ticketCible.toFixed(1)} €</Label>
                <Slider
                  min={15}
                  max={30}
                  step={0.5}
                  value={[parametres.seuils.ticketCible]}
                  onValueChange={([v]) => majSection("seuils", { ticketCible: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Couverts cible / service midi : {parametres.seuils.couvertsCible}</Label>
                <Slider
                  min={40}
                  max={120}
                  step={5}
                  value={[parametres.seuils.couvertsCible]}
                  onValueChange={([v]) => majSection("seuils", { couvertsCible: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Score de visibilité locale cible : {parametres.seuils.visibiliteCible}</Label>
                <Slider
                  min={40}
                  max={100}
                  step={1}
                  value={[parametres.seuils.visibiliteCible]}
                  onValueChange={([v]) => majSection("seuils", { visibiliteCible: v })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}